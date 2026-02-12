let map;
let geocoder;
let currentInfo = null;

// 단일 클릭 마커
const markers = [];

// 카테고리 마커
const categoryMarkers = {
    hospital: [],
    salon: [],
    cafe: [],
    search: []
};

let activeCategory = null;

// 현재 위치
let currentLat = null;
let currentLng = null;

//지도 마크 누르면 장소 탭에 상세 정보 나오게 뷰가 변할 수 있도록 전역변수, 리스트는 그장소 리스트 디테일은 장소 하나 누르면 상세 페이지
let viewMode = 'list'; // 'list' | 'detail'
let selectedPlace = null;


let currentPlaces = [];



/* ================= 초기화 ================= */

window.addEventListener('DOMContentLoaded', () => {
    kakao.maps.load(initMap);

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleCategoryClick(btn.dataset.category);
        });
    });

    bindDistanceFilter();
});

/* ================= 데이터 정규화 ================= */

function normalizePlaceData(place, category) {

    // 공공데이터
    if (place.bizplc_NM) {
        return {
            name: place.bizplc_NM,
            address: place.road_NM_ADDR || '주소 정보 없음',
            tel: place.telno || '',
            status: place.sals_STTS_NM || '상태 정보 없음', // 기본 상태 영업으로 ?
            lat: place.lat,
            lng: place.lng,
            category
        };
    }

    // 카카오 검색
    if (place.place_name) {
        return {
            name: place.place_name,
            address: place.road_address_name || place.address_name,
            tel: place.phone || '',
            lat: Number(place.y),
            lng: Number(place.x),
            category
        };
    }

    return null;
}

/* ================= 지도 초기화 ================= */

function initMap() {
    const container = document.getElementById('map');

    map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(35.866082, 128.593806),
        level: 4
    });

    geocoder = new kakao.maps.services.Geocoder();

    getCurrentLocation();
    bindSearch();
    /*bindStoreListClick();*/

    kakao.maps.event.addListener(map, 'click', e => {
        const lat = e.latLng.getLat();
        const lng = e.latLng.getLng();

        geocoder.coord2Address(lng, lat, (result, status) => {
            let address = '주소 정보 없음';
            if (status === kakao.maps.services.Status.OK) {
                address =
                    result[0].road_address?.address_name ||
                    result[0].address?.address_name ||
                    address;
            }
            addSingleMarker(lat, lng, '선택한 위치', address);
        });
    });
}

/* ================= 마커 ================= */

function createMarker({position, name, address, tel, status, category}) {
    const marker = new kakao.maps.Marker({
        map,
        position
    });

    categoryMarkers[category].push(marker);

    const info = new kakao.maps.InfoWindow({
        content: `
        <div style="padding:0.75rem;width:14rem;font-size:0.85rem;">
            <div style="font-weight:700;margin-bottom:0.4rem;">📍 ${name}</div>
            <div style="color:#555;margin-bottom:0.3rem;">${address}</div>
            ${tel ? `<div style="color:#007aff;">📞 ${tel}</div>` : ''} ${status ? `
            <div style="color:${status === '폐업' ? '#ff3b30' : '#34c759'};">
                🕒 ${status}
            </div>` : ''
        }
 
        </div>
        `,
        removable: true
    });

    kakao.maps.event.addListener(marker, 'click', () => {
        if (currentInfo) currentInfo.close();
        info.open(map, marker);
        currentInfo = info;
        //
        switchView('detail', {
            name,
            address,
            tel,
            status,
            lat: position.getLat(),
            lng: position.getLng(),
            category,
            marker,
            info
        });

    });


    return {marker, info};
}
function bindSearch() {
    const input = document.getElementById('placeInput');
    const btn = document.querySelector('.search-btn');
    if (!input || !btn) {
        console.warn('검색 DOM 못 찾음');
        return;
    }

    const ps = new kakao.maps.services.Places();

    //  실제 검색 로직을 함수로 분리
    const doSearch = () => {
        const keyword = input.value.trim();
        if (!keyword) return;

        // 검색 시 카테고리 상태 해제
        activeCategory = null;
        document.querySelectorAll('.category-btn')
            .forEach(b => b.classList.remove('active'));

        // 기존 검색 마커 제거
        categoryMarkers.search.forEach(m => m.setMap(null));
        categoryMarkers.search = [];

        ps.keywordSearch(keyword, (data, status) => {
            if (status !== kakao.maps.services.Status.OK) return;

            const bounds = new kakao.maps.LatLngBounds();
            const places = [];

            data.forEach(place => {
                const normalized = normalizePlaceData(place, 'search');
                if (!normalized) return;

                let distanceKm = null;
                if (currentLat && currentLng) {
                    distanceKm = getDistanceKm(
                        currentLat,
                        currentLng,
                        normalized.lat,
                        normalized.lng
                    );
                }

                const position = new kakao.maps.LatLng(
                    normalized.lat,
                    normalized.lng
                );

                const { marker, info } = createMarker({
                    position,
                    ...normalized
                });

                bounds.extend(position);

                places.push({
                    ...normalized,
                    distanceKm,
                    marker,
                    info
                });
            });

            map.setBounds(bounds);
            renderStoreList(places);
        });
    };

    // 🔘 버튼 클릭
    btn.addEventListener('click', doSearch);

    // ⌨️ Enter 키
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault(); // form submit 방지
            doSearch();
        }
    });
}


