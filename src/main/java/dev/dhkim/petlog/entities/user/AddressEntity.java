package dev.dhkim.petlog.entities.user;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "addressId")
public class AddressEntity {
    private int addressId;
    private int userId;
    private String addressType;
    private String postalCode;
    private String addressPrimary;
    private String addressSecondary;
    private Double lat;
    private Double lng;
    private boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
