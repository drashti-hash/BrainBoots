from django.db import connection


def add_sudoku_score_operation(

    level_reached,
    score,
    completed_time

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_sudoku_score',

            [
                level_reached,
                score,
                completed_time
            ]

        )

    return True