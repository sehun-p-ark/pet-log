package dev.dhkim.petlog.services.feed;

import dev.dhkim.petlog.enums.feed.Source;
import dev.dhkim.petlog.dto.feed.AnimalApiResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnimalImageService {
    @Value("${animal.dog-api-key}")
    private String dogApiKey;

    @Value("${animal.cat-api-key}")
    private String catApiKey;

    private final RestTemplate restTemplate;

    public List<String> getRandomImages(Source source, int count) {
        String url;
        String apiKey;

        if (source == Source.DOG_API) {
            url = "https://api.thedogapi.com/v1/images/search?limit=" + count;
            apiKey = dogApiKey;
        } else {
            url = "https://api.thecatapi.com/v1/images/search?limit=" + count;
            apiKey = catApiKey;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", apiKey);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<AnimalApiResponseDto[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                AnimalApiResponseDto[].class
        );

        List<String> result = new ArrayList<>();

        if (response.getBody() != null) {
            for (AnimalApiResponseDto img : response.getBody()) {
                if (img.getUrl() != null) {
                    result.add(img.getUrl());
                }
            }
        }

        return result;
    }
}
