package dev.dhkim.petlog.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SessionUser {
    private Integer userId;
    private String userType;
}
