"""
Users serializers
"""
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        cred = getattr(user, 'utentiregistraticredenziali', None)
        token['role'] = cred.role if cred else 'doctor'
        return token
