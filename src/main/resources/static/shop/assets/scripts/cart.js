// 수량 조절
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('plus')) {
        const input = e.target.closest('.quantity-control').querySelector('.quantity-input');
        let value = parseInt(input.value);
        if (value < 999) {
            input.value = value + 1;
            updateItemPrice(input);
            updateFinalPrice();
        }
    }

    if (e.target.classList.contains('minus')) {
        const input = e.target.closest('.quantity-control').querySelector('.quantity-input');
        let value = parseInt(input.value);
        if (value > 1) {
            input.value = value - 1;
            updateItemPrice(input);
            updateFinalPrice();
        }
    }
});

// 개별 상품 가격 업데이트
function updateItemPrice(quantityInput) {
    const cartItem = quantityInput.closest('.cart-item');
    const singlePriceElement = cartItem.querySelector('.single-price');
    const quantity = parseInt(quantityInput.value);
    const itemPrice = 8900; // 임시 상품 가격 (DB 연동 시 실제 가격으로 교체)

    const totalItemPrice = itemPrice * quantity;
    singlePriceElement.textContent = totalItemPrice.toLocaleString() + '원';
}

// 모두 선택
const selectAll = document.querySelector('.select-all');
const getItemCheckboxes = () => document.querySelectorAll('.item-checkbox');

if (selectAll) {
    selectAll.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        getItemCheckboxes().forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        updateFinalPrice();
    });
}

// 개별 체크박스 이벤트 위임
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('item-checkbox')) {
        const allCheckboxes = getItemCheckboxes();
        const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
        selectAll.checked = allChecked;
        updateFinalPrice();
    }
});

// 선택삭제
const choiceDeleteBtn = document.querySelector('.choice-delete');
if (choiceDeleteBtn) {
    choiceDeleteBtn.addEventListener('click', () => {
        const checkedItems = Array.from(getItemCheckboxes()).filter(cb => cb.checked);

        if (checkedItems.length === 0) {
            return;
        }

        checkedItems.forEach(checkbox => {
            const cartItem = checkbox.closest('.cart-item');
            cartItem.remove();
        });

        selectAll.checked = false;

        checkEmptyCart();
        updateFinalPrice();
    });
}

// 전체삭제
const allDeleteBtn = document.querySelector('.all-delete');
if (allDeleteBtn) {
    allDeleteBtn.addEventListener('click', () => {
        const allItems = document.querySelectorAll('.cart-item');

        if (allItems.length === 0) {
            return;
        }

        allItems.forEach(item => item.remove());

        selectAll.checked = false;

        checkEmptyCart();
        updateFinalPrice();
    });
}

// 빈 장바구니
function checkEmptyCart() {
    const emptyCart = document.querySelector('.empty-cart');
    const remainingItems = document.querySelectorAll('.cart-item');

    if (remainingItems.length === 0) {
        emptyCart.style.display = 'block';
    } else {
        emptyCart.style.display = 'none';
    }
}

// 최종 금액 업데이트 (임시 - DB 연동 시 수정 필요)
function updateFinalPrice() {
    const checkedItems = Array.from(getItemCheckboxes()).filter(cb => cb.checked);
    const paymentButton = document.querySelector('.payment');

    if (checkedItems.length === 0) {
        paymentButton.textContent = '상품을 선택해주세요.';
        paymentButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        paymentButton.style.color = '#999';
        paymentButton.style.cursor = 'not-allowed';

        document.querySelector('.price.all .result').textContent = '0원';
        document.querySelector('.price.ship-price .result').textContent = '+0원';
        document.querySelector('.price.discount-price .result').textContent = '0원';
        document.querySelector('.price.payment-price .result').textContent = '0원';
    } else {
        // 임시 가격 계산
        const itemPrice = 8900; // 임시 상품 가격
        let totalQuantity = 0;

        checkedItems.forEach(checkbox => {
            const item = checkbox.closest('.cart-item');
            const quantityInput = item.querySelector('.quantity-input');
            totalQuantity += parseInt(quantityInput.value);
        });

        const totalPrice = itemPrice * totalQuantity;

        document.querySelector('.price.all .result').textContent = totalPrice.toLocaleString() + '원';
        document.querySelector('.price.ship-price .result').textContent = '+0원';
        document.querySelector('.price.discount-price .result').textContent = '0원';
        document.querySelector('.price.payment-price .result').textContent = totalPrice.toLocaleString() + '원';

        paymentButton.textContent = `${checkedItems.length}개 상품 주문하기`;
        paymentButton.style.backgroundColor = '#38A34C';
        paymentButton.style.color = '#ffffff';
        paymentButton.style.cursor = 'pointer';
    }
}

// 페이지 로드 시 초기 가격 업데이트
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.quantity-input').forEach(input => {
        updateItemPrice(input);
    });

    updateFinalPrice();
});

let currentEditingItem = null;

// 옵션 변경 버튼 클릭
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-change')) {
        currentEditingItem = e.target.closest('.cart-item');
        showOptionModal(currentEditingItem);
    }
});

// 모달 표시
function showOptionModal(cartItem) {
    const currentOption = cartItem.querySelector('.option').textContent;

    // 모달 생성
    const modal = document.createElement('div');
    modal.className = 'option-modal';
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
                        <option value="노란색">노란색</option>
                        <option value="파란색">파란색</option>
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

    // 모달 닫기 이벤트
    modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.modal-overlay').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.modal-cancel').addEventListener('click', () => closeModal(modal));

    // 옵션 변경 확인
    modal.querySelector('.modal-confirm').addEventListener('click', () => {
        const selectElement = modal.querySelector('.option-select');
        const selectedValue = selectElement.value;

        if (selectedValue) {
            cartItem.querySelector('.option').textContent = selectedValue;
            closeModal(modal);
        }
    });
}

// 모달 닫기
function closeModal(modal) {
    modal.remove();
    currentEditingItem = null;
}