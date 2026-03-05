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


        // 2. 세션 체크를 최상단으로 이동
        if (sessionUser == null) {
            // 테스트 중이라면 임시 ID 부여, 아니라면 에러 리턴
            // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");

            // [테스트용] 로그인 없이 테스트하려면 아래 주석을 해제하세요.
            reservation.setUserId(9999); //
        } else {
            reservation.setUserId(sessionUser.getUserId());
        }

        try {
            // 3. 서비스 호출 (이제 여기서 storeId가 null이면 store 테이블에 저장함)
            reservationService.createReservation(reservation);
            return ResponseEntity.ok("예약이 완료되었습니다!");
        } catch (Exception e) {
            e.printStackTrace(); // 서버 콘솔에 에러 상세 내용 출력
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("오류 발생: " + e.getMessage());
        }
    }
}