function addSingleMarker(lat, lng, title, address) {
    markers.forEach(m => m.setMap(null));
    markers.length = 0;

    const marker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(lat, lng)
    });

    markers.push(marker);

    const info = new kakao.maps.InfoWindow({
        content: `
    <div style="
    padding: 0.3rem;
    font-size: 0.7rem;
    width: 100%;
    max-width: 400px;
    white-space: normal !important;
    overflow-wrap: break-word;
    word-break: break-word;
    ">
        <div style="font-weight:700;margin-bottom:0.4rem;">
            📍 ${title}
        </div>
       <div style="color:#555;">
    ${address}
</div>
    </div>
    `,
        removable:true
    });

    info.open(map, marker);
    currentInfo = info;
}

/* ================= 카테고리 ================= */

async function handleCategoryClick(category) {

    const btn = document.querySelector(`[data-category="${category}"]`);

    // 이미 선택된 카테고리면 OFF
    if (activeCategory === category) {
        clearCategory(category);
        btn?.classList.remove('active');
        activeCategory = null;
        return;
    }

    //  모든 버튼 active 해제
    document.querySelectorAll('.category-btn')
        .forEach(b => b.classList.remove('active'));

    // 현재 버튼 active 고정
    btn?.classList.add('active');

    activeCategory = category;

    clearAllCategories();
    await showCategory(category);
}

async function showCategory(category) {
    try {
        const res = await fetch(`/api/${category}`);
        const raw = await res.json();

        const list = Array.isArray(raw) ? raw : raw.results || [];
        const bounds = new kakao.maps.LatLngBounds();

        //  리스트 + 마커 연결용
        const visiblePlaces = [];

        list.forEach(item => {
            const data = normalizePlaceData(item, category);
            if (!data || !data.lat || !data.lng) return;
            //장소 리스트에 현재 위치 기준 거리 계산 넣기위해
            let distanceKm = null;
            // 반경 필터 (현재 위치 있을 때만)
            if (currentLat && currentLng) {
                distanceKm = getDistanceKm(
                    currentLat,
                    currentLng,
                    data.lat,
                    data.lng
                );
                if (distanceKm > 1.5) return;
            }

            const position = new kakao.maps.LatLng(data.lat, data.lng);

            //  마커 생성 + 반환 받기
            const {marker, info} = createMarker({
                position,
                ...data
            });

            bounds.extend(position);

            //  리스트에 쓸 데이터 (마커 연결)
            visiblePlaces.push({
                ...data,
                distanceKm,
                marker,
                info
            });
        });

        if (!bounds.isEmpty()) {
            map.setBounds(bounds);
        }

        //  리스트 렌더링
        renderStoreList(visiblePlaces);

    } catch (e) {
        console.error('showCategory 오류:', e);
    }
}
function bindDistanceFilter() {
    const filterBtn = document.getElementById('distanceFilterBtn');
    const filterMenu = document.getElementById('distanceFilterMenu');

    // 아직 DOM 없으면 그냥 종료
    if (!filterBtn || !filterMenu) return;

    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        filterMenu.classList.add('hidden');
    });

    filterMenu.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;

        const sortType = li.dataset.sort;
        sortPlaces(sortType);

        // 버튼 텍스트 변경
        filterBtn.textContent = `${li.textContent} ▾`;

        filterMenu.classList.add('hidden');
    });

}


/* ================= 유틸 ================= */

function clearCategory(category) {
    categoryMarkers[category].forEach(m => m.setMap(null));
    categoryMarkers[category] = [];
    if (currentInfo) currentInfo.close();
}

