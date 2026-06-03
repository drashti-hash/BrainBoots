import bcrypt
from django.db import connection


# REGISTER USER
def register_user(data):

    try:

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return {
                "success": False,
                "message": "Username, email and password are required"
            }

        # HASH PASSWORD
        hashed_password = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        with connection.cursor() as cursor:

            # CALL STORED PROCEDURE
            cursor.callproc(
                'sp_register_user',
                [
                    username,
                    email,
                    hashed_password
                ]
            )

            rows = cursor.fetchall()

            if rows:
                row = rows[0]
                return {
                    "success": row[0],
                    "message": row[1]
                }

        return {
            "success": True,
            "message": "Registration successful"
        }

    except Exception as e:

        return {
            "success": False,
            "message": str(e)
        }



# LOGIN USER
def login_user(data):

    try:

        email = data.get("email")

        if not email:
            return {
                "success": False,
                "message": "Email is required"
            }

        with connection.cursor() as cursor:

            # CALL STORED PROCEDURE
            cursor.callproc(
                'sp_login_user',
                [email]
            )

            if not cursor.description:
                return None

            columns = [col[0] for col in cursor.description]

            rows = cursor.fetchall()

            if rows:

                user = dict(zip(columns, rows[0]))

                return user

            return None

    except Exception as e:

        return {
            "success": False,
            "message": str(e)
        }
