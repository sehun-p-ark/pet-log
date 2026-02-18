const message = document.getElementById('message');
const $title = document.createElement('span');
const $text = document.createElement('span');
const warningButton = message.querySelector(':scope > .button');
$title.classList.add('title');
$text.classList.add('text');
$title.innerText = "알림";
message.prepend($title, $text);
function showMessage(text) {
    message.classList.add('visible');
    $text.innerText = text;
}
warningButton.addEventListener('click', () => {
    message.classList.remove('visible');
});