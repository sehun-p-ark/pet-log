package dev.dhkim.petlog.dto.main;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class FriendListDto {
    // 1. personel_user 테이블
    private Integer userId;
    private String nickname;
    // 이건 펫테이블의 사진임
    private String imageUrl;

    // 2. address 테이블 (계산 결과)
    private double distance;    // 위도, 경도로 계산된 값

    // 3. pets 테이블 (대표 펫 1마리 정보) description
    private String species;
    private String petName;
    private String gender;
    private String birthDate;
    private String introduction;

    // 4. 추가 상태 (로그인 유저와의 관계)
    private boolean isFollowing;
}