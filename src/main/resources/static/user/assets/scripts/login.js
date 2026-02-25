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
    loading.classList.add('visible');
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('name', $searchIdNameInput.value);
    formData.append('email', $searchIdEmailInput.value);
    formData.append('type', 'FIND_ID')
    xhr.onreadystatechange = () => {
        if(xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }
        loading.classList.remove('visible');
        if(xhr.status < 200 || xhr.status >= 400){
            console.log('서버 오류남 200~400')
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'FAILURE':
                showMessage('이름 또는 이메일을 다시 확인해주세요.');
                break;
            case 'SUCCESS':
                showMessage('작성하신 이메일로 인증번호를 발송하였습니다. \n 인증번호는 5분간만 유효하니 유의해주세요.');
                $searchIdNameInput.setAttribute('disabled', '');
                $searchIdEmailInput.setAttribute('disabled','');
                $searchIdEmailSendButton.setAttribute('disabled', '');
                $searchIdEmailVerifyInput.removeAttribute('disabled');
                $searchIdEmailVerifyButton.removeAttribute('disabled');
                break;
            default:
        }
    };
    xhr.open('POST', '/user/findId');
    xhr.send(formData);
});

const $searchIdEmailVerifyInput = $searchIdForm.querySelector(':scope > .emailVerifyLabel > .emailVerify-wrapper > .emailVerify');
const nameResult = $idSearchResult.querySelector('.nameResult');
const idResult = $idSearchResult.querySelector('.id');
// 아이디 찾기에서 인증번호 확인버튼 눌렀을 때
$searchIdEmailVerifyButton.addEventListener('click', () => {
    if ($searchIdEmailVerifyInput.value === '') {
        showMessage("인증번호를 입력해주세요.");
        return
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', $searchIdEmailInput.value);
    formData.append('code', $searchIdEmailVerifyInput.value);
    formData.append('type', 'FIND_ID');
    xhr.onreadystatechange = () => {
        if(xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }
        if(xhr.status < 200 || xhr.status >= 400){

            return;
        }
        const response = JSON.parse(xhr.responseText);
        console.log(response)
        switch (response.result) {
            case 'FAILURE':
                showMessage('인증번호가 맞지 않습니다. 다시 입력해주세요.');
                break;
            case 'SUCCESS':
                nameResult.innerText = `${response.name} 회원님의 아이디는`;
                idResult.innerText = `${response.loginId}`
                $searchIdEmailVerifyInput.setAttribute('disabled', '');
                $searchIdEmailVerifyButton.setAttribute('disabled', '');
                $idSearchResult.classList.add('visible');
                openCover();
                break;
            default:
        }
    };
    xhr.open('PATCH', '/user/loginId/verify');
    xhr.send(formData);
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

// region 비밀번호 찾기에서 인증번호 전송을 눌렀을 때
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
    loading.classList.add('visible');
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('loginId', $searchPasswordIdInput.value);
    formData.append('email', $searchPasswordEmailInput.value);
    formData.append('type', 'CHANGE_PASSWORD');
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
                showMessage('아이디 또는 이메일을 다시 확인해주세요.');
                break;
            case 'SUCCESS':
                showMessage('작성하신 이메일로 인증번호를 발송하였습니다. \n 인증번호는 5분간만 유효하니 유의해주세요.');
                $searchPasswordIdInput.setAttribute('disabled', '');
                $searchPasswordEmailInput.setAttribute('disabled', '');
                $searchPasswordEmailSendButton.setAttribute('disabled', '');
                $emailVerifyNumberInput.removeAttribute('disabled');
                $searchPasswordEmailVerifyButton.removeAttribute('disabled');
                break;
            default:
        }
    };
    xhr.open('POST', '/user/findPassword');
    xhr.send(formData);
});
// endregion

// region 비밀번호 찾기에서 인증번호 확인버튼을 눌렀을 때
const $searchPasswordEmailVerifyInput = $searchPasswordForm.querySelector(':scope > .verifyForSearchPassword-wrapper > .emailVerifyLabel > .emailVerify-wrapper > .emailVerify');
$searchPasswordEmailVerifyButton.addEventListener('click', () => {
    if ($searchPasswordEmailVerifyInput.value === '') {
        showMessage("인증번호를 입력해주세요.");
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', $searchPasswordEmailInput.value);
    formData.append('code', $searchPasswordEmailVerifyInput.value);
    formData.append('type', 'CHANGE_PASSWORD');
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
                showMessage('인증번호가 맞지 않습니다.. 다시 입력해주세요.');
                break;
            case 'SUCCESS':
                $searchPasswordEmailVerifyInput.setAttribute('disabled', '');
                $searchPasswordEmailVerifyButton.setAttribute('disabled', '');
                $searchPasswordChangePasswordInput.removeAttribute('disabled');
                $searchPasswordChangePasswordCheckInput.removeAttribute('disabled');
                $changePasswordLabel.classList.add('visible');
                break;
            default:
        }
        
    };
    xhr.open('PATCH', '/user/email/verify');
    xhr.send(formData);
});
// endregion

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
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('loginId', $searchPasswordIdInput.value);
    formData.append('email', $searchPasswordEmailInput.value);
    formData.append('password', $searchPasswordChangePasswordInput.value);
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
                break;
            case 'FAILURE_IS_USED':
                showMessage('현재 사용 중인 비밀번호와 같습니다.');
                break;
            case 'SUCCESS':
                $searchPasswordChangePasswordInput.setAttribute('disabled', '');
                $searchPasswordChangePasswordCheckInput.setAttribute('disabled', '');
                $passwordChangeResult.classList.add('visible');
                openCover();
                break;
            default:
        }
    };
    xhr.open('PATCH', '/user/changePassword');
    xhr.send(formData);

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



// region 로그인 버튼 누를때
const loginButton = $loginForm.querySelector(':scope > .login-button');
const loginIdInput = $loginForm.querySelector(':scope > .label > .id');
const passwordInput = $loginForm.querySelector(':scope > .label > .password');
loginButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (loginIdInput.value === '') {
        showMessage('아이디를 입력해주세요.');
        return;
    }
    if (passwordInput.value === '') {
        showMessage('비밀번호를 입력해주세요.');
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('loginId', loginIdInput.value);
    formData.append('password', passwordInput.value);
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
                showMessage('아이디 또는 비밀번호를 다시 입력해주세요.');
                break;
            case 'SUCCESS':
                // 1. 서버가 보낸 데이터를 콘솔에 찍어서 확인 (F12 누르면 보임)
                console.log('로그인 성공 데이터:', response);

                // 2. 관리자(ADMIN)인지 체크해서 리다이렉트 경로 결정
                if (response.userType === 'ADMIN') {
                    alert('관리자 계정으로 로그인되었습니다.');
                    location.href = '/cs'; // 관리자가 갈 페이지 (문의 목록)
                } else {
                    location.href = '/main'; // 일반 유저가 갈 페이지
                }
                break;
        }
    };
    xhr.open('POST', '/user/login');
    xhr.send(formData);
});
// endregion


// region 비밀번호 찾기


// endregion
