package dev.dhkim.petlog.services.main;

import dev.dhkim.petlog.dto.main.ReservationDto;
import dev.dhkim.petlog.entities.user.StoreEntity;
import dev.dhkim.petlog.mappers.main.ReservationMapper;
import dev.dhkim.petlog.mappers.main.StoreMapper; // StoreMapper 임포트
import dev.dhkim.petlog.entities.user.StoreEntity; // StoreEntity 임포트 (패키지 경로 확인 필요)
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationMapper reservationMapper;
    private final StoreMapper storeMapper; // 추가

    // 시스템 관리자 ID (아까 DB에 9999번으로 만들기로 한 계정)
    private static final int SYSTEM_ADMIN_ID = 9999;

    @Transactional
    public ReservationDto createReservation(ReservationDto reservation) {
        // [DEBUG 3] 프론트에서 넘어온 DTO 값 확인
        System.out.println("🚀 [DEBUG 3] 서버 수신 DTO: " + reservation.toString());


        if (reservation.getStoreId() == null) {
            System.out.println("💡 [DEBUG 4] storeId가 null임 -> 신규 등록 로직 진입");
           //store_id 가 등록 되어있는지 확인(api 데이터인지 직접 등록한 데이터 인지 확인)
            Integer existingStoreId = storeMapper.findIdByAddressAndName(
                    reservation.getAddress(),
                    reservation.getPlaceName()
            );

            if (existingStoreId != null) {
                System.out.println("💡 [DEBUG 5] 이미 존재하는 장소 발견 ID: " + existingStoreId);
                reservation.setStoreId(existingStoreId);
            } else {
                System.out.println("💡 [DEBUG 5] 새로운 장소 등록 시작");
                StoreEntity newStore = new StoreEntity();
                newStore.setStoreName(reservation.getPlaceName());
                newStore.setAddressPrimary(reservation.getAddress());
                newStore.setCategory(reservation.getCategory());
                newStore.setUserId(9999);

                storeMapper.insertApiStore(newStore);

                // [DEBUG 6] MyBatis가 ID를 제대로 채워줬는지 확인
                System.out.println(" [DEBUG 6] DB 저장 후 생성된 storeId: " + newStore.getStoreId());

                reservation.setStoreId(newStore.getStoreId());
                System.out.println(" [DEBUG 7] 예약 객체에 최종 세팅된 ID: " + reservation.getStoreId());
            }
        }

        // 최종 예약 저장
        reservationMapper.insertReservation(reservation);
        return reservation;
    }
}