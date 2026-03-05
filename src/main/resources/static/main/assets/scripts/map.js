let map;
let geocoder;
let currentInfo = null;

let isPanning = false;

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


/* ================= 데이터 정규화 (주소 간소화 버전) ================= */
/* ================= 데이터 정규화 (최종 수정본) ================= */
function normalizePlaceData(place, category) {
    if (!place) return null;

    // 1. 주소 가공 함수 (기존 로직 유지)
    const simplifyAddress = (addr) => {
        if (!addr) return '주소 정보 없음';
        if (addr.includes('**')) return addr.split('**')[0].trim();
        return addr.split(' ').slice(0, 3).join(' ');
    };

    // 2. 카카오 키워드 검색 결과 (place.y, place.x 로 들어옴)
    // 검색 기능을 통해 들어온 데이터는 대부분 이 조건에 걸립니다.
    if (place.y && place.x) {
        return {
            name: place.place_name || place.name,
            address: simplifyAddress(place.road_address_name || place.address_name),
            tel: place.phone || '전화번호 없음',
            status: '정보 없음',
            lat: Number(place.y), // 카카오 API는 y가 위도(Lat)입니다.
            lng: Number(place.x), // 카카오 API는 x가 경도(Lng)입니다.
            category: category,
            storeId: place.id
        };
    }

    // 3. 직접 등록한 DB 데이터
    if (place.storeName || (place.lat != null && place.lng != null && place.storeId)) {
        return {
            name: place.storeName || place.name,
            address: simplifyAddress(place.addressPrimary || place.address),
            tel: place.storePhone || place.phone || place.tel || '전화번호 없음',
            status: '영업 중',
            lat: Number(place.lat),
            lng: Number(place.lng),
            category: category,
            storeId: place.storeId
        };
    }

    // 4. 공공데이터 API (bizplc_NM 필드가 있는 경우)
    if (place.bizplc_NM) {
        return {
            name: place.bizplc_NM,
            address: simplifyAddress(place.road_NM_ADDR || place.locplc_ASRV_ADDR),
            tel: '전화번호 없음',
            status: place.sals_STTS_NM || '정보 없음',
            lat: Number(place.lat),
            lng: Number(place.lng),
            category: category,
            storeId: place.storeId
        };
    }

    return null;
}

// ================== 현위치 버튼 ==================
// initMap() 함수 안에 추가하거나, DOMContentLoaded 이벤트에 추가

