from django.db import connection


def add_odd_color_score_operation(

    level_reached,
    score,
    total_clicks

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_odd_color_score',

            [
                level_reached,
                score,
                total_clicks
            ]

        )

    return True