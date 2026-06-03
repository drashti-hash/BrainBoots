from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.stroop_operation import (
    add_stroop_score_operation
)


@api_view(['POST'])
def add_stroop_score_view(request):

    score = request.data.get('score')

    accuracy = request.data.get(
        'accuracy'
    )

    total_questions = request.data.get(
        'total_questions'
    )


    add_stroop_score_operation(

        score,
        accuracy,
        total_questions

    )

    return Response({

        "status": True,

        "message": "Stroop Score Added"

    })