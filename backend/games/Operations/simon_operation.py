from django.db import connection


def add_simon_score_operation(

    level_reached,
    score,
    total_moves

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_simon_score',

            [
                level_reached,
                score,
                total_moves
            ]

        )

    return True