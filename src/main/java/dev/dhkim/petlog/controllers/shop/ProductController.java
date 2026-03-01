package dev.dhkim.petlog.controllers.shop;

import dev.dhkim.petlog.entities.shop.ProductEntity;
import dev.dhkim.petlog.mappers.shop.SubCategoryMapper;
import dev.dhkim.petlog.services.shop.ProductService;
import dev.dhkim.petlog.services.shop.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/shop/products")
public class ProductController {

    private final ProductService productService;
    private final SubCategoryMapper subCategoryMapper;
    private final ReviewService reviewService;

    // 신상품 목록 조회
    @GetMapping("/new")
    public List<ProductEntity> getNewProducts(
            @RequestParam(required = false) String petType,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "10") int limit
    ) {
        Integer subCategoryId = getSubCategoryId(category);
        return productService.getNewProducts(petType, subCategoryId, limit);
    }

    // 베스트 상품 목록 조회
    @GetMapping("/best")
    public List<ProductEntity> getBestProducts(
            @RequestParam(required = false) String petType,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String brand
    ) {
        Integer subCategoryId = getSubCategoryId(category);
        return productService.getBestProducts(petType, subCategoryId, limit, brand);
    }

    private Integer getSubCategoryId(String categoryName) {
        if (categoryName == null || categoryName.equals("all")) {
            return null;
        }

        // 대분류 카테고리 매핑
        Map<String, Integer> categoryMap = Map.of(
                "사료", 1,
                "간식", 2,
                "용품", 3,
                "의류", 4,
                "미용", 5,
                "장난감", 6
        );

        Integer categoryId = categoryMap.get(categoryName);
        System.out.println(">>> 대분류: " + categoryName + " -> categoryId: " + categoryId);
        return categoryId;
    }

/*
    // 상품 상세 정보 조회
    @GetMapping("/{id}")
    public String getProduct(@PathVariable Integer id, Model model) {
        model.addAttribute("product", productService.getProductDetail(id));
        model.addAttribute("reviews", reviewService.getReviewsByProductId(id));
        return "shop/product";
    }
*/

    // 상품 검색
    @GetMapping("/search")
    public List<ProductEntity> searchProducts(
            @RequestParam String keyword,
            @RequestParam(required = false) String petType,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return productService.searchProducts(keyword, petType, categoryId, page, size);
    }

    // 카테고리별 상품 목록 조회
    @GetMapping
    public List<ProductEntity> getProducts(
            @RequestParam(required = false) String petType,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer subCategoryId,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String brand
    ) {
        return productService.getProducts(petType, categoryId, subCategoryId, sort, page, size, brand);
    }
}