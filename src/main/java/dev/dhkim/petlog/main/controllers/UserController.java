package dev.dhkim.petlog.main.controllers;

import ch.qos.logback.core.model.Model;
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
}
