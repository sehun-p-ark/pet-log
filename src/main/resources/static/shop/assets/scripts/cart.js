// 수량 조절
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('plus')) {
        const input = e.target.closest('.quantity-control').querySelector('.quantity-input');
        const cartItem = e.target.closest('.cart-item');
        const cartId = parseInt(cartItem.dataset.cartId);
        let value = parseInt(input.value);

        if (value < 999) {
            const newValue = value + 1;
            input.value = newValue;
            updateQuantityInDB(cartId, newValue).then(() => {
                updateItemPrice(cartItem, newValue);
                updateCartSummary();
            });
        }
    }

    if (e.target.classList.contains('minus')) {
        const input = e.target.closest('.quantity-control').querySelector('.quantity-input');
        const cartItem = e.target.closest('.cart-item');
        const cartId = parseInt(cartItem.dataset.cartId);
        let value = parseInt(input.value);

        if (value > 1) {
            const newValue = value - 1;
            input.value = newValue;
            updateQuantityInDB(cartId, newValue).then(() => {
                updateItemPrice(cartItem, newValue);
                updateCartSummary();
            });
        }
    }
});

// 장바구니 수량 직접 입력
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('quantity-input')) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        const value = parseInt(e.target.value) || 0;
        if (value > 999) {
            showToast('개수는 1~999까지 입력 가능합니다.');
            e.target.value = '999';
        }
    }
});

document.addEventListener('blur', (e) => {
    if (e.target.classList.contains('quantity-input')) {
        const input = e.target;
        const cartItem = input.closest('.cart-item');
        const cartId = parseInt(cartItem.dataset.cartId);
        let value = parseInt(input.value) || 0;

        if (value < 1) {
            showToast('개수는 1~999까지 입력 가능합니다.');
            value = 1;
        }

        input.value = value;
        updateQuantityInDB(cartId, value).then(() => {
            updateItemPrice(cartItem, value);
            updateCartSummary();
        });
    }
}, true);

document.addEventListener('keydown', (e) => {
    if (!e.target.classList.contains('quantity-input')) return;

    if (e.key === 'Enter') {
        e.target.blur();
        return;
    }

    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault();
    }
});

// DB에 수량 업데이트
function updateQuantityInDB(cartId, quantity) {
    return fetch('/shop/cart/update-quantity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, quantity })
    })
        .then(res => res.json())
        .then(result => {
            if (!result.success) {
                console.error('수량 업데이트 실패:', result.message);
            }
        })
        .catch(error => {
            console.error('수량 업데이트 오류:', error);
        });
}

// 개별 상품 가격 업데이트
function updateItemPrice(cartItem, quantity) {
    const price = parseInt(cartItem.dataset.price || 0);
    const additionalPrice = cartItem.dataset.additionalPrice ? parseInt(cartItem.dataset.additionalPrice) : 0;
    const discountRate = parseInt(cartItem.dataset.discountRate || 0);

    const totalPrice = (price + additionalPrice) * quantity;
    const finalPrice = totalPrice * (100 - discountRate) / 100;

    const priceEl = cartItem.querySelector('.single-price');
    if (priceEl) {
        priceEl.textContent = finalPrice.toLocaleString() + '원';
    }
}

// 모두 선택
const selectAll = document.getElementById('select-all');
if (selectAll) {
    selectAll.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        updateCartSummary();
    });
}

// 개별 체크박스 변경
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('item-checkbox')) {
        const allCheckboxes = document.querySelectorAll('.item-checkbox');
        const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
        const selectAll = document.getElementById('select-all');
        if (selectAll) {
            selectAll.checked = allChecked;
        }
        updateCartSummary();
    }
});

