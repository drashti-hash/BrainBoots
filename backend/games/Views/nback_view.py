from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.nback_operation import (
    add_nback_score_operation
)


@api_view(['POST'])
def add_nback_score_view(request):

    level_reached = request.data.get(
        'level_reached'
    )

    score = request.data.get(
        'score'
    )

    matches = request.data.get(
        'matches'
    )

    add_nback_score_operation(

        level_reached,
        score,
        matches

    )

    return Response({

        "status": True,

        "message":
            "N-Back Score Added"

    })
