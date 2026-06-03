from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.word_guess_operation import (
    add_word_guess_score_operation
)


@api_view(['POST'])
def add_word_guess_score_view(request):

    level_reached = request.data.get(
        'level_reached'
    )

    score = request.data.get(
        'score'
    )

    attempts = request.data.get(
        'attempts'
    )

    add_word_guess_score_operation(

        level_reached,
        score,
        attempts

    )

    return Response({

        "status": True,

        "message":
            "Word Guess Score Added"

    })
