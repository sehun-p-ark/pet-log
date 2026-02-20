package dev.dhkim.petlog.dto.main;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FriendDto {
    private int id;
    private String nickname;
    private String species;
    private double latitude;
    private double longitude;
    private double distance;

    // 생성자, getter/setter
}
