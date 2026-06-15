from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.memory_race_operation import (
    add_memory_race_score_operation
)


@api_view(['POST'])
def add_memory_race_score_view(request):

    score = request.data.get('score')

    correct_answers = request.data.get(
        'correct_answers'
    )

    total_questions = request.data.get(
        'total_questions'
    )

    add_memory_race_score_operation(

        score,
        correct_answers,
        total_questions

    )

    return Response({

        "status": True,

        "message": "Memory Race Score Added"

    })
