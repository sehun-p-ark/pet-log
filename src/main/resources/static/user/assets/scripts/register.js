const $registerContainer = document.getElementById('registerContainer');

let selectedMemberType = null; // 'personal' | 'business'

// 회원가입 첫번째 단계(공용)
const $registerFirstStep = $registerContainer.querySelector(':scope > .register-first');
const $personalMember = $registerFirstStep.querySelector(':scope > .select-wrapper > .personal-member');
const $businessMember = $registerFirstStep.querySelector(':scope > .select-wrapper > .business-member');
const $FirstStepCancelButton = $registerFirstStep.querySelector(':scope > .button-wrapper > .cancel');

// 회원가입 두번째 단계(개인)
const $registerSecondPersonalStep = $registerContainer.querySelector(':scope > .register-second.personal');

// 회원가입 두번째 단계(사업자)
const $registerSecondBusinessStep = $registerContainer.querySelector(':scope > .register-second.business');

// 회원가입 세번째 단계(개인)
const $registerThirdPersonalStep = $registerContainer.querySelector(':scope > .register-third.personal');

// 회원가입 세번째 단계(사업자)
const $registerThirdBusinessStep = $registerContainer.querySelector(':scope > .register-third.business');

// 회원가입 네번째 단계(개인)
const $registerForthPersonalStep = $registerContainer.querySelector(':scope > .register-forth.personal');

// 회원가입 네번째 단계(사업자)
const $registerForthBusinessStep = $registerContainer.querySelector(':scope > .register-forth.business');

const steps = { // 회원가입 단계
    1: [$registerFirstStep],
    2: [$registerSecondPersonalStep, $registerSecondBusinessStep],
    3: [$registerThirdPersonalStep, $registerThirdBusinessStep],
    4: [$registerForthPersonalStep, $registerForthBusinessStep]
};

let registerStep = null;

// 회원가입 단계 이동 함수
function goToStep(stepNumber) {
    if (stepNumber > 1 && !selectedMemberType) {
        console.warn('회원 유형을 선택하지 않고 해당 단계에 도달하였으므로 회원 유형 선택 단계로 돌아갑니다.');
        stepNumber = 1;
    }

    registerStep = stepNumber;
    // 모든 단계 숨기기
    Object.values(steps).flat().forEach(step => {
        step.classList.add('hidden');
    });

    // 현재 단계에 따른 이동
    if (stepNumber === 1) {
        $registerFirstStep.classList.remove('hidden');
        return;
    }
    if (stepNumber === 2) {
        if (selectedMemberType === 'PERSONAL') {
            $registerSecondPersonalStep.classList.remove('hidden');
            $registerSecondPersonalStep.scrollTop = 0;
        } else if (selectedMemberType === 'BUSINESS') {
            $registerSecondBusinessStep.classList.remove('hidden');
            $registerSecondBusinessStep.scrollTop = 0;
        }
        return;
    }

    if (stepNumber === 3) {
        if (selectedMemberType === 'PERSONAL') {
            $registerThirdPersonalStep.classList.remove('hidden');
            $registerThirdPersonalStep.scrollTop = 0;
        } else if (selectedMemberType === 'BUSINESS') {
            $registerThirdBusinessStep.classList.remove('hidden');
            $registerThirdBusinessStep.scrollTop = 0;
        }
    }

    if (stepNumber === 4) {
        if (selectedMemberType === 'PERSONAL') {
            $registerForthPersonalStep.classList.remove('hidden');
            $registerForthPersonalStep.scrollTop = 0;
        } else if (selectedMemberType === 'BUSINESS') {
            $registerForthBusinessStep.classList.remove('hidden');
            $registerForthBusinessStep.scrollTop = 0;
        }
    }
}

// 회원가입 필수 입력부분 미입력시 알림창 (로그인이랑 중복이긴한데 common.js안만들거라 그냥 중복시키기)
const registerMessage = document.getElementById('register-message');
const $title = document.createElement('span');
const $text = document.createElement('span');
const warningButton = registerMessage.querySelector(':scope > .button');
$title.classList.add('title');
$text.classList.add('text');
$title.innerText = "알림";
registerMessage.prepend($title, $text);
let onMessageClose = null;
function showMessage(text, callback = null) {
    registerMessage.classList.add('visible');
    $text.innerText = text;
    onMessageClose = callback;
}

