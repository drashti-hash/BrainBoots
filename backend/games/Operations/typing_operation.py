from django.db import connection


def add_typing_score_operation(

    wpm,
    accuracy,
    total_time

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_typing_score',

            [
                wpm,
                accuracy,
                total_time
            ]

        )

    return True