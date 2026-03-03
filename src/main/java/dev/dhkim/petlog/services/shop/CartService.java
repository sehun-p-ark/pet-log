package dev.dhkim.petlog.services.shop;

import dev.dhkim.petlog.enums.shop.CartResult;
import dev.dhkim.petlog.mappers.shop.CartMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartMapper cartMapper;

    @Transactional
    public boolean addToCart(Integer userId, List<Map<String, Object>> items) {
        boolean hasExisting = false;
        for (Map<String, Object> item : items) {
            Integer productId = (Integer) item.get("productId");
            Integer optionId = (Integer) item.get("optionId");
            Integer quantity = (Integer) item.get("quantity");

            Integer existingCartId = cartMapper.findCartItem(userId, productId, optionId);

            if (existingCartId != null) {
                hasExisting = true;
            } else {
                cartMapper.insertCartItem(userId, productId, optionId, quantity);
            }
        }
        return hasExisting;
    }

    public List<Map<String, Object>> getCartItems(Integer userId) {
        return cartMapper.getCartItems(userId);
    }

    @Transactional
    public void deleteCartItems(List<Integer> cartIds) {
        for (Integer cartId : cartIds) {
            cartMapper.deleteCartItem(cartId);
        }
    }

    public List<Map<String, Object>> getProductOptions(Integer productId) {
        return cartMapper.getProductOptions(productId);
    }

    @Transactional
    public CartResult updateCartOption(int cartId, int optionId) {
        try {
            cartMapper.updateCartOption(cartId, optionId);
            return CartResult.SUCCESS;
        } catch (DuplicateKeyException e) {
            return CartResult.DUPLICATE;
        } catch (Exception e) {
            return CartResult.FAIL;
        }
    }

    @Transactional
    public void updateCartQuantity(Integer cartId, Integer quantity) {
        cartMapper.setCartQuantity(cartId, quantity);
    }

    public List<Map<String, Object>> getCartItemsByIds(List<Integer> cartIds) {
        return cartMapper.getCartItemsByIds(cartIds);
    }
}