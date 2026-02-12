document.addEventListener('DOMContentLoaded', () => {
    clickOpenDescription()
    initTabs();
    closeDescription();

    initPlaceBackButton();
    bindPlaceItemClick();
});

const $description = document.getElementById('description');
const $list = document.getElementById('list');


const friendTab = document.getElementById('friendTab');
const storeTab = document.getElementById('storeTab');

const friendList = document.querySelector('.main.friend-list');
const storeList = document.querySelector('.store-list');

// 장소 탭 상세 페이지
const storePanel = document.querySelector('.store-panel');
const placeListView = document.querySelector('.place-list-view');
const placeDetailView = document.querySelector('.place-detail-view');
const placeDetailContent = document.querySelector('.place-detail-content');
const backBtn = document.querySelector('.place-detail-view .back-btn');


function clickOpenDescription() {
    if (!$list || !$description) return;

    const $itemWrappers = $list.querySelectorAll('.item-wrapper');

    $itemWrappers.forEach($item => {
        $item.addEventListener('click', (e) => {

            // 버튼 클릭이면 무시
            if (e.target.closest('.button')) return;

            // 친구 탭 아닐 때도 무시
            if (!friendTab.classList.contains('active')) return;

            toggleDescription();
        });
    });
}

function closeDescription() {
    if (!$description) return;

    const $closeBtn = $description.querySelector(':scope > .close-btn > .close');
    if (!$closeBtn) return;

    $closeBtn.addEventListener('click', () => {
        $description.removeAttribute('data-visible');
    });
}

function toggleDescription() {
    if (!friendTab.classList.contains('active')) return;

    if ($description.hasAttribute('data-visible')) {
        $description.removeAttribute('data-visible');
    } else {
        $description.setAttribute('data-visible', 'true');
    }
}

function initTabs() {
    if (
        !friendTab ||
        !storeTab ||
        !friendList ||
        !storePanel ||
        !placeListView ||
        !placeDetailView
    ) return;

    /* ========= 초기 상태 ========= */
    friendTab.classList.add('active');
    storeTab.classList.remove('active');

    friendList.classList.remove('hidden');
    storePanel.classList.add('hidden');   //

    placeListView.classList.add('hidden');
    placeDetailView.classList.add('hidden');

    /* ========= 친구 탭 ========= */
    friendTab.addEventListener('click', () => {
        friendTab.classList.add('active');
        storeTab.classList.remove('active');

        friendList.classList.remove('hidden');
        storePanel.classList.add('hidden'); //

        placeListView.classList.add('hidden');
        placeDetailView.classList.add('hidden');
    });

    /* ========= 장소 탭 ========= */
    storeTab.addEventListener('click', () => {
        console.log('장소탭 클릭됨');

        if ($description) {
            $description.removeAttribute('data-visible');
        }

        storeTab.classList.add('active');
        friendTab.classList.remove('active');

        friendList.classList.add('hidden');
        storePanel.classList.remove('hidden'); //

        placeListView.classList.remove('hidden');
        placeDetailView.classList.add('hidden');
    });
}


//팔로우 -> 한번 클릭 팔로잉
//팔로잉 -> 한번 클릭 팔로우 ( 언팔로우 )

document.addEventListener('click', e => {
    const btn = e.target.closest('.button.follow, .button.following');
    if (!btn) return;
    e.stopPropagation(); // 부모(.item-wrapper) 클릭 이벤트 막기

    const isFollowing = btn.classList.toggle('following');
    btn.classList.toggle('follow', !isFollowing);

    btn.textContent = isFollowing ? '팔로잉' : '팔로우';
});


function openPlaceDetail(placeData) {
    // 리스트 숨기고
    placeListView.classList.add('hidden');

    // 상세 보이게
    placeDetailView.classList.remove('hidden');

    // 내용 채우기 (예시)
    placeDetailContent.innerHTML = `
        <h2>${placeData.name}</h2>
        <p>${placeData.address}</p>
        <p>${placeData.phone ?? ''}</p>
    `;
}

function initPlaceBackButton() {
    if (!backBtn) return;

    backBtn.addEventListener('click', () => {
        placeDetailView.classList.add('hidden');
        placeListView.classList.remove('hidden');
    });
}

function bindPlaceItemClick() {
    const items = document.querySelectorAll('.store-list .item');

    items.forEach(item => {
        item.addEventListener('click', () => {
            const placeData = {
                name: item.dataset.name,
                address: item.dataset.address,
                phone: item.dataset.phone
            };

            openPlaceDetail(placeData);
        });
    });
}



//모달
const reserveModal = document.getElementById('reserveModal');
const closeReserveBtn = reserveModal.querySelector('.close-btn');
const cancelBtn = reserveModal.querySelector('.cancel');

//모달 열 때 이전 값 초기화
function openReserveModal() {
    reserveModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

function closeReserveModal() {
    reserveModal.classList.remove('open');
    document.body.style.overflow = '';
}
// 예약하기 버튼
document.addEventListener('click', e => {
    const btn = e.target.closest('.reserve-btn');
    if (!btn) return;

    openReserveModal();
});


// 닫기 (X)
closeReserveBtn.addEventListener('click', closeReserveModal);

// 취소 버튼
cancelBtn.addEventListener('click', closeReserveModal);

// 오버레이 클릭 시 닫기
reserveModal.addEventListener('click', e => {
    if (e.target === reserveModal) {
        closeReserveModal();
    }
});

// ESC 키
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && reserveModal.classList.contains('open')) {
        closeReserveModal();
    }
});



//예약 버튼에서 데이터 수집 (백엔드 )
const confirmBtn = reserveModal.querySelector('.confirm');

confirmBtn.addEventListener('click', () => {
    const date = reserveModal.querySelector('input[type="date"]').value;
    const time = reserveModal.querySelector('input[type="time"]').value;

    if (!date || !time) {
        alert('날짜와 시간을 선택해주세요.');
        return;
    }

    const data = {
        date,
        time,
        paymentMethod: 'OFFLINE'
    };

    console.log('예약 데이터:', data);
    closeReserveModal();
});
