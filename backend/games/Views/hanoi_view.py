from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.hanoi_operation import (
    add_hanoi_score_operation
)


@api_view(['POST'])
def add_hanoi_score_view(request):

    level_reached = request.data.get('level_reached')
    score = request.data.get('score')
    moves = request.data.get('moves')
    add_hanoi_score_operation(level_reached,score,moves)
    return Response({
        "status": True,
        "message":
            "Hanoi Score Added"
    })
