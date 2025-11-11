const pageIndex = document.getElementById('page-index');
const pageChat = document.getElementById('page-chat');
const startBtn = document.getElementById('start-diagnose');
const backHome = document.getElementById('back-home');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

const apiKey = "AIzaSyDifmP_IukXalUMc0_Wt5_ma8NOEe66WHA";

startBtn.addEventListener('click', () => {
  pageIndex.classList.add('hidden');
  pageChat.classList.remove('hidden');
  
  chatMessages.innerHTML = '';
  addMessage('안녕하세요! 어떤 기기를 진단해드릴까요? 선택한 기기와 문제를 말씀해주세요.', 'assistant');
  chatInput.focus();
});

backHome.addEventListener('click', () => {
  pageChat.classList.add('hidden');
  pageIndex.classList.remove('hidden');

  chatMessages.innerHTML = ''; 
});

chatInput.addEventListener('input', () => {
  sendBtn.disabled = chatInput.value.trim() === '';
});

function addMessage(content, role) {
  const div = document.createElement('div');
  div.className = `chat-message ${role}`;
  div.textContent = content; // textContent를 사용해 텍스트로 추가
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

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

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {

    pageIndex.classList.add('hidden');
    pageChat.classList.remove('hidden');
    
    chatMessages.innerHTML = ''; // 채팅 내역 초기화
    const initialMsg = `안녕하세요! '${card.dataset.device}'에 대해 무엇이 궁금하신가요?`;
    addMessage(initialMsg, 'assistant');
    chatInput.focus();
  });
});