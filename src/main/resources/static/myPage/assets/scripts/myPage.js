// 사이드바 메뉴 클릭 시 active 이동
const sidebarItems = document.querySelectorAll('.sidebar .menu');

const myPageWrapper = document.getElementById('myPage');
const content = myPageWrapper.querySelector(':scope > .content');

const personalInformation = content.querySelector(':scope > .personalInformation');
const businessInformation = content.querySelector(':scope > .businessInformation');
const petInformation = content.querySelector(':scope > .petInformation');
const reservationInformation = content.querySelector(':scope > .reservationInformation');
const storeInformation = content.querySelector(':scope > .storeInformation');
const paymentDetails = content.querySelector(':scope > .paymentDetails');

const sections = [
    personalInformation,
    businessInformation,
    petInformation,
    storeInformation,
    reservationInformation,
    paymentDetails
].filter(section => section !== null);

// 메뉴 클릭 시
// 메뉴 활성화 함수
function activateMenu(index) {
    // 메뉴 active 변경
    sidebarItems.forEach(li => li.classList.remove('active'));
    sidebarItems[index].classList.add('active');

    // content 표시
    sections.forEach(section => section.classList.remove('visible'));
    if (sections[index]) {
        sections[index].classList.add('visible');
    }

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('menu', index);
    window.history.replaceState(null, '', newUrl);
}

// 클릭 이벤트 연결
sidebarItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        activateMenu(index);
    });
});

// 페이지 로드 시 URL 파라미터 확인 후 메뉴 활성화
const urlParams = new URLSearchParams(window.location.search);
const menu = urlParams.get('menu');
if (menu != null && sidebarItems[Number(menu)]) {
    activateMenu(Number(menu));
} else {
    activateMenu(0);
}

function getCurrentMenuIndex() {
    return Array.from(sidebarItems).findIndex(item => item.classList.contains('active'));
}



const myPageShowMessage = document.getElementById('show-message');
const $title = document.createElement('span');
const $text = document.createElement('span');
const warningButton = myPageShowMessage.querySelector(':scope > .button');
$title.classList.add('title');
$text.classList.add('text');
$title.innerText = "알림";
myPageShowMessage.prepend($title, $text);
let onMessageClose = null;

function showMessage(text, callback = null) {
    myPageShowMessage.classList.add('visible');
    $text.innerText = text;
    onMessageClose = callback;
}

warningButton.addEventListener('click', () => {
    myPageShowMessage.classList.remove('visible');
    if (onMessageClose) {
        onMessageClose();
        onMessageClose = null;
    }
});


// 개인회원 변경
if (personalInformation) {
    // region 이름 변경 모달
    const nameChangeModalOpen = personalInformation.querySelector('.nameChangeButton');
    const nameChangeModal = document.getElementById('name-change-modal');
    const nameChangeModalContent = nameChangeModal.querySelector('.modal-content');
    const nameChangeModalCancelButton = nameChangeModal.querySelector('.close-btn');

    nameChangeModalOpen.addEventListener('click', () => {
        nameChangeModal.querySelector('.name.input').value = '';
        nameChangeModal.querySelector('.password.input').value = '';
        nameChangeModal.classList.add('visible');
        nameChangeModalContent.classList.add('visible');
    });

    nameChangeModalCancelButton.addEventListener('click', () => {
        nameChangeModal.classList.remove('visible');
        nameChangeModalContent.classList.remove('visible');
    });

    const nameChangeButton = nameChangeModal.querySelector('.modify-button');
    nameChangeButton.addEventListener('click', (e) => {
        e.preventDefault();
        const nameChangeInput = nameChangeModal.querySelector('.name.input');
        const nameChangePasswordInput = nameChangeModal.querySelector('.password.input');
        if (nameChangeInput.value === '') {
            nameChangeInput.focus();
            showMessage('변경하실 이름을 입력해주세요.');
            return;
        }
        if (!/^[가-힣]{2,20}$/g.test(nameChangeInput.value)) {
            nameChangeInput.focus();
            showMessage('올바른 이름을 입력해주세요. \n이름은 완성 한글 2~20자로 이루어져야 합니다..');
            return;
        }
        if (nameChangePasswordInput.value === '') {
            showMessage('비밀번호를 입력해주세요.');
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('name', nameChangeInput.value);
        formData.append('password', nameChangePasswordInput.value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 400) {
                console.log('서버 오류 발생');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'FAILURE':
                    showMessage('이름 변경에 실패하였습니다. 이름 또는 비밀번호를 다시 확인해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
                    showMessage('알 수 없는 이유로 수정에 실패하였습니다. 다시 시도해주세요.');
            }
        };
        xhr.open('PATCH', '/my/name/change');
        xhr.send(formData);
    });
// endregion

    // region 닉네임 변경 모달
    const nicknameChangeModalOpen = personalInformation.querySelector('.nicknameChangeButton');
    const nicknameChangeModal = document.getElementById('nickname-change-modal');
    const nicknameChangeModalCancelButton = nicknameChangeModal.querySelector('.close-btn');
    const nicknameChangeModalContent = nicknameChangeModal.querySelector('.modal-content');

    nicknameChangeModalOpen.addEventListener('click', () => {
        nicknameChangeModal.querySelector('.nickname.input').value = '';
        nicknameChangeModal.classList.add('visible');
        nicknameChangeModalContent.classList.add('visible');
    });

    nicknameChangeModalCancelButton.addEventListener('click', () => {
        nicknameChangeModal.classList.remove('visible');
        nicknameChangeModalContent.classList.remove('visible');
    });

    const nicknameChangeButton = nicknameChangeModal.querySelector('.modify-button');
    nicknameChangeButton.addEventListener('click', (e) => {
        e.preventDefault();
        const nicknameChangeInput = nicknameChangeModal.querySelector('.nickname.input');
        if (nicknameChangeInput.value === '') {
            nicknameChangeInput.focus();
            showMessage('변경하실 닉네임을 입력해주세요.');
            return;
        }
        if (!/^[\da-zA-Z가-힣]{2,20}$/g.test(nicknameChangeInput.value)) {
            nicknameChangeInput.focus();
            showMessage('올바른 닉네임을 입력해주세요. \n닉네임은 숫자, 영어 대/소문자, 완성 한글 2~20자로 이루어져야 합니다..');
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('nickname', nicknameChangeInput.value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 400) {
                console.log('서버 오류 발생');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'FAILURE':
                    showMessage('닉네임 변경에 실패하였습니다. 닉네임을 다시 확인해주세요.');
                    break;
                case 'FAILURE_NICKNAME_DUPLICATE':
                    showMessage('이미 사용중인 닉네임입니다.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
                    showMessage('알 수 없는 이유로 수정에 실패하였습니다. 다시 시도해주세요.');
            }
        };
        xhr.open('PATCH', '/my/nickname/change');
        xhr.send(formData);
    });
// endregion

    // region 기본 주소 관리, 등록, 삭제 모달
    const addressModal = document.getElementById('address-modal');
    const addressModalOpenButton = personalInformation.querySelector('.address-open-button');

    addressModalOpenButton.addEventListener('click', () => {
        addressRegistrationModal.querySelector('.postalCode').value = '';
        addressRegistrationModal.querySelector('.addressPrimary').value = '';
        addressRegistrationModal.querySelector('.addressSecondary').value = '';
        addressModal.classList.add('visible');
        addressModalContent.classList.add('visible');
        addressRegistrationModal.classList.remove('visible');
    });

    const addressModalCloseButton = addressModal.querySelector('.close-btn');

    addressModalCloseButton.addEventListener('click', () => {
        closeAddressModal();
    });

    // 모달 닫기
    function closeAddressModal() {
        addressModal.classList.remove('visible');
        addressModalContent.classList.remove('visible');
        addressRegistrationModal.classList.remove('visible');
        currentEditingItem = null;
    }


    const addressList = addressModal.querySelector('.address-list');

    // region 대표주소 설정
    const defaultAddressMessage = document.getElementById('defaultAddressMessage');
    const defaultAddressMessageTitle = document.createElement('span');
    const defaultAddressMessageText = document.createElement('span');
    const defaultAddressYesButton = defaultAddressMessage.querySelector(':scope > .button-wrapper > .yes');
    const defaultAddressNoButton = defaultAddressMessage.querySelector(':scope > .button-wrapper > .no');

    defaultAddressMessageTitle.classList.add('title');
    defaultAddressMessageText.classList.add('text');
    defaultAddressMessageTitle.innerText = '알림';
    defaultAddressMessage.prepend(defaultAddressMessageTitle, defaultAddressMessageText);

    let defaultAddressId = null;


    function showDefaultAddressMessage(text) {
        defaultAddressMessage.classList.add('visible');
        defaultAddressMessageText.innerText = text;
    }

    defaultAddressNoButton.addEventListener('click', () => {
        defaultAddressMessage.classList.remove('visible');
        defaultAddressId = null;
    });

    addressList.addEventListener('click', (e) => {
        const defaultButton = e.target.closest('.select-btn');
        if (!defaultButton) {
            return;
        }
        const addressItem = defaultButton.closest('.address-item');
        defaultAddressId = addressItem.dataset.addressId;
        console.log(defaultAddressId);
        showDefaultAddressMessage('이 주소를 대표주소로 변경하시겠습니까?');
    });

    defaultAddressYesButton.addEventListener('click', () => {
        if (!defaultAddressId) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('addressId', defaultAddressId);
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
                    showMessage('대표 주소 설정에 실패하였습니다. 다시 시도해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':                    showMessage('로그인을 해주세요.', () => {
                    location.href = '/user/login';
                });
                    break;
                case 'SUCCESS':
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
            }
        };
        xhr.open('POST', '/my/address/default');
        xhr.send(formData);
    })
    // endregion

    // region 주소 삭제
    const addressDeleteMessage = document.getElementById('addressDeleteMessage');
    const addressDeleteMessageTitle = document.createElement('span');
    const addressDeleteMessageText = document.createElement('span');
    const addressDeleteYesButton = addressDeleteMessage.querySelector(':scope > .button-wrapper > .yes');
    const addressDeleteNoButton = addressDeleteMessage.querySelector(':scope > .button-wrapper > .no');

    addressDeleteMessageTitle.classList.add('title');
    addressDeleteMessageText.classList.add('text');
    addressDeleteMessageTitle.innerText = '알림';
    addressDeleteMessage.prepend(addressDeleteMessageTitle, addressDeleteMessageText);


    let deleteAddressId = null;

    function showAddressDeleteMessage(text) {
        addressDeleteMessage.classList.add('visible');
        addressDeleteMessageText.innerText = text;
    }

    addressDeleteNoButton.addEventListener('click', () => {
        addressDeleteMessage.classList.remove('visible');
        deleteAddressId = null;
    });


    addressList.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-btn');
        if (!deleteButton) {
            return;
        }
        const addressItem = deleteButton.closest('.address-item');
        deleteAddressId = addressItem.dataset.addressId;
        console.log(deleteAddressId)
        showAddressDeleteMessage('이 주소를 삭제하시겠습니까?');
    });

    addressDeleteYesButton.addEventListener('click', () => {
        if (!deleteAddressId) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('addressId', deleteAddressId);
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
                    addressDeleteMessage.classList.remove('visible');
                    showMessage('주소는 최소 한 개 이상 가지고 있어야 합니다.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
            }
        };
        xhr.open('POST', '/my/address/delete');
        xhr.send(formData);
    });
    // endregion

    // region 주소 등록
    const addressModalRegistrationButton = addressModal.querySelector('.add-btn');
    const addressModalContent = addressModal.querySelector(':scope > .modal-content');
    const addressRegistrationModal = addressModal.querySelector(':scope > .address-registration');

    addressModalRegistrationButton.addEventListener('click', () => {
        if (addressCards.length < 5) {
            addressModalContent.classList.remove('visible');
            addressRegistrationModal.classList.add('visible');
        } else {
            showMessage('주소는 최대 5개까지 등록할 수 있습니다.');
        }
    });

    addressRegistrationModal.querySelector('.close-btn').addEventListener('click', () => {
        closeAddressModal();
    });


    // 내정보 관리에서 주소검색 띄우기
    // 내정보 관리에서 주소 추가할 시 주소검색 띄우기
    const addressFind = addressRegistrationModal.querySelector(':scope > .registration-wrapper > .label > .button');
    const addressWrapper = document.getElementById('map-address-wrapper');
    const addressContainer = document.getElementById('map-address-container');
    const addressModalCover = addressModal.querySelector('.modal-cover');
    const addressPostalInput = addressRegistrationModal.querySelector('.postalCode');
    const addressPrimaryAddressInput = addressRegistrationModal.querySelector('.addressPrimary');
    const addressDetailAddressInput = addressRegistrationModal.querySelector('.addressSecondary');

    addressFind.addEventListener('click', () => {
        addressWrapper.classList.add('visible');
        addressModalCover.classList.add('visible');
        addressContainer.innerHTML = '';
        new daum.Postcode({
            oncomplete: function (data) {
                // 우편번호
                addressPostalInput.value = data.zonecode;
                addressPrimaryAddressInput.value = data.roadAddress || data.jibunAddress;
                addressWrapper.classList.remove('visible');
                addressModalCover.classList.remove('visible');
                addressDetailAddressInput.focus();
            }
        }).embed(addressContainer);
    });

    const addressRegistrationButton = addressModal.querySelector('.registrationButton');
    addressRegistrationButton.addEventListener('click', () => {
        const addressRegistrationModalPostalCodeInput = addressRegistrationModal.querySelector('.postalCode');
        const addressRegistrationModalAddressPrimaryInput = addressRegistrationModal.querySelector('.addressPrimary');
        const addressRegistrationModalAddressSecondaryInput = addressRegistrationModal.querySelector('.addressSecondary');
        if (addressRegistrationModalPostalCodeInput.value === '' ||
            addressRegistrationModalAddressPrimaryInput.value === '') {
            showMessage('주소를 입력해주세요.');
            return;
        }
        if (addressRegistrationModalPostalCodeInput.value.length !== 5) {
            showMessage('우편번호를 다시 확인해주세요.');
            return;
        }
        if (addressRegistrationModalAddressPrimaryInput.value.length < 1 ||
            addressRegistrationModalAddressPrimaryInput.value.length > 150) {
            showMessage('기본주소는 1~150자까지 가능합니다.');
            return;
        }
        if (addressRegistrationModalAddressSecondaryInput.value.length > 100) {
            showMessage('상세주소는 최대 100자까지 가능합니다.');
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('postalCode', addressRegistrationModalPostalCodeInput.value);
        formData.append('addressPrimary', addressRegistrationModalAddressPrimaryInput.value);
        if (addressRegistrationModalAddressSecondaryInput.value !== '') {
            formData.append('addressSecondary', addressRegistrationModalAddressSecondaryInput.value);
        }
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
                    showMessage('주소 등록에 실패하였습니다. 정보를 다시 확인해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
            }
        };
        xhr.open('POST', '/my/address/registration');
        xhr.send(formData);
    });

    const addressCancelButton = addressWrapper.querySelector(':scope > .button');
    addressCancelButton.addEventListener('click', () => {
        addressWrapper.classList.remove('visible');
        addressModalCover.classList.remove('visible');
    });
    // endregion

    // region 주소 수정
    const addressModifyModal = document.getElementById('address-modify-modal');
    const addressModifyModalContent = addressModifyModal.querySelector('.address-modify');
    const addressCards = addressModal.querySelectorAll('.address-item');
    const addressModifyModalCancelButton = addressModifyModal.querySelector('.close-btn');
    const addressModifyPostalCodeInput = addressModifyModalContent.querySelector('.postalCode');
    const addressModifyAddressPrimaryInput = addressModifyModalContent.querySelector('.addressPrimary');
    const addressModifyAddressSecondaryInput = addressModifyModalContent.querySelector('.addressSecondary');
    const addressModifyModalModifyButton = addressModifyModal.querySelector('.addressModifyButton');

    let modifyAddressId = null;
    addressCards.forEach(card => {
        const addressModifyModalOpenButton = card.querySelector('.edit-btn');
        addressModifyModalOpenButton.addEventListener('click', () => {
            modifyAddressId = card.dataset.addressId;
            addressModifyModal.classList.add('visible');
            addressModifyModalContent.classList.add('visible');

            addressModifyPostalCodeInput.value = card.dataset.postalCode;
            addressModifyAddressPrimaryInput.value = card.dataset.addressPrimary;
            addressModifyAddressSecondaryInput.value = card.dataset.addressSecondary || '';
        });
    });

    addressModifyModalCancelButton.addEventListener('click', () => {
        addressModifyModal.classList.remove('visible');
        addressModifyModalContent.classList.remove('visible');
    });

    const addressModifyFind = addressModifyModalContent.querySelector(':scope > .modify-wrapper > .label > .button');
    const addressModifyWrapper = document.getElementById('map-address-modify-wrapper');
    const addressModifyContainer = document.getElementById('map-address-modify-container');
    const addressModifyModalCover = addressModifyModal.querySelector('.modal-cover');
    const addressModifyPostalInput = addressModifyModal.querySelector('.postalCode');
    const addressModifyPrimaryAddressInput = addressModifyModal.querySelector('.addressPrimary');
    const addressModifyDetailAddressInput = addressModifyModal.querySelector('.addressSecondary');

    addressModifyFind.addEventListener('click', () => {
        addressModifyWrapper.classList.add('visible');
        addressModifyModalCover.classList.add('visible');
        addressModifyContainer.innerHTML = '';
        new daum.Postcode({
            oncomplete: function (data) {
                // 우편번호
                addressModifyPostalInput.value = data.zonecode;
                addressModifyPrimaryAddressInput.value = data.roadAddress || data.jibunAddress;
                addressModifyWrapper.classList.remove('visible');
                addressModifyModalCover.classList.remove('visible');
                addressModifyDetailAddressInput.focus();
            }
        }).embed(addressModifyContainer);
    });

    const addressModifyCancelButton = addressModifyWrapper.querySelector(':scope > .button');
    addressModifyCancelButton.addEventListener('click', () => {
        addressModifyWrapper.classList.remove('visible');
        addressModifyModalCover.classList.remove('visible');
    });


    addressModifyModalModifyButton.addEventListener('click', () => {
        if (addressModifyPostalCodeInput.value === '' ||
            addressModifyAddressPrimaryInput.value === '') {
            showMessage('주소를 입력해주세요.');
            return;
        }
        if (addressModifyPostalCodeInput.value.length !== 5) {
            showMessage('우편번호를 다시 확인해주세요.');
            return;
        }
        if (addressModifyAddressPrimaryInput.value.length < 1 ||
            addressModifyAddressPrimaryInput.value.length > 150) {
            showMessage('기본주소는 1~150자까지 가능합니다.');
            return;
        }
        if (addressModifyAddressSecondaryInput.value.length > 100) {
            showMessage('상세주소는 최대 100자까지 가능합니다.');
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('addressId', modifyAddressId);
        formData.append('postalCode', addressModifyPostalCodeInput.value);
        formData.append('addressPrimary', addressModifyAddressPrimaryInput.value);
        if (addressModifyAddressSecondaryInput.value !== '') {
            formData.append('addressSecondary', addressModifyAddressSecondaryInput.value);
        }
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
                    showMessage('주소 수정에 실패하였습니다 정보를 다시 확인해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
                    showMessage('알 수 없는 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.');
            }

        };
        xhr.open('PATCH', '/my/address/modify');
        xhr.send(formData);
    });
    // endregion
