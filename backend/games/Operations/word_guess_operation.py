from django.db import connection


def add_word_guess_score_operation(

    level_reached,
    score,
    attempts

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_word_guess_score',

            [
                level_reached,
                score,
                attempts
            ]

        )

    return True
