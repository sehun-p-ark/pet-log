// 이메일 도메인 직접 입력
const backEmailSelect = document.querySelector('.email-wrapper .back-email');
if (backEmailSelect) {
    const directInput = document.querySelector('.email-wrapper .direct');

    backEmailSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];

        if (selectedOption.classList.contains('custom')) {
            directInput.style.display = 'block';
            directInput.focus();
        } else {
            directInput.style.display = 'none';
        }
    });
}

// 배송 메시지 직접 입력
const messageSelect = document.querySelector('.delivery-message .message-label');
if (messageSelect) {
    const directMessageInput = document.querySelector('.delivery-message .direct');

    messageSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];

        if (selectedOption.classList.contains('custom')) {
            directMessageInput.style.display = 'block';
            directMessageInput.focus();
        } else {
            directMessageInput.style.display = 'none';
        }
    });
}

// 주소 검색
const cover = document.querySelector('.cover');
const addressCover = document.querySelector('.address-cover');
const button = document.querySelector('.search-btn');
if (button) {
    const addressWrapper = document.getElementById('address-wrapper');
    const addressContainer = document.getElementById('address-container');
    const postalCode = document.querySelector('.postal-code');
    const aboutAddress = document.querySelector('.about-address');
    const detailAddress = document.querySelector('.detail');

    button.addEventListener('click', () => {
        addressCover.style.display = 'block';
        addressWrapper.classList.add('visible');
        new daum.Postcode({
            width: '400px',
            height: '500px',
            oncomplete: function(data) {
                postalCode.textContent = data.zonecode;
                aboutAddress.textContent = data.roadAddress || data.jibunAddress;

                addressCover.style.display = 'none';
                addressWrapper.classList.remove('visible');

                detailAddress.focus();
            }
        }).embed(addressContainer);
    });

    const closeBtn = document.querySelector('#address-wrapper .button');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            addressCover.style.display = 'none';
            addressWrapper.classList.remove('visible');
        });
    }
}

// 배송지 변경 모달 기능
const changeBtn = document.querySelector('.delivery-header .change');
const deliveryModal = document.getElementById('delivery-change-modal');
const modalCloseBtn = document.querySelector('.delivery-change-modal .close-btn');
const modalAddBtn = document.querySelector('.delivery-change-modal .add-btn');

// 초기 금액 설정
let baseAmount = 0;
let deliveryFee = 0;
let couponDiscount = 0;
let pointDiscount = 0;

// 페이지 로드 시 실행 (통합)
document.addEventListener('DOMContentLoaded', () => {
    // 기본배송지 자동 입력 (마이페이지 주소 가져오기)
    const defaultDeliveryItem = document.querySelector('.delivery-item .default-badge')?.closest('.delivery-item');

    if (defaultDeliveryItem) {
        const deliveryName = defaultDeliveryItem.querySelector('.delivery-name').textContent;
        const recipient = defaultDeliveryItem.querySelector('.recipient').textContent;
        const postal = defaultDeliveryItem.querySelector('.postal').textContent;
        const addr = defaultDeliveryItem.querySelector('.addr').textContent;
        const detailAddr = defaultDeliveryItem.querySelector('.detail-addr').textContent;
        const phone = defaultDeliveryItem.querySelector('.phone').textContent;

        document.querySelector('.orderer-name .input').value = recipient;
        document.querySelector('.postal-code').textContent = postal.replace(/\[|\]/g, '');
        document.querySelector('.about-address').textContent = addr;
        document.querySelector('.detail-address .detail').value = detailAddr;

        const phoneParts = phone.split('-');
        if (phoneParts.length === 3) {
            const phoneSelect = document.querySelector('.phone-num .num-select');
            const phoneInput = document.querySelector('.phone-num .input');
            phoneSelect.value = phoneParts[0];
            phoneInput.value = phoneParts[1] + phoneParts[2];
        }
    }

    // 초기 금액 가져오기
    const totalPriceEl = document.querySelector('.price.all .result');
    const deliveryFeeEl = document.querySelector('.price.ship-price .result');

    if (totalPriceEl) {
        baseAmount = parseInt(totalPriceEl.textContent.replace(/[^0-9]/g, ''));
    }
    if (deliveryFeeEl) {
        deliveryFee = parseInt(deliveryFeeEl.textContent.replace(/[^0-9]/g, ''));
    }

    const pasteBtn = document.querySelector('.delivery-header .paste');
    if (pasteBtn) {
        pasteBtn.addEventListener('click', () => {
            const ordererName = document.querySelector('.name-wrapper .input').value;
            const ordererPhonePrefix = document.querySelector('.phone-wrapper .num-select').value;
            const ordererPhoneNum = document.querySelector('.phone-wrapper .input').value;

            document.querySelector('.orderer-name .input').value = ordererName;
            document.querySelector('.phone-num .num-select').value = ordererPhonePrefix;
            document.querySelector('.phone-num .input').value = ordererPhoneNum;
        });
    }

    updatePaymentSummary();
});

