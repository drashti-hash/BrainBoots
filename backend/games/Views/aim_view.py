from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.aim_operation import (
    add_aim_score_operation
)


@api_view(['POST'])
def add_aim_score_view(request):

    score = request.data.get('score')

    total_clicks = request.data.get(
        'total_clicks'
    )

    accuracy = request.data.get(
        'accuracy'
    )


    add_aim_score_operation(

        score,
        total_clicks,
        accuracy

    )

    return Response({

        "status": True,

        "message": "Aim Score Added"

    })