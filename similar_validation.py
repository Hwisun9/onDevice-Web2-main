from difflib import SequenceMatcher
import numpy as np
import matplotlib.pyplot as plt
import json

# JSONL 파일 읽기 함수
def load_jsonl(file_path):
    data = []
    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            data.append(json.loads(line.strip()))
    return data

# SequenceMatcher 기반 유사도 계산 함수 (임계값 적용)
def find_similar_example_sequence(user_input, chat_data, threshold):
    best_match = None
    highest_similarity = 0.0

    for item in chat_data:
        if "response" not in item:  # 'response' 키가 없는 항목은 건너뛰기
            continue
        similarity = SequenceMatcher(None, user_input, item["prompt"]).ratio()
        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = item

    return best_match if highest_similarity > threshold else None

# F1-score를 활용한 임계값 검증 함수
def evaluate_similarity_thresholds_with_metrics(chat_data, validation_data, thresholds=np.arange(0.1, 1.0, 0.1)):
    results = []

    for threshold in thresholds:
        correct_count = 0
        false_positives = 0
        false_negatives = 0
        total_count = len(validation_data)

        for item in validation_data:
            user_input = item["user_input"]
            expected_prompt = item["expected_prompt"]

            # 유사도 기반 매칭
            best_match = find_similar_example_sequence(user_input, chat_data, threshold)

            if best_match:
                if best_match["prompt"] == expected_prompt:
                    correct_count += 1  # True Positive
                else:
                    false_positives += 1  # False Positive
            else:
                false_negatives += 1  # False Negative

        precision = correct_count / (correct_count + false_positives) if (correct_count + false_positives) > 0 else 0
        recall = correct_count / (correct_count + false_negatives) if (correct_count + false_negatives) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

        results.append({"threshold": threshold, "accuracy": correct_count / total_count, "f1_score": f1_score})

    return results

# 결과 시각화 함수
def plot_results_with_f1(results):
    thresholds = [result["threshold"] for result in results]
    accuracies = [result["accuracy"] for result in results]
    f1_scores = [result["f1_score"] for result in results]

    plt.plot(thresholds, accuracies, marker='o', label="Accuracy")
    plt.plot(thresholds, f1_scores, marker='x', label="F1 Score")
    plt.title("Threshold vs Accuracy and F1 Score")
    plt.xlabel("Threshold")
    plt.ylabel("Score")
    plt.legend()
    plt.grid()
    plt.show()

# 실행
if __name__ == "__main__":
    # 검증 데이터와 Chat 데이터
    chat_data_file = "dog_prompt_new.jsonl"
    validation_data_file = "validation_data.jsonl"

    # 데이터 로드
    chat_data = load_jsonl(chat_data_file)
    validation_data = load_jsonl(validation_data_file)

    # 임계값 평가
    results = evaluate_similarity_thresholds_with_metrics(chat_data, validation_data)

    # 결과 시각화
    plot_results_with_f1(results)

    # 최적 임계값 출력 (F1-score 기준)
    best_threshold = max(results, key=lambda x: x["f1_score"])["threshold"]
    print(f"최적의 임계값 (F1 기준): {best_threshold}")
