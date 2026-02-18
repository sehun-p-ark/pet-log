package dev.dhkim.petlog.services.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    // 프로젝트 루트 기준 uploads 폴더
    private static final String BASE_PATH =
            System.getProperty("user.dir") + File.separator + "uploads";

    public String save(MultipartFile file, String subFolder) {

        try {

            // 저장 폴더 경로 생성
            String folderPath = BASE_PATH + File.separator + subFolder;
            File dir = new File(folderPath);

            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 파일 확장자 추출
            String originalName = file.getOriginalFilename();
            String extension = "";

            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            // UUID 파일명 생성 (중복 방지)
            String fileName = UUID.randomUUID() + extension;

            // 최종 저장 경로
            File destination = new File(folderPath, fileName);

            // 파일 저장
            file.transferTo(destination);

            // 브라우저 접근용 URL 반환
            return "/uploads/" + subFolder + "/" + fileName;

        } catch (IOException e) {
            log.error("파일 저장 실패", e);
            throw new RuntimeException("파일 저장 실패");
        }
    }
}
