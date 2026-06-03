from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.typing_operation import (
    add_typing_score_operation
)


@api_view(['POST'])
def add_typing_score_view(request):

    wpm = request.data.get('wpm')

    accuracy = request.data.get('accuracy')

    total_time = request.data.get('total_time')


    add_typing_score_operation(

        wpm,
        accuracy,
        total_time

    )

    return Response({

        "status": True,

        "message": "Typing Score Added"

    })