from django.db import connection


def add_memory_score_operation(
    score
):

    with connection.cursor() as cursor:

        cursor.callproc(
            'add_memory_score',
            [score]
        )

    return True