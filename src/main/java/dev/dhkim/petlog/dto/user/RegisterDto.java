package dev.dhkim.petlog.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RegisterDto {
    // 공통정보
    private int id;
    private String userType; // personal | business

    // 로그인정보
    private String email;
    private String loginId;
    private String password;
    private String phone;

    // 약관정보
    private List<Integer> termsIds;

    // 개인회원
    private String name;
    private String nickname;

    // 사업자회원
    private String companyName;
    private String representativeName;
    private String businessNumber;

    // 주소
    private AddressDto address;

    // 펫
    private List<PetDto> pets;

    // 가게
    private StoreDto store;
}
