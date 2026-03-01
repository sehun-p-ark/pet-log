package dev.dhkim.petlog.utils.feed;

import org.springframework.stereotype.Component;

@Component
public class AddressUtil {
    private static final String[] SUFFIXES = {
            "특별자치도",
            "특별자치시",
            "특별시",
            "광역시",
            "도",
    };

    public String extractCity(String address) {
        if (address == null || address.isBlank()) return "";

        String first = address.trim().split(" ")[0];

        for (String suffix : SUFFIXES) {
            if (first.endsWith(suffix)) {
                return first.substring(0, first.length() - suffix.length());
            }
        }

        return first;
    }
}
