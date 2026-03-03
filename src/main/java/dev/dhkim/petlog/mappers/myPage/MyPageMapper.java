package dev.dhkim.petlog.mappers.myPage;

import dev.dhkim.petlog.dto.user.*;
import dev.dhkim.petlog.entities.main.ReservationEntity;
import dev.dhkim.petlog.entities.user.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.Map;
import java.util.List;

@Mapper
public interface MyPageMapper {
    UserEntity selectByUserId(@Param(value = "userId") int userId);

    PersonalUserEntity selectPersonalByUserId(@Param(value = "userId") int userId);


    // 닉네임 중복확인용
    PersonalUserEntity selectNicknameByNickname(@Param(value = "nickname") String nickname);

    BusinessUserEntity selectBusinessByUserId(@Param(value = "userId") int userId);


    // 개인회원 주소 전체
    List<AddressEntity> selectPersonalAddressesByUserId(@Param(value = "userId") int userId);

    // 개인회원 주소 하나만 가져오기
    AddressEntity selectPersonalAddressByAddressId(@Param(value = "addressId") int addressId);

    // 개인회원 대표주소 불러오기
    AddressEntity selectDefaultAddressByUserId(@Param(value = "userId") int userId);

    // 개인회원 배송지 주소 전체
    List<DeliveryAddressEntity> selectDeliveryAddressesByUserId(@Param(value = "userId") int userId);

    // 개인회원 배송지 기본배송지만
    DeliveryAddressEntity selectPrimaryDeliveryAddressByUserId(@Param(value = "userId") int userId);

    // 개인회원 배송지 하나 가져오기
    DeliveryAddressEntity selectDeliveryAddressByDeliveryAddressIdAndUserId(@Param(value = "deliveryAddressId") int deliveryAddressId,
                                                                            @Param(value = "userId") int userId);


    // 예약내역 모두 가져오기
    List<MyPageReservationDto> selectAllReservationByUserId(@Param(value = "userId") int userid);

    // 사업자 회원 예약관리
    List<BusinessReservationDto> selectReservationsByBusinessUserId(@Param("userId") int userId);

    // 사업자 예약취소
    ReservationEntity selectReservationByIdAndBusinessUserId(@Param("reservationId") int reservationId, @Param("userId") int userId);

    // 배송지 제일 처음에 만든거 가져오기
    DeliveryAddressEntity selectOldestDeliveryAddressByUserId(@Param(value = "userId") int userId);


    // 배송지 삭제 후 기본배송지 바꾸는 매퍼
    int updateDefaultDeliveryAddress(@Param(value = "deliveryAddressId") int deliveryAddressId,
                                     @Param(value = "userId") int userId);

    // 배송지 대표 배송지로 변경
    int updateAllDeliveryDefaultFalse(@Param(value = "userId") int userId);

    // 배송지 대표 배송지로 설정
    int updateDeliveryDefault(@Param(value = "addressId") int addressId);

    // 배송지 수정
    int updateDeliveryAddress(@Param(value = "deliveryAddressId") int deliveryAddressId,
                              @Param(value = "deliveryAddress") DeliveryAddressEntity deliveryAddress,
                              @Param(value = "userId") int userId);


    // 사업자회원 주소
    AddressEntity selectBusinessAddressByUserId(@Param(value = "userId") int userId);

    PetEntity selectPrimaryPetByUserId(@Param(value = "userId") int userId);

    List<PetEntity> selectPetsByUserId(@Param(value = "userId") int userId);

    PetEntity selectByPetIdAndUserId(@Param(value = "petId") int petId,
                                     @Param(value = "userId") int userId);

    List<StoreEntity> selectStoresByUserId(@Param(value = "userId") int userId);

    UserEntity selectPhoneByPhone(@Param(value = "phone") String phone);


    int deletePet(@Param(value = "petId") int petId,
                  @Param(value = "userId") int userId);

    int updatePrimary(@Param(value = "petId") int petId,
                      @Param(value = "userId") int userId);

    int updatePet(@Param(value = "pet") PetEntity pet,
                  @Param(value = "userId") int userId);

    int updatePetsNoPrimary(@Param(value = "userId") int userId);


    int updateName(@Param(value = "name") String name,
                   @Param(value = "userId") int userId);


    int updateNickname(@Param(value = "nickname") String nickname,
                       @Param(value = "userId") int userId);

    int updatePhone(@Param(value = "phone") String phone,
                    @Param(value = "userId") int userId);

    int updateAddress(@Param(value = "addressId") int addressId,
                      @Param(value = "address") AddressDto address,
                      @Param(value = "userId") int userId);

    int updateAllDefaultAddressFalse(@Param(value = "userId") int userId);

    int updateDefaultAddress(@Param(value = "addressId") int addressId);

    int updatePassword(@Param(value = "newPassword") String newPassword,
                       @Param(value = "userId") int userId);

    int deleteUser(@Param(value = "userId") int userId);

    int deleteAddress(@Param(value = "addressId") int addressId,
                      @Param(value = "userId") int userId);

    int insertPersonalAddress(@Param(value = "address")AddressDto addressDto,
                      @Param(value = "userId") int userId);

    int insertDeliveryAddress(@Param(value = "deliveryAddress") DeliveryAddressEntity deliveryAddress,
                              @Param(value = "userId") int userId);

    int deleteDeliveryAddress(@Param(value = "deliveryAddressId") int deliveryAddressId,
                              @Param(value = "userId") int userId);


    // 가게등록
    int insertStore(@Param(value = "store") StoreDto store,
                    @Param(value = "userId") int userId);

    // 기업명변경
    int updateCompanyName(@Param(value = "companyName") String companyName,
                          @Param(value = "userId") int userId);

    // 대표자명 변경
    int updateRepresentativeName(@Param(value = "representativeName") String representativeName,
                                 @Param(value = "userId") int userId);

    // 회사 주소 변경
    int updateCompanyAddress(@Param(value = "postalCode") String postalCode,
                             @Param(value = "addressPrimary") String addressPrimary,
                             @Param(value = "addressSecondary") String addressSecondary,
                             @Param(value = "userId") int userId);


    // 가게 수정
    int updateStore(@Param(value ="storeId") int storeId,
                    @Param(value = "store") StoreDto store,
                    @Param(value = "userId") int userId);

    // 가게 삭제
    int deleteStore(@Param(value = "storeId") int storeId,
                    @Param(value = "userId") int userId);

    // 리뷰 남기기
    List<Map<String, Object>> selectOrderItems(@Param("userId") Integer userId, @Param("period") String period);

    // 주문 내역
    Map<String, Object> selectOrderDetail(@Param("orderId") int orderId, @Param("userId") int userId);

    // 주문내역 필터
    List<Map<String, Object>> selectOrdersByPeriod(@Param("userId") Integer userId, @Param("period") String period);



    // 예약취소
    int updateReservationCancel(@Param(value = "reservationId") int reservationId,
                                @Param(value = "userId") int userId);

}
