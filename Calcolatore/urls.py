from django.urls import path
from . import views
from .views import *


urlpatterns = [
    path("CalcolatoreLogin", CalcolatoreLogin.as_view(), name='loginPageCalcolatore'),
    path("Calcolo/result", CalcoloEtaBiologica.as_view(), name='CalcolatoreDemo')
]