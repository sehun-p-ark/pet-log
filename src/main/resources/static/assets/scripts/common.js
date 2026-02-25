const message = document.getElementById('message');
const $title = document.createElement('span');
const $text = document.createElement('span');
const warningButton = message.querySelector(':scope > .button');
let messageCallback = null;
$title.classList.add('title');
$text.classList.add('text');
$title.innerText = "알림";
message.prepend($title, $text);
function showMessage(text, callback) {
    message.classList.add('visible');
    $text.innerText = text;
    messageCallback = callback;
}
warningButton.addEventListener('click', () => {
    message.classList.remove('visible');

    if(messageCallback) {
        messageCallback();
        messageCallback = null;
    }
});