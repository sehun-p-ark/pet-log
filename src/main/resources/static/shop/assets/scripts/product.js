// 즐겨찾기
const hearts = document.querySelectorAll('.image.bookmark');
hearts.forEach(heart => {
    heart.addEventListener('click', () => {
        const isActive = heart.classList.contains('active');
        hearts.forEach(h => {
            if (isActive) {
                h.classList.remove('active');
            } else {
                h.classList.add('active');
            }
        });

        if (!isActive) {
            showToast('즐겨찾기가 완료 되었습니다.');
        } else {
            showToast('즐겨찾기가 취소되었습니다.');
        }
    });
});

// 공유
const shareBtns = document.querySelectorAll('.image.share');
shareBtns.forEach(shareBtn => {
    shareBtn.addEventListener('click', () => {
        const currentUrl = window.location.href;

        navigator.clipboard.writeText(currentUrl)
            .then(() => {
                showToast('링크가 복사되었습니다.');
            })
            .catch(() => {
                showToast('링크 복사에 실패했습니다.');
            })
    });
});

// 토스트 메세지
let currentToast = null;

function showToast(message) {
    if (currentToast) {
        currentToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    currentToast = toast;

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            if (currentToast === toast) {
                currentToast = null;
            }
        }, 300);
    }, 3000);
}

let selectedOptions = [];

// 최종 금액 계산
function updateAllFinalPrices() {
    let total = 0;

    selectedOptions.forEach(option => {
        total += option.quantity * option.price;
    });

    const desktopFinal = document.querySelector('.content .final-price');
    if (desktopFinal) {
        desktopFinal.textContent = total.toLocaleString() + '원';
    }

    const mobileFinal = document.querySelector('.bottom-option .final-price');
    if (mobileFinal) {
        mobileFinal.textContent = total.toLocaleString() + '원';
    }
}

// 옵션 동기화
function syncOptions() {
    const desktopContainer = document.querySelector('.content');
    const mobileContainer = document.querySelector('.bottom-option');

    // 기존 옵션 제거
    desktopContainer?.querySelectorAll('.option-detail[style*="flex"]').forEach(el => el.remove());
    mobileContainer?.querySelectorAll('.option-detail[style*="flex"]').forEach(el => el.remove());

    // 선택된 옵션들로 다시 생성
    selectedOptions.forEach(option => {
        if (desktopContainer) {
            const templateDetail = desktopContainer.querySelector('.option-detail');
            const newOptionDetail = templateDetail.cloneNode(true);
            newOptionDetail.querySelector('.text').textContent = option.name;
            newOptionDetail.querySelector('.quantity-input').value = option.quantity;
            newOptionDetail.querySelector('.check > .price').textContent = option.price.toLocaleString() + '원';
            newOptionDetail.style.display = 'flex';

            const finalElement = desktopContainer.querySelector('.final');
            finalElement.insertAdjacentElement('beforebegin', newOptionDetail);

            setupQuantityControls(newOptionDetail, option);
            setupDeleteButton(newOptionDetail, option);
        }

        if (mobileContainer) {
            const templateDetail = mobileContainer.querySelector('.option-area > .option-detail');
            const newOptionDetail = templateDetail.cloneNode(true);
            newOptionDetail.querySelector('.text').textContent = option.name;
            newOptionDetail.querySelector('.quantity-input').value = option.quantity;
            newOptionDetail.querySelector('.check > .price').textContent = option.price.toLocaleString() + '원';
            newOptionDetail.style.display = 'flex';

            const finalElement = mobileContainer.querySelector('.option-area .final');
            finalElement.insertAdjacentElement('beforebegin', newOptionDetail);

            setupQuantityControls(newOptionDetail, option);
            setupDeleteButton(newOptionDetail, option);
        }
    });

    updateAllFinalPrices();
}

// 옵션 추가
function addOption(name, price) {
    const isDuplicate = selectedOptions.some(option => option.name === name);
    if (isDuplicate) {
        showToast('이미 선택된 옵션입니다.');
        return false;
    }

    selectedOptions.push({
        name: name,
        price: price,
        quantity: 1
    });

    syncOptions();
    return true;
}

// 옵션 삭제
function removeOption(name) {
    selectedOptions = selectedOptions.filter(option => option.name !== name);
    syncOptions();
}

// 수량 변경
function updateQuantity(name, quantity) {
    const option = selectedOptions.find(opt => opt.name === name);
    if (option) {
        option.quantity = quantity;
        syncOptions();
    }
}

