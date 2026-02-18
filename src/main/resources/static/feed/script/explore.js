/* ================= 정렬 드롭다운 ================= */
const $dropdown = document.querySelector(".sort-dropdown");
const $trigger = $dropdown.querySelector("[data-object=button]");
const $valueEl = $dropdown.querySelector(".value");
const $options = $dropdown.querySelectorAll("li");


// 정렬 탭 열기, 닫기
$trigger.addEventListener("click", () => {
    $dropdown.dataset.open =
        $dropdown.dataset.open === "true" ? "false" : "true";
});
// 정렬 탭 선택
$options.forEach(option => {
    option.addEventListener("click", () => { // 정렬 기준 선택 이벤트
        $options.forEach(o => o.classList.remove("select"));
        option.classList.add("select");
        $valueEl.textContent = option.textContent;
        $dropdown.dataset.open = "false";

        $sort = option.dataset.sort; //latest 이거나 like 둘 중 하나

        $lastFeedId = null;
        $lastLikeCount = null;
        $lastCreatedAt = null;
        $hasNext = true;

        loadFeeds(true); // 정렬 변경 시 초기화 후 다시 로딩
    });
});

/* ================= 무한 스크롤 ================= */

const $feedContainer = document.getElementById("feed-container");
const $sentinel = document.getElementById("scroll-sentinel");

let $sort = "latest";
let $lastFeedId = null;
let $lastLikeCount = null;
let $lastCreatedAt = null;
let $loading = false;
let $hasNext = true;
const size = 20;

// 피드 불러오기
async function loadFeeds(reset = false) {
    if ($loading || (!$hasNext && !reset)) return; // 로딩 중이거나 마지막에 도달했을 시 중복 로딩 금지
    $loading = true;

    if (reset) { // reset = true : 처음부터 로딩
        const cards = $feedContainer.querySelectorAll(".feed-card");
        cards.forEach(card => card.remove());

        $lastFeedId = null;
        $hasNext = true;
        $lastLikeCount = null;
        $lastCreatedAt = null;
    }

    let url = `/api/feed?size=${size}&sort=${$sort}`; // 처음요청 몇 개,정렬 순
    if ($lastFeedId !== null) {
        url += `&lastFeedId=${$lastFeedId}`; // 마지막 게시물부터 요청
    }
    if ($sort === "latest" && $lastCreatedAt !== null) { // 최신순인 경우
        url += `&lastCreatedAt=${encodeURIComponent($lastCreatedAt)}`; // 마지막 게시물의 createdAt
    }
    if ($sort === "like" && $lastLikeCount !== null) { // 인기순인 경우
        url += `&lastLikeCount=${$lastLikeCount}`; // 마지막 게시물의 likeCount
    }

    const res = await fetch(url); // fetch 요청 보내기
    const data = await res.json(); // 가져온 응답 JSON으로 변경

    renderFeeds(data.feedDtos);

    $hasNext = data.hasNext;
    $lastFeedId = data.lastFeedId;
    $lastLikeCount = data.lastLikeCount;
    $lastCreatedAt = data.lastCreatedAt;

    if(!$hasNext) {
        $reloadWrapper.classList.remove('hidden');
    } else {
        $reloadWrapper.classList.add('hidden');
    }

    $loading = false; // 다 가져온 후 loading 상태 풀기
}

// 피드 화면에 추가
function renderFeeds(feeds) {
    feeds.forEach(feed => {
        const card = document.createElement("article");
        card.className = "feed-card";
        card.dataset.id = feed.feedId;
        card.innerHTML = `
            <header class="feed-user">
                <a href="/feed/profile/${feed.nickname}" class="user-link">
                    <img class="profile" src="${feed.profileImageUrl || '/feed/images/explore/user.png'}" alt="프로필">
                    <div class="meta">
                        <span class="nickname">${feed.nickname}</span>
                        <span class="place">${feed.address}</span>
                    </div>
                </a>
            </header>
            <a href="/feed/${feed.feedId}" class="feed-image">
                ${feed.feedMediaDtos.length > 0
            ? `<img src="${feed.feedMediaDtos[0].mediaUrl}" alt="게시물 이미지">`
            : `<div class="no-image"></div>`}
            </a>
            <a href="/feed/${feed.feedId}" class="feed-content">
                <span class="caption">${feed.title}</span>
            </a>
            <div class="feed-action">
                <button class="action like" data-like="${feed.liked}">
                    <svg class="icon heart">
                        <use href="${feed.liked ? '#icon-heart-fill' : '#icon-heart'}"></use>
                    </svg>
                </button>
                <span class="count like">${feed.likeCount}</span>

                <button class="action comment">
                    <svg class="icon comment"><use href="#icon-comment"></use></svg>
                </button>
                <span class="count comment">${feed.commentCount}</span>
            </div>
        `;

        $feedContainer.appendChild(card);
    });
}

// 스크롤 하단 감지
const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
        loadFeeds();
    }
}, {
    root: null,
    rootMargin: "400px",
    threshold: 0.01
});

observer.observe($sentinel);

// 새로고침 버튼 클릭 시
const $reloadWrapper = document.querySelector(".reload-wrapper");
const $reloadBtn = document.querySelector(".reload-btn");

$reloadBtn.addEventListener("click", () => {
    $reloadWrapper.classList.add('hidden');
    loadFeeds(true);
    window.scrollTo({ top: 0, behavior: "smooth" }); // (추천)
})

/* ================= 다른 페이지 가기 전 정보 저장 ================= */
function saveFeedState() {
    const state = {
        html: $feedContainer.innerHTML,
        scrollY: window.scrollY,
        lastFeedId: $lastFeedId,
        lastLikeCount: $lastLikeCount,
        lastCreatedAt: $lastCreatedAt,
        hasNext: $hasNext
    };
    // sessionStorage에 JSON 형식으로 전부 값 저장
    sessionStorage.setItem("feedState", JSON.stringify(state));
}

$feedContainer.addEventListener("click", e => {
    const link = e.target.closest("a");
    if (!link) return;

    saveFeedState();
})
/* ================= 첫 페이지 로딩 ================= */
window.addEventListener("DOMContentLoaded", () => {
    // 값이 저장되어 있는지?
    const saved = sessionStorage.getItem("feedState");
    // 뒤로가기인지 아닌지 구분하기 위함
    const navEntries = performance.getEntriesByType("navigation");
    const isBackForward = navEntries.length > 0 && navEntries[0].type === "back_forward";

    if (saved !== null && isBackForward) {
        const state = JSON.parse(saved);

        $feedContainer.innerHTML = state.html;
        $lastFeedId = state.lastFeedId;
        $lastLikeCount = state.lastLikeCount;
        $lastCreatedAt = state.lastCreatedAt;
        $hasNext = state.hasNext;
        window.scrollTo(0, state.scrollY);

        sessionStorage.removeItem("feedState");

        setTimeout(() => {
            observer.disconnect();
            const newSentinel = document.getElementById("scroll-sentinel");
            observer.observe(newSentinel);
        }, 0);

    } else {
        sessionStorage.removeItem("feedState");
        loadFeeds();
    }
});
