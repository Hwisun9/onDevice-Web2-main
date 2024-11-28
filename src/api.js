const fetchChatGPTResponse = async (userInput) => {
  try {
      const response = await fetch('http://localhost:5000/chat', { // Flask 서버의 URL
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userInput }), // 사용자 입력을 JSON 형식으로 전송
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      // 챗봇의 응답 반환
      return data.response; 
  } catch (error) {
      console.error('Error fetching chat response:', error);
      return '챗봇 응답을 가져오는 데 오류가 발생했습니다.'; // 오류 메시지 반환
  }
};

export default fetchChatGPTResponse;