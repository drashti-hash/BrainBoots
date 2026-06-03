from django.db import connection


def add_nback_score_operation(

    level_reached,
    score,
    matches

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_nback_score',

            [
                level_reached,
                score,
                matches
            ]

        )

    return True