warningButton.addEventListener('click', () => {
    registerMessage.classList.remove('visible');
    if (onMessageClose) {
        onMessageClose();
        onMessageClose = null;
    }
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




/*============회원가입 첫번째 단계================*/

// 회원가입 첫번째 단계에서 개인회원을 눌렀을 때
$personalMember.addEventListener('click', () => {
    selectedMemberType = 'PERSONAL';
    goToStep(2);
});

// 회원가입 첫번째 단계에서 사업자회원을 눌렀을 때
$businessMember.addEventListener('click', () => {
    selectedMemberType = 'BUSINESS';
    goToStep(2);
});

// 회원가입 첫번째 단계에서 취소 버튼을 눌렀을 때
$FirstStepCancelButton.addEventListener('click', () => {
    location.href = '/user/login';
});




/*============회원가입 두번째 단계(공용)================*/

// 회원가입 두번째 단계(공용)
const $registerSecondSteps = $registerContainer.querySelectorAll(':scope > .register-second');

// 회원가입 두번째 단계 취소버튼(공용)
$registerSecondSteps.forEach(step => {
    const cancelButton = step.querySelector(':scope > .button-wrapper > .cancel');

    cancelButton.addEventListener('click', () => {
        location.href = '/user/login';
    });
});

// 회원가입 두번째 단계 이전버튼(공용)
$registerSecondSteps.forEach(step => {
    const previousButton = step.querySelector(':scope > .button-wrapper > .previous');

    previousButton.addEventListener('click', () => {
        goToStep(1);
    });
});


// 회원가입 두번째 다음버튼을 누르는데 약관동의(필수) 체크여부 확인 후 이동
$registerSecondSteps.forEach(step => {
    const nextButton = step.querySelector(':scope > .button-wrapper > .next');
    const requiredAgreements = step.querySelectorAll(':scope > .agreement-wrapper > .agreement > .agreement-check.required > .checkbox');

    nextButton.addEventListener('click', (e) => {
        e.preventDefault()
        const isAllChecked = [...requiredAgreements].every(checkbox => checkbox.checked);
        if (!isAllChecked) {
            showMessage("필수 약관에 모두 동의하여야 합니다.");
            return;
        }
        goToStep(3);
    });
});



/*============회원가입 세번째 단계(공용)================*/

// 회원가입 세번째 단계(공용)
const $registerThirdSteps = $registerContainer.querySelectorAll(':scope > .register-third');
let isEmailVerified = false;


// 주소검색 창 관련
const addressWrapper = document.getElementById('address-wrapper');
const addressContainer = document.getElementById('address-container');
const addressCancelButton = addressWrapper.querySelector(':scope > .button');


// 회원가입 세번째 단계에서 주소 검색 버튼을 눌렀을 때(공용)
$registerThirdSteps.forEach(step => {
    const addressFindButton = step.querySelector(':scope > .addressLabel > .button');
    const postalInput = step.querySelector(':scope > .addressLabel > .postalNumber');
    const primaryAddressInput = step.querySelector(':scope > .primaryAddressLabel > .primaryAddress');
    const detailAddressInput = step.querySelector(':scope > .detailAddressLabel > .detailAddress');

    addressFindButton.addEventListener('click', () => {
        addressWrapper.classList.add('visible');
        addressContainer.innerHTML = '';
        new daum.Postcode({
            oncomplete: function(data) {
                // 우편번호
                postalInput.value = data.zonecode;
                primaryAddressInput.value = data.roadAddress || data.jibunAddress;
                addressWrapper.classList.remove('visible');
                detailAddressInput.focus();
            }
        }).embed(addressContainer);
    });
});

addressCancelButton.addEventListener('click', () => {
    addressWrapper.classList.remove('visible');
});


// 회원가입 세번째 단계에서 취소버튼을 눌렀을 때(공용)
$registerThirdSteps.forEach(step => {
    const cancelButton = step.querySelector(':scope > .button-wrapper > .cancel');

    cancelButton.addEventListener('click', () => {
        location.href = '/user/login';
    });
});

// 회원가입 세번째 단계에서 이전버튼을 눌렀을 때(공용)
$registerThirdSteps.forEach(step => {
    const previousButton = step.querySelector(':scope > .button-wrapper > .previous');

    previousButton.addEventListener('click', () => {
        goToStep(2);
    });
});

/*============회원가입 세번째 단계(개인)================*/

// 세번째 단계에서 다음버튼을 눌렀을 때 정보 미입력 시 경고모달 띄우기
const ThirdPersonalNextButton = $registerThirdPersonalStep.querySelector(':scope > .button-wrapper > .next');
const ThirdPersonalInputs = $registerThirdPersonalStep.querySelectorAll('.input');
const ThirdPersonalLoginIdInput = $registerThirdPersonalStep.querySelector('.id.input');
const ThirdPersonalNameInput = $registerThirdPersonalStep.querySelector('.name.input');
const ThirdPersonalPasswordInput = $registerThirdPersonalStep.querySelector('.password');
const ThirdPersonalPasswordCheckInput = $registerThirdPersonalStep.querySelector('.passwordCheck');
const ThirdPersonalPhoneFirstInput = $registerThirdPersonalStep.querySelector(':scope > .contactNumberLabel > .phone-wrapper > .number-wrapper > .firstNumber');
const ThirdPersonalPhoneMiddleInput = $registerThirdPersonalStep.querySelector(':scope > .contactNumberLabel > .phone-wrapper > .number-wrapper > .first.input');
const ThirdPersonalPhoneLastInput = $registerThirdPersonalStep.querySelector(':scope > .contactNumberLabel > .phone-wrapper > .number-wrapper > .second.input');

ThirdPersonalNextButton.addEventListener('click', (e) => {
    e.preventDefault()
    const findEmptyInput = [...ThirdPersonalInputs].find(input => {
        return !input.disabled && !input.classList.contains('detailAddress') && input.value.trim() === '';
    });

    if (findEmptyInput) {
        showMessage('정보를 모두 입력 후 다음 단계로 넘어갈 수 있습니다.');
        findEmptyInput.focus();
        findEmptyInput.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
        return;
    }
    if (!isEmailVerified) {
        showMessage('이메일 인증을 완료해주세요.');
        return;
    }
    if (ThirdPersonalLoginIdInput.value.length < 4 || ThirdPersonalLoginIdInput.value.length > 20) {
        showMessage('아이디는 4~20자까지 가능합니다.');
        return;
    }
    if (ThirdPersonalNameInput.value.length < 2 || ThirdPersonalNameInput.value.length > 20) {
        showMessage('이름은 2~20자까지 가능합니다.');
        return;
    }
    if (ThirdPersonalPasswordInput.value.length < 6 || ThirdPersonalPasswordInput.value.length > 50) {
        showMessage('비밀번호는 6~50자까지 가능합니다.');
        return;
    }
    if (ThirdPersonalPasswordInput.value !== ThirdPersonalPasswordCheckInput.value) {
        showMessage('비밀번호가 서로 일치하지 않습니다. 다시 확인해주세요.');
        return;
    }
    if (ThirdPersonalPhoneFirstInput.value === '' || ThirdPersonalPhoneMiddleInput.value === '' || ThirdPersonalPhoneLastInput.value === '') {
        showMessage('전화번호를 입력해주세요.');
        return;
    }
    if (ThirdPersonalPhoneFirstInput.value !== '010') {
        showMessage('전화번호는 010으로 시작하는 번호만 입력 가능합니다.');
        return;
    }
    if (!/^\d{4}$/.test(ThirdPersonalPhoneMiddleInput.value) ||
        !/^\d{4}$/.test(ThirdPersonalPhoneLastInput.value)) {
        showMessage('전화번호를 다시 확인해주세요.');
        return;
    }
    const checkVisible = $registerThirdPersonalStep.querySelector('.text.visible');
    if (checkVisible) {
        showMessage('정보를 다시 확인해 주세요.');
        return;
    }
    goToStep(4);
});

/*============회원가입 세번째 단계(사업자)================*/
const ThirdBusinessNextButton = $registerThirdBusinessStep.querySelector(':scope > .button-wrapper > .next');
const ThirdBusinessInputs = $registerThirdBusinessStep.querySelectorAll('.input');
const ThirdBusinessEmailInput = $registerThirdBusinessStep.querySelector('.email.input');
const ThirdBusinessIdInput = $registerThirdBusinessStep.querySelector('.id.input');
const ThirdBusinessCompanyName = $registerThirdBusinessStep.querySelector('.companyName');
const ThirdBusinessRepresentativeName = $registerThirdBusinessStep.querySelector('.representativeName');
const ThirdBusinessPhoneFirstInput = $registerThirdBusinessStep.querySelector('.firstNumber');
const ThirdBusinessPhoneMiddleInput = $registerThirdBusinessStep.querySelector('.first.input');
const ThirdBusinessPhoneLastInput = $registerThirdBusinessStep.querySelector('.second.input');
const ThirdBusinessBusinessNumber = $registerThirdBusinessStep.querySelector('.businessNumber');

const ThirdBusinessPasswordInput = $registerThirdBusinessStep.querySelector('.password');
const ThirdBusinessPasswordCheckInput = $registerThirdBusinessStep.querySelector('.passwordCheck');
ThirdBusinessNextButton.addEventListener('click', (e) => {
    e.preventDefault();
    const findEmptyInput = [...ThirdBusinessInputs].find(input => {
        return !input.disabled && !input.classList.contains('detailAddress') && input.value.trim() === '';
    });

    if (findEmptyInput) {
        showMessage('정보를 모두 입력 후 다음 단계로 넘어갈 수 있습니다.');
        findEmptyInput.focus();
        findEmptyInput.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
        return;
    }
    if (ThirdBusinessCompanyName.value.length > 150) {
        showMessage('기업명은 1~150자까지 가능합니다.');
        return;
    }
    if (ThirdBusinessRepresentativeName.value.length < 2 ||
        ThirdBusinessRepresentativeName.value.length > 20) {
        showMessage('대표자명은 2~20자까지 가능합니다.')
        return;
    }
    if (ThirdBusinessPhoneFirstInput.value === '' || ThirdBusinessPhoneMiddleInput.value === '' || ThirdBusinessPhoneLastInput.value === '') {
        showMessage('전화번호를 입력해주세요.');
        return;
    }
    if (ThirdBusinessPhoneFirstInput.value !== '010') {
        showMessage('전화번호는 010으로 시작하는 번호만 입력 가능합니다.');
        return;
    }
    if (!/^\d{4}$/.test(ThirdBusinessPhoneMiddleInput.value) ||
        !/^\d{4}$/.test(ThirdBusinessPhoneLastInput.value)) {
        showMessage('전화번호를 다시 확인해주세요.');
        return;
    }
    if (ThirdBusinessBusinessNumber.value === '') {
        showMessage('사업자등록번호를 입력해주세요.');
        return;
    }
    if (!/^\d{10}$/.test(ThirdBusinessBusinessNumber.value)) {
        showMessage('사업자등록번호는 숫자 10자리로 이루어져야 합니다.');
        return;
    }
    if (ThirdBusinessEmailInput.value === '') {
        showMessage('이메일을 입력해주세요.');
        return;
    }
    if (!isEmailVerified) {
        showMessage('이메일 인증을 완료해주세요.');
        return;
    }
    if (ThirdBusinessIdInput.value === '') {
        showMessage('아이디를 입력해주세요.');
        return;
    }
    if (ThirdBusinessIdInput.value.length < 4 ||
        ThirdBusinessIdInput.value.length > 20) {
        showMessage('아이디는 4~20자까지 입력할 수 있습니다.');
        return;
    }
    if (ThirdBusinessPasswordInput.value !== ThirdBusinessPasswordCheckInput.value) {
        showMessage('비밀번호가 서로 일치하지 않습니다. 다시 확인해주세요.');
        return;
    }
    const checkVisible = $registerThirdBusinessStep.querySelector('.text.visible');
    if (checkVisible) {
        showMessage('정보를 다시 확인해 주세요.');
        return;
    }
    goToStep(4);
});







/*============회원가입 네번째 단계(공용)================*/
const $registerForthSteps = $registerContainer.querySelectorAll(':scope > .register-forth');

const $registerForthBusinessStepAddressFindButton = $registerForthBusinessStep.querySelector(':scope > .addressLabel > .button');

const postalInput = $registerForthBusinessStep.querySelector(':scope > .addressLabel > .postalNumber');
const primaryAddressInput = $registerForthBusinessStep.querySelector(':scope > .primaryAddressLabel > .primaryAddress');
const detailAddressInput = $registerForthBusinessStep.querySelector(':scope > .detailAddressLabel > .detailAddress');

$registerForthBusinessStepAddressFindButton.addEventListener('click', () => {
    addressWrapper.classList.add('visible');
    addressContainer.innerHTML = '';
    new daum.Postcode({
        oncomplete: function(data) {
            // 우편번호
            postalInput.value = data.zonecode;
            primaryAddressInput.value = data.roadAddress || data.jibunAddress;
            addressWrapper.classList.remove('visible');
            detailAddressInput.focus();
        }
    }).embed(addressContainer);
});



// 회원가입 네번째 단계에서 취소버튼을 눌렀을 때
$registerForthSteps.forEach(step => {
    const cancelButton = step.querySelector(':scope > .button-wrapper > .cancel');

    cancelButton.addEventListener('click', () => {
        location.href = '/user/login';
    });
});

// 회원가입 네번째 단계에서 이전버튼을 눌렀을 때
$registerForthSteps.forEach(step => {
    const previousButton = step.querySelector(':scope > .button-wrapper > .previous');

    previousButton.addEventListener('click', () => {
        goToStep(3);
    });
});

/*
//store db 위도 경도 변환 하기 위해
const completeButton = $registerForthBusinessStep.querySelector(':scope > .button-wrapper > .complete');

completeButton.addEventListener('click', async () => {
    // 입력값 확인
    const userName = $registerThirdBusinessStep.querySelector('.userName').value;
    const email = $registerThirdBusinessStep.querySelector('.email').value;
    const password = $registerThirdBusinessStep.querySelector('.password').value;

    const storeName = $registerForthBusinessStep.querySelector('.storeName').value;
    const postalCode = $registerForthBusinessStep.querySelector('.postalNumber').value;
    const addressPrimary = $registerForthBusinessStep.querySelector('.primaryAddress').value;
    const addressSecondary = $registerForthBusinessStep.querySelector('.detailAddress').value;
    const category = $registerForthBusinessStep.querySelector('.category').value;
    const storePhone = $registerForthBusinessStep.querySelector('.storePhone').value;

    // 필수 입력 체크
    if (!userName || !email || !password || !storeName || !addressPrimary || !category) {
        showMessage("필수 정보를 모두 입력해주세요.");
        return;
    }

    const payload = {
        userName, email, password,
        storeName, postalCode, addressPrimary, addressSecondary,
        category, storePhone
    };

    try {
        const res = await fetch('/api/register/business', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage(err.message || '회원가입 실패');
            return;
        }

        // 성공 시 로그인 페이지 이동
        location.href = '/user/login';
    } catch (e) {
        showMessage('서버와 연결되지 않았습니다.');
        console.error(e);
    }
});

*/


// region 회원가입 네번쨰 단계(개인+애완동물 로직)

/*============회원가입 네번째 단계(개인)================*/

const $petRegistrationButton = $registerForthPersonalStep.querySelector(':scope > .petRegistration');
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
        if ((year % 4 === 0 && year % 100 !== 0 )|| year % 400 === 0) {
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
    gender.addEventListener('change',  dialogThirdCompleteButton);
});
weightInput.addEventListener('input',  dialogThirdCompleteButton);

$petDialogThird.querySelectorAll('input[name="weightType"]').forEach(type => {
    type.addEventListener('change',  dialogThirdCompleteButton);
})

// 애완동물 DialogThird에서 이전버튼을 눌렀을 때
const $petDialogThirdPreviousButton = $petDialogThird.querySelector(':scope > .previous');
$petDialogThirdPreviousButton.addEventListener('click', () => {
    currentStep = 2;
    openDialog(2);
});

const pets = [];
const petList = $registerForthPersonalStep.querySelector(':scope > .pet-list');

// 새 petId 계산 함수
function getNextPetId() {
    const usedIds = pets.map(p => p.petId);
    let id = 1;
    while (usedIds.includes(id)) {
        id++;
    }
    return id;
}

// 애완동물 DialogThird에서 작성완료 버튼을 눌렀을 때
$petDialogThirdCompleteButton.addEventListener('click', () => {
    const petNameInput = $petDialogFirst.querySelector(':scope > .petName-wrapper > .petName');
    const genderInput = $petDialogThird.querySelector('input[name="gender"]:checked');
    const year = petYear.value || petYear.placeholder;
    const weight = $petDialogThird.querySelector(':scope > .petWeightLabel > .weight-wrapper > .weight');
    const weightTypeInput = $petDialogThird.querySelector('input[name="weightType"]:checked');
    const introduction = $petDialogSecond.querySelector(':scope > .introduction > .introduce');
    const age = currentYear - parseInt(year);

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

    const petData = {
        petId: editMod ? editMod.petId : getNextPetId(),
        selectType: selectType,
        name: petNameInput.value,
        petImageFile: fileInput.files.length > 0 ? fileInput.files[0] : null, // File 객체
        petImagePreview: fileInput.files.length > 0     // 화면 미리보기용(base64)만 사용
            ? preview.src
            : editMod
                ? editMod.petImagePreview
                : '/user/assets/images/defaultPetImage.png',
        species: species,
        birthYear: petYear.value || petYear.placeholder,
        birthMonth: petMonth.value || petMonth.placeholder,
        birthDate: petDate.value || petDate.placeholder,
        age: `${age}살`,
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

        const li = petList.querySelector(`li[data-pet-id="${editMod.petId}"]`);
        if (li) {
            li.querySelector('.petName').firstChild.textContent = petData.name;
            li.querySelector('.petName .gender').src = petData.gender === 'MALE'
                ? '/user/assets/images/male.png'
                : '/user/assets/images/female.png';
            li.querySelector('.species').textContent = `품종 : ${petData.species}`;
            li.querySelector('.birth').textContent = `나이 : ${petData.age}`;
            li.querySelector('.weight').textContent = `몸무게 : ${petData.weight}kg`;
            li.querySelector('.introduction').textContent = `소개 : ${petData.introduction}`;
            li.querySelector('.petImage').src = petData.petImagePreview;
        }

        // 화면 닫고 초기화
        editMod = null;
        closeAllPetDialogs();
        // 수정모드는 resetAllDialog 호출 안함
        currentStep = 1;
    } else {
        // 등록모드
        pets.push(petData);
        addPetToList(petData);

        // 화면 닫고 초기화
        closeAllPetDialogs();
        resetAllDialog();
        currentStep = 1;
    }
});

function addPetToList(petData) {
    const li = document.createElement('li');
    li.classList.add('pet');
    li.dataset.petId = petData.petId;
    const genderIcon = petData.gender === 'MALE' ? '/user/assets/images/male.png' : '/user/assets/images/female.png';
    const petImage = petData.petImagePreview;
    li.innerHTML = `
    <div class="petInformation">
        <div class="side-wrapper">
            <div class="image-wrapper">
                <img class="petImage" src="${petImage}" alt="">
            </div>
        </div>
        <div class="detail">
            <span class="petName">
                ${petData.name}
                <img class="gender" src="${genderIcon}" alt="">
            </span>
            <span class="species">종류 : ${petData.species}</span>
            <span class="birth">나이 : ${petData.age}</span>
            <span class="weight">몸무게 : ${petData.weight}kg</span>
            <span class="introduction">한 줄 소개 : ${petData.introduction}</span>
        </div>
    </div>
    <div class="bottom-wrapper">
        <label class="remember">
            <input hidden class="checkbox" type="radio" name="primary" value="${petData.petId}">
            <span class="text"></span>
        </label>
        <span class="-flex-stretch"></span>
        <button class="modify" type="button">수정</button>
        <button class="delete" type="button">삭제</button>
    </div>`;
    if (pets.length === 1) {
        li.querySelector('input[name="primary"]').checked = true;
    }
    petList.append(li);
}



// region ============회원가입 네번째 단계(개인) 애완동물 수정 ================

// 수정버튼 눌렀을 때 모달 띄우면서 정보 불러오기
petList.addEventListener('click', (e) => {
    const modifyButton = e.target.classList.contains('modify');
    if (!modifyButton) {
        return;
    }
    const petItems = petList.querySelectorAll(':scope > .pet');

    let findLi = null;
    petItems.forEach(item => {
        if (item.contains(e.target)) {
            findLi = item;
        }
    });
    if (!findLi) {
        return;
    }
    const petId = parseInt(findLi.dataset.petId);
    const petData = pets.find(p => p.petId === petId);
    if (!petData) {
        return;
    }
    editMod = petData; // 수정모드 Yes
    loadPetDialog(petData);
    openDialog(1);
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
    const petItems = petList.querySelectorAll(':scope > .pet');

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

    // pets 배열에서 제거
    const removeIndex = pets.findIndex(p => p.petId === removeId);
    if (removeIndex !== -1) {
        pets.splice(removeIndex, 1);
    }

    //  화면에서 제거
    deleteLi.remove();
    deleteLi = null;
    petDeleteMessage.classList.remove('visible');

    // 남아있는 li 기준으로 다시 번호 매기기
    const petItems = petList.querySelectorAll(':scope > li.pet');
    petItems.forEach((li, index) => {
        const newId = index + 1;

        // li의 data-pet-id 재설정
        li.dataset.petId = newId;
        // radio value 재설정
        const radio = li.querySelector('input[name="primary"]');
        if (radio) {
            radio.value = newId;
        }
        // pets 배열도 같은 순서로 petId 재설정
        if (pets[index]) {
            pets[index].petId = newId;
        }
    });
    // 대표동물 처리
    const checked = petList.querySelector('input[name="primary"]:checked');
    if (!checked && petItems.length > 0) {
        petItems[0]
            .querySelector('input[name="primary"]')
            .checked = true;
    }
});

cancelButton.addEventListener('click', () => {
    deleteLi = null;
    petDeleteMessage.classList.remove('visible');
});

function loadPetDialog(petData) {
    // 첫번째 dialog
    const dogInput = $petDialogFirst.querySelector('.dog input[type="radio"]');
    const catInput = $petDialogFirst.querySelector('.cat input[type="radio"]');
    const anotherInput = $petDialogFirst.querySelector('.another input[type="radio"]');

    selectType = petData.selectType;
    if (selectType === 'dog') {
        dogInput.checked = true;
    }
    if (selectType === 'cat') {
        catInput.checked = true;
    }
    if (selectType === 'another') {
        anotherInput.checked = true;
        $petDialogFirst.querySelector(':scope > .anotherType-wrapper').classList.add('visible');
    }
    petNameInput.value = petData.name;
    dialogFirstNextButton(); // 버튼 상태 갱신

    // 두번째 dialog
    const petSpecies = $petDialogSecond.querySelector(':scope > .selectedPetType > .petType');
    const introduce = $petDialogSecond.querySelector(':scope > .introduction > .introduce');
    const isDefaultImage =
        petData.petImagePreview === '/user/assets/images/defaultPetImage.png';
    preview.src = petData.petImagePreview;
    if (isDefaultImage) {
        circle.classList.remove('visible'); // 기본이미지면 미리보기 숨김
    } else {
        circle.classList.add('visible');    // 실제 업로드 이미지면 보이기
    }
    petSpecies.value = petData.species;
    petYear.value = petData.birthYear;
    petMonth.value = petData.birthMonth;
    petDate.value = petData.birthDate;
    introduce.value = petData.introduction;

    // 세번째 dialog
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
    }
    else if (petData.bodyType === 'NORMAL') {
        normalInput.checked = true;
    }
    else if (petData.bodyType === 'CHUBBY') {
        chubbyInput.checked = true;
    }

    // 버튼 상태 갱신
    dialogSecondNextButton();
    dialogThirdCompleteButton();
}

