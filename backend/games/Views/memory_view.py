from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.memory_operation import (
    add_memory_score_operation
)


@api_view(['POST'])
def add_memory_score_view(request):

    score = request.data.get('score')

    add_memory_score_operation(score)

    return Response({
        "status": True,
        "message": "Memory Score Added"
    })