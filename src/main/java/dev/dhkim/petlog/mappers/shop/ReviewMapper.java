package dev.dhkim.petlog.mappers.shop;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ReviewMapper {
/*
    List<Map<String, Object>> selectReviewsByProductId(Integer productId);
*/

    List<String> selectReviewImages(Integer reviewId);

    List<String> getPurchasedOptions(@Param("userId") Integer userId, @Param("productId") Integer productId);

    Double selectAverageRating(Integer productId);

    List<Map<String, Object>> selectRatingDistribution(Integer productId);

/*
    List<Map<String, Object>> selectReviewsByProductIdSortedByDate(Integer productId);
*/

    List<Map<String, Object>> selectReviews(
            @Param("productId") Long productId,
            @Param("sort") String sort
    );

    //리뷰 등록
    void insertReview(@Param("userId") Integer userId, @Param("productId") Integer productId, @Param("rating") Integer rating, @Param("content") String content);

    Integer getLastInsertId();

    void insertReviewImage(@Param("reviewId") Integer reviewId, @Param("imageUrl") String imageUrl, @Param("sortOrder") Integer sortOrder);

    boolean checkCanWriteReview(@Param("userId") Integer userId, @Param("productId") Integer productId);

    void updateReview(@Param("reviewId") Integer reviewId, @Param("userId") Integer userId, @Param("rating") Integer rating, @Param("content") String content);

    void deleteReviewImage(@Param("reviewId") Integer reviewId, @Param("imageUrl") String imageUrl);
}
