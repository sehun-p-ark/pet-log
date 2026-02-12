package dev.dhkim.petlog.entities.user;

import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "storeId")
public class StoreEntity {
    private int storeId;
    private int userId;
    private String storeName;
    private String postalCode;
    private String addressPrimary;
    private String addressSecondary;
    private String category;
    private String phone;
    private LocalDateTime createdAt;
}