// endregion

    // region 배송지 주소 관리, 등록, 삭제 모달
    const deliveryModal = document.getElementById('delivery-change-modal');

    const deliveryModalOpenButton = personalInformation.querySelector('.delivery-open-button');
    const deliveryModalContent = deliveryModal.querySelector('.modal-content');

    deliveryModalOpenButton.addEventListener('click', () => {
        deliveryModal.classList.add('visible');
        deliveryModalContent.classList.add('visible');
        deliveryRegistrationModal.classList.remove('visible');
    });

    const deliveryModalCloseButton = deliveryModal.querySelector('.close-btn');

    deliveryModalCloseButton.addEventListener('click', () => {
        closeDeliveryModal();
    });

    // 모달 닫기
    function closeDeliveryModal() {
        deliveryModal.classList.remove('visible');
        deliveryModalContent.classList.remove('visible');
        deliveryRegistrationModal.classList.remove('visible');
        currentEditingItem = null;
    }

    const deliveryAddressList = deliveryModal.querySelector('.delivery-list');

    // region 대표배송지 설정
    const defaultDeliveryMessage = document.getElementById('defaultDeliveryMessage');
    const defaultDeliveryMessageTitle = document.createElement('span');
    const defaultDeliveryMessageText = document.createElement('span');
    const defaultDeliveryYesButton = defaultDeliveryMessage.querySelector(':scope > .button-wrapper > .yes');
    const defaultDeliveryNoButton = defaultDeliveryMessage.querySelector(':scope > .button-wrapper > .no');

    defaultDeliveryMessageTitle.classList.add('title');
    defaultDeliveryMessageText.classList.add('text');
    defaultDeliveryMessageTitle.innerText = '알림';
    defaultDeliveryMessage.prepend(defaultDeliveryMessageTitle, defaultDeliveryMessageText);

    let defaultDeliveryId = null;


    function showDefaultDeliveryMessage(text) {
        defaultDeliveryMessage.classList.add('visible');
        defaultDeliveryMessageText.innerText = text;
    }

    defaultDeliveryNoButton.addEventListener('click', () => {
        defaultDeliveryMessage.classList.remove('visible');
        defaultDeliveryId = null;
    });

    deliveryAddressList.addEventListener('click', (e) => {
        const defaultButton = e.target.closest('.select-btn');
        if (!defaultButton) {
            return;
        }
        const addressItem = defaultButton.closest('.delivery-item');
        defaultDeliveryId = addressItem.dataset.deliveryAddressId;
        console.log(defaultDeliveryId);
        showDefaultDeliveryMessage('이 주소를 대표 배송지로 변경하시겠습니까?');
    });

    defaultDeliveryYesButton.addEventListener('click', () => {
        if (!defaultDeliveryId) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('addressId', defaultDeliveryId);
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
                    showMessage('대표 배송지 설정에 실패하였습니다. 다시 시도해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':                    showMessage('로그인을 해주세요.', () => {
                    location.href = '/user/login';
                });
                    break;
                case 'SUCCESS':
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
            }
        };
        xhr.open('POST', '/my/delivery/default');
        xhr.send(formData);
    })
    // endregion


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
        console.log(deleteDeliveryAddressId)
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
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
            }

        };
        xhr.open('POST', '/my/delivery/delete');
        xhr.send(formData);
    });
    // endregion

    // region 배송지 수정
    const deliveryAddressModifyModal = document.getElementById('delivery-address-modify-modal');
    const deliveryAddressModifyModalContent = deliveryAddressModifyModal.querySelector('.delivery-address-modify');
    const deliveryAddressCards = deliveryModal.querySelectorAll('.delivery-item');
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
    deliveryAddressCards.forEach(card => {
        const deliveryAddressModifyModalOpenButton = card.querySelector('.edit-btn');
        deliveryAddressModifyModalOpenButton.addEventListener('click', () => {
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
        });
    });

    deliveryAddressModifyModalCancelButton.addEventListener('click', () => {
        deliveryAddressModifyModal.classList.remove('visible');
        deliveryAddressModifyModalContent.classList.remove('visible');
    });

    const deliveryAddressModifyFind = deliveryAddressModifyModalContent.querySelector(':scope > .delivery-modify-wrapper > .label > .button');
    const deliveryAddressModifyWrapper = document.getElementById('delivery-address-modify-wrapper');
    const deliveryAddressModifyContainer = document.getElementById('delivery-address-modify-container');
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
                    location.href = '/my?menu=' + getCurrentMenuIndex();
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
    });

    deliveryRegistrationModal.querySelector('.close-btn').addEventListener('click', () => {
        closeDeliveryModal();
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
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
            }
        };
        xhr.open('POST', '/my/delivery/registration');
        xhr.send(formData);

    })
    // endregion
// endregion

}



const reservationCards = document.querySelectorAll('.reservation-card');

reservationCards.forEach(card => {
    const reservationId = card.dataset.reservationId;
    card.addEventListener('click', () => {
        console.log(reservationId)
    })
});


