package dev.dhkim.petlog.entities.user;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "termsId")
public class TermsEntity {
    private int termsId;
    private String title;
    private String termsType;
    private String userTarget;
    private boolean isRequired;
}
