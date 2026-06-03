from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.dashboard_operation import get_dashboard_data_operation


@api_view(['GET'])
def dashboard_data_view(request):

    try:

        result = get_dashboard_data_operation()

        return Response(result)

    except Exception as e:

        return Response({
            "success": False,
            "message": str(e),
            "stats": {
                "totalScore": 0,
                "bestScore": 0,
                "gamesPlayed": 0,
                "streak": 0,
            },
            "tables": [],
        })
