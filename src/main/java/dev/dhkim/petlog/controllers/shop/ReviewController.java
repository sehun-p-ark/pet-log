package dev.dhkim.petlog.controllers.shop;

import dev.dhkim.petlog.services.shop.ReviewService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/shop/products")
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/{id}/reviews")
    public Map<String, Object> getReviews(@PathVariable Integer id) {
        return reviewService.getReviewsByProductId(id, null);
    }
}
