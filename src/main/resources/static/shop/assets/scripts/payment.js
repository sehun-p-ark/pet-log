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
const deliveryModalContent = deliveryModal.querySelector('.modal-content');
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

    if (couponSelect) {
        Array.from(couponSelect.options).forEach(option => {
            const minOrder = parseInt(option.dataset.minOrder || 0);
            if (minOrder > 0 && baseAmount < minOrder) {
                option.text = '(사용불가) ' + option.text;
                option.disabled = true;
            }
        });
    }

    updatePaymentSummary();
});

if (changeBtn && deliveryModal) {
    changeBtn.addEventListener('click', () => {
        deliveryModal.classList.add('visible');
        deliveryModalContent.classList.add('visible');
        emptyDeliveryAddress();
        cover.style.opacity = '1';
        cover.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden';
    });

    const closeModal = () => {
        deliveryModal.classList.remove('visible');
        deliveryModalContent.classList.remove('visible');
        cover.style.opacity = '0';
        cover.style.pointerEvents = 'none';
        document.body.style.overflow = '';
    };

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    const deliveryAddressList = deliveryModal.querySelector('.delivery-list');


    function emptyDeliveryAddress() {
        const modalBody = deliveryModal.querySelector('.modal-body');
        const items = deliveryAddressList.querySelectorAll('.delivery-item');
        // 이미 empty 메시지가 있는지 체크
        const existingEmpty = modalBody.querySelector('.delivery-list.empty');

        if (items.length === 0) {
            if (!existingEmpty) {
                const emptyDiv = document.createElement('div');
                emptyDiv.classList.add('delivery-list', 'empty');
                emptyDiv.innerText = '배송지를 추가해보세요.';
                modalBody.append(emptyDiv);
            }
        } else {
            if (existingEmpty) {
                existingEmpty.remove();
            }
        }
    }

    // 배송지 선택 이벤트 위임
    let selectDeliveryAddressId = null
    document.querySelectorAll('.delivery-item').forEach(item => {
        if (item.querySelector('.default-badge')) {
            selectDeliveryAddressId = item.dataset.deliveryAddressId;
        }
    });

    deliveryAddressList.addEventListener('click', (e) => {
        const selectBtn = e.target.closest('.select-btn');
        if (!selectBtn) {
            return;
        }
        const deliveryItem = selectBtn.closest('.delivery-item');
        selectDeliveryAddressId = deliveryItem.dataset.deliveryAddressId;
        document.querySelector('.orderer-name .input').value = deliveryItem.dataset.receiverName;
        document.querySelector('.postal-code').textContent = deliveryItem.dataset.postalCode;
        document.querySelector('.about-address').textContent = deliveryItem.dataset.addressPrimary;
        document.querySelector('.detail-address .detail').value = deliveryItem.dataset.addressSecondary || '';
        const phone = deliveryItem.dataset.phone;
        const phoneParts = phone.split('-');
        if (phoneParts.length === 3) {
            document.querySelector('.phone-num .num-select').value = phoneParts[0];
            document.querySelector('.phone-num .input').value = phoneParts[1] + phoneParts[2];
        }


        closeModal()
    })

    // region 배송지 삭제

    const deliveryAddressDeleteMessage = document.getElementById('deliveryAddressDeleteMessage');
    const deliveryAddressDeleteMessageTitle = document.createElement('span');
    const deliveryAddressDeleteMessageText = document.createElement('span');
    const deliveryAddressDeleteYesButton = deliveryAddressDeleteMessage.querySelector(':scope > .button-wrapper > .yes');
    const deliveryAddressDeleteNoButton = deliveryAddressDeleteMessage.querySelector(':scope > .button-wrapper > .no');

    deliveryAddressDeleteMessageTitle.classList.add('title');
    deliveryAddressDeleteMessageText.classList.add('text');
    deliveryAddressDeleteMessageTitle.innerText = '알림';
    deliveryAddressDeleteMessage.prepend(deliveryAddressDeleteMessageTitle, deliveryAddressDeleteMessageText);


    function showDeliveryAddressDeleteMessage(text) {
        deliveryAddressDeleteMessage.classList.add('visible');
        deliveryAddressDeleteMessageText.innerText = text;
    }

    let deleteDeliveryAddressId = null;
    let deleteDeliveryAddressElement = null;

    deliveryAddressDeleteNoButton.addEventListener('click', () => {
        deliveryAddressDeleteMessage.classList.remove('visible');
        deleteDeliveryAddressId = null;
    });

    deliveryAddressList.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-btn');
        if (!deleteButton) {
            return;
        }
        const addressItem = deleteButton.closest('.delivery-item');
        deleteDeliveryAddressId = addressItem.dataset.deliveryAddressId;
        deleteDeliveryAddressElement = addressItem;
        showDeliveryAddressDeleteMessage('이 배송지를 삭제하시겠습니까?');
    });

    deliveryAddressDeleteYesButton.addEventListener('click', () => {
        if (!deleteDeliveryAddressId) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('deliveryAddressId', deleteDeliveryAddressId);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 400) {

                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'FAILURE':
                    deliveryAddressDeleteMessage.classList.remove('visible');
                    showMessage('배송지를 삭제하지 못하였습니다. 잠시 후 다시 시도해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    deliveryAddressDeleteMessage.classList.remove('visible');
                    const wasDefault = deleteDeliveryAddressElement.querySelector('.default-badge') !== null;
                    deleteDeliveryAddressElement.remove();
                    if (selectDeliveryAddressId === deleteDeliveryAddressId) {
                        resetAddressInfo();
                        selectDeliveryAddressId = null;
                    }
                    if (wasDefault) {
                        const firstItem = deliveryAddressList.querySelector('.delivery-item');
                        if (firstItem) {
                            const header = deliveryAddressList.querySelector('.item-header');
                            const badge = document.createElement('span');
                            badge.classList.add('default-badge');
                            badge.innerText = '기본배송지';
                            header.append(badge);
                        }
                    }
                    deleteDeliveryAddressId = null
                    deleteDeliveryAddressElement = null;
                    emptyDeliveryAddress();
                    break;
                default:
            }

        };
        xhr.open('POST', '/my/delivery/delete');
        xhr.send(formData);
    });

    function resetAddressInfo() {
        document.querySelector('.orderer-name .input').value = '';
        document.querySelector('.postal-code').textContent = '';
        document.querySelector('.about-address').textContent = '';
        document.querySelector('.detail-address .detail').value = '';
        document.querySelector('.phone-num .num-select').value = '010';
        document.querySelector('.phone-num .input').value = '';
    }
    // endregion

    // region 배송지 수정
    const deliveryAddressModifyModal = document.getElementById('delivery-address-modify-modal');
    const deliveryAddressModifyModalContent = deliveryAddressModifyModal.querySelector('.delivery-address-modify');
    const deliveryAddressModifyModalCancelButton = deliveryAddressModifyModal.querySelector('.close-btn');
    const deliveryAddressModifyModalAddressNameInput = deliveryAddressModifyModalContent.querySelector('.AddressNameInput');
    const deliveryAddressModifyModalReceiverNameInput = deliveryAddressModifyModalContent.querySelector('.nameInput');
    const deliveryAddressModifyPostalCodeInput = deliveryAddressModifyModalContent.querySelector('.postalCode');
    const deliveryAddressModifyAddressPrimaryInput = deliveryAddressModifyModalContent.querySelector('.addressPrimary');
    const deliveryAddressModifyAddressSecondaryInput = deliveryAddressModifyModalContent.querySelector('.addressSecondary');
    const deliveryAddressModifyFirstNumber = deliveryAddressModifyModalContent.querySelector('.firstNumber');
    const deliveryAddressModifyMiddleNumber = deliveryAddressModifyModalContent.querySelector('.first');
    const deliveryAddressModifyLastNumber = deliveryAddressModifyModalContent.querySelector('.second');
    const deliveryAddressModifyModalModifyButton = deliveryAddressModifyModal.querySelector('.modifyButton');

    let modifyDeliveryAddressId = null;
    deliveryModal.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-btn');
        if (!editButton) {
            return;
        }
        const card = editButton.closest('.delivery-item');
        if (!card) {
            return;
        }
        modifyDeliveryAddressId = card.dataset.deliveryAddressId;
        deliveryAddressModifyModal.classList.add('visible');
        deliveryAddressModifyModalContent.classList.add('visible');

        deliveryAddressModifyModalAddressNameInput.value = card.dataset.deliveryName;
        deliveryAddressModifyModalReceiverNameInput.value = card.dataset.receiverName;
        deliveryAddressModifyPostalCodeInput.value = card.dataset.postalCode;
        deliveryAddressModifyAddressPrimaryInput.value = card.dataset.addressPrimary;
        deliveryAddressModifyAddressSecondaryInput.value = card.dataset.addressSecondary || '';
        deliveryAddressModifyFirstNumber.value = card.dataset.phone.substring(0, 3);
        deliveryAddressModifyMiddleNumber.value = card.dataset.phone.substring(4, 8);
        deliveryAddressModifyLastNumber.value = card.dataset.phone.substring(9, 13);
    })

    deliveryAddressModifyModalCancelButton.addEventListener('click', () => {
        deliveryAddressModifyModal.classList.remove('visible');
        deliveryAddressModifyModalContent.classList.remove('visible');
    });

    const deliveryAddressModifyFind = deliveryAddressModifyModalContent.querySelector(':scope > .delivery-modify-wrapper > .label > .button');
    const deliveryAddressModifyWrapper = document.getElementById('address-wrapper');
    const deliveryAddressModifyContainer = document.getElementById('address-container');
    const deliveryAddressModifyModalCover = deliveryAddressModifyModal.querySelector('.modal-cover');

    deliveryAddressModifyFind.addEventListener('click', () => {
        deliveryAddressModifyWrapper.classList.add('visible');
        deliveryAddressModifyModalCover.classList.add('visible');
        deliveryAddressModifyContainer.innerHTML = '';
        new daum.Postcode({
            oncomplete: function (data) {
                // 우편번호
                deliveryAddressModifyPostalCodeInput.value = data.zonecode;
                deliveryAddressModifyAddressPrimaryInput.value = data.roadAddress || data.jibunAddress;
                deliveryAddressModifyWrapper.classList.remove('visible');
                deliveryAddressModifyModalCover.classList.remove('visible');
                deliveryAddressModifyAddressSecondaryInput.focus();
            }
        }).embed(deliveryAddressModifyContainer);
    });

    const deliveryAddressModifyCancelButton = deliveryAddressModifyWrapper.querySelector(':scope > .button');
    deliveryAddressModifyCancelButton.addEventListener('click', () => {
        deliveryAddressModifyWrapper.classList.remove('visible');
        deliveryAddressModifyModalCover.classList.remove('visible');
    });


    deliveryAddressModifyModalModifyButton.addEventListener('click', () => {
        const deliveryAddressModifyPhone = deliveryAddressModifyFirstNumber.value + deliveryAddressModifyMiddleNumber.value + deliveryAddressModifyLastNumber.value;

        if (deliveryAddressModifyModalAddressNameInput.value === '') {
            showMessage('배송지명을 입력해주세요.');
            return;
        }
        if (deliveryAddressModifyModalAddressNameInput.value.length < 1 ||
            deliveryAddressModifyModalAddressNameInput.value.length > 10) {
            showMessage('배송지명은 1~10자까지 가능합니다.');
            return;
        }
        if (deliveryAddressModifyModalReceiverNameInput.value === '') {
            showMessage('받는 사람의 이름을 입력해주세요.');
            return;
        }
        if (deliveryAddressModifyModalReceiverNameInput.value.length < 1 ||
            deliveryAddressModifyModalReceiverNameInput.value.length > 10) {
            showMessage('받는 사람의 이름은 1~10자까지 가능합니다.');
            return;
        }
        if (deliveryAddressModifyPostalCodeInput.value === '' ||
            deliveryAddressModifyAddressPrimaryInput.value === '') {
            showMessage('주소를 입력해주세요.');
            return;
        }
        if (deliveryAddressModifyPostalCodeInput.value.length !== 5) {
            showMessage('우편번호를 다시 확인해주세요.');
            return;
        }
        if (deliveryAddressModifyAddressPrimaryInput.value.length < 1 ||
            deliveryAddressModifyAddressPrimaryInput.value.length > 150) {
            showMessage('기본주소는 1~150자까지 가능합니다.');
            return;
        }
        if (deliveryAddressModifyAddressSecondaryInput.value.length > 100) {
            showMessage('상세주소는 최대 100자까지 가능합니다.');
            return;
        }
        if (deliveryAddressModifyFirstNumber.value === '') {
            showMessage('전화번호를 모두 입력해주세요.');
            return;
        }
        if (deliveryAddressModifyMiddleNumber.value === '') {
            showMessage('전화번호를 모두 입력해주세요.');
            return;
        }
        if (deliveryAddressModifyLastNumber.value === '') {
            showMessage('전화번호를 모두 입력해주세요.');
            return;
        }
        if (!/^\d{4}$/.test(deliveryAddressModifyMiddleNumber.value) ||
            !/^\d{4}$/.test(deliveryAddressModifyLastNumber.value)) {
            showMessage('전화번호는 숫자 4자리로 입력해주세요.');
            return;
        }
        if (deliveryAddressModifyPhone.length > 11) {
            showMessage('전화번호를 다시 확인해주세요.');
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('deliveryAddressId', modifyDeliveryAddressId);
        formData.append('deliveryName', deliveryAddressModifyModalAddressNameInput.value);
        formData.append('receiverName', deliveryAddressModifyModalReceiverNameInput.value);
        formData.append('postalCode', deliveryAddressModifyPostalCodeInput.value);
        formData.append('addressPrimary', deliveryAddressModifyAddressPrimaryInput.value);
        if (deliveryAddressModifyAddressSecondaryInput.value !== '') {
            formData.append('addressSecondary', deliveryAddressModifyAddressSecondaryInput.value);
        }
        formData.append('phone', deliveryAddressModifyPhone);
        xhr.onreadystatechange = () => {
            if(xhr.readyState !== XMLHttpRequest.DONE){
                return;
            }
            if(xhr.status < 200 || xhr.status >= 400){

                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'FAILURE':
                    showMessage('배송지 수정에 실패하였습니다 정보를 다시 확인해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    updateDelivery({
                        id: modifyDeliveryAddressId,
                        deliveryName: deliveryAddressModifyModalAddressNameInput.value,
                        receiverName: deliveryAddressModifyModalReceiverNameInput.value,
                        phone: deliveryAddressModifyPhone,
                        postalCode: deliveryAddressModifyPostalCodeInput.value,
                        addressPrimary: deliveryAddressModifyAddressPrimaryInput.value,
                        addressSecondary: deliveryAddressModifyAddressSecondaryInput.value
                    });
                    deliveryAddressModifyModal.classList.remove('visible');
                    break;
                default:
                    showMessage('알 수 없는 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.');
            }
        };
        xhr.open('PATCH', '/my/delivery/modify');
        xhr.send(formData);
    });
    // endregion

    // region 배송지 등록
    const modalRegistrationButton = deliveryModal.querySelector('.add-btn');
    const modalContent = deliveryModal.querySelector(':scope > .modal-content');
    const deliveryRegistrationModal = deliveryModal.querySelector(':scope > .delivery-registration');

    modalRegistrationButton.addEventListener('click', () => {
        modalContent.classList.remove('visible');
        deliveryRegistrationModal.classList.add('visible');
        deliveryRegistrationModal.querySelector('.AddressNameInput').value = '';
        deliveryRegistrationModal.querySelector('.nameInput').value = '';
        deliveryRegistrationModal.querySelector('.postalCode').value = '';
        deliveryRegistrationModal.querySelector('.addressPrimary').value = '';
        deliveryRegistrationModal.querySelector('.addressSecondary').value = '';
        deliveryRegistrationModal.querySelector('.firstNumber').value = '010';
        deliveryRegistrationModal.querySelector('.first').value = '';
        deliveryRegistrationModal.querySelector('.second').value = '';
    });

    deliveryRegistrationModal.querySelector('.close-btn').addEventListener('click', () => {
        modalContent.classList.add('visible');
        deliveryRegistrationModal.classList.remove('visible');
    });

    // 내정보 관리에서 배송지 주소검색 띄우기
    // 내정보 관리에서 배송지 주소 추가할 시 주소검색 띄우기
    const deliveryAddressFind = deliveryRegistrationModal.querySelector(':scope > .registration-wrapper > .label > .button');
    const deliveryAddressWrapper = document.getElementById('address-wrapper');
    const deliveryAddressContainer = document.getElementById('address-container');
    const modalCover = deliveryModal.querySelector('.modal-cover');
    const postalInput = deliveryRegistrationModal.querySelector('.postalCode');
    const primaryAddressInput = deliveryRegistrationModal.querySelector('.addressPrimary');
    const detailAddressInput = deliveryRegistrationModal.querySelector('.addressSecondary');

    deliveryAddressFind.addEventListener('click', () => {
        deliveryAddressWrapper.classList.add('visible');
        modalCover.classList.add('visible');
        deliveryAddressContainer.innerHTML = '';
        new daum.Postcode({
            oncomplete: function (data) {
                // 우편번호
                postalInput.value = data.zonecode;
                primaryAddressInput.value = data.roadAddress || data.jibunAddress;
                deliveryAddressWrapper.classList.remove('visible');
                modalCover.classList.remove('visible');
                detailAddressInput.focus();
            }
        }).embed(deliveryAddressContainer);
    });

    const deliveryAddressCancelButton = deliveryAddressWrapper.querySelector(':scope > .button');
    deliveryAddressCancelButton.addEventListener('click', () => {
        deliveryAddressWrapper.classList.remove('visible');
        modalCover.classList.remove('visible');
    });

    const deliveryAddressRegistrationButton = deliveryRegistrationModal.querySelector('.registrationButton');
    const deliveryAddressModalDeliveryNameInput = deliveryRegistrationModal.querySelector('.AddressNameInput');
    const deliveryAddressModalReceiverNameInput = deliveryRegistrationModal.querySelector('.nameInput');
    const deliveryAddressModalPostalCode = deliveryRegistrationModal.querySelector('.postalCode');
    const deliveryAddressModalAddressPrimary = deliveryRegistrationModal.querySelector('.addressPrimary');
    const deliveryAddressModalAddressSecondary = deliveryRegistrationModal.querySelector('.addressSecondary');

    const deliveryAddressFirstNumberInput = deliveryRegistrationModal.querySelector('.firstNumber');
    const deliveryAddressMiddleNumberInput = deliveryRegistrationModal.querySelector('.contactNumber.first');
    const deliveryAddressLastNumberInput = deliveryRegistrationModal.querySelector('.contactNumber.second');

    deliveryAddressRegistrationButton.addEventListener('click', () => {
        const deliveryAddressPhone = deliveryAddressFirstNumberInput.value + deliveryAddressMiddleNumberInput.value + deliveryAddressLastNumberInput.value;

        if (deliveryAddressModalDeliveryNameInput.value === '') {
            showMessage('배송지명을 입력해주세요.');
            return;
        }
        if (deliveryAddressModalDeliveryNameInput.value.length < 1 ||
            deliveryAddressModalDeliveryNameInput.value.length > 10) {
            showMessage('배송지명은 1~10자까지 가능합니다.');
            return;
        }
        if (deliveryAddressModalReceiverNameInput.value === '') {
            showMessage('받는 사람의 이름을 입력해주세요.');
            return;
        }
        if (deliveryAddressModalReceiverNameInput.value.length < 1 ||
            deliveryAddressModalReceiverNameInput.value.length > 10) {
            showMessage('받는 사람의 이름은 1~10자까지 가능합니다.');
            return;
        }
        if (deliveryAddressModalPostalCode.value === '' ||
            deliveryAddressModalAddressPrimary.value === '') {
            showMessage('주소를 입력해주세요.');
            return;
        }
        if (deliveryAddressModalPostalCode.value.length !== 5) {
            showMessage('우편번호를 다시 확인해주세요.');
            return;
        }
        if (deliveryAddressModalAddressPrimary.value.length < 1 ||
            deliveryAddressModalAddressPrimary.value.length > 150) {
            showMessage('기본주소는 1~150자까지 가능합니다.');
            return;
        }
        if (deliveryAddressModalAddressSecondary.value.length > 100) {
            showMessage('상세주소는 최대 100자까지 가능합니다.');
            return;
        }
        if (deliveryAddressFirstNumberInput.value === '') {
            showMessage('전화번호를 모두 입력해주세요.');
            return;
        }
        if (deliveryAddressMiddleNumberInput.value === '') {
            showMessage('전화번호를 모두 입력해주세요.');
            return;
        }
        if (deliveryAddressLastNumberInput.value === '') {
            showMessage('전화번호를 모두 입력해주세요.');
            return;
        }
        if (!/^\d{4}$/.test(deliveryAddressMiddleNumberInput.value) ||
            !/^\d{4}$/.test(deliveryAddressLastNumberInput.value)) {
            showMessage('전화번호는 숫자 4자리로 입력해주세요.');
            return;
        }
        if (deliveryAddressPhone.length > 11) {
            showMessage('전화번호를 다시 확인해주세요.');
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('deliveryName', deliveryAddressModalDeliveryNameInput.value);
        formData.append('receiverName', deliveryAddressModalReceiverNameInput.value);
        formData.append('postalCode', deliveryAddressModalPostalCode.value);
        formData.append('addressPrimary', deliveryAddressModalAddressPrimary.value);
        if (deliveryAddressModalAddressSecondary.value !== '') {
            formData.append('addressSecondary', deliveryAddressModalAddressSecondary.value);
        }
        formData.append('phone', deliveryAddressPhone);
        xhr.onreadystatechange = () => {
            if(xhr.readyState !== XMLHttpRequest.DONE){
                return;
            }
            if(xhr.status < 200 || xhr.status >= 400){

                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'FAILURE':
                    showMessage('배송지 등록에 실패하였습니다 정보를 다시 확인해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    addDelivery({
                        id: response.newDeliveryId,
                        deliveryName: deliveryAddressModalDeliveryNameInput.value,
                        receiverName: deliveryAddressModalReceiverNameInput.value,
                        phone: deliveryAddressPhone,
                        postalCode: deliveryAddressModalPostalCode.value,
                        addressPrimary: deliveryAddressModalAddressPrimary.value,
                        addressSecondary: deliveryAddressModalAddressSecondary.value,
                        isDefault: response.isDefault
                    });
                    deliveryRegistrationModal.classList.remove('visible');
                    modalContent.classList.add('visible');
                    emptyDeliveryAddress();
                    break;
                default:
            }
        };
        xhr.open('POST', '/my/delivery/registration');
        xhr.send(formData);
    })
    // endregion
}
function addDelivery(data) {
    const deliveryList = document.querySelector('.delivery-list');

    const deliveryItemDiv = document.createElement('div');
    deliveryItemDiv.classList.add('delivery-item');
    const phoneHyphen = data.phone.substring(0,3) + '-' + data.phone.substring(3, 7) + '-' + data.phone.substring(7, 11);

    deliveryItemDiv.dataset.deliveryAddressId = data.id;
    deliveryItemDiv.dataset.deliveryName = data.deliveryName;
    deliveryItemDiv.dataset.receiverName = data.receiverName;
    deliveryItemDiv.dataset.phone = phoneHyphen;
    deliveryItemDiv.dataset.postalCode = data.postalCode;
    deliveryItemDiv.dataset.addressPrimary = data.addressPrimary;
    deliveryItemDiv.dataset.addressSecondary = data.addressSecondary;

    deliveryItemDiv.innerHTML = `
        <div class="item-content">
            <div class="item-header">
                <span class="delivery-name">${data.deliveryName}</span>
                ${data.isDefault ? '<span class="default-badge">기본배송지</span>' : ''}
            </div>
            <div class="recipient">${data.receiverName}</div>
            <div class="address">
                <span class="postal">[${data.postalCode}]</span>
                <span class="addr">${data.addressPrimary}</span>
            </div>
            <div class="detail-addr">${data.addressSecondary ?? ''}</div>
            <div class="phone">${phoneHyphen}</div>
            <div class="item-actions">
                <div class="left-actions">
                    <button type="button" class="delete-btn">삭제</button>
                    <button type="button" class="edit-btn">수정</button>
                </div>
                <button type="button" class="select-btn">선택</button>
            </div>
        </div>
    `;

    deliveryList.append(deliveryItemDiv);
}