// 사업자회원 변경
if (businessInformation) {
    // region 기업명 변경 모달
    const companyNameChangeModalOpen = businessInformation.querySelector('.companyNameChangeButton');
    const companyNameChangeModal = document.getElementById('companyName-change-modal');
    const companyNameChangeModalContent = companyNameChangeModal.querySelector('.modal-content');
    const companyNameChangeModalCancelButton = companyNameChangeModal.querySelector('.close-btn');

    companyNameChangeModalOpen.addEventListener('click', () => {
        companyNameChangeModal.classList.add('visible');
        companyNameChangeModalContent.classList.add('visible');
    });

    companyNameChangeModalCancelButton.addEventListener('click', () => {
        companyNameChangeModal.classList.remove('visible');
        companyNameChangeModalContent.classList.remove('visible');
    });

    const companyNameChangeButton = companyNameChangeModal.querySelector('.modify-button');
    companyNameChangeButton.addEventListener('click', (e) => {
        e.preventDefault();
        const companyNameChangeInput = companyNameChangeModal.querySelector('.name.input');
        const companyNameChangePasswordInput = companyNameChangeModal.querySelector('.password.input');
        if (companyNameChangeInput.value === '') {
            companyNameChangeInput.focus();
            showMessage('변경하실 기업명을 입력해주세요.');
            return;
        }
        if (!/^[\\da-zA-Z가-힣]{1,150}$/g.test(companyNameChangeInput.value)) {
            companyNameChangeInput.focus();
            showMessage('올바른 기업명을 입력해주세요. \n기업명은 숫자, 영어 대소문자, 완성 한글 1~150자로 이루어져야 합니다.');
            return;
        }
        if (companyNameChangePasswordInput.value === '') {
            showMessage('비밀번호를 입력해주세요.');
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('companyName', companyNameChangeInput.value);
        formData.append('password', companyNameChangePasswordInput.value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 400) {
                console.log('서버 오류 발생');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'FAILURE':
                    showMessage('기업명 변경에 실패하였습니다. 기업명 또는 비밀번호를 다시 확인해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
                    showMessage('알 수 없는 이유로 수정에 실패하였습니다. 다시 시도해주세요.');
            }
        };
        xhr.open('PATCH', '/my/companyName/change');
        xhr.send(formData);
    });
// endregion

    // region 대표자명 변경 모달
    const representativeNameChangeModalOpen = businessInformation.querySelector('.representativeNameChangeButton');
    const representativeNameChangeModal = document.getElementById('representativeName-change-modal');
    const representativeNameChangeModalContent = representativeNameChangeModal.querySelector('.modal-content');
    const representativeNameChangeModalCancelButton = representativeNameChangeModal.querySelector('.close-btn');

    representativeNameChangeModalOpen.addEventListener('click', () => {
        representativeNameChangeModal.classList.add('visible');
        representativeNameChangeModalContent.classList.add('visible');
    });

    representativeNameChangeModalCancelButton.addEventListener('click', () => {
        representativeNameChangeModal.classList.remove('visible');
        representativeNameChangeModalContent.classList.remove('visible');
    });

    const representativeNameChangeButton = representativeNameChangeModal.querySelector('.modify-button');
    representativeNameChangeButton.addEventListener('click', (e) => {
        e.preventDefault();
        const representativeNameChangeInput = representativeNameChangeModal.querySelector('.representativeName.input');
        const representativeNameChangePasswordInput = representativeNameChangeModal.querySelector('.password.input');
        if (representativeNameChangeInput.value === '') {
            representativeNameChangeInput.focus();
            showMessage('변경하실 대표자명을 입력해주세요.');
            return;
        }
        if (!/^[가-힣]{2,20}$/g.test(representativeNameChangeInput.value)) {
            representativeNameChangeInput.focus();
            showMessage('올바른 대표자명을 입력해주세요. \n대표자명은 완성 한글 2~20자로 이루어져야 합니다..');
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('representativeName', representativeNameChangeInput.value);
        formData.append('password', representativeNameChangePasswordInput.value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 400) {
                console.log('서버 오류 발생');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'FAILURE':
                    showMessage('대표자명 변경에 실패하였습니다. 대표자명 또는 비밀번호를 다시 확인해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
                    showMessage('알 수 없는 이유로 수정에 실패하였습니다. 다시 시도해주세요.');
            }
        };
        xhr.open('PATCH', '/my/representativeName/change');
        xhr.send(formData);
    });
// endregion

    // region 사업자회원 주소 관리
    const companyAddressModal = document.getElementById('companyAddress-modal');
    const companyAddressModalContent = companyAddressModal.querySelector('.companyAddress-change');

    const companyAddressModalOpenButton = businessInformation.querySelector('.companyAddress-open-button');

    companyAddressModalOpenButton.addEventListener('click', () => {
        companyAddressModal.classList.add('visible');
        companyAddressModalContent.classList.add('visible');
        resetAddressModal();
    });

    const companyAddressModalCloseButton = companyAddressModal.querySelector('.close-btn');

    companyAddressModalCloseButton.addEventListener('click', () => {
        companyAddressModal.classList.remove('visible');
        companyAddressModalContent.classList.remove('visible');
    });

    function resetAddressModal() {
        companyAddressModal.querySelectorAll('[data-default]').forEach(input => {
            input.value = input.dataset.default;
        });
        companyAddressPasswordInput.value = '';
    }

// 내정보 관리에서 주소검색 띄우기
// 내정보 관리에서 주소 추가할 시 주소검색 띄우기
    const companyAddressFind = companyAddressModal.querySelector(':scope > .companyAddress-change > .companyAddressChange-wrapper > .label > .button');
    const companyAddressWrapper = document.getElementById('companyAddress-wrapper');
    const companyAddressContainer = document.getElementById('companyAddress-container');
    const modalCover = companyAddressModal.querySelector('.modal-cover');
    const companyAddressPostalInput = companyAddressModal.querySelector('.postalCode');
    const companyAddressPrimaryInput = companyAddressModal.querySelector('.addressPrimary');
    const companyAddressSecondaryInput = companyAddressModal.querySelector('.addressSecondary');
    const companyAddressPasswordInput = companyAddressModal.querySelector('.password.input');

    companyAddressFind.addEventListener('click', () => {
        companyAddressWrapper.classList.add('visible');
        modalCover.classList.add('visible');
        companyAddressContainer.innerHTML = '';
        new daum.Postcode({
            oncomplete: function (data) {
                // 우편번호
                companyAddressPostalInput.value = data.zonecode;
                companyAddressPrimaryInput.value = data.roadAddress || data.jibunAddress;
                companyAddressWrapper.classList.remove('visible');
                modalCover.classList.remove('visible');
                companyAddressSecondaryInput.value = '';
                companyAddressSecondaryInput.focus();
            }
        }).embed(companyAddressContainer);
    });

    const addressCancelButton = companyAddressWrapper.querySelector(':scope > .button');
    addressCancelButton.addEventListener('click', () => {
        companyAddressWrapper.classList.remove('visible');
        modalCover.classList.remove('visible');
    });


    const companyAddressChangeButton = companyAddressModal.querySelector('.companyAddressChangeButton');
    companyAddressChangeButton.addEventListener('click', () => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('postalCode', companyAddressPostalInput.value);
        formData.append('addressPrimary', companyAddressPrimaryInput.value);
        formData.append('addressSecondary', companyAddressSecondaryInput.value);
        formData.append('password', companyAddressPasswordInput.value || null);
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
                    showMessage('주소 변경에 실패하였습니다 정보를 다시 확인해주세요.');
                    break;
                case 'FAILURE_SESSION_EXPIRED':
                    showMessage('로그인을 해주세요.', () => {
                        location.href = '/user/login';
                    });
                    break;
                case 'SUCCESS':
                    companyAddressModal.classList.remove('visible');
                    resetAddressModal();
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
                    showMessage('알 수 없는 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.');
            }

        };
        xhr.open('PATCH', '/my/companyAddress/change');
        xhr.send(formData);
    });
// endregion

    if (storeInformation) {
        // region 가게등록 모달
        const storeRegistrationModalOpen = storeInformation.querySelector('.add-card');
        const storeRegistrationModal = document.getElementById('store-registration-modal');
        const storeRegistrationModalClose = storeRegistrationModal.querySelector('.close-btn');
        const storeRegistrationButton = storeRegistrationModal.querySelector('.registrationButton');
        storeRegistrationModalOpen.addEventListener('click', () => {
            storeRegistrationModal.classList.add('visible');
        });

        storeRegistrationModalClose.addEventListener('click', () => {
            storeRegistrationModal.classList.remove('visible');
        });


        const storeAddressFind = storeRegistrationModal.querySelector(':scope > .store-registration > .registration-wrapper > .label > .button');
        const storeAddressWrapper = document.getElementById('storeAddress-wrapper');
        const storeAddressContainer = document.getElementById('storeAddress-container');
        const modalCover = storeRegistrationModal.querySelector('.modal-cover');
        const postalInput = storeRegistrationModal.querySelector('.postalCode');
        const primaryAddressInput = storeRegistrationModal.querySelector('.addressPrimary');
        const detailAddressInput = storeRegistrationModal.querySelector('.addressSecondary');

        storeAddressFind.addEventListener('click', () => {
            storeAddressWrapper.classList.add('visible');
            modalCover.classList.add('visible');
            storeAddressContainer.innerHTML = '';
            new daum.Postcode({
                oncomplete: function (data) {
                    // 우편번호
                    postalInput.value = data.zonecode;
                    primaryAddressInput.value = data.roadAddress || data.jibunAddress;
                    storeAddressWrapper.classList.remove('visible');
                    modalCover.classList.remove('visible');
                    detailAddressInput.focus();
                }
            }).embed(storeAddressContainer);
        });

        const addressCancelButton = storeAddressWrapper.querySelector(':scope > .button');
        addressCancelButton.addEventListener('click', () => {
            storeAddressWrapper.classList.remove('visible');
            modalCover.classList.remove('visible');
        });

        const storeNameInput = storeRegistrationModal.querySelector('.storeNameInput');
        const storePhoneLocalNumber = storeRegistrationModal.querySelector('.contactNumber.local');
        const storePhoneMiddleNumber = storeRegistrationModal.querySelector('.contactNumber.first');
        const storePhoneLastNumber = storeRegistrationModal.querySelector('.contactNumber.second');
        const storePostalCode = storeRegistrationModal.querySelector('.postalCode');
        const storeAddressPrimary = storeRegistrationModal.querySelector('.addressPrimary');
        const storeAddressSecondary = storeRegistrationModal.querySelector('.addressSecondary');
        const storeCategory = storeRegistrationModal.querySelector('.category');
        storeRegistrationButton.addEventListener('click', () => {
            const storePhone = storePhoneLocalNumber.value + storePhoneMiddleNumber.value + storePhoneLastNumber.value;

            if (storeNameInput.value === '') {
                showMessage('가게명을 입력해주세요.');
                return;
            }
            if (storeNameInput.value.length < 1 || storeNameInput.value.length > 100) {
                showMessage('가게명은 1~100자까지 가능합니다.');
                return;
            }
            if (storePhoneLocalNumber.value === '') {
                showMessage('전화번호를 모두 입력해주세요.');
                return;
            }
            if (storePhoneMiddleNumber.value === '') {
                showMessage('전화번호를 모두 입력해주세요.');
                return;
            }
            if (storePhoneLastNumber.value === '') {
                showMessage('전화번호를 모두 입력해주세요.');
                return;
            }
            if (storePhone.length < 9 || storePhone.length > 11) {
                showMessage('전화번호를 다시 확인해주세요.');
                return;
            }
            if (storePhoneLastNumber.value.length !== 4) {
                showMessage('전화번호를 다시 확인해주세요.');
                return;
            }
            if (storePostalCode.value === '' ||
                storeAddressPrimary.value === '') {
                showMessage('주소를 입력해주세요.');
                return;
            }
            if (storePostalCode.value.length !== 5) {
                showMessage('우편번호의 길이가 맞지 않습니다.');
                return;
            }
            if (storeAddressPrimary.value.length > 150) {
                showMessage('기본주소는 1~150자까지 가능합니다.');
                return;
            }
            if (storeAddressSecondary.value.length > 100) {
                showMessage('상세주소는 최대 100자까지 가능합니다.');
                return;
            }
            if (storeCategory.value === '') {
                showMessage('카테고리를 선택해주세요.');
                return;
            }
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('storeName', storeNameInput.value);
            formData.append('storePhone', storePhone);
            formData.append('postalCode', storePostalCode.value);
            formData.append('addressPrimary', storeAddressPrimary.value);
            formData.append('addressSecondary', storeAddressSecondary.value);
            formData.append('category', storeCategory.value);
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
                        showMessage('정보를 다시 확인해주세요.');
                        console.log('가게등록 실패')
                        break;
                    case 'FAILURE_SESSION_EXPIRED':
                        showMessage('로그인이 만료되었습니다', () => {
                            location.href = '/user/login';
                        })
                        break;
                    case 'SUCCESS':
                        console.log('가게등록 성공')
                        storeRegistrationModal.classList.remove('visible');
                        location.href = '/my?menu=' + getCurrentMenuIndex();
                        break;
                    default:
                }
            };
            xhr.open('POST', '/my/store/registration');
            xhr.send(formData);

        });

        // endregion

        // region 가게 삭제 모달
        const deleteStoreModal = document.getElementById('delete-store-modal');
        const deleteStoreModalCancelButton = deleteStoreModal.querySelector('.close-btn');
        const deleteStoreButton = deleteStoreModal.querySelector('.delete-button');
        let selectedStoreId = null;

        const storeCards = storeInformation.querySelectorAll('.store-card:not(.add-card)');

        storeCards.forEach(card => {
            const deleteStoreModalOpen = card.querySelector('.delete');
            deleteStoreModalOpen.addEventListener('click', () => {
                selectedStoreId = card.dataset.storeId;
                deleteStoreModal.classList.add('visible');
            })
        })

        deleteStoreModalCancelButton.addEventListener('click', () => {
            deleteStoreModal.classList.remove('visible');
        });


        deleteStoreButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (!selectedStoreId) {
                showMessage('삭제할 가게를 찾지 못했습니다.');
                return;
            }
            const deleteStorePasswordInput = deleteStoreModal.querySelector('.password.input');
            if (deleteStorePasswordInput.value === '') {
                showMessage('비밀번호를 입력해주세요.');
                return;
            }

            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('storeId', selectedStoreId);
            formData.append('password', deleteStorePasswordInput.value);
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                if (xhr.status < 200 || xhr.status >= 400) {
                    console.log('서버 오류 발생');
                    return;
                }
                const response = JSON.parse(xhr.responseText);
                switch (response.result) {
                    case 'FAILURE':
                        showMessage('가게 삭제에 실패하였습니다. 비밀번호를 다시 확인해주세요.');
                        break;
                    case 'FAILURE_SESSION_EXPIRED':
                        showMessage('로그인을 해주세요.', () => {
                            location.href = '/user/login';
                        });
                        break;
                    case 'SUCCESS':
                        deleteStoreModal.classList.remove('visible');
                        location.href = '/my?menu=' + getCurrentMenuIndex();
                        break;
                    default:
                        showMessage('알 수 없는 이유로 삭제에 실패하였습니다. 다시 시도해주세요.');
                }
            };
            xhr.open('POST', '/my/store/delete');
            xhr.send(formData);
        });
