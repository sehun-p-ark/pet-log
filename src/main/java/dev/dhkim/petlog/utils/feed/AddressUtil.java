package dev.dhkim.petlog.utils.feed;

import org.springframework.stereotype.Component;

@Component
public class AddressUtil {

    public String extractCity (String  address) {
        if (address == null || address.isBlank())
            return "";

        String[] parts = address.trim().split(" ");
        if (parts.length == 0) return "";

        String first = parts[0];
        String second = parts.length > 1 ? parts[1] : "";

        if (first.endsWith("특별시") || first.endsWith("광역시") || first.endsWith("특별자치도")) {
            return first.replace("특별시","")
                    .replace("광역시","")
                    .replace("특별자치도","")
                    .replace("시","");
        }

        if (first.endsWith("도")) {
            return second.replace("시","")
                    .replace("군","")
                    .replace("구","");
        }

        return first.replace("특별자치시","")
                .replace("군","")
                .replace("구","");
    }
}
