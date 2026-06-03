from django.db import connection


def add_focus_grid_score_operation(

    level_reached,
    score,
    total_attempts

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_focus_grid_score',

            [
                level_reached,
                score,
                total_attempts
            ]

        )

    return True