// endregion

        // region 가게 수정 모달
        const modifyStoreModal = document.getElementById('store-modify-modal');
        const modifyStoreModalCancelButton = modifyStoreModal.querySelector('.close-btn');
        const modifyStoreButton = modifyStoreModal.querySelector('.modifyButton');

        function splitPhone(phone) {
            if (!phone) {
                return {local: '', middle: '', last: ''};
            }
            phone = phone.replaceAll('-', '');

            if (phone.startsWith('02')) {
                return {
                    local: '02',
                    middle: phone.substring(2, phone.length - 4),
                    last: phone.substring(phone.length - 4)
                };
            }
            return {
                local: phone.substring(0, 3),
                middle: phone.substring(3, 7),
                last: phone.substring(7)
            };
        }

        storeCards.forEach(card => {
            const modifyStoreModalOpen = card.querySelector('.modify');
            modifyStoreModalOpen.addEventListener('click', () => {
                resetStoreModal();
                selectedStoreId = card.dataset.storeId;
                modifyStoreModal.classList.add('visible');

                modifyStoreNameInput.value = card.dataset.storeName;
                const modifyStorePhone = splitPhone(card.dataset.storePhone);
                modifyStoreLocalNumber.value = modifyStorePhone.local;
                modifyStoreMiddleNumber.value = modifyStorePhone.middle;
                modifyStoreLastNumber.value = modifyStorePhone.last;
                modifyStoreAddressPostalInput.value = card.dataset.postalCode;
                modifyStoreAddressPrimaryInput.value = card.dataset.addressPrimary;
                modifyStoreAddressSecondaryInput.value = card.dataset.addressSecondary || '';
                modifyStoreAddressCategory.value = card.dataset.category;
            });
        })

        modifyStoreModalCancelButton.addEventListener('click', () => {
            modifyStoreModal.classList.remove('visible');
        });

        function resetStoreModal() {
            modifyStoreModal.querySelectorAll('[data-default]').forEach(input => {
                input.value = input.dataset.default;
            });
        }

// 내정보 관리에서 주소검색 띄우기
// 내정보 관리에서 주소 추가할 시 주소검색 띄우기
        const modifyStoreAddressFind = modifyStoreModal.querySelector(':scope > .store-modify > .modify-wrapper > .label > .button');
        const modifyStoreAddressWrapper = document.getElementById('storeAddressModify-wrapper');
        const modifyStoreAddressContainer = document.getElementById('storeAddressModify-container');
        const modifyStoreModalCover = modifyStoreModal.querySelector('.modal-cover');
        const modifyStoreNameInput = modifyStoreModal.querySelector('.storeNameInput');
        const modifyStoreLocalNumber = modifyStoreModal.querySelector('.local');
        const modifyStoreMiddleNumber = modifyStoreModal.querySelector('.first');
        const modifyStoreLastNumber = modifyStoreModal.querySelector('.second');
        const modifyStoreAddressPostalInput = modifyStoreModal.querySelector('.postalCode');
        const modifyStoreAddressPrimaryInput = modifyStoreModal.querySelector('.addressPrimary');
        const modifyStoreAddressSecondaryInput = modifyStoreModal.querySelector('.addressSecondary');
        const modifyStoreAddressCategory = modifyStoreModal.querySelector('.category');

        modifyStoreAddressFind.addEventListener('click', () => {
            modifyStoreAddressWrapper.classList.add('visible');
            modifyStoreModalCover.classList.add('visible');
            modifyStoreAddressContainer.innerHTML = '';
            new daum.Postcode({
                oncomplete: function (data) {
                    // 우편번호
                    modifyStoreAddressPostalInput.value = data.zonecode;
                    modifyStoreAddressPrimaryInput.value = data.roadAddress || data.jibunAddress;
                    modifyStoreAddressWrapper.classList.remove('visible');
                    modifyStoreModalCover.classList.remove('visible');
                    modifyStoreAddressSecondaryInput.value = '';
                    modifyStoreAddressSecondaryInput.focus();
                }
            }).embed(modifyStoreAddressContainer);
        });

        const modifyStoreAddressCancelButton = modifyStoreAddressWrapper.querySelector(':scope > .button');
        modifyStoreAddressCancelButton.addEventListener('click', () => {
            modifyStoreAddressWrapper.classList.remove('visible');
            modifyStoreModalCover.classList.remove('visible');
        });

        // 모달에서 가게수정 버튼
        modifyStoreButton.addEventListener('click', () => {
            const modifyStorePhone = modifyStoreLocalNumber.value + modifyStoreMiddleNumber.value + modifyStoreLastNumber.value;


            if (modifyStoreNameInput.value === '') {
                showMessage('가게명을 입력해주세요.');
                return;
            }
            if (modifyStoreNameInput.value.length < 1 ||
                modifyStoreNameInput.value.length > 100) {
                showMessage('가게명은 1~100자까지 가능합니다.');
                return;
            }
            if (modifyStoreAddressPostalInput.value === '' ||
                modifyStoreAddressPrimaryInput.value === '') {
                showMessage('주소를 입력해주세요.');
                return;
            }
            if (modifyStoreAddressPostalInput.value.length !== 5) {
                showMessage('우편번호가 맞지 않습니다.');
                return;
            }
            if (modifyStoreAddressPrimaryInput.value.length < 1 || modifyStoreAddressPrimaryInput.value.length > 150) {
                showMessage('기본주소는 1~150자까지 가능합니다.');
                return;
            }
            if (modifyStoreAddressSecondaryInput.value.length > 100) {
                showMessage('상세주소는 최대 100자까지 가능합니다.');
                return;
            }
            if (modifyStoreAddressCategory.value === '') {
                showMessage('카테고리를 선택해주세요.');
                return;
            }
            if (modifyStorePhone.length < 9 ||
                modifyStorePhone.length > 11) {
                showMessage('전화번호를 다시 확인해주세요.');
                return;
            }
            if (modifyStoreLastNumber.value.length !== 4) {
                showMessage('전화번호를 다시 확인해주세요.');
                return;
            }


            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('storeId', selectedStoreId);
            formData.append('storeName', modifyStoreNameInput.value);
            formData.append('storePhone', modifyStorePhone);
            formData.append('postalCode', modifyStoreAddressPostalInput.value);
            formData.append('addressPrimary', modifyStoreAddressPrimaryInput.value);
            if (modifyStoreAddressSecondaryInput.value !== '') {
                formData.append('addressSecondary', modifyStoreAddressSecondaryInput.value);
            }
            formData.append('category', modifyStoreAddressCategory.value);
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
                        showMessage('가게 수정에 실패하였습니다 정보를 다시 확인해주세요.');
                        break;
                    case 'FAILURE_SESSION_EXPIRED':
                        showMessage('로그인을 해주세요.', () => {
                            location.href = '/user/login';
                        });
                        break;
                    case 'SUCCESS':
                        modifyStoreModal.classList.remove('visible');
                        resetStoreModal();
                        location.href = '/my?menu=' + getCurrentMenuIndex();
                        break;
                    default:
                        showMessage('알 수 없는 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.');
                }

            };
            xhr.open('PATCH', '/my/store/modify');
            xhr.send(formData);
        });
        // endregion
    }
}


// 공통 변경
// region 전화번호 변경 모달
const phoneChangeModalOpen = content.querySelector('.phoneChangeButton');
const phoneChangeModal = document.getElementById('phone-change-modal');
const phoneChangeModalCancelButton = phoneChangeModal.querySelector('.close-btn');
const phoneChangeModalContent = phoneChangeModal.querySelector('.modal-content');

phoneChangeModalOpen.addEventListener('click', () => {
    phoneChangeModal.querySelector('.first.input').value = '';
    phoneChangeModal.querySelector('.second.input').value = '';
    phoneChangeModal.querySelector('.password.input').value = '';
    phoneChangeModal.classList.add('visible');
    phoneChangeModalContent.classList.add('visible');
});

phoneChangeModalCancelButton.addEventListener('click', () => {
    phoneChangeModal.classList.remove('visible');
    phoneChangeModalContent.classList.remove('visible');
});
const phoneChangeButton = phoneChangeModal.querySelector('.modify-button');
phoneChangeButton.addEventListener('click', (e) => {
    e.preventDefault();
    const firstNumberInput = phoneChangeModal.querySelector('.firstNumber');
    const contactNumberMiddleInput = phoneChangeModal.querySelector('.contactNumber.first');
    const contactNumberLastInput = phoneChangeModal.querySelector('.contactNumber.second');
    const phoneChangePasswordInput = phoneChangeModal.querySelector('.password.input');
    if (firstNumberInput.value === '') {
        firstNumberInput.focus();
        showMessage('전화번호를 모두 입력해주세요.');
        return;
    }
    if (contactNumberMiddleInput.value === '') {
        contactNumberMiddleInput.focus();
        showMessage('전화번호를 모두 입력해주세요.');
        return;
    }
    if (contactNumberLastInput.value === '') {
        contactNumberLastInput.focus();
        showMessage('전화번호를 모두 입력해주세요.');
        return;
    }
    if (phoneChangePasswordInput.value === '') {
        showMessage('비밀번호를 입력해주세요.');
        return;
    }
    const phone = firstNumberInput.value + contactNumberMiddleInput.value + contactNumberLastInput.value;

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('phone', phone);
    formData.append('password', phoneChangePasswordInput.value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 400) {
            console.log('서버 오류 발생');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'FAILURE':
                showMessage('전화번호 변경에 실패하였습니다. 전화번호와 비밀번호를 다시 확인해주세요.');
                break;
            case 'FAILURE_SESSION_EXPIRED':
                showMessage('로그인을 해주세요.', () => {
                    location.href = '/user/login';
                });
                break;
            case 'FAILURE_PHONE_DUPLICATE':
                showMessage('이미 사용중인 전화번호입니다.');
                break;
            case 'SUCCESS':
                location.href = '/my?menu=' + getCurrentMenuIndex();
                break;
            default:
                showMessage('알 수 없는 이유로 수정에 실패하였습니다. 다시 시도해주세요.');
        }
    };
    xhr.open('PATCH', '/my/phone/change');
    xhr.send(formData);
});
// endregion

// region 비밀번호 변경 모달
const passwordChangeModalOpen = content.querySelector('.passwordChangeButton');
const passwordChangeModal = document.getElementById('password-change-modal');
const passwordChangeModalCancelButton = passwordChangeModal.querySelector('.close-btn');
const passwordChangeModalContent = passwordChangeModal.querySelector('.modal-content');

