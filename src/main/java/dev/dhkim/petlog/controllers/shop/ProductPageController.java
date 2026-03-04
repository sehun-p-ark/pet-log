package dev.dhkim.petlog.controllers.shop;

import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.entities.shop.ProductEntity;
import dev.dhkim.petlog.services.shop.ProductService;
import dev.dhkim.petlog.services.shop.ReviewService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/shop")
public class ProductPageController {

    private final ProductService productService;
    private final ReviewService reviewService;

    // 메인 페이지
    @GetMapping
    public String mainPage() {
        return "shop/main";
    }

    // 상품 상세 페이지
    @GetMapping("/product/{id}")
    public String productPage(@PathVariable Integer id, Model model, HttpSession session) {
        ProductEntity product = productService.getProductDetail(id);
        model.addAttribute("product", product);

        SessionUser sessionUser = (SessionUser) session.getAttribute("sessionUser");
        Integer userId = sessionUser != null ? sessionUser.getUserId() : null;
        boolean canWriteReview = userId != null && reviewService.checkCanWriteReviewByProduct(userId, id);
        model.addAttribute("canWriteReview", canWriteReview);

        return "shop/product";
    }
}