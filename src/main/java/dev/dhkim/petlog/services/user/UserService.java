package dev.dhkim.petlog.services.user;

import ch.qos.logback.core.spi.FilterAttachableImpl;
import dev.dhkim.petlog.dto.user.PetDto;
import dev.dhkim.petlog.dto.user.RegisterDto;
import dev.dhkim.petlog.entities.user.BusinessUserEntity;
import dev.dhkim.petlog.entities.user.EmailVerificationEntity;
import dev.dhkim.petlog.entities.user.PersonalUserEntity;
import dev.dhkim.petlog.entities.user.UserEntity;
import dev.dhkim.petlog.enums.user.EmailVerificationType;
import dev.dhkim.petlog.mappers.user.EmailVerificationMapper;
import dev.dhkim.petlog.mappers.user.UserMapper;
import dev.dhkim.petlog.results.*;
import dev.dhkim.petlog.validators.UserValidator;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.ibatis.annotations.Param;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.apache.commons.lang3.RandomStringUtils;

import java.time.LocalDateTime;

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


    @Transactional
    public RegisterResult register(RegisterDto dto) {
        if (!UserValidator.validateCommon(dto)) {
            return RegisterResult.FAILURE;
        }
        if (dto.getUserType().equals(PERSONAL)) {
            if (!UserValidator.validatePersonal(dto)) {
                return RegisterResult.FAILURE;
            }
            if (dto.getPets() != null && !dto.getPets().isEmpty()) {
                for (PetDto pet : dto.getPets()) {
                    if (!UserValidator.validatePet(pet)) {
                        return RegisterResult.FAILURE;
                    }
                }
            }
        }
        if (dto.getUserType().equals(BUSINESS)) {
            if (!UserValidator.validateBusiness(dto)) {
                return RegisterResult.FAILURE;
            }
            if (dto.getStore() != null && !UserValidator.validateStore(dto.getStore())) {
                return RegisterResult.FAILURE;
            }
        }
        if (!UserValidator.validateAddress(dto.getAddress())) {
            return RegisterResult.FAILURE;
        }
        if (dto.getTermsIds() == null) {
            return RegisterResult.FAILURE;
        }
        EmailVerificationEntity dbEmail = emailVerificationMapper.selectByEmail(dto.getEmail());
        if (dbEmail == null) {
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
            if (dto.getStore() != null) {
                int dbStoreInsert = userMapper.insertStore(userId, dto.getStore());
                if (dbStoreInsert < 1) {
                    return RegisterResult.FAILURE;
                }
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

        if (BCrypt.checkpw(password, dbUser.getPassword())) {
            return FindPasswordResult.FAILURE_IS_USED;
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(); // BCrypt 암호화(해싱)를 위한 객체
        String hashedPassword = encoder.encode(password); // 비밀번호 암호문("$2a$...")
        int updatePassword = this.userMapper.updatePassword(loginId, email, hashedPassword);

        return updatePassword > 0
                ? FindPasswordResult.SUCCESS
                : FindPasswordResult.FAILURE;
    }
}
