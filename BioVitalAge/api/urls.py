""" 
Endpoint API 
"""
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'pazienti', PazienteViewSet, basename='paziente')

# extra_urls = []

urlpatterns = router.urls  #+ extra_urls

urlpatterns += [
    path('salva-prescrizione-libera/',                  salva_prescrizione_libera,                  name='salva_prescrizione_libera'),
    
    # API ICD11
    path("icd11/search/",                           icd11_search_view),
]
