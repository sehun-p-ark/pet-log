package dev.dhkim.petlog.controllers.main;

import ch.qos.logback.core.model.Model;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequiredArgsConstructor
@RequestMapping(value="/")
public class MainController {
    @RequestMapping(value="/main",method = RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getMain(ModelAndView modelAndView) {
        modelAndView.setViewName("main/main");
        return modelAndView;
    }

    @RequestMapping(value="/register",method = RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getRegister(ModelAndView modelAndView, Model model){
        modelAndView.setViewName("user/register");
        return modelAndView;
    }
}
