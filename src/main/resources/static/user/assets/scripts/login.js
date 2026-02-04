/** @type {HTMLFormElement} */
const $main = document.getElementById('main');
const $loginForm = document.getElementById('login-form');
const $cover = document.querySelector('.cover');

/* ================= 공통 ================= */

function openCover() {
    $cover.classList.add('visible');
}

function closeCover() {
    $cover.classList.remove('visible');
}

// 로그인 창 경고모달
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





/* ================= 아이디 찾기 ================= */

// 아이디 찾기 버튼
const $idSearchButton = $loginForm.querySelector(':scope > .bottom-link-wrapper > .idSearch');
const $searchIdForm = $main.querySelector(':scope > .searchId');
const $searchIdEmailSendButton = $searchIdForm.querySelector('.emailSendButton');
const $searchIdEmailVerifyButton = $searchIdForm.querySelector('.emailVerifyButton');
const $searchIdCancelButton = $searchIdForm.querySelector('.title .cancel');
const $idSearchResult = $main.querySelector('.dialogLoginSearchResult');
const $idSearchResultButton = $idSearchResult.querySelector('.button');

// 로그인 아이디 찾기 눌렀을 때
$idSearchButton.addEventListener('click', () => {
    resetSearchIdForm();
    $searchIdForm.classList.add('visible');
    closeCover();
});

// 아이디 찾기에서 인증번호 전송버튼을 눌렀을 때
const $searchIdNameInput = $searchIdForm.querySelector(':scope > .nameLabel > .name');
const $searchIdEmailInput = $searchIdForm.querySelector(':scope > .emailLabel > .email-wrapper > .email');
$searchIdEmailSendButton.addEventListener('click', () => {
    if ($searchIdNameInput.value === '') {
        showMessage("이름을 입력해주세요.");
        return;
    }
    if ($searchIdEmailInput.value === '') {
        showMessage("이메일을 입력해주세요.")
        return;
    }
    $searchIdNameInput.setAttribute('disabled', '');
    $searchIdEmailInput.setAttribute('disabled','');
    $searchIdEmailSendButton.setAttribute('disabled', '');
    $searchIdEmailVerifyInput.removeAttribute('disabled');
    $searchIdEmailVerifyButton.removeAttribute('disabled');
});

const $searchIdEmailVerifyInput = $searchIdForm.querySelector(':scope > .emailVerifyLabel > .emailVerify-wrapper > .emailVerify');
// 아이디 찾기에서 인증번호 확인버튼 눌렀을 때
$searchIdEmailVerifyButton.addEventListener('click', () => {
    if ($searchIdEmailVerifyInput.value === '') {
        showMessage("인증번호를 입력해주세요.");
        return
    }
    $searchIdEmailVerifyInput.setAttribute('disabled', '');
    $searchIdEmailVerifyButton.setAttribute('disabled', '');
    $idSearchResult.classList.add('visible');
    openCover();
});

// 아이디 찾기 결과에서 로그인으로 돌아가기 버튼 눌렀을 때
$idSearchResultButton.addEventListener('click', () => {
    $idSearchResult.classList.remove('visible');
    $searchIdForm.classList.remove('visible');
    closeCover();
});

// 아이디 찾기에서 닫기(X) 버튼 눌렀을 때
$searchIdCancelButton.addEventListener('click', () => {
    $searchIdForm.classList.remove('visible');
});

function resetSearchIdForm() {
    // input 값 초기화
    $searchIdForm.querySelectorAll('input').forEach(input => {
        input.value = '';
        input.setAttribute('disabled', '');
    });

    // 처음부터 활성화돼야 하는 input
    $searchIdForm.querySelector('.name').removeAttribute('disabled');
    $searchIdForm.querySelector('.email').removeAttribute('disabled');

    // 버튼 disabled 초기화
    $searchIdForm.querySelectorAll('button:not(.cancel)').forEach(button => {
        button.setAttribute('disabled', '');
    });

    // 인증번호 전송 버튼은 활성
    $searchIdEmailSendButton.removeAttribute('disabled');
}

/* ================= 비밀번호 찾기 ================= */

const $passwordSearchButton = $loginForm.querySelector('.passwordSearch');
const $searchPasswordForm = $main.querySelector('.searchPassword');
const $searchPasswordEmailSendButton = $searchPasswordForm.querySelector('.emailSendButton');
const $searchPasswordEmailVerifyButton = $searchPasswordForm.querySelector('.emailVerifyButton');
const $changePasswordButton = $searchPasswordForm.querySelector('.changePasswordButton');
const $emailVerifyNumberInput = $searchPasswordForm.querySelector('.emailVerify.input');
const $changePasswordLabel = $searchPasswordForm.querySelector('.changePassword-wrapper');
const $searchPasswordCancelButton = $searchPasswordForm.querySelector('.title .cancel');

const $passwordChangeResult = $main.querySelector('.dialogPasswordChangeResult');
const $passwordChangeResultButton = $passwordChangeResult.querySelector('.button');

