"""
URL configuration for PiattaformaBioVitalAge project.
"""
from django.contrib import admin
from django.urls import path, include
from BioVitalAge.views import HomePageRender
from django.http import HttpResponse

from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


urlpatterns = [
    # PATH ADMIN SECTION
    path('admin/', admin.site.urls),

    # PATH AUTENTIFICAZIONE SECTION
    path('auth/', include('social_django.urls', namespace='social')),
    path('api/auth/', include('users.urls')),

    # PATH PER API
    path('api/', include('BioVitalAge.api.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'), #OpenAPI SCHEMA
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'), #SWAGGER UI

    # PATH DASHBOARD ROOT
    path('', include('BioVitalAge.urls')),

    # PATH PER CALCOLATORE APP
    path('Calcolatore', include('Calcolatore.urls')),
]
