package dev.dhkim.petlog.services.main;

import dev.dhkim.petlog.dto.main.FriendListDto;
import dev.dhkim.petlog.dto.user.PetDto;
import dev.dhkim.petlog.entities.user.AddressEntity;
import dev.dhkim.petlog.mappers.main.FollowMapper;
import dev.dhkim.petlog.mappers.main.AddressMapper;
import dev.dhkim.petlog.mappers.main.FriendMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendMapper friendMapper;
    private final AddressMapper addressMapper;
    private final KakaoGeoCodingService kakaoGeoCodingService;
    private final FollowMapper followMapper;

    //** 내 펫 리스트(친구인 사람만 팔로우 ?) 조회 *//*
    public List<PetDto> getFriendPets(Integer userId) {
        if (userId == null) return List.of();
        return friendMapper.selectFriendsByUserId(userId);
    }

    public List<FriendListDto> getNearbyFriends(Integer userId, double myLat, double myLng) {

        if (userId == null) {
            System.out.println("⚠️ [FAIL] userId가 null입니다.");
            return List.of();
        }

        // 2. 좌표 보정 로직
        if (myLat == 0.0 || myLng == 0.0) {

            // address 테이블에서 유저의 기본 좌표를 가져오는 가상의 메서드
            AddressEntity myAddr = addressMapper.findDefaultByUserId(userId);
            if (myAddr != null) {
                myLat = myAddr.getLat();
                myLng = myAddr.getLng();

            } else {

                return List.of();
            }
        }

        double radiusKm = 2;

        // 4. API 좌표 갱신 (오래 걸릴 수 있으므로 로그 출력)
        ensureAllOtherUsersHaveLatLng(userId);

        // 5. 최종 쿼리 실행 전 체크
        List<FriendListDto> result = friendMapper.selectNearbyUsers(userId, myLat, myLng, radiusKm);

        if (result == null || result.isEmpty()) {

        } else {
            result.forEach(f -> System.out.println("   - 이름: " + f.getNickname() + ", 거리: " + f.getDistance() + "km"));
            result.forEach(f -> {
               boolean isFollowing = followMapper.existsFollow(userId, f.getUserId()) > 0;
               f.setFollowing(isFollowing);
            });
        }

        return result;
    }
    /** 내 기본 주소 조회 후 위도/경도 없으면 API로 채움 */
    public AddressEntity getOrCreateAddressWithLatLng(Integer userId) {
        if (userId == null) return null;

        AddressEntity address = addressMapper.findDefaultByUserId(userId);

        if (address == null) {
            // 기본 주소 없으면 테스트용 빈 주소 생성
            AddressEntity newAddress = new AddressEntity();
            newAddress.setUserId(userId);
            newAddress.setAddressPrimary("기본 주소 입력 필요");
            newAddress.setAddressSecondary("");
            newAddress.setLat(0.0);
            newAddress.setLng(0.0);

            addressMapper.insertAddress(newAddress);
            return newAddress;
        }

        // 내 좌표 없으면 Kakao API로 채움
        if (address.getLat() == null || address.getLng() == null || address.getLat() == 0.0 || address.getLng() == 0.0) {
            String query = address.getAddressPrimary(); // 내 주소는 primary만
            double[] latLng = kakaoGeoCodingService.getLatLng(query);

            address.setLat(latLng[0]);
            address.setLng(latLng[1]);

            addressMapper.updateAddressLatLng(address.getAddressId(), latLng[0], latLng[1]);
        }

        return address;
    }

    /** 다른 회원들의 lat/lng 없으면 채우기 다른 사용자들 중,type = map 주소만*/
    private void ensureAllOtherUsersHaveLatLng(Integer currentUserId) {
        List<AddressEntity> addresses = addressMapper.selectAllOtherUsersMapAddresses(currentUserId);
        for (AddressEntity addr : addresses) {
            if (addr.getLat() == null || addr.getLng() == null || addr.getLat() == 0.0 || addr.getLng() == 0.0) {
                // primary + secondary 합쳐서 보내면 더 정확
                String query = addr.getAddressPrimary();
                if (addr.getAddressSecondary() != null && !addr.getAddressSecondary().isBlank()) {
                    query += " " + addr.getAddressSecondary();
                }

                double[] latLng = kakaoGeoCodingService.getLatLng(query);

                addr.setLat(latLng[0]);
                addr.setLng(latLng[1]);

                // DB에 반영
                addressMapper.updateAddressLatLng(addr.getAddressId(), latLng[0], latLng[1]);
            }
        }
    }
}
