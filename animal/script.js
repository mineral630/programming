const SERVICE_KEY = "d9bcf0f46267209781891852f9db1df7cfec4267d0380ca1a9fa8f91f112facd";
const API_URL_ANIMAL = "https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2";

let pageNo = 1;
const numOfRows = 8;

// ✅ 구/군 백업 데이터
const BACKUP_SIGUNGU = {
    "6110000": [{ code: "3220000", name: "강남구" }, { code: "3240000", name: "강동구" }, { code: "3080000", name: "강북구" }, { code: "3150000", name: "강서구" }, { code: "3200000", name: "관악구" }, { code: "3040000", name: "광진구" }, { code: "3160000", name: "구로구" }, { code: "3170000", name: "금천구" }, { code: "3100000", name: "노원구" }, { code: "3090000", name: "도봉구" }, { code: "3050000", name: "동대문구" }, { code: "3190000", name: "동작구" }, { code: "3130000", name: "마포구" }, { code: "3120000", name: "서대문구" }, { code: "3210000", name: "서초구" }, { code: "3030000", name: "성동구" }, { code: "3070000", name: "성북구" }, { code: "3230000", name: "송파구" }, { code: "3140000", name: "양천구" }, { code: "3180000", name: "영등포구" }, { code: "3020000", name: "용산구" }, { code: "3110000", name: "은평구" }, { code: "3000000", name: "종로구" }, { code: "3010000", name: "중구" }, { code: "3060000", name: "중랑구" }],
    "6260000": [{ code: "3250000", name: "강서구" }, { code: "3350000", name: "금정구" }, { code: "3400000", name: "기장군" }, { code: "3290000", name: "남구" }, { code: "3270000", name: "동구" }, { code: "3300000", name: "동래구" }, { code: "3320000", name: "부산진구" }, { code: "3330000", name: "북구" }, { code: "3360000", name: "사상구" }, { code: "3340000", name: "사하구" }, { code: "3260000", name: "서구" }, { code: "3370000", name: "수영구" }, { code: "3380000", name: "연제구" }, { code: "3280000", name: "영도구" }, { code: "3250000", name: "중구" }, { code: "3310000", name: "해운대구" }]
};

// ✅ 구/군 목록 가져오기 함수
async function getSigungu() {
    const sidoCode = document.getElementById('sido-select').value;
    const sigunguSelect = document.getElementById('sigungu-select');
    sigunguSelect.innerHTML = '<option value="">구/군 전체</option>';

    if (!sidoCode) { sigunguSelect.disabled = true; return; }
    sigunguSelect.disabled = true;

    try {
        if (BACKUP_SIGUNGU[sidoCode]) {
            BACKUP_SIGUNGU[sidoCode].forEach(area => {
                const option = document.createElement('option');
                option.value = area.code;
                option.text = area.name;
                sigunguSelect.add(option);
            });
            sigunguSelect.disabled = false;
        } else {
            sigunguSelect.disabled = false;
        }
    } catch (error) {
        sigunguSelect.disabled = false;
    }
}

// ✅ 조회하기 버튼
function searchAnimals() {
    const sidoCode = document.getElementById('sido-select').value;
    if (!sidoCode) { alert("시/도를 먼저 선택해주세요!"); return; }

    pageNo = 1;
    document.getElementById('animal-cards-container').innerHTML = "";
    document.getElementById('load-more-btn').style.display = 'none';

    fetchAnimals();
}

