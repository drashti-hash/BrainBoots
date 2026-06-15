from django.db import connection


def add_hot_potato_score_operation(
    score
):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_hot_potato_score',

            [
                score
            ]

        )

    return True
