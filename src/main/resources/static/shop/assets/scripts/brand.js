const PAGE_SIZE = 20;
let currentPage = 0;
let isLoading = false;
let hasMore = true;
let currentBrand = null;
let currentSort = 'latest';

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    currentBrand = params.get('brand');

    if (!currentBrand) return;

    loadBestProducts(currentBrand).then(() => {
        return loadAllProducts();
    });

    // 정렬 필터
    const sortSelect = document.querySelector('.product-filter');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            currentSort = this.value;
            currentPage = 0;
            hasMore = true;

            const scrollY = window.scrollY;

            document.querySelector('.all-product .product').innerHTML = '';

            loadAllProducts().then(() => {
                window.scrollTo({ top: scrollY });
            });
        });
    }

    // 무한 스크롤
    window.addEventListener('scroll', () => {
        if (isLoading || !hasMore) return;
        const scrollBottom = document.documentElement.scrollTop + window.innerHeight;
        const pageBottom = document.documentElement.scrollHeight - 200;
        if (scrollBottom >= pageBottom) {
            loadAllProducts();
        }
    });
});

// 베스트 상품 (5개)
function loadBestProducts(brand) {
    return fetch(`/shop/products/best?brand=${encodeURIComponent(brand)}&limit=5`)
        .then(res => res.json())
        .then(products => {
            renderProducts('.best-product .product', products, false);
        })
        .catch(error => {
            console.error('BEST 상품 로딩 실패:', error);
        });
}

// 전체 상품 (무한 스크롤)
function loadAllProducts() {
    if (isLoading || !hasMore) return Promise.resolve();
    isLoading = true;

    return fetch(`/shop/products?brand=${encodeURIComponent(currentBrand)}&sort=${currentSort}&page=${currentPage}&size=${PAGE_SIZE}`)
        .then(res => res.json())
        .then(products => {
            if (products.length < PAGE_SIZE) hasMore = false;
            renderProducts('.all-product .product', products, true);
            currentPage++;
        })
        .catch(error => {
            console.error('전체 상품 로딩 실패:', error);
        })
        .finally(() => {
            isLoading = false;
        });
}

// 상품 렌더링
function renderProducts(selector, products, append = false) {
    const container = document.querySelector(selector);
    if (!container) return;

    if (!products || products.length === 0) {
        if (!append) container.innerHTML = '<div class="empty">상품이 없습니다.</div>';
        return;
    }

    const html = products.map(product => {
        const discountedPrice = Math.floor(product.price * (100 - product.discountRate) / 100);
        const thumbnail = product.productImages?.find(img => img.isThumbnail) || product.productImages?.[0];
        const imageUrl = thumbnail?.imageUrl || '/shop/assets/images/default-product.png';

        return `
            <a class="item" href="/shop/product/${product.id}">
                <div class="image-wrapper">
                    <img class="image" src="${imageUrl}" alt="${product.name}">
                </div>
                <div class="brand">${product.brand}</div>
                <div class="name">${product.name}</div>
                ${product.discountRate > 0 ? `
                <div class="discount">
                    <div class="percent">${product.discountRate}%</div>
                    <div class="number">${product.price.toLocaleString()}원</div>
                </div>` : ''}
                <div class="price">${discountedPrice.toLocaleString()}원</div>
            </a>
        `;
    }).join('');

    if (append) {
        container.insertAdjacentHTML('beforeend', html);
    } else {
        container.innerHTML = html;
    }
}