""" 
ViewSet for API 
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from BioVitalAge.models import *
from .serializers import PazienteSerializer
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
import json

class PazienteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    REST endpoint per list/retrieve di TabellaPazienti,
    filtrato per il dottore loggato.
    """
    serializer_class  = PazienteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        doctor = UtentiRegistratiCredenziali.objects.get(user=self.request.user)
        return TabellaPazienti.objects.filter(dottore=doctor)

    def get_patient_info(self, paziente_id):
        """
        Function to fetch the signle patient
        """ 
        doctor = UtentiRegistratiCredenziali.objects.get(user=self.request.user)
        paziente = get_object_or_404( TabellaPazienti, id=paziente_id, dottore=doctor)

        return paziente

    def get_all_patient(self):
        """
        Function for fetch all patients
        """
        doctor = UtentiRegistratiCredenziali.objects.get(user=self.request.user)
        return TabellaPazienti.objects.filter(dottore=doctor)

    def get_last_five_users(self):
        """
        Function for fetch last 5 patients
        """
        doctor = UtentiRegistratiCredenziali.objects.get(user=self.request.user)
        return TabellaPazienti.objects.filter(dottore=doctor), doctor
    

    # REFERTI ETA' BIOVITALE
    def get_all_bio_referti(self, paziente_id):
        """ 
        Function for fetch all patient referti 
        """
        paziente = self.get_patient_info(paziente_id)
        lista_referti_bio = RefertiEtaBiologica.objects.filter(paziente=paziente)

        return lista_referti_bio
    
    def get_last_bio_referto(self, paziente_id):
        """ 
        Function for fetch last BioVitalAge referto 
        """
        paziente = self.get_patient_info(paziente_id)
        last_referto = (
                RefertiEtaBiologica.objects.filter(paziente=paziente).order_by('-data_ora_creazione').first()
        )
        return last_referto

    #Da testare
    def get_patient_single_bio_referto(self, paziente_id, referto_id):
        """
        Function for fetch single BioVitaleAge referto
        """
        paziente = self.get_patient_info(paziente_id)
        referto = RefertiEtaBiologica.objects.filter(paziente=paziente, id=referto_id)

        return referto

    def get_datiEstesi_referto(self, referto_id):
        """
        Function for fetch single BioVitaleAge referto
        """
        try:
            return DatiEstesiRefertiEtaBiologica.objects.get(
                referto_id=referto_id
            )
        except DatiEstesiRefertiEtaBiologica.DoesNotExist:
            return None

    def get_datiEstesi_filtered(self, paziente_id):
        """ 
        Function for fetch datiestesi filtered
        """ 
        
        referto = self.get_last_bio_referto(paziente_id)
        if referto is None:
            return [None, None, None, None, None, None, None]
        
        last_referto_datiEstesi = self.get_datiEstesi_referto(referto.id)

        if last_referto_datiEstesi is None:
            return [None, None, None, None, None, None, None]

        cuore       = last_referto_datiEstesi.get_fields_by_help_text('Salute del Cuore')
        reni        = last_referto_datiEstesi.get_fields_by_help_text('Salute Renale')
        epatica     = last_referto_datiEstesi.get_fields_by_help_text('Salute Epatica')
        cerebrale   = last_referto_datiEstesi.get_fields_by_help_text('Salute Cerebrale')
        ormonale    = last_referto_datiEstesi.get_fields_by_help_text('Salute Ormonale')
        sangue      = last_referto_datiEstesi.get_fields_by_help_text('Salute del sangue')
        immunitario = last_referto_datiEstesi.get_fields_by_help_text('Salute del sistema immunitario')

        return [cuore, reni, epatica, cerebrale, ormonale, sangue, immunitario]







