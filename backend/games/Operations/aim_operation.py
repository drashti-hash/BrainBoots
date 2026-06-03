from django.db import connection


def add_aim_score_operation(

    score,
    total_clicks,
    accuracy

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_aim_score',

            [
                score,
                total_clicks,
                accuracy
            ]

        )

    return True