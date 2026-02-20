package dev.dhkim.petlog.dto.main;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ReservationDto {
    private Integer reservationId;   // auto_increment
    private Integer userId;          // NOT NULL
    private Integer storeId;         // NULL 가능
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private String requestText;
    private String paymentMethod = "OFFLINE"; // 기본값
}
