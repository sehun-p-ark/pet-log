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
@RequestMapping(value = "/shop")
public class ShopController {
    @RequestMapping(value = "main", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getShop(ModelAndView modelAndView, Model model){
        modelAndView.setViewName("shop/main");
        return modelAndView;
    }

    @RequestMapping(value = "list", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getList(ModelAndView modelAndView, Model model){
        modelAndView.setViewName("shop/list");
        return modelAndView;
    }

    @RequestMapping(value = "product", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getProduct(ModelAndView modelAndView, Model model){
        modelAndView.setViewName("shop/product");
        return modelAndView;
    }

    @RequestMapping(value = "cart", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getCart(ModelAndView modelAndView, Model model) {
        modelAndView.setViewName("shop/cart");
        return modelAndView;
    }

    @RequestMapping(value = "payment", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getPayment(ModelAndView modelAndView, Model model) {
        modelAndView.setViewName("shop/payment");
        return modelAndView;
    }

    @RequestMapping(value = "brand", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getBrand(ModelAndView modelAndView, Model model) {
        modelAndView.setViewName("shop/brand");
        return modelAndView;
    }

}

