package dev.dhkim.petlog.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddressDto {
    private String addressType;
    private String postalCode;
    private String addressPrimary;
    private String addressSecondary;
    private boolean isDefault;
    private Double lat;
    private Double lng;
}
