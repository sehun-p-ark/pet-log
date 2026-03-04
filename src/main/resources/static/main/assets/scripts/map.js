let map;
let geocoder;
let currentInfo = null;

//현재 마커 + 인포
let currentLocationMarker = null;
let currentLocationInfo = null;

let isMarkerClick = false;

let selectedMarker = null;  // 지도에 남아 있는 단 하나의 선택 마커

// ================== 선택 마커만 지도 표시 ==================
function selectSingleMarker(marker, info) {
    // 이전 선택 마커 제거
    if (selectedMarker && selectedMarker !== marker) {
        selectedMarker.setMap(null);
    }

    // 현재 마커 지도에 표시
    marker.setMap(map);
    selectedMarker = marker;

    // 인포윈도우 처리
    if (currentInfo) currentInfo.close();
    info.open(map, marker);
    currentInfo = info;
}

// 단일 클릭 마커
const markers = [];

const categoryMarkers = {
    hospital: [],
    salon: [],
    cafe: [],
    school: [],
    park: [],
    camp: [],
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


function clearActiveList() {
    document
        .querySelectorAll('.store-list .item.active')
        .forEach(el => el.classList.remove('active'));
}


/* ================= 초기화 ================= */

window.addEventListener('DOMContentLoaded', () => {
    //... 버튼
    const moreBtn = document.getElementById('moreCategoryBtn');
//..누르면 나타나게 하는 카테고리들
    const moreCategory = document.getElementById('moreCategory');

    if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moreCategory.classList.remove('hidden')
            moreCategory.classList.toggle('open');

        });
    }
    kakao.maps.load(initMap);

    document.querySelectorAll('.category-btn').forEach(btn => {
        const category = btn.dataset.category;
        if (!category) return; // ← 이거 추가


        btn.addEventListener('click', () => {
            handleCategoryClick(btn.dataset.category);
        });
    });

    bindDistanceFilter();
    loadNearbyFriendsByCurrentLocation();
});

