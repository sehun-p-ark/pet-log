package dev.dhkim.petlog.mappers.user;

import dev.dhkim.petlog.entities.user.EmailVerificationEntity;
import dev.dhkim.petlog.enums.user.EmailVerificationType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EmailVerificationMapper {
    int insert(EmailVerificationEntity emailVerification);

    EmailVerificationEntity select(@Param(value = "email") String email,
                                   @Param(value = "code") String code,
                                   @Param(value = "type")EmailVerificationType type);
    int update(@Param(value = "emailVerification") EmailVerificationEntity emailVerification);
}