// ✅ 데이터 가져오기
async function fetchAnimals() {
    const container = document.getElementById('animal-cards-container');
    const loadingMessage = document.getElementById('loading-message');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const sidoCode = document.getElementById('sido-select').value;
    const sigunguCode = document.getElementById('sigungu-select').value;

    loadingMessage.style.display = 'block';

    try {
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        const endde = now.toISOString().slice(0, 10).replace(/-/g, "");
        const bgnde = threeMonthsAgo.toISOString().slice(0, 10).replace(/-/g, "");

        let queryParams = `?serviceKey=${SERVICE_KEY}&_type=json&pageNo=${pageNo}&numOfRows=${numOfRows}&state=protect&bgnde=${bgnde}&endde=${endde}&upr_cd=${sidoCode}`;
        if (sigunguCode) queryParams += `&org_cd=${sigunguCode}`;

        const targetUrl = `${API_URL_ANIMAL}${queryParams}`;

        // 🚀 [핵심 수정] CORS 에러를 피하기 위해 allorigins.win 사용
        // 이 친구는 Access-Control-Allow-Origin: * (모두 허용)을 해줍니다.
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("네트워크 응답 실패");

        const textData = await response.text();
        let data;
        try { data = JSON.parse(textData); } catch (e) { throw new Error("JSON 파싱 실패"); }

        if (!data.response || !data.response.body) throw new Error("데이터 구조 이상");
        const items = data.response.body.items.item;
        loadingMessage.style.display = 'none';

        if (!items) {
            if (pageNo === 1) container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;">조건에 맞는 아이들이 없습니다.</div>`;
            else alert("마지막 페이지입니다.");
            return;
        }

        const animalList = Array.isArray(items) ? items : [items];
        let htmlBuffer = "";

        // 이미지 처리: 순정 주소 + no-referrer
        animalList.forEach(animal => {
            const kind = animal.kindCd.replace('[개] ', '').replace('[고양이] ', '');

            // API가 주는 원본 주소 그대로 사용
            let showImg = animal.popfile1 || animal.filename1 || '';

            // 대체 이미지 (placehold.co 사용)
            if (!showImg) showImg = 'https://placehold.co/300x200?text=No+Image';

            htmlBuffer += `
                <div class="card" onclick='openModal(${JSON.stringify(animal)})'> 
                    <img src="${showImg}" 
                         alt="${kind}" 
                         referrerpolicy="no-referrer"
                         style="width: 100%; height: 200px; object-fit: cover;" 
                         loading="lazy"
                         onerror="this.src='https://placehold.co/300x200?text=Error';">
                    <div class="card-body">
                        <h3 style="color:#FF7043; margin-top:5px;">${kind}</h3>
                        <div class="card-info" style="font-size:0.9em; color:#666;">
                            📍 ${animal.happenPlace}<br>📅 ${animal.happenDt}
                        </div>
                    </div>
                </div>
            `;
        });

        container.insertAdjacentHTML('beforeend', htmlBuffer);

        pageNo++;
        loadMoreBtn.style.display = "inline-block";

    } catch (error) {
        loadingMessage.style.display = 'none';
        console.error(error);
        if (pageNo === 1) alert("데이터를 불러오는데 실패했습니다.");
    }
}

// 더보기 버튼
document.getElementById('load-more-btn').addEventListener('click', fetchAnimals);

// ✅ 모달 기능
const modal = document.getElementById('animal-modal');
const closeBtn = document.querySelector('.close-btn');

// script.js 의 openModal 함수 부분 교체

function openModal(animalData) {
    // 1. 이미지 처리
    let showImg = animalData.popfile2 || animalData.filename2;
    const modalImg = document.getElementById('modal-animal-img');
    modalImg.src = showImg;
    modalImg.referrerPolicy = "no-referrer";
    modalImg.onerror = function () { this.src = 'https://placehold.co/600x400?text=Error'; };

    // 2. 기본 정보 채우기
    document.getElementById('modal-animal-kind').textContent = animalData.kindCd;
    document.getElementById('modal-age').textContent = `나이: ${animalData.age} / 체중: ${animalData.weight}`;
    document.getElementById('modal-date').textContent = `접수일: ${animalData.happenDt}`;
    let sexStr = "미상"; 
    if (animalData.sexCd === 'M') {
        sexStr = "수컷";
    } else if (animalData.sexCd === 'F') {
        sexStr = "암컷";
    }
    document.getElementById('modal-sexCd').textContent = `성별: ${sexStr}`;
    
    const btn = document.getElementById('modal-inquiry-btn');
    if (animalData.officetel) {
        btn.href = `tel:${animalData.officetel}`;
        btn.style.display = 'inline-block';
    } else {
        btn.style.display = 'none';
    }

    // ⭐⭐⭐ 4. 더보기 버튼 및 상세 내용 처리 ⭐⭐⭐
    const moreBtn = document.getElementById('modal-more-btn');
    const extraDiv = document.getElementById('modal-extra-details');

    // [수정됨] 성별 한글 변환 로직 (M:수컷, F:암컷, U:미상)

    // 중성화 여부 변환
    const neuter = animalData.neuterYn === 'Y' ? '완료' : (animalData.neuterYn === 'N' ? '아니오' : '미상');
    
    // 상세 정보 HTML 구성
    extraDiv.innerHTML = `
        <p><strong>중성화:</strong> ${neuter}</p>
        <p><strong>특징:</strong> ${animalData.specialMark}</p>
        <p><strong>보호장소:</strong> ${animalData.careAddr}</p>
    `;

    // 초기화: 상세 내용은 숨기고, 버튼 텍스트 원상복구
    extraDiv.style.display = 'none';
    moreBtn.textContent = '상세정보 더보기 👇';

    // 버튼 클릭 이벤트
    moreBtn.onclick = function() {
        if (extraDiv.style.display === 'none') {
            extraDiv.style.display = 'block';
            this.textContent = '상세정보 접기 👆';
        } else {
            extraDiv.style.display = 'none';
            this.textContent = '상세정보 더보기 👇';
        }
    };

    // 5. 모달 띄우기
    modal.style.display = 'block';
}
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

// ✅ MBTI 기능
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