passwordChangeModalOpen.addEventListener('click', () => {
    passwordChangeModal.querySelector('.present.input').value = '';
    passwordChangeModal.querySelector('.new.input').value = '';
    passwordChangeModal.querySelector('.newCheck.input').value = '';
    passwordChangeModal.classList.add('visible');
    passwordChangeModalContent.classList.add('visible');
});

passwordChangeModalCancelButton.addEventListener('click', () => {
    passwordChangeModal.classList.remove('visible');
    passwordChangeModalContent.classList.remove('visible');
});

const passwordChangeButton = passwordChangeModal.querySelector('.modify-button');
passwordChangeButton.addEventListener('click', (e) => {
    e.preventDefault();
    const passwordChangePasswordInput = passwordChangeModal.querySelector('.present.input');
    const passwordChangeNewPasswordInput = passwordChangeModal.querySelector('.new.input');
    const passwordChangeNewPasswordCheckInput = passwordChangeModal.querySelector('.newCheck.input');
    if (passwordChangePasswordInput.value === '') {
        showMessage('현재 비밀번호를 입력해주세요.');
        return;
    }
    if (passwordChangeNewPasswordInput.value === '') {
        showMessage('새 비밀번호를 입력해주세요.');
        return;
    }
    if (passwordChangeNewPasswordInput.value.length < 6) {
        showMessage('비밀번호는 6자리 이상으로 구성해야 합니다.');
        return;
    }
    if (passwordChangeNewPasswordCheckInput.value === '') {
        showMessage('새 비밀번호를 한 번 더 입력해주세요.');
        return;
    }
    if (passwordChangeNewPasswordInput.value !== passwordChangeNewPasswordCheckInput.value) {
        showMessage('새 비밀번호가 서로 일치하지 않습니다. 다시 입력해주세요.');
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('password', passwordChangePasswordInput.value);
    formData.append('newPassword', passwordChangeNewPasswordInput.value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 400) {
            console.log('서버 오류 발생');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'FAILURE':
                showMessage('비밀번호 변경에 실패하였습니다. 정보를 다시 확인해주세요.');
                break;
            case 'FAILURE_SESSION_EXPIRED':
                showMessage('로그인을 해주세요.', () => {
                    location.href = '/user/login';
                });
                break;
            case 'FAILURE_PASSWORD_DUPLICATE':
                showMessage('현재 사용중인 비밀번호와 일치합니다. 다시 입력해주세요.');
                break;
            case 'SUCCESS':
                location.href = '/my?menu=' + getCurrentMenuIndex();
                break;
            default:
                showMessage('알 수 없는 이유로 수정에 실패하였습니다. 다시 시도해주세요.');
        }
    };
    xhr.open('PATCH', '/my/password/change');
    xhr.send(formData);
});
// endregion

// region 유저 탈퇴 모달
const deleteUserModalOpen = content.querySelector('.deleteUserButton');
const deleteUserModal = document.getElementById('delete-user-modal');
const deleteUserModalCancelButton = deleteUserModal.querySelector('.close-btn');
const deleteUserModalContent = deleteUserModal.querySelector('.modal-content');

deleteUserModalOpen.addEventListener('click', () => {
    deleteUserModal.querySelector('.password.input').value = '';
    deleteUserModal.querySelector('.passwordCheck.input').value = '';
    deleteUserModal.classList.add('visible');
    deleteUserModalContent.classList.add('visible');
});

deleteUserModalCancelButton.addEventListener('click', () => {
    deleteUserModal.classList.remove('visible');
    deleteUserModalContent.classList.remove('visible');
});

const deleteUserButton = deleteUserModal.querySelector('.delete-button');
deleteUserButton.addEventListener('click', (e) => {
    e.preventDefault();
    const deleteUserPasswordInput = deleteUserModal.querySelector('.password.input');
    const deleteUserPasswordCheckInput = deleteUserModal.querySelector('.passwordCheck.input');
    if (deleteUserPasswordInput.value === '') {
        showMessage('비밀번호를 입력해주세요.');
        return;
    }
    if (deleteUserPasswordCheckInput.value === '') {
        showMessage('비밀번호를 한 번 더 입력해주세요.');
        return;
    }
    if (deleteUserPasswordInput.value !== deleteUserPasswordCheckInput.value) {
        showMessage('비밀번호가 서로 일치하지 않습니다. 다시 입력해주세요.');
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('password', deleteUserPasswordInput.value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 400) {
            console.log('서버 오류 발생');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'FAILURE':
                showMessage('회원 탈퇴에 실패하였습니다. 정보를 다시 확인해주세요.');
                break;
            case 'FAILURE_SESSION_EXPIRED':
                showMessage('로그인을 해주세요.', () => {
                    location.href = '/user/login';
                });
                break;
            case 'SUCCESS':
                deleteUserModal.classList.remove('visible');
                showMessage('회원탈퇴를 성공하였습니다. 로그인 화면으로 이동합니다.', () => {
                    location.href = '/user/login';
                });
                break;
            default:
                showMessage('알 수 없는 이유로 수정에 실패하였습니다. 다시 시도해주세요.');
        }
    };
    xhr.open('POST', '/my/delete/user');
    xhr.send(formData);
});
// endregion


// region 마이페이지 (개인+애완동물 로직)

/*============마이페이지 애완동물================*/

if (petInformation) {
    // 애완동물 강아지 종
    const dogTypes = [
        "세상에하나뿐인믹스",
        "고든세터",
        "골든두들",
        "골든리트리버",
        "그레이하운드",
        "그레이트데인",
        "그레이트스위스마운틴도그",
        "그레이트피레니즈",
        "그로넨달",
        "그리스셰퍼드",
        "그리스헤어하운드",
        "그린란드견",
        "글렌오브이말테리어",
        "기슈견",
        "까나리오",
        "꼬동드툴레아",
        "나폴리탄마스티프",
        "노르보텐스피츠",
        "노르웨이안룬트훈트",
        "노르웨이안버훈트",
        "노르웨이안엘크하운드",
        "노르위치테리어",
        "노르포크테리어",
        "노바스코셔덕톨링리트리버",
        "뉴펀들랜드",
        "닥스훈트",
        "달마시안",
        "대니시스웨디시팜독",
        "댄디딘몬트테리어",
        "더치셰퍼드",
        "도고까나리오",
        "도고아르헨티노",
        "도그드보르도",
        "도베르만",
        "도사견",
        "동경견(경주개)",
        "드레버",
        "디어하운드",
        "라고토로마뇰로",
        "라사압소",
        "라이카",
        "라지먼스터랜더",
        "라케노이즈",
        "라포니안허더",
        "래브라도리트리버",
        "랫테리어",
        "러셀테리어",
        "러스키토이",
        "러처",
        "레드본쿤하운드",
        "레온베르거",
        "레이크랜드테리어",
        "로디지안리지백",
        "로첸",
        "로트와일러",
        "루마니안미오리틱셰퍼드독",
        "리틀라이언독",
        "마스티프",
        "마운틴커",
        "말리노이즈",
        "말티즈",
        "맨체스터테리어",
        "무디",
        "미니어처불테리어",
        "미니어처슈나우저",
        "미니어처핀셔",
        "미니어처아메리칸셰퍼드",
        "바베트",
        "바센지",
        "바셋포브드브레타뉴",
        "바셋하운드",
        "배들링턴테리어",
        "버거피카드",
        "버니즈마운틴독",
        "벨지안셰퍼드독",
        "보더콜리",
        "보더테리어",
        "보르도마스티프",
        "보르조이",
        "보비에드플란더스",
        "보스롱(뷰세런)",
        "보스턴테리어",
        "보어보엘",
        "보이킨스패니얼",
        "복서",
        "볼로네즈",
        "불마스티프",
        "불테리어",
        "불도그",
        "브라질리언가드독",
        "브라코이탈리아노",
        "브리어드",
        "브리타니스파니엘",
        "블랙러시안테리어",
        "블러드하운드",
        "비글",
        "비숑프리제",
        "비어디드콜리",
        "비즐라",
        "사모예드",
        "살루키",
        "삽살개",
        "샤페이",
        "세인트버나드",
        "셔틀랜드쉽독",
        "슈나우저",
        "스태포드셔불테리어",
        "스탠다드푸들",
        "스피츠",
        "시바견",
        "시베리안허스키",
        "시추",
        "실키테리어",
        "아메리칸불리",
        "아메리칸스태포드셔테리어",
        "아메리칸아키타견",
        "아메리칸에스키모독",
        "아메리칸코커스파니엘",
        "아이리시세터",
        "아이리시울프하운드",
        "아키타견",
        "아프간하운드",
        "알래스칸말라뮤트",
        "에어데일테리어",
        "오스트레일리안셰퍼드독",
        "오스트레일리안캐틀독",
        "오스트레일리안켈피",
        "올드잉글리시쉽독",
        "와이마라너",
        "요크셔테리어",
        "웰시코기",
        "이탈리안그레이하운드",
        "잉글리시불독",
        "잉글리시세터",
        "잭러셀테리어",
        "저먼셰퍼드독",
        "저먼스피츠",
        "제주개",
        "진돗개",
        "차우차우",
        "치와와",
        "카네코르소",
        "카발리에킹찰스스패니얼",
        "케리블루테리어",
        "코카스파니엘",
        "콜리",
        "킹찰스스파니엘",
        "토이푸들",
        "퍼그",
        "페키니즈",
        "포메라니안",
        "푸들",
        "풍산개",
        "프렌치불독",
        "플랫코티드리트리버",
        "핏불테리어",
        "하바니즈",
        "호바와트",
        "홋카이도견",
        "휘핏",
        "기타"
    ];
// 애완동물 고양이 종
    const catTypes = [
        '세상에 하나뿐인 믹스',
        '네벨룽',
        '노르웨이 숲고양이',
        '데본렉스',
        '돈스코이',
        '라가머핀',
        '라이코이',
        '라팜',
        '라팜 쇼트헤어',
        '랙돌',
        '러시안 블루',
        '맹크스',
        '먼치킨',
        '먼치킨 롱헤어',
        '메인쿤',
        '미뉴엣 (나폴레옹)',
        '미뉴엣 롱헤어',
        '민스킨',
        '발리니즈',
        '뱅갈',
        '버만',
        '버미즈',
        '버밀라',
        '봄베이',
        '브라질리안 쇼트헤어',
        '브리티시 롱헤어',
        '브리티시 쇼트헤어',
        '사바나',
        '샤트룩스',
        '샴',
        '세렝게티',
        '셀커크 렉스',
        '셀커크 렉스 롱헤어',
        '소말리',
        '소코케',
        '스노우 슈',
        '스코티시 스트레이트',
        '스코티시 폴드',
        '스코티시 폴드 롱헤어',
        '스키프 토이 밥테일',
        '스핑크스',
        '시베리안 고양이',
        '싱가푸라',
        '싸이프러스 아프로디테',
        '아라비안 마우',
        '아메리칸 밥테일',
        '아메리칸 밥테일 쇼트헤어',
        '아메리칸 쇼트헤어',
        '아메리칸 와이어헤어',
        '아메리칸 컬',
        '아비시니안',
        '엑조틱 쇼트헤어',
        '오리엔탈 고양이',
        '오스트레일리안 미스트',
        '오시캣',
        '오호스 아즐레스',
        '오호스 아즐레스 롱헤어',
        '요크 초콜릿',
        '유러피안 버미즈',
        '유러피안 숏헤어',
        '이그조틱 고양이',
        '이집션 마우',
        '자바니즈',
        '재패니즈 밥테일',
        '저먼 렉스',
        '쵸시',
        '카오마니',
        '캘리포니아 스팽글드',
        '컬러포인트 숏헤어',
        '코니시 렉스',
        '코랏',
        '코리안 쇼트헤어',
        '쿠리리안 밥테일',
        '킴릭',
        '타이',
        '터키시 앙고라',
        '터키시 반',
        '토이거',
        '통키니즈',
        '페르시안',
        '피터볼드',
        '픽시 밥',
        '픽시 밥 롱헤어',
        '하바나 브라운',
        '하이랜더',
        '하이랜드 폴드',
        '히말라얀',
        '기타'
    ];

    const $petRegistrationButton = petInformation.querySelector('.pet-card.add-card');
    const $petDialogs = document.querySelectorAll('.dialog');
    const $petDialogFirst = document.getElementById('petFirst');

    const $petDialogSecond = document.getElementById('petSecond');
    const $petDialogThird = document.getElementById('petThird');

// 무슨 애완동물 종류를 골랐는지
    let selectType = null; // 강아지,고양이,그 외

// 모든 dialog 닫는 함수
    function closeAllPetDialogs() {
        $petDialogs.forEach(dialog => {
            dialog.classList.remove('visible');
        });
        closeWrapper()
    }

// dialog 내 모든 wrapper 닫기
    function closeWrapper() {
        $petDialogFirst.querySelector(':scope > .anotherType-wrapper').classList.remove('visible');
        $petDialogSecondPetTypeWrapper.classList.remove('visible');
        yearWrapper.classList.remove('visible');
        monthWrapper.classList.remove('visible');
        dateWrapper.classList.remove('visible');
    }

// dialog 하나만 열게하기
    function openDialog(dialogStep) {
        currentStep = dialogStep;
        if (dialogStep === 1) {
            $petDialogFirst.classList.add('visible');
            $petDialogSecond.classList.remove('visible');
            $petDialogThird.classList.remove('visible');
        }
        if (dialogStep === 2) {
            $petDialogFirst.classList.remove('visible');
            $petDialogSecond.classList.add('visible');
            $petDialogThird.classList.remove('visible');
        }
        if (dialogStep === 3) {
            $petDialogFirst.classList.remove('visible');
            $petDialogSecond.classList.remove('visible');
            $petDialogThird.classList.add('visible');
        }
    }

    let currentStep = 1;

    function goDialogNextStep() {
        if (currentStep === 1) {
            if (!selectType) {
                return;
            }
            if (petNameInput.value.trim() === '') {
                return;
            }
            openDialog(2);
            return;
        }
        if (currentStep === 2) {
            if (selectType !== 'another') {
                if (dialogSecondPetTypeInput.value.trim() === '') {
                    return;
                }
            }
            openDialog(3);
        }
    }

    const $petDialogThirdCompleteButton = $petDialogThird.querySelector(':scope > .complete');

// 애완동물 첫번째 페이지 초기화
    function resetDialogFirst() {
        $petDialogFirst.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.checked = false;
        });
        $petDialogFirst.querySelector(':scope > .petName-wrapper > .petName').value = '';
        $petDialogFirst.querySelector(':scope > .anotherType-wrapper').classList.remove('visible');
        selectType = null;
        $petDialogFirstNextButton.setAttribute('disabled', '');
    }


    function resetDialogSecond() {
        $petDialogSecond.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        preview.src = '';
        circle.classList.remove('visible');
        $petDialogSecondPetTypeWrapper.classList.remove('visible');
        birthWrappers.forEach(wrapper => {
            wrapper.classList.remove('visible');
        });
        $petDialogSecondNextButton.setAttribute('disabled', '');
        dialogSecondNextButton();
    }

    function resetDialogThird() {
        const genderInputs = $petDialogThird.querySelectorAll('input[name="gender"]');
        genderInputs.forEach(gender => {
            gender.checked = false;
        });
        $petDialogThird.querySelector(':scope > .petWeightLabel > .weight-wrapper > .weight').value = '';
        const weightInputs = $petDialogThird.querySelectorAll('input[name="weightType"]');
        weightInputs.forEach(weightType => {
            weightType.checked = false;
        });
        $petDialogThirdCompleteButton.setAttribute('disabled', '');
    }

    function resetAllDialog() {
        resetDialogFirst()
        resetDialogSecond()
        resetDialogThird()
    }

    let editMod = null;

