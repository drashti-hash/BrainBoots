from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.reaction_operation import (
    add_reaction_score_operation
)


@api_view(['POST'])
def add_reaction_score_view(request):

    score = request.data.get('score')

    reaction_time = request.data.get(
        'reaction_time'
    )

    add_reaction_score_operation(
        score,
        reaction_time
    )

    return Response({
        "status": True,
        "message": "Reaction Score Added"
    })