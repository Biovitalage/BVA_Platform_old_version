# BioVitalAge/decorators.py
from functools import wraps
from django.contrib import messages
from django.shortcuts import redirect
import logging

logger = logging.getLogger(__name__)

def catch_exceptions(view_func):
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)
        except Exception as e:
            logger.exception("Errore nella view %s: %s", getattr(view_func, "__name__", str(view_func)), e)
            messages.error(request, "Si è verificato un errore inatteso. Riprova.")
            return redirect(request.META.get("HTTP_REFERER", "/"))
    return _wrapped
