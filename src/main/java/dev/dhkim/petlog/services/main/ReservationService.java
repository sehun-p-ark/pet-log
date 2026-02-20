package dev.dhkim.petlog.services.main;

import dev.dhkim.petlog.dto.main.ReservationDto;
import dev.dhkim.petlog.mappers.main.ReservationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationMapper reservationMapper;

    public ReservationDto createReservation(ReservationDto reservation) {
        // 1. 날짜 검증
        LocalDate today = LocalDate.now();
        if (reservation.getReservationDate().isBefore(today)) {
            throw new IllegalArgumentException("예약 날짜는 오늘 이후여야 합니다.");
        }


        // 2. insert
        System.out.println("[DEBUG] ReservationDto before insert: " + reservation);
        reservationMapper.insertReservation(reservation);
        System.out.println("[DEBUG] ReservationDto after insert: " + reservation);

        return reservation;
    }
}
