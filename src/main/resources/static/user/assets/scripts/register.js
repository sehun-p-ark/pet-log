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

// 회원가입 단계 이동 함수
function goToStep(stepNumber) {
    if (stepNumber > 1 && !selectedMemberType) {
        console.warn('회원 유형을 선택하지 않고 해당 단계에 도달하였으므로 회원 유형 선택 단계로 돌아갑니다.');
        stepNumber = 1;
    }

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
        if (selectedMemberType === 'personal') {
            $registerSecondPersonalStep.classList.remove('hidden');
            $registerSecondPersonalStep.scrollTop = 0;
        } else if (selectedMemberType === 'business') {
            $registerSecondBusinessStep.classList.remove('hidden');
            $registerSecondBusinessStep.scrollTop = 0;
        }
        return;
    }

    if (stepNumber === 3) {
        if (selectedMemberType === 'personal') {
            $registerThirdPersonalStep.classList.remove('hidden');
            $registerThirdPersonalStep.scrollTop = 0;
        } else if (selectedMemberType === 'business') {
            $registerThirdBusinessStep.classList.remove('hidden');
            $registerThirdBusinessStep.scrollTop = 0;
        }
    }

    if (stepNumber === 4) {
        if (selectedMemberType === 'personal') {
            $registerForthPersonalStep.classList.remove('hidden');
            $registerForthPersonalStep.scrollTop = 0;
        } else if (selectedMemberType === 'business') {
            $registerForthBusinessStep.classList.remove('hidden');
            $registerForthBusinessStep.scrollTop = 0;
        }
    }
}

// 회원가입 필수 입력부분 미입력시 알림창
const registerMessage = document.getElementById('register-message');
const $title = document.createElement('span');
const $text = document.createElement('span');
const warningButton = registerMessage.querySelector(':scope > .button');
$title.classList.add('title');
$text.classList.add('text');
$title.innerText = "알림";
registerMessage.prepend($title, $text);
function showMessage(text) {
    registerMessage.classList.add('visible');
    $text.innerText = text;
}
warningButton.addEventListener('click', () => {
    registerMessage.classList.remove('visible');
});




/*============회원가입 첫번째 단계================*/

// 회원가입 첫번째 단계에서 개인회원을 눌렀을 때
$personalMember.addEventListener('click', () => {
    selectedMemberType = 'personal';
    goToStep(2);
});

