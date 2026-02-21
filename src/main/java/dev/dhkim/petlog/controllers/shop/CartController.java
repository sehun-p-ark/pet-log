package dev.dhkim.petlog.controllers.shop;

import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.shop.CartService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping("/shop/cart")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public String cartPage(Model model, @SessionAttribute(value ="sessionUser") SessionUser sessionUser) {
        Integer userId = sessionUser.getUserId();

        if (userId != null) {
            List<Map<String, Object>> cartItems = cartService.getCartItems(userId);

            for (Map<String, Object> item : cartItems) {
                System.out.println("아이템: " + item);
            }

            model.addAttribute("cartItems", cartItems);
        } else {
            System.out.println("로그인 필요");
        }

        return "shop/cart";
    }

    @PostMapping("/add")
    @ResponseBody
    public Map<String, Object> addToCart(@RequestBody Map<String, Object> request,
                                         @SessionAttribute(value ="sessionUser") SessionUser sessionUser) {
        Integer userId = sessionUser.getUserId();

        if (userId == null) {
            return Map.of("success", false, "message", "로그인이 필요합니다");
        }

        List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");

        try {
            boolean hasExisting = cartService.addToCart(userId, items);
            if (hasExisting) {
                return Map.of("success", false, "alreadyExists", true);
            }
            return Map.of("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("success", false, "message", "장바구니 담기에 실패했습니다");
        }
    }

    @DeleteMapping("/delete")
    @ResponseBody
    public Map<String, Object> deleteCartItems(@RequestBody Map<String, Object> request,
                                               @SessionAttribute(value ="sessionUser") SessionUser sessionUser) {
        Integer userId = sessionUser.getUserId();

        if (userId == null) {
            return Map.of("success", false, "message", "로그인이 필요합니다");
        }

        List<Integer> cartIds = ((List<?>) request.get("cartIds")).stream()
                .map(id -> ((Number) id).intValue())
                .collect(java.util.stream.Collectors.toList());

        try {
            cartService.deleteCartItems(cartIds);
            return Map.of("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("success", false, "message", "삭제에 실패했습니다");
        }
    }

    // 상품 옵션 목록 조회
    @GetMapping("/options/{productId}")
    @ResponseBody
    public Map<String, Object> getProductOptions(@PathVariable Integer productId) {
        try {
            List<Map<String, Object>> options = cartService.getProductOptions(productId);
            return Map.of("success", true, "options", options);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("success", false, "message", "옵션 조회에 실패했습니다");
        }
    }

    // 장바구니 옵션 변경
    @PutMapping("/update-option")
    @ResponseBody
    public Map<String, Object> updateCartOption(@RequestBody Map<String, Object> request) {
        try {
            Integer cartId = ((Number) request.get("cartId")).intValue();
            Integer optionId = ((Number) request.get("optionId")).intValue();

            cartService.updateCartOption(cartId, optionId);
            return Map.of("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("success", false, "message", "옵션 변경에 실패했습니다");
        }
    }

    // 장바구니 수량 변경
    @PutMapping("/update-quantity")
    @ResponseBody
    public Map<String, Object> updateCartQuantity(@RequestBody Map<String, Object> request) {
        try {
            Integer cartId = ((Number) request.get("cartId")).intValue();
            Integer quantity = ((Number) request.get("quantity")).intValue();

            cartService.updateCartQuantity(cartId, quantity);
            return Map.of("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("success", false, "message", "수량 변경에 실패했습니다");
        }
    }
}