function clearAllCategories() {
    Object.keys(categoryMarkers).forEach(clearCategory);
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/* ================= 현재 위치 ================= */

function getCurrentLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(pos => {
        currentLat = pos.coords.latitude;
        currentLng = pos.coords.longitude;

        const latlng = new kakao.maps.LatLng(currentLat, currentLng);

        const marker = new kakao.maps.Marker({
            map,
            position: latlng
        });

        const info = new kakao.maps.InfoWindow({
            content: `
            <div style="padding:0.3rem;width:12rem;font-size:0.8rem;">
                <div style="font-weight:700;margin-bottom:0.4rem;">
                    📍 현재 위치
                </div>
                <div style="color:#555;">
                    지도 기준 현재 위치입니다.
                </div>
            </div>
            `,
            removable: true
        });

        // 클릭 이벤트 추가
        kakao.maps.event.addListener(marker, 'click', () => {
            if (currentInfo) currentInfo.close();
            info.open(map, marker);
            currentInfo = info;
        });

        // 최초 한 번은 열어두고 싶으면 ↓ 유지
        info.open(map, marker);
        currentInfo = info;

        map.setCenter(latlng);
    });
}

function sortPlaces(type) {
    if (!currentPlaces.length) return;

    const sorted = [...currentPlaces];

    if (type === 'near') {
        sorted.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    if (type === 'far') {
        sorted.sort((a, b) => (b.distanceKm ?? -Infinity) - (a.distanceKm ?? -Infinity));
    }

    renderStoreList(sorted);
}



function renderStoreList(places) {
    currentPlaces = [...places]; //정렬용 상태 저장
    const listEl = document.querySelector('.store-list');
    const countEl = document.querySelector('.result-count');
    if (!listEl) return;

    if(countEl){
        countEl.textContent = `총${places.length}개`
    }

    listEl.innerHTML = '';

    places.forEach(place => {
        const li = document.createElement('li');
        li.className = 'item';

        li.innerHTML = `
            <div class="item-wrapper">
                <div class="text-wrapper">
                    <div class="nickname">${place.name}</div>
                    <div class="address">주소: ${place.address}</div>
                    ${place.tel ? `<div class="phone">전화: ${place.tel}</div>` : ''}
                   
                </div>
            </div>
        `;

        li.addEventListener('click', () => {
            // 1. 이전 상태 정리
            if (currentInfo) currentInfo.close();
            clearActiveList();

            // 2. 지도 & 마커
            map.panTo(place.marker.getPosition());
            place.info.open(map, place.marker);
            currentInfo = place.info;

            // 3. 리스트 active 표시
            li.classList.add('active');

            currentPlace = place;
            switchView('detail', place);
        });


        listEl.appendChild(li);
    });
}

function switchView(mode, place = null) {
    const listView = document.querySelector('.place-list-view');
    const detailView = document.querySelector('.place-detail-view');

    viewMode = mode;

    if (mode === 'detail' && place) {

        // 여기서 거리 없으면 계산
        if (place.distanceKm == null && currentLat && currentLng) {
            place.distanceKm = getDistanceKm(
                currentLat,
                currentLng,
                place.lat,
                place.lng
            );
        }

        selectedPlace = place;

        listView.classList.add('hidden');
        detailView.classList.remove('hidden');

        renderPlaceDetail(place);
    }

    if (mode === 'list') {
        selectedPlace = null;

        detailView.classList.add('hidden');
        listView.classList.remove('hidden');
    }
}

function getWalkMinutes(distanceKm) {
    if (distanceKm == null) return null;
    return Math.max(1, Math.round((distanceKm / 4) * 60));
}

//장소탭 아이템 리스트 렌더링
function renderPlaceDetail(place) {
    const el = document.querySelector('.place-detail-content');
    if (!el) return;

    let distanceText = '거리 정보 없음';
    let timeText = '';

    if (place.distanceKm != null) {
        distanceText =
            place.distanceKm < 1
                ? `${Math.round(place.distanceKm * 1000)}m`
                : `${place.distanceKm.toFixed(1)}km`;

        const min = getWalkMinutes(place.distanceKm);
        timeText = ` · 도보 ${min}분`;
    }

    el.innerHTML = `
        <h2 class="name">${place.name}</h2>
        <div class="distance">📍 ${distanceText}${timeText}</div>

        <p><strong>주소</strong><br>${place.address}</p>

        ${place.tel ? `<p><strong>전화</strong><br>${place.tel}</p>` : ''}

        ${place.status ? `
            <p>
                <strong>영업 상태</strong><br>
                ${place.status}
            </p>
        ` : ''}

        ${place.category !== 'search' ? `
            <button class="reserve-btn">예약하기</button>
        ` : ''}
    `;
}
//탭 거리순 필터
const filterBtn = document.getElementById('distanceFilterBtn');
const filterMenu = document.getElementById('distanceFilterMenu');

filterBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    filterMenu.classList.toggle('hidden');
});
document.addEventListener('click', () => {
    filterMenu.classList.add('hidden');
});
filterMenu.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    const sortType = li.dataset.sort;
    sortPlaces(sortType);

    filterMenu.classList.add('hidden');
});



//클릭되면 이벤트 주는 함수
function clearActiveList() {
    document
        .querySelectorAll('.store-list .item.active')
        .forEach(el => el.classList.remove('active'));
}





