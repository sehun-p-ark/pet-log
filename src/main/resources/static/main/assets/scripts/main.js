document.addEventListener('DOMContentLoaded', () => {

    const friendTab = document.getElementById('friendTab');
    const storeTab = document.getElementById('storeTab');
    const friendContent = document.querySelector('.friend-tab-content');
    const storePanel = document.querySelector('.store-panel');
    const container = document.getElementById('descriptionContainer');

    // 서버에서 로그인 여부를 JS로 전달
    const sessionUser = /*[[${sessionUser != null}]]*/ false;

    // ==================== 탭 전환 ====================
    if (friendTab && storeTab) {

        friendTab.addEventListener('click', () => {
            friendTab.classList.add('active');
            storeTab.classList.remove('active');
            friendContent?.classList.remove('hidden');
            storePanel?.classList.add('hidden');
            container.style.display = "none";
        });

        storeTab.addEventListener('click', () => {
            storeTab.classList.add('active');
            friendTab.classList.remove('active');
            friendContent?.classList.add('hidden');
            storePanel?.classList.remove('hidden');
            container.style.display = "none";
        });
    }

    // ==================== 카테고리 필터 슬라이드 ====================
    const categoryFilter = document.getElementById('categoryFilter');
    const prevBtn = categoryFilter?.querySelector('.front');
    const nextBtn = categoryFilter?.querySelector('.back');
    const categoryBtns = categoryFilter?.querySelectorAll('.category-btn');

    const VISIBLE_COUNT = 3; // 한 번에 보이는 개수
    let currentIndex = 0;

    const updateCategory = () => {
        categoryBtns.forEach((btn, i) => {
            if (i >= currentIndex && i < currentIndex + VISIBLE_COUNT) {
                btn.style.display = '';
            } else {
                btn.style.display = 'none';
            }
        });
    };

    if (categoryBtns?.length) {
        updateCategory();

        prevBtn.addEventListener('click', () => {
            currentIndex -= VISIBLE_COUNT;
            if (currentIndex < 0) currentIndex = categoryBtns.length - VISIBLE_COUNT;
            updateCategory();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex += VISIBLE_COUNT;
            if (currentIndex >= categoryBtns.length) currentIndex = 0;
            updateCategory();
        });

        // 터치 슬라이드
        let touchStartX = 0;
        categoryFilter.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        });
        categoryFilter.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) < 30) return;
            if (diff > 0) {
                currentIndex += VISIBLE_COUNT;
                if (currentIndex >= categoryBtns.length) currentIndex = 0;
            } else {
                currentIndex -= VISIBLE_COUNT;
                if (currentIndex < 0) currentIndex = categoryBtns.length - VISIBLE_COUNT;
            }
            updateCategory();
        });
    }

    // ==================== 팔로우 버튼 ====================
    document.body.addEventListener('click', async e => {
        const btn = e.target.closest('.button.follow, .button.following');
        if (!btn) return;

        e.stopPropagation();

        const targetUserId = btn.dataset.userId;
        if (!targetUserId) return;

        const currentlyFollowing = btn.classList.contains('following');
        try {
            const res = await fetch(`/api/feed/follow/${targetUserId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await res.json();
            if (result.result === 'SUCCESS') {
                if (result.following === true) {
                    btn.classList.add('following');
                    btn.classList.remove('follow');
                    btn.textContent = '팔로잉';
                } else if (result.following === false) {
                    btn.classList.remove('following');
                    btn.classList.add('follow');
                    btn.textContent = '팔로우';
                }
            }

        } catch (err) {
            console.error('팔로우 토글 실패', err);
            alert('팔로우 상태 변경에 실패했습니다.');
            if (currentlyFollowing) {
                btn.classList.add('following');
                btn.classList.remove('follow');
                btn.textContent = '팔로잉';
            } else {
                btn.classList.remove('following');
                btn.classList.add('follow');
                btn.textContent = '팔로우';
            }
        }
    });

// ==================== 친구 클릭 ====================
    if (friendContent && container) {
        const friendList = friendContent.querySelector('.friend-list');
       if (!friendList) {
            return;
        }

        friendList.addEventListener('click', (e) => {
            const item = e.target.closest('.item-wrapper');
            if (!item || e.target.closest('.button')) return;

            // petId 대신 userId를 기준으로 열고 닫기 체크 (DTO에 맞춤)
            const userId = item.dataset.userId;

            if (container.style.display === "block" && container.dataset.openId === userId) {
                container.style.display = "none";
                container.innerHTML = '';
                container.dataset.openId = '';
                return;
            }
            // 유저 닉네임 가져옴
            const nickname = item.querySelector('.nickname').textContent || '무명';

            // 펫 이름을 가져옴 (data-pet-name)
            const petName = item.dataset.petName || '이름 없음';
            const species = item.querySelector('.species')?.textContent || '종 없음';
            const image = item.querySelector('img')?.src || '';
            const birthDate = item.dataset.birth || '';
            const gender = item.dataset.gender || '';
            const introduction = item.dataset.introduction || '';

            // 나이 계산 함수
            const calculateAge = (birth) => {
                if (!birth) return '0';
                const b = new Date(birth);
                const today = new Date();
                let age = today.getFullYear() - b.getFullYear();
                if (new Date(today.getFullYear(), today.getMonth(), today.getDate()) <
                    new Date(today.getFullYear(), b.getMonth(), b.getDate())) age--;
                return age;
            };

            container.innerHTML = `
            <div class="friend description">
                <button type="button" class="close-btn">X</button>
                <div class="text-wrapper">
                    <div class="detail-image">
                        <a href="/feed/profile/${nickname}"><img src="${image}"></a>
                    </div>
                    <div class="caption-wrapper">
                        <div><strong>펫 이름:</strong> ${petName}</div>
                        <div><strong>타입:</strong> ${species}</div>
                        <div><strong>생년월일:</strong> ${birthDate} (${calculateAge(birthDate)}살)</div>
                        <div><strong>성별:</strong> ${gender}</div>
                        <div><strong>한줄 소개:</strong> ${introduction}</div>
                    </div>
                </div>
            </div>
        `;

            container.style.display = "block";
            container.dataset.openId = userId;

            container.querySelector('.close-btn').onclick = () => {
                container.style.display = "none";
                container.innerHTML = '';
                container.dataset.openId = '';
            };
        });
    }

});