function updateDelivery(data) {
    const deliveryItem = document.querySelector(
        `.delivery-item[data-delivery-address-id="${data.id}"]`
    );

    if (!deliveryItem) return;

    const phoneHyphen =
        data.phone.substring(0, 3) + '-' +
        data.phone.substring(3, 7) + '-' +
        data.phone.substring(7, 11);

    deliveryItem.dataset.deliveryName = data.deliveryName;
    deliveryItem.dataset.receiverName = data.receiverName;
    deliveryItem.dataset.phone = phoneHyphen;
    deliveryItem.dataset.postalCode = data.postalCode;
    deliveryItem.dataset.addressPrimary = data.addressPrimary;
    deliveryItem.dataset.addressSecondary = data.addressSecondary;

    deliveryItem.querySelector('.delivery-name').textContent = data.deliveryName;
    deliveryItem.querySelector('.recipient').textContent = data.receiverName;
    deliveryItem.querySelector('.postal').textContent = `[${data.postalCode}]`;
    deliveryItem.querySelector('.addr').textContent = data.addressPrimary;
    deliveryItem.querySelector('.detail-addr').textContent = data.addressSecondary ?? '';
    deliveryItem.querySelector('.phone').textContent = phoneHyphen;
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
                showToast(`이 쿠폰은 ${minOrder.toLocaleString()}원 이상 구매 시 사용 가능합니다.`);
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
const urlParams = new URLSearchParams(window.location.search);
const cartIdsParam = urlParams.get('cartIds');
const cartIds = cartIdsParam ? cartIdsParam.split(',').map(Number) : [];

if (paymentBtn) {
    paymentBtn.addEventListener('click', async () => {

        // 필수 정보 체크
        const ordererName = document.querySelector('.name-wrapper .input').value;
        const ordererPhone = document.querySelector('.phone-wrapper .input').value;
        const receiverName = document.querySelector('.orderer-name .input').value;
        const receiverPhone = document.querySelector('.phone-num .input').value;
        const postalCode = document.querySelector('.postal-code').textContent;

        if (!ordererName) {
            showToast('주문자 이름을 입력해주세요.');
            return;
        }
        if (!ordererPhone) {
            showToast('주문자 전화번호를 입력해주세요.');
            return;
        }
        if (!receiverName) {
            showToast('받는 사람 이름을 입력해주세요.');
            return;
        }
        if (!receiverPhone) {
            showToast('받는 사람 전화번호를 입력해주세요.');
            return;
        }
        if (!postalCode) {
            showToast('배송지 주소를 입력해주세요.');
            return;
        }
        if (!selectedPaymentMethod) {
            showToast('결제 수단을 선택해주세요.');
            return;
        }

        // 최종 결제 금액 확인
        let finalAmount = baseAmount + deliveryFee - couponDiscount - pointDiscount;
        if (finalAmount < 0) finalAmount = 0;

        if (finalAmount === 0) {
            showToast('결제 금액이 0원입니다.');
            return;
        }

        // 토스페이먼츠 클라이언트 초기화
        const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

        // TossPayments가 로드되었는지 확인
        if (typeof TossPayments === 'undefined') {
            showToast('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
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
                items,
                cartIds
            })
        });

        if (!saveRes.ok) {
            showToast('주문 정보 저장에 실패했습니다. 다시 시도해주세요.');
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
                showToast('결제를 취소하셨습니다.');
            } else if (error.code === 'INVALID_CARD_COMPANY') {
                showToast('유효하지 않은 카드사입니다.');
            } else {
                showToast('결제 중 오류가 발생했습니다.\n' + (error.message || '다시 시도해주세요.'));
            }
        }
    });
}