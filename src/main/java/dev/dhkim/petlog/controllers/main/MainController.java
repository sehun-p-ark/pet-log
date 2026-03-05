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

        //  ADMIN이면 고객센터(/cs)로 강제 이동
        if (sessionUser != null && "ADMIN".equals(sessionUser.getUserType())) {
            modelAndView.setViewName("redirect:/cs");
            return modelAndView;
        }

        modelAndView.setViewName("main/main");
        modelAndView.addObject("sessionUser", sessionUser);

        if (sessionUser != null && "PERSONAL".equals(sessionUser.getUserType())) {
            friendService.getOrCreateAddressWithLatLng(sessionUser.getUserId());
        }

        return modelAndView;
    }
}