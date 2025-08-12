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

from .views import get_visita, get_visite_paziente

urlpatterns += [
    path('salva-prescrizione-libera/',                  salva_prescrizione_libera,                  name='salva_prescrizione_libera'),
    path('salva-dati-base-e-crea-visita/', salva_dati_base_e_crea_visita, name='salva_dati_base_e_crea_visita'),
    path('visite/<int:persona_id>/', visite_paziente_view, name='visite_paziente'),
    path('visite/<int:visita_id>/', get_visita, name='get_visita'),

    # API ICD11
    path("icd11/search/",                           icd11_search_view),


    path('api/visite/<int:visita_id>/', get_visita, name='get_visita_api'),
    path('api/visite-paziente/<int:persona_id>/', get_visite_paziente, name='get_visite_paziente'),
]