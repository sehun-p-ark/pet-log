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

function showToast(message, linkText = null, linkHref = null) {
    if (currentToast) {
        currentToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);

    if (linkText && linkHref) {
        const link = document.createElement('a');
        link.href = linkHref;
        link.textContent = linkText;
        link.className = 'toast-link';
        toast.appendChild(link);
    }

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

// ========== 상품 상세 페이지 관련 코드 ==========
// 장바구니 페이지에서는 필요 없는 코드들이지만 에러 방지를 위해 조건부로 실행

// 옵션 관련 변수 (상품 상세 페이지에만 존재)
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

// 옵션 추가
function addOption(name, price, optionId) {
    const isDuplicate = selectedOptions.some(option => option.name === name);
    if (isDuplicate) {
        showToast('이미 선택된 옵션입니다.');
        return false;
    }

    selectedOptions.push({
        name: name,
        price: price,
        quantity: 1,
        optionId: optionId
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

    detailContainer.style.maxHeight = '800px';
    detailContainer.style.overflow = 'hidden';
    background.style.display = 'block';
    moreButton.textContent = '상품설명 더보기';

    moreButton.addEventListener('click', () => {
        if (isExpanded) {
            detailContainer.style.maxHeight = '800px';
            detailContainer.style.overflow = 'hidden';
            background.style.display = 'block';
            moreButton.textContent = '상품설명 더보기';
            isExpanded = false;

            detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            detailContainer.style.maxHeight = 'none';
            detailContainer.style.overflow = 'visible';
            background.style.display = 'none';
            moreButton.textContent = '상품설명 접기';
            isExpanded = true;
        }
    });
}

// 옵션 선택 처리 (상품 상세 페이지에서만 실행)
document.addEventListener('DOMContentLoaded', function() {
    const desktopOptionSelect = document.querySelector('.content .option .list');
    const mobileOptionSelect = document.querySelector('.bottom-option .option .list');

    // 상품 상세 페이지가 아니면 실행하지 않음
    const priceWrapper = document.querySelector('.price-wrapper .price');
    if (!priceWrapper) {
        return; // 장바구니 페이지에서는 여기서 종료
    }

    // 상품 기본 가격
    const basePriceText = priceWrapper.textContent;
    const basePrice = parseInt(basePriceText.replace(/[^0-9]/g, ''));

    // 데스크톱 옵션 선택
    if (desktopOptionSelect) {
        desktopOptionSelect.addEventListener('change', function(e) {
            const selected = this.options[this.selectedIndex];
            if (!selected.value) return;

            const optionId = parseInt(selected.dataset.id);
            const optionName = selected.dataset.name;
            const additionalPrice = parseInt(selected.dataset.price || 0);
            const stock = parseInt(selected.dataset.stock || 0);

            if (stock <= 0) {
                showToast('품절된 옵션입니다.');
                this.value = '';
                return;
            }

            const totalPrice = basePrice + additionalPrice;

            if (addOption(optionName, totalPrice, optionId)) {
                this.value = '';
                if (mobileOptionSelect) mobileOptionSelect.value = '';
            }
        });
    }

    // 모바일 옵션 선택
    if (mobileOptionSelect) {
        mobileOptionSelect.addEventListener('change', function(e) {
            const selected = this.options[this.selectedIndex];
            if (!selected.value) return;

            const optionId = parseInt(selected.dataset.id);
            const optionName = selected.dataset.name;
            const additionalPrice = parseInt(selected.dataset.price || 0);
            const stock = parseInt(selected.dataset.stock || 0);

            if (stock <= 0) {
                showToast('품절된 옵션입니다.');
                this.value = '';
                return;
            }

            const totalPrice = basePrice + additionalPrice;

            if (addOption(optionName, totalPrice, optionId)) {
                this.value = '';
                if (desktopOptionSelect) desktopOptionSelect.value = '';
            }
        });
    }

    // 옵션 자동 추가 로직
    if (desktopOptionSelect || mobileOptionSelect) {
        const selectElement = desktopOptionSelect || mobileOptionSelect;

        if (selectElement.options.length === 2) {
            const onlyOption = selectElement.options[1];
            const optionId = parseInt(onlyOption.dataset.id);
            const optionName = onlyOption.dataset.name;
            const additionalPrice = parseInt(onlyOption.dataset.price || 0);
            const totalPrice = basePrice + additionalPrice;
            addOption(optionName, totalPrice, optionId);
        }
    } else {
        const productNameEl = document.querySelector('.product-name');
        if (productNameEl) {
            const productName = productNameEl.textContent;
            addOption(productName, basePrice, null);
        }
    }
});

// 옵션 동기화
function syncOptions() {
    const desktopContainer = document.querySelector('.content');
    const mobileContainer = document.querySelector('.bottom-option');

    desktopContainer?.querySelectorAll('.option-detail[style*="flex"]').forEach(el => el.remove());
    mobileContainer?.querySelectorAll('.option-detail[style*="flex"]').forEach(el => el.remove());

    selectedOptions.forEach(option => {
        if (desktopContainer) {
            const templateDetail = desktopContainer.querySelector('.option-detail');
            if (templateDetail) {
                const newOptionDetail = templateDetail.cloneNode(true);
                newOptionDetail.querySelector('.text').textContent = option.name;
                newOptionDetail.querySelector('.quantity-input').value = option.quantity;

                const optionTotal = option.price * option.quantity;
                newOptionDetail.querySelector('.check > .price').textContent = optionTotal.toLocaleString() + '원';
                newOptionDetail.style.display = 'flex';

                if (selectedOptions.length === 1) {
                    newOptionDetail.querySelector('.delete-btn').style.display = 'none';
                }

                const finalElement = desktopContainer.querySelector('.final');
                if (finalElement) {
                    finalElement.insertAdjacentElement('beforebegin', newOptionDetail);
                    setupQuantityControls(newOptionDetail, option);
                    setupDeleteButton(newOptionDetail, option);
                }
            }
        }

        if (mobileContainer) {
            const templateDetail = mobileContainer.querySelector('.option-area > .option-detail');
            if (templateDetail) {
                const newOptionDetail = templateDetail.cloneNode(true);
                newOptionDetail.querySelector('.text').textContent = option.name;
                newOptionDetail.querySelector('.quantity-input').value = option.quantity;

                const optionTotal = option.price * option.quantity;
                newOptionDetail.querySelector('.check > .price').textContent = optionTotal.toLocaleString() + '원';
                newOptionDetail.style.display = 'flex';

                if (selectedOptions.length === 1) {
                    newOptionDetail.querySelector('.delete-btn').style.display = 'none';
                }

                const finalElement = mobileContainer.querySelector('.option-area .final');
                if (finalElement) {
                    finalElement.insertAdjacentElement('beforebegin', newOptionDetail);
                    setupQuantityControls(newOptionDetail, option);
                    setupDeleteButton(newOptionDetail, option);
                }
            }
        }
    });

    updateAllFinalPrices();
}

// ========== 장바구니 담기 기능 ==========

document.addEventListener('DOMContentLoaded', function() {
    const desktopCartBtn = document.querySelector('.content .cart');
    const mobileCartBtn = document.querySelector('.bottom-option .cart-btn');

    if (desktopCartBtn) {
        desktopCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart();
        });
    }

    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart();
        });
    }
});

