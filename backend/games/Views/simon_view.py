from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.simon_operation import (
    add_simon_score_operation
)


@api_view(['POST'])
def add_simon_score_view(request):

    level_reached = request.data.get(
        'level_reached'
    )
    score = request.data.get('score')
    total_moves = request.data.get('total_moves' )


    add_simon_score_operation(

        level_reached,
        score,
        total_moves

    )

    return Response({

        "status": True,

        "message": "Simon Score Added"

    })