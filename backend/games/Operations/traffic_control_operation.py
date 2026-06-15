from django.db import connection


def add_traffic_control_score_operation(

    score,
    crashes_avoided

):

    with connection.cursor() as cursor:

        cursor.callproc(

            'add_traffic_control_score',

            [
                score,
                crashes_avoided
            ]

        )

    return True