function addToCart() {
    if (selectedOptions.length === 0) {
        showToast('상품을 선택해주세요.');
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/shop/cart/add', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
                showToast('장바구니에 담았습니다.', '장바구니 바로가기', '/shop/cart');
            } else if (result.alreadyExists) {
                showToast('이미 장바구니에 추가되어 있습니다.', '장바구니 바로가기', '/shop/cart');
            } else {
                alert(result.message);
            }
        }
    };

    xhr.send(JSON.stringify({
        items: selectedOptions.map(option => ({
            productId: getProductIdFromUrl(),
            optionId: option.optionId || null,
            quantity: option.quantity
        }))
    }));
}

function getProductIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    return parseInt(pathParts[pathParts.length - 1]);
}

document.addEventListener('DOMContentLoaded', function() {
    const desktopBuyBtn = document.querySelector('.content .buy');
    const mobileBuyBtn = document.querySelector('.bottom-option .buy-btn');

    if (desktopBuyBtn) {
        desktopBuyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            buyNow();
        });
    }

    if (mobileBuyBtn) {
        mobileBuyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            buyNow();
        });
    }
});

// 바로 구매
document.addEventListener('DOMContentLoaded', function() {
    const desktopBuyBtn = document.querySelector('.content .buy');
    const mobileBuyBtn = document.querySelector('.bottom-option .buy-btn');

    if (desktopBuyBtn) {
        desktopBuyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            buyNow();
        });
    }

    if (mobileBuyBtn) {
        mobileBuyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            buyNow();
        });
    }
});

function buyNow() {
    if (selectedOptions.length === 0) {
        showToast('상품을 선택해주세요.');
        return;
    }

    const productId = getProductIdFromUrl();
    const option = selectedOptions[0];
    const optionId = option.optionId || 'null';
    const quantity = option.quantity;

    window.location.href = `/shop/payment/buynow?productId=${productId}&optionId=${optionId}&quantity=${quantity}`;
}

// 리뷰 필터
const filterBoxes = document.querySelectorAll('.star-filter, .option-filter');

filterBoxes.forEach(box => {
    const btn = box.querySelector('.filter-btn');
    const dropdown = box.querySelector('.dropdown');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();

        document.querySelectorAll('.dropdown')
            .forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });

        dropdown.classList.toggle('active');
    });

    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown')
        .forEach(d => d.classList.remove('active'));
});

// 리뷰 개수 클릭 시 리뷰 탭으로 이동
document.querySelectorAll('.review-wrapper .count').forEach(count => {
    count.addEventListener('click', () => {
        document.querySelector('.review-tab').click();

        const reviewContainer = document.querySelector('.review-container');
        reviewContainer.style.display = 'flex';
        document.querySelector('.detail').style.display = 'none';

        reviewContainer.scrollIntoView({ behavior: 'smooth' });
    });
});