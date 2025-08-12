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
from django.utils.timezone import now
import json
import logging
from ..funzioni_python.icd11 import get_icd11_token, search_icd11_entities
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from BioVitalAge.models import Visita
from .serializers import VisitaSerializer
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.decorators import action

logger = logging.getLogger(__name__)

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

    from django.core.exceptions import ObjectDoesNotExist

    def get_patient_info(self, paziente_id):
        """
        Function to fetch the signle patient
        """
        try:
            doctor = UtentiRegistratiCredenziali.objects.get(user=self.request.user)
        except ObjectDoesNotExist:
            from rest_framework.response import Response
            from rest_framework import status
            return Response({'error': 'Utente non trovato o non autenticato'}, status=404)

        paziente = get_object_or_404(TabellaPazienti, id=paziente_id, dottore=doctor)

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


    @action(detail=True, methods=['get'])
    def visite(self, request, pk=None):
        """Restituisce tutte le visite di un paziente specifico"""
        try:
            paziente = self.get_object()
            visite = Visita.objects.filter(paziente=paziente).order_by('-data_visita')
            serializer = VisitaSerializer(visite, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)




@csrf_exempt
def salva_prescrizione_libera(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            persona_id = data.get('persona_id')
            testo = data.get('testo')
            if not persona_id or not testo:
                return JsonResponse({'success': False, 'error': 'Dati mancanti.'}, status=400)
            persona = TabellaPazienti.objects.get(id=persona_id)
            prescrizione = PrescrizioneLibera.objects.create(
                persona=persona,
                testo=testo,
                data_creazione=timezone.now()
            )
            return JsonResponse({'success': True, 'data_creazione': prescrizione.data_creazione.strftime('%d/%m/%Y %H:%M')})
        except TabellaPazienti.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Paziente non trovato.'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Metodo non consentito.'}, status=405)




def icd11_search_view(request):
    query = request.GET.get("q", "")
    if not query:
        return JsonResponse({"error": "Missing query"}, status=400)
    token = get_icd11_token()
    results = search_icd11_entities(query, token)
    return JsonResponse(results)




@csrf_exempt
def salva_dati_base_e_crea_visita(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            paziente_id = data.get('paziente_id')
            dati_base = data.get('dati_base')
            visita_data = data.get('visita')

            logger.info(f'Request to save data for patient id: {paziente_id}')

            if not paziente_id:
                logger.error('Missing patient id in request')
                return JsonResponse({'success': False, 'error': 'ID paziente mancante.'}, status=400)

            paziente = TabellaPazienti.objects.get(id=paziente_id)

            if dati_base:
                for key, value in dati_base.items():
                    if hasattr(paziente, key):
                        setattr(paziente, key, value)
                paziente.save()

            visita_data_visita = None
            if visita_data:
                visita_data_visita = visita_data.get('data_visita')
                if visita_data_visita:
                    visita_data_visita = parse_date(visita_data_visita)

            if visita_data_visita is None:
                visita_data_visita = now().date()

            ultimo_numero = Visita.objects.filter(paziente=paziente).order_by('-visita_numero').first()
            if ultimo_numero and ultimo_numero.visita_numero:
                nuovo_numero = ultimo_numero.visita_numero + 1
            else:
                nuovo_numero = 1

            visita = Visita(
                paziente=paziente,
                visita_numero=nuovo_numero,
                data_visita=visita_data_visita
            )

            if visita_data:
                for key, value in visita_data.items():
                    if hasattr(visita, key) and key not in ['visita_numero', 'data_visita']:
                        setattr(visita, key, value)

            visita.save()

            serializer = VisitaSerializer(visita)

            logger.info(f'Successfully saved visit id: {visita.id} for patient id: {paziente_id}')

            return JsonResponse({'success': True, 'visita': serializer.data})

        except TabellaPazienti.DoesNotExist:
            logger.error(f'Patient not found with id: {paziente_id}')
            return JsonResponse({'success': False, 'error': 'Paziente non trovato.'}, status=404)
        except Exception as e:
            logger.error(f'Error saving data: {str(e)}')
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    else:
        logger.error('Method not allowed')
        return JsonResponse({'success': False, 'error': 'Metodo non consentito.'}, status=405)



@csrf_exempt
def visite_paziente_view(request, persona_id):
    paziente = get_object_or_404(TabellaPazienti, id=persona_id)
    visite_list = Visita.objects.filter(paziente=paziente).order_by('-data_visita')

    paginator = Paginator(visite_list, 10)  # 10 visite per pagina
    page = request.GET.get('page')

    try:
        visite = paginator.page(page)
    except PageNotAnInteger:
        visite = paginator.page(1)
    except EmptyPage:
        visite = paginator.page(paginator.num_pages)

    context = {
        'persona': paziente,
        'visite': visite,
    }
    return render(request, 'cartella_paziente/visite.html', context)

@api_view(['GET'])
def get_visita(request, visita_id):
    try:
        visita = Visita.objects.get(id=visita_id)
    except Visita.DoesNotExist:
        return Response({'error': 'Visita non trovata'}, status=status.HTTP_404_NOT_FOUND)

    serializer = VisitaSerializer(visita)
    return Response(serializer.data)


@api_view(['GET'])
def get_visite_paziente(request, persona_id):
    try:
        logger.info(f'Request to get visits for patient id: {persona_id}')
        paziente = TabellaPazienti.objects.get(id=persona_id)
    except TabellaPazienti.DoesNotExist:
        logger.error(f'Patient not found with id: {persona_id}')
        return Response({'error': 'Paziente non trovato'}, status=404)

    visite = Visita.objects.filter(paziente=paziente).order_by('-data_visita')
    serializer = VisitaSerializer(visite, many=True)
    logger.info(f'Returning {len(visite)} visits for patient id: {persona_id}')
    return Response(serializer.data)
    try:
        logger.info(f'Request to get visits for patient id: {persona_id}')
        paziente = TabellaPazienti.objects.get(id=persona_id)
    except TabellaPazienti.DoesNotExist:
        logger.error(f'Patient not found with id: {persona_id}')
        return Response({'error': 'Paziente non trovato'}, status=404)

    visite = Visita.objects.filter(paziente=paziente).order_by('-data_visita')
    serializer = VisitaSerializer(visite, many=True)
    logger.info(f'Returning {len(visite)} visits for patient id: {persona_id}')
    return Response(serializer.data)