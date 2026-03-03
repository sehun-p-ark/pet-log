package dev.dhkim.petlog.services.shop;

import dev.dhkim.petlog.entities.shop.ProductEntity;
import dev.dhkim.petlog.mappers.shop.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductMapper productMapper;

    // 신상품 목록 조회
    public List<ProductEntity> getNewProducts(String petType, Integer categoryId, int limit) {
        return productMapper.selectNewProducts(petType, categoryId, limit);
    }

    // 베스트 상품 목록 조회
    public List<ProductEntity> getBestProducts(String petType, Integer categoryId, int limit, String brand) {
        return productMapper.selectBestProducts(petType, categoryId, limit, brand);
    }

    // 상품 상세 정보 조회
    public ProductEntity getProductDetail(Integer id) {
        return productMapper.selectProductById(id);
    }

    // 상품 검색
    public List<ProductEntity> searchProducts(String keyword, String petType, Integer categoryId, int page, int size) {
        int offset = page * size;
        return productMapper.searchProducts(keyword, petType, categoryId, offset, size);
    }

    // 카테고리별 상품 목록 조회
    public List<ProductEntity> getProducts(String petType, Integer categoryId, Integer subCategoryId, String sort, int page, int size, String brand, Integer eventCategoryId) {
        int offset = page * size;
        return productMapper.selectProducts(petType, categoryId, subCategoryId, sort, offset, size, brand, eventCategoryId);
    }

    // 바로 구매
    public List<Map<String, Object>> getBuyNowItem(Integer productId, Integer optionId, Integer quantity) {
        return productMapper.getBuyNowItem(productId, optionId, quantity);
    }
}