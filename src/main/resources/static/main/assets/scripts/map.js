//공공 api 주소 위도 경도 변환기준
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");// WGS84 (GPS 좌표계)
proj4.defs("EPSG:5179", "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"); // UTM-K
proj4.defs("EPSG:5181", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs"); // KATEC
proj4.defs("EPSG:2097", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs"); // 중부원점 TM


//맵은 검색, 마커 추가 할때 등 여러가지로 쓰여서 전역변수로
let map;
let currentInfo = null; // 인포 마커 하나만 띄울거임
//검색마커
const markers = [];
//카테고리별 마커
const categoryMarkers = {
    hospital: [],   // 동물병원
    salon: [],      // 동물미용
    cafe: [],       // 동물동반카페
    search: []       //검색
};

let activeCategory = null; // 지도를 로드하자마자 카테고리는 아무것도 선택되어 있지 않음.
let geocoder; // 주소나 장소 이름과 같은 텍스트 기반의 위치 정보를 위도(Latitude)와 경도(Longitude) 좌표로 변환해 주는 서비스


//1. 지도 생성 초기화 페이지가 열릴때 돔 생성 (html 로드 다 되고 난후에 할 수 잇도록 먼저 하면  null 오류남)
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            handleCategoryClick(category);
        });
    });
    kakao.maps.load(initMap);
});

//지도 초기화
function initMap() {
    const container = document.getElementById('map');

    const options = {
        /*지도 최초 중심 좌표 (서울 시청)*/
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 4 // 숫자가 낮아질수록 가까움
    };

    map = new kakao.maps.Map(container, options);
    // ✅ 현재 위치 표시 추가
    getCurrentLocation();

    kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
        const lat = mouseEvent.latLng.getLat();
        const lng = mouseEvent.latLng.getLng();

        geocoder.coord2Address(lng, lat, (result, status) => {
            let address = '주소 정보 없음';

            if (status === kakao.maps.services.Status.OK) {
                const roadAddr = result[0].road_address?.address_name;
                const jibunAddr = result[0].address?.address_name;
                address = roadAddr || jibunAddr || address;
            }

            // 👉 네가 만든 단일 마커 함수 사용
            addMarker(lat, lng, '선택한 위치', address);
        });
    });
    geocoder = new kakao.maps.services.Geocoder();
    // 지도 생성 후 검색 이벤트 바인딩
    bindSearch();
}

//현재위치 띄우는 코드
function getCurrentLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            const locPosition = new kakao.maps.LatLng(lat, lng);

            // 기존 단일 마커 시스템 활용
            addMarker(lat, lng, '현재 위치', '내 위치');
            map.setCenter(locPosition);
        },
        error => {
            console.warn("위치 정보를 가져오지 못했습니다.", error);
        }
    );
}


//특정 카테고리를 선택하면 이미지 마커를 화면에 만들거임
function getMarkerImage(category) {
    //서치는 기본 이미지
    if (category === 'search') return null;

    const imageSrcMap = {
        hospital: '/main/assets/images/hospital-red.png',
        cafe: '/main/assets/images/cafe-red.png',
        salon: '/main/assets/images/salons.png'
    };

    const imageSize = new kakao.maps.Size(24, 24);
    const imageOption = {offset: new kakao.maps.Point(18, 36)};
    const imageSrc = imageSrcMap[category]
    if (!imageSrc) return null

    return new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
}


function buildMarker({position, name, address, tel, category, single = false}) {
    const marker = new kakao.maps.Marker({
        position,
        image: !single ? getMarkerImage(category) || undefined : undefined
    });

    const infowindow = new kakao.maps.InfoWindow({
        content: `
        <div style="
            padding:0.75rem 0.9rem;
            width:14rem;
            font-family:'Malgun Gothic', sans-serif;
            font-size:0.85rem;
            line-height:1.5;
            color:#222;
            box-sizing:border-box;
        ">
            <div style="font-size:1rem;font-weight:700;margin-bottom:0.4rem;">
                📍 ${name}
            </div>
            <div style="margin-bottom:0.3rem;color:#555;">
                ${address}
            </div>
            ${tel ? `<div style="color:#007aff;font-weight:500;">📞 ${tel}</div>` : ''}
        </div>
        `,
        removable: true
    });

    kakao.maps.event.addListener(marker, 'click', () => {
        if (currentInfo) currentInfo.close();
        infowindow.open(map, marker);
        currentInfo = infowindow;
    });

    return marker;
}

function normalizePlaceData(place, category) {
    // ① 공공데이터 API 형식
    if (place.BPLC_NM) {
        return {
            name: place.BPLC_NM,
            address: place.ROAD_NM_ADDR || place.LOTNO_ADDR || '주소 정보 없음',
            tel: place.TELNO || '',
            category
        };
    }

    // ② 카카오 검색 결과 형식
    if (place.place_name) {
        return {
            name: place.place_name,
            address: place.road_address_name || place.address_name || '주소 정보 없음',
            tel: place.phone || '',
            category
        };
    }

    return null;
}


