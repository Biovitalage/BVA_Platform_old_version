import logging
from functools import wraps
from django.shortcuts import render # type: ignore
from django.http import Http404, HttpResponseBadRequest # type: ignore
from django.core.exceptions import PermissionDenied, SuspiciousOperation # type: ignore

logger = logging.getLogger(__name__)

def catch_exceptions(view_func):
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        try:
            response = view_func(request, *args, **kwargs)
            if isinstance(response, HttpResponseBadRequest):
                return render(request, 'components/errori/400.html', status=400)
            return response

        except Http404:
            return render(request, 'components/errori/400.html', status=404)

        except PermissionDenied:
            return render(request, 'components/errori/400.html', status=403)
    
        except SuspiciousOperation:
            return render(request, 'components/errori/400.html', status=400)

        except Exception as e:
            logger.exception(f"Errore in view {view_func.__name__}: {e}")
            return render(request, 'components/errori/500.html', status=500)

    return _wrapped