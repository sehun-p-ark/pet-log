document.addEventListener('DOMContentLoaded', () => {

    const friendTab = document.getElementById('friendTab');
    const storeTab = document.getElementById('storeTab');
    const friendContent = document.querySelector('.friend-tab-content'); // wrapper
    const storePanel = document.querySelector('.store-panel');
    const container = document.getElementById('descriptionContainer');

    // 서버에서 로그인 여부를 JS로 전달
    const sessionUser = /*[[${sessionUser != null}]]*/ false;

    // ==================== 탭 전환 ====================
    if (friendTab && storeTab) {

        friendTab.addEventListener('click', () => {
            friendTab.classList.add('active');
            storeTab.classList.remove('active');

            friendContent?.classList.remove('hidden');  // 친구 탭 영역 표시
            storePanel?.classList.add('hidden');       // 장소 숨김

            container.style.display = "none";
        });

        storeTab.addEventListener('click', () => {
            storeTab.classList.add('active');
            friendTab.classList.remove('active');

            friendContent?.classList.add('hidden');    // 친구 탭 영역 숨김
            storePanel?.classList.remove('hidden');    // 장소 표시

            container.style.display = "none";
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
            const res = await fetch(`/api/follow/toggle?targetUserId=${targetUserId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await res.json();

            if (result === true) {
                btn.classList.add('following');
                btn.classList.remove('follow');
                btn.textContent = '팔로잉';
            } else if (result === false) {
                btn.classList.remove('following');
                btn.classList.add('follow');
                btn.textContent = '팔로우';
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

        friendList.addEventListener('click', (e) => {
            const item = e.target.closest('.item-wrapper');
            if (!item) return;
            if (e.target.closest('.button')) return;

            const petId = item.dataset.petId;

            if (container.style.display === "block" && container.dataset.openId === petId) {
                container.style.display = "none";
                container.innerHTML = '';
                container.dataset.openId = '';
                return;
            }

            const name = item.querySelector('.nickname')?.textContent || '이름 없음';
            const species = item.querySelector('.species')?.textContent || '종 없음';
            const image = item.querySelector('img')?.src || '';
            const birthDate = item.dataset.birth || '';
            const gender = item.dataset.gender || '';
            const introduction = item.dataset.introduction || '';

            function calculateAge(birth) {
                if (!birth) return '';
                const b = new Date(birth);
                const today = new Date();
                let age = today.getFullYear() - b.getFullYear();
                const m = today.getMonth() - b.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
                return age;
            }

            container.innerHTML = `
        <div class="friend description">
            <button type="button" class="close-btn">X</button>
            <div class="text-wrapper">
                <div class="image">
                    <img src="${image}">
                </div>
                <div class="caption-wrapper">
                    <div><strong>이름:</strong> ${name}</div>
                    <div><strong>타입:</strong> ${species}</div>
                    <div><strong>생년월일:</strong> ${birthDate} (${calculateAge(birthDate)}살)</div>
                    <div><strong>성별:</strong> ${gender}</div>
                    <div><strong>한줄 소개:</strong> ${introduction}</div>
                </div>
            </div>
        </div>
    `;

            container.style.display = "block";
            container.dataset.openId = petId;

            container.querySelector('.close-btn')
                .addEventListener('click', () => {
                    container.style.display = "none";
                    container.innerHTML = '';
                    container.dataset.openId = '';
                });
        });
    }

});