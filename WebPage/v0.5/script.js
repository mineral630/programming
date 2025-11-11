// --- 페이지 요소 가져오기 ---
const pageIndex = document.getElementById('page-index');
const pageChat = document.getElementById('page-chat');
const startBtn = document.getElementById('start-diagnose');
const backHome = document.getElementById('back-home');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// --- [추가] 모달 요소 가져오기 ---
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalContinueBtn = document.getElementById('modal-continue-btn');
const modalBackBtn = document.getElementById('modal-back-btn');

const apiKey = "AIzaSyDifmP_IukXalUMc0_Wt5_ma8NOEe66WHA";

// --- [추가] 기기별 주요 고장 원인 데이터 ---
const deviceSymptoms = {
  '스마트폰/태블릿': [
    '배터리 노화로 인한 급격한 방전',
    '백그라운드 앱 과다 실행으로 인한 속도 저하',
    '충전 단자 불량 또는 이물질',
    '디스플레이(액정) 내부 파손',
    '운영체제(OS) 업데이트 오류'
  ],
  '노트북': [
    '부팅 파일 손상 또는 윈도우 오류',
    '저장 공간(SSD/HDD) 부족으로 인한 속도 저하',
    '메모리(RAM) 부족 또는 접촉 불량',
    '발열 관리 불량 (먼지, 쿨링팬 고장)',
    '배터리 수명 종료 또는 어댑터 불량'
  ],
  '데스크탑': [
    '파워 서플라이(PSU) 전원 공급 불량',
    '메인보드 고장 또는 콘덴서 부풂',
    '운영체제 오류로 인한 블루스크린',
    '그래픽카드 드라이버 충돌 또는 고장',
    '하드디스크(HDD) 배드 섹터 발생'
  ],
  '모니터': [
    '케이블 연결 불량 (HDMI, DP)',
    '모니터 백라이트 고장 (화면 어두움)',
    'AD 보드 불량 (화면 깨짐, 색상 이상)',
    '전원 어댑터 불량 (전원 안 켜짐)',
    '그래픽카드 설정 또는 드라이버 문제'
  ],
  '이어폰/헤드폰': [
    '블루투스 페어링 오류 또는 연결 끊김',
    '한쪽 유닛 소리 안 들림 (내부 단선)',
    '충전 케이스(크래들) 접촉 불량',
    '배터리 방전 또는 노화',
    '이물질로 인한 스피커 막힘'
  ],
  '스마트워치': [
    '스마트폰과 블루투스 연결 해제',
    '배터리 급속 방전 (백그라운드 앱)',
    '각종 센서(심박수 등) 오류',
    '터치 스크린 반응 없음',
    '운영체제(OS) 동기화 오류'
  ],
  '즉시 진단': [
    '현재 겪고 있는 증상을 상세히 알려주세요.',
    '빠른 분석을 통해 핵심 원인을 파악합니다.'
  ],
  '맞춤 솔루션': [
    '사용 중인 기기 모델명을 알려주세요.',
    '상황에 맞는 단계별 해결책을 제시합니다.'
  ],
  '전문가 수준': [
    '오류 코드나 특정 증상을 알려주세요.',
    '심화된 기술 정보를 바탕으로 분석합니다.'
  ]
};

// --- [추가] 채팅 시작 시 사용할 현재 기기 이름 저장 변수 ---
let currentDeviceForChat = '';

// --- [수정] 챗봇 시작 함수 (모달 -> 챗봇) ---
function startChatting(deviceName) {
  // 1. 모달 숨기기
  modalOverlay.classList.add('hidden');
  
  // 2. 페이지 전환
  pageIndex.classList.add('hidden');
  pageChat.classList.remove('hidden');
  
  // 3. 채팅창 초기화 및 첫 메시지 설정
  chatMessages.innerHTML = ''; 
  const initialMsg = `안녕하세요! '${deviceName}'에 대해 무엇이 궁금하신가요? 구체적인 증상을 말씀해주세요.`;
  addMessage(initialMsg, 'assistant');
  chatInput.focus();
}

// '챗봇 시작하기' (일반) 버튼 리스너
startBtn.addEventListener('click', () => {
  // [수정] 바로 챗봇으로 가지 않고, '즉시 진단'으로 간주하여 모달을 띄웁니다.
  const deviceName = '즉시 진단';
  currentDeviceForChat = deviceName; // 현재 기기 이름 저장

  const symptoms = deviceSymptoms[deviceName];
  
  // 모달 내용 채우기
  modalTitle.textContent = `${deviceName} - AI 진단 시작`;
  modalBody.innerHTML = `<ul>${symptoms.map(s => `<li>${s}</li>`).join('')}</ul>`;
  
  // 모달 보이기
  modalOverlay.classList.remove('hidden');
});

// '홈으로 돌아가기' 버튼 리스너
backHome.addEventListener('click', () => {
  pageChat.classList.add('hidden');
  pageIndex.classList.remove('hidden');
  
  chatMessages.innerHTML = ''; 
});

// 채팅 입력창 활성화/비활성화
chatInput.addEventListener('input', () => {
  sendBtn.disabled = chatInput.value.trim() === '';
});

// 채팅 메시지 추가 함수
function addMessage(content, role) {
  const div = document.createElement('div');
  div.className = `chat-message ${role}`;
  div.textContent = content; // textContent를 사용해 텍스트로 추가
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 메시지 전송 (API 호출) 함수
async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  
  addMessage(msg, 'user');
  chatInput.value = '';
  sendBtn.disabled = true;

  addMessage('분석 중...', 'assistant');
  const loadingMessage = chatMessages.lastChild; 

  const prompt = msg;

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    loadingMessage.remove();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 오류: ${response.status} - ${errorData.error.message}`);
    }

    const data = await response.json();
    
    const aiResponse = data.candidates[0].content.parts[0].text;
    addMessage(aiResponse, 'assistant');

  } catch (error) {
    loadingMessage.remove();
    console.error("API 요청 중 오류 발생:", error);
    addMessage(`오류 발생: ${error.message}`, 'assistant');
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

// 전송 버튼 클릭 리스너
sendBtn.addEventListener('click', sendMessage);

// Enter 키 전송 리스너
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// --- [수정] 카테고리 카드 클릭 리스너 ---
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    
    const deviceName = card.dataset.device;
    currentDeviceForChat = deviceName; // 현재 기기 이름 저장

    // 기기별 증상 데이터 가져오기 (없을 경우 기본 메시지)
    const symptoms = deviceSymptoms[deviceName] || ['선택한 기기의 일반적인 문제를 점검합니다.'];
    
    // 모달 내용 채우기
    modalTitle.textContent = `${deviceName} - 주요 고장 원인`;
    modalBody.innerHTML = `<ul>${symptoms.map(s => `<li>${s}</li>`).join('')}</ul>`;
    
    // 모달 보이기
    modalOverlay.classList.remove('hidden');
  });
});

// --- [추가] 모달 버튼 리스너 ---

// '챗봇으로 계속하기' 버튼
modalContinueBtn.addEventListener('click', () => {
  startChatting(currentDeviceForChat); // 저장된 기기 이름으로 챗봇 시작
});

// '이전으로' 버튼
modalBackBtn.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
});

// 모달 바깥 영역 클릭 시 닫기
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.add('hidden');
  }
});