// 선택삭제
const choiceDeleteBtn = document.querySelector('.choice-delete');
if (choiceDeleteBtn) {
    choiceDeleteBtn.addEventListener('click', () => {
        const checkedItems = Array.from(document.querySelectorAll('.item-checkbox')).filter(cb => cb.checked);

        if (checkedItems.length === 0) return;

        const cartIds = checkedItems.map(checkbox => {
            const cartItem = checkbox.closest('.cart-item');
            return parseInt(cartItem.dataset.cartId);
        });

        fetch('/shop/cart/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cartIds })
        })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    checkedItems.forEach(checkbox => {
                        checkbox.closest('.cart-item').remove();
                    });

                    const selectAll = document.getElementById('select-all');
                    if (selectAll) selectAll.checked = false;

                    checkEmptyCart();
                    updateCartSummary();
                } else {
                    showToast('삭제에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('삭제 오류:', error);
                showToast('삭제에 실패했습니다.');
            });
    });
}

// 전체삭제
const allDeleteBtn = document.querySelector('.all-delete');
if (allDeleteBtn) {
    allDeleteBtn.addEventListener('click', () => {
        const allItems = document.querySelectorAll('.cart-item');

        if (allItems.length === 0) return;

        const cartIds = Array.from(allItems).map(item => parseInt(item.dataset.cartId));

        fetch('/shop/cart/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cartIds })
        })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    allItems.forEach(item => item.remove());

                    const selectAll = document.getElementById('select-all');
                    if (selectAll) selectAll.checked = false;

                    checkEmptyCart();
                    updateCartSummary();
                } else {
                    showToast('삭제에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('삭제 오류:', error);
                showToast('삭제에 실패했습니다.');
            });
    });
}

function checkEmptyCart() {
    const emptyCart = document.querySelector('.empty-cart');
    const remainingItems = document.querySelectorAll('.cart-item');

    if (emptyCart) {
        if (remainingItems.length === 0) {
            emptyCart.classList.add('show');
        } else {
            emptyCart.classList.remove('show');
        }
    }
}

// 장바구니 금액 계산 및 업데이트
function updateCartSummary() {
    const checkedItems = document.querySelectorAll('.item-checkbox:checked');
    let totalPrice = 0;
    let totalDeliveryFee = 0;
    let totalDiscount = 0;

    checkedItems.forEach(checkbox => {
        const item = checkbox.closest('.cart-item');
        const price = parseInt(item.dataset.price || 0);
        const additionalPrice = item.dataset.additionalPrice ? parseInt(item.dataset.additionalPrice) : 0;
        const discountRate = parseInt(item.dataset.discountRate || 0);
        const deliveryFee = parseInt(item.dataset.deliveryFee || 0);
        const quantity = parseInt(item.querySelector('.quantity-input').value || 1);

        const itemTotal = (price + additionalPrice) * quantity;
        const discount = itemTotal * discountRate / 100;

        totalPrice += itemTotal;
        totalDiscount += discount;
        totalDeliveryFee += deliveryFee;
    });

    const finalAmount = totalPrice - totalDiscount + totalDeliveryFee;

    // 금액 업데이트
    const allPriceEl = document.querySelector('.price.all .result');
    const shipPriceEl = document.querySelector('.price.ship-price .result');
    const discountPriceEl = document.querySelector('.price.discount-price .result');
    const paymentPriceEl = document.querySelector('.price.payment-price .result');

    if (allPriceEl) allPriceEl.textContent = totalPrice.toLocaleString() + '원';
    if (shipPriceEl) shipPriceEl.textContent = '+' + totalDeliveryFee.toLocaleString() + '원';
    if (discountPriceEl) discountPriceEl.textContent = '-' + totalDiscount.toLocaleString() + '원';
    if (paymentPriceEl) paymentPriceEl.textContent = finalAmount.toLocaleString() + '원';

    // 결제 버튼 업데이트 부분
    const paymentBtn = document.querySelector('.payment');
    if (paymentBtn) {
        if (checkedItems.length > 0) {
            paymentBtn.textContent = `${checkedItems.length}개 상품 주문하기`;
            paymentBtn.classList.add('active');
            paymentBtn.classList.remove('disabled');
        } else {
            paymentBtn.textContent = '상품을 선택해주세요.';
            paymentBtn.classList.add('disabled');
            paymentBtn.classList.remove('active');
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    checkEmptyCart();
    updateCartSummary();

    // 초기 개별 가격 설정
    document.querySelectorAll('.cart-item').forEach(cartItem => {
        const quantity = parseInt(cartItem.querySelector('.quantity-input').value || 1);
        updateItemPrice(cartItem, quantity);
    });
});

// 옵션 변경 모달
let currentEditingItem = null;

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-change')) {
        currentEditingItem = e.target.closest('.cart-item');
        const productId = parseInt(currentEditingItem.dataset.productId);
        showOptionModal(currentEditingItem, productId);
    }
});

