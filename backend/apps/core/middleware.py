from django.http import JsonResponse


class CommonErrorResponseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            return JsonResponse({
                "success": False,
                "error": str(e),
            }, status=500)

    def process_exception(self, request, exception):
        return JsonResponse({
            "success": False,
            "error": str(exception),
        }, status=500)
