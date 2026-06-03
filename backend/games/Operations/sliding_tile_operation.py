from django.db import connection


def add_sliding_tile_score_operation(

    level_reached,
    score,
    moves

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_sliding_tile_score',

            [
                level_reached,
                score,
                moves
            ]

        )

    return True