function createMarker({position, name, address, tel, category}) {
    const marker = buildMarker({
        position,
        name,
        address,
        tel,
        category,
        single: category === 'search' // 검색은 기본 마커
    });

    categoryMarkers[category] = categoryMarkers[category] || [];
    categoryMarkers[category].push(marker);

    // **지도에 올리는 조건**
    if (activeCategory === category || category === 'search') {
        marker.setMap(map);
    }
}

function addApiMarkers(items, category) {
    items.forEach(place => {
        const address = place.ROAD_NM_ADDR || place.LOTNO_ADDR;
        if (!address) return;

        geocoder.addressSearch(address, (result, status) => {
            if (status !== kakao.maps.services.Status.OK) return;

            const position = new kakao.maps.LatLng(result[0].y, result[0].x);
            const data = normalizePlaceData(place, category);
            if (!data) return;

            createMarker({
                position,
                ...data
            });
        });
    });
}

function addSearchMarkers(places) {
    clearCategory('search');

    const bounds = new kakao.maps.LatLngBounds();

    places.forEach(place => {
        const position = new kakao.maps.LatLng(place.y, place.x);
        const data = normalizePlaceData(place, 'search');
        if (!data) return;

        createMarker({
            position,
            ...data
        });

        bounds.extend(position);
    });

    map.setBounds(bounds);
}


function addMarker(lat, lng, title = '선택한 위치', address = '') {
    if (markers.length) {
        markers[0].setMap(null);
        markers.length = 0;
    }

    const position = new kakao.maps.LatLng(lat, lng);

    const marker = buildMarker({
        position,
        name: title,
        address: address || '좌표 위치',
        tel: '',
        single: true   // 기본 카카오 마커 사용
    });

    marker.setMap(map);
    markers.push(marker);
}


//카카오맵은 한 번 만든 마커가 자동으로 사라지지 않기 때문에 반드시 이런 정리 로직이 필요함
function clearCategory(category) {
    /*존재하지 않는 카테고리면 함수 실행 중단 -> 함수실행 중단 안하고 실행하면 밑에서 foreach 만나면 오류터짐*/
    if (!categoryMarkers[category]) return;

    categoryMarkers[category].forEach(marker => marker.setMap(null));
    categoryMarkers[category] = [];
}