// endregion


// endregion



/*============회원가입 네번째 단계(사업자)================*/













$registerContainer.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (registerStep !== 4) {
        e.preventDefault();
        return;
    }
    let phone;
    let store;
    let storePhone;
    if (selectedMemberType === 'PERSONAL') {
        phone = $registerThirdPersonalStep.querySelector('.firstNumber').value + $registerThirdPersonalStep.querySelector('.contactNumber.first').value + $registerThirdPersonalStep.querySelector('.contactNumber.second').value;
    }
    if (selectedMemberType === 'BUSINESS') {
        phone = $registerThirdBusinessStep.querySelector('.firstNumber').value + $registerThirdBusinessStep.querySelector('.contactNumber.first').value + $registerThirdBusinessStep.querySelector('.contactNumber.second').value;

        const telFirst = $registerForthBusinessStep.querySelector('.telFirst').value.trim();
        const telMiddle = $registerForthBusinessStep.querySelector('.telMiddle').value.trim();
        const telLast = $registerForthBusinessStep.querySelector('.telLast').value.trim();
        storePhone = telFirst + telMiddle + telLast;

        const storeName = $registerForthBusinessStep.querySelector('.storeName.input').value.trim();
        const postalNumber = $registerForthBusinessStep.querySelector('.postalNumber').value.trim();
        const primaryAddress = $registerForthBusinessStep.querySelector('.primaryAddress').value.trim();
        const detailAddress = $registerForthBusinessStep.querySelector('.detailAddress');

        const hasAnyInput = storeName || telFirst || telMiddle || telLast || postalNumber || primaryAddress;

        if (hasAnyInput) {
            if (storeName === '') {
                showMessage('가게명을 입력해주세요.');
                return;
            }
            if (storeName.length > 100) {
                showMessage('가게명은 최대 100자까지 가능합니다.');
                return;
            }
            if (telFirst === '' || telMiddle === '' || telLast === '') {
                showMessage('가게 전화번호를 입력해주세요.');
                return;
            }
            const validPhone = /^(02-\d{3,4}-\d{4}|0[3-9]\d-\d{3,4}-\d{4}|010-\d{4}-\d{4})$/;
            if (!validPhone.test(`${telFirst}-${telMiddle}-${telLast}`)) {
                showMessage('올바른 가게 전화번호를 입력해주세요.');
                return;
            }
            if (postalNumber === '' || primaryAddress === '') {
                showMessage('가게 주소를 입력해주세요.');
                return;
            }
            if (postalNumber.length !== 5) {
                showMessage('우편번호를 다시 확인해주세요.');
                return;
            }
            if (primaryAddress.length > 150) {
                showMessage('기본주소는 최대 150자까지 가능합니다.');
                return;
            }
            if (detailAddress.value.length > 100) {
                showMessage('상세주소는 최대 100자까지 가능합니다.');
                return;
            }
            if ($registerForthBusinessStep.querySelector('.category').value === '') {
                showMessage('카테고리를 선택해주세요.');
                return;
            }

            store = {
                storeName: storeName,
                storePhone: storePhone,
                category: $registerForthBusinessStep.querySelector('.category').value,
                postalCode: postalNumber,
                addressPrimary: primaryAddress,
                addressSecondary: $registerForthBusinessStep.querySelector('.detailAddress').value || null
            };
        } else {
            store = null;
        }
    }

    const checkedRadio = petList.querySelector('input[name="primary"]:checked');
    const checkedId = checkedRadio ? Number(checkedRadio.value) : null;

    const petsDtoArray = pets.map(pet => {
        const year = Number(pet.birthYear.toString().replace(/\D/g,''));
        const month = Number(pet.birthMonth.toString().replace(/\D/g,''));
        const day = Number(pet.birthDate.toString().replace(/\D/g,''));
        pet.isPrimary = (pet.petId === checkedId);

        if (!year || !month || !day) {
            console.error('잘못된 생년월일', pet.birthYear, pet.birthMonth, pet.birthDate);
        }

        const birthDate = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

        return {
            name: pet.name,
            species: pet.species,
            birthDate: birthDate,
            gender: pet.gender,
            introduction: pet.introduction,
            weight: pet.weight,
            bodyType: pet.bodyType,
            // ↓ imageUrl 제거 (서버에서 파일 저장 후 경로 세팅)
            isPrimary: pet.isPrimary
        };
    });

    const form = selectedMemberType === 'PERSONAL' ? $registerThirdPersonalStep : $registerThirdBusinessStep;

    const payload = {
        email: form.querySelector('.email').value,
        loginId: form.querySelector('.id').value,
        password: form.querySelector('.password').value,
        phone: phone,
        userType: selectedMemberType,
        name: selectedMemberType === 'PERSONAL' ? form.querySelector('.name').value : null,
        nickname: selectedMemberType === 'PERSONAL' ? form.querySelector('.nickname').value : null,
        companyName: selectedMemberType === 'BUSINESS' ? form.querySelector('.companyName').value : null,
        representativeName: selectedMemberType === 'BUSINESS' ? form.querySelector('.representativeName').value : null,
        businessNumber: selectedMemberType === 'BUSINESS' ? form.querySelector('.businessNumber').value : null,
        address: {
            addressType: selectedMemberType === 'PERSONAL' ? 'MAP' : 'COMPANY',
            postalCode: form.querySelector('.postalNumber').value,
            addressPrimary: form.querySelector('.primaryAddress').value,
            addressSecondary: form.querySelector('.detailAddress').value || null
        },
        store: store,
        termsIds: Array.from(document.querySelectorAll('.agreement-check > .checkbox'))
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.dataset.termsId)),
        pets: selectedMemberType === 'PERSONAL' ? petsDtoArray : null
    };

    // ↓ FormData로 변경
    const formData = new FormData();

    // payload 전체를 JSON 문자열로 한 번에 담기
    // → 서버에서 @RequestPart("data") RegisterDto dto 로 받음
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    // 애완동물 이미지 파일 순서대로 추가
    // 이미지가 없는 인덱스는 빈 Blob으로 자리 채움 (서버에서 기본이미지 처리)
    if (selectedMemberType === 'PERSONAL') {
        pets.forEach((pet, index) => {
            if (pet.petImageFile) {
                formData.append('petImages', pet.petImageFile);
            } else {
                // 빈 Blob으로 자리 채워서 인덱스 순서 맞춤
                formData.append('petImages', new Blob([]), 'empty');
            }
        });
    }

    try {
        const res = await fetch('/user/', {
            method: 'POST',
            // Content-Type 헤더 직접 설정 절대 금지 → 브라우저가 boundary 자동 설정
            body: formData
        });

        const data = await res.json();
        if (data.result === 'SUCCESS') {
            e.target.querySelector('button[type="submit"]').setAttribute('disabled', '');
            showMessage('가입을 환영합니다.', () => {
                location.href = '/user/login';
            });
        } else {
            showMessage('회원가입에 실패하였습니다. 정보를 다시 확인해주세요.');
            console.error('회원가입 실패', data);
        }
    } catch (err) {
        console.error('서버 통신 실패', err);
    }
});

