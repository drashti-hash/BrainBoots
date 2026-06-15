from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.speed_math_operation import (
    add_speed_math_score_operation
)


@api_view(['POST'])
def add_speed_math_score_view(request):

    level_reached = request.data.get('level_reached')
    score = request.data.get('score')
    correct_answers = request.data.get('correct_answers')
    add_speed_math_score_operation(level_reached,score,correct_answers)

    return Response({

        "status": True,

        "message":
            "Speed Math Score Added"

    })
