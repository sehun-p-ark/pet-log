package dev.dhkim.petlog.controllers.myPage;

import dev.dhkim.petlog.dto.user.*;
import dev.dhkim.petlog.entities.shop.PointEntity;
import dev.dhkim.petlog.entities.user.*;
import dev.dhkim.petlog.mappers.myPage.MyPageMapper;
import dev.dhkim.petlog.mappers.shop.CouponMapper;
import dev.dhkim.petlog.mappers.shop.HeartMapper;
import dev.dhkim.petlog.mappers.shop.ReviewMapper;
import dev.dhkim.petlog.results.MyPageResult;
import dev.dhkim.petlog.services.myPage.MyPageService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.ibatis.annotations.Param;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.web.bind.annotation.RequestMethod.*;

@Controller
@RequiredArgsConstructor
@RequestMapping(value = "/my")
public class        MyPageController {
    private final MyPageService myPageService;
    private final ReviewMapper reviewMapper;
    private final CouponMapper couponMapper;
    private final HeartMapper heartMapper;

    @RequestMapping(value = "", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getMyPage(ModelAndView modelAndView,
                                  @RequestParam(defaultValue = "1month") String period,
                                  @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        if (sessionUser == null) {
            modelAndView.setViewName("/user/login");
            return modelAndView;
        }
        modelAndView.setViewName("myPage/my");
        Pair<MyPageResult, UserEntity> user = this.myPageService.getUser(sessionUser.getUserId());
        Pair<MyPageResult, PersonalUserEntity> personalUser = this.myPageService.getPersonalUser(sessionUser.getUserId());
        Pair<MyPageResult, BusinessUserEntity> businessUser = this.myPageService.getBusinessUser(sessionUser.getUserId());

        Pair<MyPageResult, PetEntity> primaryPet = this.myPageService.getPrimaryPet(sessionUser.getUserId());
        Pair<MyPageResult, List<PetEntity>> pets = this.myPageService.getPets(sessionUser.getUserId());
        Pair<MyPageResult, List<StoreEntity>> stores = this.myPageService.getStores(sessionUser.getUserId());
        Pair<MyPageResult, List<MyPageReservationDto>> reservations = this.myPageService.getReservation(sessionUser.getUserId());
        System.out.println(reservations);


        List<PetEntity> readPets = pets.getRight();
        if (readPets == null) {
            readPets = new ArrayList<>();
        }
        if (sessionUser.getUserType().equals("PERSONAL")) {
            Pair<MyPageResult, List<AddressEntity>> personalAddresses = this.myPageService.getPersonalAddress(sessionUser.getUserId());
            Pair<MyPageResult, AddressEntity> defaultAddress = this.myPageService.getDefaultAddress(sessionUser.getUserId());
            Pair<MyPageResult, List<DeliveryAddressEntity>> deliveryAddresses = this.myPageService.getAllDeliveryAddress(sessionUser.getUserId());
            Pair<MyPageResult, DeliveryAddressEntity> deliveryAddress = this.myPageService.getDeliveryAddress(sessionUser.getUserId());
            Pair<MyPageResult, List<PointEntity>> allPointEarn = this.myPageService.getAllPointEarn(sessionUser.getUserId());
            Pair<MyPageResult, List<PointEntity>> allPointUse = this.myPageService.getAllPointUse(sessionUser.getUserId());
            List<Map<String, Object>> availableCoupons = couponMapper.getAvailableCoupons(sessionUser.getUserId());
            List<Map<String, Object>> usedCoupons = couponMapper.getUsedOrExpiredCoupons(sessionUser.getUserId());

            System.out.println(availableCoupons);  // 키 이름 확인
            System.out.println(usedCoupons);

            modelAndView.addObject("personalAddresses", personalAddresses.getRight());
            modelAndView.addObject("defaultAddress", defaultAddress.getRight());
            modelAndView.addObject("deliveryAddresses", deliveryAddresses.getRight());
            modelAndView.addObject("deliveryPrimaryAddress", deliveryAddress.getRight());
            modelAndView.addObject("reservations", reservations.getRight());
            modelAndView.addObject("allPointEarn", allPointEarn.getRight());
            modelAndView.addObject("allPointUse", allPointUse.getRight());
            modelAndView.addObject("availableCoupons", availableCoupons);
            modelAndView.addObject("usedCoupons", usedCoupons);

            List<Map<String, Object>> orderItems = myPageService.getOrderItems(sessionUser.getUserId(), period);
            orderItems.forEach(item -> {
                Object orderItemIdObj = item.get("orderItemId");
                if (orderItemIdObj == null) {
                    item.put("canWriteReview", false);
                    return;
                }
                boolean canWrite = reviewMapper.checkCanWriteReview(
                        sessionUser.getUserId(),
                        ((Number) item.get("productId")).intValue(),
                        ((Number) orderItemIdObj).intValue()
                );
                item.put("canWriteReview", canWrite);
            });

            Map<LocalDate, Map<Long, List<Map<String, Object>>>> groupedOrders = orderItems.stream()
                    .collect(Collectors.groupingBy(
                            item -> {
                                Object date = item.get("orderDate");
                                LocalDateTime dt = (date instanceof java.sql.Timestamp)
                                        ? ((java.sql.Timestamp) date).toLocalDateTime()
                                        : (LocalDateTime) date;
                                return dt.toLocalDate();
                            },
                            LinkedHashMap::new,
                            Collectors.groupingBy(
                                    item -> ((Number) item.get("orderId")).longValue(),
                                    LinkedHashMap::new,
                                    Collectors.toList()
                            )
                    ));
            modelAndView.addObject("orderItems", orderItems);
            modelAndView.addObject("groupedOrders", groupedOrders);
            modelAndView.addObject("currentPeriod", period);
        } else {
            Pair<MyPageResult, AddressEntity> businessAddress = this.myPageService.getBusinessAddress(sessionUser.getUserId());
            Pair<MyPageResult, List<BusinessReservationDto>> businessReservations = this.myPageService.getBusinessReservations(sessionUser.getUserId());
            modelAndView.addObject("businessAddress", businessAddress.getRight());
            modelAndView.addObject("businessReservations", businessReservations.getRight());
        }
        List<Map<String, Object>> hearts = myPageService.getHearts(sessionUser.getUserId());
        modelAndView.addObject("hearts", hearts);
        modelAndView.addObject("sessionUser", sessionUser);
        modelAndView.addObject("user", user.getRight());
        modelAndView.addObject("personalUser", personalUser.getRight());
        modelAndView.addObject("businessUser", businessUser.getRight());
        modelAndView.addObject("primaryPet", primaryPet.getRight());
        modelAndView.addObject("pets", readPets);
        modelAndView.addObject("stores", stores.getRight());
        modelAndView.addObject("today", LocalDate.now());
        return modelAndView;
    }


    // 애완동물 삭제
    @RequestMapping(value = "/pet/delete", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> deletePet(@RequestParam(value = "petId") int petId,
                                         @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        MyPageResult result = this.myPageService.deletePet(petId, sessionUser.getUserId());
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.name());
        return response;
    }

    // 새 애완동물 등록
    @RequestMapping(value = "/pet/registration", method = POST,
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> insertPet(@SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser,
                                         @RequestPart("data") PetDto pet,
                                         @RequestPart(value = "petImage", required = false) MultipartFile petImage) {
        Pair<MyPageResult, Integer> result = this.myPageService.insertPetInMyPage(sessionUser.getUserId(), pet, petImage);
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.getLeft());
        response.put("petId", result.getRight());
        response.put("petIsPrimary", pet.getIsPrimary());
        return response;
    }

    // 펫 수정을 할때 모달에 펫 정보 가져오는 컨트롤러
    @RequestMapping(value = "/pet/load", method = GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> getPet(@RequestParam(value = "petId") int petId,
                                      @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Pair<MyPageResult, PetEntity> pet = this.myPageService.getPet(petId, sessionUser.getUserId());
        Map<String, Object> response = new HashMap<>();
        response.put("result", pet.getLeft());
        response.put("pet", pet.getRight());
        return response;
    }

    // 펫 수정해서 정보 수정시키는 컨트롤러
    @RequestMapping(value = "/pet/update", method = POST,
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postPet(@RequestPart("data") PetEntity pet,
                                       @RequestPart(value = "petImage", required = false) MultipartFile petImage,
                                       @RequestParam(value = "existingImageUrl", required = false) String existingImageUrl,
                                       @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        MyPageResult result = this.myPageService.updatePet(pet, petImage, existingImageUrl, sessionUser.getUserId());
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.name());
        return response;
    }

    // 대표동물 변경 컨트롤러
    @RequestMapping(value = "/pet/primary/change", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchPrimaryPet(@RequestParam(value = "petId") int petId,
                                               @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        MyPageResult result = this.myPageService.changePrimaryPet(petId, sessionUser.getUserId());
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.name());
        return response;
    }


    /*------------------------------개인 회원 정보 수정-----------------------------------------*/
    // 실명 변경
    @RequestMapping(value = "/name/change", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchName(@RequestParam(value = "name") String name,
                                         @RequestParam(value = "password") String password,
                                         @SessionAttribute(value = "sessionUser" ,required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.changeName(name, password, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }

    // 닉네임 변경
    @RequestMapping(value = "/nickname/change", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchNickname(@RequestParam(value = "nickname") String nickname,
                                         @SessionAttribute(value = "sessionUser" ,required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.changeNickname(nickname, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }


    // 전화번호 변경
    @RequestMapping(value = "/phone/change", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchPhone(@RequestParam(value = "phone") String phone,
                                         @RequestParam(value = "password") String password,
                                         @SessionAttribute(value = "sessionUser" ,required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.changePhone(phone, password, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }

    // 기본주소 대표주소 변경
    @RequestMapping(value = "/address/default", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postDefaultAddress(@RequestParam(value = "addressId") int addressId,
                                                  @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.changeDefaultAddress(addressId, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }


    // 기본주소 추가 등록
    @RequestMapping(value = "/address/registration", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postAddress(AddressDto addressDto,
                                           @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.postAddress(addressDto, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }


    // 기본주소 수정
    @RequestMapping(value = "/address/modify", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchAddress(@RequestParam(value = "addressId") int addressId,
                                            AddressDto addressDto,
                                           @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.patchAddress(addressId, addressDto, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }

    // 기본주소 삭제
    @RequestMapping(value = "/address/delete", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> deleteAddress(@RequestParam(value = "addressId") int addressId,
                                             @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.deleteAddress(addressId, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }

    // 대표 배송지 변경
    @RequestMapping(value = "/delivery/default", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postDefaultDelivery(@RequestParam(value = "addressId") int addressId,
                                                  @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.changeDefaultDelivery(addressId, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }


    // 배송지 등록
    @RequestMapping(value = "/delivery/registration", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postDeliveryAddress(DeliveryAddressEntity deliveryAddress,
                                           @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        Pair<MyPageResult, DeliveryAddressEntity> result = this.myPageService.postDeliveryAddress(deliveryAddress, sessionUser.getUserId());
        response.put("result", result.getLeft());
        if (result.getLeft() == MyPageResult.SUCCESS) {
            response.put("newDeliveryId", result.getRight().getDeliveryAddressId());
            response.put("isDefault", result.getRight().isDefault());
        }
        return response;
    }

    // 배송지 수정
    @RequestMapping(value = "/delivery/modify", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchDeliveryAddress(@RequestParam(value = "deliveryAddressId") int deliveryAddressId,
                                            DeliveryAddressEntity deliveryAddress,
                                            @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.patchDeliveryAddress(deliveryAddressId, deliveryAddress, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }

    // 배송지 삭제
    @RequestMapping(value = "/delivery/delete", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> deleteDeliveryAddress(@RequestParam(value = "deliveryAddressId") int deliveryAddressId,

                                                   @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.deleteDeliveryAddress(deliveryAddressId, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }



    // 비밀번호 변경
    @RequestMapping(value = "/password/change", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchPassword(@RequestParam(value = "password") String password,
                                          @RequestParam(value = "newPassword") String newPassword,
                                          @SessionAttribute(value = "sessionUser" ,required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.changePassword(password, newPassword, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }


    // 회원탈퇴
    @RequestMapping(value = "/delete/user", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> deleteUser(@RequestParam(value = "password") String password,
                                          @SessionAttribute(value = "sessionUser" ,required = false) SessionUser sessionUser,
                                          HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.deleteUser(password, sessionUser.getUserId());
        if (result == MyPageResult.SUCCESS) {
            session.invalidate();
        }
        response.put("result", result.name());
        return response;
    }



    /*--------------------------사업자 회원 정보 변경---------------------------------------*/
    // 기업명 변경
    @RequestMapping(value = "/companyName/change", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchCompanyName(@RequestParam(value = "companyName") String companyName,
                                         @RequestParam(value = "password") String password,
                                         @SessionAttribute(value = "sessionUser" ,required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.changeCompanyName(companyName, password, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }

    // 대표자명 변경
    @RequestMapping(value = "/representativeName/change", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchRepresentativeName(@RequestParam(value = "representativeName") String representativeName,
                                                @RequestParam(value = "password") String password,
                                                @SessionAttribute(value = "sessionUser" ,required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.changeRepresentativeName(representativeName, password, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }


    // 회사 주소 변경
    @RequestMapping(value = "/companyAddress/change", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchCompanyAddress(@RequestParam(value = "postalCode") String postalCode,
                                                   @RequestParam(value = "addressPrimary") String addressPrimary,
                                                   @RequestParam(value = "addressSecondary") String addressSecondary,
                                                   @RequestParam(value = "password") String password,
                                                   @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.changeCompanyAddress(postalCode, addressPrimary, addressSecondary, password, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }








    // 가게등록
    @RequestMapping(value = "/store/registration", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postStore(StoreDto store,
                                         @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.postStore(store, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }

    // 가게 수정
    @RequestMapping(value = "store/modify", method = PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchStore(@RequestParam(value = "storeId") int storeId,
                                          StoreDto store,
                                          @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.modifyStore(storeId, store, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }


    // 가게삭제
    @RequestMapping(value = "/store/delete", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> deleteStore(@RequestParam(value = "storeId") int storeId,
                                           @RequestParam(value = "password") String password,
                                           @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.deleteStore(storeId, password, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }

    // 주문 내역
    @RequestMapping(value = "/order/{orderId}", method = GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> getOrderDetail(@PathVariable int orderId,
                                              @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        if (sessionUser == null) {
            return Map.of("result", "FAILURE_SESSION_EXPIRED");
        }
        return myPageService.getOrderDetail(orderId, sessionUser.getUserId());
    }





    // 예약취소
    @RequestMapping(value = "/reservation/cancel", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchReservationCancel(@RequestParam(value = "reservationId") int reservationId,
                                                      @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.patchReservation(reservationId, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }

    // 찜 취소
    @RequestMapping(value = "/heart/delete", method = POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> deleteHeart(@RequestParam(value = "productId") int productId,
                                           @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        MyPageResult result = this.myPageService.deleteHeart(productId, sessionUser.getUserId());
        response.put("result", result.name());
        return response;
    }

    @GetMapping("/heart/check")
    @ResponseBody
    public Map<String, Object> checkHeart(@RequestParam int productId,
                                          @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("isHearted", false);
            return response;
        }
        Integer heartId = heartMapper.checkHeart(sessionUser.getUserId(), productId);
        response.put("isHearted", heartId != null);
        return response;
    }




    // 사업자 예약취소
    @PostMapping("/reservation/business/cancel")
    @ResponseBody
    public Map<String, Object> cancelBusinessReservation(@RequestParam int reservationId,
                                                         @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        if (sessionUser == null) {
            return Map.of("result", "FAILURE_SESSION_EXPIRED");
        }
        if (!"BUSINESS".equals(sessionUser.getUserType())) {
            return Map.of("result", "FAILURE");
        }
        MyPageResult result = myPageService.cancelBusinessReservation(reservationId, sessionUser.getUserId());
        return Map.of("result", result.name());
    }
}
