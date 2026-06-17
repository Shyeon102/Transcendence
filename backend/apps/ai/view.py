from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.contrib.auth.decorators import login_required
# 작성하신 함수들이 있는 위치에서 정확히 임포트하세요.
from .recommendation import get_hybrid_scores 
from .utils import get_user_exclude_ids  # 유저가 이미 본 미디어 ID 추출 함수가 있다면 활용

@require_GET
# @login_required  # 만약 세션 로그인 기반 보안이 필요하다면 주석 해제
def user_recommendation_api(request, user_id: int):
    try:
        exclude_ids = get_user_exclude_ids(user_id)
        
        # 2. 하이브리드 함수 호출 
        # 가중치나 모델 등은 지정하지 않으면 함수 정의에 있는 기본값(Default)이 알아서 적용됩니다.
        # 정렬 결과 상위 10개만 깔끔하게 끊어오기 위해 top_k=10을 기본 지정합니다.
        hybrid_series = get_hybrid_scores(
            user_id=user_id,
            exclude_media_ids=exclude_ids,
            top_k=10
        )
        
        # 3. 판다스 Series 데이터 구조를 JSON 직렬화가 가능한 파이썬 자료형으로 가공
        # hybrid_series는 {media_id: score} 형태의 정렬된 상태입니다.
        recommend_list = [
            {"media_id": int(mid), "score": float(score)}
            for mid, score in hybrid_series.items()
        ]
        
        # 4. JSON 최종 반환
        return JsonResponse({
            "status": "success",
            "user_id": user_id,
            "data": recommend_list
        }, status=200)

    except Exception as e:
        # 무언가 에러가 났을 때 안전하게 에러 메시지 반환
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=500)





from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .recommendation import get_hybrid_scores

@api_view(['GET'])
def get_user_recommendations_view(request, user_id: int):
    """
    DRF 기반의 유저 맞춤형 하이브리드 추천 결과 반환 API
    """
    try:
        # 인자를 다 넣지 않고 오직 user_id만 넣어서 호출 (나머지는 Default 값 적용)
        hybrid_series = get_hybrid_scores(user_id=user_id, top_k=10)
        
        if hybrid_series.empty:
            return Response({
                "message": "추천 결과를 생성할 수 없습니다. (데이터 부족)"
            }, status=status.HTTP_404_NOT_FOUND)
            
        # 프론트엔드가 쓰기 편하게 가공
        result_data = [
            {"media_id": int(mid), "score": round(float(score), 4)} 
            for mid, score in hybrid_series.items()
        ]
        
        return Response({
            "user_id": user_id,
            "recommendations": result_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
