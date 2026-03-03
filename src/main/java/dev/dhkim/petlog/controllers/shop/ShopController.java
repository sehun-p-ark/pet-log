package dev.dhkim.petlog.controllers.shop;

import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.entities.shop.*;
import dev.dhkim.petlog.mappers.shop.ProductMapper;
import dev.dhkim.petlog.mappers.shop.SubCategoryMapper;
import dev.dhkim.petlog.services.shop.AdvertisementService;
import dev.dhkim.petlog.services.shop.ProductService;
import dev.dhkim.petlog.services.shop.ReviewService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping(value = "/shop")
public class ShopController {

    private final ProductService productService;
    private final ProductMapper productMapper;
    private final ReviewService reviewService;
    private final SubCategoryMapper subCategoryMapper;
    private final AdvertisementService advertisementService;

    @RequestMapping(value = "main", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getShop(ModelAndView modelAndView){
        modelAndView.addObject("advertisements", advertisementService.getAdvertisements());
        modelAndView.setViewName("shop/main");
        return modelAndView;
    }

    @RequestMapping(value = "brand", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getBrand(
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "0") int page,
            ModelAndView modelAndView) {

        int size = 20;
        List<ProductEntity> products = productService.getProducts(null, null, null, null, page, size, brand);

        modelAndView.addObject("products", products);
        modelAndView.addObject("brand", brand);
        modelAndView.setViewName("shop/brand");
        return modelAndView;
    }

    @RequestMapping(value = "list", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getList(
            @RequestParam(required = false) String petType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer subCategoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            ModelAndView modelAndView
    ) {
        int size = 20;
        List<ProductEntity> products;

        if (keyword != null && !keyword.isEmpty()) {
            products = productService.searchProducts(keyword, petType, null, page, size);
        } else {
            products = productService.getProducts(petType, categoryId, subCategoryId, sort, page, size, null);
        }

        // 서브카테고리
        if (categoryId != null) {
            modelAndView.addObject("subCategories", subCategoryMapper.selectByCategoryId(categoryId));
        }

        modelAndView.addObject("mainCategories", subCategoryMapper.selectMainCategories());
        modelAndView.addObject("products", products);
        modelAndView.addObject("petType", petType);
        modelAndView.addObject("category", category);
        modelAndView.addObject("categoryId", categoryId);
        modelAndView.addObject("subCategoryId", subCategoryId);  // 추가
        modelAndView.addObject("sort", sort);
        modelAndView.setViewName("shop/list");

        return modelAndView;
    }

    // 상품 상세 페이지
    @RequestMapping(value = "product/{id}", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    @SuppressWarnings("unchecked")
    public ModelAndView getProduct(@PathVariable Integer id, ModelAndView modelAndView, HttpSession session) {
        ProductEntity product = productService.getProductDetail(id);
        int reviewCount = productMapper.countReviewByProductId(id);
        List<ProductDetailImageEntity> detailImages = productMapper.findDetailImagesByProductId(id);
        List<OptionEntity> options = productMapper.getProductOptions(id);

        SessionUser sessionUser = (SessionUser) session.getAttribute("sessionUser");
        Integer userId = sessionUser != null ? sessionUser.getUserId() : null;

        Map<String, Object> reviewData = reviewService.getReviewsByProductId(id, userId, "best");
        List<Map<String, Object>> reviews = (List<Map<String, Object>>) reviewData.get("reviews");
        boolean canWriteReview = (boolean) reviewData.get("canWriteReview");
        Double averageRating = (Double) reviewData.get("averageRating");
        Map<Integer, Long> ratingMap = (Map<Integer, Long>) reviewData.get("ratingMap");
        long maxRatingCount = (long) reviewData.get("maxRatingCount");
        int bestRating = (int) reviewData.get("bestRating");

        modelAndView.addObject("product", product);
        modelAndView.addObject("reviewCount", reviewCount);
        modelAndView.addObject("detailImages", detailImages);
        modelAndView.addObject("options", options);
        modelAndView.addObject("reviews", reviews);
        modelAndView.addObject("canWriteReview", canWriteReview);
        modelAndView.addObject("averageRating", averageRating);
        modelAndView.addObject("ratingMap", ratingMap);
        modelAndView.addObject("maxRatingCount", maxRatingCount);
        modelAndView.addObject("bestRating", bestRating);
        modelAndView.setViewName("shop/product");

        return modelAndView;
    }
}