/* ================= 데이터 정규화 ================= */
function normalizePlaceData(place, category) {

    // DB에서 오는 store 처리
    if (place.storeName && place.addressPrimary && place.lat != null && place.lng != null) {
        return {
            name: place.storeName,
            address: place.addressSecondary
                ? place.addressPrimary + ' ' + place.addressSecondary
                : place.addressPrimary,
            tel: place.phone || '',
            status: '영업 중',  // 기본값
            lat: place.lat,
            lng: place.lng,
            category,
            storeId: place.storeId,
        };
    }

    // 기존 처리
    if (place.name && place.address && place.lat != null && place.lng != null) {
        return {
            name: place.name,
            address: place.address,
            tel: place.tel || '',
            status: place.status || '영업 중',
            lat: place.lat,
            lng: place.lng,
            category,
            storeId: place.storeId,
        };
    }

    // 공공데이터
    if (place.bizplc_NM) {
        return {
            name: place.bizplc_NM,
            address: place.road_NM_ADDR || '주소 정보 없음',
            tel: place.telno || '',
            status: place.sals_STTS_NM || '상태 정보 없음',
            lat: place.lat,
            lng: place.lng,
            category,
            storeId: place.storeId,
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
// ✅ 주석 제거하고 아래로 교체
    window.addEventListener('resize', () => {
        if (map) map.relayout();
    });

    window.addEventListener('pageshow', () => {
        if (map) {
            setTimeout(() => {
                map.relayout();
                if (currentLat && currentLng) {
                    map.setCenter(new kakao.maps.LatLng(currentLat, currentLng));
                }
            }, 300);  // 100 → 300ms로 여유있게
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && map) {
            setTimeout(() => map.relayout(), 300);
        }
    });


    // 화면 리사이즈 시에도 relayout
    window.addEventListener('resize', () => {
        if (map) {
            map.relayout();
        }
    });


    kakao.maps.event.addListener(map, 'click', e => {

        if (isMarkerClick) {
            isMarkerClick = false; // 🔥 초기화
            return;
        }


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

// ================== 마커 생성 ==================




// createMarker 함수 수정

function createMarker({position, name, address, category}) {
    // image 옵션을 넣지 않으면 카카오 맵 기본 마커가 사용됩니다.
    const marker = new kakao.maps.Marker({
        map,
        position,
        category
    });

    const info = new kakao.maps.InfoWindow({
        content: `
        <div style="padding:0.75rem;width:14rem;font-size:0.85rem;">
            <div style="font-weight:700;margin-bottom:0.4rem;">📍 ${name}</div>
            <div style="color:#555;margin-bottom:0.3rem;">${address}</div>
        </div>`,
        removable: true
    });

    if (category && categoryMarkers[category]) {
        categoryMarkers[category].push(marker);
    }


    kakao.maps.event.addListener(marker, 'click', () => {
        if (currentInfo) currentInfo.close();
        info.open(map, marker);
        currentInfo = info;
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
        //  현재 위치 마커 제거
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

                const {marker, info} = createMarker({
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

    //  버튼 클릭
    btn.addEventListener('click', doSearch);

    // Enter 키
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault(); // form submit 방지
            doSearch();
        }
    });
}

function addSingleMarker(lat, lng, title, address) {
    const position = new kakao.maps.LatLng(lat, lng);

    // 기존 선택 마커가 있으면 제거
    if (selectedMarker) {
        selectedMarker.setMap(null);
    }
    const markerImageSrc = '/main/assets/images/currentMarker.png';
    const markerImageSize = new kakao.maps.Size(32, 32);
    const markerImageOption = {offset: new kakao.maps.Point(16, 32)};
    const customMarkerImage = new kakao.maps.MarkerImage(markerImageSrc, markerImageSize, markerImageOption);
    // 새 마커 생성
    const marker = new kakao.maps.Marker({
        position,
        map, // 바로 지도에 올림
        image: customMarkerImage

    });

    const info = new kakao.maps.InfoWindow({
        content: `<div style="padding:0.75rem;width:14rem;font-size:0.85rem;">
                    <div style="font-weight:700;margin-bottom:0.4rem;">📍 ${title}</div>
                    <div style="color:#555;">${address}</div>
                  </div>`
    });

    // 클릭 시 선택 마커 처리
    kakao.maps.event.addListener(marker, 'click', () => {
        selectSingleMarker(marker, info);
    });

    // 현재 선택 마커 업데이트
    selectedMarker = marker;
    if (currentInfo) currentInfo.close();
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

function convertAddressToLatLng(address, callback) {
    if (!geocoder) {
        console.error("Geocoder가 초기화되지 않았습니다.");
        return;
    }

    geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
            const lat = Number(result[0].y);
            const lng = Number(result[0].x);
            callback({ lat, lng });
        } else {
            console.error("주소 변환 실패:", status);
            callback(null);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('storeRegisterBtn'); // 가게 등록 버튼
    submitBtn?.addEventListener('click', (e) => {
        e.preventDefault();

        const addressPrimary = document.querySelector('#addressPrimary').value;
        const addressSecondary = document.querySelector('#addressSecondary').value;
        const fullAddress = addressSecondary
            ? `${addressPrimary} ${addressSecondary}`
            : addressPrimary;

        convertAddressToLatLng(fullAddress, ({lat, lng}) => {
            if (!lat || !lng) {
                alert('주소 변환에 실패했습니다.');
                return;
            }

            console.log('위도:', lat, '경도:', lng);

            // 여기서 form에 hidden input 추가
            document.querySelector('#lat').value = lat;
            document.querySelector('#lng').value = lng;

            // 폼 전송
            document.querySelector('#storeForm').submit();
        });
    });
});

async function showCategory(category) {
    try {

        let list = [];

        // 1️병원
        if (category === 'hospital') {
            const res = await fetch('/api/hospital');
            list = await res.json();
        }

        // 2️미용실
        else if (category === 'salon') {
            const res = await fetch('/api/salon');
            list = await res.json();
        }

        // 3️ 나머지는 store 테이블
        else {
            const res = await fetch(`/api/stores?category=${encodeURIComponent(category)}`);
            list = await res.json();
        }

        console.log("카테고리", category, "데이터:", list);

        renderPlaces(list, category);

    } catch (e) {
        console.error('showCategory 오류:', e);
    }
}

function renderPlaces(list, category) {

    const bounds = new kakao.maps.LatLngBounds();
    const visiblePlaces = [];

    list.forEach(item => {
        const data = normalizePlaceData(item, category);
        if (!data || !data.lat || !data.lng) return;

        let distanceKm = null;
        if (currentLat && currentLng) {
            distanceKm = getDistanceKm(
                currentLat,
                currentLng,
                data.lat,
                data.lng
            );
            const radiusMap = {
                hospital: 3,
                salon: 3,
                cafe: 3,
                school: 3,
                park: 3,
                camp: 15,
            };
            const maxDistance = radiusMap[category] ?? 3;

            if (distanceKm > maxDistance) return;
        }

        const position = new kakao.maps.LatLng(data.lat, data.lng);
        const { marker, info } = createMarker({ position, ...data });

        bounds.extend(position);
        visiblePlaces.push({ ...data, distanceKm, marker, info });
    });

    if (!bounds.isEmpty()) {
        map.setBounds(bounds);
    }

    renderStoreList(visiblePlaces);
}

function bindDistanceFilter() {
    const filterBtn = document.getElementById('distanceFilterBtn');
    const filterMenu = document.getElementById('distanceFilterMenu');

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

        // 클릭 시 버튼 텍스트 변경
        filterBtn.textContent = `${li.textContent} ▾`;

        // 거리 계산 후 정렬
        currentPlaces.forEach(place => {
            if (place.distanceKm == null && currentLat != null && currentLng != null) {
                place.distanceKm = getDistanceKm(currentLat, currentLng, place.lat, place.lng);
            }
        });

        sortPlaces(sortType);
        filterMenu.classList.add('hidden');
    });
}

// DOM 준비 후 실행
window.addEventListener('DOMContentLoaded', () => {
    bindDistanceFilter();
});

//선택 전용 함수
function selectPlace(place) {

    //  이전 선택 복구
    if (selectedPlace && selectedPlace.marker) {
        selectedPlace.marker.setImage(defaultMarkerImage);
    }

    //  이전 인포 닫기
    if (currentInfo) {
        currentInfo.close();
        currentInfo = null;
    }

    //  현재 선택 저장
    selectedPlace = place;

    //  선택 아이콘 적용
    place.marker.setImage(selectedMarkerImage);

    //  인포 열기
    place.info.open(map, place.marker);
    currentInfo = place.info;

    map.panTo(place.marker.getPosition());
}


/* ================= 유틸 ================= */
function clearCategory(category) {
    categoryMarkers[category].forEach(m => {
        m.setMap(null); // ✅ 추가
    });
    categoryMarkers[category] = [];
    if (currentInfo) {
        currentInfo.close();
        currentInfo = null; // ✅ 추가
    }
}

function clearAllCategories() {
    Object.keys(categoryMarkers).forEach(clearCategory);
}

//장소필터 가까운순 먼순 거리 계산 함수
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

// 다른곳 선택되면 현재위치 지우는 함수
function removeCurrentLocation() {
    if (currentLocationMarker) {
        currentLocationMarker.setMap(null);
        currentLocationMarker = null;
    }
    if (currentLocationInfo) {
        currentLocationInfo.close();
        currentLocationInfo = null;
    }
}

// ================== 현재 위치 ==================
function getCurrentLocation() {
    if (!navigator.geolocation) {
        console.log('geolocation 지원 안함');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            currentLat = pos.coords.latitude;
            currentLng = pos.coords.longitude;

            const latlng = new kakao.maps.LatLng(currentLat, currentLng);

            // 기존 현재위치 마커 제거
            if (currentLocationMarker) {
                currentLocationMarker.setMap(null);
            }
            const markerImageSrc = '/main/assets/images/currentMarker.png';
            const markerImageSize = new kakao.maps.Size(32, 32);
            const markerImageOption = {offset: new kakao.maps.Point(16, 32)};
            const customMarkerImage = new kakao.maps.MarkerImage(markerImageSrc, markerImageSize, markerImageOption);
            currentLocationMarker = new kakao.maps.Marker({
                map,
                position: latlng,
                image: customMarkerImage // 내 위치도 바꾼 이미지로!
            });

            // 주소 가져오기
            geocoder.coord2Address(currentLng, currentLat, (result, status) => {
                let address = '주소 정보 없음';
                if (status === kakao.maps.services.Status.OK) {
                    address =
                        result[0].road_address?.address_name ||
                        result[0].address?.address_name ||
                        address;
                }

                currentLocationInfo = new kakao.maps.InfoWindow({
                    content: `<div style="padding:0.3rem;width:12rem;font-size:0.8rem;">
                                <div style="font-weight:700;margin-bottom:0.4rem;">📍 현재 위치</div>
                                <div style="color:#555;">${address}</div>
                              </div>`
                });
            });

            kakao.maps.event.addListener(currentLocationMarker, 'click', () => {
                if (currentInfo) currentInfo.close();
                currentLocationInfo.open(map, currentLocationMarker);
                currentInfo = currentLocationInfo;
            });

            map.setCenter(latlng);
        },
        err => {
            console.log('위치 실패:', err);
        }
    );
}


// ====================== 장소 상세 렌더링 ======================
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
    // 예: 서버에서 내려오는 JSON이 snake_case라면
    console.log(place.store_id);  // 21
    el.innerHTML = `
  <h2 class="name">${place.name}</h2>
  <div class="distance">📍 ${distanceText}${timeText}</div>

  <p><strong>주소</strong><br>${place.address}</p>

  ${place.tel ? `<p><strong>전화</strong><br>${place.tel}</p>` : ''}
  ${place.status ? `<p><strong>영업 상태</strong><br>${place.status}</p>` : ''}
  <p><strong>영업 시간</strong><br>평일 09:00 - 18:00</p> 
  ${place.category !== 'search' && place.category !== 'park' && place.category !== 'camp' ? `<button class="reserve-btn" data-store-id="${place.storeId}">예약하기</button>` : ''}
`;
}
//주변 친구 불러오기 함수
function loadNearbyFriendsByCurrentLocation() {

    if (!navigator.geolocation) {
        console.log("geolocation 지원 안함");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        fetch(`/api/friends/nearby?lat=${lat}&lng=${lng}`)
            .then(res => res.json())
            .then(data => {
                renderFriendList(data);
            })
            .catch(err => console.error("친구 불러오기 실패:", err));

    }, err => {
        console.log("위치 권한 거부:", err);
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

    currentPlaces = [...places];

    const listEl = document.querySelector('.store-list');
    const countEl = document.querySelector('.result-count');
    if (!listEl) return;

    if (countEl) {
        countEl.textContent = `총 ${places.length}개`;
    }

    listEl.innerHTML = '';

    places.forEach(place => {

        const li = document.createElement('li');
        li.className = 'item';
        /*이건 장소 리스트 하나 만드는거  -> 이거클릭하면 디테일 뷰 열림*/
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
            clearActiveList();
            li.classList.add('active');

            // 선택 마커 하나만 남기기
            selectSingleMarker(place.marker, place.info);

            switchView('detail', place);
        });


        listEl.appendChild(li);
    });
}

//화면 모드(리스트 하나 누르면 장소 상세설명으로 )전환을 담당하는 상태 관리 함수
function switchView(mode, place = null) {
    const listView = document.querySelector('.place-list-view');
    const detailView = document.querySelector('.place-detail-view');
    const backBtn = document.querySelector('.back-btn')


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


// ====================== 예약 시간 생성 ======================
function generateReserveTime() {
    const select = document.getElementById('reserveTime');
    if (!select) return;

    select.innerHTML = '';

    for (let hour = 9; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            if (hour === 18 && minute > 0) break;
            const option = document.createElement('option');
            const time =
                hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0');
            option.value = time;
            option.textContent = time;
            select.appendChild(option);
        }
    }
}

// ====================== DOMContentLoaded ======================
window.addEventListener('DOMContentLoaded', () => {

    // ----- 뒤로가기 버튼 -----
    const backBtn = document.getElementById('placeBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            switchView('list');
        });
    }

// ----- 예약 모달 관련 수정 코드 -----
    const modal = document.getElementById('reserveModal');
    if (modal) {
        document.addEventListener('click', async (e) => {
            const reserveBtn = e.target.closest('.reserve-btn');
            if (reserveBtn) {
                // 1. 버튼에서 storeId 추출
                const storeId = reserveBtn.dataset.storeId;
                if (!storeId) {
                    alert('가게 정보가 없습니다.');
                    return;
                }

                // [수정] selectedPlace를 덮어씌우지 말고 storeId만 업데이트하거나
                // 현재 활성화된 selectedPlace에 id를 병합합니다.
                if(selectedPlace) {
                    selectedPlace.storeId = storeId;
                }

                // 2. 모달 텍스트 세팅 (선택된 장소 정보 활용)
                const modalTitle = modal.querySelector('.modal-title');
                const modalAddr = modal.querySelector('.modal-address');
                if (modalTitle) modalTitle.innerText = selectedPlace?.name || '장소명 없음';
                if (modalAddr) modalAddr.innerText = selectedPlace?.address || '주소 정보 없음';

                // 3. confirm 버튼에 ID 확실히 박기
                const confirmBtn = modal.querySelector('.btn.confirm');
                if (confirmBtn) {
                    confirmBtn.dataset.storeId = storeId;
                    console.log("전송 준비된 storeId:", storeId);
                }

                resetModalInputs();
                generateReserveTime();
                modal.classList.add('open');
                return;
            }

            // 모달 닫기 로직은 동일...
            if (e.target.closest('#reserveModal .close-btn') || e.target.closest('#reserveModal .cancel') || e.target === modal) {
                modal.classList.remove('open');
                return;
            }
        });


        // ----- 예약 확정 버튼 리스너 -----
        const confirmBtn = modal.querySelector('.btn.confirm');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                const dateInput = document.getElementById('reserveDate');
                const timeSelect = document.getElementById('reserveTime');
                const requestInput = document.getElementById('reserveRequest');

                // 모달 제목과 주소에서 텍스트 직접 추출
                const pName = modal.querySelector('.modal-title')?.innerText || '';
                const pAddr = modal.querySelector('.modal-address')?.innerText || '';

                if (!dateInput.value || !timeSelect.value) {
                    alert('날짜와 시간을 선택해주세요.');
                    return;
                }

                // Dataset에서 최신 ID 가져오기
                const rawStoreId = confirmBtn.dataset.storeId;

                // 숫자가 아니거나 "null" 같은 문자열이면 null로 처리해서 서버에 보냄
                const storeId = (rawStoreId && !isNaN(rawStoreId) && rawStoreId !== "null" && rawStoreId !== "undefined")
                    ? parseInt(rawStoreId)
                    : null;

                const payload = {
                    storeId: storeId, // 여기가 null이면 서버가 '신규 등록 대상'으로 판단함
                    placeName: selectedPlace?.name || "",
                    address: selectedPlace?.address || "",
                    category: Array.isArray(selectedPlace?.category)
                        ? selectedPlace.category.join(',')
                        : (selectedPlace?.category || 'hospital,salon'),
                    reservationDate: document.getElementById('reserveDate').value,
                    reservationTime: document.getElementById('reserveTime').value,
                    requestText: document.getElementById('reserveRequest').value,
                    paymentMethod: 'OFFLINE'
                };


                try {
                    const res = await fetch('/reservation/create', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(payload),
                    });

                    if (res.ok) {
                        modal.classList.remove('open');

                        showMessage(' 예약이 성공적으로 완료되었습니다.');
                    }

                } catch (err) {
                    console.error("Fetch 에러:", err);
                    showMessage({
                        text: '서버와의 통신 중 오류가 발생했습니다.'
                    });
                }
            });
        }

        // ----- 모달 input 리셋 함수 -----
        function resetModalInputs() {
            const dateInput = modal.querySelector('#reserveDate');
            const timeSelect = modal.querySelector('#reserveTime');
            const requestInput = modal.querySelector('#reserveRequest');

            if (dateInput) dateInput.value = '';
            if (timeSelect) timeSelect.selectedIndex = 0;
            if (requestInput) requestInput.value = '';
        }
    }

    // ----- 거리순 필터 바인딩 -----
    bindDistanceFilter(); // 중복 제거
});

