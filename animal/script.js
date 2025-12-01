// script.js 전체 교체

const CONFIG = {
    KEY: "d9bcf0f46267209781891852f9db1df7cfec4267d0380ca1a9fa8f91f112facd",
    API_URL: "https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2",
    PROXY_URL: "https://api.allorigins.win/raw?url="
};

// 상태 관리
const state = {
    pageNo: 1,
    numOfRows: 8,
    sidoCode: "",
    sigunguCode: ""
};

// 🚀 데이터 캐시 (속도 향상 핵심)
const dataCache = {};

// 구/군 데이터
const BACKUP_SIGUNGU = {
    "6110000": [{ code: "3220000", name: "강남구" }, { code: "3240000", name: "강동구" }, { code: "3080000", name: "강북구" }, { code: "3150000", name: "강서구" }, { code: "3200000", name: "관악구" }, { code: "3040000", name: "광진구" }, { code: "3160000", name: "구로구" }, { code: "3170000", name: "금천구" }, { code: "3100000", name: "노원구" }, { code: "3090000", name: "도봉구" }, { code: "3050000", name: "동대문구" }, { code: "3190000", name: "동작구" }, { code: "3130000", name: "마포구" }, { code: "3120000", name: "서대문구" }, { code: "3210000", name: "서초구" }, { code: "3030000", name: "성동구" }, { code: "3070000", name: "성북구" }, { code: "3230000", name: "송파구" }, { code: "3140000", name: "양천구" }, { code: "3180000", name: "영등포구" }, { code: "3020000", name: "용산구" }, { code: "3110000", name: "은평구" }, { code: "3000000", name: "종로구" }, { code: "3010000", name: "중구" }, { code: "3060000", name: "중랑구" }],
    "6260000": [{ code: "3250000", name: "강서구" }, { code: "3350000", name: "금정구" }, { code: "3400000", name: "기장군" }, { code: "3290000", name: "남구" }, { code: "3270000", name: "동구" }, { code: "3300000", name: "동래구" }, { code: "3320000", name: "부산진구" }, { code: "3330000", name: "북구" }, { code: "3360000", name: "사상구" }, { code: "3340000", name: "사하구" }, { code: "3260000", name: "서구" }, { code: "3370000", name: "수영구" }, { code: "3380000", name: "연제구" }, { code: "3280000", name: "영도구" }, { code: "3250000", name: "중구" }, { code: "3310000", name: "해운대구" }]
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 이벤트 리스너 등록
    document.getElementById('sido-select').addEventListener('change', updateSigungu);
    document.getElementById('search-btn').addEventListener('click', searchAnimals);
    document.getElementById('load-more-btn').addEventListener('click', () => fetchAnimals());
    
    // 모달 닫기
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // 모달 배경 클릭 닫기
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    });
});

// 구/군 목록 업데이트
function updateSigungu() {
    const sidoCode = document.getElementById('sido-select').value;
    const sigunguSelect = document.getElementById('sigungu-select');
    
    sigunguSelect.innerHTML = '<option value="">구/군 전체</option>';
    sigunguSelect.disabled = true;

    if (BACKUP_SIGUNGU[sidoCode]) {
        const fragment = document.createDocumentFragment();
        BACKUP_SIGUNGU[sidoCode].forEach(area => {
            const option = document.createElement('option');
            option.value = area.code;
            option.textContent = area.name;
            fragment.appendChild(option);
        });
        sigunguSelect.appendChild(fragment);
        sigunguSelect.disabled = false;
    }
}

// 조회 시작
function searchAnimals() {
    state.sidoCode = document.getElementById('sido-select').value;
    state.sigunguCode = document.getElementById('sigungu-select').value;

    if (!state.sidoCode) {
        alert("시/도를 먼저 선택해주세요!");
        return;
    }

    state.pageNo = 1;
    document.getElementById('animal-cards-container').innerHTML = "";
    document.getElementById('load-more-btn').style.display = 'none';
    
    // 새 검색시 캐시 초기화 (선택사항, 여기선 유지)
    fetchAnimals();
}

