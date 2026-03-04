package dev.dhkim.petlog.controllers;

import ch.qos.logback.core.model.Model;
import dev.dhkim.petlog.dto.user.RegisterDto;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.entities.user.BusinessUserEntity;
import dev.dhkim.petlog.entities.user.PersonalUserEntity;
import dev.dhkim.petlog.entities.user.UserEntity;
import dev.dhkim.petlog.enums.user.EmailVerificationType;
import dev.dhkim.petlog.mappers.user.UserMapper;
import dev.dhkim.petlog.results.*;
import dev.dhkim.petlog.services.user.UserService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping(value="/user")
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;

    @RequestMapping(value="/login", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getLogin(ModelAndView modelAndView,
                                 @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser) {
        if (sessionUser != null) {
            modelAndView.setViewName("redirect:/main");
            return modelAndView;
        }
        modelAndView.setViewName("user/login");
        return modelAndView;
    }

    @RequestMapping(value = "/logout", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getLogout(HttpSession session) {
        Object sessionUser = session.getAttribute("sessionUser");
        if (sessionUser != null) {
            session.removeAttribute("sessionUser");
        }
        return "redirect:/user/login";
    }


    @RequestMapping(value="/register",method = RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getRegister(ModelAndView modelAndView, Model model){
        modelAndView.setViewName("user/register");
        return modelAndView;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST,
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postUser(
            @RequestPart("data") RegisterDto dto,
            @RequestPart(value = "petImages", required = false) List<MultipartFile> petImages) {
        Map<String, Object> response = new HashMap<>();
        RegisterResult result = userService.register(dto, petImages);
        response.put("result", result.name());
        return response;
    }

    @RequestMapping(value = "/email", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postEmail(@RequestParam(value = "email") String email,
                                         @RequestParam(value = "type")EmailVerificationType type) throws MessagingException {

        Map<String, Object> response = new HashMap<>();
        EmailVerificationResult result = this.userService.sendEmail(email, type);
        response.put("result", result.name());
        return response;
    }

    @RequestMapping(value = "/email/verify", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchEmail(@RequestParam(value = "email") String email,
                                          @RequestParam(value = "code") String code,
                                          @RequestParam(value = "type") EmailVerificationType type) {
        EmailVerificationResult result = userService.verifyEmail(email, code, type);
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.name());
        return response;
    }

    @RequestMapping(value = "/loginId/verify", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchFindId(@RequestParam(value = "email") String email,
                                          @RequestParam(value = "code") String code,
                                          @RequestParam(value = "type") EmailVerificationType type) {
        EmailVerificationResult result = userService.verifyEmail(email, code, type);
        Map<String, Object> response = new HashMap<>();
        if (result == EmailVerificationResult.SUCCESS) {
            UserEntity dbUser = this.userMapper.selectByEmail(email);
            if (dbUser.getUserType().equals("PERSONAL")) {
                PersonalUserEntity dbPersonalUser = this.userMapper.selectByPersonalUserId(dbUser.getId());
                response.put("name", dbPersonalUser.getName());
                response.put("loginId", dbUser.getLoginId());
            }
            if (dbUser.getUserType().equals("BUSINESS")) {
                BusinessUserEntity dbBusinessUser = this.userMapper.selectByBusinessUserId(dbUser.getId());
                response.put("name", dbBusinessUser.getRepresentativeName());
                response.put("loginId", dbUser.getLoginId());
            }
        }
        response.put("result", result.name());
        return response;
    }

    @RequestMapping(value = "/nickname", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> getNicknameStatus(@RequestParam(value = "nickname") String nickname) {
        CheckResult result = this.userService.checkNickname(nickname);
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.name());
        return response;
    }

    @RequestMapping(value = "/loginId", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> getLoginIdStatus(@RequestParam(value = "loginId") String loginId) {
        CheckResult result = this.userService.checkLoginId(loginId);
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.name());
        return response;
    }

    @RequestMapping(value = "/phone", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> getPhoneStatus(@RequestParam(value = "phone") String phone) {
        CheckResult result = this.userService.checkPhone(phone);
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.name());
        return response;
    }

    @RequestMapping(value = "/businessId", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> getBusinessIdStatus(@RequestParam(value = "businessId") String businessId) {
        CheckResult result = this.userService.checkBusinessId(businessId);
        Map<String, Object> response = new HashMap<>();
        response.put("result", result.name());
        return response;
    }


    // 로그인
    @RequestMapping(value = "/login", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> postLogin(@RequestParam(value = "loginId") String loginId,
                                         @RequestParam(value = "password") String password,
                                         HttpSession session) {
        //response 위치 옮김 -> usertype admin 밑에 ★때문에
        Map<String, Object> response = new HashMap<>();
        Pair<LoginResult, UserEntity> result = this.userService.login(loginId, password);
        if (result.getLeft() == LoginResult.SUCCESS) {
            UserEntity user = result.getRight();
            // JS가 이 값을 보고 관리자인지 판단하니까 꼭 넣어주세요.★
            response.put("userType", user.getUserType());
            SessionUser sessionUser = new SessionUser(user.getId(), user.getUserType());
            session.setAttribute("sessionUser", sessionUser);


        }


        response.put("result", result.getLeft().name());
        return response;
    }

    // 아이디 찾기
    @RequestMapping(value = "/findId", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> sendFindIdEmail(@RequestParam(value = "name") String name,
                                         @RequestParam(value = "email") String email,
                                               EmailVerificationType type) throws MessagingException {
        Map<String, Object> response = new HashMap<>();
        EmailVerificationResult result = this.userService.sendFindIdEmail(name, email, type);
        response.put("result", result.name());
        return response;
    }

    // 비밀번호 찾기
    @RequestMapping(value = "/findPassword", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> sendFindPasswordEmail(@RequestParam(value = "email") String email,
                                                     @RequestParam(value = "loginId") String loginId,
                                                     @RequestParam(value = "type") EmailVerificationType type) throws MessagingException {

        Map<String, Object> response = new HashMap<>();
        EmailVerificationResult result = this.userService.sendFindPasswordEmail(email, loginId, type);
        response.put("result", result.name());
        return response;
    }

    @RequestMapping(value = "/changePassword", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> patchChangePassword(@RequestParam(value = "loginId") String loginId,
                                                   @RequestParam(value = "email") String email,
                                                   @RequestParam(value = "password") String password) {

        Map<String, Object> response = new HashMap<>();
        FindPasswordResult result = this.userService.changePassword(loginId, email, password);
        response.put("result", result.name());
        return response;
    }









    // 카카오로그인
    @RequestMapping(value="/login/kakao", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getKakaoLogin() {
        String kakaoAuthUrl = "https://kauth.kakao.com/oauth/authorize" +
                "?client_id=" + System.getenv("KAKAO_REST_KEY") +
                "&redirect_uri=http://localhost:8080/user/login/kakao/callback" +
                "&response_type=code";
        return "redirect:" + kakaoAuthUrl;
    }

    @RequestMapping(value="/login/kakao/callback", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getKakaoCallback(@RequestParam String code, HttpSession session) {
        // 1. code로 access token 요청
        // 2. access token으로 사용자 정보 조회
        // 3. DB 가입/로그인 처리 후 세션 저장
        // 예: session.setAttribute("sessionUser", new SessionUser(...));
        return "redirect:/main"; // 로그인 완료 후 이동
    }




    // 네이버 로그인
    @RequestMapping(value="/login/naver", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getNaverLogin() {
        String naverAuthUrl = "https://nid.naver.com/oauth2.0/authorize" +
                "?client_id=" + System.getenv("NAVER_CLIENT_ID") +
                "&response_type=code" +
                "&redirect_uri=http://localhost:8080/user/login/naver/callback";
        return "redirect:" + naverAuthUrl;
    }

    @RequestMapping(value="/login/naver/callback", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getNaverCallback(@RequestParam String code,
                                   @RequestParam String state,
                                   HttpSession session) throws Exception {


        System.out.println("NAVER_CLIENT_ID = " + System.getenv("NAVER_CLIENT_ID"));
        System.out.println("NAVER_CLIENT_SECRET = " + System.getenv("NAVER_CLIENT_SECRET"));
        // 1. 서비스 호출 → UserEntity 반환
        UserEntity user = userService.loginOrRegisterByNaver(code, state);
        System.out.println("네이버 로그인 user = " + user);

        if (user == null) {
            return "redirect:/user/login?error=naver_login";
        }

        // 2. 세션 등록
        SessionUser sessionUser = new SessionUser(user.getId(), user.getUserType());
        session.setAttribute("sessionUser", sessionUser);

        return "redirect:/main";
    }




    // 구글로그인
    // 구글 로그인
    @RequestMapping(value="/login/google", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getGoogleLogin() throws UnsupportedEncodingException {
        String clientId = System.getenv("GOOGLE_CLIENT_ID");
        String redirectUri = URLEncoder.encode("http://localhost:8080/user/login/google/callback", StandardCharsets.UTF_8);

        System.out.println(">>> GOOGLE_CLIENT_ID = " + clientId);
        System.out.println(">>> redirect_uri = " + redirectUri);

        String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?scope=email%20profile" +
                "&access_type=offline" +
                "&include_granted_scopes=true" +
                "&response_type=code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + redirectUri;

        System.out.println(">>> googleAuthUrl = " + googleAuthUrl);

        return "redirect:" + googleAuthUrl;
    }

    @RequestMapping(value="/login/google/callback", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getGoogleCallback(@RequestParam String code,
                                    HttpSession session) throws Exception {

        System.out.println("GOOGLE_CLIENT_ID = " + System.getenv("GOOGLE_CLIENT_ID"));
        System.out.println("GOOGLE_CLIENT_SECRET = " + System.getenv("GOOGLE_CLIENT_SECRET"));

        // 서비스 호출 → UserEntity 반환
        UserEntity user = userService.loginOrRegisterByGoogle(code);
        System.out.println("구글 로그인 user = " + user);

        if (user == null) {
            return "redirect:/user/login?error=google_login";
        }

        // 세션 등록
        SessionUser sessionUser = new SessionUser(user.getId(), user.getUserType());
        session.setAttribute("sessionUser", sessionUser);

        return "redirect:/main";
    }
}
