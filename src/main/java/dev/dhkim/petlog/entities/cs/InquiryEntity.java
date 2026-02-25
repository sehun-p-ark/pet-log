package dev.dhkim.petlog.entities.cs;

import dev.dhkim.petlog.enums.cs.InquiryStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class InquiryEntity {

        private Integer id;
        private Integer userId;
        private String title;
        private String content;
        private String answer;
        private InquiryStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime answeredAt;

}
