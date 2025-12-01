const CONFIG = {
    KEY: "d9bcf0f46267209781891852f9db1df7cfec4267d0380ca1a9fa8f91f112facd",
    API_URL: "https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2",
};

const state = {
    pageNo: 1,
    numOfRows: 8,
    sidoCode: "",
    sigunguCode: ""
};

// 데이터 캐싱
let currentAnimals = [];

// 시/도 데이터
const SIDO_DATA = [
    { code: "6110000", name: "서울특별시" },
    { code: "6260000", name: "부산광역시" },
    { code: "6270000", name: "대구광역시" },
    { code: "6280000", name: "인천광역시" },
    { code: "6290000", name: "광주광역시" },
    { code: "6300000", name: "대전광역시" },
    { code: "6310000", name: "울산광역시" },
    { code: "6410000", name: "경기도" },
    { code: "6420000", name: "강원도" },
    { code: "6500000", name: "제주특별자치도" },
    { code: "6430000", name: "충청북도" },
    { code: "6440000", name: "충청남도" },
    { code: "6450000", name: "전라북도" },
    { code: "6460000", name: "전라남도" },
    { code: "6470000", name: "경상북도" },
    { code: "6480000", name: "경상남도" },
    { code: "6510000", name: "세종특별자치시" }
];

// 구/군 데이터
const BACKUP_SIGUNGU = {
    "6110000": [{ code: "3220000", name: "강남구" }, { code: "3240000", name: "강동구" }, { code: "3080000", name: "강북구" }, { code: "3150000", name: "강서구" }, { code: "3200000", name: "관악구" }, { code: "3040000", name: "광진구" }, { code: "3160000", name: "구로구" }, { code: "3170000", name: "금천구" }, { code: "3100000", name: "노원구" }, { code: "3090000", name: "도봉구" }, { code: "3050000", name: "동대문구" }, { code: "3190000", name: "동작구" }, { code: "3130000", name: "마포구" }, { code: "3120000", name: "서대문구" }, { code: "3210000", name: "서초구" }, { code: "3030000", name: "성동구" }, { code: "3070000", name: "성북구" }, { code: "3230000", name: "송파구" }, { code: "3140000", name: "양천구" }, { code: "3180000", name: "영등포구" }, { code: "3020000", name: "용산구" }, { code: "3110000", name: "은평구" }, { code: "3000000", name: "종로구" }, { code: "3010000", name: "중구" }, { code: "3060000", name: "중랑구" }],
    "6260000": [{ code: "3250000", name: "강서구" }, { code: "3350000", name: "금정구" }, { code: "3400000", name: "기장군" }, { code: "3290000", name: "남구" }, { code: "3270000", name: "동구" }, { code: "3300000", name: "동래구" }, { code: "3320000", name: "부산진구" }, { code: "3330000", name: "북구" }, { code: "3360000", name: "사상구" }, { code: "3340000", name: "사하구" }, { code: "3260000", name: "서구" }, { code: "3370000", name: "수영구" }, { code: "3380000", name: "연제구" }, { code: "3280000", name: "영도구" }, { code: "3250000", name: "중구" }, { code: "3310000", name: "해운대구" }]
};

document.addEventListener('DOMContentLoaded', () => {
    renderSearchUI();

    document.getElementById('sido-select').addEventListener('change', updateSigungu);
    document.getElementById('search-btn').addEventListener('click', searchAnimals);
    document.getElementById('load-more-btn').addEventListener('click', () => fetchAnimals());

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    });
});

function renderSearchUI() {
    const wrapper = document.querySelector('.search-wrapper');
    const sidoOptions = SIDO_DATA.map(sido =>
        `<option value="${sido.code}">${sido.name}</option>`
    ).join('');

    wrapper.innerHTML = `
        <select id="sido-select" aria-label="시/도 선택">
            <option value="">시/도 선택</option>
            ${sidoOptions}
        </select>
        <select id="sigungu-select" disabled aria-label="구/군 선택">
            <option value="">구/군 전체</option>
        </select>
        <button id="search-btn">조회하기</button>
    `;
}

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

function searchAnimals() {
    state.sidoCode = document.getElementById('sido-select').value;
    state.sigunguCode = document.getElementById('sigungu-select').value;

    if (!state.sidoCode) {
        alert("시/도를 먼저 선택해주세요!");
        return;
    }

    state.pageNo = 1;
    currentAnimals = [];
    document.getElementById('animal-cards-container').innerHTML = "";
    document.getElementById('load-more-btn').style.display = 'none';

    fetchAnimals();
}

