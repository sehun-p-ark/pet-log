package dev.dhkim.petlog.services.user;

import dev.dhkim.petlog.dto.user.RegisterDto;
import dev.dhkim.petlog.entities.user.BusinessUserEntity;
import dev.dhkim.petlog.entities.user.EmailVerificationEntity;
import dev.dhkim.petlog.entities.user.PersonalUserEntity;
import dev.dhkim.petlog.entities.user.UserEntity;
import dev.dhkim.petlog.enums.user.EmailVerificationType;
import dev.dhkim.petlog.mappers.user.EmailVerificationMapper;
import dev.dhkim.petlog.mappers.user.UserMapper;
import dev.dhkim.petlog.results.*;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.apache.commons.lang3.RandomStringUtils;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class
UserService {
    private final UserMapper userMapper;
    private final EmailVerificationMapper emailVerificationMapper;
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;


    @Transactional
    public RegisterResult register(RegisterDto dto) {
        userMapper.insertUser(dto);
        int userId = dto.getId();

        if (dto.getUserType().equals("personal")) {
            userMapper.insertPersonalUser(userId, dto);

            for (int i = 0; i < dto.getPets().size(); i++) {
                boolean isPrimary = (i == 0);
                userMapper.insertPet(userId, dto.getPets().get(i), isPrimary);
            }
        }
        if (dto.getUserType().equals("business")) {
            userMapper.insertBusinessUser(userId, dto);
            userMapper.insertStore(userId, dto.getStore());
        }

        userMapper.insertAddress(userId, dto.getAddress(), true);
        for (Integer termId : dto.getTermsIds()) {
            userMapper.insertTerm(userId, termId);
        }
        return RegisterResult.SUCCESS;
    }


    public EmailVerificationResult sendEmail(String email, EmailVerificationType type) throws MessagingException {
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


        int insertResult = emailVerificationMapper.insert(emailVerification);
        if (insertResult < 1) {
            return EmailVerificationResult.FAILURE;
        }

        UserEntity dbRegisterEmail = userMapper.selectByEmail(email);
        if (dbRegisterEmail != null) {
            return EmailVerificationResult.FAILURE_DUPLICATE;
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

        UserEntity dbUser = this.userMapper.selectByLoginId(loginId);
        return dbUser == null
                ? CheckResult.SUCCESS
                : CheckResult.FAILURE;
    }

    public CheckResult checkPhone(String phone) {
        UserEntity dbUser = this.userMapper.selectByPhone(phone);
        return dbUser == null
                ? CheckResult.SUCCESS
                : CheckResult.FAILURE;
    }

    public CheckResult checkNickname(String nickname) {

        PersonalUserEntity dbUser = this.userMapper.selectByNickname(nickname);

        return dbUser == null
                ? CheckResult.SUCCESS
                : CheckResult.FAILURE;
    }

    public CheckResult checkBusinessId(String businessId) {
        BusinessUserEntity dbBusinessUser = this.userMapper.selectByBusinessId(businessId);

        return dbBusinessUser == null
                ? CheckResult.SUCCESS
                : CheckResult.FAILURE;
    }



    // 로그인
    public Pair<LoginResult, UserEntity> login(String loginId, String password){
        UserEntity dbUser = this.userMapper.selectByLoginId(loginId);
        if (dbUser == null) {
            return Pair.of(LoginResult.FAILURE, null);
        }
        if (!password.equals(dbUser.getPassword())) {
            return Pair.of(LoginResult.FAILURE, null);
        }
        return Pair.of(LoginResult.SUCCESS, dbUser);
    }


    // 아이디 찾기
    public EmailVerificationResult sendFindIdEmail(String name, String email, EmailVerificationType type) throws MessagingException {

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
        if (dbUser.getUserType().equals("personal")) {
            UserEntity dbPersonalUser = this.userMapper.selectByPersonalNameAndEmail(name, email);

            if (dbPersonalUser == null) {
                return EmailVerificationResult.FAILURE;
            }
        }
        if (dbUser.getUserType().equals("business")) {
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

        UserEntity dbUser = this.userMapper.selectByLoginIdAndEmail(loginId, email);
        if (dbUser == null) {
            return FindPasswordResult.FAILURE;
        }

        if (dbUser.getPassword().equals(password)) {
            return FindPasswordResult.FAILURE_IS_USED;
        }

        int updatePassword = this.userMapper.updatePassword(loginId, email, password);

        return updatePassword > 0
                ? FindPasswordResult.SUCCESS
                : FindPasswordResult.FAILURE;
    }
}
