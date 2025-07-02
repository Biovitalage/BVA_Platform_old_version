"""
Users permissions role configuration
"""
from rest_framework.permissions import BasePermission

class RoleRequired(BasePermission):
    """
    Controlla che nel payload del JWT ci sia un ruolo autorizzato.
    La view imposta `required_roles = ['admin', ...]`.
    """
    def has_permission(self, request, view):
        payload = getattr(request.auth, 'payload', {})
        return payload.get('role') in getattr(view, 'required_roles', [])
