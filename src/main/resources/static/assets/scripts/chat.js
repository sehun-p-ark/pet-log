let friendCache = []; // 친구 리스트 (정렬에 따라 받을 예정)

document.addEventListener("DOMContentLoaded", () => {

    const $launcher = document.getElementById("chatBtn");
    const $listModal = document.getElementById("chatListModal");
    const $roomModal = document.getElementById("chatRoomModal");
    const $friendContainer = $listModal.querySelector(".friend-container");
    const $chatContainer = $listModal.querySelector(".chat-container");
    const $sortAbc = document.querySelector(".sort.abc");
    const $sortTime = document.querySelector(".sort.time");
    const $friendBtn = $listModal.querySelector(".buttons .friend");
    const $chatBtn = $listModal.querySelector(".buttons .chat");
    const $header = $roomModal.querySelector(".chat-header");
    const chatInput = document.getElementById("chatInput");
    const chatSendBtn = document.getElementById("chatSendBtn");

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // 기존에 열려있는 채팅방 있으면 다시 열기
    const userId = Number(document.getElementById('chatRoot').dataset.userId);
    const savedRoomId = localStorage.getItem("openChatRoomId");
    const nickname = localStorage.getItem("openChatNickname");
    const imageUrl = localStorage.getItem("openChatImage");
    if(savedRoomId && userId){
        openChatRoom(savedRoomId, nickname, imageUrl);
    }

    // 드래그 기능
    $header.addEventListener("mousedown", (e) => {
        isDragging = true;

        const rect = $roomModal.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        $roomModal.style.bottom = "auto";
        $roomModal.style.right = "auto";

        $roomModal.style.left = rect.left + "px";
        $roomModal.style.top = rect.top + "px";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        $roomModal.style.left = (e.clientX - offsetX) + "px";
        $roomModal.style.top = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    // 리스트 모달 열기
    $launcher.addEventListener("click", async (e) => {
        e.stopPropagation();
        const userId = Number(document.getElementById("chatRoot").dataset.userId);

        if (!userId || userId === 0) {
            showMessage("로그인 후 이용 가능합니다.");
            return;
        }

        $listModal.classList.toggle("hidden");
        if (!$listModal.classList.contains("hidden")) {
            // 친구 리스트 불러오기
            await loadFriends();
        }
    });

    // 바깥 클릭 시 리스트 모달 닫기
    document.addEventListener("click", (e) => {
        if (
            !$listModal.contains(e.target) &&
            !$launcher.contains(e.target) &&
            !$roomModal.contains(e.target)
        ) {
            $listModal.classList.add("hidden");
        }
    });

    // 가나다 순 정렬
    $sortAbc.addEventListener("click", async () => {
        $sortAbc.classList.add("active");
        $sortTime.classList.remove("active");
        const res = await fetch("/api/chat/friends?sort=abc");
        const data = await res.json();
        if (data.result !== "SUCCESS") {
            return;
        }
        friendCache = data.friends;
        renderChatFriend(friendCache);
    });
    // 팔로우 순 정렬
    $sortTime.addEventListener("click", async () => {
        $sortTime.classList.add("active");
        $sortAbc.classList.remove("active");
        const res = await fetch("/api/chat/friends?sort=time");
        const data = await res.json();
        if (data.result !== "SUCCESS") {
            return;
        }
        friendCache = data.friends;
        renderChatFriend(friendCache);
    });

    // 탭 전환
    $friendBtn.addEventListener("click", () => toggleTab("friend"));
    $chatBtn.addEventListener("click", () => toggleTab("chat"));

    function toggleTab(type) {
        if (type === "friend") {
            $chatContainer.classList.remove("active");
            $friendContainer.classList.add("active");

            $chatBtn.classList.remove("active");
            $friendBtn.classList.add("active");

            loadFriends();
        } else {
            $friendContainer.classList.remove("active");
            $chatContainer.classList.add("active");

            $friendBtn.classList.remove("active");
            $chatBtn.classList.add("active");

            loadChatRooms();
        }
    }

    // 친구 클릭 -> 채팅방 생성
    $friendContainer.addEventListener("click", async (e) => {

        const li = e.target.closest("li.item");
        if (!li) return;

        const nickname = li.querySelector(".user-name").innerText;
        const imageUrl = li.querySelector("img").src;

        li.style.pointerEvents = "none";

        try {
            const res = await fetch("/api/chat/room", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    targetUserId: li.dataset.userId
                })
            });

            if (!res.ok) {
                showMessage("서버 오류가 발생하였습니다.");
                return;
            }

            const data = await res.json();

            switch (data.result) {
                case "SUCCESS":
                    await openChatRoom(data.roomId, nickname, imageUrl);
                    break;

                case "LOGIN_REQUIRED":
                    showMessage("로그인 후 이용 가능합니다.");
                    break;

                case "FAIL":
                    showMessage("채팅방 생성 실패");
                    break;

                default:
                    showMessage("알 수 없는 오류가 발생했습니다.");
                    break;
            }

        } catch (err) {
            console.error("채팅방 생성 오류:", err);
            showMessage("네트워크 오류가 발생했습니다.");
        } finally {
            li.style.pointerEvents = "auto";
        }
    });

    // 채팅창 생성(열기)
    $chatContainer.addEventListener("click", (e) => {
        e.stopPropagation();
        const li = e.target.closest("li.item");
        if (!li) return;

        const roomId = li.dataset.roomId;
        const nickname = li.querySelector(".room-name").innerText;
        const imageUrl = li.querySelector("img").src;

        openChatRoom(roomId, nickname, imageUrl);
    });

    // 전송 클릭 이벤트
    chatSendBtn.addEventListener("click", () => {

        const text = chatInput.value.trim();
        if (!text) return;

        const roomId =
            document.getElementById("chatRoomModal").dataset.roomId;

        sendMessageWs(roomId, text);
        chatInput.value = "";
    });

    // 전송 엔터키 이벤트
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            chatSendBtn.click();
        }
    });

    // 모달 안 닫고 페이지 이동 시에도 읽음처리
    window.addEventListener("beforeunload", () => {
        markRoomAsReadBeacon(currentRoomId);
    });
});

