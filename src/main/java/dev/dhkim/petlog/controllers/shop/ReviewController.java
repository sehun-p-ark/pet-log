package dev.dhkim.petlog.controllers.shop;

import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.shop.ReviewService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/shop/products")
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/{id}/reviews")
    public Map<String, Object> getReviews(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "best") String sort,
            HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        return reviewService.getReviewsByProductId(id, userId, sort);
    }

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.base-url}")
    private String baseUrl;

    @PostMapping("/{id}/reviews")
    public Map<String, Object> submitReview(
            @PathVariable Integer id,
            @RequestParam Integer rating,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) List<MultipartFile> images,
            HttpSession session) {
        SessionUser sessionUser = (SessionUser) session.getAttribute("sessionUser");
        System.out.println("컨트롤러 진입: id=" + id + ", rating=" + rating + ", userId=" + sessionUser);
        if (sessionUser == null) {
            return Map.of("success", false, "message", "로그인이 필요합니다.");
        }
        Integer userId = sessionUser.getUserId();

        List<String> imageUrls = new ArrayList<>();
        if (images != null) {
            for (MultipartFile image : images) {
                try {
                    String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    Path path = Paths.get(uploadDir, filename);
                    Files.createDirectories(path.getParent());
                    Files.write(path, image.getBytes());
                    imageUrls.add(baseUrl + "/" + uploadDir + "/" + filename);
                } catch (Exception e) {
                    return Map.of("success", false, "message", "이미지 업로드 실패");
                }
            }
        }
        reviewService.submitReview(userId, id, rating, content, imageUrls);
        return Map.of("success", true);
    }
}
