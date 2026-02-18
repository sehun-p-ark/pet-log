package dev.dhkim.petlog.dto.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDto {
    private int userId;
    private String nickname;
    private String profileImageUrl;
    private int feedCount;
    private String followingCount;
    private String followedCount;
    private boolean isMine;
    private boolean isFollowing;
}
