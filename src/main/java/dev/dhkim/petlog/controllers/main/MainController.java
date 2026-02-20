package dev.dhkim.petlog.controllers.main;

import dev.dhkim.petlog.dto.user.PetDto;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.entities.user.AddressEntity;
import dev.dhkim.petlog.services.main.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/")
public class MainController {

    private final FriendService friendService;

    @RequestMapping(value = "/main", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getMain(
            ModelAndView modelAndView,
            @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser
    ) {
        modelAndView.setViewName("main/main");
        modelAndView.addObject("sessionUser", sessionUser);

        List<PetDto> pets = List.of();


        if (sessionUser != null) {
            pets = friendService.getFriendPets(sessionUser.getUserId());
            modelAndView.addObject("pets", pets);

            // 디버깅: 리스트 크기와 각 요소 확인
            System.out.println("[DEBUG] 내 펫 리스트 크기: " + pets.size());
            for (PetDto pet : pets) {
                System.out.println("[DEBUG] Pet name: " + pet.getName() + ", Species: " + pet.getSpecies());
            }
            AddressEntity myAddress = friendService.getOrCreateAddressWithLatLng(sessionUser.getUserId());

            if (myAddress != null && myAddress.getLat() != null && myAddress.getLng() != null
                    && myAddress.getLat() != 0.0 && myAddress.getLng() != 0.0) {

                double myLat = myAddress.getLat();
                double myLng = myAddress.getLng();

               /* List<PetDto> nearbyFriends = friendService.getNearbyFriends(sessionUser.getUserId(), myLat, myLng);
                modelAndView.addObject("nearbyFriendsPets", nearbyFriends); // 여기 이름을 템플릿과 맞춤*/


                System.out.println("[DEBUG] 내 펫 리스트: " + pets.size());
            } else {
                System.out.println("[DEBUG] 기본 주소 없음 또는 위도/경도 없음");
            }
        }

        return modelAndView;
    }

    @GetMapping("/api/friends/nearby")
    @ResponseBody
    public List<PetDto> getNearbyFriends(
            @SessionAttribute("sessionUser") SessionUser sessionUser,
            @RequestParam double lat,
            @RequestParam double lng
    ) {
        return friendService.getNearbyFriends(
                sessionUser.getUserId(),
                lat,
                lng
        );
    }

}
