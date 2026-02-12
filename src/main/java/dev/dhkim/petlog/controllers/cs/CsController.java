package dev.dhkim.petlog.controllers.cs;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequiredArgsConstructor
@RequestMapping(value="/cs")
public class CsController {
    @RequestMapping(value="cs",method = RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getCustomer(ModelAndView modelAndView){
        modelAndView.setViewName("cs/cs");
        return modelAndView;
    }

}
