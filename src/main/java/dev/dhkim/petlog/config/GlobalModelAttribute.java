package dev.dhkim.petlog.config;

import dev.dhkim.petlog.dto.user.SessionUser;
import jakarta.servlet.http.HttpSession;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalModelAttribute {

    @ModelAttribute
    public void addSessionUser(HttpSession session, Model model) {
        SessionUser sessionUser =
                (SessionUser) session.getAttribute("sessionUser");

        model.addAttribute("sessionUser", sessionUser);
    }
}