from django.db import connection


def add_schulte_score_operation(

    level_reached,
    score,
    completed_time

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_schulte_score',

            [
                level_reached,
                score,
                completed_time
            ]

        )

    return True
