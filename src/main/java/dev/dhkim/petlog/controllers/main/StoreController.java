package dev.dhkim.petlog.controllers.main;

import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.dto.user.StoreDto;
import dev.dhkim.petlog.entities.user.StoreEntity;
import dev.dhkim.petlog.entities.user.UserEntity;
import dev.dhkim.petlog.results.MyPageResult;
import dev.dhkim.petlog.services.main.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    // 카테고리별 또는 전체 가게 조회
    @GetMapping
    public ResponseEntity<List<StoreEntity>> getStores(@RequestParam(required = false) String category) {
        List<StoreEntity> stores = storeService.getStoresByCategoryOrAll(category);
        return ResponseEntity.ok(stores);
    }

    //  가게 등록
    @PostMapping
    public ResponseEntity<String> registerStore(@RequestBody StoreDto storeDto) {
        storeService.registerStore(storeDto);
        return ResponseEntity.ok("가게 등록 완료");
    }
    // js patch
    // Controller 파일의 수정 메서드
    @PatchMapping("/my/store/modify")
    @ResponseBody
    public Map<String, Object> modifyStore(StoreDto storeDto,
                                           @SessionAttribute(value ="sessionUser", required = false) SessionUser sessionUser) {
        Map<String, Object> response = new HashMap<>();
        if (sessionUser == null) {
            response.put("result", MyPageResult.FAILURE_SESSION_EXPIRED);
            return response;
        }
        storeDto.setUserId(sessionUser.getUserId());
        MyPageResult result = storeService.updateStore(storeDto);
        response.put("result", result.name());
        return response;
    }
}

