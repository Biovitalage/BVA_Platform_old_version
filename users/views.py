"""
User Api configuration view
"""
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RoleTokenObtainPairSerializer

class LoginTokenView(TokenObtainPairView):
    """
    POST /api/auth/token/  con { email, password }
    Restituisce {"refresh": "...", "access": "..."} e il campo "role" nel payload.
    """
    serializer_class = RoleTokenObtainPairSerializer
