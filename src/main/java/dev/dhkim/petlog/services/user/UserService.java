package dev.dhkim.petlog.services.user;

import dev.dhkim.petlog.dto.user.PetDto;
import dev.dhkim.petlog.dto.user.RegisterDto;
import dev.dhkim.petlog.dto.user.StoreDto;
import dev.dhkim.petlog.entities.user.BusinessUserEntity;
import dev.dhkim.petlog.entities.user.EmailVerificationEntity;
import dev.dhkim.petlog.entities.user.PersonalUserEntity;
import dev.dhkim.petlog.entities.user.UserEntity;
import dev.dhkim.petlog.enums.user.EmailVerificationType;
import dev.dhkim.petlog.mappers.user.EmailVerificationMapper;
import dev.dhkim.petlog.mappers.user.UserMapper;
import dev.dhkim.petlog.results.*;
import dev.dhkim.petlog.services.main.StoreService;
import dev.dhkim.petlog.validators.UserValidator;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.apache.commons.lang3.RandomStringUtils;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static dev.dhkim.petlog.enums.user.UserType.BUSINESS;
import static dev.dhkim.petlog.enums.user.UserType.PERSONAL;


@Service
@RequiredArgsConstructor
public class
UserService {
    private final UserMapper userMapper;
    private final EmailVerificationMapper emailVerificationMapper;
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final StoreService storeService;


    @Transactional
    public RegisterResult register(RegisterDto dto, List<MultipartFile> petImages) {
        if (!UserValidator.validateCommon(dto)) {
            System.out.println("FAIL: validateCommon");
            return RegisterResult.FAILURE;
        }
        if (dto.getUserType().equals(PERSONAL)) {
            if (!UserValidator.validatePersonal(dto)) {
                System.out.println("FAIL: validatePersonal");
                return RegisterResult.FAILURE;
            }
            if (dto.getPets() != null && !dto.getPets().isEmpty()) {
                for (PetDto pet : dto.getPets()) {
                    if (!UserValidator.validatePet(pet)) {
                        System.out.println("FAIL: validatePet - " + pet);
                        return RegisterResult.FAILURE;
                    }
                }
            }
        }
        if (dto.getUserType().equals(BUSINESS)) {
            if (!UserValidator.validateBusiness(dto)) {
                System.out.println("FAIL: validateBusiness");
                return RegisterResult.FAILURE;
            }
            if (dto.getStore() != null && !UserValidator.validateStore(dto.getStore())) {
                System.out.println("FAIL: validateStore");
                return RegisterResult.FAILURE;
            }
        }
        if (!UserValidator.validateAddress(dto.getAddress())) {
            System.out.println("FAIL: validateAddress");
            return RegisterResult.FAILURE;
        }
        if (dto.getTermsIds() == null) {
            System.out.println("FAIL: termsIds null");
            return RegisterResult.FAILURE;
        }
        EmailVerificationEntity dbEmail = emailVerificationMapper.selectByEmail(dto.getEmail());
        if (dbEmail == null) {
            System.out.println("FAIL: dbEmail null - email: " + dto.getEmail());
            return RegisterResult.FAILURE;
        }


        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(); // BCrypt 암호화(해싱)를 위한 객체

        String hashedPassword = encoder.encode(dto.getPassword()); // 비밀번호 암호문("$2a$...")
        dto.setPassword(hashedPassword);

        int dbUserResult = userMapper.insertUser(dto);
        if (dbUserResult < 1) {
            return RegisterResult.FAILURE;
        }
        int userId = dto.getId();


        if (dto.getUserType().equals(PERSONAL)) {
            int dbPersonalInsert = userMapper.insertPersonalUser(userId, dto);
            if (dbPersonalInsert < 1) {
                return RegisterResult.FAILURE;
            }

            if (dto.getPets() != null) {
                for (int i = 0; i < dto.getPets().size(); i++) {
                    PetDto pet = dto.getPets().get(i);

                    // 이미지 저장 처리
                    String imageUrl = "/user/assets/images/defaultPetImage.png"; // 기본값
                    if (petImages != null && i < petImages.size() && petImages.get(i) != null
                            && !petImages.get(i).isEmpty()) {
                        imageUrl = savePetImage(petImages.get(i));
                    }
                    pet.setImageUrl(imageUrl);

                    int dbPetInsert = userMapper.insertPet(userId, pet);
                    if (dbPetInsert < 1) {
                        return RegisterResult.FAILURE;
                    }
                }
            }
        }
        if (dto.getUserType().equals(BUSINESS)) {
            int dbBusinessInsert = userMapper.insertBusinessUser(userId, dto);
            if (dbBusinessInsert < 1) {
                return RegisterResult.FAILURE;
            }
            //주석 하고 밑에 코드 넣은 이유 매퍼 말고 서비스 호출 이유 서비스 안에
            //위도 경도, 가공 하는 코드를 이용해서 값을 넣기 위해 직접 db 에 바로 넣는것 보다 로직 이용을 위한것
            if (dto.getStore() != null) {
               int dbStoreInsert = userMapper.insertStore(userId, dto.getStore());
                if (dbStoreInsert < 1) {
                    return RegisterResult.FAILURE;
                }
               /* dto.getStore().setUserId(userId);
                StoreDto saved = storeService.registerStore(dto.getStore());
                if (saved == null) {
                    return RegisterResult.FAILURE;
                }*/
            }
        }


        dto.getAddress().setDefault(true);
        int dbAddressInsert = userMapper.insertAddress(userId, dto.getAddress());
        if (dbAddressInsert < 1) {
            return RegisterResult.FAILURE;
        }

        for (Integer termId : dto.getTermsIds()) {
            int dbTermsInsert = userMapper.insertTerm(userId, termId);
            if (dbTermsInsert < 1) {
                return RegisterResult.FAILURE;
            }
        }
        dbEmail.setUsed(true);
        int dbEmailUpdate = emailVerificationMapper.update(dbEmail);
        if (dbEmailUpdate < 1) {
            return RegisterResult.FAILURE;
        }
        return RegisterResult.SUCCESS;
    }

    // 이미지 저장 메서드 추가
    private String savePetImage(MultipartFile file) {
        try {
            // 저장 디렉토리 (프로젝트 외부 경로 권장)
            String uploadDir = System.getProperty("user.dir") + "/uploads/pets/";
            Path dirPath = Paths.get(uploadDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            // 파일명: uuid + 원본 확장자
            String originalFilename = file.getOriginalFilename();
            String ext = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String savedFilename = UUID.randomUUID() + ext;

            Path savePath = dirPath.resolve(savedFilename);
            Files.copy(file.getInputStream(), savePath);

            return "/uploads/pets/" + savedFilename;
        } catch (IOException e) {
            e.printStackTrace();
            return "/user/assets/images/defaultPetImage.png"; // 실패 시 기본이미지
        }
    }


    public EmailVerificationResult sendEmail(String email, EmailVerificationType type) throws MessagingException {
        if (!UserValidator.validateEmail(email)) {
            return EmailVerificationResult.FAILURE;
        }
        String subject = switch (type) {
            case REGISTER -> "[PetLog] 회원가입 이메일 인증번호";
            case FIND_ID -> "[PetLog] 아이디 찾기 이메일 인증번호";
            case CHANGE_PASSWORD -> "[PetLog] 비밀번호 재설정 이메일 인증번호";
        };
        String code = RandomStringUtils.randomNumeric(6);

        EmailVerificationEntity emailVerification = new EmailVerificationEntity();
        emailVerification.setEmail(email);
        emailVerification.setType(type.name());
        emailVerification.setCode(code);
        emailVerification.setVerified(false);
        emailVerification.setCreatedAt(LocalDateTime.now());
        emailVerification.setExpiresAt(LocalDateTime.now().plusMinutes(5L));


        UserEntity dbRegisterEmail = userMapper.selectByEmail(email);
        if (dbRegisterEmail != null) {
            return EmailVerificationResult.FAILURE_DUPLICATE;
        }

        int insertResult = emailVerificationMapper.insert(emailVerification);
        if (insertResult < 1) {
            return EmailVerificationResult.FAILURE;
        }

        Context context = new Context();
        context.setVariable("type", switch (type) {
            case REGISTER -> "회원가입";
            case FIND_ID -> "아이디 찾기";
            case CHANGE_PASSWORD -> "비밀번호 재설정";
        });
        context.setVariable("code", code);

        String body = templateEngine.process("user/sendEmail", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(message);
        messageHelper.setFrom("msubi0831@gmail.com");
        messageHelper.setTo(email);
        messageHelper.setSubject(subject);
        messageHelper.setText(body, true);
        this.mailSender.send(message);
        return EmailVerificationResult.SUCCESS;
    }

    @Transactional
    public EmailVerificationResult verifyEmail(String email, String code,
                                               EmailVerificationType type) {
        if (!UserValidator.validateEmail(email) ||
                !UserValidator.validateEmailCode(code) ||
                !UserValidator.validateEmailType(type)) {
            return EmailVerificationResult.FAILURE;
        }

        EmailVerificationEntity dbResult = this.emailVerificationMapper.select(email, code, type);

        if (dbResult == null) {
            return EmailVerificationResult.FAILURE;
        }
        if (dbResult.isVerified()) {
            return EmailVerificationResult.FAILURE;
        }
        if (dbResult.getExpiresAt().isBefore(LocalDateTime.now())) {
            return EmailVerificationResult.FAILURE_EXPIRED;
        }

        dbResult.setVerified(true);
        return this.emailVerificationMapper.update(dbResult) > 0
                ? EmailVerificationResult.SUCCESS
                : EmailVerificationResult.FAILURE;
    }


    public CheckResult checkLoginId(String loginId) {
        if (!UserValidator.validateLoginId(loginId)) {
            return CheckResult.FAILURE;
        }
        UserEntity dbUser = this.userMapper.selectByLoginId(loginId);
        return dbUser == null
                ? CheckResult.SUCCESS
                : CheckResult.FAILURE;
    }

    public CheckResult checkPhone(String phone) {
        if (!UserValidator.validatePhone(phone)) {
            return CheckResult.FAILURE;
        }
        UserEntity dbUser = this.userMapper.selectByPhone(phone);
        return dbUser == null
                ? CheckResult.SUCCESS
                : CheckResult.FAILURE;
    }

    public CheckResult checkNickname(String nickname) {
        if (!UserValidator.validateNickname(nickname)) {
            return CheckResult.FAILURE;
        }
        PersonalUserEntity dbUser = this.userMapper.selectByNickname(nickname);

        return dbUser == null
                ? CheckResult.SUCCESS
                : CheckResult.FAILURE;
    }

    public CheckResult checkBusinessId(String businessId) {
        if (!UserValidator.validateBusinessNumber(businessId)) {
            return CheckResult.FAILURE;
        }
        BusinessUserEntity dbBusinessUser = this.userMapper.selectByBusinessId(businessId);

        return dbBusinessUser == null
                ? CheckResult.SUCCESS
                : CheckResult.FAILURE;
    }


    // 로그인
    public Pair<LoginResult, UserEntity> login(String loginId, String password) {
        if (!UserValidator.validateLoginId(loginId) ||
                !UserValidator.validatePassword(password)) {
            return Pair.of(LoginResult.FAILURE, null);
        }
        UserEntity dbUser = this.userMapper.selectByLoginId(loginId);
        if (dbUser == null) {
            return Pair.of(LoginResult.FAILURE, null);
        }
        if (!BCrypt.checkpw(password, dbUser.getPassword())) {
            return Pair.of(LoginResult.FAILURE, null);
        }
        return Pair.of(LoginResult.SUCCESS, dbUser);
    }


    // 아이디 찾기
    public EmailVerificationResult sendFindIdEmail(String name, String email, EmailVerificationType type) throws MessagingException {
        if (!UserValidator.validateName(name) ||
                !UserValidator.validateEmail(email) ||
                !UserValidator.validateEmailType(type)) {
            return EmailVerificationResult.FAILURE;
        }

        String subject = switch (type) {
            case REGISTER -> "[PetLog] 회원가입 이메일 인증번호";
            case FIND_ID -> "[PetLog] 아이디 찾기 이메일 인증번호";
            case CHANGE_PASSWORD -> "[PetLog] 비밀번호 재설정 이메일 인증번호";
        };
        String code = RandomStringUtils.randomNumeric(6);

        EmailVerificationEntity emailVerification = new EmailVerificationEntity();
        emailVerification.setEmail(email);
        emailVerification.setType(type.name());
        emailVerification.setCode(code);
        emailVerification.setVerified(false);
        emailVerification.setCreatedAt(LocalDateTime.now());
        emailVerification.setExpiresAt(LocalDateTime.now().plusMinutes(5L));

        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null) {
            return EmailVerificationResult.FAILURE;
        }
        if (dbUser.getUserType().equals("PERSONAL")) {
            UserEntity dbPersonalUser = this.userMapper.selectByPersonalNameAndEmail(name, email);
            if (dbPersonalUser == null) {
                return EmailVerificationResult.FAILURE;
            }
        }
        if (dbUser.getUserType().equals("BUSINESS")) {
            UserEntity dbBusinessUser = this.userMapper.selectByBusinessNameAndEmail(name, email);
            if (dbBusinessUser == null) {
                return EmailVerificationResult.FAILURE;
            }
        }

        int insertResult = emailVerificationMapper.insert(emailVerification);
        if (insertResult < 1) {
            return EmailVerificationResult.FAILURE;
        }

        Context context = new Context();
        context.setVariable("type", switch (type) {
            case REGISTER -> "회원가입";
            case FIND_ID -> "아이디 찾기";
            case CHANGE_PASSWORD -> "비밀번호 재설정";
        });
        context.setVariable("code", code);

        String body = templateEngine.process("user/sendEmail", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(message);
        messageHelper.setFrom("msubi0831@gmail.com");
        messageHelper.setTo(email);
        messageHelper.setSubject(subject);
        messageHelper.setText(body, true);
        this.mailSender.send(message);
        return EmailVerificationResult.SUCCESS;
    }

    // 비밀번호 찾기
    public EmailVerificationResult sendFindPasswordEmail(String email, String loginId, EmailVerificationType type) throws MessagingException {
        if (!UserValidator.validateEmail(email) ||
                !UserValidator.validateLoginId(loginId) ||
                !UserValidator.validateEmailType(type)) {
            return EmailVerificationResult.FAILURE;
        }
        String subject = switch (type) {
            case REGISTER -> "[PetLog] 회원가입 이메일 인증번호";
            case FIND_ID -> "[PetLog] 아이디 찾기 이메일 인증번호";
            case CHANGE_PASSWORD -> "[PetLog] 비밀번호 재설정 이메일 인증번호";
        };
        String code = RandomStringUtils.randomNumeric(6);

        EmailVerificationEntity emailVerification = new EmailVerificationEntity();
        emailVerification.setEmail(email);
        emailVerification.setType(type.name());
        emailVerification.setCode(code);
        emailVerification.setVerified(false);
        emailVerification.setCreatedAt(LocalDateTime.now());
        emailVerification.setExpiresAt(LocalDateTime.now().plusMinutes(5L));


        UserEntity dbFindPasswordUser = userMapper.selectByLoginIdAndEmail(loginId, email);
        if (dbFindPasswordUser == null) {
            return EmailVerificationResult.FAILURE;
        }

        int insertResult = emailVerificationMapper.insert(emailVerification);
        if (insertResult < 1) {
            return EmailVerificationResult.FAILURE;
        }


        Context context = new Context();
        context.setVariable("type", switch (type) {
            case REGISTER -> "회원가입";
            case FIND_ID -> "아이디 찾기";
            case CHANGE_PASSWORD -> "비밀번호 재설정";
        });
        context.setVariable("code", code);

        String body = templateEngine.process("user/sendEmail", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(message);
        messageHelper.setFrom("msubi0831@gmail.com");
        messageHelper.setTo(email);
        messageHelper.setSubject(subject);
        messageHelper.setText(body, true);
        this.mailSender.send(message);
        return EmailVerificationResult.SUCCESS;
    }

    public FindPasswordResult changePassword(String loginId, String email, String password) {
        if (!UserValidator.validateLoginId(loginId) ||
                !UserValidator.validateEmail(email) ||
                !UserValidator.validatePassword(password)) {
            return FindPasswordResult.FAILURE;
        }

        UserEntity dbUser = this.userMapper.selectByLoginIdAndEmail(loginId, email);
        if (dbUser == null) {
            return FindPasswordResult.FAILURE;
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(); // BCrypt 암호화(해싱)를 위한 객체
        String hashedPassword = encoder.encode(password); // 비밀번호 암호문("$2a$...")
        int updatePassword = this.userMapper.updatePassword(loginId, email, hashedPassword);

        return updatePassword > 0
                ? FindPasswordResult.SUCCESS
                : FindPasswordResult.FAILURE;
    }





    @Transactional
    public UserEntity loginOrRegisterByKakao(String code) {
        try {
            // 1️⃣ access token 요청
            String tokenUrl = "https://kauth.kakao.com/oauth/token";

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", System.getenv("KAKAO_REST_KEY"));
            params.add("client_secret", System.getenv("KAKAO_CLIENT_SECRET"));
            params.add("redirect_uri", "http://localhost:8080/user/login/kakao/callback");
            params.add("code", code);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            Map<String, Object> tokenResponse = restTemplate.postForObject(tokenUrl, request, Map.class);
            System.out.println("카카오 tokenResponse = " + tokenResponse);

            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                System.out.println("카카오 access_token 없음");
                return null;
            }
            String accessToken = (String) tokenResponse.get("access_token");
            System.out.println("카카오 accessToken = " + accessToken);

            // 2️⃣ 사용자 정보 요청
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> userEntity = new HttpEntity<>(userHeaders);

            ResponseEntity<Map> userResponse = restTemplate.exchange(
                    "https://kapi.kakao.com/v2/user/me",
                    HttpMethod.GET,
                    userEntity,
                    Map.class
            );
            System.out.println("카카오 userResponse body = " + userResponse.getBody());

            if (userResponse.getBody() == null) {
                System.out.println("카카오 userResponse body 없음");
                return null;
            }

            Map<String, Object> kakaoAccount = (Map<String, Object>) userResponse.getBody().get("kakao_account");
            System.out.println("카카오 kakaoAccount = " + kakaoAccount);

            if (kakaoAccount == null || !kakaoAccount.containsKey("email")) {
                System.out.println("카카오 이메일 없음 - 동의항목 확인 필요");
                return null;
            }

            String email = (String) kakaoAccount.get("email");
            System.out.println("카카오 email = " + email);

            if (email == null) {
                System.out.println("카카오 email null");
                return null;
            }

            // 3️⃣ DB 확인
            UserEntity dbUser = userMapper.selectByEmail(email);
            System.out.println("카카오 dbUser = " + dbUser);

            if (dbUser == null) {
                System.out.println("카카오 DB에 해당 이메일 없음");
                return null;
            }

            return dbUser;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }



    // 네이버로그인
    @Transactional
    public UserEntity loginOrRegisterByNaver(String code, String state) {

        try {
            // 1️⃣ access token 요청
            String tokenUrl = "https://nid.naver.com/oauth2.0/token" +
                    "?grant_type=authorization_code" +
                    "&client_id=" + System.getenv("NAVER_CLIENT_ID") +
                    "&client_secret=" + System.getenv("NAVER_CLIENT_SECRET") +
                    "&code=" + code +
                    "&state=" + state;

            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> tokenResponse = restTemplate.getForObject(tokenUrl, Map.class);
            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                return null;
            }
            String accessToken = (String) tokenResponse.get("access_token");

            // 2️⃣ 사용자 정보 요청
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> userResponse = restTemplate.exchange(
                    "https://openapi.naver.com/v1/nid/me",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            if (userResponse.getBody() == null || !userResponse.getBody().containsKey("response")) {
                return null;
            }

            Map<String, Object> naverUser = (Map<String, Object>) userResponse.getBody().get("response");
            String email = (String) naverUser.get("email");
            String name = (String) naverUser.get("name");
            String nickname = (String) naverUser.get("nickname");

            if (email == null) {
                return null; // 이메일 없으면 로그인 불가
            }

            // 3️⃣ DB 확인
            UserEntity dbUser = userMapper.selectByEmail(email);

            if (dbUser == null) {
                return null;
            }

            return dbUser;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }







// 구글 로그인
    @Transactional
    public UserEntity loginOrRegisterByGoogle(String code) {
        try {
            // 1️⃣ access token 요청
            String tokenUrl = "https://oauth2.googleapis.com/token";

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", System.getenv("GOOGLE_CLIENT_ID"));
            params.add("client_secret", System.getenv("GOOGLE_CLIENT_SECRET"));
            params.add("redirect_uri", "http://localhost:8080/user/login/google/callback");
            params.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            Map<String, Object> tokenResponse = restTemplate.postForObject(tokenUrl, request, Map.class);
            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                return null;
            }
            String accessToken = (String) tokenResponse.get("access_token");

            // 2️⃣ 사용자 정보 요청
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> userEntity = new HttpEntity<>(userHeaders);

            ResponseEntity<Map> userResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    HttpMethod.GET,
                    userEntity,
                    Map.class
            );

            if (userResponse.getBody() == null || !userResponse.getBody().containsKey("email")) {
                return null;
            }

            Map<String, Object> googleUser = userResponse.getBody();
            String email = (String) googleUser.get("email");
            String name = (String) googleUser.get("name");
            String nickname = (String) googleUser.get("given_name");

            if (email == null) {
                return null; // 이메일 없으면 로그인 불가
            }

            // 3️⃣ DB 확인
            UserEntity dbUser = userMapper.selectByEmail(email);


            if (dbUser == null) {
                return null;
            }

            return dbUser;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
