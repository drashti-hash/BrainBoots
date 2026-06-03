from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.odd_color_operation import (
    add_odd_color_score_operation
)


@api_view(['POST'])
def add_odd_color_score_view(request):

    level_reached = request.data.get(
        'level_reached'
    )

    score = request.data.get(
        'score'
    )

    total_clicks = request.data.get(
        'total_clicks'
    )


    add_odd_color_score_operation(

        level_reached,
        score,
        total_clicks

    )

    return Response({

        "status": True,

        "message":
            "Odd Color Score Added"

    })