// 회원가입 네번째 단계에서 애완동물 등록버튼을 눌렀을 때
    $petRegistrationButton.addEventListener('click', () => {
        editMod = null;
        resetAllDialog();
        openDialog(1);
    });

// 애완동물 Dialog에서 취소버튼을 눌러 창을 껐을 때
    $petDialogs.forEach(step => {
        const dialogCancelButton = step.querySelector(':scope > .cancel');

        dialogCancelButton.onclick = () => {
            closeAllPetDialogs()
            // 등록 모드일 때만 초기화
            if (!editMod) {
                resetAllDialog();
            }
            currentStep = 1;
            editMod = null; // 취소하면 editMod 초기화
        };
    });


    const dogSelect = $petDialogFirst.querySelector(':scope > .select-wrapper > .dog');
    const catSelect = $petDialogFirst.querySelector(':scope > .select-wrapper > .cat');
    const anotherSelect = $petDialogFirst.querySelector(':scope > .select-wrapper > .another');

    dogSelect.addEventListener('click', () => {
        selectType = 'dog';
        dialogFirstNextButton()
        if (!editMod) {
            resetDialogSecond();
            resetDialogThird();
        }
        $petDialogFirst.querySelector(':scope > .anotherType-wrapper').classList.remove('visible');
        $petDialogFirst.querySelector(':scope > .anotherType-wrapper > .typeSelect').value = '';
        $petDialogSecond.querySelector(':scope > .selectedPetType > .petType').value = '';
        dialogSecondNextButton();
    });
    catSelect.addEventListener('click', () => {
        selectType = 'cat';
        dialogFirstNextButton()
        if (!editMod) {
            resetDialogSecond();
            resetDialogThird();
        }
        $petDialogFirst.querySelector(':scope > .anotherType-wrapper').classList.remove('visible');
        $petDialogFirst.querySelector(':scope > .anotherType-wrapper > .typeSelect').value = '';
        $petDialogSecond.querySelector(':scope > .selectedPetType > .petType').value = '';
        dialogSecondNextButton();
    });
    anotherSelect.addEventListener('click', () => {
        selectType = 'another';
        dialogFirstNextButton()

        $petDialogFirst.querySelector(':scope > .anotherType-wrapper').classList.add('visible');
        $petDialogSecond.querySelector(':scope > .selectedPetType > .petType').value = '';
        $petDialogSecondPetTypeWrapper.classList.remove('visible');
        if (!editMod) {
            resetDialogSecond();
            resetDialogThird();
        }
        dialogSecondNextButton();
    });


    function dialogFirstNextButton() {
        // 공통: 이름은 필수
        if (!selectType || petNameInput.value.trim() === '') {
            $petDialogFirstNextButton.setAttribute('disabled', '');
            return;
        }
        // another일 경우: 종류 선택도 필수
        if (selectType === 'another') {
            const anotherSelect = $petDialogFirst
                .querySelector(':scope > .anotherType-wrapper > .typeSelect');
            if (!anotherSelect.value) {
                $petDialogFirstNextButton.setAttribute('disabled', '');
                return;
            }
        }
        // 조건 다 만족하면 활성화
        $petDialogFirstNextButton.removeAttribute('disabled');
    }


    const petNameInput = $petDialogFirst.querySelector(':scope > .petName-wrapper > .petName');
    petNameInput.addEventListener('input', () => {
        dialogFirstNextButton()
    });


    const anotherTypeSelect = $petDialogFirst.querySelector(':scope > .anotherType-wrapper > .typeSelect');
    anotherTypeSelect.addEventListener('change', () => {
        dialogFirstNextButton();
    });

// 애완동물 DialogFirst에서 다음버튼을 눌렀을 때
    const $petDialogFirstNextButton = $petDialogFirst.querySelector(':scope > .button');
    $petDialogFirstNextButton.addEventListener('click', () => {
        if (selectType === 'dog') {
            getTypeList(dogTypes);
            $petDialogSecondSelectType.classList.remove('hidden');
        } else if (selectType === 'cat') {
            getTypeList(catTypes);
            $petDialogSecondSelectType.classList.remove('hidden');
        } else if (selectType === 'another') {
            $petDialogSecondSelectType.classList.add('hidden');
            $petDialogSecondNextButton.removeAttribute('disabled');
        }
        goDialogNextStep();
    });

// 애완동물 DialogSecond에서 이전버튼을 눌렀을 때
    const $petDialogPreviousButton = $petDialogSecond.querySelector(':scope > .previous');
    $petDialogPreviousButton.addEventListener('click', () => {
        currentStep = 1;
        openDialog(1);
        $petDialogSecondPetTypeWrapper.classList.remove('visible');
        birthWrappers.forEach(wrapper => {
            wrapper.classList.remove('visible');
        });
    });

// 애완동물 DialogSecond에서 다음버튼을 눌렀을 때
    const $petDialogSecondNextButton = $petDialogSecond.querySelector(':scope > .button');
    $petDialogSecondNextButton.addEventListener('click', () => {
        goDialogNextStep();
    });

// 애완동물 DialogSecond에서 이미지를 등록했을 때
    const circle = $petDialogSecond.querySelector(':scope > .image-wrapper > .circle');
    const preview = circle.querySelector(':scope > .preview');
    const fileInput = circle.querySelector(':scope > .image');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        // 이미지 파일만 허용
        if (!file.type.startsWith('image/')) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;
            circle.classList.add('visible'); // add 숨기고 이미지 표시
        };
        reader.readAsDataURL(file);
    });

// 애완동물 DialogSecond에서 종류선택을 클릭했을 때, 열고 취소 버튼을 눌렀을 때
    const $petDialogSecondSelectType = $petDialogSecond.querySelector(':scope > .selectedPetType');
    const $petDialogSecondPetTypeWrapper = $petDialogSecond.querySelector(':scope > .selectPetType');
    $petDialogSecondSelectType.addEventListener('click', () => {
        $petDialogSecondPetTypeWrapper.classList.add('visible');
        typeList.scrollTop = 0;
    });
    const $petDialogSecondSelectTypeCancelButton = $petDialogSecondPetTypeWrapper.querySelector(':scope > .cancel');
    $petDialogSecondSelectTypeCancelButton.addEventListener('click', () => {
        $petDialogSecondPetTypeWrapper.classList.remove('visible');
    });


    const typeList = $petDialogSecondPetTypeWrapper.querySelector(':scope > .typeList');

    function getTypeList(types) {
        typeList.innerHTML = '';

        types.forEach(typeName => {
            const li = document.createElement('li');
            li.classList.add('type');
            li.textContent = typeName;
            typeList.append(li);
        });
    }

    const dialogSecondPetTypeInput = $petDialogSecondSelectType.querySelector(':scope > .petType');

    function dialogSecondNextButton() {
        if (selectType === 'another') {
            $petDialogSecondNextButton.removeAttribute('disabled');
            return;
        }

        // selectType이 dog/cat인 경우
        if (dialogSecondPetTypeInput.value.trim() !== '') {
            $petDialogSecondNextButton.removeAttribute('disabled');
        } else {
            $petDialogSecondNextButton.setAttribute('disabled', '');
        }
    }


// 애완동물 종 검색기능
    const typeSearch = $petDialogSecondPetTypeWrapper.querySelector(':scope > .typeSearch');

    typeSearch.addEventListener('input', (e) => {
        const keyword = e.target.value.trim();

        typeList.querySelectorAll('.type').forEach(li => {
            li.style.display = li.textContent.includes(keyword) ? '' : 'none';
        });
    });

// 애완동물 종 선택기능
    typeList.addEventListener('click', (e) => {
        if (!e.target.classList.contains('type')) {
            return;
        }
        $petDialogSecondSelectType.querySelector(':scope > .petType').value = e.target.textContent;
        $petDialogSecondPetTypeWrapper.classList.remove('visible');
        dialogSecondNextButton()
    });


// 애완동물 생년월일
    const yearList = $petDialogSecond.querySelector(':scope > .yearList-wrapper > .yearList');
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 40;
    for (let year = currentYear; year >= minYear; year--) {
        const li = document.createElement('li');
        li.classList.add('year');
        li.textContent = `${year}년`;
        yearList.append(li);
    }
    yearList.addEventListener('click', (e) => {
        if (!e.target.classList.contains('year')) {
            return;
        }
        petYear.value = e.target.textContent;
        const year = parseInt(petYear.value);
        const month = parseInt(petMonth.value);
        getLastDate(year, month);
        yearWrapper.classList.remove('visible');
    });

    const monthList = $petDialogSecond.querySelector(':scope > .monthList-wrapper > .monthList');
    for (let month = 1; month <= 12; month++) {
        const li = document.createElement('li');
        li.classList.add('month');
        li.textContent = `${month}월`;
        monthList.append(li);
    }
    monthList.addEventListener('click', (e) => {
        if (!e.target.classList.contains('month')) {
            return;
        }
        petMonth.value = e.target.textContent;
        const month = parseInt(e.target.textContent);
        const year = parseInt(petYear.value || petYear.placeholder);
        getLastDate(year, month);
        monthWrapper.classList.remove('visible');
    });

    const dateList = $petDialogSecond.querySelector(':scope > .dateList-wrapper > .dateList');

    function getLastDate(year, month) {
        dateList.innerHTML = '';
        let maxDate = 31;
        if (month === 2) {
            if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
                maxDate = 29;
            } else {
                maxDate = 28;
            }
        }
        if (month === 4 || month === 6 || month === 9 || month === 11) {
            maxDate = 30;
        }
        for (let date = 1; date <= maxDate; date++) {
            const li = document.createElement('li');
            li.classList.add('date');
            li.textContent = `${date}일`;
            dateList.append(li);
        }
    }

    dateList.addEventListener('click', (e) => {
        if (!e.target.classList.contains('date')) {
            return;
        }
        petDate.value = e.target.textContent;
        dateWrapper.classList.remove('visible');
    });

