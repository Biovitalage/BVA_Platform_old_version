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
