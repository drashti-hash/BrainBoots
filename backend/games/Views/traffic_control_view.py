from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.traffic_control_operation import (
    add_traffic_control_score_operation
)


@api_view(['POST'])
def add_traffic_control_score_view(request):

    score = request.data.get('score')

    crashes_avoided = request.data.get(
        'crashes_avoided'
    )

    add_traffic_control_score_operation(

        score,
        crashes_avoided

    )

    return Response({

        "status": True,

        "message": "Traffic Control Score Added"

    })
