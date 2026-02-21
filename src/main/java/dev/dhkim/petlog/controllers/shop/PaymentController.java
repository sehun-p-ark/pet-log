package dev.dhkim.petlog.controllers.shop;

import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.shop.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.http.HttpSession;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping(value = "/shop/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final CartService cartService;
    private final CouponService couponService;
    private final ProductService productService;
    private final PointService pointService;
    private final OrderService orderService;

    @RequestMapping(method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getPayment(
            @RequestParam("cartIds") String cartIds,
            @SessionAttribute(value ="sessionUser") SessionUser sessionUser,
            ModelAndView modelAndView) {

        // 로그인한 사용자 ID 가져오기
        Integer userId = sessionUser.getUserId();

        // cartIds 파싱
        List<Integer> cartIdList = Arrays.stream(cartIds.split(","))
                .map(Integer::parseInt)
                .collect(Collectors.toList());

        // 선택된 장바구니 아이템 조회
        List<Map<String, Object>> selectedItems = cartService.getCartItemsByIds(cartIdList);

        // 금액 계산
        int totalPrice = 0;
        int totalDeliveryFee = 0;
        int totalDiscount = 0;

        for (Map<String, Object> item : selectedItems) {
            int price = (int) item.get("price");
            int additionalPrice = item.get("additionalPrice") != null ? (int) item.get("additionalPrice") : 0;
            int discountRate = (int) item.get("discountRate");
            int deliveryFee = (int) item.get("deliveryFee");
            int quantity = (int) item.get("quantity");

            int itemTotal = (price + additionalPrice) * quantity;
            int discount = itemTotal * discountRate / 100;

            totalPrice += itemTotal;
            totalDiscount += discount;
            totalDeliveryFee += deliveryFee;
        }

        int finalAmount = totalPrice - totalDiscount + totalDeliveryFee;

        // 사용 가능한 쿠폰 조회
        List<Map<String, Object>> availableCoupons = couponService.getAvailableCoupons(userId);

        int availablePoint = pointService.getAvailablePoint(userId);
        modelAndView.addObject("availablePoint", availablePoint);

        modelAndView.addObject("selectedItems", selectedItems);
        modelAndView.addObject("totalPrice", totalPrice);
        modelAndView.addObject("totalDeliveryFee", totalDeliveryFee);
        modelAndView.addObject("totalDiscount", totalDiscount);
        modelAndView.addObject("finalAmount", finalAmount);
        modelAndView.addObject("availableCoupons", availableCoupons);
        modelAndView.setViewName("shop/payment");

        return modelAndView;
    }

    @RequestMapping(value = "/buynow", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getBuyNow(
            @RequestParam("productId") Integer productId,
            @RequestParam("optionId") String optionIdStr,
            @RequestParam("quantity") Integer quantity,
            @SessionAttribute(value ="sessionUser") SessionUser sessionUser,
            ModelAndView modelAndView) {

        Integer userId = sessionUser.getUserId();

        if (userId == null) {
            modelAndView.setViewName("redirect:/login");
            return modelAndView;
        }

        Integer optionId = (optionIdStr == null || optionIdStr.equals("null")) ? null : Integer.parseInt(optionIdStr);

        // 상품 정보 조회
        List<Map<String, Object>> selectedItems = productService.getBuyNowItem(productId, optionId, quantity);

        // 금액 계산
        int totalPrice = 0;
        int totalDeliveryFee = 0;
        int totalDiscount = 0;

        for (Map<String, Object> item : selectedItems) {
            int price = (int) item.get("price");
            int additionalPrice = item.get("additionalPrice") != null ? (int) item.get("additionalPrice") : 0;
            int discountRate = (int) item.get("discountRate");
            int deliveryFee = (int) item.get("deliveryFee");

            int itemTotal = (price + additionalPrice) * quantity;
            int discount = itemTotal * discountRate / 100;

            totalPrice += itemTotal;
            totalDiscount += discount;
            totalDeliveryFee += deliveryFee;
        }

        int finalAmount = totalPrice - totalDiscount + totalDeliveryFee;

        List<Map<String, Object>> availableCoupons = couponService.getAvailableCoupons(userId);

        int availablePoint = pointService.getAvailablePoint(userId);
        modelAndView.addObject("availablePoint", availablePoint);

        modelAndView.addObject("selectedItems", selectedItems);
        modelAndView.addObject("totalPrice", totalPrice);
        modelAndView.addObject("totalDeliveryFee", totalDeliveryFee);
        modelAndView.addObject("totalDiscount", totalDiscount);
        modelAndView.addObject("finalAmount", finalAmount);
        modelAndView.addObject("availableCoupons", availableCoupons);
        modelAndView.setViewName("shop/payment");

        return modelAndView;
    }

    @RequestMapping(value = "/success", method = RequestMethod.GET)
    public ModelAndView paymentSuccess(
            @RequestParam String paymentKey,
            @RequestParam String orderId,
            @RequestParam Integer amount,
            @SessionAttribute("sessionUser") SessionUser sessionUser,
            HttpSession session,
            ModelAndView mav) {

        Map<String, Object> pendingOrder = (Map<String, Object>) session.getAttribute("pendingOrder");
        orderService.saveOrder(sessionUser.getUserId(), amount, pendingOrder);
        session.removeAttribute("pendingOrder");

        mav.setViewName("redirect:/shop/payment/complete");
        return mav;
    }

    @RequestMapping(value = "/fail", method = RequestMethod.GET)
    public ModelAndView paymentFail(ModelAndView mav) {
        mav.setViewName("shop/order-fail");
        return mav;
    }

    @RequestMapping(value = "/complete", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView paymentComplete(ModelAndView mav) {
        mav.setViewName("shop/order-success");
        return mav;
    }

    @RequestMapping(value = "/prepare", method = RequestMethod.POST)
    @ResponseBody
    public Map<String, Object> preparePayment(
            @RequestBody Map<String, Object> orderInfo,
            HttpSession session) {

        session.setAttribute("pendingOrder", orderInfo);
        return Map.of("success", true);
    }
}