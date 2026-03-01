package dev.dhkim.petlog.mappers.shop;

import dev.dhkim.petlog.entities.shop.OptionEntity;
import dev.dhkim.petlog.entities.shop.ProductDetailImageEntity;
import dev.dhkim.petlog.entities.shop.ProductEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ProductMapper {

    // 신상품 목록 조회
    List<ProductEntity> selectNewProducts(
            @Param("petType") String petType,
            @Param("categoryId") Integer categoryId,
            @Param("limit") int limit
    );

    // 베스트 상품 목록 조회
    List<ProductEntity> selectBestProducts(
            @Param("petType") String petType,
            @Param("categoryId") Integer categoryId,
            @Param("limit") int limit,
            @Param("brand") String brand
    );

    // 상품 상세 조회
    ProductEntity selectProductById(@Param("id") Integer id);

    // 상품 검색
    List<ProductEntity> searchProducts(
            @Param("keyword") String keyword,
            @Param("petType") String petType,
            @Param("categoryId") Integer categoryId,
            @Param("offset") int offset,
            @Param("size") int size
    );

    // 상품 목록 조회 (페이징, 정렬)
    List<ProductEntity> selectProducts(
            @Param("petType") String petType,
            @Param("categoryId") Integer categoryId,
            @Param("subCategoryId") Integer subCategoryId,
            @Param("sort") String sort,
            @Param("offset") int offset,
            @Param("size") int size,
            @Param("brand") String brand
    );

    // 리뷰 개수 조회
    int countReviewByProductId(Integer productId);

    // 상세 이미지 리스트 조회
    List<ProductDetailImageEntity> findDetailImagesByProductId(Integer productId);

    // 옵션 조회
    List<OptionEntity> getProductOptions(@Param("productId") Integer productId);

    // 바로 구매
    List<Map<String, Object>> getBuyNowItem(@Param("productId") Integer productId,
                                            @Param("optionId") Integer optionId,
                                            @Param("quantity") Integer quantity);

}