import jwt
import sys
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User
from django.conf import settings

class BrainbootsJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        try:
            return self._authenticate(request)
        except AuthenticationFailed:
            raise
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print(f"[AUTH_ERROR] Authentication Exception: {tb}", file=sys.stderr)
            raise AuthenticationFailed(f"Auth system exception: {str(e)} | Details: {tb[:300]}")

    def _authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        print(f"[AUTH_DEBUG] Authorization Header: {auth_header}", file=sys.stderr)
        
        if not auth_header:
            print("[AUTH_DEBUG] No Authorization header provided.", file=sys.stderr)
            return None
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            print(f"[AUTH_DEBUG] Invalid Authorization header format: {auth_header}", file=sys.stderr)
            return None
            
        token = parts[1]
        try:
            # Decode the token signed by BrainBoots Django backend using settings.SECRET_KEY
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            print(f"[AUTH_DEBUG] Decoded payload using settings.SECRET_KEY: {payload}", file=sys.stderr)
        except jwt.ExpiredSignatureError:
            print("[AUTH_DEBUG] Token has expired.", file=sys.stderr)
            raise AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError as e:
            print(f"[AUTH_DEBUG] Token verification failed: {e}", file=sys.stderr)
            raise AuthenticationFailed(f"Invalid token: {e}")
            
        user_id = payload.get("user_id")
        email = payload.get("email")
        
        if email:
            user = User.objects.filter(email=email).first()
            if not user:
                username = email.split('@')[0]
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{counter}"
                    counter += 1
                print(f"[AUTH_DEBUG] Creating new User: {username} ({email})", file=sys.stderr)
                user = User.objects.create(email=email, username=username)
            else:
                print(f"[AUTH_DEBUG] Found existing User by email: {user.username}", file=sys.stderr)
        elif user_id:
            user = User.objects.filter(id=user_id).first()
            if not user:
                print(f"[AUTH_DEBUG] User with ID {user_id} not found in database.", file=sys.stderr)
                raise AuthenticationFailed("User not found")
            print(f"[AUTH_DEBUG] Found existing User by ID: {user.username}", file=sys.stderr)
        else:
            print("[AUTH_DEBUG] Both email and user_id fields missing in token payload.", file=sys.stderr)
            raise AuthenticationFailed("Token is missing user identifiers")
            
        return (user, token)