if (changeBtn && deliveryModal) {
    changeBtn.addEventListener('click', () => {
        deliveryModal.classList.add('visible');
        cover.style.opacity = '1';
        cover.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden';
    });

    const closeModal = () => {
        deliveryModal.classList.remove('visible');
        cover.style.opacity = '0';
        cover.style.pointerEvents = 'none';
        document.body.style.overflow = '';
    };

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    deliveryModal.addEventListener('click', (e) => {
        if (e.target === deliveryModal) {
            closeModal();
        }
    });

    const selectBtns = document.querySelectorAll('.delivery-item .select-btn');
    selectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = e.target.closest('.delivery-item');

            const postal = item.querySelector('.postal').textContent;
            const addr = item.querySelector('.addr').textContent;
            const detailAddr = item.querySelector('.detail-addr').textContent;

            document.querySelector('.postal-code').textContent = postal.replace(/\[|\]/g, '');
            document.querySelector('.about-address').textContent = addr;
            document.querySelector('.detail-address .detail').value = detailAddr;

            const recipient = item.querySelector('.recipient').textContent;
            const phone = item.querySelector('.phone').textContent;

            document.querySelector('.orderer-name .input').value = recipient;

            const phoneParts = phone.split('-');
            if (phoneParts.length === 3) {
                document.querySelector('.phone-num .num-select').value = phoneParts[0];
                document.querySelector('.phone-num .input').value = phoneParts[1] + phoneParts[2];
            }

            closeModal();
        });
    });

    const deleteBtns = document.querySelectorAll('.delivery-item .delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('이 배송지를 삭제하시겠습니까?')) {
                const item = e.target.closest('.delivery-item');
                const isDefault = item.querySelector('.default-badge') !== null;

                item.remove();

                if (isDefault) {
                    document.querySelector('.orderer-name .input').value = '';
                    document.querySelector('.postal-code').textContent = '';
                    document.querySelector('.about-address').textContent = '';
                    document.querySelector('.detail-address .detail').value = '';
                    document.querySelector('.phone-num .num-select').value = '010';
                    document.querySelector('.phone-num .input').value = '';
                }
            }
        });
    });
}

// 쿠폰 선택 이벤트
const couponSelect = document.getElementById('coupon-select');
if (couponSelect) {
    couponSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];

        if (selectedOption.value === '') {
            couponDiscount = 0;
        } else {
            const discountType = selectedOption.dataset.discountType;
            const discountValue = parseInt(selectedOption.dataset.discountValue);
            const minOrder = parseInt(selectedOption.dataset.minOrder || 0);
            const maxDiscount = selectedOption.dataset.maxDiscount ? parseInt(selectedOption.dataset.maxDiscount) : null;

            if (baseAmount < minOrder) {
                alert(`이 쿠폰은 ${minOrder.toLocaleString()}원 이상 구매 시 사용 가능합니다.`);
                e.target.value = '';
                couponDiscount = 0;
                updatePaymentSummary();
                return;
            }

            if (discountType === 'AMOUNT') {
                couponDiscount = discountValue;
            } else if (discountType === 'PERCENT') {
                couponDiscount = Math.floor(baseAmount * discountValue / 100);

                if (maxDiscount && couponDiscount > maxDiscount) {
                    couponDiscount = maxDiscount;
                }
            }
        }

        updatePaymentSummary();
    });
}