// 애완동물 생일 누르면 아래에서 나오게 하는거
    const petYear = $petDialogSecond.querySelector(':scope > .birthPet > .birth-wrapper > .field > .year');
    const petMonth = $petDialogSecond.querySelector(':scope > .birthPet > .birth-wrapper > .field > .month');
    const petDate = $petDialogSecond.querySelector(':scope > .birthPet > .birth-wrapper > .field > .date');
    const yearWrapper = $petDialogSecond.querySelector(':scope > .yearList-wrapper');
    const monthWrapper = $petDialogSecond.querySelector(':scope > .monthList-wrapper');
    const dateWrapper = $petDialogSecond.querySelector(':scope > .dateList-wrapper');
// 일(1~31) 기본값 설정
    const defaultYear = parseInt(petYear.placeholder);
    const defaultMonth = parseInt(petMonth.placeholder);
    getLastDate(defaultYear, defaultMonth);
    petYear.addEventListener('click', () => {
        yearWrapper.classList.add('visible');
        yearList.scrollTop = 0;
    });
    petMonth.addEventListener('click', () => {
        monthWrapper.classList.add('visible');
        monthList.scrollTop = 0;
    });
    petDate.addEventListener('click', () => {
        dateWrapper.classList.add('visible');
        dateList.scrollTop = 0;
    });

// 애완동물 생일 정보(연,월,일)에서 취소버튼을 눌렀을 때
    const birthWrappers = $petDialogSecond.querySelectorAll(':scope > .birthWrapper');
    birthWrappers.forEach(step => {
        const cancelButton = step.querySelector(':scope > .cancel');
        cancelButton.addEventListener('click', () => {
            step.classList.remove('visible');
        });
    });


    const weightInput = $petDialogThird.querySelector(':scope > .petWeightLabel > .weight-wrapper > .weight');
// 몸무게 자릿수 제한
    weightInput.addEventListener('input', () => {
        if (parseFloat(weightInput.value) > 100) {
            weightInput.value = 100;
        }

        if (weightInput.value.length > 1 && weightInput.value.startsWith('0') && !weightInput.value.startsWith('0.')) {
            weightInput.value = weightInput.value.replace(/^0+/, '');
        }

        if (weightInput.value < 0) {
            weightInput.value = 0;
        }

        if (weightInput.value.includes('.')) {
            const [intPart, decimalPart] = weightInput.value.split('.');
            if (decimalPart.length > 1) {
                weightInput.value = intPart + '.' + decimalPart.slice(0, 1);
            }
        }
    });

    function dialogThirdCompleteButton() {
        const genderCheck = $petDialogThird.querySelector('input[name="gender"]:checked');
        const weightTypeCheck = $petDialogThird.querySelector('input[name="weightType"]:checked');
        if (genderCheck && weightInput.value.trim() !== '' && weightTypeCheck) {
            $petDialogThirdCompleteButton.removeAttribute('disabled');
        } else {
            $petDialogThirdCompleteButton.setAttribute('disabled', '');
        }
        if (weightInput.value <= 0) {
            $petDialogThirdCompleteButton.setAttribute('disabled', '');
        }
    }

    $petDialogThird.querySelectorAll('input[name="gender"]').forEach(gender => {
        gender.addEventListener('change', dialogThirdCompleteButton);
    });
    weightInput.addEventListener('input', dialogThirdCompleteButton);

    $petDialogThird.querySelectorAll('input[name="weightType"]').forEach(type => {
        type.addEventListener('change', dialogThirdCompleteButton);
    })

// 애완동물 DialogThird에서 이전버튼을 눌렀을 때
    const $petDialogThirdPreviousButton = $petDialogThird.querySelector(':scope > .previous');
    $petDialogThirdPreviousButton.addEventListener('click', () => {
        currentStep = 2;
        openDialog(2);
    });

    const pets = [];
    const petList = petInformation.querySelector(':scope > .pet-grid');

// 애완동물 DialogThird에서 작성완료 버튼을 눌렀을 때
    $petDialogThirdCompleteButton.addEventListener('click', async () => {
        const genderInput = $petDialogThird.querySelector('input[name="gender"]:checked');
        const weight = $petDialogThird.querySelector(':scope > .petWeightLabel > .weight-wrapper > .weight');
        const weightTypeInput = $petDialogThird.querySelector('input[name="weightType"]:checked');
        const introduction = $petDialogSecond.querySelector(':scope > .introduction > .introduce');

        let species = null;
        if (selectType === 'another') {
            species = $petDialogFirst
                .querySelector(':scope > .anotherType-wrapper > .typeSelect')
                .value;
        } else {
            species = $petDialogSecondSelectType
                .querySelector(':scope > .petType')
                .value;
        }

        const year = parseInt((petYear.value || petYear.placeholder).replace(/\D/g, ''), 10);
        const month = parseInt((petMonth.value || petMonth.placeholder).replace(/\D/g, ''), 10);
        const day = parseInt((petDate.value || petDate.placeholder).replace(/\D/g, ''), 10);

        const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const petData = {
            name: petNameInput.value,
            imageUrl: fileInput.files.length > 0
                ? preview.src
                : editMod
                    ? editMod.imageUrl
                    : '/user/assets/images/defaultPetImage.png',
            species: species,
            birthDate: birthDate,
            introduction: introduction.value,
            gender: genderInput ? genderInput.classList.contains('male') ? 'MALE' : 'FEMALE' : null,
            weight: weight.value,
            bodyType: weightTypeInput
                ? weightTypeInput.classList.contains('slim') ? 'SLIM'
                    : weightTypeInput.classList.contains('normal') ? 'NORMAL'
                        : 'CHUBBY'
                : null
        }

        if (editMod) {
            // 수정모드
            const index = pets.findIndex(p => p.petId === editMod.petId);
            pets[index] = petData;

            // 서버로 수정 내용 전송
            try {
                const res = await fetch('/my/pet/update', {
                    method: 'POST', // 혹은 POST
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        petId: editMod.petId, // 기존 애완동물 ID
                        ...petData
                    })
                });
                const result = await res.json();
                if (result.result === 'SUCCESS') {
                    console.log('DB 반영 성공');
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                } else {
                    console.log('DB 반영 실패', result);
                }
            } catch (err) {
                console.error('서버 전송 오류', err);
            }

            // 화면 닫고 초기화
            editMod = null;
            closeAllPetDialogs();
            // 수정모드는 resetAllDialog 호출 안함
            currentStep = 1;
        } else {
            const res = await fetch("/my/pet/registration", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(petData)
            });
            const data = await res.json();
            console.log(data)
            if (data.result === 'SUCCESS') {
                petData.petId = data.petId;
                petData.isPrimary = data.petIsPrimary;
                location.href = '/my?menu=' + getCurrentMenuIndex();
                // 등록모드
                pets.push(petData);
            } else {
                console.log('실패', data);
            }
            // 화면 닫고 초기화
            closeAllPetDialogs();
            resetAllDialog();
            currentStep = 1;
        }
    });


// region ============회원가입 네번째 단계(개인) 애완동물 수정 ================

// 수정버튼 눌렀을 때 모달 띄우면서 정보 불러오기
    const introduce = $petDialogSecond.querySelector(':scope > .introduction > .introduce');
    const petSpecies = $petDialogSecond.querySelector(':scope > .selectedPetType > .petType');
    petList.addEventListener('click', (e) => {
        const modifyButton = e.target.closest('.modify');
        if (!modifyButton) return; // modify 버튼이 아니라면 무시

        const card = modifyButton.closest('.pet-card');
        if (!card) return;

        const petId = parseInt(card.dataset.petId);
        const xhr = new XMLHttpRequest();
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
                    break;
                case 'SUCCESS':
                    const petData = response.pet;
                    console.log(petData)

                    editMod = petData; // 수정 모드
                    console.log(editMod);

                    petNameInput.value = petData.name;
                    petSpecies.value = petData.species;

                    preview.src = petData.imageUrl || '/user/assets/images/defaultPetImage.png';
                    const isDefaultImage =
                        petData.imageUrl === '/user/assets/images/defaultPetImage.png';
                    if (isDefaultImage) {
                        circle.classList.remove('visible'); // 기본이미지면 미리보기 숨김
                    } else {
                        circle.classList.add('visible');    // 실제 업로드 이미지면 보이기
                    }

                    introduce.value = petData.introduction;
                    petYear.value = petData.birthDate.substring(0, 4) + "년";
                    petMonth.value = petData.birthDate.substring(5, 7) + "월";
                    petDate.value = petData.birthDate.substring(8, 10) + "일";

                    const maleInput = $petDialogThird.querySelector(':scope > .genderLabel > .gender-wrapper > .maleLabel > .male');
                    const femaleInput = $petDialogThird.querySelector(':scope > .genderLabel > .gender-wrapper > .femaleLabel > .female');
                    if (petData.gender === "MALE") {
                        maleInput.checked = true;
                    }
                    if (petData.gender === 'FEMALE') {
                        femaleInput.checked = true;
                    }
                    weightInput.value = petData.weight;
                    const slimInput = $petDialogThird.querySelector(':scope > .weightTypeLabel > .weightType-wrapper > .slim > .slim');
                    const normalInput = $petDialogThird.querySelector(':scope > .weightTypeLabel > .weightType-wrapper > .normal > .normal');
                    const chubbyInput = $petDialogThird.querySelector(':scope > .weightTypeLabel > .weightType-wrapper > .chubby > .chubby');

                    if (petData.bodyType === 'SLIM') {
                        slimInput.checked = true;
                    } else if (petData.bodyType === 'NORMAL') {
                        normalInput.checked = true;
                    } else if (petData.bodyType === 'CHUBBY') {
                        chubbyInput.checked = true;
                    }

                    // 버튼 상태 갱신
                    dialogSecondNextButton();
                    dialogThirdCompleteButton();

                    openDialog(1);          // dialog 열기
                    break;
                default:
            }
        };
        const url = `/my/pet/load?petId=${petId}`;
        xhr.open('GET', url);
        xhr.send();
    });


// 삭제눌렀을 때 띄울 모달
    const petDeleteMessage = document.getElementById('petDeleteMessage');
    const deleteMessageTitle = document.createElement('span');
    const deleteMessageText = document.createElement('span');
    const deleteButton = petDeleteMessage.querySelector(':scope > .button-wrapper > .delete');
    const cancelButton = petDeleteMessage.querySelector(':scope > .button-wrapper > .cancel');
    deleteMessageTitle.classList.add('title');
    deleteMessageText.classList.add('text');
    petDeleteMessage.prepend(deleteMessageTitle, deleteMessageText);


// 삭제버튼 눌렀을 때 모달 띄우면서 정보 삭제하기
    petList.addEventListener('click', (e) => {
        const deleteButton = e.target.classList.contains('delete');
        if (!deleteButton) {
            return;
        }
        const petItems = petList.querySelectorAll(':scope > .pet-card');

        let findLi = null;
        petItems.forEach(item => {
            if (item.contains(e.target)) {
                findLi = item;
            }
        });
        if (!findLi) {
            return;
        }
        showDeleteMessage('경고', '정말로 삭제하시겠습니까?', findLi);

    });

    let deleteLi = null;

    function showDeleteMessage(title, text, findLi) {
        deleteLi = findLi;
        petDeleteMessage.classList.add('visible');
        deleteMessageTitle.innerText = title;
        deleteMessageText.innerText = text;
    }

    deleteButton.addEventListener('click', () => {
        if (!deleteLi) return;

        // 삭제할 petId
        const removeId = Number(deleteLi.dataset.petId);

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("petId", removeId);
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
                    showMessage('삭제에 실패하였습니다. 다시 시도해주세요.');
                    break;
                case 'SUCCESS':
                    //  화면에서 제거
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    deleteLi = null;
                    petDeleteMessage.classList.remove('visible');
                    break;
                default:
            }
        };
        xhr.open('POST', '/my/pet/delete');
        xhr.send(formData);
    });
    cancelButton.addEventListener('click', () => {
        deleteLi = null;
        petDeleteMessage.classList.remove('visible');
    });


    const checkMessage = document.getElementById('checkMessage');
    const checkTitle = document.createElement('span');
    const checkText = document.createElement('span');
    const yesButton = checkMessage.querySelector(':scope > .button-wrapper > .yes');
    const noButton = checkMessage.querySelector(':scope > .button-wrapper > .no');

    checkTitle.classList.add('title');
    checkText.classList.add('text');
    checkTitle.innerText = '알림';
    checkMessage.prepend(checkTitle, checkText);

    function showCheckMessage(text) {
        checkMessage.classList.add('visible');
        checkText.innerText = text;
    }


    noButton.addEventListener('click', () => {
        checkMessage.classList.remove('visible');
        selectedPrimaryPetId = null;
    });


    let selectedPrimaryPetId = null;