function showOptionModal(cartItem, productId) {
    const currentOptionId = cartItem.dataset.optionId;

    return fetch(`/shop/cart/options/${productId}`)
        .then(res => res.json())
        .then(result => {
            if (!result.success) {
                showToast('옵션을 불러오는데 실패했습니다');
                return;
            }

            const options = result.options;

            if (!options || options.length === 0) {
                showToast('이 상품은 옵션이 없습니다');
                return;
            }

            const modal = document.createElement('div');
            modal.className = 'option-modal';

            const optionsHTML = options.map(opt => {
                const selected = opt.optionId == currentOptionId ? 'selected' : '';
                return `<option value="${opt.optionId}" data-price="${opt.additionalPrice}" ${selected}>${opt.optionName} ${opt.additionalPrice > 0 ? '(+' + opt.additionalPrice.toLocaleString() + '원)' : ''}</option>`;
            }).join('');

            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>옵션 변경</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="option-list">
                            <select class="option-select">
                                ${optionsHTML}
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-cancel">취소</button>
                        <button class="modal-confirm">변경</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
            modal.querySelector('.modal-overlay').addEventListener('click', () => closeModal(modal));
            modal.querySelector('.modal-cancel').addEventListener('click', () => closeModal(modal));

            modal.querySelector('.modal-confirm').addEventListener('click', () => {
                const selectElement = modal.querySelector('.option-select');
                const selectedOption = selectElement.options[selectElement.selectedIndex];
                const newOptionId = parseInt(selectedOption.value);
                const newOptionName = selectedOption.textContent;
                const additionalPrice = parseInt(selectedOption.dataset.price);
                const cartId = parseInt(cartItem.dataset.cartId);

                fetch('/shop/cart/update-option', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartId, optionId: newOptionId })
                })
                    .then(res => res.json())
                    .then(result => {
                        if (result.success) {
                            cartItem.dataset.optionId = newOptionId;
                            cartItem.dataset.additionalPrice = additionalPrice;

                            const optionEl = cartItem.querySelector('.option');
                            if (optionEl) {
                                optionEl.textContent = newOptionName.split('(')[0].trim();
                            }

                            const quantity = parseInt(cartItem.querySelector('.quantity-input').value);
                            updateItemPrice(cartItem, quantity);
                            updateCartSummary();

                            closeModal(modal);
                        } else {
                            showToast(result.message || '옵션 변경에 실패했습니다');
                        }
                    })
                    .catch(error => {
                        console.error('옵션 변경 오류:', error);
                        showToast('옵션 변경에 실패했습니다');
                    });
            });
        })
        .catch(error => {
            console.error('옵션 조회 오류:', error);
            showToast('옵션을 불러오는데 실패했습니다');
        });
}

function closeModal(modal) {
    modal.remove();
    currentEditingItem = null;
}

// 결제 버튼 클릭 이벤트
const paymentButton = document.querySelector('.summary-wrapper .payment');

if (paymentButton) {
    paymentButton.addEventListener('click', function() {
        const checkedItems = document.querySelectorAll('.item-checkbox:checked');

        if (checkedItems.length === 0) {
            showToast('상품을 선택해주세요.');
            return;
        }

        // 선택된 장바구니 아이템 ID들 수집
        const cartIds = [];
        checkedItems.forEach(checkbox => {
            const cartItem = checkbox.closest('.cart-item');
            const cartId = cartItem.dataset.cartId;
            cartIds.push(cartId);
        });

        // 결제 페이지로 이동 (cartIds를 쿼리 파라미터로 전달)
        window.location.href = `/shop/payment?cartIds=${cartIds.join(',')}`;
    });
}