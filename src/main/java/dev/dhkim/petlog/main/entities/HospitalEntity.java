package dev.dhkim.petlog.main.entities;

import jakarta.persistence.*;
import lombok.*;
//db에 직접 저장되는 용도
@Entity
@Table(name = "hospital")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "manage_no", unique = true)
    private String manageNo;

    @Column(name = "zip_code")
    private String zipCode;

    private String name;
    private String address;
    private String phone;
    private String status;
    private Double lat;
    private Double lng;

    // 공공데이터 CRD_INFO_X/Y
    @Column(name = "crd_x")
    private double crdX;

    @Column(name = "crd_y")
    private double crdY;
}
