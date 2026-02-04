//배너
const $banner = document.querySelector('.img-wrapper');

if ($banner) {
    const $image = document.querySelectorAll('.img-wrapper > .item');
    const $page = document.querySelector('.page');
    const $prevBtn = document.querySelector('.button.previous');
    const $nextBtn = document.querySelector('.button.next');
    const $total = $image.length;
    const $firstClone = $image[0].cloneNode(true);

    $banner.appendChild($firstClone);
    let index = 0;

    const renderPage = (current, total) => {
        $page.innerHTML = `
        <span class="current">${current}</span>
        <span class="slash">/</span>
        <span class="total">${total}</span>
        `;
    };

    const moveSlide = (newIndex) => {
        index = newIndex;
        $banner.style.transition = 'transform 0.5s ease';
        $banner.style.transform = `translateX(-${index * 100}%)`;

        const displayIndex = index >= $total ? 1 : index + 1;
        renderPage(displayIndex, $total);

        if (index === $total){
            setTimeout(() => {
                $banner.style.transition = 'none';
                $banner.style.transform = 'translateX(0%)';
                index = 0;
            }, 500);
        }
    };

    $prevBtn.addEventListener('click', () => {
        if (index === 0){
            $banner.style.transition = 'none';
            $banner.style.transform = `translateX(-${$total * 100}%)`;
            index = $total;
            setTimeout(() => {
                moveSlide(index - 1);
            }, 20);
        } else {
            moveSlide(index - 1);
        }
    });

    $nextBtn.addEventListener('click', () => {
        moveSlide(index + 1);
    });

    renderPage(1, $total);

    setInterval(() => {
        index++;
        $banner.style.transition = 'transform 0.5s ease';
        $banner.style.transform = `translateX(-${index * 100}%)`;

        const displayIndex = index >= $total ? 1 : index + 1;
        renderPage(displayIndex, $total);

        if (index === $total) {
            setTimeout(() => {
                $banner.style.transition = 'none';
                $banner.style.transform = 'translateX(0%)';
                index = 0;
            }, 500);
        }
    }, 3000);
}

// 카테고리
const submenus = document.querySelectorAll('.submenu');
if (submenus.length > 0) {
    submenus.forEach(submenu => {
        submenu.querySelector('.list').addEventListener('click', (e) => {
            if (e.target.classList.contains('item')){
                let categoryType = '';

                if (submenu.classList.contains('dog')){
                    categoryType = 'dog';
                } else if (submenu.classList.contains('cat')){
                    categoryType = 'cat';
                } else if (submenu.classList.contains('etc')){
                    categoryType = 'etc';
                }

                const mainCategoryRadio = document.querySelector(`.main .item[data-target="${categoryType}"] input[type="radio"]`);
                if (mainCategoryRadio){
                    mainCategoryRadio.checked = true;
                }

                document.querySelectorAll('.submenu').forEach(otherSubmenu => {
                    if (otherSubmenu !== submenu) {
                        otherSubmenu.querySelectorAll('input[type="radio"]').forEach(radio => {
                            radio.checked = false;
                        });
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
                if (firstRadio) {
                    firstRadio.checked = true;
                }
            }

            document.querySelectorAll('.submenu').forEach(otherSubmenu => {
                if (!otherSubmenu.classList.contains(target)) {
                    otherSubmenu.querySelectorAll('input[type="radio"]').forEach(radio => {
                        radio.checked = false;
                    });
                }
            });
        });
    });
}