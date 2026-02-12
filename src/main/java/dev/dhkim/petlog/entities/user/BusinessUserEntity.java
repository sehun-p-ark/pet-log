package dev.dhkim.petlog.entities.user;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "userId")
public class BusinessUserEntity {
    private int userId;
    private String companyName;
    private String representativeName;
    private String businessNumber;
}
