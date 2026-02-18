document.addEventListener('DOMContentLoaded', async () => {

    /* ===== 슬라이드 영역 ===== */
    const track = document.querySelector('.slide-track');
    const slides = document.querySelectorAll('.slide-track img, .slide-track video');
    const prevBtn = document.querySelector('.slide-btn.prev');
    const nextBtn = document.querySelector('.slide-btn.next');
    const indicatorWrap = document.querySelector('.slide-indicators');

    let currentIndex = 0;

    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('active');
        indicatorWrap.appendChild(dot);
    });

    function updateIndicators() {
        const dots = indicatorWrap.querySelectorAll('span');
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
    }

    function updateSlide() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateIndicators();
    }

    function updateButtons() {
        prevBtn.classList.toggle('hidden', currentIndex === 0);
        nextBtn.classList.toggle('hidden', currentIndex === slides.length - 1);
    }

    nextBtn.addEventListener('click', () => {
        if (currentIndex < slides.length - 1) {
            currentIndex++;
            updateSlide();
            updateButtons();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlide();
            updateButtons();
        }
    });

    updateButtons();
    updateIndicators();

    /* ===== 왼쪽 추천 피드 ===== */
    const feedId = parseInt(window.location.pathname.split("/").pop(), 10);
    const res = await fetch(`/api/feed/${feedId}/related`);
    const feeds = await res.json();
    renderFeedDetail(feeds);
});


function renderFeedDetail(feeds) {
    const $feedContainer = document.getElementById("feed-container");

    feeds.forEach(feed => {
        const card = document.createElement('div');
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
