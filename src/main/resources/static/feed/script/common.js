(() => { // $feedContainer 변수명이 겹처서 js 전체를 즉시 실행함수로 감쌈
    const common = document.getElementById('createFeedBtn');
// 글쓰기 버튼 스크롤 이벤트
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {   // 100px 이상 스크롤하면
            common.classList.add('compact');
        } else {
            common.classList.remove('compact');
        }
    });
// 글쓰기 버튼 클릭 시 이동 이벤트
    common.addEventListener('click', () => {
        window.location.href = '/feed/create';
    });

    const $feedContainer = document.getElementById("feed-container");
// 좋아요 버튼 클릭 이벤트
    if ($feedContainer) {
        $feedContainer.addEventListener('click', (e) => {
            const $likeBtn = e.target.closest('.like');
            if (!$likeBtn) return;

            const $card = e.target.closest('.feed-card');
            const feedId = $card.dataset.id;
            const $iconUse = $likeBtn.querySelector('use');
            const $likeCount = $card.querySelector('.like.count');

            // 좋아요 누르면 DB 설정 및 좋아요 갯수 +1
            fetch(`/api/feed/${feedId}/like`, {
                method: 'POST',
            })
                .then(res => res.json())
                .then(data => {
                    if (data.result === 'LOGIN_REQUIRED') {
                        alert('로그인이 필요합니다.');
                        return;
                    }

                    if (data.result !== 'SUCCESS') {
                        alert('좋아요 처리 실패');
                        return;
                    }

                    if (data.liked) {
                        $likeBtn.dataset.like = 'true';
                        $iconUse.setAttribute('href', '#icon-heart-fill');
                    } else {
                        $likeBtn.dataset.like = 'false';
                        $iconUse.setAttribute('href', '#icon-heart');
                    }
                    $likeCount.textContent = data.likeCount;
                });
        });
    }
})();