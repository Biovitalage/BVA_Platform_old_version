# myapp/backends.py
from django.contrib.auth.backends import BaseBackend # type: ignore
from django.contrib.auth.hashers import check_password # type: ignore
from django.contrib.auth.models import User # type: ignore
from .models import UtentiRegistratiCredenziali

class UtentiCredenzialiBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Prova a trovare un UtentiRegistratiCredenziali con email=username
        e verifica la password hashata in quella tabella.
        Se ok, restituisce il corrispondente User Django.
        """
        try:
            cred = UtentiRegistratiCredenziali.objects.get(email=username)
        except UtentiRegistratiCredenziali.DoesNotExist:
            return None

        if check_password(password, cred.password) and cred.user:
            return cred.user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
