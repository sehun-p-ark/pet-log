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

    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });

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
        e.target.value = e.target.value.replace(/[^0-9]/g, '');

        const value = parseInt(e.target.value) || 0;
        if (value > 999) {
            showToast('개수는 1~999까지 입력 가능합니다.');
            e.target.value = '999';
        }
    });

    input?.addEventListener('blur', (e) => {
        let value = parseInt(e.target.value) || 0;

        if (value < 1 || value > 999) {
            showToast('개수는 1~999까지 입력 가능합니다.');
            value = Math.min(Math.max(value, 1), 999);
        }

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
    bottomBar.addEventListener('click', () => {
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
    const totalOptionCount = document.querySelectorAll('#option-select option:not([disabled])').length;

    desktopContainer?.querySelectorAll('.option-detail:not(.template)').forEach(el => el.remove());
    mobileContainer?.querySelectorAll('.option-detail:not(.template)').forEach(el => el.remove());

    selectedOptions.forEach(option => {
        if (desktopContainer) {
            const templateDetail = desktopContainer.querySelector('.option-detail.template');
            if (templateDetail) {
                const newOptionDetail = templateDetail.cloneNode(true);
                newOptionDetail.classList.remove('template');
                newOptionDetail.querySelector('.text').textContent = option.name;
                newOptionDetail.querySelector('.quantity-input').value = option.quantity;

                const optionTotal = option.price * option.quantity;
                newOptionDetail.querySelector('.check > .price').textContent = optionTotal.toLocaleString() + '원';
                newOptionDetail.style.display = 'flex';

                if (totalOptionCount <= 1) {
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
            const templateDetail = mobileContainer.querySelector('.option-area > .option-detail.template');
            if (templateDetail) {
                const newOptionDetail = templateDetail.cloneNode(true);
                newOptionDetail.classList.remove('template');
                newOptionDetail.querySelector('.text').textContent = option.name;
                newOptionDetail.querySelector('.quantity-input').value = option.quantity;

                const optionTotal = option.price * option.quantity;
                newOptionDetail.querySelector('.check > .price').textContent = optionTotal.toLocaleString() + '원';
                newOptionDetail.style.display = 'flex';

                if (totalOptionCount <= 1) {
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
    const btn = document.querySelector('.content .cart');
    if (!btn || btn.dataset.login === 'false') {  // null 체크 추가
        showToast('로그인이 필요합니다.', '로그인하기', '/user/login');
        return;
    }

    if (selectedOptions.length === 0) {
        showToast('상품을 선택해주세요.');
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/shop/cart/add', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status < 200 || xhr.status >= 400) return;
        const result = JSON.parse(xhr.responseText);
        if (result.success) {
            showToast('장바구니에 담았습니다.', '장바구니 바로가기', '/shop/cart');
        } else if (result.alreadyExists) {
            showToast('이미 장바구니에 추가되어 있습니다.', '장바구니 바로가기', '/shop/cart');
        } else {
            alert(result.message);
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
    const btn = document.querySelector('.content .buy');
    if (!btn || btn.dataset.login === 'false') {  // null 체크 추가
        showToast('로그인이 필요합니다.', '로그인하기', '/user/login');
        return;
    }

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

// 리뷰 필터 (최신순, 베스트순)
const productId = window.location.pathname.split('/').pop();
const bestFilter = document.querySelector('.best-filter');
const rowFilter = document.querySelector('.row-filter');
const newFilter = document.querySelector('.new-filter');

if (bestFilter) {
    bestFilter.classList.add('active');

    bestFilter.addEventListener('click', () => {
        bestFilter.classList.add('active');
        rowFilter.classList.remove('active');
        newFilter.classList.remove('active');
        fetch(`/shop/products/${productId}/reviews?sort=best`)
            .then(res => res.json())
            .then(data => {
                renderReviews(data.reviews);
                renderRatingSummary(data);
            });
    });

    rowFilter.addEventListener('click', () => {
        rowFilter.classList.add('active');
        bestFilter.classList.remove('active');
        newFilter.classList.remove('active');
        fetch(`/shop/products/${productId}/reviews?sort=low`)
            .then(res => res.json())
            .then(data => {
                renderReviews(data.reviews);
                renderRatingSummary(data);
            });
    });

    newFilter.addEventListener('click', () => {
        newFilter.classList.add('active');
        bestFilter.classList.remove('active');
        rowFilter.classList.remove('active');
        fetch(`/shop/products/${productId}/reviews?sort=new`)
            .then(res => res.json())
            .then(data => {
                renderReviews(data.reviews);
                renderRatingSummary(data);
            });
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;
}

function renderReviews(reviews) {
    const container = document.querySelector('.inner');
    container.querySelectorAll('.review-item').forEach(el => el.remove());
    container.querySelector('.empty')?.remove();

    if (!reviews || reviews.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = '등록된 리뷰가 없습니다.';
        container.appendChild(empty);
        return;
    }

    reviews.forEach(review => {
        const item = document.createElement('div');
        item.className = 'review-item';
        item.innerHTML = `
        <div class="profile">
            <img class="img" src="${review.profileImageUrl || ''}" alt="프로필">
            <div class="info">
                <div class="nickname">${review.petName || ''}</div>
                <div class="rating">
                    <div class="score">${[1,2,3,4,5].map(i => `<span>${i <= review.rating ? '★' : '☆'}</span>`).join('')}</div>
                    <div class="date">${review.createdAt ? formatDate(review.createdAt) : ''}</div>
                </div>
            </div>
        </div>
        <div class="option">${review.optionName || ''}</div>
        <div class="review-images">
            ${(review.reviewImages || []).map(img => `<img src="${img}" class="review-img" alt="리뷰이미지">`).join('')}
        </div>
        <div class="review-text">${review.content || ''}</div>
        <div class="update">수정</div>
        `;

        item.querySelector('.update')?.addEventListener('click', () => {
            openEditModal(review.id, review.rating, review.content);
        });

        container.appendChild(item);
    });
}

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

// 리뷰 모달
const reviewBtn = document.querySelector('.review-btn .button');
const overlay = document.querySelector('.review-modal-overlay');
const modalClose = document.querySelector('.modal-close');
const stars = document.querySelectorAll('.star-input');
const imageInput = document.querySelector('.review-image-input');
const previewImages = document.querySelector('.preview-images');
let selectedRating = 0;
let selectedFiles = [];

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}
if (overlay) {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
}

if (reviewBtn) {
    reviewBtn.addEventListener('click', () => {
        editingReviewId = null; // 새 작성이니까 초기화
        selectedRating = 0;
        stars.forEach(s => s.classList.remove('active'));
        document.querySelector('.review-content').value = '';
        selectedFiles = [];
        previewImages.innerHTML = '';
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

function closeModal() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// 수정 모달 열기
let editingReviewId = null;

function openEditModal(reviewId, rating, content) {
    editingReviewId = reviewId;
    selectedRating = rating;
    stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating));
    document.querySelector('.review-content').value = content;
    selectedFiles = [];
    previewImages.innerHTML = '';

    fetch(`/shop/products/0/reviews/${reviewId}/images`)
        .then(res => res.json())
        .then(images => {
            images.forEach(imageUrl => {
                const wrapper = document.createElement('div');
                wrapper.className = 'preview-img-wrapper';

                const img = document.createElement('img');
                img.src = imageUrl;

                const removeBtn = document.createElement('div');
                removeBtn.className = 'remove-img';
                removeBtn.textContent = '✕';
                removeBtn.addEventListener('click', () => {
                    fetch(`/shop/products/0/reviews/${reviewId}/images?imageUrl=${encodeURIComponent(imageUrl)}`, {
                        method: 'DELETE'
                    }).then(res => {
                        if (res.ok) wrapper.remove();
                    });
                });

                wrapper.appendChild(img);
                wrapper.appendChild(removeBtn);
                previewImages.appendChild(wrapper);
            });
        });

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// 정적 리뷰 수정 버튼
document.querySelectorAll('.review-item .update').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.review-item');
        const reviewId = item.dataset.reviewId;
        const filledStars = [...item.querySelectorAll('.score span')].filter(s => s.textContent === '★').length;
        const content = item.querySelector('.review-text').textContent;
        openEditModal(reviewId, filledStars, content);
    });
});

stars.forEach(star => {
    star.addEventListener('mouseover', () => {
        const val = parseInt(star.dataset.value);
        stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= val));
    });

    star.addEventListener('mouseout', () => {
        stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating));
    });

    star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.value);
        stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating));
    });
});

imageInput?.addEventListener('change', () => {
    Array.from(imageInput.files).forEach(file => {
        if (selectedFiles.length >= 3) return;
        selectedFiles.push(file);

        const wrapper = document.createElement('div');
        wrapper.className = 'preview-img-wrapper';

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);

        const removeBtn = document.createElement('div');
        removeBtn.className = 'remove-img';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', () => {
            selectedFiles = selectedFiles.filter(f => f !== file);
            wrapper.remove();
        });

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        previewImages.appendChild(wrapper);
    });
    imageInput.value = '';
});