const loading = document.getElementById('loading');


$registerThirdSteps.forEach(step => {
    // region 이메일 검증
    const sendButton = step.querySelector(':scope > .emailSendLabel > .button');
    const emailInput = step.querySelector(':scope > .emailSendLabel > .email');
    const emailCodeInput = step.querySelector(':scope > .emailVerifyLabel > .verifyNumber-wrapper > .emailVerifyNumber');
    const verifyButton = step.querySelector(':scope > .emailVerifyLabel > .button');
    const timerText = step.querySelector(':scope > .emailVerifyLabel> .verifyNumber-wrapper > .countTime');

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();

        if (emailInput.value === '') {
            showMessage('이메일을 입력해주세요.');
            emailInput.focus();
            return;
        }
        loading.classList.add('visible');

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', emailInput.value);
        formData.append('type', 'REGISTER');
        xhr.onreadystatechange = () => {
            if(xhr.readyState !== XMLHttpRequest.DONE){
                return;
            }
            loading.classList.remove('visible');
            if(xhr.status < 200 || xhr.status >= 400){

                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'FAILURE':
                    showMessage('이메일 형식이 맞지 않거나 올바른 이메일이 아닙니다. 다시 입력해주세요.');
                    emailInput.focus();
                    emailInput.select();
                    break;
                case 'FAILURE_DUPLICATE':
                    showMessage('이미 사용중인 이메일입니다. 다시 입력해주세요.');
                    emailInput.focus();
                    emailInput.select();
                    break;
                case 'SUCCESS':
                    showMessage('작성하신 이메일로 인증번호를 발송하였습니다. \n 인증번호는 5분간만 유효하니 유의해주세요.');
                    emailInput.setAttribute('disabled', '');
                    sendButton.setAttribute('disabled', '');
                    emailCodeInput.removeAttribute('disabled');
                    verifyButton.removeAttribute('disabled');
                    timerText.classList.add('visible');
                    startTimer(300, timerText); // 5분
                    break;
                default:
                    showMessage('알 수 없는 이유로 실패하였습니다. 다시 시도해주세요.');

            }

        };
        xhr.open('POST', '/user/email');
        xhr.send(formData);
    });




    verifyButton.addEventListener('click', (e) => {
        e.preventDefault();

        if (emailCodeInput.value === '') {
            showMessage('인증번호를 입력해주세요.');
            return;
        }

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', emailInput.value);
        formData.append('code', emailCodeInput.value);
        formData.append('type', 'REGISTER');
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
                    showMessage('인증번호가 일치하지 않습니다.');
                    break;
                case 'FAILURE_EXPIRED':
                    stopTimer();
                    showMessage('인증번호가 만료되었습니다. 다시 시도해 주세요.');
                    emailInput.removeAttribute('disabled');
                    sendButton.removeAttribute('disabled');
                    emailCodeInput.setAttribute('disabled', '');
                    verifyButton.setAttribute('disabled', '');
                    timerText.classList.remove('visible');
                    break;
                case 'SUCCESS':
                    stopTimer();
                    emailCodeInput.setAttribute('disabled', '');
                    verifyButton.setAttribute('disabled', '');
                    timerText.classList.remove('visible');
                    isEmailVerified = true;
                    showMessage('인증을 완료하였습니다.');
                    break;
                default:

            }

        };
        xhr.open('PATCH', '/user/email/verify');
        xhr.send(formData);
    });
    // endregion

    // region 아이디 검증
    const loginIdInput = step.querySelector(':scope > .IdLabel > .id-wrapper > .id');

    let loginIdTimeout;
    const message = step.querySelector(':scope > .IdLabel > .id-wrapper > .text');
    loginIdInput.addEventListener('input', () => {
        clearTimeout(loginIdTimeout);
        if (loginIdInput.value === '') {
            message.classList.remove('visible');
            return;
        }
        loginIdTimeout = setTimeout(() => {
            const xhr = new XMLHttpRequest();
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
                        message.classList.add('visible');
                        break;
                    case 'SUCCESS':
                        message.classList.remove('visible');
                        break;
                    default:
                }
            };
            const url = new URL(origin);
            url.pathname = '/user/loginId';
            url.searchParams.set('loginId', loginIdInput.value);
            xhr.open('GET', url);
            xhr.send();
        }, 500);
    });
    // endregion

    // region 비밀번호 검증
    const passwordInput = step.querySelector(':scope > .passwordLabel > .password-wrapper > .password');

    let passwordTimeout;
    const passwordMessage = step.querySelector(':scope > .passwordLabel > .password-wrapper > .text');
    passwordInput.addEventListener('input', () => {
        clearTimeout(passwordTimeout);
        if (passwordInput.value === '') {
            passwordMessage.classList.remove('visible');
            passwordCheckMessage.classList.remove('visible');
            return;
        }
        passwordTimeout = setTimeout(() => {
            if (passwordInput.value.length < 6) {
                passwordMessage.classList.add('visible');
            } else {
                passwordMessage.classList.remove('visible');
            }

            if (passwordCheckInput.value === '') {
                return;
            }
            if (passwordCheckInput.value === passwordInput.value) {
                passwordCheckMessage.classList.remove('visible');
            } else {
                passwordCheckMessage.classList.add('visible');
            }
        }, 500);



    });
    // endregion

    // region 비밀번호 재입력 검증
    const passwordCheckInput = step.querySelector(':scope > .passwordCheckLabel > .passwordCheck-wrapper > .passwordCheck');

    let passwordCheckTimeout;
    const passwordCheckMessage = step.querySelector(':scope > .passwordCheckLabel > .passwordCheck-wrapper > .text');
    passwordCheckInput.addEventListener('input', () => {
        clearTimeout(passwordCheckTimeout);
        if (passwordCheckInput.value === '') {
            passwordCheckMessage.classList.remove('visible');
            return;
        }
        passwordCheckTimeout = setTimeout(() => {
            if (passwordCheckInput.value !== passwordInput.value) {
                passwordCheckMessage.classList.add('visible');
            } else {
                passwordCheckMessage.classList.remove('visible');
            }
        }, 500);
    });
    // endregion



    if (step.classList.contains('personal')) {
        // region 이름 검증
        const nameInput = step.querySelector(':scope > .nameLabel > .name-wrapper > .name');

        let nameTimeout;
        const nameMessage = step.querySelector(':scope > .nameLabel > .name-wrapper > .text');
        nameInput.addEventListener('input', () => {
            clearTimeout(nameTimeout);
            if (nameInput.value === '') {
                nameMessage.classList.remove('visible');
                return;
            }
            nameTimeout = setTimeout(() => {
                if (nameInput.value.length < 2) {
                    nameMessage.classList.add('visible');
                } else {
                    nameMessage.classList.remove('visible');
                }
            }, 500);
        });
        // endregion

        // region 닉네임 검증
        const nicknameInput = $registerThirdPersonalStep.querySelector(':scope > .nicknameLabel > .nickname-wrapper > .nickname');
        const nicknameMessage = $registerThirdPersonalStep.querySelector(':scope > .nicknameLabel > .nickname-wrapper > .text');

        let nicknameTimeout;
        nicknameInput.addEventListener('input', () => {
            clearTimeout(nicknameTimeout);
            if (nicknameInput.value === '') {
                nicknameMessage.classList.remove('visible');
                return;
            }
            nicknameTimeout = setTimeout(() => {
                const xhr = new XMLHttpRequest();
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
                            nicknameMessage.classList.add('visible');
                            break;
                        case 'SUCCESS':
                            nicknameMessage.classList.remove('visible');
                            break;
                        default:
                    }
                };
                const url = new URL(origin);
                url.pathname = '/user/nickname';
                url.searchParams.set('nickname', nicknameInput.value);
                xhr.open('GET', url);
                xhr.send();
            }, 500);
        });
