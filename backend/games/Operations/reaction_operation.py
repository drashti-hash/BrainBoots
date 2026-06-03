from django.db import connection


def add_reaction_score_operation(
    score,
    reaction_time
):

    with connection.cursor() as cursor:

        cursor.callproc(
            'add_reaction_score',
            [
                score,
                reaction_time
            ]
        )

    return True