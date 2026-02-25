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
    common.addEventListener('click', async () => {
        const res = await fetch('/api/feed/create-check', {
          method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
        });

        const data = await res.json();

        switch (data.result) {
            case "LOGIN_REQUIRED" :
                showMessage('로그인 후 이용 가능합니다.');
                break;
            case "SUCCESS" :
                window.location.href = "/feed/create";
                break;
            default :
                showMessage('알 수 없는 오류가 발생하였습니다.');
                break;
        }
    });

    const $feedContainer = document.getElementById("feed-container");
// 좋아요 버튼 클릭 이벤트
    if ($feedContainer) {
        $feedContainer.addEventListener('click', async (e) => {
            const $likeBtn = e.target.closest('.action.like');
            if (!$likeBtn) return;

            const $card = e.target.closest('.feed-card');
            const feedId = $card.dataset.id;
            const $iconUse = $likeBtn.querySelector('use');
            const $likeCount = $card.querySelector('.like.count');

            // 좋아요 누르면 DB 설정 및 좋아요 갯수 +1
            try {
                const res = await fetch(`/api/feed/${feedId}/like`, {
                    method: 'POST'
                });

                const data = await res.json();

                switch (data.result) {
                    case "LOGIN_REQUIRED":
                        showMessage('로그인 후 이용 가능합니다.');
                        break;
                    case "SUCCESS":
                        if (data.liked) {
                            $likeBtn.dataset.like = 'true';
                            $iconUse.setAttribute('href', '#icon-heart-fill');
                        } else {
                            $likeBtn.dataset.like = 'false';
                            $iconUse.setAttribute('href', '#icon-heart');
                        }
                        $likeCount.textContent = data.likeCount;
                        break;
                    default :
                        showMessage('좋아요 처리 실패');
                        break;
                }
            } catch (error) {
                console.log(`좋아요 요청 중 오류 발생`, error);
                showMessage('서버 오류가 발생함');
            }
        });
    }
})();