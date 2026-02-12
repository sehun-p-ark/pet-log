package dev.dhkim.petlog.entities.user;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "petId")
public class PetEntity {
    private int petId;
    private int userId;
    private String name;
    private String species;
    private LocalDate birthDate;
    private String introduction;
    private String gender;
    private double weight;
    private String bodyType;
    private String imageUrl;
    private boolean isPrimary;
    private LocalDateTime createdAt;
}
