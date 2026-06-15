from django.db import connection


def add_wrong_answer_score_operation(
    score
):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_wrong_answer_score',

            [
                score
            ]

        )

    return True
