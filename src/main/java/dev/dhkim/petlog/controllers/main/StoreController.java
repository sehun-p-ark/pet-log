package dev.dhkim.petlog.controllers.main;

import dev.dhkim.petlog.entities.user.StoreEntity;
import dev.dhkim.petlog.services.main.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class StoreController {

    private final StoreService storeService;

    // 좌표 업데이트 (기존)
    @GetMapping(value = "/update-coords", produces = "text/plain; charset=UTF-8")
    public String updateCoords() {
        storeService.updateAllStoreLatLng();
        return "좌표 변환 완료";
    }

    // 단일 엔드포인트: 전체 or 카테고리별 조회
    @GetMapping("/stores")
    public List<StoreEntity> getStores(@RequestParam(required = false) String category) {
        return storeService.getStoresByCategoryOrAll(category);
    }
}