// 포인트 토스트
let currentPointToast = null;

function showPointToast(availablePoint) {
    if (currentPointToast) {
        currentPointToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = `${availablePoint.toLocaleString()}P 까지 사용할 수 있어요.`;
    document.body.appendChild(toast);
    currentPointToast = toast;

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            if (currentPointToast === toast) currentPointToast = null;
        }, 300);
    }, 3000);
}

// 포인트 입력 이벤트
const pointInput = document.querySelector('.point-input .input');
const pointAmountEl = document.querySelector('.remain .amount');
const availablePoint = pointAmountEl ? parseInt(pointAmountEl.dataset.point || 0) : 0; // DB에서 읽어오기

if (pointInput) {
    pointInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');

        if (parseInt(value) > availablePoint) {
            value = availablePoint.toString();
            e.target.value = value;
            showPointToast(availablePoint);  // 토스트
        }
        pointDiscount = parseInt(value) || 0;

        e.target.value = value ? parseInt(value).toLocaleString() : '';

        updatePaymentSummary();
    });
}

// 포인트 전액 사용 버튼
const pointAllButton = document.querySelector('.point-input .button');
if (pointAllButton) {
    pointAllButton.addEventListener('click', () => {
        if (pointInput) {
            pointInput.value = availablePoint.toLocaleString();
            pointDiscount = availablePoint;
            showPointToast(availablePoint);
            updatePaymentSummary();
        }
    });
}

// 결제 금액 요약 업데이트
function updatePaymentSummary() {
    const couponDiscountEl = document.querySelector('.price.discount-coupon .result');
    if (couponDiscountEl) {
        couponDiscountEl.textContent = '-' + couponDiscount.toLocaleString() + '원';
    }

    const pointDiscountEl = document.querySelector('.price.discount-point .result');
    if (pointDiscountEl) {
        pointDiscountEl.textContent = '-' + pointDiscount.toLocaleString() + '원';
    }

    let finalAmount = baseAmount + deliveryFee - couponDiscount - pointDiscount;

    if (finalAmount < 0) {
        finalAmount = 0;
    }

    const paymentPriceEl = document.querySelector('.price.payment-price .result');
    if (paymentPriceEl) {
        paymentPriceEl.textContent = finalAmount.toLocaleString() + '원';
    }

    const paymentBtn = document.querySelector('.payment');
    if (paymentBtn) {
        paymentBtn.textContent = finalAmount.toLocaleString() + '원 결제하기';
    }
}

// 결제 수단 선택
let selectedPaymentMethod = null;

const cardBtn = document.querySelector('.payment-method .card');
const phoneBtn = document.querySelector('.payment-method .phone');
const transferBtn = document.querySelector('.payment-method .transfer');

if (cardBtn) {
    cardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedPaymentMethod = '카드';

        // 선택 표시
        document.querySelectorAll('.payment-method button').forEach(btn => {
            btn.classList.remove('selected');
        });
        cardBtn.classList.add('selected');
    });
}

if (phoneBtn) {
    phoneBtn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedPaymentMethod = '휴대폰';

        document.querySelectorAll('.payment-method button').forEach(btn => {
            btn.classList.remove('selected');
        });
        phoneBtn.classList.add('selected');
    });
}

if (transferBtn) {
    transferBtn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedPaymentMethod = '계좌이체';

        document.querySelectorAll('.payment-method button').forEach(btn => {
            btn.classList.remove('selected');
        });
        transferBtn.classList.add('selected');
    });
}

