package dev.dhkim.petlog.services.shop;

import dev.dhkim.petlog.mappers.shop.ReviewMapper;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewMapper reviewMapper;

    public Map<String, Object> getReviewsByProductId(Integer productId, Integer userId, String sort) {
        List<Map<String, Object>> reviews = reviewMapper.selectReviews((long) productId, sort);

        reviews.forEach(review -> {
            List<String> images = reviewMapper.selectReviewImages(((Number) review.get("id")).intValue());
            review.put("reviewImages", images);
        });

        boolean canWriteReview = false;
        if (userId != null) {
            canWriteReview = reviewMapper.checkCanWriteReview(userId, productId);
        }

        Double averageRating = reviewMapper.selectAverageRating(productId);

        List<Map<String, Object>> ratingDistribution = reviewMapper.selectRatingDistribution(productId);

        Map<Integer, Long> ratingMap = new HashMap<>();
        for (Map<String, Object> row : ratingDistribution) {
            Integer rating = ((Number) row.get("rating")).intValue();
            Long count = ((Number) row.get("count")).longValue();
            ratingMap.put(rating, count);
        }

        long maxRatingCount = ratingMap.values().stream().mapToLong(Long::longValue).max().orElse(0);

        int bestRating = ratingMap.entrySet().stream()
                .filter(e -> e.getValue() == maxRatingCount)
                .mapToInt(Map.Entry::getKey)
                .max()
                .orElse(0);

        return Map.of(
                "reviews", reviews,
                "canWriteReview", canWriteReview,
                "averageRating", averageRating != null ? averageRating : 0.0,
                "ratingMap", ratingMap,
                "maxRatingCount", maxRatingCount,
                "bestRating", bestRating
        );
    }

    // 리뷰 남기기
    @Transactional
    public void submitReview(Integer userId, Integer productId, Integer rating, String content, List<String> imageUrls) {
        System.out.println("submitReview 호출: userId=" + userId + ", productId=" + productId + ", rating=" + rating);
        reviewMapper.insertReview(userId, productId, rating, content);
        Integer reviewId = reviewMapper.getLastInsertId();
        System.out.println("reviewId=" + reviewId);
        for (int i = 0; i < imageUrls.size(); i++) {
            reviewMapper.insertReviewImage(reviewId, imageUrls.get(i), i);
        }
    }

    // 리뷰 수정
    @Transactional
    public void updateReview(Integer userId, Integer reviewId, Integer rating, String content) {
        reviewMapper.updateReview(reviewId, userId, rating, content);
    }

    // 리뷰 이미지 삭제
    public List<String> getReviewImages(Integer reviewId) {
        return reviewMapper.selectReviewImages(reviewId);
    }

    public void deleteReviewImage(Integer reviewId, String imageUrl) {
        reviewMapper.deleteReviewImage(reviewId, imageUrl);
    }

    public void addReviewImage(Integer reviewId, String imageUrl) {
        reviewMapper.insertReviewImage(reviewId, imageUrl, 0);
    }
}