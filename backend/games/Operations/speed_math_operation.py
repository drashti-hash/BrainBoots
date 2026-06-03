from django.db import connection


def add_speed_math_score_operation(

    level_reached,
    score,
    correct_answers

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_speed_math_score',

            [
                level_reached,
                score,
                correct_answers
            ]

        )

    return True
