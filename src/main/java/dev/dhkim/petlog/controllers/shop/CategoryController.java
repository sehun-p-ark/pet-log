package dev.dhkim.petlog.controllers.shop;

import dev.dhkim.petlog.mappers.shop.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/shop/categories")
public class CategoryController {

    @Autowired
    private CategoryMapper categoryMapper;

    @GetMapping
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(categoryMapper.selectAll());
    }
}