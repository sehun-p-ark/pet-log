const message = document.getElementById('message');
let messageCallback = null;
let confirmResolver = null;

if (message) {
    const $title = document.createElement('span');
    const $text = document.createElement('span');

    const confirmBtn = message.querySelector('.confirm');
    const cancelBtn = message.querySelector('.cancel');

    $title.classList.add('title');
    $text.classList.add('text');
    $title.innerText = "알림"

    message.prepend($title, $text);

    // 확인버튼
    confirmBtn.addEventListener('click', () => {
        message.classList.remove('visible');

        if (confirmResolver) {
            confirmResolver(true);
            confirmResolver = null;
        }

        if (messageCallback) {
            messageCallback();
            messageCallback = null;
        }
    });

    // 취소 버튼
    cancelBtn.addEventListener('click', () => {
        message.classList.remove('visible');

        if (confirmResolver) {
            confirmResolver(false);
            confirmResolver = null;
        }
    });
}

// 전역에서 접근 가능
function showMessage(text, callback) {
    if (!message) return; // message 없으면 그냥 무시
    message.classList.add('visible');
    message.querySelector('.text').innerText = text;

    message.querySelector('.cancel').classList.add('hidden'); // 취소 숨김
    message.querySelector('.confirm').innerText = "확인";

    messageCallback = callback;
}
// 버튼 두개 메세지
function showConfirm(text) {
    return new Promise((resolve) => {
        if (!message) return;

        message.classList.add('visible');
        message.querySelector('.text').innerText = text;

        message.querySelector('.cancel').classList.remove('hidden');
        message.querySelector('.confirm').innerText = "확인";

        confirmResolver = resolve;
    });
}
// 토스트 메세지
let currentToast = null;

function showToast(message, linkText = null, linkHref = null) {
    if (currentToast) {
        currentToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);

    if (linkText && linkHref) {
        const link = document.createElement('a');
        link.href = linkHref;
        link.textContent = linkText;
        link.className = 'toast-link';
        toast.appendChild(link);
    }

    document.body.appendChild(toast);
    currentToast = toast;

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            if (currentToast === toast) {
                currentToast = null;
            }
        }, 300);
    }, 3000);
}
///////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    const menuCloseBtn = mobileMenu.querySelector('.menu-close-btn');

    // 햄버거 클릭하면 메뉴 나오기
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle("active");
    });

    // 닫기 버튼 클릭하면 메뉴 닫히기
    menuCloseBtn.addEventListener("click", () => {
        mobileMenu.classList.remove('active');
    })

    // 다른 곳 클릭하면 메뉴 닫히기
    document.addEventListener("click", (e) => {
        if (!mobileMenu.contains(e.target) &&
            !hamburger.contains(e.target)) {
            mobileMenu.classList.remove("active");
        }
    });

    // 사이즈 넘어가면 사라지기
    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
            mobileMenu.classList.remove("active");
        }
    });
});