// 삭제
function setupDeleteButton(element, option) {
    const deleteBtn = element.querySelector('.delete-btn');
    deleteBtn?.addEventListener('click', () => {
        removeOption(option.name);
    });
}

// 수량 조절
function setupQuantityControls(element, option) {
    const plusBtn = element.querySelector('.plus');
    const minusBtn = element.querySelector('.minus');
    const input = element.querySelector('.quantity-input');

    plusBtn?.addEventListener('click', () => {
        let value = parseInt(input.value);
        if (value < 999) {
            updateQuantity(option.name, value + 1);
        }
    });

    minusBtn?.addEventListener('click', () => {
        let value = parseInt(input.value);
        if (value > 1) {
            updateQuantity(option.name, value - 1);
        }
    });

    input?.addEventListener('input', (e) => {
        let numericValue = e.target.value.replace(/[^0-9]/g, '');
        let value = parseInt(numericValue) || 1;

        if (value < 1) value = 1;
        if (value > 999) value = 999;

        updateQuantity(option.name, value);
    });

    input?.addEventListener('keypress', (e) => {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    });
}

// 옵션 선택 (데스크탑)
const desktopOptionSelect = document.querySelector('.content .option .list');
if (desktopOptionSelect) {
    desktopOptionSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.value;
        if (selectedOption) {
            const price = 8900;
            if (addOption(selectedOption, price)) {
                desktopOptionSelect.selectedIndex = 0;
            } else {
                desktopOptionSelect.selectedIndex = 0;
            }
        }
    });
}

// 옵션 선택 (모바일)
const mobileOptionSelect = document.querySelector('.bottom-option .option .list');
if (mobileOptionSelect) {
    mobileOptionSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.value;
        if (selectedOption) {
            const price = 8900;
            if (addOption(selectedOption, price)) {
                mobileOptionSelect.selectedIndex = 0;
            } else {
                mobileOptionSelect.selectedIndex = 0;
            }
        }
    });
}

// 상세페이지 및 리뷰 창 전환
const infoTab = document.querySelector('.info-tab');
const reviewTab = document.querySelector('.review-tab');
const detail = document.querySelector('#product .detail-wrapper .container > .detail');
const review = document.querySelector('#product .detail-wrapper .container > .review-container');

if (infoTab && reviewTab && detail && review) {
    infoTab.classList.add('active');
    reviewTab.classList.remove('active');
    detail.style.display = 'flex';
    review.style.display = 'none';

    infoTab.addEventListener('click', () => {
        infoTab.classList.add('active');
        reviewTab.classList.remove('active');
        detail.style.display = 'flex';
        review.style.display = 'none';
    });

    reviewTab.addEventListener('click', () => {
        reviewTab.classList.add('active');
        infoTab.classList.remove('active');
        detail.style.display = 'none';
        review.style.display = 'flex';
    });
}

// 모바일 옵션 열기/닫기
const imageWrapper = document.querySelector('.bottom-option .image-wrapper');
const optionArea = document.querySelector('.bottom-option .option-area');
const bottomBar = document.querySelector('.bottom-option .bottom-bar');

if (imageWrapper && optionArea && bottomBar) {
    imageWrapper.addEventListener('click', () => {
        console.log('화살표 클릭!'); // 디버깅용
        optionArea.classList.toggle('show');
        bottomBar.classList.toggle('active');
    });
}

// 상품 상세 이미지 펼치기/접기 기능
const detailContainer = document.querySelector('.detail');
const detailImage = document.querySelector('.detail > .image');
const moreButton = document.querySelector('.detail > .more');
const background = document.querySelector('.detail > .background');

if (detailContainer && detailImage && moreButton && background) {
    let isExpanded = false;

    detailContainer.style.maxHeight = '500px';
    detailContainer.style.overflow = 'hidden';
    background.style.display = 'block';
    moreButton.textContent = '상품설명 더보기';

    moreButton.addEventListener('click', () => {
        if (isExpanded) {
            // 접기
            detailContainer.style.maxHeight = '500px';
            detailContainer.style.overflow = 'hidden';
            background.style.display = 'block';
            moreButton.textContent = '상품설명 더보기';
            isExpanded = false;

            detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // 펼치기
            detailContainer.style.maxHeight = 'none';
            detailContainer.style.overflow = 'visible';
            background.style.display = 'none';
            moreButton.textContent = '상품설명 접기';
            isExpanded = true;
        }
    });
}