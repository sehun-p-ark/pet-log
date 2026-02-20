// 배너
const $banner = document.querySelector('.img-wrapper');

if ($banner) {
    // 배너 불러오기
    function loadBanners() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/shop/banners', true);

        xhr.onload = function() {
            if (xhr.status === 200) {
                const banners = JSON.parse(xhr.responseText);
                renderBanners(banners);
                initBannerSlider();
            } else {
                console.error('배너 로딩 실패:', xhr.status);
            }
        };

        xhr.send();
    }

// 배너 렌더링
    function renderBanners(banners) {

        $banner.innerHTML = '';

        if (!banners || banners.length === 0) {
            console.error('배너 데이터가 없습니다');
            return;
        }

        banners.forEach(function(banner) {

            const $item = document.createElement('li');
            $item.className = 'item';
            $item.setAttribute('data-target-type', banner.targetType);
            $item.setAttribute('data-target-id', banner.targetId || '');
            $item.setAttribute('data-brand-name', banner.brandName || '');
            $item.innerHTML = '<img class="image" src="' + banner.imageUrl + '" alt="배너">';

            // 클릭 이벤트
            $item.addEventListener('click', function() {
                handleBannerClick(banner);
            });

            $banner.appendChild($item);
        });
    }

    // 배너 클릭 처리
    function handleBannerClick(banner) {
        if (banner.targetType === 'category' && banner.targetId) {
            location.href = '/shop/list?categoryId=' + banner.targetId;
        } else if (banner.targetType === 'brand' && banner.brandName) {
            location.href = '/shop/list?brand=' + encodeURIComponent(banner.brandName);
        } else if (banner.targetType === 'sale') {
            location.href = '/shop/list?sort=sale';
        } else if (banner.targetType === 'new') {
            location.href = '/shop/list?sort=new';
        }
    }

    // 슬라이더 초기화
    function initBannerSlider() {
        const $images = document.querySelectorAll('.img-wrapper > .item');
        const $page = document.querySelector('.page');
        const $prevBtn = document.querySelector('.button.previous');
        const $nextBtn = document.querySelector('.button.next');
        const $total = $images.length;

        if ($total === 0) return;

        const $firstClone = $images[0].cloneNode(true);
        $banner.appendChild($firstClone);
        let index = 0;

        const renderPage = function(current, total) {
            $page.innerHTML = '<span class="current">' + current + '</span>' +
                '<span class="slash">/</span>' +
                '<span class="total">' + total + '</span>';
        };

        const moveSlide = function(newIndex) {
            index = newIndex;
            $banner.style.transition = 'transform 0.5s ease';
            $banner.style.transform = 'translateX(-' + (index * 100) + '%)';

            const displayIndex = index >= $total ? 1 : index + 1;
            renderPage(displayIndex, $total);

            if (index === $total) {
                setTimeout(function() {
                    $banner.style.transition = 'none';
                    $banner.style.transform = 'translateX(0%)';
                    index = 0;
                }, 500);
            }
        };

        $prevBtn.addEventListener('click', function() {
            if (index === 0) {
                $banner.style.transition = 'none';
                $banner.style.transform = 'translateX(-' + ($total * 100) + '%)';
                index = $total;
                setTimeout(function() {
                    moveSlide(index - 1);
                }, 20);
            } else {
                moveSlide(index - 1);
            }
        });

        $nextBtn.addEventListener('click', function() {
            moveSlide(index + 1);
        });

        renderPage(1, $total);

        // 자동 슬라이드
        setInterval(function() {
            index++;
            $banner.style.transition = 'transform 0.5s ease';
            $banner.style.transform = 'translateX(-' + (index * 100) + '%)';

            const displayIndex = index >= $total ? 1 : index + 1;
            renderPage(displayIndex, $total);

            if (index === $total) {
                setTimeout(function() {
                    $banner.style.transition = 'none';
                    $banner.style.transform = 'translateX(0%)';
                    index = 0;
                }, 500);
            }
        }, 3000);
    }

    // 배너 로드
    loadBanners();
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

// 신상품 불러오기
async function loadNewProducts(category = 'all') {
    try {
        let url = '/shop/products/new';
        if (category && category !== 'all') {
            url += `?category=${encodeURIComponent(category)}`;
        }

        const response = await fetch(url);
        const products = await response.json();

        renderProducts('.new-product .product', products);
    } catch (error) {
        console.error('NEW 상품 로딩 실패:', error);
    }
}

// BEST 상품 불러오기
async function loadBestProducts(category = 'all') {
    try {
        let url = '/shop/products/best';
        if (category && category !== 'all') {
            url += `?category=${encodeURIComponent(category)}`;
        }

        const response = await fetch(url);
        const products = await response.json();

        renderProducts('.best-product .product', products);
    } catch (error) {
        console.error('BEST 상품 로딩 실패:', error);
    }
}

