/* ================= 상태 변수 ================= */
const $feedContainer = document.getElementById("feed-container");
const $sentinel = document.getElementById("scroll-sentinel");
const $reloadWrapper = document.querySelector(".reload-wrapper");
const $reloadBtn = document.querySelector(".reload-btn");

const $dropdown = document.querySelector(".sort-dropdown");
const $trigger = $dropdown.querySelector("[data-object=button]");
const $valueEl = $dropdown.querySelector(".value");
const $options = $dropdown.querySelectorAll("li");

const $searchInput = document.getElementById('search');
const $searchButton = document.querySelector('button[name="search"]');

let $sort = "latest";
let $currentKeyword = null;

let $lastFeedId = null;
let $lastLikeCount = null;
let $lastCreatedAt = null;

let $loading = false;
let $hasNext = true;

const size = 20;


/* ================= 정렬 드롭다운 ================= */
$trigger.addEventListener("click", () => {
    $dropdown.dataset.open =
        $dropdown.dataset.open === "true" ? "false" : "true";
});

$options.forEach(option => {
    option.addEventListener("click", () => {

        $options.forEach(o => o.classList.remove("select"));
        option.classList.add("select");

        $valueEl.textContent = option.textContent;
        $dropdown.dataset.open = "false";

        $sort = option.dataset.sort;

        observer.disconnect();
        loadFeeds(true);
        observer.observe($sentinel);
    });
});


/* ================= 검색 ================= */
$searchButton.addEventListener('click', () => {
    const keyword = $searchInput.value.trim();

    $currentKeyword = keyword || null;

    observer.disconnect();
    loadFeeds(true);
    observer.observe($sentinel);
});

$searchInput.addEventListener('keydown', (e) => {

    if (e.key === 'Enter') {
        e.preventDefault(); // form submit 방지
        $searchButton.click(); // 기존 검색 버튼 로직 실행
    }

});
/* ================= 피드 로딩 ================= */
async function loadFeeds(reset = false) {

    if ($loading || (!$hasNext && !reset)) return;
    $loading = true;

    if (reset) {
        $feedContainer.innerHTML = '';
        $lastFeedId = null;
        $lastLikeCount = null;
        $lastCreatedAt = null;
        $hasNext = true;
        $reloadWrapper.classList.add('hidden');
        $feedContainer.classList.remove('empty');
    }

    let url = `/api/feed?size=${size}&sort=${$sort}`;

    if ($currentKeyword) {
        url += `&keyword=${encodeURIComponent($currentKeyword)}`;
    }

    if ($lastFeedId !== null) {
        url += `&lastFeedId=${$lastFeedId}`;
    }

    if ($sort === "latest" && $lastCreatedAt !== null) {
        url += `&lastCreatedAt=${encodeURIComponent($lastCreatedAt)}`;
    }

    if ($sort === "like" && $lastLikeCount !== null) {
        url += `&lastLikeCount=${$lastLikeCount}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();

        renderFeeds(data.feedDtos);

        $hasNext = data.hasNext;
        $lastFeedId = data.lastFeedId;
        $lastLikeCount = data.lastLikeCount;
        $lastCreatedAt = data.lastCreatedAt;

        const hasFeedCards = $feedContainer.querySelector('.feed-card') !== null;

        if (!hasFeedCards) {
            $reloadWrapper.classList.add('hidden');
        } else {
            $reloadWrapper.classList.toggle('hidden', $hasNext);
        }

    } catch (e) {
        console.error("피드 로딩 실패", e);
    }

    $loading = false;
}


/* ================= 렌더링 ================= */
function renderFeeds(feeds) {

    if (!feeds || feeds.length === 0) {
        const hasFeedCards = $feedContainer.querySelector('.feed-card') !== null;

        if (!hasFeedCards) {
            $feedContainer.classList.add("empty");

            $feedContainer.innerHTML =
                `<p style="text-align:center;padding:3rem 0;">게시물이 없습니다.</p>`;
        }
        return;
    }

    $feedContainer.classList.remove("empty");

    feeds.forEach(feed => {

        const card = document.createElement("article");
        card.className = "feed-card";
        card.dataset.id = feed.feedId;

        card.innerHTML = `
            <header class="feed-user">
                <a href="/feed/profile/${feed.nickname}" class="user-link">
                    <img class="profile"
                         src="${feed.profileImageUrl || '/feed/images/explore/user.png'}"
                         alt="프로필">
                    <div class="meta">
                        <span class="nickname">${feed.nickname}</span>
                        <span class="place">${feed.address || ''}</span>
                    </div>
                </a>
            </header>

            <a href="/feed/${feed.feedId}" class="feed-image">
                ${feed.feedMediaDtos && feed.feedMediaDtos.length > 0
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
                    <svg class="icon comment">
                        <use href="#icon-comment"></use>
                    </svg>
                </button>
                <span class="count comment">${feed.commentCount}</span>
            </div>
        `;

        $feedContainer.appendChild(card);
    });
}


/* ================= 무한 스크롤 ================= */
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


/* ================= 새로고침 버튼 ================= */
$reloadBtn.addEventListener("click", () => {
    observer.disconnect();
    loadFeeds(true);
    observer.observe($sentinel);
    window.scrollTo({ top: 0, behavior: "smooth" });
});


/* ================= 첫 로딩 ================= */
window.addEventListener("DOMContentLoaded", () => {
    loadFeeds();
});