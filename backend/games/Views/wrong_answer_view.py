from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.wrong_answer_operation import (
    add_wrong_answer_score_operation
)


@api_view(['POST'])
def add_wrong_answer_score_view(request):

    score = request.data.get('score')

    add_wrong_answer_score_operation(
        score
    )

    return Response({

        "status": True,

        "message": "Wrong Answer Score Added"

    })
