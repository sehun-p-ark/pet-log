package dev.dhkim.petlog.entities.user;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "agreementId")
public class UserTermsAgreementEntity {
    private int agreementId;
    private int userId;
    private int termsId;
    private boolean agreed;
    private LocalDateTime agreedAt;
}
