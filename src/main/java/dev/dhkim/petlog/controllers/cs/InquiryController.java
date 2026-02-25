package dev.dhkim.petlog.controllers.cs;

import dev.dhkim.petlog.dto.cs.InquiryDto;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.entities.cs.InquiryEntity;
import dev.dhkim.petlog.services.cs.InquiryService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping(value = "/cs")
public class InquiryController {

    private final InquiryService inquiryService;

    // [페이지 로드] 관리자면 전체 글, 일반 유저면 본인 글 조회
    @GetMapping
    public String csPage(Model model, HttpSession session) {
        SessionUser sessionUser = (SessionUser) session.getAttribute("sessionUser");

        if (sessionUser != null) {
            if ("ADMIN".equals(sessionUser.getUserType())) {
                // 관리자는 전체 목록을 'inquiries'에 담음
                List<InquiryEntity> allInquiries = inquiryService.getAllInquiries();
                model.addAttribute("inquiries", allInquiries);
                model.addAttribute("isAdmin", true);
            } else {
                // [수정] 유저는 본인 글만 가져와서 담음
                List<InquiryEntity> myInquiries = inquiryService.getInquiriesByUserId(sessionUser.getUserId());
                model.addAttribute("inquiries", myInquiries); // 유저도 동일한 이름을 써도 되지만,
                model.addAttribute("isAdmin", false);
            }
        }
        return "cs/cs";
    }
    // [1:1 문의 작성]
    @PostMapping("/inquiry/write")
    public String write(InquiryDto dto,
                        @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        if (sessionUser == null) return "redirect:/user/login";

        inquiryService.writeInquiry(sessionUser.getUserId(), dto);
        return "redirect:/cs";
    }

    // [관리자 전용: 답변 등록] 비동기 처리(AJAX)용
    @ResponseBody
    @PostMapping("/inquiry/answer")
    public String postAnswer(@RequestBody Map<String, Object> params, //  @RequestParam 대신 @RequestBody 사용
                             @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {

        // 1. 보안 체크
        if (sessionUser == null || !"ADMIN".equals(sessionUser.getUserType())) {
            return "FAILURE";
        }

        try {
            // 2. JSON 데이터에서 값 추출
            // JS에서 보낸 데이터 타입에 따라 Integer 혹은 String으로 변환이 필요할 수 있습니다.
            int id = Integer.parseInt(params.get("id").toString());
            String answer = (String) params.get("answer");

            // 3. 서비스 호출
            boolean result = inquiryService.replyInquiry(id, answer);
            return result ? "SUCCESS" : "FAILURE";

        } catch (Exception e) {
            e.printStackTrace();
            return "FAILURE";
        }
    }
/*
    @ResponseBody
    @DeleteMapping("/inquiry/delete/{id}")
    public void deleteAnswer(@)*/


}