// endregion
    }

    if (step.classList.contains('business')) {
        // region 대표자명 검증
        const representativeNameInput = step.querySelector(':scope > .representativeNameLabel > .representativeName-wrapper > .representativeName');

        let representativeNameTimeout;
        const representativeNameMessage = step.querySelector(':scope > .representativeNameLabel > .representativeName-wrapper > .text');
        representativeNameInput.addEventListener('input', () => {
            clearTimeout(representativeNameTimeout);
            if (representativeNameInput.value === '') {
                representativeNameMessage.classList.remove('visible');
                return;
            }
            representativeNameTimeout = setTimeout(() => {
                if (representativeNameInput.value.length < 2) {
                    representativeNameMessage.classList.add('visible');
                } else {
                    representativeNameMessage.classList.remove('visible');
                }
            }, 500);
        });
        // endregion
    }


    // region 전화번호 검증
    const firstNumber = step.querySelector('.firstNumber');
    const middleNumber = step.querySelector('.contactNumber.first');
    const lastNumber = step.querySelector('.contactNumber.second');
    const phoneMessage = step.querySelector(':scope > .contactNumberLabel > .phone-wrapper > .text');

    let phoneTimeout;
    const checkPhone = () => {
        clearTimeout(phoneTimeout)

        const phone = `${firstNumber.value}${middleNumber.value}${lastNumber.value}`;

        phoneTimeout = setTimeout(() => {
            if (middleNumber.value === '' && lastNumber.value === '') {
                phoneMessage.classList.remove('visible');
                return;
            }

            if (middleNumber.value.length !== 4 || lastNumber.value.length !== 4) {
                phoneMessage.classList.add('visible');
                return;
            }
            const xhr = new XMLHttpRequest();
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
                        phoneMessage.classList.add('visible');
                        break;
                    case 'SUCCESS':
                        phoneMessage.classList.remove('visible');
                        break;
                    default:
                }
            };
            const url = new URL(origin);
            url.pathname = '/user/phone';
            url.searchParams.set('phone', phone);
            xhr.open('GET', url);
            xhr.send();
        }, 500);
    }
    middleNumber.addEventListener('input', checkPhone);
    lastNumber.addEventListener('input', checkPhone);

    // endregion
});







