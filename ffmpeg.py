import subprocess
import audioop
import pyaudio
import os
import whisper
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

    # 침묵 감지 변수 초기화
    silent_chunks = 0
    silence_limit = int(44100 / 1024 * silence_duration)  # 침묵 유지 시간을 초 단위로 계산

    try:
        while True:
            # 마이크 입력 데이터 읽기
            data = stream.read(1024, exception_on_overflow=False)

            # RMS 계산
            rms = audioop.rms(data, 2)

            # 침묵 상태 확인
            if rms < silence_threshold:
                silent_chunks += 1
            else:
                # 음성이 감지되면 침묵 카운트 초기화
                if silent_chunks > 0:
                    print("음성이 감지되었습니다. 녹음을 계속합니다...")
                silent_chunks = 0  

            # 설정된 침묵 시간 초과 시 종료
            if silent_chunks > silence_limit:
                print("침묵이 감지되어 녹음을 종료합니다.")
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

        # 녹음 종료 메시지
        print(f"녹음이 종료되었습니다. 파일: {output_filename}")
# 실행
monitor_and_record(device_name="In 1-2(MOTU M Series)")

device = "cuda"
model = whisper.load_model("small", device=device)  
result = model.transcribe("output.mp3", language="ko", beam_size=1)
text = result["text"]
print(text)