// 회원가입 첫번째 단계에서 사업자회원을 눌렀을 때
$businessMember.addEventListener('click', () => {
    selectedMemberType = 'business';
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

    nextButton.addEventListener('click', () => {
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

// 회원가입 세번째 단계에서 인증번호 전송 버튼 누르면 인증번호 확인 버튼 활성화
$registerThirdSteps.forEach(step => {
    const emailSendButton = step.querySelector(':scope > .emailSendLabel > .button');
    const emailInput = step.querySelector(':scope > .emailSendLabel > .email');
    const emailVerifyNumberInput = step.querySelector(':scope > .emailVerifyLabel > .emailVerifyNumber');
    const emailVerifyButton = step.querySelector(':scope > .emailVerifyLabel > .button');

    emailSendButton.addEventListener('click', () => {
        if (emailInput.value === '') {
            showMessage('이메일을 입력해주세요.');
            return;
        }
        emailInput.setAttribute('disabled', '');
        emailSendButton.setAttribute('disabled', '');
        emailVerifyNumberInput.removeAttribute('disabled');
        emailVerifyButton.removeAttribute('disabled');
    });
    emailVerifyButton.addEventListener('click', () => {
        if (emailVerifyNumberInput.value === '') {
            showMessage('인증번호를 입력해주세요.');
            return;
        }
        emailVerifyNumberInput.setAttribute('disabled', '');
        emailVerifyButton.setAttribute('disabled', '');
        showMessage('인증을 완료하였습니다.');
        isEmailVerified = true;
    })
});



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
const registerThirdPersonalNicknameInput = $registerThirdPersonalStep.querySelector(':scope > .nicknameLabel > .nickname');
const registerThirdPersonalNicknameButton = $registerThirdPersonalStep.querySelector(':scope > .nicknameLabel > .button');
let isNicknameChecked = false;
registerThirdPersonalNicknameButton.addEventListener('click', () => {
    if (registerThirdPersonalNicknameInput.value === '') {
        showMessage('닉네임을 입력해주세요.');
        return;
    }
    isNicknameChecked = true;
    showMessage('사용할 수 있는 닉네임입니다.');
    registerThirdPersonalNicknameInput.setAttribute('disabled', '');
    registerThirdPersonalNicknameButton.setAttribute('disabled', '');
});

// 세번째 단계에서 다음버튼을 눌렀을 때 정보 미입력 시 경고모달 띄우기
const ThirdPersonalNextButton = $registerThirdPersonalStep.querySelector(':scope > .button-wrapper > .next');
const ThirdPersonalInputs = $registerThirdPersonalStep.querySelectorAll('.input');
const ThirdPersonalPasswordInput = $registerThirdPersonalStep.querySelector(':scope > .passwordLabel > .password');
const ThirdPersonalPasswordCheckInput = $registerThirdPersonalStep.querySelector(':scope > .passwordCheckLabel > .passwordCheck');
ThirdPersonalNextButton.addEventListener('click', () => {
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
    if (ThirdPersonalPasswordInput.value !== ThirdPersonalPasswordCheckInput.value) {
        showMessage('비밀번호가 서로 일치하지 않습니다. 다시 확인해주세요.');
        return;
    }
    if (!isNicknameChecked) {
        showMessage('닉네임 중복 확인을 완료해주세요.');
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

$registerForthSteps.forEach(step => {
    const completeButton = step.querySelector(':scope > .button-wrapper > .complete');

    completeButton.addEventListener('click', () => {
        location.href = '/user/login';
    });
});






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
    selectType = null;
    $petDialogFirstNextButton.setAttribute('disabled', '');
}

function resetDialogSecond() {
    $petDialogSecond.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
    preview.src = '';
    circle.classList.remove('visible');
    $petDialogSecondNextButton.setAttribute('disabled', '');
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

// 회원가입 네번째 단계에서 애완동물 등록버튼을 눌렀을 때
$petRegistrationButton.addEventListener('click', () => {
    resetAllDialog();
    openDialog(1);
});

// 애완동물 Dialog에서 취소버튼을 눌러 창을 껐을 때
$petDialogs.forEach(step => {
    const dialogCancelButton = step.querySelector(':scope > .cancel');

    dialogCancelButton.addEventListener('click', () => {
        closeAllPetDialogs()
        resetAllDialog()
        currentStep = 1;
    });
});


const dogSelect = $petDialogFirst.querySelector(':scope > .select-wrapper > .dog');
const catSelect = $petDialogFirst.querySelector(':scope > .select-wrapper > .cat');
const anotherSelect = $petDialogFirst.querySelector(':scope > .select-wrapper > .another');

dogSelect.addEventListener('click', () => {
    selectType = 'dog';
    dialogFirstNextButton()
    resetDialogSecond()
    resetDialogThird()
});
catSelect.addEventListener('click', () => {
    selectType = 'cat';
    dialogFirstNextButton()
    resetDialogSecond()
    resetDialogThird()
});
anotherSelect.addEventListener('click', () => {
    selectType = 'another';
    dialogFirstNextButton()
    resetDialogSecond()
    resetDialogThird()
});

function dialogFirstNextButton() {
    if (selectType != null) {
        if (petNameInput.value.trim() !== '') {
            $petDialogFirstNextButton.removeAttribute('disabled');
        } else {
            $petDialogFirstNextButton.setAttribute('disabled', '');
        }
    } else {
        $petDialogFirstNextButton.setAttribute('disabled', '');
    }
}

const petNameInput = $petDialogFirst.querySelector(':scope > .petName-wrapper > .petName');
petNameInput.addEventListener('input', () => {
    dialogFirstNextButton()
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
    if (selectType !== 'another') {
        if (dialogSecondPetTypeInput.value.trim() !== '') {
            $petDialogSecondNextButton.removeAttribute('disabled');
        } else {
            $petDialogSecondNextButton.setAttribute('disabled', '');
        }
    }
    if (selectType === 'another') {
        $petDialogSecondNextButton.removeAttribute('disabled');
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
function dialogThirdCompleteButton() {
    const genderCheck = $petDialogThird.querySelector('input[name="gender"]:checked');
    const weightTypeCheck = $petDialogThird.querySelector('input[name="weightType"]:checked');
    if (genderCheck && weightInput.value.trim() !== '' && weightTypeCheck) {
        $petDialogThirdCompleteButton.removeAttribute('disabled');
    } else {
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

// 애완동물 DialogThird에서 작성완료 버튼을 눌렀을 때
let petId = 1;
$petDialogThirdCompleteButton.addEventListener('click', () => {
    const petNameInput = $petDialogFirst.querySelector(':scope > .petName-wrapper > .petName');
    const genderInput = $petDialogThird.querySelector(':scope input[name="gender"]:checked');
    const year = petYear.value || petYear.placeholder;
    const weight = $petDialogThird.querySelector(':scope > .petWeightLabel > .weight-wrapper > .weight');
    const pet = {
        petId: petId++,
        petImage: fileInput.files.length > 0 ? preview.src : '/user/assets/images/defaultPetImage.png',
        name: petNameInput.value,
        species: $petDialogSecondSelectType.querySelector(':scope > .petType').value,
        gender: genderInput ? genderInput.classList.contains('male') ? '남아' : '여아' : null,
        birth: `${year}생`,
        weight: weight.value
    }
    pets.push(pet);
    addPetToList(pet);
    closeAllPetDialogs();
    resetAllDialog();
    currentStep = 1;
});


function addPetToList(pet) {
    const li = document.createElement('li');
    li.classList.add('pet');
    const genderIcon = pet.gender === '남아' ? '/user/assets/images/male.png' : '/user/assets/images/female.png';
    const petImage = pet.petImage;
    li.innerHTML = `
    <label class="remember">
        <input hidden class="checkbox" type="radio" name="primary" value="${pet.petId}">
        <span class="circle">
                <img class="image" src="/user/assets/images/loginCheck.png" alt="">
        </span>
        <span class="text">대표 동물</span>
    </label>
    <div class="petInformation">
        <div class="image-wrapper">
            <img class="petImage" src="${petImage}" alt="">
        </div>
        <div class="detail">
            <span class="petName">
                ${pet.name}
                <img class="gender" src="${genderIcon}" alt="">
            </span>
            <span class="species">${pet.species}</span>
            <span class="birth">${pet.birth}</span>
            <span class="weight">${pet.weight}kg</span>
        </div>
    </div>`;
    if (pets.length === 1) {
        li.querySelector('input[name="primary"]').checked = true;
    }
    petList.append(li);
}















/*
* 현재 해결해야할거
* 아직 정보들 초기화 하는걸 안만들어놔서 나중에 회원가입 완료할떄 개인,사업자 회원 둘다 시도한다면
* 둘의정보가 동시에 저장될 우려가 있음
* 또 공용으로 쓴 함수들이 많기 때문에 헷갈릴 우려가 있다*/
















