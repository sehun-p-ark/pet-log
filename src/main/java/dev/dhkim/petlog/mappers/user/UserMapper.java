package dev.dhkim.petlog.mappers.user;

import dev.dhkim.petlog.dto.user.AddressDto;
import dev.dhkim.petlog.dto.user.PetDto;
import dev.dhkim.petlog.dto.user.RegisterDto;
import dev.dhkim.petlog.dto.user.StoreDto;
import dev.dhkim.petlog.entities.user.BusinessUserEntity;
import dev.dhkim.petlog.entities.user.PersonalUserEntity;
import dev.dhkim.petlog.entities.user.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {

    void insertUser(RegisterDto dto);

    void insertPersonalUser(@Param(value = "userId") int userId,
                            @Param(value = "dto") RegisterDto dto);

    void insertBusinessUser(@Param(value = "userId") int userId,
                            @Param(value = "dto") RegisterDto dto);

    void insertPet(@Param(value = "userId") int userId,
                   @Param(value = "pet") PetDto pet,
                   @Param(value = "isPrimary") boolean isPrimary);

    void insertAddress(@Param(value = "userId") int userId,
                       @Param(value = "address") AddressDto address,
                       @Param(value = "isDefault") boolean isDefault);

    void insertStore(@Param(value = "userId") int userId,
                     @Param(value = "store") StoreDto store);

    void insertTerm(@Param(value = "userId") int userId,
                    @Param(value = "termsId") int termsId);


    PersonalUserEntity selectByNickname(@Param(value = "nickname") String nickname);

    UserEntity selectByLoginId(@Param(value = "loginId") String loginId);

    UserEntity selectByEmail(@Param(value = "email") String email);

    UserEntity selectByPhone(@Param(value = "phone") String phone);

    BusinessUserEntity selectByBusinessId(@Param(value = "businessId") String businessId);

    // 아이디찾기
    UserEntity selectByPersonalNameAndEmail(@Param(value = "name") String name,
                                            @Param(value = "email") String email);

    PersonalUserEntity selectByPersonalUserId(@Param(value = "userId") int userId);

    BusinessUserEntity selectByBusinessUserId(@Param(value = "userId") int userId);

    UserEntity selectByBusinessNameAndEmail(@Param(value = "name") String name,
                                            @Param(value = "email") String email);

    // 비밀번호 찾기
    UserEntity selectByLoginIdAndEmail(@Param(value = "loginId") String loginId,
                                       @Param(value = "email") String email);

    int updatePassword(@Param(value = "loginId") String loginId,
                       @Param(value = "email") String email, @Param(value = "password") String password);

}
