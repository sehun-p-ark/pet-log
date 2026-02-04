document.addEventListener('DOMContentLoaded', () => {
    const $nav = document.getElementById('topNavigator');
    if (!$nav) return;

    $nav.addEventListener('click', (e) => {
        const item = e.target.closest('.item');
        if (!item) return;

        $nav.querySelector('.item.is-active')
            ?.classList.remove('is-active');

        item.classList.add('is-active');
    });
});



