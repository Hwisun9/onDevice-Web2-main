import openai
import json
from difflib import SequenceMatcher
from gtts import gTTS
import os
from flask import Flask, request, jsonify  # Flask 관련 모듈 추가
from flask_cors import CORS  # CORS 모듈 추가
from flask import send_from_directory
import subprocess
import audioop
import pyaudio
import whisper

# Flask 웹 서버 설정
app = Flask(__name__)
CORS(app)  # CORS 설정

 #OpenAI API 키 설정
openai.api_key =os.getenv('OPENAI_API_KEY')


## JSONL 파일 로드 함수
def load_jsonl(file_path):
    try:
        data = []
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                data.append(json.loads(line.strip()))
        return data
    except FileNotFoundError:
        print(f"Error: {file_path} 파일을 찾을 수 없습니다.")
        return []
    except json.JSONDecodeError as e:
        print(f"Error: JSONL 파일 형식이 잘못되었습니다. {e}")
        return []

# JSONL 데이터 로드
chat_data = load_jsonl("dog_prompt_new.jsonl")

def monitor_and_record(device_name="In 1-2(MOTU M Series)", output_filename="output.mp3", silence_threshold=1000, silence_duration=2):
    # FFmpeg 실행
    command = [
        "ffmpeg",
        "-y",  # 기존 파일 덮어쓰기
        "-f", "dshow",  # Windows용 (Linux는 "alsa" 사용)
        "-i", f"audio={device_name}",
        output_filename
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("녹음이 시작됩니다...")

    # pyaudio 설정
    audio = pyaudio.PyAudio()
    stream = audio.open(format=pyaudio.paInt16, channels=1, rate=44100, input=True, frames_per_buffer=1024)

    silent_chunks = 0 # 침묵 감지 변수 초기화
    silence_limit = int(44100 / 1024 * silence_duration)  # 침묵 유지 시간을 초 단위로 계산

    try:
        while True:
            data = stream.read(1024, exception_on_overflow=False)
            # RMS 계산
            rms = audioop.rms(data, 2)
            # 침묵 상태 확인
            if rms < silence_threshold:
                silent_chunks += 1
            else:
                # 음성이 감지되면 침묵 카운트 초기화
                if silent_chunks > 0:
                    print("음성 감지중. . .")
                silent_chunks = 0  
            # 설정된 침묵 시간 초과 시 종료
            if silent_chunks > silence_limit:
                print("침묵이 지속되어 녹음을 종료합니다.")
                break
    finally:
        # 자원 정리
        stream.stop_stream()
        stream.close()
        audio.terminate()

        # FFmpeg 종료
        if process.poll() is None:
            process.stdin.write(b'q\n')  # FFmpeg에 종료 명령 전달
            process.stdin.flush()
            process.wait()


# 사용자 음성 입력을 텍스트로 변환하는 함수
def speech_to_text(audio_file="output.mp3"):
    device = "cuda"
    model = whisper.load_model("small", device=device)  
    result = model.transcribe(audio_file, language="ko", beam_size=1)
    user_input = result['text']
    return user_input


# 사용자 질문에 가장 적합한 예제를 찾는 함수 (유사도 계산)
def find_similar_example(user_input):
    best_match = None
    highest_similarity = 0.0
    for item in chat_data:
        if "response" not in item:  # 'response' 키가 없는 항목은 건너뛰기
            continue
        similarity = SequenceMatcher(None, user_input, item["prompt"]).ratio()
        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = item
    return best_match if highest_similarity > 0.5 else None  # 유사도가 50% 이상일 때만 반환

def stt_to_chatbot():
    """
    음성을 텍스트로 변환한 뒤, 텍스트를 기반으로 챗봇과 대화합니다.
    '종료'를 말하면 프로그램이 종료됩니다.
    """
    print("=== 애완견 상담 챗봇 ===")
    print("질문을 말해주세요. '종료'를 말하면 프로그램이 종료됩니다.")
    conversation_history = [] 

    while True:
        print("\n녹음을 시작합니다. 질문을 말해주세요...")
        # 음성 녹음
        monitor_and_record(device_name="In 1-2(MOTU M Series)")
        # STT 변환
        user_input = speech_to_text()
        print(f"\n사용자: {user_input}")

        # "종료"를 감지하면 프로그램 종료
        if "종료" in user_input.lower():
            print("프로그램을 종료합니다.")
            break

        # 챗봇 응답
        response = get_chatbot_response(user_input, conversation_history)
        print(f"\n챗봇: {response}")

    print("대화가 종료되었습니다.")
#stt_to_chatbot()


# OpenAI Chat Completion API 호출
def get_chatbot_response(user_input, conversation_history, max_history=5):
    # JSONL 데이터에서 유사한 예제 찾기
    example = find_similar_example(user_input)

    if example:
        jsonl_response = example["response"]
        base_prompt = f"""다음은 JSONL 데이터에서 가져온 초안입니다: "{jsonl_response}".
            - 초안을 기반으로 답변을 작성하세요.
            - 초안의 정보를 활용해 질문에 답변하세요.
            - 어투를 친절하고 정중하게 작성하세요.
            - 영어를 사용하지 말고 한국어로 답변하세요.
            - 답변은 두문장 이내로 작성하세요.
            - 답변이 길어지면 요약해서 답변하세요.
            - 문장 끝에 자연스럽게 추가 질문을 유도하세요.
            - 절대 답변이 끊기면 안됩니다.
        """

    # 대화 메시지 구성
        messages = [{"role": "system", "content": base_prompt}]
        messages.append({"role": "user", "content": f"질문: {user_input}"})
        try:
            # OpenAI API 호출
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=200,
                temperature=0.7,
            )
            api_response = response["choices"][0]["message"]["content"].strip()
            final_answer = api_response
        except Exception as e:
            final_answer = f"OpenAI API 호출 오류: {e}"
    else:      
        base_prompt = """당신은 애완견에 대한 질문에 답변하는 챗봇입니다. JSONL 데이터의 'response'를 활용할 수 없을 경우에만 스스로 답변을 생성하세요."""
        detailed_prompt = """
        - 질문자의 애완견 품종, 나이에 따라 맞춤형 답변을 제공하세요.
        - 건강 관리, 사료 권장량, 사료 추천, 훈련 방법, 행동 문제 등에 대한 질문에 답변할 수 있어야 합니다.
        - 제공된 정보 외의 질문에는 "죄송합니다. 해당 질문에 대한 정보는 가지고 있지 않습니다." 또는 "제가 답변할 수 있는 범위를 벗어난 질문입니다."와 같이 유연하게 대처하세요.
        - 영어를 사용하지 말고 한국어로 답변하세요.
        - 어투를 친절하고 정중하게 작성하세요.
        - 답변은 두문장 이내로 작성하세요.
        - 답변이 길어지면 요약해서 답변하세요.
        - 문장 끝에 자연스럽게 추가 질문을 유도하세요.
        - 절대 답변이 끊기면 안됩니다."""  

        messages = [{"role": "system", "content": base_prompt}, {"role": "user", "content": detailed_prompt}]
        messages.append({"role": "user", "content": f"질문: {user_input}"})
    # OpenAI Chat Completion API 호출
    try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=250,
                temperature=0.7,
            )
            api_response = response["choices"][0]["message"]["content"].strip()
            final_answer = api_response
            
    except Exception as e:
            final_answer = f"OpenAI API 호출 오류: {e}"
        
        # 대화 기록에 챗봇의 응답 추가
    conversation_history.append({"role": "user", "content": user_input})
    conversation_history.append({"role": "assistant", "content": final_answer})

         # 기존 response.mp3 파일 삭제
    if os.path.exists("response.mp3"):
        os.remove("response.mp3")

    #응답을 음성으로 변환
    tts = gTTS(final_answer, lang="ko")
    file_name = f"response.mp3"
    tts.save(file_name)

    return final_answer



@app.route('/response.mp3')
def get_audio():
    return send_from_directory('.', 'response.mp3')  # 현재 디렉토리에서 response.mp3 파일 제공

# 챗봇 API 엔드포인트 추가
@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({'error': '메시지를 입력하세요.'}), 400
    
    conversation_history = []  # 대화 기록 초기화
    response = get_chatbot_response(user_input, conversation_history)
    
    # 응답과 MP3 파일 URL 반환
    return jsonify({
        'response': response,
        'audio_url': request.host_url + 'response.mp3'  # MP3 파일의 URL 포함
    })
@app.route('/record', methods=['GET'])
def record():
    monitor_and_record(device_name="In 1-2(MOTU M Series)")
    return jsonify({'text': speech_to_text()})


if __name__ == "__main__":
    app.run(debug=True)
#chatbot_test()  # 테스트 모드 주석 처리

