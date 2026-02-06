package dev.dhkim.petlog.services.shop;

import dev.dhkim.petlog.entities.shop.ProductEntity;
import dev.dhkim.petlog.mappers.shop.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductMapper productMapper;

    public List<ProductEntity> getAllProducts() {
        return productMapper.selectAll();
    }

    public ProductEntity getProductById(Integer id) {
        return productMapper.selectById(id);
    }
}