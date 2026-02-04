document.addEventListener('DOMContentLoaded', () => {
    clickOpenDescription()
    initTabs();
    closeDescription();
});

const $description = document.getElementById('description');
const $list = document.getElementById('list');


const friendTab = document.getElementById('friendTab');
const storeTab = document.getElementById('storeTab');

const friendList = document.querySelector('.friend-list');
const storeList = document.querySelector('.store-list');



function clickOpenDescription() {
    if (!$list || !$description) return;

    const $itemWrappers = $list.querySelectorAll('.item-wrapper');

    $itemWrappers.forEach($item => {
        $item.addEventListener('click', (e) => {

            // ⭐ 버튼 클릭이면 무시
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

    if (!friendTab || !storeTab || !friendList || !storeList) return;

    // 초기 상태
    friendTab.classList.add('active');
    friendList.classList.remove('hidden');
    storeList.classList.add('hidden');

    friendTab.addEventListener('click', () => {
        friendTab.classList.add('active');
        storeTab.classList.remove('active');

        friendList.classList.remove('hidden');
        storeList.classList.add('hidden');
    });

    storeTab.addEventListener('click', () => {
        $description.removeAttribute('data-visible')
        storeTab.classList.add('active');
        friendTab.classList.remove('active');

        storeList.classList.remove('hidden');
        friendList.classList.add('hidden');
    });
}


//팔로우 -> 한번 클릭 팔로잉
//팔로잉 -> 한번 클릭 팔로우 ( 언팔로우 )

document.addEventListener('click', e => {
    const btn = e.target.closest('.button.follow, .button.following');
    if (!btn) return;
    e.stopPropagation(); // ⭐ 부모(.item-wrapper) 클릭 이벤트 막기

    const isFollowing = btn.classList.toggle('following');
    btn.classList.toggle('follow', !isFollowing);

    btn.textContent = isFollowing ? '팔로잉' : '팔로우';
});


