package dev.dhkim.petlog.entities.user;

import lombok.*;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "verificationId")
public class EmailVerificationEntity {
    private int verificationId;
    private Integer userId;
    private String type;
    private String email;
    private String code;
    private boolean isVerified;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