//카테고리버튼(병원 미용실 카페 ) 선택하면 가장 먼저 실행되는 함수
async function handleCategoryClick(category) {
    //활성화된 카테고리가 지금 카테고리
    activeCategory = category;

    // 모든 버튼 active 제거 후 현재 버튼만 활성화
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.category-btn[data-category="${category}"]`)?.classList.add('active');
    // 다른 카테고리 마커 제거 - 지도에는 항상 하나의 카테고리만 보이게 유지
    Object.keys(categoryMarkers).forEach(key => {
        if (key !== category) clearCategory(key);
    });
    // 카테고리별 분기
    if (category === 'hospital') {
        await showCategory('hospital');
    } else if (category === 'salon') {
        await showCategory('salon')
    }
}

async function showCategory(category) {
    activeCategory = category;


    // 🔥 검색으로 찍은 단일 마커 제거
    if (markers.length) {
        markers.forEach(m => m.setMap(null));
        markers.length = 0;
    }


    if (categoryMarkers[category].length > 0) {
        categoryMarkers[category].forEach(m => m.setMap(map));
        return;
    }

    const data = await fetchCategoryData(category);
    let items = data.response.body.items.item;
    if (!Array.isArray(items)) items = [items];

    for (const place of items) {
        await new Promise(resolve => {
            getPosition(place, position => {
                if (position) {
                    const data = normalizePlaceData(place, category);
                    if (data) {
                        createMarker({
                            position,
                            ...data
                        });
                    }
                }
                setTimeout(resolve, 150);
            });
        });
    }
}


/*공공 API TM 좌표 → LatLng 변환 후 → fitMapToLatLngs
  카카오 장소검색 API → fitMapToMarkers*/
function fitMapToLatLngs(position) {
    const bounds = new kakao.maps.LatLngBounds();
    position.forEach(pos => bounds.extend(pos));
    map.setBounds(bounds);
}

function fitMapToMarkers(places) {
    const bounds = new kakao.maps.LatLngBounds();

    places.forEach(place => {
        bounds.extend(new kakao.maps.LatLng(place.y, place.x));
    });
    map.setBounds(bounds);
}

//전체 초기화용 선택된거빼고가 아니라 전체 초기화용임
function clearAllCategories() {
    Object.keys(categoryMarkers).forEach(key => clearCategory(key));
}

//한국의 범위 안에 드는지 lat = 위도, lng 경도
function isValidKoreaCoord(lat, lng) {
    return lat >= 33 && lat <= 39.5 && lng >= 124 && lng <= 132;
}

//api 에 나온 값이 존재하면 1-1 tryConvert 함수 호출해서 값 변환
//없다면 1-2 searchAddress 로 넘어가서 갑 찾음 플랜b (searchAddress)
function getPosition(place, callback) {
    const x = parseFloat(place.CRD_INFO_X);
    const y = parseFloat(place.CRD_INFO_Y);

    // 1️좌표값 존재하면 변환 시도
    if (!isNaN(x) && !isNaN(y) && x !== 0 && y !== 0) {
        const latlng = tryConvert(x, y);
        if (latlng) {
            callback(latlng);
            return;
        }
        console.log("TM 좌표 변환 실패 → 주소 검색 전환:", place.BPLC_NM);
    }

    // 2️ 주소 검색
    searchAddress(place, callback);
}

//공공데이터 CRD_INFO_X,CRD_INFO_Y 이 값들을 다양한 기준좌표들로 조건에 맞는지 보고 위도 경도 변환
function tryConvert(x, y) {
    const epsgList = ['EPSG:5179', 'EPSG:5181', 'EPSG:2097'];

    for (const epsg of epsgList) {
        const [lng, lat] = proj4(epsg, 'EPSG:4326', [x, y]);

        if (!isNaN(lat) && !isNaN(lng) && isValidKoreaCoord(lat, lng)) {
            console.log("좌표 변환 성공:", epsg, lat, lng);
            return new kakao.maps.LatLng(lat, lng);
        }
    }
    return null;
}

//도로명 주소, 지번주소로 위도 경도 찍음
function searchAddress(place, callback) {
    const roadAddr = cleanAddress(place.ROAD_NM_ADDR);
    const jibunAddr = cleanAddress(place.LOTNO_ADDR);

    if (roadAddr) {
        geocoder.addressSearch(roadAddr, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                callback(new kakao.maps.LatLng(result[0].y, result[0].x));
            } else if (jibunAddr) {
                geocoder.addressSearch(jibunAddr, (result2, status2) => {
                    if (status2 === kakao.maps.services.Status.OK) {
                        callback(new kakao.maps.LatLng(result2[0].y, result2[0].x));
                    } else {
                        console.log("주소검색 최종 실패:", place.BPLC_NM, roadAddr, "/", jibunAddr);
                        callback(null);
                    }
                });
            } else {
                console.log("주소검색 실패(지번 없음):", place.BPLC_NM, roadAddr);
                callback(null);
            }
        });
    } else if (jibunAddr) {
        geocoder.addressSearch(jibunAddr, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                callback(new kakao.maps.LatLng(result[0].y, result[0].x));
            } else {
                console.log("주소검색 실패:", place.BPLC_NM, jibunAddr);
                callback(null);
            }
        });
    } else {
        callback(null);
    }
}

//카카오 지도는 구체적인 장소 안 좋아함 카카오 주소검색은 "건물 주소"까지만 좋아함
// 아래가 붙으면 성공률 급락함:
// , 1,2,4층 ← 층 정보 ❌,(황학동) ← 괄호 동 정보 ❌,상가명 / 병원명 ❌
// 즉 “부가 설명” 때문에 검색 실패 하는 것. 이걸 걸러주는 함수가 밑에  클린 어드레스
function cleanAddress(address) {
    if (!address) return '';

    return address
        .split('(')[0]          // 괄호 제거
        .split(',')[0]          // , 뒤 제거 (층수 등)
        .replace(/\s+/g, ' ')   // 공백 정리
        .trim();
}

//백에서 api가지고 있어서 요청하는 메서드 (백이랑 소통)
async function fetchCategoryData(category) {
    const res = await fetch(`/api/${category}`);
    if (!res.ok) throw new Error("서버 요청 실패");
    return await res.json();
}

function bindSearch() {
    const $search = document.getElementById('search');
    if (!$search) return;

    const $input = $search.querySelector('.search-input');
    const $button = $search.querySelector('.search-btn');

    const handleSearch = () => {
        const keyword = $input.value.trim();
        if (!keyword) return;

        const ps = new kakao.maps.services.Places();
        ps.keywordSearch(keyword, (places, status) => {
            if (status !== kakao.maps.services.Status.OK) return;

            // UI 초기화
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            clearAllCategories();
            activeCategory = 'search';

            // 마커 생성 & 지도 영역 맞춤
            const bounds = new kakao.maps.LatLngBounds();
            places.forEach(p => {
                const pos = new kakao.maps.LatLng(p.y, p.x);
                const data = normalizePlaceData(p, 'search')
                if (!data) return;
                createMarker({
                    position: pos,
                    name: p.place_name,
                    address: p.road_address_name,
                    tel: p.phone,
                    category: 'search'
                });
                bounds.extend(pos);
            });
            map.setBounds(bounds);
        });
    };

    $button.addEventListener('click', handleSearch);
    $input.addEventListener('keydown', e => e.key === 'Enter' && handleSearch());
}

/*리스트나 검색 결과에서 “이 장소로 이동” 기능을 구현할 때 딱 맞는 함수*/
function moveToLocation(lat, lng) {
    addMarker(lat, lng);
    map.setCenter(new kakao.maps.LatLng(lat, lng));
}


window.addEventListener('resize', () => {
    setTimeout(() => {
        map.relayout();
    }, 100);
});