// 상품 렌더링
function renderProducts(selector, products) {
    const container = document.querySelector(selector);
    if (!container) return;

    container.innerHTML = products.map(product => {
        const discountedPrice = product.price * (100 - product.discountRate) / 100;
        const thumbnail = product.productImages?.find(img => img.isThumbnail)
            || product.productImages?.[0];
        const imageUrl = thumbnail?.imageUrl || '/shop/assets/images/default-product.png';

        return `
            <a class="item" href="/shop/product/${product.id}" data-product-id="${product.id}">
            <div class="image-wrapper">
                <img class="image" src="${imageUrl}" alt="${product.name}">
            </div>
            <div class="brand">${product.brand}</div>
            <div class="name">${product.name}</div>
            ${product.discountRate > 0 ? `
            <div class="discount">
                <div class="percent">${product.discountRate}%</div>
                <div class="number">${product.price.toLocaleString()}원</div>
            </div>
            <div class="price">${discountedPrice.toLocaleString()}원</div>` : 
            `<div class="price">${product.price.toLocaleString()}원</div>`}
            </a>
`;
    }).join('');
}

// 페이지 로드 시 상품 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadNewProducts();
    loadBestProducts();

    // NEW 카테고리 필터링
    const newCategoryRadios = document.querySelectorAll('input[name="new-category"]');
    newCategoryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const category = e.target.value;
            loadNewProducts(category);
        });
    });

    // BEST 카테고리 필터링
    const bestCategoryRadios = document.querySelectorAll('input[name="best-category"]');
    bestCategoryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const category = e.target.value;
            loadBestProducts(category);
        });
    });
});

// 프리뷰 이미지 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const previewContainers = document.querySelectorAll('.preview > .img-container');
    const mainImage = document.querySelector('.overview > .image-wrapper > .image');

    // 첫 번째 이미지에 기본 active 클래스 추가
    if (previewContainers.length > 0) {
        previewContainers[0].classList.add('active');
    }

    // 각 프리뷰 이미지에 클릭 이벤트 추가
    previewContainers.forEach((container) => {
        container.addEventListener('click', function() {
            // 메인 이미지 변경
            const clickedImageSrc = this.querySelector('.image').src;
            mainImage.src = clickedImageSrc;

            // 활성화 클래스 토글
            previewContainers.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const categoryItems = document.querySelectorAll('.category .item');

    categoryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const input = this.querySelector('input[type="radio"]');
            const value = input.value;
            const name = input.name;

            // 전체 클릭 시 메인 페이지
            if (value === '전체' && name === 'category') {
                window.location.href = '/shop/main';
                return;
            }

            // 대분류 클릭 (강아지, 고양이, 기타)
            if (name === 'category') {
                let petType = '';
                if (value === '강아지') petType = 'dog';
                else if (value === '고양이') petType = 'cat';
                else if (value === '기타') petType = 'etc';

                window.location.href = `/shop/list?petType=${petType}`;
                return;
            }

            // 소분류 클릭 (사료, 간식, 용품 등)
            if (name.includes('-sub')) {
                let petType = '';
                if (name === 'dog-sub') petType = 'dog';
                else if (name === 'cat-sub') petType = 'cat';
                else if (name === 'etc-sub') petType = 'etc';

                // 전체
                if (value === '전체') {
                    window.location.href = `/shop/list?petType=${petType}`;
                    return;
                }

                // BEST
                if (value === 'BEST') {
                    window.location.href = `/shop/list?petType=${petType}&sort=best`;
                    return;
                }

                // 카테고리 (사료, 간식, 용품)
                window.location.href = `/shop/list?petType=${petType}&category=${value}`;
            }
        });
    });

    // 검색 폼
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
});

// 페이지 로드 시 찜 상태 확인
document.addEventListener('DOMContentLoaded', function() {
    const pathParts = window.location.pathname.split('/');
    const productId = pathParts[pathParts.length - 1];

    if (productId && !isNaN(productId)) {
        checkHeartStatus(productId);
    }
});

function checkHeartStatus(productId) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/shop/heart/' + productId + '/status', true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            const allBookmarks = document.querySelectorAll('.bookmark');

            allBookmarks.forEach(bookmark => {
                if (result.isHearted) {
                    bookmark.src = '/shop/assets/images/heart-filled.png';
                    bookmark.classList.add('active');
                }
            });
        }
    };

    xhr.send();
}

// 찜하기 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const bookmarkBtns = document.querySelectorAll('.bookmark');

    bookmarkBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();

            const pathParts = window.location.pathname.split('/');
            const productId = pathParts[pathParts.length - 1];

            if (!productId || isNaN(productId)) {
                console.error('상품 ID를 찾을 수 없습니다');
                return;
            }

            toggleHeart(productId, this);
        });
    });
});

function toggleHeart(productId, heartElement) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/shop/heart/' + productId, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);

            if (result.success) {
                console.log('찜 상태:', result.isHearted);

                const allBookmarks = document.querySelectorAll('.bookmark');
                allBookmarks.forEach(bookmark => {
                    if (result.isHearted) {
                        bookmark.src = '/shop/assets/images/heart-filled.png';
                        bookmark.classList.add('active');
                    } else {
                        bookmark.src = '/shop/assets/images/heart-default.png';
                        bookmark.classList.remove('active');
                    }
                });

                // 토스트 메시지 추가
                if (result.isHearted) {
                    showToast('즐겨찾기가 완료 되었습니다.');
                } else {
                    showToast('즐겨찾기가 취소되었습니다.');
                }
            } else {
                alert(result.message);
            }
        }
    };

    xhr.send();
}