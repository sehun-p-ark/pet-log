package dev.dhkim.petlog.entities.main;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ReservationEntity {
    private Integer reservationId;
    private Integer userId;
    private Integer storeId;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reservationDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime reservationTime;

    private String request;
    private String paymentMethod;
    private boolean canceled;
}
