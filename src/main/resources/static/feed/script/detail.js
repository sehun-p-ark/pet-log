document.addEventListener('DOMContentLoaded', async () => {
    /* ===== 왼쪽 추천 피드 생성 ===== */
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const feedId = parseInt(pathParts[pathParts.length - 1], 10);
    const userNickname = document.querySelector('.detail-header .nickname').dataset.nickname;
    const res = await fetch(`/api/feed/${feedId}/related`);
    const feeds = await res.json();
    renderFeedDetail(feeds);

    /* ===== 헤더 영역 ===== */
    const $moreWrap = document.querySelector('.feed-more-wrap');

    /* ===== 슬라이드 영역 ===== */
    const track = document.querySelector('.slide-track');
    const slides = document.querySelectorAll('.slide-track img, .slide-track video');
    const prevBtn = document.querySelector('.slide-btn.prev');
    const nextBtn = document.querySelector('.slide-btn.next');
    const indicatorWrap = document.querySelector('.slide-indicators');
    let currentIndex = 0;

    /* ===== 좋아요 및 댓글 영역 ===== */
    const detailArea = document.querySelector('.detail-area');
    const actionBox = detailArea.querySelector('.feed-action');
    const likeBtn = actionBox.querySelector('.action.like');
    const likeIcon = likeBtn.querySelector('use');
    const likeCount = actionBox.querySelector('.count.like');
    const commentBtn = actionBox.querySelector('.action.comment');
    const commentForm = detailArea.querySelector('.comment-form');
    const commentInput = commentForm.querySelector('.comment-input');
    const writeCommentBtn = commentForm.querySelector('.btn');
    const commentSection = detailArea.querySelector('.comments');
    const commentCount = actionBox.querySelector('.count.comment');

    if ($moreWrap) {
        const $moreBtn = document.querySelector('.feed-more-btn');
        const $moreMenu = document.querySelector('.feed-more-menu');
        const $moreEditBtn = $moreMenu.querySelector('.feed-more-edit');
        const $moreDeleteBtn = $moreMenu.querySelector('.feed-more-delete');

        // 피드 더보기 버튼
        $moreBtn.addEventListener('click', () => {
            $moreMenu.classList.toggle('hidden');
        });

        // 수정하기 버튼
        $moreEditBtn.addEventListener('click', () => {
            window.location.href = `/feed/${feedId}/edit`;
            $moreMenu.classList.add("hidden");
        });

        // 삭제하기 버튼
        $moreDeleteBtn.addEventListener('click', async () => {
            $moreMenu.classList.add("hidden");
            const confirmed = await showConfirm("삭제된 게시글은 되돌릴 수 없습니다. 게시글을 삭제하시겠습니까?");
            if (!confirmed) return;
            try {
                const res = await fetch(`/api/feed/${feedId}`, {
                    method: 'DELETE'
                });
                const data = await res.json();
                if (data.result === "LOGIN_REQUIRED") {
                    showMessage("로그인 후 이용가능합니다.");
                    return;
                }
                if (data.result !== "SUCCESS") {
                    showMessage("삭제에 실패하였습니다. 다시 시도해주세요.");
                    return;
                }
                showMessage("삭제되었습니다.");
                window.location.href = `/feed/profile/${userNickname}`;
            } catch (e) {
                console.log("에러발생" + e);
                showMessage("알 수 없는 오류가 발생하였습니다.")
            }
        });
    }

    if (slides.length > 0) {
        slides.forEach((_, i) => { // 점 생성
            const dot = document.createElement('span');
            if (i === 0) dot.classList.add('active');
            indicatorWrap.appendChild(dot);
        });

        updateButtons(); // 버튼 생성
        updateIndicators(); // 흰색 점 생성
    }

    nextBtn.addEventListener('click', () => { // 다음 버튼
        if (currentIndex < slides.length - 1) {
            currentIndex++;
            updateSlide();
            updateButtons();
        }
    });

    prevBtn.addEventListener('click', () => { // 이전 버튼
        if (currentIndex > 0) {
            currentIndex--;
            updateSlide();
            updateButtons();
        }
    });

    // 좋아요 버튼
    likeBtn.addEventListener('click', async () => {
        try {
            const res = await fetch(`/api/feed/${feedId}/like`, {
                method: 'POST'
            });

            const data = await res.json();

            if (data.result === 'LOGIN_REQUIRED') {
                showMessage("로그인 후 이용 가능합니다.");
                return;
            }

            if (data.result !== 'SUCCESS') {
                showMessage("좋아요 처리 실패");
                return;
            }

            if (data.liked) {
                likeBtn.dataset.like = 'true';
                likeIcon.setAttribute('href', '#icon-heart-fill');
            } else {
                likeBtn.dataset.like = 'false';
                likeIcon.setAttribute('href', '#icon-heart');
            }
            likeCount.textContent = data.likeCount;

        } catch (error) {
        console.log(`좋아요 요청 중 오류 발생`, error);
        showMessage('서버 오류가 발생하였습니다. 다시 시도해주세요.');
        }
    });

    // 댓글 아이콘 클릭 시 포커스
    commentBtn.addEventListener('click', () => {
        detailArea.scrollTo({
            top: commentForm.offsetTop,
            behavior: 'smooth',
        });

        commentInput?.focus();
    });

    // 댓글 달기
    writeCommentBtn.addEventListener('click', async() => {
        console.log("이벤트 발생");
        const content = commentInput.value.trim();

        if (!content || content === '') {
            showMessage("댓글을 입력해주세요");
            return;
        }

        try {
            const res = await fetch(`/api/feed/${feedId}/comments`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({content})
            });

            if (!res.ok) {
                throw new Error('서버오류');
            }

            const data = await res.json();
            if (data.result === "LOGIN_REQUIRED") {
                showMessage("로그인 후 이용 가능합니다");
                return;
            }
            if (data.result !== "SUCCESS") {
                showMessage("댓글 등록 실패");
                return;
            }
            // 댓글 등록하기
            addCommentToUI(data.comment);
            commentCount.textContent = parseInt(commentCount.textContent) + 1;
            // 입력창 비워주기
            commentInput.value = '';
        } catch (error) {
        console.error('댓글 등록 오류:', error);
        showMessage('서버 오류가 발생했습니다. 다시 시도해주세요');
        }
    });

    // 엔터로도 댓글 작성 가능
    commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            writeCommentBtn.click();
        }
    });

    // 답글 달기 및 댓글 삭제
    commentSection.addEventListener('click', async (e) => {
        // 답글 버튼 클릭
        const replyBtn = e.target.closest('.reply-btn');
        if (replyBtn) {
            const comment = replyBtn.closest('.comment'); // 댓글 element
            const replyList = comment.querySelector('.reply-list'); // 답글 영역
            const replyForm = comment.querySelector('.reply-form'); // 답글 작성 영역
            const replyInput = comment.querySelector('.reply-input'); // 답글 작성

            replyList.classList.toggle('active');

            replyBtn.textContent =
                replyList.classList.contains('active')
                    ? '댓글 숨기기'
                    : '댓글 더보기';

            replyForm.classList.toggle('hidden');
            if (!replyForm.classList.contains('hidden')) {
                replyInput.focus();
            }
            return;
        }

        // 답글 등록 버튼 클릭
        const replySubmit = e.target.closest('.reply-submit');
        if (replySubmit) {
            const comment = replySubmit.closest('.comment');
            const commentId = comment.dataset.id;
            const input = comment.querySelector('.reply-input');
            const content = input.value.trim();

            if (!content) {
                showMessage('답글을 입력하세요');
                return;
            }

            try {
                const res = await fetch(`/api/feed/${feedId}/comments/${commentId}/replies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content })
                });

                const data = await res.json();

                if (data.result === 'LOGIN_REQUIRED') {
                    showMessage('로그인 후 이용 가능합니다');
                    return;
                }

                if (data.result !== 'SUCCESS') {
                    showMessage('답글 등록 실패');
                    return;
                }

                addReplyToUI(comment, data.reply);
                input.value = '';
                comment.querySelector('.reply-form').classList.add('hidden');

            } catch (err) {
                console.error(err);
            }
            return;
        }

        // 삭제 버튼 클릭
        const deleteBtn = e.target.closest('.comment-delete-btn');
        if (deleteBtn) {
            const comment = deleteBtn.closest('.comment');
            const commentId = comment.dataset.id;

            if (!showConfirm('댓글을 삭제하시겠습니까?')) return;

            try {
                const res = await fetch(`/api/feed/${feedId}/comments/${commentId}`, {
                    method: 'DELETE'
                });

                const data = await res.json();

                if (data.result === "LOGIN_REQUIRED") {
                    showMessage('로그인 후 이용 가능합니다');
                    return;
                }

                if (data.result !== 'SUCCESS') {
                    showMessage('댓글 삭제 실패');
                    return;
                }

                comment.remove();
                commentCount.textContent = parseInt(commentCount.textContent) - 1;

            } catch (err) {
                console.error(err);
                showMessage('서버 오류가 발생했습니다. 다시 시도해주세요');
            }

            return;
        }


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

    // 댓글 화면에 추가
    function addCommentToUI(comment) {
        const article = document.createElement('article');
        article.className = 'comment';
        article.dataset.id = comment.commentId;

        article.innerHTML = `
        <img class="avatar sm"
             src="${comment.profileImageUrl || '/feed/images/explore/user.png'}"
             alt="">
        <div class="comment-body -flex-stretch">
        <div class="comment-top">
            <span class="comment-user">${comment.nickname}</span>
            <span class="comment-time">${comment.timeAgo}</span>
            <button class="comment-delete-btn">삭제</button>
        </div>
        <p class="comment-text">${comment.content}</p>
        <button class="reply-btn">댓글 더보기</button>
        <div class="reply-form hidden">
            <input type="text" class="reply-input" placeholder="답글을 입력하세요">
            <button class="reply-submit">등록</button>
        </div>
        <div class="reply-list"></div>
        </div>`;

        commentSection.appendChild(article);
    }

    // 답글 화면에 추가
    function addReplyToUI(commentElement, reply) {
        const replyList = commentElement.querySelector('.reply-list');
        const article = document.createElement('article');
        article.className = 'comment reply';
        article.dataset.id = reply.id;

        article.innerHTML = `
        <img class="avatar sm"
             src="${reply.profileImageUrl || '/feed/images/explore/user.png'}"
             alt="">
        <div class="comment-body">
            <div class="comment-top">
                <span class="comment-user">${reply.nickname}</span>
                <span class="comment-time">${reply.timeAgo}</span>
                <button class="comment-delete-btn">삭제</button>
            </div>
            <p class="comment-text">${reply.content}</p>
        </div>`;

        replyList.appendChild(article);
    }
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