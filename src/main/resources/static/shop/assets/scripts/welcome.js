document.querySelector('.download-btn').addEventListener('click', async () => {
    const res = await fetch('/shop/coupon/issue?couponId=1', { method: 'POST' });
    const data = await res.json();

    if (res.status === 401) {
        showToast('로그인이 필요합니다.', '로그인하기', '/user/login');
        return;
    }

    if (res.ok) {
        showToast('쿠폰이 발급되었습니다.', '쿠폰함 가기', '/my?menu=0');
    } else {
        showToast(data.message, '', '');
    }
});