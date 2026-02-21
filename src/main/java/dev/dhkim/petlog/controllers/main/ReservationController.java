package dev.dhkim.petlog.controllers.main;

import dev.dhkim.petlog.dto.main.ReservationDto;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.main.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reservation")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/create")
    public ResponseEntity<?> createReservation(
            @RequestBody ReservationDto reservation,
            @SessionAttribute(value = "sessionUser", required = false) SessionUser sessionUser
    ) {
        System.out.println(sessionUser);
        System.out.println(sessionUser.getUserId());
        System.out.println(reservation);
        System.out.println(reservation.getUserId());

        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        reservation.setUserId(sessionUser.getUserId());

        try {
            reservationService.createReservation(reservation);
            return ResponseEntity.ok("예약이 완료되었습니다!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