// 읽음 처리 기능
function markRoomAsReadBeacon(roomId) {
    if (!roomId) return;

    // unload/닫기 타이밍에도 최대한 살아남는 방식
    const url = `/api/chat/room/${roomId}/read`;
    if (navigator.sendBeacon) {
        navigator.sendBeacon(url);
    } else {
        // fallback
        fetch(url, { method: "POST", keepalive: true }).catch(() => {});
    }
}


// 채팅방 열기
async function openChatRoom(roomId, nickname, imageUrl) {
    if (currentRoomId && String(currentRoomId) !== String(roomId)) {
        markRoomAsReadBeacon(currentRoomId);
    }

    if (currentSub) {
        currentSub.unsubscribe();
        currentSub = null;
    }
    if (stompClient) {
        stompClient.disconnect();
        stompClient = null;
    }
    currentRoomId = roomId;

    // 현재 오픈한 채팅방 정보 기억해두기
    localStorage.setItem("openChatRoomId", roomId);
    localStorage.setItem("openChatNickname", nickname);
    localStorage.setItem("openChatImage", imageUrl);

    const $listModal = document.getElementById("chatListModal");
    const $roomModal = document.getElementById("chatRoomModal");
    const header = $roomModal.querySelector(".chat-header");
    // 현재 방
    const roomItem = document.querySelector(`.chat-list li[data-room-id="${roomId}"]`);

    $listModal.classList.add("hidden");
    $roomModal.classList.remove("hidden");

    $roomModal.dataset.roomId = roomId;

    // 헤더 동적 세팅 (아이폰 메시지 스타일)
    header.innerHTML = `
        <div class="chat-user-info">
            <img src="${imageUrl}" class="chat-user-image">
            <span class="chat-user-name">${nickname}</span>
        </div>
        <button class="chat-close">&times;</button>
    `;

    // 닫기 버튼 이벤트 연결
    const closeBtn = header.querySelector(".chat-close");
    closeBtn.addEventListener("click", () => {
        closeChatRoom();
    });

    // 배지(안 읽은 메세지) 없애기
    if (roomItem) {
        const badge = roomItem.querySelector(".unread-badge");
        if (badge) badge.remove();
    }
    await loadMessages(roomId);
    connectWebSocket(roomId);
    await fetch(`/api/chat/room/${roomId}/read`, {
        method: "POST"
    });
}

