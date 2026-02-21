package dev.dhkim.petlog.dto.main;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FriendDto {
    //친구 리스트를 위한..? 이게 뭐엿더라 ..
    private int id;
    private String nickname;
    private String species;
    private double latitude;
    private double longitude;
    private double distance;

    // 생성자, getter/setter
}