// 데이터 가져오기
async function fetchAnimals() {
    const container = document.getElementById('animal-cards-container');
    const loadingMessage = document.getElementById('loading-message');
    const loadMoreBtn = document.getElementById('load-more-btn');

    loadingMessage.style.display = 'block';
    loadMoreBtn.style.display = 'none';

    // 1. 캐시 키 생성
    const cacheKey = `${state.sidoCode}-${state.sigunguCode}-${state.pageNo}`;

    try {
        let items;

        // 2. 캐시 확인: 이미 있는 데이터면 API 호출 안 함 (속도 최적화)
        if (dataCache[cacheKey]) {
            console.log("⚡ 캐시된 데이터 사용");
            items = dataCache[cacheKey];
        } else {
            // 3. API 호출
            const now = new Date();
            const past = new Date();
            past.setMonth(now.getMonth() - 3);
            
            const endde = now.toISOString().slice(0, 10).replace(/-/g, "");
            const bgnde = past.toISOString().slice(0, 10).replace(/-/g, "");

            let queryParams = `?serviceKey=${CONFIG.KEY}&_type=json&pageNo=${state.pageNo}&numOfRows=${state.numOfRows}&state=protect&bgnde=${bgnde}&endde=${endde}&upr_cd=${state.sidoCode}`;
            if (state.sigunguCode) queryParams += `&org_cd=${state.sigunguCode}`;

            const response = await fetch(`${CONFIG.PROXY_URL}${encodeURIComponent(CONFIG.API_URL + queryParams)}`);
            if (!response.ok) throw new Error("네트워크 오류");
            
            const textData = await response.text();
            const data = JSON.parse(textData);
            
            if (!data.response?.body?.items) {
                items = []; // 데이터 없음
            } else {
                items = data.response.body.items.item;
                if (!Array.isArray(items)) items = [items];
            }

            // 캐시에 저장
            dataCache[cacheKey] = items;
        }

        loadingMessage.style.display = 'none';

        if (!items || items.length === 0) {
            if (state.pageNo === 1) container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;">조건에 맞는 아이들이 없습니다.</div>`;
            else alert("마지막 페이지입니다.");
            return;
        }

        renderCards(items);
        state.pageNo++;
        loadMoreBtn.style.display = "inline-block";

    } catch (error) {
        loadingMessage.style.display = 'none';
        console.error(error);
        alert("데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
}

// 카드 렌더링
function renderCards(animalList) {
    const container = document.getElementById('animal-cards-container');
    let htmlBuffer = "";

    animalList.forEach(animal => {
        const kind = animal.kindCd.replace('[개] ', '').replace('[고양이] ', '');
        let showImg = animal.popfile1 || animal.filename1 || 'https://placehold.co/300x200?text=No+Image';

        // 데이터를 HTML 속성에 안전하게 넣기 위해 인코딩
        const safeData = encodeURIComponent(JSON.stringify(animal));

        htmlBuffer += `
            <div class="card" onclick="openModalFromStr('${safeData}')"> 
                <img src="${showImg}" alt="${kind}" loading="lazy" onerror="this.src='https://placehold.co/300x200?text=Error';">
                <div class="card-body">
                    <h3>${kind}</h3>
                    <div class="card-info">
                        📍 ${animal.happenPlace}<br>📅 ${animal.happenDt}
                    </div>
                </div>
            </div>
        `;
    });
    container.insertAdjacentHTML('beforeend', htmlBuffer);
}

// 문자열로 된 데이터를 객체로 변환해 모달 열기 (HTML onclick 연동용)
function openModalFromStr(dataStr) {
    const data = JSON.parse(decodeURIComponent(dataStr));
    openModal(data);
}

function openModal(animalData) {
    const modal = document.getElementById('animal-modal');
    
    // 이미지
    const modalImg = document.getElementById('modal-animal-img');
    modalImg.src = animalData.popfile2 || animalData.filename2 || 'https://placehold.co/600x400';
    
    // 텍스트 정보
    document.getElementById('modal-animal-kind').textContent = animalData.kindCd;
    document.getElementById('modal-age').textContent = `나이: ${animalData.age} / 체중: ${animalData.weight}`;
    document.getElementById('modal-date').textContent = `접수일: ${animalData.happenDt}`;
    document.getElementById('modal-contact-info').innerHTML = `보호소: ${animalData.careNm}<br>전화: ${animalData.officetel}`;
    
    // 버튼 링크
    const btn = document.getElementById('modal-inquiry-btn');
    if (animalData.officetel) {
        btn.href = `tel:${animalData.officetel}`;
        btn.style.display = 'inline-block';
    } else {
        btn.style.display = 'none';
    }

    // 상세 정보 (성별, 중성화)
    const extraDiv = document.getElementById('modal-extra-details');
    const moreBtn = document.getElementById('modal-more-btn');
    
    const sexStr = animalData.sexCd === 'M' ? '수컷' : (animalData.sexCd === 'F' ? '암컷' : '미상');
    const neuter = animalData.neuterYn === 'Y' ? '완료' : (animalData.neuterYn === 'N' ? '아니오' : '미상');

    extraDiv.innerHTML = `
        <p><strong>성별:</strong> ${sexStr}</p>
        <p><strong>중성화:</strong> ${neuter}</p>
        <p><strong>특징:</strong> ${animalData.specialMark}</p>
        <p><strong>보호장소:</strong> ${animalData.careAddr}</p>
    `;
    
    // 초기화
    extraDiv.style.display = 'none';
    moreBtn.textContent = '상세정보 더보기 👇';
    moreBtn.onclick = function() {
        const isHidden = extraDiv.style.display === 'none';
        extraDiv.style.display = isHidden ? 'block' : 'none';
        this.textContent = isHidden ? '상세정보 접기 👆' : '상세정보 더보기 👇';
    };

    modal.style.display = 'block';
}

// MBTI 기능
function openMbtiModal() { document.getElementById('mbti-modal').style.display = 'block'; }
function closeMbtiModal() {
    document.getElementById('mbti-modal').style.display = 'none';
    document.getElementById('mbti-step-1').style.display = 'block';
    document.getElementById('mbti-result').style.display = 'none';
}
function nextMbti(step, type) {
    document.getElementById('mbti-step-1').style.display = 'none';
    document.getElementById('mbti-result').style.display = 'block';
    const text = document.getElementById('mbti-result-text');
    text.innerHTML = type === 'active' ? "🐶 활발한 믹스견!" : "🐱 조용한 고양이!";
}
