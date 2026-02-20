package dev.dhkim.petlog.dto.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PetDto {
    private String name;
    private String species;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
    private String gender;
    private BigDecimal weight;
    private String bodyType;
    private String imageUrl;
    private LocalDateTime createdAt;
    private String introduction;
    /*목표 유저, 즉 버튼 클릭 시 “팔로우 대상”의 ID를 저장하는 필드*/
    private Integer userId;
}
