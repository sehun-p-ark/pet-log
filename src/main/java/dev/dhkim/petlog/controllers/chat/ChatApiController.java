package dev.dhkim.petlog.controllers.chat;

import dev.dhkim.petlog.dto.chat.ChatFriendDto;
import dev.dhkim.petlog.dto.chat.ChatMessageDto;
import dev.dhkim.petlog.dto.chat.ChatRoomListDto;
import dev.dhkim.petlog.dto.user.SessionUser;
import dev.dhkim.petlog.services.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatApiController {

    private final ChatService chatService;

    // 채팅방 조회 또는 생성
    @RequestMapping(value="/room", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> postRoom(@SessionAttribute(value="sessionUser", required = false)SessionUser sessionUser,
                        @RequestParam int targetUserId
    ) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        int userId = sessionUser.getUserId();
        int roomId = chatService.createOrGetRoom(userId, targetUserId);

        return Map.of("result", "SUCCESS", "roomId", roomId);
    }

    // 채팅방 리스트 띄울 때
    // 안릭은 메세지 카운트, 읽음 처리
    @RequestMapping(value="/room/{roomId}/read", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> postReadRoom(@PathVariable int roomId,
                                            @SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser
    ) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        int userId = sessionUser.getUserId();
        chatService.markAsRead(roomId, userId);
        return Map.of("result", "SUCCESS");
    }

    // 친구(팔로우한사람들) 리스트 불러오기
    @RequestMapping(value="/friends", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> getFriends (@SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser,
                                           @RequestParam(defaultValue = "abc") String sort) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        int userId = sessionUser.getUserId();
        List<ChatFriendDto> friends = chatService.getFriend(userId, sort);

        return Map.of("result", "SUCCESS", "friends", friends);
    }

    // 채팅방 리스트 불러오기
    @RequestMapping(value="/rooms", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> getRooms (@SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser) {
        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }
        int userId = sessionUser.getUserId();
        List<ChatRoomListDto> rooms = chatService.getChatRooms(userId);

        return Map.of("result", "SUCCESS", "rooms", rooms);
    }

    // 채팅 메세지 전체 불러오기
    @RequestMapping(value="/room/{roomId}/messages", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> getMessages(
            @SessionAttribute(value="sessionUser", required = false) SessionUser sessionUser,
            @PathVariable int roomId) {

        if (sessionUser == null) {
            return Map.of("result", "LOGIN_REQUIRED");
        }

        List<ChatMessageDto> messages = chatService.getMessages(roomId);

        return Map.of(
                "result", "SUCCESS",
                "messages", messages
        );
    }
}
