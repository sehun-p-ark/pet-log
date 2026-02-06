package dev.dhkim.petlog.services.shop;

import dev.dhkim.petlog.entities.shop.CategoryEntity;
import dev.dhkim.petlog.mappers.shop.CategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryMapper categoryMapper;

    public List<CategoryEntity> getAllCategories() {
        return categoryMapper.selectAll();
    }
}