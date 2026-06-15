from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.hot_potato_operation import (
    add_hot_potato_score_operation
)


@api_view(['POST'])
def add_hot_potato_score_view(request):

    score = request.data.get('score')

    add_hot_potato_score_operation(
        score
    )

    return Response({

        "status": True,

        "message": "Hot Potato Score Added"

    })
