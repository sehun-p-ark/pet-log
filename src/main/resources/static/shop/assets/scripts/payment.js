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
const button = document.querySelector('.search-btn');
if (button) {
    const cover = document.querySelector('.cover');
    const addressWrapper = document.getElementById('address-wrapper');
    const addressContainer = document.getElementById('address-container');
    const postalCode = document.querySelector('.postal-code');
    const aboutAddress = document.querySelector('.about-address');
    const detailAddress = document.querySelector('.detail');

    button.addEventListener('click', () => {
        cover.style.display = 'block';
        addressWrapper.classList.add('visible');
        new daum.Postcode({
            width: '400px',
            height: '500px',
            oncomplete: function(data) {
                postalCode.textContent = data.zonecode;
                aboutAddress.textContent = data.roadAddress || data.jibunAddress;

                cover.style.display = 'none';
                addressWrapper.classList.remove('visible');

                detailAddress.focus();
            }
        }).embed(addressContainer);
    });

    const closeBtn = document.querySelector('#address-wrapper .button');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            cover.style.display = 'none';
            addressWrapper.classList.remove('visible');
        });
    }
}

// 배송지 변경 모달 기능
const changeBtn = document.querySelector('.delivery-header .change');
const deliveryModal = document.getElementById('delivery-change-modal');
const modalCloseBtn = document.querySelector('.delivery-change-modal .close-btn');
const modalAddBtn = document.querySelector('.delivery-change-modal .add-btn');

// 페이지 로드 시 기본배송지 자동 입력
document.addEventListener('DOMContentLoaded', () => {
    const defaultDeliveryItem = document.querySelector('.delivery-item .default-badge')?.closest('.delivery-item');

    if (defaultDeliveryItem) {
        const deliveryName = defaultDeliveryItem.querySelector('.delivery-name').textContent;
        const recipient = defaultDeliveryItem.querySelector('.recipient').textContent;
        const postal = defaultDeliveryItem.querySelector('.postal').textContent;
        const addr = defaultDeliveryItem.querySelector('.addr').textContent;
        const detailAddr = defaultDeliveryItem.querySelector('.detail-addr').textContent;
        const phone = defaultDeliveryItem.querySelector('.phone').textContent;

        document.querySelector('.delivery-name .input').value = deliveryName;
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
});

if (changeBtn && deliveryModal) {
    changeBtn.addEventListener('click', () => {
        deliveryModal.classList.add('visible');
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    });

    const closeModal = () => {
        deliveryModal.classList.remove('visible');
        document.body.style.overflow = ''; // 스크롤 복구
    };

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    // 모달 외부 클릭 시 닫기
    deliveryModal.addEventListener('click', (e) => {
        if (e.target === deliveryModal) {
            closeModal();
        }
    });

    // 각 배송지 아이템의 선택 버튼
    const selectBtns = document.querySelectorAll('.delivery-item .select-btn');
    selectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = e.target.closest('.delivery-item');

            const deliveryName = item.querySelector('.delivery-name').textContent;
            const recipient = item.querySelector('.recipient').textContent;
            const postal = item.querySelector('.postal').textContent;
            const addr = item.querySelector('.addr').textContent;
            const detailAddr = item.querySelector('.detail-addr').textContent;
            const phone = item.querySelector('.phone').textContent;

            // 폼에 선택된 배송지 정보 입력
            document.querySelector('.delivery-name .input').value = deliveryName;
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
                    document.querySelector('.delivery-name .input').value = '';
                    document.querySelector('.orderer-name .input').value = '';
                    document.querySelector('.postal-code').textContent = '';
                    document.querySelector('.about-address').textContent = '';
                    document.querySelector('.detail-address .detail').value = '';
                    document.querySelector('.phone-num .num-select').value = '010';
                    document.querySelector('.phone-num .input').value = '';
                }
                // TODO: 서버에 삭제 요청
            }
        });
    });
}