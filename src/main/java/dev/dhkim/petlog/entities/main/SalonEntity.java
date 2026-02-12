
package dev.dhkim.petlog.entities.main;

import lombok.*;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@EqualsAndHashCode(of = "id")
public class SalonEntity {

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

