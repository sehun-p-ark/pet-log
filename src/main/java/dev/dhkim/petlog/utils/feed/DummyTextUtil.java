package dev.dhkim.petlog.utils.feed;

import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class DummyTextUtil {

    private static final String[] TITLES = {
            "오늘 만난 귀요미", "산책 중 발견!", "심쿵 주의", "행복한 하루", "댕냥이 일상"
    };

    private static final String[] CONTENTS = {
            "너무 귀엽지 않나요?", "오늘도 힐링 완료", "이 표정 보세요", "세상 사랑스러움", "피로가 싹 풀림"
    };

    private final Random random = new Random();

    public String randomTitle() {
        return TITLES[random.nextInt(TITLES.length)];
    }

    public String randomContent() {
        return CONTENTS[random.nextInt(CONTENTS.length)];
    }
}

