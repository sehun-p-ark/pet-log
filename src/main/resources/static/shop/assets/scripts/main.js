// 배너
const $banner = document.querySelector('.img-wrapper');

if ($banner) {
    // 배너 불러오기
    function loadBanners() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/shop/banners', true);

        xhr.onreadystatechange = function() {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;
            if (xhr.status < 200 || xhr.status >= 400) {
                console.error('배너 로딩 실패:', xhr.status);
                return;
            }
            const banners = JSON.parse(xhr.responseText);
            renderBanners(banners);
            initBannerSlider();
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
            $item.setAttribute('data-target-id', banner.categoryId || '');
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
        if (banner.targetType === 'category' && banner.subCategoryId) {
            location.href = '/shop/list?eventCategoryId=' + banner.subCategoryId;
        } else if (banner.targetType === 'category' && banner.categoryId) {
            location.href = '/shop/list?categoryId=' + banner.categoryId;
        } else if (banner.targetType === 'brand' && banner.brandName) {
            location.href = '/shop/brand?brand=' + encodeURIComponent(banner.brandName);
        } else if (banner.targetType === 'sale') {
            location.href = '/shop/list?sort=sale';
        } else if (banner.targetType === 'new') {
            location.href = '/shop/list?sort=new';
        } else if (banner.targetType === 'event' && banner.id === 3) {
            location.href = '/shop/welcome';
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
                }, 1000);
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

// 신상품 불러오기
function loadNewProducts(category = 'all', petType = 'all') {
    let url = '/shop/products/new';
    const params = [];
    if (category !== 'all') params.push(`category=${encodeURIComponent(category)}`);
    if (petType !== 'all') params.push(`petType=${encodeURIComponent(petType)}`);
    if (params.length > 0) url += '?' + params.join('&');

    fetch(url)
        .then(res => res.json())
        .then(products => renderProducts('.new-product .product', products))
        .catch(error => console.error('NEW 상품 로딩 실패:', error));
}

// BEST 상품 불러오기
function loadBestProducts(category = 'all', petType = 'all') {
    let url = '/shop/products/best';
    const params = [];
    if (category !== 'all') params.push(`category=${encodeURIComponent(category)}`);
    if (petType !== 'all') params.push(`petType=${encodeURIComponent(petType)}`);
    if (params.length > 0) url += '?' + params.join('&');

    fetch(url)
        .then(res => res.json())
        .then(products => renderProducts('.best-product .product', products))
        .catch(error => console.error('BEST 상품 로딩 실패:', error));
}

// 상품 렌더링
function renderProducts(selector, products) {
    const container = document.querySelector(selector);
    if (!container) return;

    container.innerHTML = products.map(product => {
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
            ${product.discountPrice > 0 ? `
            <div class="discount">
                <div class="percent">${product.discountRate}%</div>
                <div class="number">${product.price.toLocaleString()}원</div>
            </div>
            <div class="price">${product.discountPrice.toLocaleString()}원</div>` :
            `<div class="price">${product.price.toLocaleString()}원</div>`}
            </a>
        `;
    }).join('');
}

// 페이지 로드 시 상품 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadNewProducts();
    loadBestProducts();

    // 브랜드 추천
    document.querySelectorAll('.brand-recommend .item').forEach(function(item) {
        item.addEventListener('click', function() {
            const brandName = this.dataset.brandName;
            if (brandName) {
                location.href = '/shop/brand?brand=' + encodeURIComponent(brandName);
            }
        });
    });

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

    // 더보기 버튼 추가
    document.querySelector('.best-product .more-product')?.addEventListener('click', () => {
        location.href = '/shop/list?sort=popular';
    });

    document.querySelector('.new-product .more-product')?.addEventListener('click', () => {
        location.href = '/shop/list?sort=latest';
    });
});

// 뒤로가기 시
window.addEventListener('pageshow', (e) => {
    const newContainer = document.querySelector('.new-product .product');
    const bestContainer = document.querySelector('.best-product .product');
    if (newContainer) newContainer.innerHTML = '';
    if (bestContainer) bestContainer.innerHTML = '';

    const allNewRadio = document.querySelector('input[name="new-category"][value="all"]');
    const allBestRadio = document.querySelector('input[name="best-category"][value="all"]');

    if (allNewRadio) allNewRadio.checked = true;
    if (allBestRadio) allBestRadio.checked = true;

    document.querySelectorAll('input[name="new-category"]').forEach(radio => {
        if (radio.value !== 'all') radio.checked = false;
    });
    document.querySelectorAll('input[name="best-category"]').forEach(radio => {
        if (radio.value !== 'all') radio.checked = false;
    });

    loadNewProducts();
    loadBestProducts();
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

    xhr.onreadystatechange = function() {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status < 200 || xhr.status >= 400) return;
        const result = JSON.parse(xhr.responseText);
        const allBookmarks = document.querySelectorAll('.bookmark');
        allBookmarks.forEach(bookmark => {
            if (result.isHearted) {
                bookmark.src = '/shop/assets/images/heart-active.png';
                bookmark.classList.add('active');
            }
        });
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

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status === 400) {
            showToast('로그인이 필요합니다.', '로그인하기', '/user/login');
            return;
        }

        if (xhr.status < 200 || xhr.status >= 400) return;

        const result = JSON.parse(xhr.responseText);

        if (result.success) {
            const allBookmarks = document.querySelectorAll('.bookmark');
            allBookmarks.forEach(bookmark => {
                if (result.isHearted) {
                    bookmark.src = '/shop/assets/images/heart-active.png';
                    bookmark.classList.add('active');
                } else {
                    bookmark.src = '/shop/assets/images/heart-default.png';
                    bookmark.classList.remove('active');
                }
            });

            sessionStorage.setItem('heartChanged', 'true');

            if (result.isHearted) {
                showToast('즐겨찾기가 완료 되었습니다.', '찜 목록 바로가기', '/my?menu=4');
            } else {
                showToast('즐겨찾기가 취소되었습니다.', '찜 목록 바로가기', '/my?menu=4');
            }
        } else {
            showToast(result.message, '로그인하기', '/user/login');
        }
    };

    xhr.open('POST', '/shop/heart/' + productId, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
}