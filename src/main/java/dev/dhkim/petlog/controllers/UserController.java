package dev.dhkim.petlog.controllers;

import ch.qos.logback.core.model.Model;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequiredArgsConstructor
@RequestMapping(value="/user")
public class UserController {
    @RequestMapping(value="/login",method = RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getLogin(ModelAndView modelAndView, Model model){
        modelAndView.setViewName("user/login");
        return modelAndView;
    }

    @RequestMapping(value="/register",method = RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getRegister(ModelAndView modelAndView, Model model){
        modelAndView.setViewName("user/register");
        return modelAndView;
    }

    // 임시 테스트 로그인
    @RequestMapping(value="/test/login", method = RequestMethod.GET)
    public String testLogin(HttpSession session) {
        session.setAttribute("userId", 2);
        return "redirect:/shop/main";
    }

    // 로그아웃
    @RequestMapping(value="/logout", method = RequestMethod.GET)
    public String logout(HttpSession session) {
        session.invalidate(); // 세션 전체 삭제
        return "redirect:/shop/main";
    }
}
