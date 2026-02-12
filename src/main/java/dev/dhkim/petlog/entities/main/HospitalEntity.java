package dev.dhkim.petlog.entities.main;

import jakarta.persistence.*;
import lombok.*;
//db에 직접 저장되는 용도
@AllArgsConstructor
@NoArgsConstructor
@Builder //많은 필드를 가진 객체 순서 실수 없이, 필요한 값만 골라서 생성하게 해주는 패턴-> 호출 순서 상관 없음
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class HospitalEntity {

    private int id; // jpa 에서 이게 기본키라는 걸 알려주는 어노테이션
    private String manageNo;
    private String zipCode;
    private String name;
    private String address;
    private String phone;
    private String status;
    private Double lat;
    private Double lng;
    private Double crdX;
    private Double crdY;
}
