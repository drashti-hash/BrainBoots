import bcrypt
import jwt
import datetime

from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

from games.Operations.user_operation import (
    register_user,
    login_user
)

SECRET_KEY = settings.SECRET_KEY


# REGISTER API
@api_view(['POST'])
def register_view(request):

    try:

        data = request.data
        required_fields = ("username", "email", "password")

        for field in required_fields:
            if not data.get(field):
                return Response({
                    "success": False,
                    "message": f"{field} is required"
                })

        result = register_user(data)

        return Response(result)

    except Exception as e:

        return Response({
            "success": False,
            "message": str(e)
        })



# LOGIN API
@api_view(['POST'])
def login_view(request):

    try:

        data = request.data

        if not data.get("email") or not data.get("password"):
            return Response({
                "success": False,
                "message": "Email and password are required"
            })

        password = data.get("password")

        # GET USER
        user = login_user(data)

        if not user or user.get("success") is False:

            return Response({
                "success": False,
                "message": user.get("message", "Invalid email") if user else "Invalid email"
            })

        # VERIFY PASSWORD
        password_match = bcrypt.checkpw(
            password.encode('utf-8'),
            user['password'].encode('utf-8')
        )

        if not password_match:

            return Response({
                "success": False,
                "message": "Invalid password"
            })

        # JWT PAYLOAD
        payload = {
            "user_id": user['user_id'],
            "email": user['email'],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }

        # GENERATE TOKEN
        token = jwt.encode(
            payload,
            SECRET_KEY,
            algorithm='HS256'
        )

        return Response({
            "success": True,
            "message": "Login successful",
            "token": token,
            "user": {
                "user_id": user['user_id'],
                "username": user['username'],
                "email": user['email'],
                "avatar": user.get('avatar')
            }
        })

    except Exception as e:

        return Response({
            "success": False,
            "message": str(e)
        })
