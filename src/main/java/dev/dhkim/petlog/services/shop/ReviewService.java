package dev.dhkim.petlog.services.shop;

import dev.dhkim.petlog.mappers.shop.ReviewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewMapper reviewMapper;

    public Map<String, Object> getReviewsByProductId(Integer productId, Integer userId) {
        List<Map<String, Object>> reviews = reviewMapper.selectReviewsByProductId(productId);
        reviews.forEach(review -> {
            List<String> images = reviewMapper.selectReviewImages(((Number) review.get("id")).intValue());
            review.put("reviewImages", images);
        });

        boolean isPurchased = false;
        boolean isAlreadyReviewed = false;

        if (userId != null){
            isPurchased = reviewMapper.checkPurchased(userId, productId);
            isAlreadyReviewed = reviewMapper.checkAlreadyReviewed(userId, productId);
        }

        Double averageRating = reviewMapper.selectAverageRating(productId);

        List<Map<String, Object>> ratingDistribution = reviewMapper.selectRatingDistribution(productId);

        Map<String, Long> ratingMap = new HashMap<>();
        for (Map<String, Object> row : ratingDistribution) {
            String rating = String.valueOf(((Number) row.get("rating")).intValue());
            Long count = ((Number) row.get("count")).longValue();
            ratingMap.put(rating, count);
        }

        long maxRatingCount = ratingMap.values().stream().mapToLong(Long::longValue).max().orElse(0);

        return Map.of(
                "reviews", reviews,
                "isPurchased", isPurchased,
                "isAlreadyReviewed", isAlreadyReviewed,
                "averageRating", averageRating != null ? averageRating : 0.0,
                "ratingMap", ratingMap,
                "maxRatingCount", maxRatingCount
        );
    }
}