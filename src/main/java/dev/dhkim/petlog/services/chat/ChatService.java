package dev.dhkim.petlog.services.chat;

import dev.dhkim.petlog.dto.chat.ChatFriendDto;
import dev.dhkim.petlog.dto.chat.ChatMessageDto;
import dev.dhkim.petlog.dto.chat.ChatRoomListDto;
import dev.dhkim.petlog.dto.chat.ChatWsMessageDto;
import dev.dhkim.petlog.entities.chat.ChatMessageEntity;
import dev.dhkim.petlog.entities.chat.ChatRoomEntity;
import dev.dhkim.petlog.mappers.chat.ChatMapper;
import dev.dhkim.petlog.mappers.main.FollowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMapper chatMapper;
    private final FollowMapper followMapper;

    // 채팅 방 생성 및 조회
    @Transactional
    public int createOrGetRoom(int userId, int targetUserId){
        if (userId == targetUserId) {
            throw new IllegalArgumentException("자기 자신과 채팅할 수 없습니다.");
        }
        // 팔로우 중인지 확인
        int isFollowing = followMapper.existsFollow(userId, targetUserId);

        if (isFollowing == 0) {
            throw new IllegalArgumentException("팔로우 후 채팅이 가능합니다.");
        }
        // 이전 채팅방이 있는지 확인
        Integer existingRoomId = chatMapper.findExistingRoom(userId, targetUserId);

        // 방이 있으면 해당 방 사용
        if (existingRoomId != null) {
            return existingRoomId;
        }

        ChatRoomEntity room = new ChatRoomEntity();
        chatMapper.insertChatRoom(room);
        int roomId = room.getId();

        chatMapper.insertChatRoomMember(roomId, userId);
        chatMapper.insertChatRoomMember(roomId, targetUserId);

        return roomId;
    }

    // 채팅 내용 저장하기
    @Transactional
    public int saveMessage(int roomId, int senderId, String message) {
        // DB에 메세지 추가하기
        ChatMessageEntity msg = new ChatMessageEntity();
        msg.setRoomId(roomId);
        msg.setSenderId(senderId);
        msg.setMessage(message);
        chatMapper.insertMessage(msg);
        int messageId = msg.getId();

        // 채팅방 마지막 메세지 내용 저장하기
        chatMapper.updateLastMessage(roomId, senderId, message);

        // 보낸 사람 읽음 상태처리
        chatMapper.updateLastReadMessageId(roomId, senderId, messageId);

        return messageId;
    }

    // 단일 메세지 조회 (웹소켓 브로드캐스트용)
    public ChatWsMessageDto getMessageById(int messageId) {
        return chatMapper.selectMessageById(messageId);
    }

    // 채팅 내역 불러오기
    public List<ChatMessageDto> getMessages(int roomId) {
        return chatMapper.selectMessagesByRoomId(roomId);
    }

    // 친구 리스트 불러오기
    public List<ChatFriendDto> getFriend(int userId, String sort) {
        return chatMapper.selectFollowedUsers(userId, sort);
    }

    // 채팅방 리스트 불러오기
    public List<ChatRoomListDto> getChatRooms(int userId) {
        return chatMapper.selectChatRooms(userId);
    }

    // 채팅 읽음 처리하기
    public void markAsRead(int roomId, int userId) {

        Integer lastMessageId = chatMapper.selectLastMessageIdInRoom(roomId);

        int safeLastId = (lastMessageId == null) ? 0 : lastMessageId;

        chatMapper.updateLastReadMessageId(roomId, userId, safeLastId);
    }

    // 채팅방 멤버 조회하기
    public List<Integer> getRoomMemberUserIds(int roomId) {
        return chatMapper.selectMemberUserIdsByRoomId(roomId);
    }
}