document.querySelector('.submit-review')?.addEventListener('click', () => {
    if (selectedRating === 0) {
        showToast('별점을 선택해주세요.');
        return;
    }

    const content = document.querySelector('.review-content').value;
    const productId = getProductIdFromUrl();

    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('rating', selectedRating);
    formData.append('content', content);
    selectedFiles.forEach(file => formData.append('images', file));

    const isEdit = editingReviewId !== null;
    const url = isEdit
        ? `/shop/products/${productId}/reviews/${editingReviewId}`
        : `/shop/products/${productId}/reviews`;
    const method = isEdit ? 'PUT' : 'POST';
    fetch(url, { method, body: formData })
        .then(res => {
            if (res.ok) {
                showToast(isEdit ? '리뷰가 수정되었습니다.' : '리뷰가 등록되었습니다.');
                editingReviewId = null;
                closeModal();
                document.querySelector('.review-tab').click();
                fetch(`/shop/products/${productId}/reviews?sort=best`)
                    .then(res => res.json())
                    .then(data => {
                        renderReviews(data.reviews);
                        renderRatingSummary(data);
                    });
            } else {
                showToast(isEdit ? '리뷰 수정에 실패했습니다.' : '리뷰 등록에 실패했습니다.');
            }
        });
});

function renderRatingSummary(data) {
    const scoreEl = document.querySelector('.summary-score');
    if (scoreEl) scoreEl.textContent = data.averageRating;

    document.querySelectorAll('.rating-summary .stars span').forEach((span, idx) => {
        const i = idx + 1;
        span.className = '';
        if (i <= data.averageRating) span.classList.add('filled');
        else if (i - 0.5 <= data.averageRating) span.classList.add('half');
    });

    const totalCount = data.reviews.length;
    const maxCount = Math.max(...[5,4,3,2,1].map(i => data.ratingMap[i] || 0));
    [5,4,3,2,1].forEach(i => {
        const count = data.ratingMap[i] || 0;
        const width = totalCount > 0 ? (count / totalCount * 100) : 0;
        const item = document.querySelector(`.rating-item.rating-${i}`);
        if (!item) return;
        item.querySelector('.count').textContent = count;
        item.querySelector('.fill').style.width = width + '%';
        const fill = item.querySelector('.fill');
        if (count > 0 && count === maxCount) {
            fill.classList.add('best');
        } else {
            fill.classList.remove('best');
        }
    });
}