// 채팅방 닫기
function closeChatRoom() {
    const $roomModal = document.getElementById("chatRoomModal");
    const $listModal = document.getElementById("chatListModal");

    const roomId = $roomModal.dataset.roomId || currentRoomId;
    markRoomAsReadBeacon(roomId);

    if (currentSub) { // 1. 구독 해제
        currentSub.unsubscribe();
        currentSub = null;
    }
    if (stompClient) { // 2. WebSocket 연결 종료
        stompClient.disconnect();
        stompClient = null;
    }
    currentRoomId = null; // 3. 방 정보 초기화

    // 기억해뒀던 정보 지우기
    localStorage.removeItem("openChatRoomId");
    localStorage.removeItem("openChatNickname");
    localStorage.removeItem("openChatImage");

    // 모달 위치 초기화
    $roomModal.style.left = "";
    $roomModal.style.top = "";
    $roomModal.style.bottom = "";
    $roomModal.style.right = "";

    $roomModal.classList.add("hidden");
    $listModal.classList.remove("hidden");
}

// 친구 리스트 불러오기
async function loadFriends() {

    try {
        const res = await fetch("/api/chat/friends?sort=abc");
        if (!res.ok) {
            showMessage("친구 목록을 불러올 수 없습니다.");
            return;
        }
        const data = await res.json();
        if (data.result !== "SUCCESS") return;

        friendCache = data.friends;
        renderChatFriend(friendCache);
    } catch (e) {
        console.error("친구 목록 불러오기 실패:", e);
    }
}

// 친구리스트 렌더링
function renderChatFriend(list) {

    const friendList = document.querySelector(".chat-friend-list");
    friendList.innerHTML = "";

    if (!list || list.length === 0) {
        friendList.innerHTML =
            "<li class='empty'>팔로우한 친구가 없습니다.</li>";
        return;
    }

    list.forEach(friend => {

        const li = document.createElement("li");
        li.className = "item";
        li.dataset.userId = friend.userId;

        const imageUrl = friend.profileImageUrl
            ? friend.profileImageUrl
            : "/feed/images/explore/user.png";

        li.innerHTML = `
            <img src="${imageUrl}">
            <span class="user-name">${friend.nickname}</span>
        `;

        friendList.appendChild(li);
    });
}

// 채팅방 리스트 가져오기, 렌더링
async function loadChatRooms() {

    try {
        const res = await fetch("/api/chat/rooms");
        const data = await res.json();

        if (data.result !== "SUCCESS") {
            return;
        }

        const chatList = document.querySelector(".chat-list");
        chatList.innerHTML = "";

        if (!data.rooms || data.rooms.length === 0) {
            chatList.innerHTML =
                "<li class='empty'>채팅방이 없습니다.</li>";
            return;
        }

        data.rooms.forEach(room => {

            const li = document.createElement("li");
            li.className = "item";
            li.dataset.roomId = room.roomId;

            li.innerHTML = `
                <img src="/feed/images/explore/user.png">
                <div class="text">
                    <span class="room-name">${room.nickname}</span>
                    <span class="room-content">${room.lastMessage ?? ""}</span>
                </div>
            
                ${room.unReadCount > 0 
                    ? `<span class="unread-badge">${room.unReadCount}</span>`
                    : ""}
            
                <span class="date">
                    ${formatDate(room.lastMessageAt)}
                </span>
            `;

            chatList.appendChild(li);
        });

    } catch (e) {
        console.error("채팅방 목록 불러오기 실패:", e);
    }
}

