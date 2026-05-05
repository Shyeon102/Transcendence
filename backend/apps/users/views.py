from rest_framework.views import APIView
from rest_framework.response import Response

class UserView(APIView):
    def get(self, request):
        return Response({"users": []})
    
def test_error(request):
    raise Exception("middleware test")