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

        boolean canWriteReview = userId != null && reviewMapper.checkCanWriteReview(userId, productId, null);

        return Map.of(
                "reviews", reviews,
                "averageRating", averageRating != null ? averageRating : 0.0,
                "ratingMap", ratingMap,
                "maxRatingCount", maxRatingCount,
                "bestRating", bestRating,
                "canWriteReview", canWriteReview
        );
    }

    // 리뷰 남기기
    @Transactional
    public void submitReview(Integer userId, Integer productId, Integer orderItemId, Integer rating, String content, List<String> imageUrls) {
        if (!reviewMapper.checkCanWriteReview(userId, productId, orderItemId)) {
            throw new IllegalStateException("리뷰를 작성할 수 없는 주문입니다.");
        }

        reviewMapper.insertReview(userId, productId, orderItemId, rating, content);
        Integer reviewId = reviewMapper.getLastInsertId();

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

    public Map<String, Object> getReviewById(Integer reviewId) {
        Map<String, Object> review = reviewMapper.selectReviewById(reviewId);
        List<String> images = reviewMapper.selectReviewImages(reviewId);
        review.put("images", images);
        return review;
    }

    // 리뷰 체크
    public boolean checkCanWriteReview(Integer userId, Integer productId, Integer orderItemId) {
        return reviewMapper.checkCanWriteReview(userId, productId, orderItemId);
    }
}