const pathParts = window.location.pathname.split('/');
const $nickname = decodeURIComponent(pathParts[pathParts.length - 1]);
// 피드
const $feedContainer = document.querySelector('.profile-feed');
const $profileTabNav = document.querySelector('.profile-tab-nav');
const $tabs = $profileTabNav.querySelectorAll(':scope > .tab');
/// 채팅
const modal = document.getElementById("chatModal");

// 탭 전환
$tabs.forEach($tab => {
    $tab.addEventListener("click", () => {
        $tabs.forEach($tab => $tab.classList.remove('active'));
        $tab.classList.add('active');

        const type = $tab.getAttribute('name');
        loadFeeds(type);
    });
});

// 탭에 따른 api 보내기
async function loadFeeds(type) {
    let url = '';

    if (type === 'write') url = `/api/feed/profile/${encodeURIComponent($nickname)}/write`;
    if (type === 'heart') url = `/api/feed/profile/${encodeURIComponent($nickname)}/like`;
    if (type === 'etc') url = `/api/feed/profile/${encodeURIComponent($nickname)}/recommend`;

    try {
        const res = await fetch(url);

        if (!res.ok) {
            console.error("API 실패:", res.status);
            return;
        }

        const feeds = await res.json();

        if (!Array.isArray(feeds)) {
            console.error("배열이 아님:", feeds);
            return;
        }

        // 받아온 피드들 띄우기
        renderFeeds(feeds);

    } catch (e) {
        console.error("네트워크 오류:", e);
    }
}

// 피드 화면에 나타내기
function renderFeeds(feeds) {
    $feedContainer.innerHTML = '';

    feeds.forEach(feed => {
        const a = document.createElement('a');
        a.className = 'feed-card';
        a.href = "/feed/" + feed.feedId

        const img = document.createElement('img');
        img.src = feed.thumbnailUrl;

        a.appendChild(img);
        $feedContainer.appendChild(a);
    });
}

// 팔로잉, 팔로워 수 나타내기
function formatCount(count) {
    if (count < 1000) return String(count);
    if (count < 1_000_000) {
        return (count / 1000).toFixed(1).replace('.0','') + 'K';
    }
    if (count < 1_000_000_000) {
        return (count / 1_000_000).toFixed(1).replace('.0','') + 'M';
    }
    return (count / 1_000_000_000).toFixed(1).replace('.0','') + 'B';
}

// 채팅방 모달 띄우기
function openChatModal(roomId) {
    modal.classList.remove("hidden");
    modal.dataset.roomId = roomId;
}
// 채팅방 모달 닫기
function closeChatModal() {
    if(!modal) return;
    modal.classList.add("hidden");
}

// 팔로우 상태에 따른 화면 토글
document.addEventListener('DOMContentLoaded', () => {
    const $btnArea = document.querySelector('.profile-btns');
    if (!$btnArea) return;
    const isMine = $btnArea.dataset.mine === 'true'; // 본인 프로필 확인
    const isFollowing = $btnArea.dataset.following === 'true'; // 팔로우 상태 확인
    const targetUserId = parseInt($btnArea.dataset.targetUserId); // 현재페이지 userId 확인
    const $followerCount = document.querySelector('.stats .item:nth-child(2) strong');
    const $followingCount = document.querySelector('.stats .item:nth-child(3) strong');
    const $chatClose = document.querySelector(".chat-close");
    const $chatOverlay = document.querySelector(".chat-overlay");

    if ($followerCount) {
        $followerCount.textContent = formatCount($followerCount.textContent);
    }

    if ($followingCount) {
        $followingCount.textContent = formatCount($followingCount.textContent);
    }

    // 공유 버튼
    const $share = $btnArea.querySelector('.btn-share');
    if ($share) {
        $share.addEventListener('click', async () => {
            // 임시 : 현재 URL 복사
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('프로필 링크를 복사했습니다.');
            } catch (e) {
                alert('복사 실패. 주소창 URL을 직접 복사해주세요.');
            }
        });
    }

    // 수정 버튼 (내 프로필일 때만 존재)
    const $edit = $btnArea.querySelector('.btn-edit');
    if ($edit) {
        $edit.addEventListener('click', () => {
            // 수정 페이지로
            alert('수정 페이지로 링크 걸어주기')
        });
    }

    // 팔로우 토글 버튼 (남의 프로필일 때만 존재)
    const $followToggle = $btnArea.querySelector('.btn-follow-toggle');
    if ($followToggle) {
        $followToggle.addEventListener('click', async () => {
            const res = await fetch(`/api/feed/follow/${targetUserId}`, {
                method: `POST`
            });

            const data = await res.json();

            switch (data.result) {
                case "LOGIN_REQUIRED" :
                    showMessage("로그인 후 이용 가능합니다.");
                    break;
                case "SUCCESS" :
                    if (data.following) {
                        // 버튼 스타일 변경
                        $followToggle.textContent = '팔로우 해제';
                        $followToggle.classList.remove('is-follow');
                        $followToggle.classList.add('is-following');
                        if ($followerCount) { // 팔로워 +1
                            $followerCount.textContent = formatCount(data.followerCount);
                        }
                        // 이미 메세지 버튼이 없다면 생성
                        if (!$btnArea.querySelector('.btn-message')) {
                            const msgBtn = document.createElement('button');
                            msgBtn.className = 'btn-message';
                            msgBtn.type = 'button';
                            msgBtn.textContent = '메세지';

                            msgBtn.addEventListener('click', () => {
                                alert('메세지 기능 연결 필요');
                            });

                            $btnArea.appendChild(msgBtn);
                        }
                    } else {
                        // 팔로우 취소 상태
                        $followToggle.textContent = '팔로우';
                        $followToggle.classList.remove('is-following');
                        $followToggle.classList.add('is-follow');
                        if ($followerCount) { // 팔로워 -1
                            $followerCount.textContent = formatCount(data.followerCount);
                        }
                        // 메세지 버튼 제거
                        const $messageBtn = $btnArea.querySelector('.btn-message');
                        if ($messageBtn) {
                            $messageBtn.remove();
                        }
                    }
                    break;
                default :
                    showMessage("알 수 없는 이유로 오류가 발생하였습니다.");
                    break;
            }


        });
    }

    // 메세지 버튼
    const $messageBtn = $btnArea.querySelector('.btn-message');
    if ($messageBtn) {
        $messageBtn.addEventListener('click', async () => {
            try {
                const response = await fetch("/api/chat/room", {
                   method: `POST`,
                    headers: {
                       'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({targetUserId: targetUserId})
                });

                const data = await response.json();

                switch (data.result) {
                    case "LOGIN_REQUIRED" : showMessage("로그인 후 이용 가능합니다.");
                        break;
                    case "SUCCESS" :
                        openChatModal(data.roomId);
                        break;
                    default : showMessage("채팅방 생성 실패");
                }
            } catch (e) {
                console.log("채팅방 생성 오류 : " + e);
            }
        });
    }
    // 채팅방 닫기
    $chatClose.addEventListener('click', () => closeChatModal());
    $chatOverlay.addEventListener('click', () => closeChatModal());
});


/********* 처음 화면 로딩 ***********/
loadFeeds('write');