// 결제 버튼 클릭
const paymentBtn = document.querySelector('.payment');
if (paymentBtn) {
    paymentBtn.addEventListener('click', async () => {

        // 필수 정보 체크
        const ordererName = document.querySelector('.name-wrapper .input').value;
        const ordererPhone = document.querySelector('.phone-wrapper .input').value;
        const receiverName = document.querySelector('.orderer-name .input').value;
        const receiverPhone = document.querySelector('.phone-num .input').value;
        const postalCode = document.querySelector('.postal-code').textContent;

        if (!ordererName) {
            alert('주문자 이름을 입력해주세요.');
            return;
        }
        if (!ordererPhone) {
            alert('주문자 전화번호를 입력해주세요.');
            return;
        }
        if (!receiverName) {
            alert('받는 사람 이름을 입력해주세요.');
            return;
        }
        if (!receiverPhone) {
            alert('받는 사람 전화번호를 입력해주세요.');
            return;
        }
        if (!postalCode) {
            alert('배송지 주소를 입력해주세요.');
            return;
        }
        if (!selectedPaymentMethod) {
            alert('결제 수단을 선택해주세요.');
            return;
        }

        // 최종 결제 금액 확인
        let finalAmount = baseAmount + deliveryFee - couponDiscount - pointDiscount;
        if (finalAmount < 0) finalAmount = 0;

        if (finalAmount === 0) {
            alert('결제 금액이 0원입니다.');
            return;
        }

        // 토스페이먼츠 클라이언트 초기화
        const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

        // TossPayments가 로드되었는지 확인
        if (typeof TossPayments === 'undefined') {
            alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const tossPayments = TossPayments(clientKey);

        // 주문 ID 생성
        const orderId = 'ORDER_' + new Date().getTime();

        // 주문 정보 세션에 저장
        const addressPrimary = document.querySelector('.about-address').textContent;
        const addressSecondary = document.querySelector('.detail-address .detail').value;
        const deliveryRequest = document.querySelector('.delivery-message .direct')?.value ||
            document.querySelector('.message-label')?.options[document.querySelector('.message-label')?.selectedIndex]?.textContent || '';
        const ordererPhoneSelect = document.querySelector('.phone-wrapper .num-select').value;
        const receiverPhoneSelect = document.querySelector('.phone-num .num-select').value;
        const userCouponId = couponSelect?.value || null;

        // 주문 상품 목록 수집
        const items = Array.from(document.querySelectorAll('.product-wrapper')).map(wrapper => ({
            productId: parseInt(wrapper.dataset.productId),
            optionId: wrapper.dataset.optionId ? parseInt(wrapper.dataset.optionId) : null,
            quantity: parseInt(wrapper.dataset.quantity),
            price: Math.floor(parseFloat(wrapper.dataset.price))
        }));

        const saveRes = await fetch('/shop/payment/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ordererName,
                ordererEmail: '',
                ordererPhone: ordererPhoneSelect + ordererPhone,
                receiverName,
                receiverPhone: receiverPhoneSelect + receiverPhone,
                postalCode,
                addressPrimary,
                addressSecondary,
                deliveryRequest,
                paymentMethod: selectedPaymentMethod,
                couponDiscount,
                usedPoint: pointDiscount,
                userCouponId: userCouponId || null,
                deliveryFee,
                items
            })
        });

        if (!saveRes.ok) {
            alert('주문 정보 저장에 실패했습니다. 다시 시도해주세요.');
            return;
        }

        const orderName = '펫로그 상품 주문';

        try {
            // 결제 요청
            await tossPayments.requestPayment(selectedPaymentMethod, {
                amount: finalAmount,
                orderId: orderId,
                orderName: orderName,
                customerName: ordererName,
                successUrl: window.location.origin + '/shop/payment/success',
                failUrl: window.location.origin + '/shop/payment/fail',
            });
        } catch (error) {
            console.error('결제 에러:', error);

            if (error.code === 'USER_CANCEL') {
                alert('결제를 취소하셨습니다.');
            } else if (error.code === 'INVALID_CARD_COMPANY') {
                alert('유효하지 않은 카드사입니다.');
            } else {
                alert('결제 중 오류가 발생했습니다.\n' + (error.message || '다시 시도해주세요.'));
            }
        }
    });
}