from django.db import connection


def add_stroop_score_operation(

    score,
    accuracy,
    total_questions

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_stroop_score',

            [
                score,
                accuracy,
                total_questions
            ]

        )

    return True