package dev.dhkim.petlog.mappers.chat;

import dev.dhkim.petlog.dto.chat.ChatFriendDto;
import dev.dhkim.petlog.dto.chat.ChatMessageDto;
import dev.dhkim.petlog.dto.chat.ChatRoomListDto;
import dev.dhkim.petlog.dto.chat.ChatWsMessageDto;
import dev.dhkim.petlog.entities.chat.ChatMessageEntity;
import dev.dhkim.petlog.entities.chat.ChatRoomEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChatMapper {
    // 방이 있는지 확인
    Integer findExistingRoom(@Param("userId") int userId,
                              @Param("targetUserId") int targetUserId);
    // 방 생성
    int insertChatRoom(ChatRoomEntity room);

    // 메세지 저장
    int insertMessage(ChatMessageEntity message);

    // 채팅방 별 마지막 메세지 갱신
    int updateLastMessage(@Param("roomId") int roomId,
                          @Param("senderId") int senderId,
                          @Param("message") String message);

    // 읽음 처리
    int updateLastReadMessageId(@Param("roomId") int roomId,
                                @Param("userId") int userId,
                                @Param("lastMessageId") int lastMessageId);

    // 단일 메세지 조회 (웹소켓용)
    ChatWsMessageDto selectMessageById(@Param("messageId") int messageId);


    // 방 참여자 추가
    int insertChatRoomMember(@Param("roomId") int roomId,
                             @Param("userId") int userId);

    // 친구 리스트 불러오기
    List<ChatFriendDto> selectFollowedUsers(@Param("userId") int userId,
                                            @Param("sort") String sort);

    // 채팅 내역 불러오기
    List<ChatMessageDto> selectMessagesByRoomId(int roomId);

    // 채팅방 리스트 불러오기
    List<ChatRoomListDto> selectChatRooms (int userId);

    // 방의 마지막 메세지 ID 가져오기
    int selectLastMessageIdInRoom(int roomId);
}