// 로그인 비밀번호 찾기 눌렀을 때
$passwordSearchButton.addEventListener('click', () => {
    $searchPasswordForm.classList.add('visible');
});

// 비밀번호 찾기에서 닫기(X) 버튼 눌렀을 때
$searchPasswordCancelButton.addEventListener('click', () => {
    closeSearchPassword();
});

// 비밀번호 찾기에서 인증번호 전송을 눌렀을 때
const $searchPasswordIdInput = $searchPasswordForm.querySelector(':scope > .verifyForSearchPassword-wrapper > .idLabel > .id');
const $searchPasswordEmailInput = $searchPasswordForm.querySelector(':scope > .verifyForSearchPassword-wrapper > .emailLabel > .email-wrapper > .email');
$searchPasswordEmailSendButton.addEventListener('click', () => {
    if ($searchPasswordIdInput.value === '') {
        showMessage("아이디를 입력해주세요.");
        return;
    }
    if ($searchPasswordEmailInput.value === '') {
        showMessage("이메일을 입력해주세요.");
        return;
    }
    $searchPasswordIdInput.setAttribute('disabled', '');
    $searchPasswordEmailInput.setAttribute('disabled', '');
    $searchPasswordEmailSendButton.setAttribute('disabled', '');
    $emailVerifyNumberInput.removeAttribute('disabled');
    $searchPasswordEmailVerifyButton.removeAttribute('disabled');
});

// 비밀번호 찾기에서 인증번호 확인버튼을 눌렀을 때
const $searchPasswordEmailVerifyInput = $searchPasswordForm.querySelector(':scope > .verifyForSearchPassword-wrapper > .emailVerifyLabel > .emailVerify-wrapper > .emailVerify');
$searchPasswordEmailVerifyButton.addEventListener('click', () => {
    if ($searchPasswordEmailVerifyInput.value === '') {
        showMessage("인증번호를 입력해주세요.");
        return;
    }
    $searchPasswordEmailVerifyInput.setAttribute('disabled', '');
    $searchPasswordEmailVerifyButton.setAttribute('disabled', '');
    $searchPasswordChangePasswordInput.removeAttribute('disabled');
    $searchPasswordChangePasswordCheckInput.removeAttribute('disabled');
    $changePasswordLabel.classList.add('visible');
});

// 비밀번호 찾기에서 비밀번호 재설정 버튼을 눌렀을 때
const $searchPasswordChangePasswordInput = $searchPasswordForm.querySelector(':scope > .changePassword-wrapper > .changePasswordLabel > .password');
const $searchPasswordChangePasswordCheckInput = $searchPasswordForm.querySelector(':scope > .changePassword-wrapper > .changePasswordCheckLabel > .passwordCheck');
$changePasswordButton.addEventListener('click', () => {
    if ($searchPasswordChangePasswordInput.value === '') {
        showMessage("새로운 비밀번호를 입력해주세요.");
        return;
    }
    if ($searchPasswordChangePasswordCheckInput.value === '') {
        showMessage("비밀번호 확인을 위해 한 번 더 입력해주세요.");
        return;
    }
    if ($searchPasswordChangePasswordInput.value !== $searchPasswordChangePasswordCheckInput.value) {
        showMessage("변경하실 비밀번호가 서로 일치하지 않습니다. 다시 확인해주세요.");
        return;
    }
    $searchPasswordChangePasswordInput.setAttribute('disabled', '');
    $searchPasswordChangePasswordCheckInput.setAttribute('disabled', '');
    $passwordChangeResult.classList.add('visible');
    openCover();
});

// 비밀번호 변경 완료 다이얼로그에서 확인 버튼 눌렀을 때
$passwordChangeResultButton.addEventListener('click', () => {
    $passwordChangeResult.classList.remove('visible');
    closeSearchPassword();
});

/* ================= 공통 닫기 / 초기화 ================= */

// 비밀번호 찾기 전체 닫기
function closeSearchPassword() {
    resetSearchPasswordForm();
    $searchPasswordForm.classList.remove('visible');
    closeCover();
}

// 비밀번호 찾기 내용 리셋
function resetSearchPasswordForm() {
    // input 값 초기화
    $searchPasswordForm.querySelectorAll('input').forEach(input => {
        input.value = '';
        input.setAttribute('disabled', '');
    });

    // disabled 되면 안 되는 input 다시 풀기
    $searchPasswordForm.querySelector('.id').removeAttribute('disabled');
    $searchPasswordForm.querySelector('.email').removeAttribute('disabled');

    // 버튼 다시 disabled
    $searchPasswordForm.querySelectorAll('button').forEach(button => {
        button.setAttribute('disabled', '');
    });

    // 처음부터 활성화돼야 하는 버튼만 풀기
    $searchPasswordEmailSendButton.removeAttribute('disabled');
    $searchPasswordCancelButton.removeAttribute('disabled');

    // 단계 UI 숨김
    $changePasswordLabel.classList.remove('visible');
}
