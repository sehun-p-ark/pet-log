package dev.dhkim.petlog.services.main;

import dev.dhkim.petlog.dto.main.FriendListDto;
import dev.dhkim.petlog.dto.user.PetDto;
import dev.dhkim.petlog.entities.user.AddressEntity;
import dev.dhkim.petlog.mappers.main.FriendMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendMapper friendMapper;
    private final KakaoGeoCodingService kakaoGeoCodingService;

    //** 내 펫 리스트(친구인 사람만 팔로우 ?) 조회 *//*
    public List<PetDto> getFriendPets(Integer userId) {
        if (userId == null) return List.of();
        return friendMapper.selectFriendsByUserId(userId);
    }

    public List<FriendListDto> getNearbyFriends(Integer userId, double myLat, double myLng) {
        System.out.println("==== [DEBUG] 주변 친구 찾기 시작 ====");
        System.out.println("1. 입력 파라미터 - userId: " + userId + ", lat: " + myLat + ", lng: " + myLng);

        if (userId == null) {
            System.out.println("⚠️ [FAIL] userId가 null입니다.");
            return List.of();
        }

        // 2. 좌표 보정 로직
        if (myLat == 0.0 || myLng == 0.0) {
            System.out.println("🔍 [INFO] 좌표가 0입니다. DB에서 내 기본 주소를 조회합니다.");
            // address 테이블에서 유저의 기본 좌표를 가져오는 가상의 메서드
            AddressEntity myAddr = friendMapper.findDefaultByUserId(userId);
            if (myAddr != null) {
                myLat = myAddr.getLat();
                myLng = myAddr.getLng();
                System.out.println("✅ [SUCCESS] DB 좌표 적용: " + myLat + ", " + myLng);
            } else {
                System.out.println("❌ [FAIL] DB에도 내 주소 정보가 없습니다.");
                return List.of();
            }
        }

        double radiusKm = 2;
        System.out.println("3. 검색 반경: " + radiusKm + "km");

        // 4. API 좌표 갱신 (오래 걸릴 수 있으므로 로그 출력)
        System.out.println("4. 타 유저 좌표 확인 및 갱신 시작...");
        ensureAllOtherUsersHaveLatLng(userId);
        System.out.println("✅ 좌표 갱신 완료");

        // 5. 최종 쿼리 실행 전 체크
        System.out.println("5. SQL 쿼리 실행 직전...");
        List<FriendListDto> result = friendMapper.selectNearbyUsers(userId, myLat, myLng, radiusKm);

        if (result == null || result.isEmpty()) {
            System.out.println("⚠️ [RESULT] 쿼리 결과가 0건입니다. (반경 내 유저 없음 혹은 쿼리 조건 불일치)");
        } else {
            System.out.println("🎉 [RESULT] 조회 성공! 데이터 수: " + result.size() + "건");
            result.forEach(f -> System.out.println("   - 이름: " + f.getNickname() + ", 거리: " + f.getDistance() + "km"));
        }
        System.out.println("==== [DEBUG] 주변 친구 찾기 종료 ====");

        return result;
    }
    /** 내 기본 주소 조회 후 위도/경도 없으면 API로 채움 */
    public AddressEntity getOrCreateAddressWithLatLng(Integer userId) {
        if (userId == null) return null;

        AddressEntity address = friendMapper.findDefaultByUserId(userId);

        if (address == null) {
            // 기본 주소 없으면 테스트용 빈 주소 생성
            AddressEntity newAddress = new AddressEntity();
            newAddress.setUserId(userId);
            newAddress.setAddressPrimary("기본 주소 입력 필요");
            newAddress.setAddressSecondary("");
            newAddress.setLat(0.0);
            newAddress.setLng(0.0);

            friendMapper.insertAddress(newAddress);
            return newAddress;
        }

        // 내 좌표 없으면 Kakao API로 채움
        if (address.getLat() == null || address.getLng() == null || address.getLat() == 0.0 || address.getLng() == 0.0) {
            String query = address.getAddressPrimary(); // 내 주소는 primary만
            double[] latLng = kakaoGeoCodingService.getLatLng(query);

            System.out.println("[DEBUG] Kakao API 내 주소: " + query);
            System.out.println("[DEBUG] Kakao API 결과: lat=" + latLng[0] + ", lng=" + latLng[1]);

            address.setLat(latLng[0]);
            address.setLng(latLng[1]);

            friendMapper.updateAddressLatLng(address.getAddressId(), latLng[0], latLng[1]);
        }

        return address;
    }

    /** 다른 회원들의 lat/lng 없으면 채우기 다른 사용자들 중,type = map 주소만*/
    private void ensureAllOtherUsersHaveLatLng(Integer currentUserId) {
        List<AddressEntity> addresses = friendMapper.selectAllOtherUsersMapAddresses(currentUserId);
        for (AddressEntity addr : addresses) {
            if (addr.getLat() == null || addr.getLng() == null || addr.getLat() == 0.0 || addr.getLng() == 0.0) {
                // primary + secondary 합쳐서 보내면 더 정확
                String query = addr.getAddressPrimary();
                if (addr.getAddressSecondary() != null && !addr.getAddressSecondary().isBlank()) {
                    query += " " + addr.getAddressSecondary();
                }

                double[] latLng = kakaoGeoCodingService.getLatLng(query);

                System.out.println("[DEBUG] Kakao API 다른 회원 주소: " + query);
                System.out.println("[DEBUG] Kakao API 결과: lat=" + latLng[0] + ", lng=" + latLng[1]);

                addr.setLat(latLng[0]);
                addr.setLng(latLng[1]);

                // DB에 반영
                friendMapper.updateAddressLatLng(addr.getAddressId(), latLng[0], latLng[1]);
            }
        }
    }
}
