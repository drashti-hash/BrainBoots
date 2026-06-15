from django.db import connection


def add_memory_race_score_operation(

    score,
    correct_answers,
    total_questions

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_memory_race_score',

            [
                score,
                correct_answers,
                total_questions
            ]

        )

    return True
