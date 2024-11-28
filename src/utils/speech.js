export const startSpeechRecognition = (onResult, onError) => {
    const SpeechRecognition = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('이 브라우저는 음성인식을 지원하지 않습니다.');
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR'; // 한국어 설정
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
  
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onError(event.error);
    };
  
    recognition.start();
  };

  export const speakText = (text) => {
    // const synth = window.speechSynthesis;
    // const utterance = new SpeechSynthesisUtterance(text);
    // utterance.lang = 'ko-KR'; // 한국어 설정
    // synth.speak(utterance);
    const audio = new Audio('http://localhost:5000/response.mp3'); // Flask 서버의 URL로 수정
    audio.play().catch((error) => {
        console.error('Audio playback error:', error);
    });
  };
  
  