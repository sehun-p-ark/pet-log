function bindCategoryEvents() {
    const categoryItems = document.querySelectorAll('.category .item');

    categoryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const input = this.querySelector('input[type="radio"]');
            if (!input) return;
            const value = input.value;
            const name = input.name;

            if (value === '전체' && name === 'category') {
                window.location.href = '/shop/main';
                return;
            }

            if (name === 'category') {
                let petType = '';
                if (value === '강아지') petType = 'dog';
                else if (value === '고양이') petType = 'cat';
                else if (value === '기타') petType = 'etc';
                window.location.href = `/shop/list?petType=${petType}`;
                return;
            }

            if (name.includes('-sub')) {
                let petType = '';
                if (name === 'dog-sub') petType = 'dog';
                else if (name === 'cat-sub') petType = 'cat';
                else if (name === 'etc-sub') petType = 'etc';

                if (value === '전체') {
                    window.location.href = `/shop/list?petType=${petType}`;
                    return;
                }
                if (value === 'BEST') {
                    window.location.href = `/shop/list?petType=${petType}&sort=best`;
                    return;
                }

                const categoryId = this.closest('.item').dataset.categoryId;
                window.location.href = `/shop/list?petType=${petType}&categoryId=${categoryId}`;
            }
        });
    });

    const searchForm = document.querySelector('.category .search');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const keyword = this.querySelector('.search-box').value.trim();
            if (keyword) {
                window.location.href = `/shop/list?keyword=${encodeURIComponent(keyword)}`;
            }
        });
    }
}

// 카테고리
const submenus = document.querySelectorAll('.submenu');
if (submenus.length > 0) {
    submenus.forEach(submenu => {
        submenu.querySelector('.list').addEventListener('click', (e) => {
            if (e.target.classList.contains('item')) {
                let categoryType = '';
                if (submenu.classList.contains('dog')) categoryType = 'dog';
                else if (submenu.classList.contains('cat')) categoryType = 'cat';
                else if (submenu.classList.contains('etc')) categoryType = 'etc';

                const mainCategoryRadio = document.querySelector(`.main .item[data-target="${categoryType}"] input[type="radio"]`);
                if (mainCategoryRadio) mainCategoryRadio.checked = true;

                document.querySelectorAll('.submenu').forEach(otherSubmenu => {
                    if (otherSubmenu !== submenu) {
                        otherSubmenu.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
                    }
                });
            }
        });
    });
}

const mainItems = document.querySelectorAll('.main .item[data-target]');
if (mainItems.length > 0) {
    mainItems.forEach(mainItem => {
        mainItem.addEventListener('click', () => {
            const target = mainItem.getAttribute('data-target');
            if (target === 'all') return;

            const submenu = document.querySelector(`.submenu.${target}`);
            if (submenu) {
                const firstRadio = submenu.querySelector('input[type="radio"]');
                if (firstRadio) firstRadio.checked = true;
            }

            document.querySelectorAll('.submenu').forEach(otherSubmenu => {
                if (!otherSubmenu.classList.contains(target)) {
                    otherSubmenu.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
                }
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const petType = urlParams.get('petType');

    if (petType) {
        const targetMap = { dog: '강아지', cat: '고양이', etc: '기타' };
        const radio = document.querySelector(`.main .item input[value="${targetMap[petType]}"]`);
        if (radio) radio.checked = true;
    } else if (window.location.pathname !== '/shop/main') {
        const allRadio = document.querySelector('.main .item[data-target="all"] input[type="radio"]');
        if (allRadio) allRadio.checked = true;
    }

    fetch('/shop/categories')
        .then(res => res.json())
        .then(categories => {
            document.querySelectorAll('.submenu').forEach(submenu => {
                const petType = submenu.classList.contains('dog') ? 'dog'
                    : submenu.classList.contains('cat') ? 'cat' : 'etc';
                const list = submenu.querySelector('.list');
                list.innerHTML = categories.map(cat => `
                <label class="item" data-category-id="${cat.id}">
                    <input type="radio" name="${petType}-sub" value="${cat.displayText}">
                    ${cat.displayText}
                </label>
            `).join('');
            });

            bindCategoryEvents();

            // fetch 완료 후 체크 (여기로 이동)
            const urlParams = new URLSearchParams(window.location.search);
            const petType = urlParams.get('petType');

            if (petType) {
                const targetMap = { dog: '강아지', cat: '고양이', etc: '기타' };
                const radio = document.querySelector(`.main .item input[value="${targetMap[petType]}"]`);
                if (radio) radio.checked = true;
            } else {
                const allRadio = document.querySelector('.main .item[data-target="all"] input[type="radio"]');
                if (allRadio) allRadio.checked = true;
            }
        });
});