// 대표동물 지정을 바꾸려고 할때
    petList.addEventListener('click', (e) => {
        const primaryButton = e.target.closest('.primary-input');
        if (!primaryButton) {
            return;
        }
        e.preventDefault(); // 라디오 즉시 체크 방지
        selectedPrimaryPetId = primaryButton.value;

        showCheckMessage('대표동물을 변경하시겠습니까?');
    });


    yesButton.addEventListener('click', () => {
        checkMessage.classList.remove('visible');

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("petId", selectedPrimaryPetId);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 400) {
                console.log('서버오류 발생!')
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'FAILURE':
                    showMessage('알 수 없는 이유로 대표동물 지정에 실패하였습니다. 다시 시도해주세요.');
                    break;
                case 'SUCCESS':
                    location.href = '/my?menu=' + getCurrentMenuIndex();
                    break;
                default:
            }
        };
        xhr.open('PATCH', '/my/pet/primary/change');
        xhr.send(formData);
    });
}


// endregion


// 리뷰 모달
const overlay = document.querySelector('.review-modal-overlay');
const modalClose = document.querySelector('.modal-close');
const stars = document.querySelectorAll('.star-input');
const imageInput = document.querySelector('.review-image-input');
const previewImages = document.querySelector('.preview-images');
const submitReviewBtn = document.querySelector('.submit-review');
const editReviewBtn = document.querySelector('.edit-review-btn');
const saveReviewBtn = document.querySelector('.save-review-btn');
const cancelReviewBtn = document.querySelector('.cancel-review-btn');
const editActionBtns = document.querySelector('.edit-action-btns');
const modalTitle = document.querySelector('.modal-title');
const imageUploadLabel = document.querySelector('.image-upload-label');
const reviewContent = document.querySelector('.review-content');
const imageText = document.querySelector('.image-text');

let selectedRating = 0;
let selectedFiles = [];
let editingReviewId = null;
let currentReviewId = null;
let currentProductId = null;
let originalRating = 0;
let originalContent = '';
let originalImages = [];

function closeModal() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

modalClose?.addEventListener('click', () => {
    closeModal();
    setWriteMode(); // 닫을 때 항상 작성 모드로 초기화
});

overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
        closeModal();
        setWriteMode();
    }
});

// 모드 전환 함수
function setWriteMode() {
    modalTitle.textContent = '리뷰 작성';
    reviewContent.disabled = false;
    imageText.style.display = 'block';
    imageUploadLabel.style.display = 'block';
    submitReviewBtn.style.display = 'inline-block';
    editReviewBtn.style.display = 'none';
    editActionBtns.style.display = 'none';

    stars.forEach(s => s.style.pointerEvents = 'auto');
    // 초기화
    selectedRating = 0;
    selectedFiles = [];
    editingReviewId = null;
    currentReviewId = null;
    stars.forEach(s => s.classList.remove('active'));
    reviewContent.value = '';
    previewImages.innerHTML = '';
}

function setReadMode() {
    modalTitle.textContent = '내 리뷰';
    reviewContent.disabled = true;
    imageText.style.display = originalImages.length > 0 ? 'block' : 'none';
    imageUploadLabel.style.display = 'none';
    submitReviewBtn.style.display = 'none';
    editReviewBtn.style.display = 'inline-block';
    editActionBtns.style.display = 'none';

    stars.forEach(s => s.style.pointerEvents = 'none');
}

function setEditMode() {
    modalTitle.textContent = '리뷰 수정';
    reviewContent.disabled = false;
    imageText.style.display = 'block';
    imageUploadLabel.style.display = 'block';
    submitReviewBtn.style.display = 'none';
    editReviewBtn.style.display = 'none';
    editActionBtns.style.display = 'flex';

    stars.forEach(s => s.style.pointerEvents = 'auto');
}

// ===== 별점 인터랙션 =====
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

// 이미지 첨부
imageInput?.addEventListener('change', () => {
    const existingCount = originalImages.length + selectedFiles.length;
    if (existingCount + imageInput.files.length > 3) {
        showToast('이미지는 3장까지 첨부 가능합니다.');
        imageInput.value = '';
        return;
    }
    Array.from(imageInput.files).forEach(file => {
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

const filterSelect = document.querySelector('.filter');

const currentPeriod = urlParams.get('period');
if (currentPeriod && filterSelect) {
    filterSelect.value = currentPeriod;
    // period 파라미터를 URL에서 제거 (새로고침 시 초기화되도록)
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('period');
    window.history.replaceState(null, '', cleanUrl);
}

filterSelect?.addEventListener('change', () => {
    const period = filterSelect.value;
    const menuIndex = sections.indexOf(paymentDetails);
    // 리뷰 필터 초기화 후 페이지 이동
    document.querySelectorAll('.order-item, .order-item-wrapper, .order-detail, .payment-date')
        .forEach(el => el.style.display = '');
    location.href = `/my?menu=${menuIndex}&period=${period}`;
});

document.querySelector('.my-review-filter')?.addEventListener('click', () => {
    // order-item 필터링 (내가 쓴 리뷰 있는 것만)
    document.querySelectorAll('.order-item').forEach(item => {
        item.style.display = item.querySelector('.my-review-btn') ? '' : 'none';
    });

    // 보이는 order-item이 없는 order-item-wrapper와 그 앞 order-detail 숨기기
    document.querySelectorAll('.order-item-wrapper').forEach(wrapper => {
        const hasVisible = [...wrapper.querySelectorAll('.order-item')]
            .some(item => item.style.display !== 'none');
        wrapper.style.display = hasVisible ? '' : 'none';
        const orderDetail = wrapper.previousElementSibling;
        if (orderDetail?.classList.contains('order-detail')) {
            orderDetail.style.display = hasVisible ? '' : 'none';
        }
    });

    // 보이는 항목 없는 날짜 그룹 숨기기
    document.querySelectorAll('.payment-date').forEach(dateEl => {
        let next = dateEl.nextElementSibling;
        let hasVisible = false;
        while (next && !next.classList.contains('payment-date')) {
            if (next.style.display !== 'none') hasVisible = true;
            next = next.nextElementSibling;
        }
        dateEl.style.display = hasVisible ? '' : 'none';
    });
});

// ===== 리뷰 남기기 버튼 (마이페이지) =====
let currentOrderItemId = null;

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.review-btn');
    if (!btn) return;
    currentProductId = btn.dataset.productId;
    currentOrderItemId = btn.dataset.orderItemId;
    setWriteMode();
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

// ===== 내 리뷰 보기 버튼 (마이페이지) =====
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.my-review-btn');
    if (!btn) return;
    currentReviewId = btn.dataset.reviewId;
    currentProductId = btn.dataset.productId;

    fetch(`/shop/products/${currentProductId}/reviews/${currentReviewId}`)
        .then(res => res.json())
        .then(data => {
            originalRating = data.rating;
            originalContent = data.content;
            originalImages = data.images || [];
            selectedRating = data.rating;
            selectedFiles = [];

            // 별점 세팅
            stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= data.rating));

            // 내용 세팅
            reviewContent.value = data.content;

            // 이미지 세팅
            previewImages.innerHTML = '';
            originalImages.forEach(url => {
                const wrapper = document.createElement('div');
                wrapper.className = 'preview-img-wrapper';
                const img = document.createElement('img');
                img.src = url;
                wrapper.appendChild(img);
                previewImages.appendChild(wrapper);
            });

            setReadMode();
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
});

// ===== 리뷰 수정 버튼 클릭 =====
editReviewBtn?.addEventListener('click', () => {
    setEditMode();
    previewImages.querySelectorAll('.preview-img-wrapper').forEach((wrapper, idx) => {
        if (wrapper.querySelector('.remove-img')) return; // 이미 있으면 skip
        const imageUrl = originalImages[idx];
        const removeBtn = document.createElement('div');
        removeBtn.className = 'remove-img';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', () => {
            originalImages = originalImages.filter(url => url !== imageUrl);
            wrapper.remove();
        });
        wrapper.appendChild(removeBtn);
    });
});

// ===== 수정 취소 =====
cancelReviewBtn?.addEventListener('click', () => {
    selectedRating = originalRating;
    selectedFiles = [];
    reviewContent.value = originalContent;

    previewImages.innerHTML = '';
    originalImages.forEach(url => {
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-img-wrapper';
        const img = document.createElement('img');
        img.src = url;
        wrapper.appendChild(img);
        previewImages.appendChild(wrapper);
    });

    stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= originalRating));
    setReadMode();
});

// ===== 리뷰 등록 =====
submitReviewBtn?.addEventListener('click', () => {
    if (selectedRating === 0) {
        showToast('별점을 선택해주세요.');
        return;
    }
    const content = reviewContent.value;
    if (content.length < 20) {
        showToast('리뷰는 최소 20자 이상 입력해주세요.');
        return;
    }

    const formData = new FormData();
    formData.append('productId', currentProductId);
    formData.append('orderItemId', currentOrderItemId);
    formData.append('rating', selectedRating);
    formData.append('content', content);
    selectedFiles.forEach(file => formData.append('images', file));

    fetch(`/shop/products/${currentProductId}/reviews`, {
        method: 'POST',
        body: formData
    }).then(res => {
        if (res.ok) {
            showToast('리뷰가 등록되었습니다.');
            closeModal();
            setWriteMode();
            location.reload();
        } else {
            showToast('리뷰 등록에 실패했습니다.');
        }
    });
});

// ===== 수정 완료 =====
saveReviewBtn?.addEventListener('click', () => {
    if (selectedRating === 0) {
        showToast('별점을 선택해주세요.');
        return;
    }

    const formData = new FormData();
    formData.append('rating', selectedRating);
    formData.append('content', reviewContent.value);
    selectedFiles.forEach(file => formData.append('images', file));

    fetch(`/shop/products/${currentProductId}/reviews/${currentReviewId}`, {
        method: 'PUT',
        body: formData
    }).then(res => {
        if (res.ok) {
            showToast('리뷰가 수정되었습니다.');
            originalRating = selectedRating;
            originalContent = reviewContent.value;
            selectedFiles = [];
            setReadMode();
            // 이미지에서 X 버튼 제거
            previewImages.querySelectorAll('.remove-img').forEach(btn => btn.remove());
        } else {
            showToast('리뷰 수정에 실패했습니다.');
        }
    });
});

// ===== 상품 상세 페이지용 수정 모달 =====
function openEditModal(reviewId, rating, content) {
    editingReviewId = reviewId;
    currentProductId = getProductIdFromUrl();
    selectedRating = rating;
    stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating));
    reviewContent.value = content;
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

    // 상품 상세에서는 바로 수정 모드
    setEditMode();
    submitReviewBtn.style.display = 'none';
    saveReviewBtn.style.display = 'inline-block';
    cancelReviewBtn.style.display = 'none';
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// 주문상세 모달 열기
document.querySelector('.payment-list').addEventListener('click', async (e) => {
    if (!e.target.closest('.order-info')) return;

    const orderId = e.target.closest('.order-detail').dataset.orderId;
    const res = await fetch(`/my/order/${orderId}`);
    const data = await res.json();

    const overlay = document.querySelector('.order-detail-modal-overlay');
    overlay.querySelector('.price.all .result').textContent = data.totalProductAmount?.toLocaleString() + '원';
    overlay.querySelector('.price.ship-price .result').textContent = data.deliveryFee?.toLocaleString() + '원';
    overlay.querySelector('.price.discount-coupon .result').textContent = '-' + (data.couponDiscount ?? 0).toLocaleString() + '원';
    overlay.querySelector('.price.discount-point .result').textContent = '-' + (data.usedPoint ?? 0).toLocaleString() + '원';
    overlay.querySelector('.price.payment-price .result').textContent = data.finalAmount?.toLocaleString() + '원';

    overlay.style.display = 'flex';
});

// 주문상세 모달 닫기
document.querySelector('.order-detail-modal .modal-close').addEventListener('click', () => {
    document.querySelector('.order-detail-modal-overlay').style.display = 'none';
});