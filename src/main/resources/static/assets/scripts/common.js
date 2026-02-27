const message = document.getElementById('message');

if (message) {
    const $title = document.createElement('span');
    const $text = document.createElement('span');
    const warningButton = message.querySelector(':scope > .button');
    $title.classList.add('title');
    $text.classList.add('text');
    $title.innerText = "알림";
    message.prepend($title, $text);

    warningButton.addEventListener('click', () => {
        message.classList.remove('visible');
    });
}

// 전역에서 접근 가능
function showMessage(text) {
    if (!message) return; // message 없으면 그냥 무시
    message.classList.add('visible');
    message.querySelector('.text').innerText = text;
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