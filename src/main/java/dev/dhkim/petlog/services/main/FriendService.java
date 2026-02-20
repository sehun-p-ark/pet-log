package dev.dhkim.petlog.services.main;

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

    /** 내 펫 리스트 조회 */
    public List<PetDto> getFriendPets(Integer userId) {
        if (userId == null) return List.of();
        return friendMapper.selectFriendsByUserId(userId);
    }

    /** 내 위치 기준 1.5km 반경 친구 조회 */
    public List<PetDto> getNearbyFriends(Integer userId, double myLat, double myLng) {
        if (userId == null) return List.of();

        // 다른 회원들의 lat/lng 없으면 채움
        ensureAllOtherUsersHaveLatLng(userId);

        return friendMapper.selectNearbyFriends(userId, myLat, myLng);
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
            newAddress.setDefault(true);

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

    /** 다른 회원들의 lat/lng 없으면 채우기 */
    private void ensureAllOtherUsersHaveLatLng(Integer currentUserId) {
        List<AddressEntity> addresses = friendMapper.selectAllOtherUsersAddresses(currentUserId);
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
