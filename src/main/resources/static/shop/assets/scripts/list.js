// 서브카테고리 필터
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.sub-category-btn');
    if (btn && btn.dataset.url) {
        location.href = btn.dataset.url;
    }
});

// 무한 스크롤
const section = document.querySelector('.product-section');
const productGrid = document.querySelector('.product-section .product');
const sentinel = document.getElementById('scroll-sentinel');

let page = 1;
let loading = false;
let hasMore = section?.dataset.hasMore === 'true';

const params = {
    petType: section?.dataset.petType || '',
    category: section?.dataset.category || '',
    categoryId: section?.dataset.categoryId || '',
    subCategoryId: section?.dataset.subCategoryId || '',
    keyword: section?.dataset.keyword || '',
};

function buildUrl() {
    const query = new URLSearchParams();

    if (params.keyword) {
        query.set('keyword', params.keyword);
        if (params.petType) query.set('petType', params.petType);
        query.set('page', page);
        query.set('size', 20);
        return `/shop/products/search?${query.toString()}`;
    }

    if (params.petType) query.set('petType', params.petType);
    if (params.category) query.set('category', params.category);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.subCategoryId) query.set('subCategoryId', params.subCategoryId);
    query.set('page', page);
    query.set('size', 20);
    return `/shop/products?${query.toString()}`;
}

function createItem(product) {
    const item = document.createElement('div');
    item.className = 'item';
    item.dataset.productId = product.id;
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => location.href = `/shop/product/${product.id}`);

    const imageUrl = product.productImages?.length > 0
        ? product.productImages[0].imageUrl
        : '/shop/assets/images/default-product.png';

    let priceHtml = '';
    if (product.discountRate > 0) {
        const discounted = Math.floor(product.price * (100 - product.discountRate) / 100);
        priceHtml = `
            <div class="discount">
                <span class="percent">${product.discountRate}%</span>
                <span class="number">${product.price.toLocaleString()}원</span>
            </div>
            <div class="price">${discounted.toLocaleString()}원</div>
        `;
    } else {
        priceHtml = `<div class="price">${product.price.toLocaleString()}원</div>`;
    }
    item.innerHTML = `
    <div class="image-wrapper">
        <img class="image" src="${imageUrl}" alt="${product.name}">
    </div>
    <div class="brand">${product.brand || ''}</div>
    <div class="name">${product.name}</div>
    ${priceHtml}
    `;
    return item;
}

async function loadMore() {
    if (loading || !hasMore) return;
    loading = true;

    try {
        const res = await fetch(buildUrl());
        const data = await res.json();

        if (data.length === 0) {
            hasMore = false;
            return;
        }

        // 기존 "상품 없음" 메시지 제거
        productGrid.querySelector('div[style]')?.remove();

        data.forEach(product => {
            productGrid.appendChild(createItem(product));
        });

        page++;
        if (data.length < 20) hasMore = false;

    } catch (e) {
        console.error('상품 로딩 실패', e);
    } finally {
        loading = false;
    }
}

if (sentinel) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadMore();
    }, { threshold: 0.1 });

    observer.observe(sentinel);
}

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.main-category-btn');
    if (btn && btn.dataset.url) {
        location.href = btn.dataset.url;
    }
});