from django.db import connection


def add_number_sequence_score_operation(

    level_reached,
    score,
    total_attempts

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_number_sequence_score',

            [
                level_reached,
                score,
                total_attempts
            ]

        )

    return True