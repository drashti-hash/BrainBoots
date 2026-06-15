from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.sudoku_operation import (
    add_sudoku_score_operation
)


@api_view(['POST'])
def add_sudoku_score_view(request):

    level_reached = request.data.get('level_reached')

    score = request.data.get('score')

    completed_time = request.data.get('completed_time')


    add_sudoku_score_operation(

        level_reached,
        score,
        completed_time
 )
    return Response({

        "status": True,

        "message":
            "Sudoku Score Added"

    })