const businessIdInput = $registerThirdBusinessStep.querySelector(':scope > .businessId > .businessId-wrapper > .businessId');
const businessIdMessage = $registerThirdBusinessStep.querySelector(':scope > .businessId > .businessId-wrapper > .text');

let businessIdTimeout;
businessIdInput.addEventListener('input', () => {
    clearTimeout(businessIdTimeout);
    if (businessIdInput.value === '') {
        businessIdMessage.classList.remove('visible');
        return;
    }
    businessIdTimeout = setTimeout(() => {
        const xhr = new XMLHttpRequest();
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
                    businessIdMessage.classList.add('visible');
                    break;
                case 'SUCCESS':
                    businessIdMessage.classList.remove('visible');
                    break;
                default:
            }
        };
        const url = new URL(origin);
        url.pathname = '/user/businessId';
        url.searchParams.set('businessId', businessIdInput.value);
        xhr.open('GET', url);
        xhr.send();
    }, 500);
})







// 인증 시간 함수
function formatMMSS(totalSecond) {
    const minutes = String(Math.floor(totalSecond / 60)).padStart(2, '0');
    const seconds = String(totalSecond % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

let currentTimerId = null; // 전역으로 관리

function startTimer(seconds, timerText) {
    // 기존 타이머 있으면 먼저 제거
    if (currentTimerId) {
        clearInterval(currentTimerId);
        currentTimerId = null;
    }

    let remainSeconds = seconds;
    timerText.textContent = formatMMSS(remainSeconds);

    currentTimerId = setInterval(() => {
        remainSeconds--;
        if (remainSeconds <= 0) {
            clearInterval(currentTimerId);
            currentTimerId = null;
            timerText.textContent = "00:00";
            return;
        }
        timerText.textContent = formatMMSS(remainSeconds);
    }, 1000);
}

function stopTimer() {
    if (currentTimerId) {
        clearInterval(currentTimerId);
        currentTimerId = null;
    }
}