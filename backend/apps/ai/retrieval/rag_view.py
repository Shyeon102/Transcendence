from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from media.models import Media


class RecommendedMediaSerializer(serializers.ModelSerializer):
    # DB 모델에 없지만 프론트에 넘겨줄 커스텀 필드 정의
    match_score = serializers.SerializerMethodField()
    recommend_reason = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = ['id', 'title', 'poster_image', 'genres', 'match_score']



class RAGSearchAPIView(APIView):
    def get(self, request):
        query = request.query_params.get('q')
        
        # 1. AI 엔진에서 ID와 점수 리스트 확보
        ai_results = search_similar_media_ids(query_embedding)
        media_ids = [item['media_id'] for item in ai_results]
        
        # 2. 획득한 ID들로 미디어 정보 bulk 조회 (인덱스 타서 매우 빠름)
        # select_related나 prefetch_related를 여기서 붙여줍니다.
        medias = Media.objects.filter(id__in=media_ids).select_related('category')
        
        # 매핑을 위해 {id: similarity} 딕셔너리 생성
        score_dict = {item['media_id']: item['similarity'] for item in ai_results}
        
        # 3. Serializer를 통해 프론트엔드가 원하는 형태로 살을 붙임 (Populate)
        serializer = RecommendedMediaSerializer(
            medias, 
            many=True, 
            context={'score_dict': score_dict}
        )
        
        return serializer.data