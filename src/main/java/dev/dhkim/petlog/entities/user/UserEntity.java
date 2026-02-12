package dev.dhkim.petlog.entities.user;

import lombok.*;

import java.time.LocalDateTime;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class UserEntity {
    private int id;
    private String email;
    private String loginId;
    private String password;
    private String phone;
    private String userType;
    private int shopPoint;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
