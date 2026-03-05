package dev.dhkim.petlog.controllers.chat;

import dev.dhkim.petlog.dto.chat.ChatNotifyDto;
import dev.dhkim.petlog.dto.chat.ChatWsMessageDto;
import dev.dhkim.petlog.dto.chat.ChatWsSendDto;
import dev.dhkim.petlog.services.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatWsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat/send")
    public void send(ChatWsSendDto req) {

        // DB 대화 내용 저장
        int messageId = chatService.saveMessage(
                req.getRoomId(),
                req.getSenderId(),
                req.getMessage()
        );

        // 저장된 메세지 다시 조회하기 (createdAt, id포함)
        ChatWsMessageDto saved = chatService.getMessageById(messageId);

        // 해당 채팅방 인원들에게 브로드캐스트(현재 방 열고 있는 사람들한테는 채팅방 바로 뜸)
        messagingTemplate.convertAndSend(
                "/topic/chat.room." + req.getRoomId(), saved);

        // 채팅방 인원들에게 "채팅방 리스트 갱신용" 보내기 (토픽을 USER로 사용)
        List<Integer> memberUserIds = chatService.getRoomMemberUserIds(req.getRoomId());

        ChatNotifyDto notify = ChatNotifyDto.builder()
                .roomId(req.getRoomId())
                .fromUserId(req.getSenderId())
                .lastMessage(req.getMessage())
                .createdAt(saved.getCreatedAt().toString())
                .type("NEW_MESSAGE")
                .build();

        for (Integer uid : memberUserIds) {
            // 유저 개인 토픽으로 알람 전송
            messagingTemplate.convertAndSend(
                    "/topic/chat.user." + uid, notify);
        }
    }
}