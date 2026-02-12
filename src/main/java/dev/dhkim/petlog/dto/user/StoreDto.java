package dev.dhkim.petlog.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StoreDto {
    private String storeName;
    private String postalCode;
    private String addressPrimary;
    private String addressSecondary;
    private String category;
    private LocalDateTime createdAt;
}
