package dev.dhkim.petlog.controllers.cs;

import org.springframework.ui.Model;
import dev.dhkim.petlog.dto.cs.InquiryDto;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.entities.cs.InquiryEntity;
import dev.dhkim.petlog.services.cs.InquiryService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Controller
@RequiredArgsConstructor
@RequestMapping(value = "/cs")
public class InquiryController {

    private final InquiryService inquiryService;
    /*value = "/",*/
    @GetMapping
    public String csPage(Model model, HttpSession session) {

        SessionUser sessionUser = (SessionUser) session.getAttribute("sessionUser");

        if (sessionUser != null) {
            List<InquiryEntity> inquiries =
                    inquiryService.findByUserId(sessionUser.getUserId());

            model.addAttribute("inquiries", inquiries);
        }

        return "cs/cs";
    }



    @RequestMapping(value = "/inquiry/write", method = RequestMethod.POST)
    public String write(InquiryDto dto,
                        @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {

        if (sessionUser == null) {
            return "redirect:/user/login";
        }

        inquiryService.writeInquiry(sessionUser.getUserId(), dto);
        return "redirect:/cs";
    }

    @RequestMapping(value = "/inquiry/delete/{id}", method = RequestMethod.POST)
    public String deleteInquiry(@PathVariable("id") Integer inquiryId,
                                @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {

        if (sessionUser == null) {
            return "redirect:/user/login";
        }

        inquiryService.deleteInquiry(inquiryId, sessionUser.getUserId());
        return "redirect:/cs";
    }


}
