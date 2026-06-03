from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.number_sequence_operation import (
    add_number_sequence_score_operation
)


@api_view(['POST'])
def add_number_sequence_score_view(request):

    level_reached = request.data.get(
        'level_reached'
    )

    score = request.data.get(
        'score'
    )

    total_attempts = request.data.get(
        'total_attempts'
    )


    add_number_sequence_score_operation(

        level_reached,
        score,
        total_attempts

    )

    return Response({

        "status": True,

        "message":
            "Number Sequence Score Added"

    })