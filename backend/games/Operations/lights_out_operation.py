from django.db import connection


def add_lights_out_score_operation(

    level_reached,
    score,
    moves

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_lights_out_score',

            [
                level_reached,
                score,
                moves
            ]

        )

    return True
