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

        if (reservation.getStoreId() == null) {
           //store_id 가 등록 되어있는지 확인(api 데이터인지 직접 등록한 데이터 인지 확인)
            Integer existingStoreId = storeMapper.findIdByAddressAndName(
                    reservation.getAddress(),
                    reservation.getPlaceName()
            );

            if (existingStoreId != null) {
                reservation.setStoreId(existingStoreId);
            } else {
                StoreEntity newStore = new StoreEntity();
                newStore.setStoreName(reservation.getPlaceName());
                newStore.setAddressPrimary(reservation.getAddress());
                newStore.setCategory(reservation.getCategory());
                newStore.setUserId(SYSTEM_ADMIN_ID);

                storeMapper.insertApiStore(newStore);

                reservation.setStoreId(newStore.getStoreId());

            }
        }

        // 최종 예약 저장
        reservationMapper.insertReservation(reservation);
        return reservation;
    }
}