// 채팅 내역 가져오기
async function loadMessages(roomId) {

    const $roomModal = document.getElementById("chatRoomModal");
    const $messagesContainer = $roomModal.querySelector(".chat-messages");

    $messagesContainer.innerHTML = ""; // 기존 메시지 초기화

    try {
        const res = await fetch(`/api/chat/room/${roomId}/messages`);
        const data = await res.json();

        if (data.result !== "SUCCESS") return;

        const currentUserId = Number(document.getElementById("chatRoot").dataset.userId);

        data.messages.forEach(msg => {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("chat-message");

            if (msg.senderId === currentUserId) {
                messageDiv.classList.add("me");
            } else {
                messageDiv.classList.add("other");
            }

            messageDiv.innerText = msg.message;
            $messagesContainer.appendChild(messageDiv);
        });

        // 스크롤 맨 아래로
        $messagesContainer.scrollTop = $messagesContainer.scrollHeight;

    } catch (err) {
        console.error("메시지 불러오기 실패:", err);
    }
}

// 메세지 렌더링
function renderMessage(msg) {

    const $messagesContainer =
        document.querySelector("#chatRoomModal .chat-messages");

    const currentUserId =
        Number(document.getElementById("chatRoot").dataset.userId);

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message");

    if (msg.senderId === currentUserId) {
        messageDiv.classList.add("me");
    } else {
        messageDiv.classList.add("other");
    }

    messageDiv.innerText = msg.message;
    $messagesContainer.appendChild(messageDiv);

    $messagesContainer.scrollTop =
        $messagesContainer.scrollHeight;
}

// 최신 메세지 실시간 업데이트
function updateRoomPreview(msg) {

    const roomList = document.querySelector(".chat-list");
    const roomItem = roomList.querySelector(
        `li.item[data-room-id="${msg.roomId}"]`
    );

    if (!roomItem) return;

    // 마지막 메시지 텍스트 업데이트
    const contentEl = roomItem.querySelector(".room-content");
    contentEl.innerText = msg.message;

    // 시간 업데이트
    const dateEl = roomItem.querySelector(".date");
    dateEl.innerText = formatTime(msg.createdAt);

    // 안 읽은 메세지 개수 증가
    if ( currentRoomId !== msg.roomId) { // 현재 방이 아니면
        let badge = roomItem.querySelector(".unread-badge");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "unread-badge";
            badge.innerText = "1";
            roomItem.appendChild(badge);
        } else {
            badge.innerText = Number(badge.innerText) + 1;
        }
    }

    // 맨 위로 이동
    roomList.prepend(roomItem);
}

// 대화시간 형식 지정
function formatDate(dateStr) {

    if (!dateStr) return "";

    const date = new Date(dateStr);
    const now = new Date();

    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "방금";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;

    return date.toLocaleDateString();
}

function formatTime(dateStr) {

    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//웹 소켓 웹 소켓 웹 소켓 웹 소켓 웹 소켓 웹 소켓 웹 소켓 웹 소켓 웹 소켓 웹 소켓 웹 소켓 웹 소켓 웹 소켓 웹 소켓
/////////////////////////////////////////////////////////////////////////////////////////////////////////

let stompClient = null;
let currentSub = null;
let currentRoomId = null;

// 웹 소켓 연결
function connectWebSocket(roomId) {

    const socket = new SockJS("/ws-chat");
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, () => {

        currentSub = stompClient.subscribe(
            `/topic/chat.room.${roomId}`,
            (frame) => {
                const msg = JSON.parse(frame.body);
                renderMessage(msg);
                updateRoomPreview(msg);
            }
        );

    }, (err) => {
        console.error("웹소켓 연결 실패:", err);
    });
}

// 웹 소켓으로 메세지 보내기
function sendMessageWs(roomId, text) {

    const currentUserId =
        Number(document.getElementById("chatRoot").dataset.userId);

    stompClient.send(
        "/app/chat/send",
        {},
        JSON.stringify({
            roomId: roomId,
            senderId: currentUserId,
            message: text
        })
    );
}