function bindCurrentLocationBtn() {
    const btn = document.querySelector('.map .button');  // "현위치" 버튼
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('위치 서비스를 지원하지 않는 브라우저입니다.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const latlng = new kakao.maps.LatLng(lat, lng);

                // 지도 중심을 현재 위치로 이동
                map.setCenter(latlng);
                map.setLevel(4); // 줌 레벨도 초기값으로 리셋 (선택)

                // currentLat/Lng 전역 변수도 동기화
                currentLat = lat;
                currentLng = lng;
            },
            err => {
                console.error('현위치 가져오기 실패:', err);
                alert('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });
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
    bindCurrentLocationBtn(); // ← 여기에 추가

    kakao.maps.event.addListener(map, 'center_changed', () => {
        const center = map.getCenter();
        currentLat = center.getLat();
        currentLng = center.getLng();
    });

    kakao.maps.event.addListener(map, 'idle', () => {
        const center = map.getCenter();
        currentLat = center.getLat();
        currentLng = center.getLng();

        if (isPanning) {
            isPanning = false;
            return;
        }

        if (activeCategory) {
            clearAllCategories();
            showCategory(activeCategory);
        }
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
        if (map) {map.relayout();}
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

/* ================= 검색 바인딩 수정본 ================= */
function bindSearch() {
    const input = document.getElementById('placeInput');
    const btn = document.querySelector('.search-btn');
    if (!input || !btn) return;

    const ps = new kakao.maps.services.Places();

    const doSearch = () => {
        const keyword = input.value.trim();
        if (!keyword) return;

        activeCategory = null;
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));

        // 기존 검색 마커 제거
        categoryMarkers.search.forEach(m => m.setMap(null));
        categoryMarkers.search = [];

        // 💡 중요: 현재 지도 중심 기준으로 검색 성능 향상
        const searchOptions = {
            location: map.getCenter(),
            radius: 10000, // 10km 반경 우선 검색
            sort: kakao.maps.services.SortBy.DISTANCE
        };

        ps.keywordSearch(keyword, (data, status) => {
                console.log("검색 상태:", status);
                console.log("검색 데이터:", data);
            if (status !== kakao.maps.services.Status.OK) {
                if (status === kakao.maps.services.Status.ZERO_RESULT) alert('검색 결과가 없습니다.');
                return;
            }

            const bounds = new kakao.maps.LatLngBounds();
            const places = [];

            data.forEach(place => {
                // 카카오 API 데이터(place.y, place.x)를 숫자로 강제 변환
                const lat = parseFloat(place.y);
                const lng = parseFloat(place.x);

                // 좌표가 유효하지 않으면 스킵
                if (isNaN(lat) || isNaN(lng)) return;

                const normalized = normalizePlaceData(place, 'search');
                if (!normalized) return;

                // 정규화된 데이터에 정확한 숫자 좌표 주입
                normalized.lat = lat;
                normalized.lng = lng;

                const position = new kakao.maps.LatLng(lat, lng);

                const {marker, info} = createMarker({
                    position,
                    ...normalized
                });

                // 💡 생성된 마커를 즉시 지도에 표시
                marker.setMap(map);

                let distanceKm = null;
                if (currentLat && currentLng) {
                    distanceKm = getDistanceKm(currentLat, currentLng, lat, lng);
                }

                bounds.extend(position);
                places.push({ ...normalized, distanceKm, marker, info });
            });

            // 💡 결과가 있을 때만 지도 범위 조정 및 레이아웃 갱신
            if (places.length > 0) {
                map.setBounds(bounds);
                // 지도가 하얗게 보일 때 강제로 다시 그리게 하는 명령어
                setTimeout(() => map.relayout(), 100);
            }

            renderStoreList(places);
        }, searchOptions);
    };

    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
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

    // 카테고리 클릭 시 탭 전환
    const storeTab = document.getElementById('storeTab');
    const friendTab = document.getElementById('friendTab');
    const friendContent = document.querySelector('.friend-tab-content');
    const storePanel = document.querySelector('.store-panel');

    if (storeTab && friendTab) {
        storeTab.classList.add('active');
        friendTab.classList.remove('active');
        friendContent?.classList.add('hidden');
        storePanel?.classList.remove('hidden');
    }

    const btn = document.querySelector(`[data-category="${category}"]`);

    // 이미 선택된 카테고리면 OFF
    if (activeCategory === category) {
        clearCategory(category);
        btn?.classList.remove('active');
        activeCategory = null;
        renderStoreList([]);
        switchView('list');
        return;
    }

    //  모든 버튼 active 해제
    document.querySelectorAll('.category-btn')
        .forEach(b => b.classList.remove('active'));

    // 현재 버튼 active 고정
    btn?.classList.add('active');

    activeCategory = category;

    switchView('list');

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

        // 1. 공공데이터/전용 API 호출
        if (category === 'hospital') {
            const res = await fetch('/api/hospital');
            list = await res.json();
        } else if (category === 'salon') {
            const res = await fetch('/api/salon');
            list = await res.json();
        }

        // 2.  내가 직접 DB에 넣은 데이터도 가져와서 합치기
        // (직접 등록한 데이터는 모두 /api/stores 에 카테고리별로 저장되어 있다고 가정)
        const dbRes = await fetch(`/api/stores?category=${encodeURIComponent(category)}`);
        const dbList = await dbRes.json();

        // 3. 두 리스트 합치기
        const combinedList = [...list, ...dbList];

        renderPlaces(combinedList, category);

    } catch (e) {
        console.error('showCategory 오류:', e);
    }
}

function renderPlaces(list, category) {
    const centerLat = currentLat;
    const centerLng = currentLng;

    const bounds = new kakao.maps.LatLngBounds();
    const visiblePlaces = [];

    list.forEach(item => {
        const data = normalizePlaceData(item, category);
        if (!data || !data.lat || !data.lng) return;

        let distanceKm = null;
        if (centerLat && centerLng) {
            distanceKm = getDistanceKm(centerLat, centerLng, data.lat, data.lng);
            const radiusMap = { hospital: 3, salon: 3, cafe: 3, school: 3, park: 3, camp: 15 };
            const maxDistance = radiusMap[category] ?? 3;
            if (distanceKm > maxDistance) return;
        }
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


        const position = new kakao.maps.LatLng(data.lat, data.lng);
        const { marker, info } = createMarker({ position, ...data });

        bounds.extend(position);
        visiblePlaces.push({ ...data, distanceKm, marker, info });
    });

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

            if (currentLocationMarker) {
                currentLocationMarker.setMap(null);  // ← CustomOverlay도 setMap(null) 됩니다
            }

            const markerContent = document.createElement("div");
            markerContent.classList.add("my-location-marker");

            currentLocationMarker = new kakao.maps.CustomOverlay({
                position: latlng,
                content: markerContent,
                map: map,
                yAnchor: 1,
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

                // 클릭 이벤트는 CustomOverlay는 카카오 이벤트 대신 DOM 이벤트 사용
                markerContent.addEventListener('click', () => {
                    if (currentInfo) currentInfo.close();
                    currentLocationInfo.open(map, new kakao.maps.Marker({ position: latlng }));
                    currentInfo = currentLocationInfo;
                });
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
    const container = document.getElementById('descriptionContainer');
    if (!container) return;

    container.innerHTML = `<div class="place description">
    <button type="button" class="close-btn" id="placeCloseBtn">X</button>
    <div class="caption-wrapper" style="margin-top:1rem;">
        <div><strong>장소명:</strong> ${place.name}</div>
        <div><strong>주소:</strong> ${place.address}</div>
        ${place.tel ? `<div><strong>전화:</strong> ${place.tel}</div>` : ''}
        ${place.distanceKm != null ? `<div><strong>거리:</strong> ${place.distanceKm < 1 ? Math.round(place.distanceKm*1000)+'m' : place.distanceKm.toFixed(1)+'km'}</div>` : ''}
        ${place.category !== 'search' && place.category !== 'park' && place.category !== 'camp'
        ? `<button class="reserve-btn" data-store-id="${place.storeId}">예약하기</button>`
        : ''}
    </div>
</div>`;

    container.querySelector('.close-btn').onclick = () => {
        container.style.display = "none";
        container.innerHTML = '';
        switchView('list');
    };
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
    const emptyEl = document.getElementById('storeEmpty');
    const storeListHeader = document.getElementById('listHeader');
    const listView = document.getElementById('placeListView');
    if (!listEl) return;

    if (countEl) {
        countEl.textContent = `총 ${places.length}개`;
    }

    if (places.length === 0) {
        emptyEl?.classList.remove('hidden');
        storeListHeader?.classList.add('hidden');
        listView?.classList.add('hidden');
    } else {
        emptyEl?.classList.add('hidden');
        storeListHeader?.classList.remove('hidden');
        listView?.classList.remove('hidden');
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
            if (li.classList.contains('active')) {
                li.classList.remove('active');
                if (currentInfo) currentInfo.close();
                switchView('list');
                return;
            }

            clearActiveList();
            li.classList.add('active');

            isPanning = true;
            if (currentInfo) currentInfo.close();
            place.info.open(map, place.marker);
            currentInfo = place.info;
            map.panTo(place.marker.getPosition());

            switchView('detail', place);
        });

        listEl.appendChild(li);
    });
}

//화면 모드(리스트 하나 누르면 장소 상세설명으로 )전환을 담당하는 상태 관리 함수
function switchView(mode, place = null) {
    const listView = document.querySelector('.place-list-view');
    const detailView = document.querySelector('.place-detail-view');
    const container = document.getElementById('descriptionContainer');

    viewMode = mode;

    if (mode === 'detail' && place) {
        if (place.distanceKm == null && currentLat && currentLng) {
            place.distanceKm = getDistanceKm(currentLat, currentLng, place.lat, place.lng);
        }
        selectedPlace = place;

        renderPlaceDetail(place);
        container.style.display = "block";
    }

    if (mode === 'list') {
        selectedPlace = null;
        container.style.display = "none";
        container.innerHTML = '';
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

        if (confirmBtn && confirmBtn.tagName !== 'A'){
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
               // 과거 시간 체크
                const selectedDateTime = new Date(`${dateInput.value}T${timeSelect.value}`);
                const now = new Date();
                if (selectedDateTime <= now) {
                    showMessage('예약 일시를 확인해주세요.');
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
                <button class="button ${friend.following ? 'following' : 'follow'}" data-user-id="${friend.userId}">
                    ${friend.following ? '팔로잉' : '팔로우'}
                </button>
            </div>
        `;
        listEl.appendChild(li);
    });
}