function renderFriendList(friends) {
    const listEl = document.getElementById('friendList');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!friends || friends.length === 0) {
        listEl.innerHTML = '<li class="empty">주변에 친구가 없습니다.</li>';
        return;
    }

    friends.forEach(friend => {
        const li = document.createElement('li');
        li.className = 'item';
        const imageUrl = friend.imageUrl || '/images/defaultPetImage.png';
        const genderText =
            friend.gender === 'MALE' ? '남아' :
             friend.gender === 'FEMALE' ? '여아' : '';

        li.innerHTML = `
            <div class="item-wrapper"
                 data-user-id="${friend.userId}"
                 data-pet-name="${friend.petName ?? ''}" 
                 data-birth="${friend.birthDate ?? ''}"
                 data-gender="${genderText ?? ''}"
                 data-introduction="${friend.introduction ?? ''}">
                <div class="image"><img src="${imageUrl}"></div>
                <div class="text-wrapper">
                    <div class="nickname">${friend.nickname ?? '이름 없음'}</div>
                    <div class="species">${friend.species ?? '정보 없음'}</div>
                    <div class="distance">📍 ${Number(friend.distance).toFixed(1)}km</div>
                </div>
                <button class="button ${friend.isFollowing ? 'following' : 'follow'}" data-user-id="${friend.userId}">
                    ${friend.isFollowing ? '팔로잉' : '팔로우'}
                </button>
            </div>
        `;
        listEl.appendChild(li);
    });
}