async function fetchAnimals() {
    const container = document.getElementById('animal-cards-container');
    const loadingMessage = document.getElementById('loading-message');
    const loadMoreBtn = document.getElementById('load-more-btn');

    loadingMessage.style.display = 'block';

    try {
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        const endde = now.toISOString().slice(0, 10).replace(/-/g, "");
        const bgnde = threeMonthsAgo.toISOString().slice(0, 10).replace(/-/g, "");

        let queryParams = `?serviceKey=${CONFIG.KEY}&_type=json&pageNo=${state.pageNo}&numOfRows=${state.numOfRows}&state=protect&bgnde=${bgnde}&endde=${endde}&upr_cd=${state.sidoCode}`;
        if (state.sigunguCode) queryParams += `&org_cd=${state.sigunguCode}`;

        const targetUrl = `${CONFIG.API_URL}${queryParams}`;
        const response = await fetch(targetUrl);

        if (!response.ok) throw new Error("네트워크 응답 실패");

        const textData = await response.text();
        let data;
        try { data = JSON.parse(textData); } catch (e) { throw new Error("JSON 파싱 실패"); }

        if (!data.response || !data.response.body) throw new Error("데이터 구조 이상");
        const items = data.response.body.items.item;

        loadingMessage.style.display = 'none';

        if (!items) {
            if (state.pageNo === 1) container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;">조건에 맞는 아이들이 없습니다.</div>`;
            else alert("마지막 페이지입니다.");
            return;
        }

        const newItems = Array.isArray(items) ? items : [items];
        const startIndex = currentAnimals.length;
        currentAnimals = [...currentAnimals, ...newItems];

        let htmlBuffer = "";

        newItems.forEach((animal, i) => {
            const globalIndex = startIndex + i;
            const kind = animal.kindCd.replace('[개] ', '').replace('[고양이] ', '');
            let showImg = animal.popfile1 || animal.filename1 || '';
            if (!showImg) showImg = 'https://placehold.co/300x200?text=No+Image';

            // ⚡ [TBT 개선] decoding="async" 추가
            // 이미지를 디코딩하는 작업을 메인 스레드가 아닌 백그라운드에서 처리하게 하여
            // 페이지가 멈칫하는 현상(Blocking)을 방지합니다.
            htmlBuffer += `
                <div class="card" onclick='openModal(${globalIndex})'> 
                    <img src="${showImg}" 
                         alt="${kind}" 
                         decoding="async"
                         referrerpolicy="no-referrer"
                         width="300" height="200"
                         style="width: 100%; height: 200px; object-fit: cover;" 
                         loading="lazy"
                         onerror="this.src='https://placehold.co/300x200?text=Error';">
                    <div class="card-body">
                        <h3 style="color:#C62828; margin-top:5px;">${kind}</h3>
                        <div class="card-info" style="font-size:0.9em; color:#555;">
                            📍 ${animal.happenPlace}<br>📅 ${animal.happenDt}
                        </div>
                    </div>
                </div>
            `;
        });

        requestAnimationFrame(() => {
            container.insertAdjacentHTML('beforeend', htmlBuffer);
            state.pageNo++;
            loadMoreBtn.style.display = "inline-block";
        });

    } catch (error) {
        loadingMessage.style.display = 'none';
        console.error(error);
        if (state.pageNo === 1) alert("데이터를 불러오는데 실패했습니다.");
    }
}

function openModal(index) {
    const animalData = currentAnimals[index];
    if (!animalData) return;

    const modal = document.getElementById('animal-modal');
    const modalImg = document.getElementById('modal-animal-img');
    const extraDiv = document.getElementById('modal-extra-details');
    const moreBtn = document.getElementById('modal-more-btn');
    const inquiryBtn = document.getElementById('modal-inquiry-btn');

    const sexStr = animalData.sexCd === 'M' ? '수컷' : (animalData.sexCd === 'F' ? '암컷' : '미상');
    const neuter = animalData.neuterYn === 'Y' ? '완료' : (animalData.neuterYn === 'N' ? '아니오' : '미상');

    const extraContent = `
        <p><strong>성별:</strong> ${sexStr}</p>
        <p><strong>중성화:</strong> ${neuter}</p>
        <p><strong>특징:</strong> ${animalData.specialMark}</p>
        <p><strong>보호장소:</strong> ${animalData.careAddr}</p>
    `;
    const imgUrl = animalData.popfile2 || animalData.filename2 || 'https://placehold.co/600x400';

    requestAnimationFrame(() => {
        modalImg.src = imgUrl;
        modalImg.alt = `${animalData.kindCd} 상세 이미지`;
        // 모달 이미지는 중요하므로 즉시 디코딩하지 않고 브라우저에게 맡김 (기본값)

        document.getElementById('modal-animal-kind').textContent = animalData.kindCd;
        document.getElementById('modal-age').textContent = `나이: ${animalData.age} / 체중: ${animalData.weight}`;
        document.getElementById('modal-date').textContent = `접수일: ${animalData.happenDt}`;
        document.getElementById('modal-contact-info').innerHTML = `보호소: ${animalData.careNm}<br>전화: ${animalData.officetel}`;

        if (animalData.officetel) {
            inquiryBtn.href = `tel:${animalData.officetel}`;
            inquiryBtn.style.display = 'inline-block';
        } else {
            inquiryBtn.style.display = 'none';
        }

        extraDiv.innerHTML = extraContent;
        extraDiv.style.display = 'none';
        moreBtn.textContent = '상세정보 더보기 👇';

        modal.style.display = 'block';
    });

    moreBtn.onclick = function () {
        const isHidden = extraDiv.style.display === 'none';
        requestAnimationFrame(() => {
            extraDiv.style.display = isHidden ? 'block' : 'none';
            this.textContent = isHidden ? '상세정보 접기 👆' : '상세정보 더보기 👇';
        });
    };
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

// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const registerSW = () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => console.log('✅ ServiceWorker 등록:', registration.scope))
                .catch(error => console.log('❌ ServiceWorker 실패:', error));
        };
        if ('requestIdleCallback' in window) {
            requestIdleCallback(registerSW);
        } else {
            registerSW();
        }
    });
}

window.addEventListener('pageshow', (event) => {
    // event.persisted가 true면 bfcache(뒤로가기 캐시)에서 복원된 것임
    if (event.persisted) {
        console.log('⚡ 페이지가 bfcache에서 복원되었습니다.');
        // 모달이 열려있었다면 닫아주어 깨끗한 상태로 복원
        const modal = document.getElementById('animal-modal');
        if (modal && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }
});
