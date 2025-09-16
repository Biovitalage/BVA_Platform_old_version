"""
Views manage requests and redirect
"""

# --- IMPORTS STANDARD ---
import requests # type: ignore
import calendar
import json
import os
import traceback
import logging
import uuid

from datetime import date, datetime, timedelta
from collections import defaultdict
from rest_framework import generics, permissions
from django.utils import timezone
from django.db.models import DateField
from django.contrib import messages

# --- IMPORTS DI DJANGO ---
from django.core.cache import cache # type: ignore
from django.core.paginator import Paginator # type: ignore
from django.http import JsonResponse # type: ignore
from django.http import FileResponse, Http404
from django.contrib.auth.decorators import login_required
from django.views import View # type: ignore
from django.views.decorators.csrf import csrf_exempt # type: ignore
from django.shortcuts import render, get_object_or_404, redirect # type: ignore
from django.contrib import messages # type: ignore
from django.conf import settings # type: ignore
from django.utils import timezone as dj_timezone # type: ignore
from django.utils.decorators import method_decorator # type: ignore
from django.utils.timezone import now, localtime # type: ignore
from django.utils.dateparse import parse_date # type: ignore
from django.db.models import OuterRef, Subquery, Count, Q, Avg, Min, Max # type: ignore
from django.db.models.functions import ExtractMonth # type: ignore
from django.db.models.functions import Lower
from django.db.models.functions import ExtractMonth, ExtractWeekDay
from django.contrib.auth.hashers import check_password # type: ignore
from django.db.models import OuterRef # type: ignore
from django.contrib.auth import authenticate, login, logout # type: ignore
from django.contrib.auth.mixins import LoginRequiredMixin # type: ignore
from django.contrib.auth import update_session_auth_hash
from decimal import Decimal, InvalidOperation
from datetime import datetime, date
from django.utils import timezone

from BioVitalAge.api import serializers # type: ignore


# --- IMPORTS PERSONALI (APP) ---
from .utils import *
from BioVitalAge.funzioni_python.calcolo_capacita_vitale import *
from BioVitalAge.funzioni_python.calcolo_eta_biologica import *
from BioVitalAge.funzioni_python.calcoloMetabolica import *
from BioVitalAge.funzioni_python.calcolo_score import *

from .models import *
from BioVitalAge.error_handlers import catch_exceptions


# --- IMPORT API ------
from BioVitalAge.api.views import PazienteViewSet
from BioVitalAge.api.serializers import PazienteSerializer
from BioVitalAge.api.serializers import NotaSerializer



logger = logging.getLogger(__name__)

def get_user_role(request):
    """
    Restituisce il ruolo dell'utente autenticato, o None se non autenticato o senza credenziali.
    """
    user = getattr(request, 'user', None)

    if not user or not user.is_authenticated:
        return None
    
    cred = getattr(user, 'utentiregistraticredenziali', None)
    if not cred:
        return None
    
    return getattr(cred, 'role', None)




#----------------------------------------
# ----  SEZIONE LOGIN / HOME PAGE   -----
#----------------------------------------

# VIEW LOGIN
@method_decorator(catch_exceptions, name='dispatch')
class LoginRenderingPage(View):

    def get(self, request):
        response = render(request, 'includes/login.html')
        response.delete_cookie('disclaimer_accepted', path='/')
        return response

    def post(self, request):
        email    = request.POST.get('email')
        password = request.POST.get('password')
        user     = authenticate(request, username=email, password=password)

        if not user:
            return render(request, 'includes/login.html', {
                'error': 'Email o password non valide'
            })

        login(request, user)
        return redirect('HomePage')
    
# VIEW LOGOUT
@method_decorator(catch_exceptions, name='dispatch')
class LogOutRender(View):

    def get(self, request):
        logout(request)
        return redirect('loginPage')

# VIEW HOME PAGE
@method_decorator(catch_exceptions, name='dispatch')
class HomePageRender(LoginRequiredMixin,View):
    """Home render class"""

    login_url = 'loginPage'

    def get(self, request):
        """Function that handling get request for home page"""

        role = get_user_role(request)

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persone = TabellaPazienti.objects.order_by('created_at').all()
        today = timezone.now().date()
        total_biological_age_count = DatiEstesiRefertiEtaBiologica.objects.aggregate(total=Count('biological_age'))['total']

        if role == 'secretary':
            total_pazienti = TabellaPazienti.objects.all().count()
        else:
            # Filtra i pazienti in base al dottore loggato
            total_pazienti = TabellaPazienti.objects.filter(dottore=dottore).count()

        # Calcola il minimo e il massimo dell'età cronologica
        min_age = TabellaPazienti.objects.aggregate(min_age=Min('chronological_age'))['min_age']
        max_age = TabellaPazienti.objects.aggregate(max_age=Max('chronological_age'))['max_age']
        avg_age = TabellaPazienti.objects.aggregate(avg_age=Avg('chronological_age'))['avg_age']

        # Ottieni solo gli appuntamenti futuri
        if role == 'secretary':
            appuntamenti = Appointment.objects.filter(data__gte=today).order_by('data')[:4]
        else:
            appuntamenti = Appointment.objects.filter(dottore=dottore, data__gte=today).order_by('data')[:4]
        # Calcola il totale "biological_age" solo per i referti associati ai pazienti di questo dottore

        if role == 'secretary':
            total_biological_age_count = DatiEstesiRefertiEtaBiologica.objects.aggregate(total=Count('biological_age'))['total']
            total_pazienti = TabellaPazienti.objects.all().count()
        else:
            total_biological_age_count = DatiEstesiRefertiEtaBiologica.objects.filter(referto__paziente__dottore=dottore).aggregate(total=Count('biological_age'))['total']
            total_pazienti = TabellaPazienti.objects.filter(dottore=dottore).count()

        # Calcola min, max e media dell'età cronologica solo per i pazienti del dottore
        if role == 'secretary':
            agg_age = TabellaPazienti.objects.aggregate(
                min_age=Min('chronological_age'),
                max_age=Max('chronological_age'),
                avg_age=Avg('chronological_age')
            )
        else:
            agg_age = TabellaPazienti.objects.filter(dottore=dottore).aggregate(
                min_age=Min('chronological_age'),
                max_age=Max('chronological_age'),
                avg_age=Avg('chronological_age')
            )
        min_age = agg_age['min_age']
        max_age = agg_age['max_age']
        avg_age = agg_age['avg_age']

        if role == 'secretary':
            persone = TabellaPazienti.objects.all().order_by('-created_at')

        else:
            vs = PazienteViewSet()
            vs.request = request
            persone = vs.get_queryset().order_by('-created_at')

                
        # --- Calcolo per il report "Totale Pazienti" ---
        today = dj_timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_last_week = start_of_week - timedelta(days=7)
        end_of_last_week = start_of_week - timedelta(days=1)

        # Conta i pazienti creati nella settimana corrente e in quella precedente
        if role == 'secretary':
            current_week_patients = TabellaPazienti.objects.filter(created_at__gte=start_of_week).count()
            last_week_patients = TabellaPazienti.objects.filter(created_at__gte=start_of_last_week, created_at__lte=end_of_last_week).count()
        else:
            current_week_patients = TabellaPazienti.objects.filter(
                dottore=dottore, created_at__gte=start_of_week
            ).count()
            last_week_patients = TabellaPazienti.objects.filter(
                dottore=dottore, created_at__gte=start_of_last_week, created_at__lte=end_of_last_week
            ).count()

        # Calcola la differenza e la percentuale
        difference = current_week_patients - last_week_patients
        if last_week_patients > 0:
            percentage_increase = (difference / last_week_patients) * 100
        else:
            percentage_increase = 100 if current_week_patients > 0 else 0

         # --- Calcolo per il report "Totale Prescrizioni" ---

        # Utilizza il campo data_referto per filtrare i referti
        current_week_referti = RefertiEtaBiologica.objects.filter(data_referto__gte=start_of_week).count()
        last_week_referti = RefertiEtaBiologica.objects.filter(data_referto__gte=start_of_last_week,
                                                           data_referto__lte=end_of_last_week).count()
        
        difference_referti = current_week_referti - last_week_referti
        abs_difference_referti = abs(difference_referti)

        # Calcola la percentuale come valore assoluto
        if last_week_referti > 0:
            percentage_increase_referti = abs(difference_referti) / last_week_referti * 100
        else:
            percentage_increase_referti = 100 if current_week_referti > 0 else 0

        # Calcola la percentuale media delle età cronologiche
        if min_age is not None and max_age is not None and max_age != min_age:
            relative_position = (avg_age - min_age) / (max_age - min_age)  # valore fra 0 e 1
            media_percentage = relative_position * 100
        else:
            media_percentage = 0

        if dottore.cookie == "SI":
                context = {
                    'persone': persone,
                    'total_pazienti': total_pazienti,
                    'total_biological_age': total_biological_age_count,
                    'appuntamenti': appuntamenti,
                    'current_week_patients': current_week_patients,
                    'last_week_patients': last_week_patients,
                    'difference': difference,
                    'percentage_increase': percentage_increase,
                    'current_week_referti': current_week_referti,
                    'last_week_referti': last_week_referti,
                    'difference_referti': difference_referti,
                    'percentage_increase_referti': percentage_increase_referti,
                    'abs_difference_referti': abs_difference_referti,
                    'min_age': min_age,
                    'max_age': max_age,
                    'media_percentage': media_percentage,
                    'dottore': dottore,
                    'emails': get_gmail_emails_for_user(request.user),
                }
        else:
                context = {
                    'persone': persone,
                    'total_pazienti': total_pazienti,
                    'total_biological_age': total_biological_age_count,
                    'appuntamenti': appuntamenti,
                    'current_week_patients': current_week_patients,
                    'last_week_patients': last_week_patients,
                    'difference': difference,
                    'percentage_increase': percentage_increase,
                    'current_week_referti': current_week_referti,
                    'last_week_referti': last_week_referti,
                    'difference_referti': difference_referti,
                    'percentage_increase_referti': percentage_increase_referti,
                    'abs_difference_referti': abs_difference_referti,
                    'min_age': min_age,
                    'max_age': max_age,
                    'media_percentage': media_percentage,
                    'dottore': dottore,
                    'emails': get_gmail_emails_for_user(request.user),
                    'show_disclaimer': True
                }

        try:
            social_auth = UserSocialAuth.objects.get(user__email=dottore.email, provider="google-oauth2")
            emails = get_gmail_emails_for_user(social_auth.user)
        except UserSocialAuth.DoesNotExist:
            print("⚠️ Account Google non collegato per:", dottore.email)
            emails = []

        context["emails"] = emails 
        return render(request, "home_page/homePage.html", context)


# VIEW PER LA SEZIONE STATISTICHE
@method_decorator(catch_exceptions, name='dispatch')
class StatisticheView(LoginRequiredMixin, View):
    """Statistiche render class"""

    def get(self, request):
        """Function that handling statistiche get request"""

        role = get_user_role(request)
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        if role == 'secretary':
            qs = TabellaPazienti.objects.all()

        else:
            qs = TabellaPazienti.objects.filter(dottore=dottore)

        # Pazienti inseriti per mese
        month_labels = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"]
        monthly_qs = (
            qs
              .exclude(created_at__isnull=True)
              .annotate(mese=ExtractMonth('created_at'))
              .values('mese')
              .annotate(count=Count('id'))
        )
        monthly_counts = [0]*12
        for it in monthly_qs:
            monthly_counts[it['mese']-1] = it['count']

        # Fasce d'età per mese
        age_groups = [(0,5),(6,15),(16,25),(26,45),(46,200)]
        colors = ["#6a2dcc","#8041e0","#9666e4","#ad8be8","#c3b0ec"]
        today = date.today()
        age_datasets = []
        for idx, (min_age, max_age) in enumerate(age_groups):
            subqs = qs.filter(
                dob__lte = today - timedelta(days=365*min_age),
                dob__gt  = today - timedelta(days=365*(max_age+1))
            )
            sub_month = (
                subqs
                  .exclude(created_at__isnull=True)
                  .annotate(mese=ExtractMonth('created_at'))
                  .values('mese')
                  .annotate(count=Count('id'))
            )
            arr = [0]*12
            for it in sub_month:
                arr[it['mese']-1] = it['count']
            age_datasets.append({
                'label': f"{min_age}-{max_age if max_age<200 else '+'}",
                'data': arr,
                'backgroundColor': colors[idx]
            })

        # Pazienti per giorno della settimana
        week_labels = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"]
        weekly_qs = (
            qs
              .exclude(created_at__isnull=True)
              .annotate(day=ExtractWeekDay('created_at'))
              .values('day')
              .annotate(count=Count('id'))
              .filter(day__isnull=False)
        )
        weekly_counts = [0]*7
        for it in weekly_qs:
            weekly_counts[it['day']-1] = it['count']

        # Contesto e render
        context = {
            'dottore':        dottore,
            'monthly_labels': month_labels,
            'monthly_counts': monthly_counts,
            'age_labels':     month_labels,
            'age_datasets':   age_datasets,
            'weekly_labels':  week_labels,
            'weekly_counts':  weekly_counts,
            'emails':         get_gmail_emails_for_user(request.user),
        }
        return render(request, "home_page/statistiche.html", context)
    
# VIEW PER LE NOTIFICHE MEDICAL NEWS
class MedicalNewsNotificationsView(LoginRequiredMixin,View):
    def get(self, request, *args, **kwargs):
        try:
            # Controlla se i dati sono già in cache
            cached_news = cache.get('medical_news')
            if cached_news:
                return JsonResponse({"success": True, "news": cached_news})
            
            api_key = "80734c3bf8e34cf58beedc44db417a73"
            url = f"https://newsapi.org/v2/everything?q=medicina&language=it&apiKey={api_key}"
            response = requests.get(url)
            data = response.json()
            news = []
            # Controlla se lo status della risposta è "ok"
            if data.get("status") == "ok":
                # Usa la chiave "articles" per ottenere gli articoli
                articles = data.get("articles", [])
                for article in articles[:2]:
                    title = article.get("title", "Notizia medica")
                    description = article.get("description", "")
                    # Usa "publishedAt" per la data e prendi solo la parte della data
                    published_at = article.get("publishedAt", "")[:10]
                    # Usa "url" per ottenere il link
                    link = article.get("url", "#")
                    news.append({
                        "id": str(uuid.uuid4()),
                        "title": title,
                        "description": description,
                        "published_at": published_at,
                        "link": link,
                        "type": "info",
                        "origin": "medical"
                    })
                # Salva in cache per 30 minuti (1800 secondi)
                cache.set('medical_news', news, 1800)
            return JsonResponse({"success": True, "news": news})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})

# VIEW PER LE NOTIFICHE
class AppointmentNotificationsView(LoginRequiredMixin, View):
    
    def get(self, request, *args, **kwargs):
        try:
            # non serve più guardare request.session['dottore_id']
            dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

            # fuso orario, oggi/domani...
            now_local = timezone.localtime(timezone.now())
            today = now_local.date()
            tomorrow = today + timedelta(days=1)

            notifications = []
            # Appuntamenti di oggi per il dottore loggato
            todays_appts = Appointment.objects.filter(data=today, dottore=dottore)
            for appt in todays_appts:
                appt_time = appt.orario.strftime('%H:%M') if appt.orario else ""
                message = f"Oggi alle {appt_time} hai un appuntamento con {appt.nome_paziente} {appt.cognome_paziente}"
                notifications.append({"message": message, "type": "info"})
            
            # Appuntamenti di domani per il dottore loggato
            tomorrows_appts = Appointment.objects.filter(data=tomorrow, dottore=dottore)
            count_tomorrow = tomorrows_appts.count()
            if count_tomorrow > 0:
                message = f"Domani hai {count_tomorrow} appuntamenti in programma, vai nella sezione appuntamenti per visionarli."
                notifications.append({"message": message, "type": "warning"})
            
            return JsonResponse({"success": True, "notifications": notifications})
        
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)

# VIEW PER LE NOTIFICHE EMAIL
class EmailNotificationsView(LoginRequiredMixin, View):
    login_url = 'loginPage'
    redirect_field_name = 'next'

    def get(self, request, *args, **kwargs):
        # 1) recupera l'account Google collegato
        try:
            social = request.user.social_auth.get(provider='google-oauth2')
        except UserSocialAuth.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Nessun account Google collegato.'}, status=400)

        data = social.extra_data
        # 2) monta le Credentials con refresh_token e access_token
        creds = Credentials(
            token=data.get('access_token'),
            refresh_token=data.get('refresh_token'),
            token_uri='https://oauth2.googleapis.com/token',
            client_id=settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            client_secret=settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
            scopes=['https://www.googleapis.com/auth/gmail.readonly']
        )

        # 3) chiama Gmail API
        service = build('gmail', 'v1', credentials=creds)
        msgs = service.users().messages().list(userId='me', maxResults=10).execute()

        emails = []
        for m in msgs.get('messages', []):
            msg = (
                service.users()
                       .messages()
                       .get(userId='me', id=m['id'], format='metadata',
                            metadataHeaders=['Subject', 'From'])
                       .execute()
            )
            headers = {h['name']: h['value'] for h in msg['payload']['headers']}
            emails.append({
                'id':      m['id'],
                'subject': headers.get('Subject', '(no subject)'),
                'from':    headers.get('From', ''),
                'snippet': msg.get('snippet', ''),
                'link':    f'https://mail.google.com/mail/u/0/#all/{m["id"]}'
            })

        return JsonResponse({'success': True, 'emails': emails})

# VIEW PER LA SEZIONE PROFILO
def save(self, *args, **kwargs):
    if self.password and not self.password.startswith('pbkdf2_sha256$'):
        self.password = make_password(self.password)
    super().save(*args, **kwargs)

@method_decorator(catch_exceptions, name='dispatch')
class ProfileView(LoginRequiredMixin, View):

    login_url = 'loginPage'
    redirect_field_name = 'next'

    def get(self, request, *args, **kwargs):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        is_gmail_connected = UserSocialAuth.objects.filter(
            user__email=dottore.email, provider='google-oauth2'
        ).exists()

        return render(request, 'includes/profile.html', {
            'dottore': dottore,
            'gmail_linked': is_gmail_connected,
        })

    def post(self, request, *args, **kwargs):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        action = request.POST.get("action")

        if action == "update_profile":
            nome  = request.POST.get('name', '').strip()
            cognome = request.POST.get('surname', '').strip()
            email = request.POST.get('email', '').strip()
            password = request.POST.get('password', '')

            # Aggiorno solo i campi modificati
            if nome:
                dottore.nome = nome
            if cognome:
                dottore.cognome = cognome
            if email:
                dottore.email = email

            # Salvo la password solo se è stata cambiata davvero
            # qui `dottore.password` è l'hash memorizzato, e in form hai value="Password Criptografata"
            default_marker = "Password Criptografata"
            if password and password != default_marker:
                dottore.password = make_password(password)

            dottore.save()

            # Poi aggiorno anche il Django User
            user = request.user
            if email:
                user.email = email
                user.username = email
            if password and password != default_marker:
                user.set_password(password)
            user.save()

            # Mantieni la sessione attiva se la password è cambiata
            if password and password != default_marker:
                update_session_auth_hash(request, user)

            messages.success(request, "Profilo aggiornato correttamente.")
            return redirect("profile")

        elif action == "update_gmail":
            check_value = request.POST.get('check') == "SI"
            dottore.cookie = "SI" if check_value else ""
            dottore.save(update_fields=['cookie'])

            if not check_value:
                try:
                    social_account = UserSocialAuth.objects.get(
                        user__email=dottore.email, provider="google-oauth2"
                    )
                    social_account.delete()
                    messages.success(request, "Account Gmail disconnesso con successo.")
                except UserSocialAuth.DoesNotExist:
                    messages.info(request, "Nessun account Gmail collegato.")
            else:
                # rimando al flusso di Google OAuth
                return redirect("/auth/login/google-oauth2/?prompt=consent&access_type=offline")

            return redirect("profile")

        # se niente action valida
        messages.error(request, "Azione non riconosciuta.")
        return redirect("profile")


#----------------------------------------
#--------- SEZIONE APPUNTAMENTI ---------
#----------------------------------------

# VIEWS APPUNTAMENTI
class AppointmentViewHome(LoginRequiredMixin, View):
    def get(self, request):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        today = timezone.now().date()

        storico_appuntamenti = Appointment.objects.filter(
            dottore=dottore
        ).order_by('-data', '-orario')

        paginator = Paginator(storico_appuntamenti, 6)
        page_number = request.GET.get('page')
        storico_page = paginator.get_page(page_number)

        totale_appuntamenti = storico_appuntamenti.count()
        appuntamenti_confermati = storico_appuntamenti.filter(confermato=True).count()
        appuntamenti_passati = storico_appuntamenti.filter(data__lt=today).count()
        prossimo_appuntamento = storico_appuntamenti.filter(data__gte=today).order_by('data').first()
        ultimo_appuntamento = storico_appuntamenti.filter(data__lt=today).last()

        appuntamenti_per_mese = storico_appuntamenti.annotate(
            month=ExtractMonth('data')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')

        appuntamenti_per_mese_count = [0] * 12
        for item in appuntamenti_per_mese:
            appuntamenti_per_mese_count[item['month'] - 1] = item['count']

        context = {
            'dottore': dottore,
            'storico_appuntamenti': storico_appuntamenti,
            'totale_appuntamenti': totale_appuntamenti,
            'appuntamenti_confermati': appuntamenti_confermati,
            'prossimo_appuntamento': prossimo_appuntamento,
            'appuntamenti_passati': appuntamenti_passati,
            'ultimo_appuntamento': ultimo_appuntamento,
            'storico_page': storico_page,
            'appuntamenti_per_mese': appuntamenti_per_mese_count,
        }

        return render(request, 'home_page/Appuntamenti.html', context)

@method_decorator(catch_exceptions, name='dispatch')
class AppuntamentiView(LoginRequiredMixin,View):
    def get(self, request):
        profile = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        role = get_user_role(request)
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        # se può scegliere, passiamo la lista completa
        dottori = UtentiRegistratiCredenziali.objects.all() if role else None

        if role:
            persone = (
                TabellaPazienti.objects.all()
                .order_by(
                    Lower('name'),
                    Lower('surname'),
                )
            )

        # nella tua view:
        if not role:
            persone = (
                TabellaPazienti.objects
                .filter(dottore=dottore)
                .order_by(
                    Lower('name'),
                    Lower('surname'),
                )
            )

        if role:
            appuntamenti = Appointment.objects.all().order_by('-id')

        if not role:
            appuntamenti = Appointment.objects.filter(dottore=dottore).order_by('-id')


        # Ottieni le opzioni definite nei choices
        tipologia_appuntamenti = (
            Appointment.objects
            .exclude(tipologia_visita__isnull=True)
            .exclude(tipologia_visita__exact='')
            .values_list('tipologia_visita', flat=True)
            .distinct()
        )

        # Pulisci e ordina (facoltativo, ma consigliato)
        tipologia_appuntamenti = sorted(set([t.strip().title() for t in tipologia_appuntamenti]))
        numero_studio = [choice[0] for choice in Appointment._meta.get_field('numero_studio').choices]
        visita = Appointment._meta.get_field('visita').choices

        context = {
            'is_secretary': role,
            'dottori': dottori,
            'dottore': dottore,
            'persone': persone,
            'appuntamenti': appuntamenti,
            'tipologia_appuntamenti': tipologia_appuntamenti,
            'visita': visita,
            'numero_studio': numero_studio,
        }

        return render(request, 'includes/Calendario.html', context)
    
# VIEWS PER IL SALVATAGGIO DELL'APPUNTAMENTO
@method_decorator(catch_exceptions, name='dispatch')
class AppuntamentiSalvaView(LoginRequiredMixin, View):
    def post(self, request):
        data = json.loads(request.body.decode())
        profile = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        role = get_user_role(request)
        # se è segretaria/o, prendo il dottore scelto
        if role == "secretary":
            dott_id = data.get("dottore_id")
            if not dott_id:
                return JsonResponse(
                    {"success": False, "error": "Devi selezionare un dottore"},
                    status=400
                )
            dottore = get_object_or_404(UtentiRegistratiCredenziali, id=dott_id)
        else:
            # per tutti gli altri, continuo a usare il profilo loggato
            dottore = profile
        # Recupera il valore dal payload
        prezzo_raw = data.get("prezzo")

        # Normalizza se esiste
        if prezzo_raw is not None:
            prezzo_raw = str(prezzo_raw).strip()
            prezzo_raw = prezzo_raw.replace(""", "").replace(""", "").strip()
        else:
            prezzo_raw = ""

        # Se dopo il cleaning è vuoto, metti None
        if prezzo_raw == "":
            prezzo = None
        else:
            try:
                prezzo = Decimal(prezzo_raw)
            except (InvalidOperation, ValueError):
                return JsonResponse({
                    "success": False,
                    "error": f"Prezzo non valido: {prezzo_raw}"
                }, status=400)

        # Adesso creo l'appuntamento passando il dottore corretto:
        appt = Appointment.objects.create(
            tipologia_visita   = data.get("tipologia_visita"),
            paziente_id        = data.get("pazienteId"),
            nome_paziente      = data.get("nome_paziente"),
            cognome_paziente   = data.get("cognome_paziente"),
            numero_studio      = data.get("numero_studio"),
            note               = data.get("note"),
            giorno             = data.get("giorno"),
            data               = data.get("data"),
            orario             = data.get("orario"),
            visita             = data.get("visita"),
            prezzo             = prezzo,
            durata             = data.get("durata"),
            dottore            = dottore
        )

        # 🔥 DEBUG: restituisco anche il dottore associato per verificare
        return JsonResponse({
            "success": True,
            "message": "Appuntamento salvato!",
            "dottore_associato": {
                "id": appt.dottore.id,
                "nome": appt.dottore.nome,
                "cognome": appt.dottore.cognome,
            }
        })

# VIEWS SINGLE APPOINTMENT
@method_decorator(catch_exceptions, name='dispatch')
class GetSingleAppointmentView(LoginRequiredMixin, View):
    def get(self, request, appointment_id):
        try:
            is_secretary = get_user_role(request)

            if is_secretary == "secretary":
                appointment = get_object_or_404(Appointment, id=appointment_id)
            else:
                dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
                appointment = get_object_or_404(
                    Appointment,
                    id=appointment_id,
                    dottore=dottore
                )

            response_data = {
                "success": True,
                "id": appointment.id,
                'paziente_id': appointment.paziente_id,
                "nome_paziente": appointment.nome_paziente,
                "cognome_paziente": appointment.cognome_paziente,
                "giorno": appointment.giorno,
                "data": appointment.data.strftime("%Y-%m-%d"),
                "numero_studio": appointment.numero_studio or "",
                "note": appointment.note or "",
                "visita": appointment.visita or "",
                "prezzo": appointment.prezzo or "",
                "tipologia_visita": appointment.tipologia_visita or "",
                "orario": str(appointment.orario)[:5],
                "durata": appointment.durata or "",
                "dottore": {
                    "id": appointment.dottore.id,
                    "nome": appointment.dottore.nome,
                    "cognome": appointment.dottore.cognome,
                },
            }
            return JsonResponse(response_data)

        except Http404:
            # sia per dottore sbagliato, sia per appointment inesistente
            return JsonResponse(
                {"success": False, "error": "Appuntamento non trovato"},
                status=404
            )
        except Exception as e:
            # Stampa in console lo stack per debug
            import traceback; traceback.print_exc()
            return JsonResponse(
                {"success": False, "error": str(e)},
                status=500
            )

# VIEWS GET ALL APPOINTMENTS
@method_decorator(catch_exceptions, name='dispatch')
class AppuntamentiGetView(LoginRequiredMixin,View):
    def get(self, request):
        """Recupera gli appuntamenti futuri o di oggi"""
        email = request.user.email.lower()
        is_secretary = get_user_role(request)
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        if is_secretary == "secretary":
            dottore = get_object_or_404(
                UtentiRegistratiCredenziali,
                id=request.GET["dottore_id"]
            )
        else:
            dottore = get_object_or_404(
                UtentiRegistratiCredenziali,
                user=request.user
            )
        
        today = now().date()

        deleted_count= 0

        if is_secretary == "secretary":
            future_appointments = Appointment.objects.filter(
                data__gte=today,
            )
        else:
            future_appointments = Appointment.objects.filter(
                data__gte=today,
                dottore=dottore
            )

        appointments_by_date = {}
        for appointment in future_appointments:
            date_str = appointment.data.strftime("%Y-%m-%d")
            if date_str not in appointments_by_date:
                appointments_by_date[date_str] = []
            appointments_by_date[date_str].append({
                "id": appointment.id,
                'paziente_id': appointment.paziente_id,
                "nome_paziente": appointment.nome_paziente,
                "cognome_paziente": appointment.cognome_paziente,
                "giorno": appointment.giorno,
                "data": appointment.data,
                "numero_studio": appointment.numero_studio,
                "note": appointment.note,
                "visita": appointment.visita,
                "prezzo": appointment.prezzo,
                "tipologia_visita": appointment.tipologia_visita,
                "orario": appointment.orario,
            })

        return JsonResponse({"success": True, "deleted": deleted_count, "appointments": appointments_by_date})

# VIEWS UPDATE APPOINTMENT
@method_decorator(catch_exceptions, name='dispatch')
class UpdateAppointmentView(LoginRequiredMixin,View):
    def patch(self, request, appointment_id):
        try:
            data = json.loads(request.body)
            appointment = Appointment.objects.get(id=appointment_id)
            profile = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)


            # only allow doctor change to special user
            if profile.role == "secretary" and data.get("dottore_id"):
                        new_doc = get_object_or_404(UtentiRegistratiCredenziali, id=data["dottore_id"])
                        appointment.dottore = new_doc
            if data.get("new_date"):
                appointment.data = data["new_date"]
            if data.get("new_time"):
                appointment.orario = data["new_time"]
            if data.get("pazienteId"):
                appointment.paziente_id = data["pazienteId"]
            if data.get("nome_paziente"):
                appointment.nome_paziente = data["nome_paziente"]
            if data.get("cognome_paziente"):
                appointment.cognome_paziente = data["cognome_paziente"]
            if data.get("tipologia_visita"):
                appointment.tipologia_visita = data["tipologia_visita"]
            if data.get("numero_studio"):
                appointment.numero_studio = data["numero_studio"]
            if data.get("visita"):
                appointment.visita = data["visita"]
            if data.get("prezzo"):
                appointment.prezzo = data["prezzo"]
            if data.get("durata"):
                appointment.durata = data["durata"]
            if "note" in data:
                appointment.note = data["note"]
            
            appointment.save()
            return JsonResponse({
                "success": True,
                "message": "Appuntamento aggiornato!",
                "paziente_id": appointment.paziente.id if appointment.paziente else None,
                "dottore_associato": {
                    "id": appointment.dottore.id if appointment.dottore else None,
                    "nome": appointment.dottore.nome if appointment.dottore else "",
                    "cognome": appointment.dottore.cognome if appointment.dottore else "",
                }
            })

        except Appointment.DoesNotExist:
            return JsonResponse({"success": False, "error": "Appuntamento non trovato"}, status=404)
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)

# VIEWS APPROVE APPOINTMENT
@method_decorator(catch_exceptions, name='dispatch')
class ApproveAppointmentView(LoginRequiredMixin,View):
    def post(self, request, appointment_id):
        appointment = get_object_or_404(Appointment, id=appointment_id)
        appointment.confermato = True
        appointment.save()
        return JsonResponse({"success": True, "message": "Appuntamento confermato!"})

# VIEWS DELETE APPOINTMENT
@method_decorator(catch_exceptions, name='dispatch')
class DeleteAppointmentView(View):
    def post(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            appointment.delete()
            return JsonResponse({"success": True, "message": "Appuntamento eliminato con successo!"})
        except Appointment.DoesNotExist:
            return JsonResponse({"success": False, "error": "Appuntamento non trovato"}, status=404)
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)

# VIEW SEARCH APPOINTMENTS
@method_decorator(catch_exceptions, name='dispatch')
class SearchAppointmentsView(LoginRequiredMixin, View):
    def get(self, request):
        query = request.GET.get("q", "").lower().strip()
        if not query:
            return JsonResponse({"success": False, "error": "Nessuna query fornita"})

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        role = get_user_role(request)

        appointments = Appointment.objects.filter(
            Q(nome_paziente__icontains=query) |
            Q(tipologia_visita__icontains=query) |
            Q(orario__icontains=query)
        )

        if not role:
            appointments = appointments.filter(dottore=dottore)

        current_date = timezone.localdate()
        current_time = timezone.localtime().time()

        filtered = []
        for app in appointments:
            if app.data > current_date:
                filtered.append(app)
            elif app.data == current_date and app.orario >= current_time:
                filtered.append(app)

        results = [
            {
                "id": app.id,
                "nome_paziente": app.nome_paziente,
                "tipologia_visita": app.tipologia_visita,
                "orario": app.orario.strftime("%H:%M")
            }
            for app in filtered
        ]

        return JsonResponse({"success": True, "appointments": results})

# VIEW CREATE PATIENT FROM SECOND MODAL
@method_decorator(catch_exceptions, name='dispatch')
class CreaPazienteView(LoginRequiredMixin,View):

    login_url = 'loginPage'

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)

            dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
            name = data.get("name", "").strip()
            surname = data.get("surname", "").strip()
            phone = data.get("phone", "").strip()
            email = data.get("email", "").strip() 
            
            if not name or not surname:
                return JsonResponse({"success": False, "error": "Nome e cognome sono obbligatori!"}, status=400)

            if not dottore:
                return JsonResponse({"success": False, "error": "Devi essere autenticato per aggiungere un paziente."}, status=403)
            
            # Creazione paziente
            paziente = TabellaPazienti.objects.create(
                name=name,
                surname=surname,
                phone=phone,
                email=email,
                dottore=dottore
            )

            return JsonResponse({
                "success": True,
                "message": "Paziente aggiunto con successo!",
                "id": paziente.id,
                "full_name": f"{paziente.name} {paziente.surname}"
            })

        except json.JSONDecodeError:
            #print("❌ Errore JSON ricevuto nel backend!")  # DEBUG
            return JsonResponse({"success": False, "error": "Formato JSON non valido."}, status=400)

        except Exception as e:
            #print(f"❌ Errore nel backend: {e}")  # DEBUG
            return JsonResponse({"success": False, "error": str(e)}, status=500)





#----------------------------------------
# ------ SEZIONE AGGIUNGI PAZIENTE -------
#----------------------------------------

@method_decorator(catch_exceptions, name='dispatch')
class InserisciPazienteView(LoginRequiredMixin,View):

    def get(self, request):

        role = get_user_role(request)
        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        role = get_user_role(request)
        dottori = UtentiRegistratiCredenziali.objects.all() if role == "secretary" else UtentiRegistratiCredenziali.objects.filter(user=request.user)

        context = {
            'dottore' : dottore,
            'isSecretary' : role == "secretary",
            'dottori' : dottori,
        }
        return render(request, "includes/InserisciPaziente.html", context)  
    
    def post(self, request):
        print("POST DATA:", request.POST)

        role = get_user_role(request)

        try:
            success = None
            errore = None
            codice_fiscale = request.POST.get('codice_fiscale')
            
            dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
            dottori = UtentiRegistratiCredenziali.objects.all() if role == "secretary" else None

            context = {
                'dottore': dottore,
                'isSecretary': role == "secretary",
                'dottori': dottori
            }

            def parse_date(date_str):
                return date_str if date_str else None

            profile = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

            if role == "secretary":
                paziente = TabellaPazienti.objects.filter(codice_fiscale=codice_fiscale).first()
            else:
                paziente = TabellaPazienti.objects.filter(dottore=dottore, codice_fiscale=codice_fiscale).first()

            if paziente:
                dati_modificati = False
                for field in TabellaPazienti._meta.get_fields():
                    if not (hasattr(field, 'attname') and field.attname):
                        continue
                    field_name = field.attname
                    if field_name in ['id', 'dottore', 'codice_fiscale', 'created_at']:
                        continue

                    val = request.POST.get(field_name)
                    if val is not None:
                        current_val = getattr(paziente, field_name)
                        new_val = parse_date(val) if isinstance(field, models.DateField) else val
                        if str(current_val) != str(new_val):
                            setattr(paziente, field_name, new_val)
                            dati_modificati = True

                if dati_modificati:
                    paziente.save()
                    success = "I dati del paziente sono stati aggiornati con successo!"
                else:
                    errore = "⚠️ Il paziente esiste già e non sono stati forniti nuovi dati da aggiornare."
            else:
                if role == "secretary":
                    paziente = TabellaPazienti(
                        dottore_id = request.POST.get('dottore'),  
                        codice_fiscale=codice_fiscale,
                        name=request.POST.get('name'),
                        surname=request.POST.get('surname'),
                        dob=parse_date(request.POST.get('dob')),
                        gender=request.POST.get('gender'),
                        cap=request.POST.get('cap'),
                        province=request.POST.get('province'),
                        place_of_birth=request.POST.get('place_of_birth'),
                        chronological_age=request.POST.get('chronological_age')
                    )
                else:
                    paziente = TabellaPazienti(
                        dottore=dottore,
                        codice_fiscale=codice_fiscale,
                        name=request.POST.get('name'),
                        surname=request.POST.get('surname'),
                        dob=parse_date(request.POST.get('dob')),
                        gender=request.POST.get('gender'),
                        cap=request.POST.get('cap'),
                        province=request.POST.get('province'),
                        place_of_birth=request.POST.get('place_of_birth'),
                        chronological_age=request.POST.get('chronological_age')
                    )

                for field in TabellaPazienti._meta.get_fields():
                    if not (hasattr(field, 'attname') and field.attname):
                        continue
                    field_name = field.attname
                    if field_name in ['id', 'dottore', 'codice_fiscale', 'created_at', 'name', 'surname', 'dob', 'gender', 'cap', 'province', 'place_of_birth', 'chronological_age']:
                        continue

                    val = request.POST.get(field_name)
                    if val:
                        setattr(paziente, field_name, parse_date(val) if isinstance(field, models.DateField) else val)

                paziente.save()
                print("Paziente salvato:", paziente)
                success = "Nuovo paziente salvato con successo!"

            # 🔽 CREAZIONE REFERTI ETA' METABOLICA SE PRESENTI
            referto_fields = [
                f.attname for f in RefertiEtaMetabolica._meta.get_fields()
                if hasattr(f, 'attname') and f.attname not in ['id', 'dottore', 'paziente', 'data_referto', 'storico_punteggi']
            ]

            if any(request.POST.get(field) for field in referto_fields):
                nuovo_referto = RefertiEtaMetabolica(
                    dottore=dottore,
                    paziente=paziente,
                )

                for field in referto_fields:
                    val = request.POST.get(field)
                    if val:
                        field_obj = RefertiEtaMetabolica._meta.get_field(field)
                        if isinstance(field_obj, models.DateField):
                            setattr(nuovo_referto, field, parse_date(val))
                        elif isinstance(field_obj, models.JSONField):
                            try:
                                setattr(nuovo_referto, field, json.loads(val))
                            except:
                                setattr(nuovo_referto, field, []) 
                        else:
                            setattr(nuovo_referto, field, val)

                nuovo_referto.save()
                success = (success or "") + "Aggiunto nuovo paziente e generato il primo referto metabolico con successo!"

            if success:
                context["success"] = success
            if errore:
                context["errore"] = errore

            return render(request, "includes/InserisciPaziente.html", context)

        except Exception as e:
            context["errore"] = f"Errore di sistema: {str(e)}. Verifica i campi e riprova."
            return render(request, "includes/InserisciPaziente.html", context)











@method_decorator(catch_exceptions, name='dispatch')
class CartellaPazienteView(LoginRequiredMixin, View):

    ICD10_ENDPOINT = 'http://www.icd10api.com/'

    # ---------- GET ----------
    def get(self, request, id):
        role = get_user_role(request)

        # ICD10 (come da tuo codice)
        params = {'code': 'icd11', 'r': 'json', 'desc': 'long', 'type': 'cm'}
        resp = requests.get(self.ICD10_ENDPOINT, params=params)
        if resp.status_code != 200:
            return JsonResponse({'error': 'Impossibile contattare ICD10API',
                                 'status_code': resp.status_code}, status=502)
        data_icd = resp.json()

        # Paziente via ViewSet
        ViewSetResult = PazienteViewSet()
        ViewSetResult.request = request
        persona = ViewSetResult.get_patient_info(id)

        # NOTE del paziente
        note_list = Nota.objects.filter(paziente=persona).order_by('-created_at')

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        dottori = UtentiRegistratiCredenziali.objects.all() if role else None

        # Farmaci (paginati lato destra)
        farmaci = Farmaco.objects.all()
        paginator_farmaci = Paginator(farmaci, 3)
        page_number_farmaci = request.GET.get('page')
        farmaci_page = paginator_farmaci.get_page(page_number_farmaci)

        # Indicatori
        lista_filtered_value = ViewSetResult.get_datiEstesi_filtered(id)

        # Problemi / rischi
        problemi = Diagnosi.objects.filter(paziente=persona).values_list('problemi', flat=True)
        rischi = Diagnosi.objects.filter(paziente=persona).values_list('rischi', flat=True)

        # Indicatori performance
        ultimo_referto_capacita_vitale = persona.referti_test.order_by('-data_ora_creazione').first()

        # Storico appuntamenti (agenda, NON usato nella sezione VISITE del diario clinico)
        storico_appuntamenti = (
            Appointment.objects.filter(
                Q(nome_paziente__icontains=persona.name.strip()) |
                Q(cognome_paziente__icontains=persona.surname.strip())
            ).order_by('data', 'orario')
        )
        today = now().date()
        totale_appuntamenti = storico_appuntamenti.count()
        ultimo_appuntamento = storico_appuntamenti.filter(data__lt=today).last() or None
        prossimo_appuntamento = storico_appuntamenti.filter(data__gte=today).first() or None

        # ==========================
        #   VISITE + DIARIO CLINICO
        # ==========================
        # Sezione VISITE dedicata (MODEL: Visita)
        visite_qs = Visita.objects.filter(paziente=persona).order_by('-data_visita', '-visita_numero')
        visite_paginator = Paginator(visite_qs, 5)
        visite_page_number = request.GET.get('visite_page')
        visite_page = visite_paginator.get_page(visite_page_number)

        # Liste “pure” per sezioni dedicate
        farmaci_prescritti = PrescrizioneFarmaco.objects.filter(paziente=persona).order_by('-data_prescrizione')
        accertamenti_qs = PrescrizioniEsami.objects.filter(paziente=persona).order_by('-data_visita')

        # Diario MIX
        diario = []
        # Farmaci
        for f in farmaci_prescritti:
            diario.append({
                'id': f.id, 'tipo': 'Farmaco', 'data': f.data_prescrizione,
                'descrizione': f.farmaco.nome_farmaco, 'nome': f.farmaco.nome_farmaco,
                'posologia': f.farmaco.dosaggio, 'diagnosi': f.diagnosi, 'nota': f.note_medico,
            })
        # Accertamenti
        for a in accertamenti_qs:
            diario.append({
                'id': a.id, 'tipo': 'Accertamento', 'data': a.data_visita,
                'descrizione': a.esami_prescritti, 'diagnosi': '', 'nota': '',
            })
        # Visite cliniche
        for v in visite_qs:
            diario.append({
                'id': v.id, 'tipo': 'Visita', 'data': v.data_visita,
                'descrizione': f"Visita n° {v.visita_numero}", 'diagnosi': '', 'nota': '',
            })
        # NOTE (come eventi del Diario)
        for n in note_list:
            diario.append({
                'id': n.id,
                'tipo': 'Nota',
                'data': n.created_at,
                'descrizione': n.titolo,
                'diagnosi': '',
                'nome': '',
                'posologia': '',
                'nota': n.contenuto,
            })

        # Normalizza a datetime aware (per formato d/m/Y H:i in template) e ordina
        def _to_aware(dt_val):
            tz = timezone.get_current_timezone()
            if isinstance(dt_val, date) and not isinstance(dt_val, datetime):
                dt_val = datetime.combine(dt_val, datetime.min.time())
            if timezone.is_naive(dt_val):
                return timezone.make_aware(dt_val, tz)
            return timezone.localtime(dt_val, tz)

        for e in diario:
            e['data'] = _to_aware(e['data'])
        diario.sort(key=lambda e: e['data'], reverse=True)

        # --- elenco completo per modale ---
        diario_full = list(diario)

        # Paginazione del diario (8 elementi nel tab)
        diario_paginator = Paginator(diario, 8)
        diario_page_number = request.GET.get('diario_page')
        diario_page = diario_paginator.get_page(diario_page_number)

        # ==========================
        #      SCORE ORGANI & BIO
        # ==========================
        punteggi_organi, dettagli_organi, report_testuale, score_js = {}, {}, None, {}
        ultimo_referto = persona.referti.order_by('-data_ora_creazione').first()
        if ultimo_referto:
            try:
                dati = ultimo_referto.dati_estesi
                organi_esami = {
                    "Cuore": ["Colesterolo Totale", "Colesterolo LDL", "Colesterolo HDL", "Trigliceridi",
                              "PCR", "NT-proBNP", "Omocisteina", "Glicemia", "Insulina",
                              "HOMA Test", "IR Test", "Creatinina", "Stress Ossidativo", "Omega Screening"],
                    "Reni": ["Creatinina", "Azotemia", "Sodio", "Potassio", "Cloruri",
                             "Fosforo", "Calcio", "Esame delle Urine"],
                    "Fegato": ["Transaminasi GOT", "Transaminasi GPT", "Gamma-GT", "Bilirubina Totale",
                               "Bilirubina Diretta", "Bilirubina Indiretta", "Fosfatasi Alcalina",
                               "Albumina", "Proteine Totali"],
                    "Cervello": ["Omocisteina", "Vitamina B12", "Vitamina D", "DHEA", "TSH", "FT3",
                                 "FT4", "Omega-3 Index", "EPA", "DHA",
                                 "Stress Ossidativo dROMS", "Stress Ossidativo PAT", "Stress Ossidativo OSI REDOX"],
                    "Sistema Ormonale": ["TSH", "FT3", "FT4", "Insulina", "HOMA Test", "IR Test",
                                         "Glicemia", "DHEA", "Testosterone", "17B-Estradiolo",
                                         "Progesterone", "SHBG"],
                    "Sangue": ["Emocromo - Globuli Rossi", "Emocromo - Emoglobina", "Emocromo - Ematocrito",
                               "Emocromo - MCV", "Emocromo - MCH", "Emocromo - MCHC", "Emocromo - RDW",
                               "Emocromo - Globuli Bianchi", "Emocromo - Neutrofili", "Emocromo - Linfociti",
                               "Emocromo - Monociti", "Emocromo - Eosinofili", "Emocromo - Basofili",
                               "Emocromo - Piastrine", "Ferritina", "Sideremia", "Transferrina"],
                    "Sistema Immunitario": ["PCR", "Omocisteina", "TNF-A", "IL-6", "IL-10"],
                }
                TEST_FIELD_MAP = {
                    "Colesterolo Totale": "tot_chol", "Colesterolo LDL": "ldl_chol", "Colesterolo HDL": "hdl_chol_m",
                    "Trigliceridi": "trigl", "PCR": "pcr_c", "NT-proBNP": "nt_pro", "Omocisteina": "omocisteina",
                    "Glicemia": "glicemy", "Insulina": "insulin", "HOMA Test": "homa", "IR Test": "ir",
                    "Creatinina": "creatinine_m", "Stress Ossidativo": "osi", "Omega Screening": "o3o6_fatty_acid_quotient",
                    "Azotemia": "azotemia", "Sodio": "na", "Potassio": "k", "Cloruri": "ci", "Fosforo": "p", "Calcio": "ca", "Esame delle Urine": "uro",
                    "Transaminasi GOT": "got_m", "Transaminasi GPT": "gpt_m", "Gamma-GT": "g_gt_m",
                    "Bilirubina Totale": "tot_bili", "Bilirubina Diretta": "direct_bili", "Bilirubina Indiretta": "indirect_bili",
                    "Fosfatasi Alcalina": "a_photo_m", "Albumina": "albuminemia", "Proteine Totali": "tot_prot",
                    "Vitamina B12": "v_b12", "Vitamina D": "v_d", "DHEA": "dhea_m", "TSH": "tsh", "FT3": "ft3", "FT4": "ft4",
                    "Omega-3 Index": "o3_index", "EPA": "aa_epa", "DHA": "doco_acid",
                    "Stress Ossidativo dROMS": "d_roms", "Stress Ossidativo PAT": "pat", "Stress Ossidativo OSI REDOX": "osi",
                    "Testosterone": "testo_m", "17B-Estradiolo": "beta_es_m", "Progesterone": "prog_m", "SHBG": "shbg_m",
                    "Emocromo - Globuli Rossi": "rbc", "Emocromo - Emoglobina": "hemoglobin", "Emocromo - Ematocrito": "hematocrit",
                    "Emocromo - MCV": "mcv", "Emocromo - MCH": "mch", "Emocromo - MCHC": "mchc", "Emocromo - RDW": "rdw",
                    "Emocromo - Globuli Bianchi": "wbc", "Emocromo - Neutrofili": "neutrophils_pct", "Emocromo - Linfociti": "lymphocytes_pct",
                    "Emocromo - Monociti": "monocytes_pct", "Emocromo - Eosinofili": "eosinophils_pct", "Emocromo - Basofili": "basophils_pct",
                    "Emocromo - Piastrine": "platelets",
                    "Ferritina": "ferritin_m", "Sideremia": "sideremia", "Transferrina": "transferrin",
                    "TNF-A": "tnf_a", "IL-6": "inter_6", "IL-10": "inter_10",
                }
                organi_valori = {
                    organo: {test: getattr(dati, TEST_FIELD_MAP.get(test), None) for test in tests}
                    for organo, tests in organi_esami.items()
                }
                valori_esami_raw = {test: val for vals in organi_valori.values() for test, val in vals.items() if val is not None}
                sesso_paziente = getattr(persona, 'sesso', None)
                punteggi_organi, dettagli_organi = calcola_score_organi(valori_esami_raw, sesso_paziente)
                score_js = {organo.replace(' ', '_'): valore for organo, valore in punteggi_organi.items()}
                report_testuale = genera_report(punteggi_organi, dettagli_organi, mostrar_dettagli=False)
            except Exception:
                pass

        # Età / bio
        referti_eta = persona.referti_eta_metabolica.order_by('-data_referto')
        ultimo_referto_eta = referti_eta.first() if referti_eta.exists() else None
        punteggio_eta_metabolica = (
            ultimo_referto_eta.punteggio_finale
            if ultimo_referto_eta and ultimo_referto_eta.punteggio_finale is not None
            else (ultimo_referto_eta.eta_metabolica if ultimo_referto_eta else None)
        )
        dati_estesi_ultimo_bio = (
            DatiEstesiRefertiEtaBiologica.objects
            .filter(referto=persona.referti.order_by('-data_referto').first())
            .first()
        )
        diagnosi_list = Diagnosi.objects.filter(paziente=persona).order_by('-data_diagnosi', '-id')

        context = {
            'persona': persona,
            'dottore': dottore,
            'ultimo_referto_capacita_vitale': ultimo_referto_capacita_vitale,
            'storico_appuntamenti': storico_appuntamenti,
            'totale_appuntamenti': totale_appuntamenti,
            'ultimo_appuntamento': ultimo_appuntamento,
            'prossimo_appuntamento': prossimo_appuntamento,
            'dottori': dottori,
            'is_secretary': role == "secretary",
            'diagnosi_list': diagnosi_list,
            'icd10': data_icd,

            # sezione Farmaci (destra)
            'farmaci_page': farmaci_page,

            # sezioni Diario (tab)
            'farmaci_prescritti': farmaci_prescritti,
            'accertamenti_qs': accertamenti_qs,
            'visite_qs': visite_qs,
            'diario_page': diario_page,
            'diario_full': diario_full,

            # opzionale, se ti serve altrove
            'visite_page': visite_page,

            # Indicatori
            "Salute_del_cuore": lista_filtered_value[0],
            "Salute_del_rene": lista_filtered_value[1],
            "Salute_epatica": lista_filtered_value[2],
            "Salute_cerebrale": lista_filtered_value[3],
            "Salute_ormonale": lista_filtered_value[4],
            "Salute_del_sangue": lista_filtered_value[5],
            "Salute_immunitario": lista_filtered_value[6],

            # Score JS + dettagli
            'score': score_js,
            'punteggi_organi': punteggi_organi,
            'dettagli_organi': dettagli_organi,
            'report_testuale': report_testuale,

            # Note (se vuoi ancora usare la modale di creazione)
            'note_list': note_list,

            # Età / bio
            'punteggio_eta_metabolica': punteggio_eta_metabolica,
            'dati_estesi_ultimo_bio': dati_estesi_ultimo_bio,

            # Problemi / Rischi
            'problemi': problemi,
            'rischi': rischi,
        }
        return render(request, "includes/cartellaPaziente.html", context)

    # ---------- PATCH ----------
    def patch(self, request, id):
        try:
            data = json.loads(request.body)
            update_type = data.get('type')

            if update_type == 'diario':
                return self._update_diario(request, id, data)
            elif update_type == 'farmaco':
                return self._update_farmaco(request, id, data)
            elif update_type == 'prescrizione_libera':
                return self._update_prescrizione_libera(request, id, data)
            else:
                return JsonResponse({'success': False, 'error': 'Tipo di aggiornamento non riconosciuto'}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Dati JSON non validi'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def _update_diario(self, request, id, data):
        try:
            entry_id = data.get('id')
            diagnosi = data.get('diagnosi', '')
            nota = data.get('nota', '')
            prescrizione = PrescrizioneFarmaco.objects.filter(id=entry_id, paziente_id=id).first()
            if prescrizione:
                prescrizione.diagnosi = diagnosi
                prescrizione.note_medico = nota
                prescrizione.save()
                return JsonResponse({'success': True})
            return JsonResponse({'success': False, 'error': 'Voce diario non trovata'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def _update_farmaco(self, request, id, data):
        try:
            prescrizione_id = data.get('id')
            nome_farmaco = data.get('nome_farmaco', '')
            dosaggio = data.get('dosaggio', '')
            prescrizione = PrescrizioneFarmaco.objects.filter(id=prescrizione_id, paziente_id=id).first()
            if not prescrizione:
                return JsonResponse({'success': False, 'error': 'Prescrizione non trovata'}, status=404)
            farmaco, created = Farmaco.objects.get_or_create(
                nome_farmaco=nome_farmaco, defaults={'dosaggio': dosaggio}
            )
            if not created and dosaggio:
                farmaco.dosaggio = dosaggio
                farmaco.save()
            prescrizione.farmaco = farmaco
            prescrizione.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def _update_prescrizione_libera(self, request, id, data):
        try:
            prescrizione_id = data.get('id')
            testo = data.get('testo', '')
            prescrizione = PrescrizioneLibera.objects.filter(id=prescrizione_id, persona_id=id).first()
            if not prescrizione:
                return JsonResponse({'success': False, 'error': 'Prescrizione libera non trovata'}, status=404)
            prescrizione.testo = testo
            prescrizione.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    # ---------- POST ----------
    def post(self, request, id):
        role = get_user_role(request)

        def parse_italian_date(value):
            try:
                return datetime.strptime(value, "%d/%m/%Y").date()
            except (ValueError, TypeError):
                return None

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)

        # NOTE del paziente anche in POST (per re-render coerente)
        note_list = Nota.objects.filter(paziente=persona).order_by('-created_at')

        dati_diagnosi = Diagnosi.objects.filter(paziente=persona)

        # Farmaci (paginati lato destra)
        farmaci = Farmaco.objects.all()
        paginator_farmaci = Paginator(farmaci, 3)
        page_number_farmaci = request.GET.get('page')
        farmaci_page = paginator_farmaci.get_page(page_number_farmaci)

        # Creazione/aggiornamento diagnosi (come nel tuo codice)
        if request.POST.get('data_nuova_diagnosi') and request.POST.get('descrizione_nuova_diagnosi'):
            try:
                data_diagnosi = datetime.strptime(request.POST.get('data_nuova_diagnosi'), "%Y-%m-%d").date()
                descrizione = request.POST.get('descrizione_nuova_diagnosi')
                problemi = request.POST.get('problemi', '')
                nuova_diagnosi = Diagnosi.objects.create(
                    paziente=persona, descrizione=descrizione, data_diagnosi=data_diagnosi,
                    problemi=problemi, stato='attiva', gravita=1, risolta=False
                )
                diagnosi_id = str(nuova_diagnosi.id)
            except Exception:
                diagnosi_id = request.POST.get('diagnosi_id')
        else:
            diagnosi_id = request.POST.get('diagnosi_id')

        problemi_val = request.POST.get('problemi')
        rischi_val = request.POST.get('rischi')
        data_diagnosi_val = request.POST.get('data_diagnosi')
        note_diagnosi_val = request.POST.get('note_diagnosi')

        if (problemi_val or rischi_val or data_diagnosi_val or note_diagnosi_val) and diagnosi_id and diagnosi_id != '__new__':
            try:
                diagnosi_obj = get_object_or_404(Diagnosi, id=diagnosi_id, paziente=persona)
                if problemi_val is not None: diagnosi_obj.problemi = problemi_val
                if rischi_val is not None:   diagnosi_obj.rischi = rischi_val
                if data_diagnosi_val:
                    parsed = parse_italian_date(data_diagnosi_val)
                    if parsed: diagnosi_obj.data_diagnosi = parsed
                if note_diagnosi_val is not None: diagnosi_obj.note = note_diagnosi_val
                diagnosi_obj.save()
            except Exception:
                pass

        # Ricalcoli ausiliari (come in GET)
        today = now().date()
        storico_app = Appointment.objects.filter(
            Q(nome_paziente__icontains=persona.name.strip()) &
            Q(cognome_paziente__icontains=persona.surname.strip())
        ).order_by('data', 'orario')
        ultimo_appuntamento = storico_app.filter(data__lt=today).last()
        prossimo_appuntamento = storico_app.filter(data__gte=today).first()
        ultimo_referto_capacita_vitale = persona.referti_test.order_by('-data_ora_creazione').first()

        referti_recenti_eta = persona.referti_eta_metabolica.all().order_by('-data_referto')
        ultimo_referto_eta_metabolica = referti_recenti_eta.first() if referti_recenti_eta.exists() else None

        referti_recenti = persona.referti.all().order_by('-data_referto')
        dati_estesi = DatiEstesiRefertiEtaBiologica.objects.filter(referto__in=referti_recenti)
        ultimo_referto = referti_recenti.first() if referti_recenti else None
        farmaci_prescritti = PrescrizioneFarmaco.objects.filter(paziente=persona).order_by('-data_prescrizione')

        dati_estesi_ultimo_referto = None
        if ultimo_referto:
            dati_estesi_ultimo_referto = DatiEstesiRefertiEtaBiologica.objects.filter(referto=ultimo_referto).first()

        diagnosi_list = Diagnosi.objects.filter(paziente=persona).order_by('-data_diagnosi', '-id')

        # VISITE + DIARIO come in GET
        visite_qs = Visita.objects.filter(paziente=persona).order_by('-data_visita', '-visita_numero')
        visite_paginator = Paginator(visite_qs, 5)
        visite_page_number = request.POST.get('visite_page') or request.GET.get('visite_page')
        visite_page = visite_paginator.get_page(visite_page_number)

        accertamenti_qs = PrescrizioniEsami.objects.filter(paziente=persona).order_by('-data_visita')

        diario = []
        for f in farmaci_prescritti:
            diario.append({
                'id': f.id, 'tipo': 'Farmaco', 'data': f.data_prescrizione,
                'descrizione': f.farmaco.nome_farmaco, 'nome': f.farmaco.nome_farmaco,
                'posologia': f.farmaco.dosaggio, 'diagnosi': f.diagnosi, 'nota': f.note_medico,
            })
        for a in accertamenti_qs:
            diario.append({
                'id': a.id, 'tipo': 'Accertamento', 'data': a.data_visita,
                'descrizione': a.esami_prescritti, 'diagnosi': '', 'nota': '',
            })
        for v in visite_qs:
            diario.append({
                'id': v.id, 'tipo': 'Visita', 'data': v.data_visita,
                'descrizione': f"Visita n° {v.visita_numero}", 'diagnosi': '', 'nota': '',
            })
        # NOTE (come eventi del Diario) anche in POST
        for n in note_list:
            diario.append({
                'id': n.id,
                'tipo': 'Nota',
                'data': n.created_at,
                'descrizione': n.titolo,
                'diagnosi': '',
                'nome': '',
                'posologia': '',
                'nota': n.contenuto,
            })

        def _to_aware(dt_val):
            tz = timezone.get_current_timezone()
            if isinstance(dt_val, date) and not isinstance(dt_val, datetime):
                dt_val = datetime.combine(dt_val, datetime.min.time())
            if timezone.is_naive(dt_val):
                return timezone.make_aware(dt_val, tz)
            return timezone.localtime(dt_val, tz)

        for e in diario:
            e['data'] = _to_aware(e['data'])
        diario.sort(key=lambda e: e['data'], reverse=True)

        # --- elenco completo per modale ---
        diario_full = list(diario)

        # Paginazione del diario (8 nel tab)
        diario_paginator = Paginator(diario, 8)
        diario_page_number = request.POST.get('diario_page') or request.GET.get('diario_page')
        diario_page = diario_paginator.get_page(diario_page_number)

        context = {
            'persona': persona,
            'referti_recenti': referti_recenti,
            'dati_estesi': dati_estesi,
            'dati_estesi_ultimo_referto': dati_estesi_ultimo_referto,
            'dottore': dottore,
            'referti_test_recenti': ultimo_referto,
            'ultimo_appuntamento': ultimo_appuntamento,
            'prossimo_appuntamento': prossimo_appuntamento,

            # destra
            'farmaci_page': farmaci_page,
            'farmaci_prescritti': farmaci_prescritti,

            # sezioni Diario
            'accertamenti_qs': accertamenti_qs,
            'visite_qs': visite_qs,
            'diario_page': diario_page,
            'diario_full': diario_full,
            'visite_page': visite_page,

            'dati_diagnosi': dati_diagnosi,
            'diagnosi_list': diagnosi_list,
            'ultimo_referto_eta_metabolica': ultimo_referto_eta_metabolica,
            'ultimo_referto_capacita_vitale': ultimo_referto_capacita_vitale,

            # Note per eventuale modale di creazione
            'note_list': note_list,

            "success": True,
        }
        return render(request, "includes/cartellaPaziente.html", context)



























@method_decorator(csrf_exempt, name='dispatch')
class AggiungiFarmacoView(LoginRequiredMixin, View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            paziente_id = data.get('paziente_id')
            
            # Controlla se è una lista di farmaci o un singolo farmaco
            farmaci_data = data.get('farmaci', [])
            if not farmaci_data:
                # Fallback per singolo farmaco (compatibilità)
                farmaci_data = [data]

            if not paziente_id:
                return JsonResponse({'success': False, 'error': 'paziente_id è obbligatorio'}, status=400)
            
            # Usa TabellaPazienti invece di User
            paziente = get_object_or_404(TabellaPazienti, id=paziente_id)
            
            # Ottieni il medico da UtentiRegistratiCredenziali
            try:
                medico = UtentiRegistratiCredenziali.objects.get(user=request.user)
            except UtentiRegistratiCredenziali.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Medico non trovato'}, status=400)

            prescrizioni_create = []
            oggi = timezone.now().date()

            # Processa ogni farmaco nella lista
            for farmaco_data in farmaci_data:
                codice_farmaco = farmaco_data.get('codice')
                nome_farmaco = farmaco_data.get('nome')
                principio_attivo = farmaco_data.get('principio', '')
                cod_aic = farmaco_data.get('aic', '')
                cod_atc = farmaco_data.get('atc', '')
                dosaggio = farmaco_data.get('dosaggio', '')
                apparato = farmaco_data.get('apparato', '')
                data_inizio = farmaco_data.get('data_inizio', oggi)
                data_fine = farmaco_data.get('data_fine', None)
                posologia = farmaco_data.get('posologia', '')
                note = farmaco_data.get('note', '')
                diagnosi = farmaco_data.get('diagnosi', '')

                if not codice_farmaco:
                    continue  # Salta farmaci senza codice

                # Crea o ottieni il farmaco
                farmaco, created = Farmaco.objects.get_or_create(
                    codice_univoco_farmaco=codice_farmaco,
                    defaults={
                        'nome_farmaco': nome_farmaco,
                        'principio_attivo': principio_attivo,
                        'cod_aic': cod_aic,
                        'cod_atc': cod_atc,
                        'dosaggio': dosaggio,
                        'apparato_sistemi': apparato,
                    }
                )

                # Controlla se già prescritto oggi
                prescrizione_esistente = PrescrizioneFarmaco.objects.filter(
                    paziente=paziente,
                    farmaco=farmaco,
                    data_prescrizione__date=oggi
                ).exists()

                if prescrizione_esistente:
                    continue  # Salta farmaci già prescritti oggi

                # Crea la prescrizione
                prescrizione = PrescrizioneFarmaco.objects.create(
                    paziente=paziente,
                    medico=medico,
                    farmaco=farmaco,
                    data_inizio=data_inizio if isinstance(data_inizio, str) else data_inizio,
                    data_fine=datetime.strptime(data_fine, '%Y-%m-%d').date() if data_fine else None,
                    posologia_personalizzata=posologia,
                    note_medico=note,
                    diagnosi=diagnosi,
                    stato='attiva'
                )
                prescrizioni_create.append(prescrizione)

            if not prescrizioni_create:
                return JsonResponse({'success': False, 'error': 'Nessun farmaco è stato aggiunto (potrebbero essere già prescritti)'}, status=400)

            return JsonResponse({
                'success': True,
                'message': f'{len(prescrizioni_create)} farmaco/i aggiunto/i con successo',
                'prescrizioni_create': len(prescrizioni_create)
            })

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Formato JSON non valido'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Errore interno: {str(e)}'}, status=500)

# RIMUOVI FARMACO
@method_decorator(csrf_exempt, name='dispatch')
class RimuoviFarmacoView(LoginRequiredMixin, View):
    def post(self, request, prescrizione_id):
        try:
            prescrizione = get_object_or_404(PrescrizioneFarmaco, id=prescrizione_id)
            if prescrizione.medico != request.user:
                return JsonResponse({'success': False, 'error': 'Non hai i permessi per modificare questa prescrizione'}, status=403)
            prescrizione.stato = 'sospesa'
            prescrizione.data_fine = timezone.now().date()
            prescrizione.save()
            return JsonResponse({'success': True, 'message': 'Prescrizione sospesa con successo'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Errore: {str(e)}'}, status=500)

# GET FARMACI PRESCRITTI
class GetFarmaciPazienteView(LoginRequiredMixin, View):
    def get(self, request, paziente_id):
        try:
            paziente = get_object_or_404(User, id=paziente_id)
            prescrizioni = PrescrizioneFarmaco.objects.filter(
                paziente=paziente,
                stato='attiva'
            ).select_related('farmaco', 'medico').order_by('-data_prescrizione')
            farmaci_data = []
            for prescrizione in prescrizioni:
                farmaci_data.append({
                    'id': prescrizione.id,
                    'nome_farmaco': prescrizione.farmaco.nome_farmaco,
                    'dosaggio': prescrizione.farmaco.dosaggio,
                    'principio_attivo': prescrizione.farmaco.principio_attivo,
                    'data_prescrizione': prescrizione.data_prescrizione.strftime('%d/%m/%Y'),
                    'data_inizio': prescrizione.data_inizio.strftime('%d/%m/%Y'),
                    'posologia': prescrizione.posologia_personalizzata or prescrizione.farmaco.posologia_adulto,
                    'note': prescrizione.note_medico,
                    'diagnosi': prescrizione.diagnosi,
                    'medico': f"{prescrizione.medico.first_name} {prescrizione.medico.last_name}",
                    'stato': prescrizione.get_stato_display()
                })
            return JsonResponse({'success': True, 'farmaci': farmaci_data})
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Errore: {str(e)}'}, status=500)

# VIEW NOTA
@method_decorator(catch_exceptions, name='dispatch')
class CartellaPazienteNote(LoginRequiredMixin,View):

        def post(self, request, id):

            role = get_user_role(request)
            persona = get_object_or_404(TabellaPazienti, id=id)
            nota_id = request.POST.get('nota_id')
            titolo_nota = request.POST.get('titolo_nota')
            contenuto_nota = request.POST.get('contenuto_nota')

            # Se il form delle note è stato inviato (identificato dalla presenza del titolo o del contenuto)
            if titolo_nota or contenuto_nota:
                if nota_id:
                    nota = get_object_or_404(Nota, id=nota_id, paziente=persona)
                    nota.titolo = titolo_nota
                    nota.contenuto = contenuto_nota
                    nota.save()
                    messages.success(request, 'Nota aggiornata con successo!')
                else:
                    Nota.objects.create(
                        paziente=persona,
                        titolo=titolo_nota,
                        contenuto=contenuto_nota
                    )
                    messages.success(request, 'Nota creata con successo!')
                    return redirect('cartella_paziente', id=id)

            return redirect('cartella_paziente', id=id)

from django.http import JsonResponse

from django.utils import timezone

class CartellaPazienteProblemi(LoginRequiredMixin, View):
    def post(self, request, id):
        """
        Riceve una richiesta POST dal front-end per aggiornare il campo 'problemi'
        del model Diagnosi relativo al paziente specificato.
        Ora renderizza la tabella delle diagnosi aggiornata.
        """
        persona = get_object_or_404(TabellaPazienti, id=id)
        problema_request = request.POST.get('problemi', '').strip()

        if not problema_request:
            # Puoi anche mostrare un messaggio di errore nella tabella
            diagnosi_list = Diagnosi.objects.filter(paziente=persona).order_by('-data_diagnosi', '-id')
            context = {
                'persona': persona,
                'diagnosi_list': diagnosi_list,
                'errore': 'Nessun problema fornito.'
            }
            return render(request, "cartella_paziente/sezioni_storico/diagnosi.html", context)

        # Recupera la diagnosi più recente o ne crea una nuova se non esiste
        diagnosi = Diagnosi.objects.filter(paziente=persona).order_by('-id').first()
        if not diagnosi:
            diagnosi = Diagnosi(paziente=persona, data_diagnosi=timezone.now().date())
        elif not diagnosi.data_diagnosi:
            diagnosi.data_diagnosi = timezone.now().date()

        diagnosi.problemi = problema_request
        diagnosi.save()

        # Recupera tutte le diagnosi aggiornate per la tabella
        diagnosi_list = Diagnosi.objects.filter(paziente=persona).order_by('-data_diagnosi', '-id')

        context = {
            'persona': persona,
            'diagnosi_list': diagnosi_list,
            'success': True,
        }
        return render(request, "cartella_paziente/sezioni_storico/diagnosi.html", context)


# VIEW NOTA
@method_decorator(catch_exceptions, name='dispatch')
class NotaListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = NotaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # /api/pazienti/<pk>/note/
        paziente_id = self.kwargs['paziente_pk']
        return Nota.objects.filter(paziente_id=paziente_id)

    def perform_create(self, serializer):
        paziente = get_object_or_404(
            TabellaPazienti,
            pk=self.kwargs['paziente_pk']
        )
        serializer.save(paziente=paziente)   # autori/dottori qui se servono
            # ▼▼▼ mostri gli errori se la validazione fallisce
        if not serializer.is_valid():
            print("VALIDATION ERRORS →", serializer.errors)
            raise serializers.ValidationError(serializer.errors)

        serializer.save(paziente=paziente)

@method_decorator(catch_exceptions, name='dispatch')
class NotaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Nota.objects.filter(paziente_id=self.kwargs['paziente_pk'])


# VIEW DIARIO CLINICO
@method_decorator(catch_exceptions, name='dispatch')
def normalize_datetime_for_sorting(date_value):
    """
    Normalizza date/datetime per il sorting gestendo timezone
    """
    if date_value is None:
        return timezone.now().replace(year=1900)

    if isinstance(date_value, date) and not isinstance(date_value, datetime):
        dt = datetime.combine(date_value, datetime.min.time())
    elif isinstance(date_value, datetime):
        dt = date_value
    else:
        return timezone.now().replace(year=1900)

    if timezone.is_aware(dt):
        dt = timezone.localtime(dt).replace(tzinfo=None)

    return dt

class DiarioCLinicoView(LoginRequiredMixin,View):
    def get(self, request, id):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user) 
        persona = get_object_or_404(TabellaPazienti, id=id)

        # Farmaci prescritti
        farmaci = PrescrizioneFarmaco.objects.filter(paziente=persona).order_by('-data_prescrizione')

        # Accertamenti (PrescrizioniEsami)
        accertamenti = PrescrizioniEsami.objects.filter(paziente=persona).order_by('-data_visita')

        # Prescrizioni libere
        prescrizioni_libere = PrescrizioneLibera.objects.filter(persona=persona).order_by('-data_creazione')

        # Visite/Appuntamenti
        visite = Appointment.objects.filter(paziente=persona).order_by('-data')

        # Unifica tutto in un'unica lista/dizionario per il diario
        diario = []
        for f in farmaci:
            diario.append({
                'tipo': 'Farmaco',
                'data': f.data_prescrizione,
                'descrizione': f.farmaco.nome_farmaco,
                'diagnosi': f.diagnosi,
                'nota': f.note_medico,
            })
        for a in accertamenti:
            diario.append({
                'tipo': 'Accertamento',
                'data': a.data_visita,
                'descrizione': a.esami_prescritti,
                'diagnosi': '',
                'nota': '',
            })
        for pl in prescrizioni_libere:
            diario.append({
                'tipo': 'PrescrizioneLibera',
                'data': pl.data_creazione,
                'descrizione': pl.testo,
                'diagnosi': '',
                'nota': '',
            })
        for v in visite:
            diario.append({
                'tipo': 'Visita',
                'data': v.data,
                'descrizione': v.tipologia_visita,
                'diagnosi': '',
                'nota': v.note,
            })
        

        # Ordina per data decrescente
        diario.sort(key=lambda x: x['data'], reverse=True)
        print(diario)

        context = {
            'persona': persona,
            'diario': diario,
            # ... altri dati già presenti
        }
        return render(request, 'includes/cartellaPaziente.html', context)



# VIEW STORICO
@method_decorator(catch_exceptions, name='dispatch')
class StoricoView(LoginRequiredMixin,View):
    def get(self, request, id):
        # Recupero Dottore e Paziente
        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)
        
        today = timezone.now().date()  # Ottieni la data corrente senza l'orario

        # Filtra gli appuntamenti del paziente in base al nome e cognome
        storico_appuntamenti = Appointment.objects.filter(
            Q(nome_paziente__icontains=persona.name.strip()) &
            Q(cognome_paziente__icontains=persona.surname.strip()) &
            Q(dottore=dottore)  # Aggiungi il filtro per il dottore
        ).order_by('data', 'orario')

        # Impostazione del paginatore (ad es. 10 referti per pagina)
        paginator = Paginator(storico_appuntamenti, 4)
        page_number = request.GET.get('page')
        storico_page = paginator.get_page(page_number)

        # Totale appuntamenti per il paziente
        totale_appuntamenti = storico_appuntamenti.count()

        # Appuntamenti confermati
        appuntamenti_confermati = storico_appuntamenti.filter(confermato=True).count()

        # Calcolo appuntamenti per mese
        appuntamenti_per_mese = storico_appuntamenti.annotate(month=ExtractMonth('data')).values('month').annotate(count=Count('id')).order_by('month')

         # Crea una lista con i conteggi degli appuntamenti per ogni mese (1-12)
        appuntamenti_per_mese_count = [0] * 12  # Inizializza una lista di 12 valori (uno per ogni mese)

        # Appuntamento futuro più vicino (il prossimo)
        prossimo_appuntamento = storico_appuntamenti.filter(data__gte=today).order_by('data').first()

        # Appuntamenti passati (count degli appuntamenti con data < oggi)
        appuntamenti_passati = storico_appuntamenti.filter(data__lt=today).count()

        # Appuntamenti passati (ultimi)
        ultimo_appuntamento = storico_appuntamenti.filter(data__lt=today).last()

        for item in appuntamenti_per_mese:
            # Popola il conteggio per ogni mese (mese - 1 perché i mesi in Python sono indicizzati da 1 a 12)
            appuntamenti_per_mese_count[item['month'] - 1] = item['count']

        context = {
            'dottore': dottore,
            'persona': persona,
            'storico_appuntamenti': storico_appuntamenti,
            'totale_appuntamenti': totale_appuntamenti,
            'appuntamenti_confermati': appuntamenti_confermati,
            'prossimo_appuntamento': prossimo_appuntamento,
            'appuntamenti_passati': appuntamenti_passati,
            'ultimo_appuntamento': ultimo_appuntamento,
            'storico_page': storico_page,
            'appuntamenti_per_mese': appuntamenti_per_mese_count,
        }

        return render(request, 'cartella_paziente/sezioni_storico/storico.html', context)

## VIEW ESAMI
@method_decorator(catch_exceptions, name='dispatch')
class EsamiView(View):
    def get(self, request, id):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)

        context = {
            'persona': persona,
            'dottore': dottore,
        }

        return render(request, 'cartella_paziente/sezioni_storico/esami.html', context)

## VIEW TERAPIA
@method_decorator(catch_exceptions, name='dispatch')
class TerapiaView(View):
    def get(self, request, id):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)

        # Terape in studio (se vuoi mostrarle anche in GET)
        terapie_studio = TerapiaInStudio.objects.filter(paziente=persona).order_by('data_inizio')
        terapie_domiciliari = TerapiaDomiciliare.objects.filter(paziente=persona).order_by('data_inizio')

        # Impostazione del paginatore (ad es. 10 referti per pagina)
        paginator = Paginator(terapie_domiciliari, 4)
        page_number = request.GET.get('page')
        storico_terapie = paginator.get_page(page_number)

        # Impostazione del paginatore (ad es. 10 referti per pagina)
        paginator = Paginator(terapie_studio, 4)
        page_number = request.GET.get('page')
        storico_studio = paginator.get_page(page_number)

        context = {
            'persona': persona,
            'dottore': dottore,
            'terapie_studio': terapie_studio,
            'terapie_domiciliari': terapie_domiciliari,
            'storico_terapie': storico_terapie,
            'storico_studio': storico_studio

        }

        return render(request, 'cartella_paziente/sezioni_storico/terapie.html', context)

    def post(self, request, id):
        form_type = request.POST.get("form_type")
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        # Salvataggio terapia in studio
        if form_type == "studio":
            persona = get_object_or_404(TabellaPazienti, id=id, dottore=dottore)
            tipologia = request.POST.get("tipologia")
            descrizione = request.POST.get("descrizione")
            data_inizio = parse_date(request.POST.get("data_inizio"))
            data_fine = parse_date(request.POST.get("data_fine")) or None

            terapia = TerapiaInStudio.objects.create(
                paziente=persona,
                tipologia=tipologia,
                descrizione=descrizione,
                data_inizio=data_inizio,
                data_fine=data_fine,
            )

            return JsonResponse({
                'success': True,
                'terapia': {
                    'id': terapia.id,
                    'descrizione': terapia.descrizione,
                    'data_inizio': terapia.data_inizio.strftime('%d/%m/%Y'),
                    'data_fine': terapia.data_fine.strftime('%d/%m/%Y') if terapia.data_fine else None
                }
            })
        elif form_type == "domiciliare":
            persona = get_object_or_404(TabellaPazienti, id=id, dottore=dottore)
            farmaco = request.POST.get("farmaco")
            assunzioni = int(request.POST.get("assunzioni"))
            data_inizio = parse_date(request.POST.get("data_inizio"))
            data_fine = parse_date(request.POST.get("data_fine")) or None

            # Recupero dinamico degli orari
            orari_dict = {}
            for i in range(1, assunzioni + 1):
                key = f"orario{i}"
                orario_val = request.POST.get(key)
                if orario_val:
                    orari_dict[key] = orario_val

            # Creazione
            terapia = TerapiaDomiciliare.objects.create(
                paziente=persona,
                farmaco=farmaco,
                assunzioni=assunzioni,
                orari=orari_dict,
                data_inizio=data_inizio,
                data_fine=data_fine
            )

            return JsonResponse({
                'success': True,
                'terapia': {
                    'id': terapia.id,
                    'farmaco': terapia.farmaco,
                    'assunzioni': terapia.assunzioni,
                    'orari': terapia.orari,
                    'data_inizio': terapia.data_inizio.strftime('%d/%m/%Y') if terapia.data_inizio else None,
                    'data_fine': terapia.data_fine.strftime('%d/%m/%Y') if terapia.data_fine else None
                }
            })


        return JsonResponse({'success': False})

# ELIMINA TERAPIA FUNZIONE
@method_decorator(catch_exceptions, name='dispatch')
class EliminaTerapiaStudioView(View):
    def post(self, request, id):
        terapia = get_object_or_404(TerapiaInStudio, id=id)
        terapia.delete()
        return JsonResponse({'success': True})

## ELIMINA TERAPIA DOMICILIARE
class TerapiaDomiciliareDeleteView(View):
    def post(self, request, id):
        terapia = get_object_or_404(TerapiaDomiciliare, id=id)
        terapia.delete()
        return JsonResponse({'success': True})

# MODIFICA TERAPIA STUDIO
@method_decorator(catch_exceptions, name='dispatch')
class ModificaTerapiaStudioView(View):
    def post(self, request, id):
        terapia = get_object_or_404(TerapiaInStudio, id=id)

        terapia.tipologia = request.POST.get('tipologia')
        terapia.descrizione = request.POST.get('descrizione')
        terapia.data_inizio = parse_date(request.POST.get('data_inizio'))
        terapia.data_fine = parse_date(request.POST.get('data_fine')) or None
        terapia.save()

        return JsonResponse({
            'success': True,
            'terapia': {
                'id': terapia.id,
                'descrizione': terapia.descrizione,
                'data_inizio': terapia.data_inizio.strftime('%d/%m/%Y'),
                'data_fine': terapia.data_fine.strftime('%d/%m/%Y') if terapia.data_fine else None
            }
        })

# MODIFICA TERAPIA DOMICILIARE
@method_decorator(csrf_exempt, name='dispatch')
class ModificaTerapiaDomiciliareView(View):
    def post(self, request, id):
        from django.utils.dateparse import parse_date

        terapia = TerapiaDomiciliare.objects.filter(id=id).first()
        if not terapia:
            return JsonResponse({'success': False, 'message': 'Terapia non trovata'}, status=404)

        farmaco = request.POST.get("farmaco")
        assunzioni = int(request.POST.get("assunzioni"))
        data_inizio = parse_date(request.POST.get("data_inizio"))
        data_fine = parse_date(request.POST.get("data_fine")) if request.POST.get("data_fine") else None

        orari_dict = {}
        for i in range(1, assunzioni + 1):
            key = f"orario{i}"
            orario_val = request.POST.get(key)
            if orario_val:
                orari_dict[key] = orario_val

        # Aggiorna i valori
        terapia.farmaco = farmaco
        terapia.assunzioni = assunzioni
        terapia.orari = orari_dict
        terapia.data_inizio = data_inizio
        terapia.data_fine = data_fine
        terapia.save()

        return JsonResponse({'success': True, 'message': 'Terapia aggiornata con successo!'})

# DETTAGLI TERAPIA DOMICILIARE
class DettagliTerapiaDomiciliareView(View):
    def get(self, request, id):
        try:
            terapia = TerapiaDomiciliare.objects.get(id=id)
            return JsonResponse({
                'success': True,
                'terapia': {
                    'id': terapia.id,
                    'farmaco': terapia.farmaco,
                    'assunzioni': terapia.assunzioni,
                    'orari': terapia.orari,
                    'data_inizio': terapia.data_inizio.strftime('%Y-%m-%d') if terapia.data_inizio else '',
                    'data_fine': terapia.data_fine.strftime('%Y-%m-%d') if terapia.data_fine else '',
                }
            })
        except TerapiaDomiciliare.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Terapia non trovata'}, status=404)

# ELIMINA TERAPIA FUNZIONE
@method_decorator(catch_exceptions, name='dispatch')
class EliminaTerapiaStudioView(View):
    def post(self, request, id):
        terapia = get_object_or_404(TerapiaInStudio, id=id)
        terapia.delete()
        return JsonResponse({'success': True})

# MODIFICA TERAPIA
@method_decorator(catch_exceptions, name='dispatch')
class ModificaTerapiaStudioView(View):
    def post(self, request, id):
        terapia = get_object_or_404(TerapiaInStudio, id=id)

        terapia.tipologia = request.POST.get('tipologia')
        terapia.descrizione = request.POST.get('descrizione')
        terapia.data_inizio = parse_date(request.POST.get('data_inizio'))
        terapia.data_fine = parse_date(request.POST.get('data_fine')) or None
        terapia.save()

        return JsonResponse({
            'success': True,
            'terapia': {
                'id': terapia.id,
                'descrizione': terapia.descrizione,
                'data_inizio': terapia.data_inizio.strftime('%d/%m/%Y'),
                'data_fine': terapia.data_fine.strftime('%d/%m/%Y') if terapia.data_fine else None
            }
        })

### VIEW DIAGNOSI
@method_decorator(csrf_exempt, name='dispatch')
class DiagnosiView(LoginRequiredMixin, View):

    def get(self, request, id):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)
        diagnosi = Diagnosi.objects.filter(paziente=persona)
        totale_diagnosi = diagnosi.count()
        diagnosi_attive  = diagnosi.filter(risolta=False).count()
        diagnosi_risolte = diagnosi.filter(risolta=True).count()
        # Conta diagnosi per mese
        diagnosi_per_mese = diagnosi.annotate(month=ExtractMonth('data_diagnosi')) \
                                    .values('month') \
                                    .annotate(count=Count('id')) \
                                    .order_by('month')
        # Array [0, 0, ..., 0] con valori aggiornati
        diagnosi_mensili = [0] * 12
        for item in diagnosi_per_mese:
            diagnosi_mensili[item['month'] - 1] = item['count']


        # Appuntamento futuro più vicino (es. per prossimo controllo)
        prossimo_controllo = (
            Diagnosi.objects
                .filter(paziente=persona, data_diagnosi__gt=now().date())
                .order_by('data_diagnosi')
                .first()
        )

        # Impostazione del paginatore (ad es. 10 referti per pagina)
        paginator = Paginator(diagnosi, 4)
        page_number = request.GET.get('page')
        storico_diagnosi = paginator.get_page(page_number)

        ultima_diagnosi = diagnosi.order_by('data_diagnosi').first()

        context = {
            'persona': persona,
            'dottore': dottore,
            'diagnosi': diagnosi,
            'totale_diagnosi': totale_diagnosi,
            'diagnosi_attive': diagnosi_attive,
            'diagnosi_risolte': diagnosi_risolte,
            'diagnosi_mensili': diagnosi_mensili,
            'prossimo_controllo': prossimo_controllo,
            'ultima_diagnosi': ultima_diagnosi,
            'storico_diagnosi': storico_diagnosi
        }
        return render(request, 'cartella_paziente/sezioni_storico/diagnosi.html', context)

    def post(self, request, id):
        """Crea nuova diagnosi"""
        import json
        persona = get_object_or_404(TabellaPazienti, id=id)

        try:
            data = json.loads(request.body)
        except Exception:
            return JsonResponse({'success': False, 'error': 'Dati non validi'}, status=400)

        descrizione = data.get('descrizione')
        data_diagnosi_str = data.get('data_diagnosi')
        stato = data.get('stato')
        note = data.get('note')
        gravita = data.get('gravita')

        try:
            data_diagnosi = datetime.strptime(data_diagnosi_str, "%Y-%m-%d").date()
        except Exception:
            return JsonResponse({'success': False, 'error': 'Formato data non valido'}, status=400)

        if not (descrizione and data_diagnosi and stato and gravita):
            return JsonResponse({'success': False, 'error': 'Dati mancanti'}, status=400)

        diagnosi = Diagnosi.objects.create(
            paziente=persona,
            descrizione=descrizione,
            data_diagnosi=data_diagnosi,
            stato=stato,
            note=note,
            gravita=int(gravita),
            risolta=False
        )

        return JsonResponse({
            'success': True,
            'id': diagnosi.id,
            'descrizione': diagnosi.descrizione,
            'data_diagnosi': diagnosi.data_diagnosi.strftime('%Y-%m-%d'),
            'stato': diagnosi.stato,
            'note': diagnosi.note,
            'gravita': diagnosi.gravita,
            "risolta": diagnosi.risolta
        })

    def patch(self, request, id):
        """Modifica diagnosi esistente"""
        import json
        data = json.loads(request.body)
        diagnosi_id = data.get('id')
        diagnosi = get_object_or_404(Diagnosi, id=diagnosi_id)
        diagnosi.descrizione = data.get('descrizione', diagnosi.descrizione)
        diagnosi.data_diagnosi = data.get('data_diagnosi', diagnosi.data_diagnosi)
        diagnosi.stato = data.get('stato', diagnosi.stato)
        diagnosi.note = data.get('note', diagnosi.note)
        diagnosi.gravita = data.get('gravita', diagnosi.gravita)
        diagnosi.risolta = data.get('risolta', diagnosi.risolta)
        diagnosi.save()

        return JsonResponse({'success': True})

## VIEW DETTAGLI DIAGNOSI
class DiagnosiDettaglioView(LoginRequiredMixin, View):
    def get(self, request, diagnosi_id):
        diagnosi = get_object_or_404(Diagnosi, id=diagnosi_id)

        return JsonResponse({
            'id': diagnosi.id,
            'descrizione': diagnosi.descrizione,
            'data_diagnosi': diagnosi.data_diagnosi.strftime('%Y-%m-%d'),
            'stato': diagnosi.stato,
            'note': diagnosi.note,
            'gravita': diagnosi.gravita,
            "risolta": diagnosi.risolta,
        })

## VIEW DELETE DIAGNOSI
class DeleteDiagnosiView(View):
    def post(self, request, id, diagnosi_id):
        # Verifica che il paziente esista
        get_object_or_404(TabellaPazienti, id=id)
        
        diagnosi = get_object_or_404(Diagnosi, id=diagnosi_id)
        diagnosi.delete()
        return JsonResponse({"success": True})


### VIEW ALLEGATI
class AllegatiView(View):
    def get(self, request, id):
        return self._render_with_context(request, id)

    def post(self, request, id):
        persona = get_object_or_404(TabellaPazienti, id=id)

        # Rileva quale form è stato inviato usando data-table (puoi anche usare un campo hidden)
        data_table = request.POST.get('data-table')

        # Recupera i dati
        data = request.POST.get('data_referto')
        file = request.FILES.get('file')

        if file and data_table == "esami-di-laboratorio":
            AllegatiLaboratorio.objects.create(paziente=persona, data_referto=data, file=file)
        elif file and data_table == "esami-strumentali":
            AllegatiStrumentale.objects.create(paziente=persona, data_referto=data, file=file)

        return redirect('allegati', id=persona.id)

    def _render_with_context(self, request, id):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)

        laboratorio = AllegatiLaboratorio.objects.filter(paziente=persona).order_by('data_referto')
        strumentali = AllegatiStrumentale.objects.filter(paziente=persona).order_by('data_referto')

        paginator_lab = Paginator(laboratorio, 4)
        page_number = request.GET.get('page')
        allegati_laboratorio = paginator_lab.get_page(page_number)

        paginator_strum = Paginator(strumentali, 4)
        page_number = request.GET.get('page')
        allegati_strumentale = paginator_strum.get_page(page_number)

        context = {
            'dottore': dottore,
            'persona': persona,
            'allegati_laboratorio': allegati_laboratorio,
            'allegati_strumentale': allegati_strumentale
        }
        return render(request, "cartella_paziente/sezioni_storico/allegati.html", context)

## DOWNLOAD ALLEGATI
from django.http import HttpResponseServerError

@method_decorator(login_required, name='dispatch')
class DownloadAllegatoView(View):
    def get(self, request, tipo, allegato_id):
        try:
            if tipo == "laboratorio":
                allegato = get_object_or_404(AllegatiLaboratorio, id=allegato_id)
            elif tipo == "strumentale":
                allegato = get_object_or_404(AllegatiStrumentale, id=allegato_id)
            else:
                raise Http404("Tipo non valido")

            if not allegato.file:
                raise Http404("File non trovato")

            return FileResponse(
                allegato.file.open("rb"),
                as_attachment=True,
                filename=allegato.file.name.split("/")[-1]
            )
        except Exception as e:
            import traceback
            return HttpResponseServerError(f"<pre>{traceback.format_exc()}</pre>")

## ELIMINA ALLEGATI
class DeleteAllegatoView(LoginRequiredMixin, View):
    def post(self, request, paziente_id, tipo, allegato_id):
        if tipo == "laboratorio":
            model = AllegatiLaboratorio
        elif tipo == "strumentale":
            model = AllegatiStrumentale
        else:
            return JsonResponse({"error": "Tipo non valido"}, status=400)

        allegato = get_object_or_404(model, id=allegato_id)
        allegato.file.delete()
        allegato.delete()
        return JsonResponse({"success": True})

### VIEW VISITE
class VisiteView(View):
    """Visite render class"""

    def get(self, request, id):
        """Function that handling visite get requests"""
        return self._render_with_context(request, id)

    def post(self, request, id):
        """Function that handling visite post requests"""
        persona = get_object_or_404(TabellaPazienti, id=id)
        return redirect('visite', id=persona.id)

    def _render_with_context(self, request, id):
        """Function that handling visite render with context"""

        role = get_user_role(request)

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)
    
        if role == 'secretary':
            persone = (
                TabellaPazienti.objects
                .all()
                .order_by(
                    Lower('name'),
                    Lower('surname'),
                )
            )

        else:
            persone = (
                TabellaPazienti.objects
                .filter(dottore=dottore)
                .order_by(
                    Lower('name'),
                    Lower('surname'),
                )
            )
        
        if dottore.role == 'secretary':
            visite = Appointment.objects.filter(
                nome_paziente__icontains=persona.name.strip(),
                cognome_paziente__icontains=persona.surname.strip()
            ).order_by('-data', '-orario')

        else:
            visite = Appointment.objects.filter(
                nome_paziente__icontains=persona.name.strip(),
                cognome_paziente__icontains=persona.surname.strip(),
                dottore=dottore
            ).order_by('-data', '-orario')


        tipologia_appuntamenti = (
            Appointment.objects
            .exclude(tipologia_visita__isnull=True)
            .exclude(tipologia_visita__exact='')
            .values_list('tipologia_visita', flat=True)
            .distinct()
        )

        tipologia_appuntamenti = sorted(set([t.strip().title() for t in tipologia_appuntamenti]))
        numero_studio = [choice[0] for choice in Appointment._meta.get_field('numero_studio').choices]
        visita = Appointment._meta.get_field('visita').choices

        paginator = Paginator(visite, 10)
        page_number = request.GET.get('page')
        visite = paginator.get_page(page_number)

        profile = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        is_secretary = get_user_role(request)

        dottori = UtentiRegistratiCredenziali.objects.all() if role == 'secretary' else None

        context = {
            'dottore': dottore,
            'persona': persona,
            'persone': persone,
            'visite': visite,
            'tipologia_appuntamenti': tipologia_appuntamenti,
            'numero_studio': numero_studio,
            'visita': visita,
            'is_secretary': is_secretary == "secretary",
            'dottori': dottori,
        }
        return render(request, "cartella_paziente/sezioni_storico/visite.html", context)

## VIEW ELIMINA VISITE
@method_decorator(csrf_exempt, name='dispatch')
class EliminaVisitaView(View):
    def post(self, request, id):        
        try:
            visita = Appointment.objects.get(id=id)
            visita.delete()
            return JsonResponse({'success': True})
        except Appointment.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Visita non trovata'}, status=404)

## SEZIONE MUSCOLO
@method_decorator(catch_exceptions, name='dispatch')
class ValutazioneMSView(LoginRequiredMixin,View):

    def get(self, request, persona_id):
        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=persona_id)

        context = {
            'persona': persona,
            'dottore' : dottore,
        }

        return render(request, "cartella_paziente/indici_di_performance/valutazioneMS.html", context)

    def post(self, request, persona_id):     
        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=persona_id)

        try:
            retrivedData = ValutazioneMS.objects.create(
                paziente=persona,

                # Attività fisica
                frequenza_a_f=request.POST.get("frequenza_a_f"),
                tipo_a_f=request.POST.get("tipo_a_f"),
                stile_vita=request.POST.get("stile_vita"),

                # Anamnesi muscolo-scheletrica
                terapie_inf=request.POST.get("terapie_inf"),
                diagnosi_t=request.POST.get("diagnosi_t"),
                sintomi_t=request.POST.get("sintomi_t"),

                # Esame Generale
                palpazione=request.POST.get("palpazione"),
                osservazione=request.POST.get("osservazione"),
                m_attiva=request.POST.get("m_attiva"),
                m_passiva=request.POST.get("m_passiva"),
                dolorabilità=request.POST.get("dolorabilità"),
                scala_v_a=request.POST.get("scala_v_a"),

                # Esame muscolo-scheletrico
                mo_attivo=request.POST.get("mo_attivo"),
                mo_a_limitazioni=request.POST.get("mo_a_limitazioni"),
                mo_passivo=request.POST.get("mo_passivo"),
                mo_p_limitazioni=request.POST.get("mo_p_limitazioni"),
                comparazioni_m=request.POST.get("comparazioni_m"),
                circ_polp=request.POST.get("circ_polp"),
                tono_m=request.POST.get("tono_m"),
                scala_ashworth=request.POST.get("scala_ashworth"),

                # Esame posturale
                v_frontale=request.POST.get("v_frontale"),
                v_laterale=request.POST.get("v_laterale"),
                p_testa=request.POST.get("p_testa"),
                spalle=request.POST.get("spalle"),
                ombelico=request.POST.get("ombelico"),
                a_inferiori=request.POST.get("a_inferiori"),
                piedi=request.POST.get("piedi"),
                colonna_v=request.POST.get("colonna_v"),
                curvatura_c=request.POST.get("curvatura_c"),
                curvatura_d=request.POST.get("curvatura_d"),
                curvatura_l=request.POST.get("curvatura_l"),
                posizione_b=request.POST.get("posizione_b"),
                equilibrio_s=request.POST.get("equilibrio_s"),
                equilibrio_d=request.POST.get("equilibrio_d"),
                p_dolenti=request.POST.get("p_dolenti"),

                # Valutazione funzionale
                gravita_disfunzione_posturale=request.POST.get("gravita_disfunzione_posturale"),
                rischio_infortuni=request.POST.get("rischio_infortuni"),
                suggerimenti=request.POST.get("suggerimenti"),
                considerazioni_finali=request.POST.get("considerazioni_finali"),
            )

            retrivedData.save()

        except Exception as e:
            print("Errore nel salvataggio del referto:", e)

        context = {
            'persona': persona,
            'dottore': dottore,
            'successo': True
        }
        return render(request, "cartella_paziente/indici_di_performance/valutazioneMS.html", context)

## SEZIONE DATI BASE
@method_decorator(catch_exceptions, name='dispatch')
class DatiBaseView(LoginRequiredMixin,View):

    def get(self, request, id):
        persona = get_object_or_404(TabellaPazienti, id=id)

        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        context = {
            'persona': persona,
            'dottore' : dottore
        }
        return render(request, "cartella_paziente/dati_base/dati_base.html", context)
    
    def post(self, request, id):

        print(request.POST)

        persona = get_object_or_404(TabellaPazienti, id=id)
        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        try:
            
            #Informazioni occupazione
            persona.professione = request.POST.get("professione") or "No"
            persona.pensionato = request.POST.get("pensionato") or "No"

            #Per la donna
            persona.menarca = request.POST.get('menarca') or "No"
            persona.ciclo = request.POST.get('ciclo') or "No"
            persona.sintomi = request.POST.get('sintomi') or "No"
            persona.esordio = request.POST.get('esordio') or "No"
            persona.parto = request.POST.get('parto') or "No"
            persona.post_parto = request.POST.get('post_parto') or "No"
            persona.aborto = request.POST.get('aborto') or "No"

            # Stile di vita - Alcol
            persona.alcol = request.POST.get("alcol") or "No"
            persona.alcol_type = request.POST.get("alcol_type") or "No"
            persona.data_alcol = request.POST.get("data_alcol")
            persona.alcol_frequency = request.POST.get("alcol_frequency") or "No"

            # Stile di vita - Fumo
            persona.smoke = request.POST.get("smoke") or "No"
            persona.smoke_frequency = request.POST.get("smoke_frequency") or "No"
            persona.reduced_intake = request.POST.get("reduced_intake") or "No"

            # Stile di vita - Sport
            persona.sport = request.POST.get("sport") or "No"
            persona.sport_livello = request.POST.get("sport_livello") or "No"
            persona.sport_frequency = request.POST.get("sport_frequency") or "No"

            # Stile di vita - Sedentarietà
            persona.attivita_sedentaria = request.POST.get("attivita_sedentaria") or "No"
            persona.livello_sedentarieta = request.POST.get("livello_sedentarieta") or "No"
            persona.sedentarieta_nota = request.POST.get("sedentarieta_nota") or "No"

            # Anamnesi
            persona.m_cardiache = request.POST.get("m_cardiache_fam") or "No"
            persona.diabete_m = request.POST.get("diabete_m") or "No"
            persona.ipertensione = request.POST.get("ipertensione") or "No"
            persona.obesita = request.POST.get("obesita") or "No"
            persona.m_tiroidee = request.POST.get("m_tiroidee") or "No"
            persona.m_polmonari = request.POST.get("m_polmonari") or "No"
            persona.tumori = request.POST.get("tumori") or "No"
            persona.allergie = request.POST.get("allergie") or "No"
            persona.m_psichiatriche = request.POST.get("m_psichiatriche") or "No"
            persona.patologie = request.POST.get("patologie") or "No"
            persona.p_p_altro = request.POST.get("p_p_altro") or "No"
            persona.t_farmaco = request.POST.get("t_farmaco") or "No"
            persona.t_dosaggio = request.POST.get("t_dosaggio") or "No"
            persona.t_durata = request.POST.get("t_durata") or "No"

            # Esame Obiettivo
            persona.a_genarale = request.POST.get("a_generale") or "No"
            persona.psiche = request.POST.get("psiche") or "No"
            persona.r_ambiente = request.POST.get("r_ambiente") or "No"
            persona.s_emotivo = request.POST.get("s_emotivo") or "No"
            persona.costituzione = request.POST.get("costituzione") or "No"
            persona.statura = request.POST.get("statura") or "No"
            persona.s_nutrizionale = request.POST.get("s_nutrizionale") or "No"
            persona.eloquio = request.POST.get("eloquio") or "No"

            # Informazioni del sangue
            persona.pressure_min = request.POST.get("pressure_min") or "No"
            persona.pressure_max = request.POST.get("pressure_max") or "No"
            persona.heart_rate = request.POST.get("heart_rate") or "No"
            persona.blood_group = request.POST.get("blood_group") or "No"
            persona.rh_factor = request.POST.get("rh_factor") or "No"

            persona.save()

            context = {
                'persona': persona,
                'dottore': dottore,
                'success': 'I dati sono stati aggiornati correttamente' 
            }

        except Exception as e:
            context = {
                'persona': persona,
                'dottore': dottore,
                'errore': f"system error: {str(e)} --- Controlla di aver inserito tutti i dati corretti nei campi necessari e riprova." 
            }
    

        return render(request, "cartella_paziente/dati_base/dati_base.html", context)  


## SEZIONE ETA' METABOLICA
@method_decorator(catch_exceptions, name='dispatch')
class ComposizioneView(LoginRequiredMixin,View):

    def get(self, request, id):

        persona = get_object_or_404(TabellaPazienti, id=id)

        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        ultimo_referto = RefertiEtaMetabolica.objects.filter(paziente=persona).order_by('-data_referto').first()

        context = {
            'persona': persona,
            'dottore' : dottore,
            'ultimo_referto': ultimo_referto
        }

        return render(request, "cartella_paziente/eta_metabolica/etaMetabolica.html", context)

    def post(self, request, id):

        eta_metabolica_calcolata = None
        success = False
        punteggio = None

        persona = get_object_or_404(TabellaPazienti, id=id)
        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        try:
            bmi_date = request.POST.get("bmi_detection_date")
            girth_date = request.POST.get("girth_date")
            bmi_detection_date = datetime.strptime(bmi_date, "%Y-%m-%d").date() if bmi_date else None
            girth_detection_date = datetime.strptime(girth_date, "%Y-%m-%d").date() if girth_date else None

            # PREPARAZIONE DEI DATI PER IL CALCOLO DELL'ETÀ METABOLICA
            dati_calcolo = {
                'eta': persona.chronological_age,  
                'sesso': persona.gender,  
                'BMI': float(request.POST.get("bmi")) if request.POST.get("bmi") else None,
                'grasso_percento': float(request.POST.get("grasso")) if request.POST.get("grasso") else None,
                'acqua_percento': float(request.POST.get("acqua")) if request.POST.get("acqua") else None,
                'massa_muscolare_percento': float(request.POST.get("massa_muscolare")) if request.POST.get("massa_muscolare") else None,
                'WHR': float(request.POST.get("whr")) if request.POST.get("whr") else None,
                'glicemia': float(request.POST.get("glicemia")) if request.POST.get("glicemia") else None,
                'HbA1c': float(request.POST.get("emoglobina_g")) if request.POST.get("emoglobina_g") else None,
                'HOMA_IR': float(request.POST.get("homa_ir")) if request.POST.get("homa_ir") else None,
                'TyG': float(request.POST.get("tyg")) if request.POST.get("tyg") else None,
                'HDL': float(request.POST.get("hdl")) if request.POST.get("hdl") else None,
                'LDL': float(request.POST.get("ldl")) if request.POST.get("ldl") else None,
                'trigliceridi': float(request.POST.get("trigliceridi")) if request.POST.get("trigliceridi") else None,
                'AST': float(request.POST.get("ast")) if request.POST.get("ast") else None,
                'ALT': float(request.POST.get("alt")) if request.POST.get("alt") else None,
                'GGT': float(request.POST.get("ggt")) if request.POST.get("ggt") else None,
                'bilirubina': float(request.POST.get("bili_t")) if request.POST.get("bili_t") else None,
                'SII': float(request.POST.get("sii")) if request.POST.get("sii") else None,
                'HGS': float(request.POST.get("hgs")) if request.POST.get("hgs") else None,
                'cortisolo': float(request.POST.get("c_plasmatico")) if request.POST.get("c_plasmatico") else None,
            }

            # Proviamo a recuperare il valore dal campo eta_metabolica (se presente)
            input_eta_metabolica = request.POST.get("eta_metabolica")
            try:
                input_eta_metabolica_val = float(input_eta_metabolica) if input_eta_metabolica and input_eta_metabolica.strip() != "" else None
            except ValueError:
                input_eta_metabolica_val = None

            # Se è presente un valore valido nel campo eta_metabolica…
            if input_eta_metabolica_val is not None:
                # Verifica se tutti i dati necessari per il calcolo sono stati inseriti
                if all(value is not None for value in dati_calcolo.values()):
                    eta_metabolica_calcolata = calcola_eta_metabolica(dati_calcolo)
                    punteggio = eta_metabolica_calcolata
                else:
                    # Se non sono stati inseriti tutti i dati, usa il valore fornito
                    punteggio = input_eta_metabolica_val
            else:
                # Se il campo eta_metabolica non è stato fornito, prova a calcolare se ci sono tutti i dati
                if all(value is not None for value in dati_calcolo.values()):
                    eta_metabolica_calcolata = calcola_eta_metabolica(dati_calcolo)
                    punteggio = eta_metabolica_calcolata
                else:
                    success = True

            # Salva il referto nella tabella RefertiEtaMetabolica
            RefertiEtaMetabolica.objects.create(
                dottore=dottore,
                paziente=persona,
                punteggio_finale=eta_metabolica_calcolata,
                # Composizione corporea
                bmi=request.POST.get("bmi"),
                grasso=request.POST.get("grasso"),
                acqua=request.POST.get("acqua"),
                massa_muscolare=request.POST.get("massa_muscolare"),
                bmr=request.POST.get("bmr"),
                whr=request.POST.get("whr"),
                whtr=request.POST.get("whtr"),
                # Profilo glicemico e insulinico
                glicemia=request.POST.get("glicemia"),
                ogtt1=request.POST.get("ogtt1"),
                ogtt2=request.POST.get("ogtt2"),
                emoglobina_g=request.POST.get("emoglobina_g"),
                insulina_d=request.POST.get("insulina_d"),
                curva_i=request.POST.get("curva_i"),
                homa_ir=request.POST.get("homa_ir"),
                tyg=request.POST.get("tyg"),
                # Profilo lipidico
                c_tot=request.POST.get("c_tot"),
                hdl=request.POST.get("hdl"),
                ldl=request.POST.get("ldl"),
                trigliceridi=request.POST.get("trigliceridi"),
                # Profilo epatico
                ast=request.POST.get("ast"),
                alt=request.POST.get("alt"),
                ggt=request.POST.get("ggt"),
                bili_d=request.POST.get("bili_d"),
                bili_in=request.POST.get("bili_in"),
                # Infiammazione
                pcr=request.POST.get("pcr"),
                hgs=request.POST.get("hgs"),
                sii=request.POST.get("sii"),
                # Stress e antropometria
                c_plasmatico=request.POST.get("c_plasmatico"),
                massa_ossea=request.POST.get("massa_ossea"),
                eta_metabolica=request.POST.get("eta_metabolica"),
                grasso_viscerale=request.POST.get("grasso_viscerale"),
                # Dati anagrafici e misurazioni
                height=request.POST.get("altezza"),
                weight=request.POST.get("weight"),
                p_fisico=request.POST.get("p_fisico"),
                girth_value=request.POST.get("girth_value"),
                girth_notes=request.POST.get("note_addominali"),
                bmi_detection_date=bmi_detection_date,
                girth_date=girth_detection_date
            )

            ultimo_referto = RefertiEtaMetabolica.objects.filter(paziente=persona).order_by('-data_referto').first()

            context = {
                'persona': persona,
                'dottore': dottore,
                'success': success,
                'punteggio': punteggio,
                'ultimo_referto': ultimo_referto
            }

        except Exception as e:
            print(e)
            context = {
                'persona': persona,
                'dottore': dottore,
                'errore': "Controlla di aver inserito tutti i dati corretti nei campi necessari e riprova." 
            }

        return render(request, "cartella_paziente/eta_metabolica/etaMetabolica.html", context)

@method_decorator(catch_exceptions, name='dispatch')
class ComposizioneChartView(LoginRequiredMixin,View):

    def get(self, request, id):
        paziente = get_object_or_404(TabellaPazienti, id=id)
        referti = RefertiEtaMetabolica.objects.filter(paziente=paziente).order_by('data_referto')

        mesi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giug', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

        # --- 1) COMPOSIZIONE CORPOREA ---
        dati_bmi = {m: [] for m in mesi}
        dati_muscolo = {m: [] for m in mesi}
        dati_grasso = {m: [] for m in mesi}

        # --- 2) GLICEMICO ---
        dati_glicemia = {m: [] for m in mesi}
        dati_emoglobina = {m: [] for m in mesi}
        dati_insulina = {m: [] for m in mesi}

        # --- 3) LIPIDICO ---
        dati_c_tot = {m: [] for m in mesi}
        dati_hdl = {m: [] for m in mesi}
        dati_ldl = {m: [] for m in mesi}
        dati_trigliceridi = {m: [] for m in mesi}

        # --- 4) EPATICO ---
        dati_ast = {m: [] for m in mesi}
        dati_alt = {m: [] for m in mesi}
        dati_ggt = {m: [] for m in mesi}
        dati_bili_t = {m: [] for m in mesi}

        # --- 5) INFIAMMAZIONE & STRESS (PCR, HGS, SII, c_plasmatico)
        dati_pcr = {m: [] for m in mesi}
        dati_hgs = {m: [] for m in mesi}
        dati_sii = {m: [] for m in mesi}
        dati_c_plasmatico = {m: [] for m in mesi}

        # --- LOOP SU TUTTI I REFERTI ---
        for r in referti:
            mese_index = localtime(r.data_referto).month - 1
            mese_nome = mesi[mese_index]

            # COMPOSIZIONE
            try:
                bmi_val = float(r.bmi.replace(',', '.')) if r.bmi else None
                muscolo_val = float(r.massa_muscolare.replace(',', '.')) if r.massa_muscolare else None
                grasso_val = float(r.grasso.replace(',', '.')) if r.grasso else None
            except:
                bmi_val = muscolo_val = grasso_val = None

            if bmi_val is not None:
                dati_bmi[mese_nome].append(bmi_val)
            if muscolo_val is not None:
                dati_muscolo[mese_nome].append(muscolo_val)
            if grasso_val is not None:
                dati_grasso[mese_nome].append(grasso_val)

            # GLICEMICO
            try:
                glic_val = float(r.glicemia.replace(',', '.')) if r.glicemia else None
                hba1c_val = float(r.emoglobina_g.replace(',', '.')) if r.emoglobina_g else None
                ins_val = float(r.insulina_d.replace(',', '.')) if r.insulina_d else None
            except:
                glic_val = hba1c_val = ins_val = None

            if glic_val is not None:
                dati_glicemia[mese_nome].append(glic_val)
            if hba1c_val is not None:
                dati_emoglobina[mese_nome].append(hba1c_val)
            if ins_val is not None:
                dati_insulina[mese_nome].append(ins_val)

            # LIPIDICO
            try:
                ctot_val = float(r.c_tot.replace(',', '.')) if r.c_tot else None
                hdl_val = float(r.hdl.replace(',', '.')) if r.hdl else None
                ldl_val = float(r.ldl.replace(',', '.')) if r.ldl else None
                trig_val = float(r.trigliceridi.replace(',', '.')) if r.trigliceridi else None
            except:
                ctot_val = hdl_val = ldl_val = trig_val = None

            if ctot_val is not None:
                dati_c_tot[mese_nome].append(ctot_val)
            if hdl_val is not None:
                dati_hdl[mese_nome].append(hdl_val)
            if ldl_val is not None:
                dati_ldl[mese_nome].append(ldl_val)
            if trig_val is not None:
                dati_trigliceridi[mese_nome].append(trig_val)

            # EPATICO
            try:
                ast_val = float(r.ast.replace(',', '.')) if r.ast else None
                alt_val = float(r.alt.replace(',', '.')) if r.alt else None
                ggt_val = float(r.ggt.replace(',', '.')) if r.ggt else None
                bili_val = float(r.bili_t.replace(',', '.')) if r.bili_t else None
            except:
                ast_val = alt_val = ggt_val = bili_val = None

            if ast_val is not None:
                dati_ast[mese_nome].append(ast_val)
            if alt_val is not None:
                dati_alt[mese_nome].append(alt_val)
            if ggt_val is not None:
                dati_ggt[mese_nome].append(ggt_val)
            if bili_val is not None:
                dati_bili_t[mese_nome].append(bili_val)

            # INFIAMMAZIONE & STRESS
            try:
                pcr_val = float(r.pcr.replace(',', '.')) if r.pcr else None
                hgs_val = float(r.hgs.replace(',', '.')) if r.hgs else None
                sii_val = float(r.sii.replace(',', '.')) if r.sii else None
                cplas_val = float(r.c_plasmatico.replace(',', '.')) if r.c_plasmatico else None
            except:
                pcr_val = hgs_val = sii_val = cplas_val = None

            if pcr_val is not None:
                dati_pcr[mese_nome].append(pcr_val)
            if hgs_val is not None:
                dati_hgs[mese_nome].append(hgs_val)
            if sii_val is not None:
                dati_sii[mese_nome].append(sii_val)
            if cplas_val is not None:
                dati_c_plasmatico[mese_nome].append(cplas_val)

        # Funzione per calcolare le medie e avere 12 valori
        def calcola_medie(diz):
            return [
                round(sum(diz[m]) / len(diz[m]), 2) if diz[m] else None
                for m in mesi
            ]

        # COMPOSIZIONE
        bmi_values = calcola_medie(dati_bmi)
        muscolo_values = calcola_medie(dati_muscolo)
        grasso_values = calcola_medie(dati_grasso)

        # GLICEMICO
        glicemia_values = calcola_medie(dati_glicemia)
        hba1c_values = calcola_medie(dati_emoglobina)
        insulina_values = calcola_medie(dati_insulina)

        # LIPIDICO
        c_tot_values = calcola_medie(dati_c_tot)
        hdl_values = calcola_medie(dati_hdl)
        ldl_values = calcola_medie(dati_ldl)
        trigliceridi_values = calcola_medie(dati_trigliceridi)

        # EPATICO
        ast_values = calcola_medie(dati_ast)
        alt_values = calcola_medie(dati_alt)
        ggt_values = calcola_medie(dati_ggt)
        bili_values = calcola_medie(dati_bili_t)

        # INFIAMMAZIONE & STRESS
        pcr_values = calcola_medie(dati_pcr)
        hgs_values = calcola_medie(dati_hgs)
        sii_values = calcola_medie(dati_sii)
        cplas_values = calcola_medie(dati_c_plasmatico)

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        # Passiamo tutto in JSON
        context = {
            'persona': paziente,
            'dottore': dottore,

            # Composizione
            'bmi': json.dumps(bmi_values),
            'massa_muscolare': json.dumps(muscolo_values),
            'grasso': json.dumps(grasso_values),

            # Glicemico
            'glicemia': json.dumps(glicemia_values),
            'hba1c': json.dumps(hba1c_values),
            'insulina': json.dumps(insulina_values),

            # Lipidico
            'col_tot': json.dumps(c_tot_values),
            'hdl': json.dumps(hdl_values),
            'ldl': json.dumps(ldl_values),
            'trigliceridi': json.dumps(trigliceridi_values),

            # Epatico
            'ast': json.dumps(ast_values),
            'alt': json.dumps(alt_values),
            'ggt': json.dumps(ggt_values),
            'bili_t': json.dumps(bili_values),

            # Infiammazione & Stress
            'pcr': json.dumps(pcr_values),
            'hgs': json.dumps(hgs_values),
            'sii': json.dumps(sii_values),
            'cplas': json.dumps(cplas_values),
        }
        return render(request, 'cartella_paziente/eta_metabolica/grafici.html', context)

@method_decorator(catch_exceptions, name='dispatch')
class RefertiComposizioneView(LoginRequiredMixin,View):
    def get(self, request, id):
        persona = get_object_or_404(TabellaPazienti, id=id)

        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        referti = RefertiEtaMetabolica.objects.filter(paziente=persona).order_by('-data_referto')
        
        # Impostazione del paginatore (ad es. 10 referti per pagina)
        paginator = Paginator(referti, 7)
        page_number = request.GET.get('page')
        referti_page = paginator.get_page(page_number)

        context = {
            'persona': persona,
            'dottore': dottore,
            'referti': referti_page,
        }

        return render(request, 'cartella_paziente/eta_metabolica/elencoReferti.html', context)


## SEZIONE CAPACITA' VITALE
@method_decorator(catch_exceptions, name='dispatch')
class EtaVitaleView(LoginRequiredMixin,View):

    def get(self, request, id):

        persona = get_object_or_404(TabellaPazienti, id=id)
  
        referti_test_recenti = persona.referti_test.all().order_by('-data_ora_creazione')
    
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        context = {
            'persona': persona,
            'referti_test_recenti': referti_test_recenti,
            'dottore': dottore
        }

        return render(request, "cartella_paziente/capacita_vitale/EtaVitale.html", context)
    
    def post(self):
        return

@method_decorator(catch_exceptions, name='dispatch')
class TestEtaVitaleView(LoginRequiredMixin,View):

    def get(self,request, id):

        persona = get_object_or_404(TabellaPazienti, id=id)

        ultimo_referto = persona.referti.order_by('-data_referto').first()
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        referti_test_recenti = persona.referti_test.all().order_by('-data_ora_creazione')

        dati_estesi = None
        if ultimo_referto:
            dati_estesi = DatiEstesiRefertiEtaBiologica.objects.filter(referto=ultimo_referto).first()
        
        context = {
            'persona': persona,
            'dati_estesi': dati_estesi,
            'dottore' : dottore,
            'referti_test_recenti': referti_test_recenti,
            
        }

        return render(request, "cartella_paziente/capacita_vitale/testVitale.html", context)
 
    def post(self, request, id):

        try:
            persona = get_object_or_404(TabellaPazienti, id=id)
            data = {key: value for key, value in request.POST.items() if key != 'csrfmiddlewaretoken'}
            referti_test_recenti = persona.referti_test.all().order_by('-data_ora_creazione')
            dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

            Somma_MMSE = (
                int(data.get('doc_1', 0)) +
                int(data.get('doc_2', 0)) +
                int(data.get('doc_3', 0)) +
                int(data.get('doc_4', 0)) +
                int(data.get('doc_5', 0)) +
                int(data.get('doc_6', 0)) +
                int(data.get('doc_7', 0)) +
                int(data.get('doc_8', 0)) +
                int(data.get('doc_9', 0)) +
                int(data.get('doc_10', 0)) +
                int(data.get('doc_11', 0)) 
            )

            Somma_GDS = (
                int(data.get('dop_1', 0)) +
                int(data.get('dop_2', 0)) +
                int(data.get('dop_3', 0)) +
                int(data.get('dop_4', 0)) +
                int(data.get('dop_5', 0)) +
                int(data.get('dop_6', 0)) +
                int(data.get('dop_7', 0)) +
                int(data.get('dop_8', 0)) +
                int(data.get('dop_9', 0)) +
                int(data.get('dop_10', 0)) +
                int(data.get('dop_11', 0)) +
                int(data.get('dop_12', 0)) +
                int(data.get('dop_13', 0)) +
                int(data.get('dop_14', 0)) +
                int(data.get('dop_15', 0)) 
            )

            Somma_LOC = (
                int(data.get('loc_1', 0)) +
                int(data.get('loc_2', 0)) +
                int(data.get('loc_3', 0)) +
                int(data.get('loc_4', 0)) +
                int(data.get('loc_5', 0)) +
                int(data.get('loc_6', 0)) +
                int(data.get('loc_7', 0)) +
                int(data.get('loc_8', 0)) 
            )

            Somma_Vista = (
                int(data.get('dos_1', 0)) +
                int(data.get('dos_2', 0))
            )

            Somma_Udito =  int(data.get('dos_3', 0)) 

            Somma_HGS = str(data.get('dodv', None))

            Fss_Somma = (
                int(data.get('fss_1', 0)) +
                int(data.get('fss_2', 0)) +
                int(data.get('fss_3', 0)) +
                int(data.get('fss_4', 0)) +
                int(data.get('fss_5', 0)) +
                int(data.get('fss_6', 0)) +
                int(data.get('fss_7', 0)) +
                int(data.get('fss_8', 0))
            )

            Sarc_f_Somma = (
                int(data.get('Sarc_f_1', 0)) +
                int(data.get('Sarc_f_2', 0)) +
                int(data.get('Sarc_f_3', 0)) +
                int(data.get('Sarc_f_4', 0)) +
                int(data.get('Sarc_f_5', 0)) 
            )
          
            PFT = int(data.get('pft-1', '0') or 0)
         
            ISQ = (
                int(data.get('SiIm_1', 0)) +
                int(data.get('SiIm_2', 0)) +
                int(data.get('SiIm_3', 0)) +
                int(data.get('SiIm_4', 0)) +
                int(data.get('SiIm_5', 0)) +
                int(data.get('SiIm_6', 0)) +
                int(data.get('SiIm_7', 0))
            )   
    
            BMI = float(data.get('bmi-1', 0) or 0)
            CDP = float(data.get('Cir_Pol', 0) or 0)
            WHR = float(data.get('WHip', 0) or 0)
            WHR_Ratio = str(data.get('Whei', None))

            CST = int(data.get('numero_rip', 0) or 0) / int(data.get('tot_secondi', 0) or 1)
           
            GS = int(data.get('distanza', 0) or 0) / int(data.get('tempo_s', 0) or 1)
       
            PPT = int(data.get('tempo_s_pick', 0) or 1)
    
            punteggioFinale = CalcoloPunteggioCapacitaVitale(
                                Somma_MMSE, Somma_GDS, Somma_LOC,
                                Somma_Vista, Somma_Udito, Somma_HGS, PFT,
                                ISQ, BMI, CDP, WHR, WHR_Ratio, CST, 
                                GS, PPT, Sarc_f_Somma, persona.gender )


            referto = RefertiCapacitaVitale(
                paziente = persona,
                punteggio = punteggioFinale,
                #documento = request.FILES.get('documento')
            )
            referto.save()


            datiEstesi = DatiEstesiRefertiCapacitaVitale(
                referto = referto,

                #DOMINIO COGNITIVO 
                MMSE = Somma_MMSE,

                #DOMINIO PSICOLOGICO
                GDS = Somma_GDS,
                LOC = Somma_LOC,

                #DOMINIO SENSORIALE
                Vista = Somma_Vista,
                Udito = Somma_Udito,

                #DOMINIO DELLA VITALITA'
                HGS = Somma_HGS,
                PFT = PFT,

                #SISTEMA IMMUNITARIO
                ISQ = ISQ,
                BMI = BMI,
                CDP = CDP,
                WHR = WHR,
                WHR_Ratio = WHR_Ratio,

                #DOMINIO DELLA LOCOMOZIONE
                CST = CST,
                GS = GS,
                PPT = PPT,
                SARC_F = Sarc_f_Somma,
                FSS = Fss_Somma,

                #BIOMARCATORI CIRCOLANTI DEL METABOLISMO
                Glic = safe_float(data, 'Glic'),
                Emog = safe_float(data, 'Emog'),
                Insu = safe_float(data, 'Insu'),
                Pept_c = safe_float(data, 'Pept_c'),
                Col_tot = safe_float(data, 'Col_tot'),
                Col_ldl = safe_float(data, 'Col_ldl'),
                Col_hdl = safe_float(data, 'Col_hdl'),
                Trigl = safe_float(data, 'Trigl'),
                albumina = safe_float(data, 'albumina'),
                clearance_urea = safe_float(data, 'clearance_urea'),
                igf_1 = safe_float(data, 'ifg_1'),


                #BIOMARCATORI CIRCOLANTI DELL'INFIAMMAZIONE
                Lymph = safe_float(data, 'Lymph'),
                Lymph_el = safe_float(data, 'Lymph_el'),
                wbc = safe_float(data, 'wbc'),
                Proteins_c = safe_float(data, 'Proteins_c'),
                Inter_6 = safe_float(data, 'Inter_6'),
                Tnf = safe_float(data, 'Tnf'),
                Mono = safe_float(data, 'Mono'),
                Mono_el = safe_float(data, 'Mono_el'),    
            )

            datiEstesi.save()

            context = {
            'persona': persona,
            'modal' : True,
            'Referto': referto,
            'referti_test_recenti': referti_test_recenti,
            'dottore': dottore
            }

            return render(request, "cartella_paziente/capacita_vitale/EtaVitale.html", context)

        except Exception as e:
            print(e)

            context = {
                'persona': persona,
                'modal': False,
                'errore': "Qualcosa è andato storto, controlla di inserire i valori corretti e riprova",
                'referti_test_recenti': referti_test_recenti,
                'dottore': dottore
            }    

            return render(request, "cartella_paziente/capacita_vitale/testVitale.html", context)

@method_decorator(catch_exceptions, name='dispatch')
class RefertoQuizView(LoginRequiredMixin,View):
    def get(self, request, persona_id, referto_id):

        persona = get_object_or_404(TabellaPazienti, id=persona_id)

        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        referto = get_object_or_404(RefertiCapacitaVitale, id=referto_id)

        ultimo_referto = persona.referti.order_by('-data_referto')
        
        datiEstesi = None
        if referto:
            datiEstesi = DatiEstesiRefertiCapacitaVitale.objects.filter(referto=referto).first()

        testo_risultato = ''

        if float(referto.punteggio) >= 0 and float(referto.punteggio) <= 2.59:
            testo_risultato = """
                                Ottima capacità vitale: Stato di salute eccellente sia a livello
                                fisico che mentale. La forza muscolare, la funzionalità
                                respiratoria e la mobilità sono ottimali. Il soggetto mostra
                                un'ottima capacità cognitiva, un buon benessere psicologico e
                                una bassa vulnerabilità allo stress. Il rischio di declino
                                funzionale e mentale è minimo.
                            """

        elif float(referto.punteggio) >= 2.60 and float(referto.punteggio) <= 5.09:
            testo_risultato = """
                                Buona capacità vitale: Buono stato di salute con lievi segni di
                                riduzione della forza muscolare o della resistenza fisica.
                                Possibile lieve declino cognitivo o stati emotivi fluttuanti, come
                                stress occasionale o lieve ansia. Il soggetto è autonomo, ma
                                potrebbe beneficiare di interventi per mantenere le capacità
                                motorie e il benessere mentale.
                            """

        elif float(referto.punteggio) >= 5.10 and float(referto.punteggio) <= 7.59:
            testo_risultato ="""
                                Capacità vitale compromessa: Si evidenziano difficoltà motorie
                                moderate, minore forza muscolare e resistenza. Potrebbero
                                esserci segni di declino cognitivo o un aumento di ansia e
                                stress, con possibili difficoltà nella gestione emotiva. Il rischio
                                di cadute, affaticamento mentale e riduzione dell'autonomia
                                cresce. È consigliato un supporto medico e strategie di
                                miglioramento.
                            """

        elif float(referto.punteggio) >= 7.60 and float(referto.punteggio) <= 10:
            testo_risultato ="""
                                Capacità vitale gravemente compromessa: Mobilità e
                                resistenza fisica sono compromesse, con elevato rischio di
                                fragilità e perdita di autonomia. Il declino cognitivo può
                                manifestarsi con difficoltà di concentrazione, memoria e
                                orientamento. Sul piano psicologico, possono essere presenti
                                ansia significativa, depressione o distress emotivo. È necessario
                                un intervento mirato per migliorare la qualità della vita.
                            """


        context = {
            'persona': persona,
            'ultimo_referto': ultimo_referto,
            'datiEstesi': datiEstesi,
            'dottore' : dottore,
            'referto' : referto,
            'testo_risultato': testo_risultato,
        }

        return render(request, "cartella_paziente/capacita_vitale/RefertoQuiz.html", context)

@method_decorator(catch_exceptions, name='dispatch')
class QuizEtaVitaleUpdateView(LoginRequiredMixin,View):

    def get(self, request, id):
        
        persona = get_object_or_404(TabellaPazienti, id=id)

        ultimo_referto = persona.referti.order_by('-data_referto').first()
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        referti_test_recenti = persona.referti_test.all().order_by('-data_ora_creazione')

        dati_estesi = None
        if ultimo_referto:
            dati_estesi = DatiEstesiRefertiEtaBiologica.objects.filter(referto=ultimo_referto).first()

        card_to_show = request.GET.get('card_name')

        context = {
            'persona': persona,
            'dati_estesi': dati_estesi,
            'dottore' : dottore,
            'referti_test_recenti': referti_test_recenti,
            'card_to_show': card_to_show
        }

        return render(request, 'cartella_paziente/capacita_vitale/testVitale.html', context)
    
    def post(self, request, id):
        return 

@method_decorator(catch_exceptions, name='dispatch')
class StampaRefertoView(LoginRequiredMixin,View):
    def get(self, request, persona_id, referto_id):

        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, dottore=dottore, id=persona_id)
        referto = get_object_or_404(RefertiCapacitaVitale, id=referto_id)
        referti_test_recenti = persona.referti_test.all().order_by('-data_ora_creazione')
        ultimo_referto = persona.referti.order_by('-data_referto')
        
        datiEstesi = None
        if referto:
            datiEstesi = DatiEstesiRefertiCapacitaVitale.objects.filter(referto=referto).first()

        testo_risultato = ''

        if float(referto.punteggio) >= 0 and float(referto.punteggio) <= 2.59:
            testo_risultato = """
                                Ottima capacità vitale: Stato di salute eccellente sia a livello
                                fisico che mentale. La forza muscolare, la funzionalità
                                respiratoria e la mobilità sono ottimali. Il soggetto mostra
                                un'ottima capacità cognitiva, un buon benessere psicologico e
                                una bassa vulnerabilità allo stress. Il rischio di declino
                                funzionale e mentale è minimo.
                            """

        elif float(referto.punteggio) >= 2.60 and float(referto.punteggio) <= 5.09:
            testo_risultato = """
                                Buona capacità vitale: Buono stato di salute con lievi segni di
                                riduzione della forza muscolare o della resistenza fisica.
                                Possibile lieve declino cognitivo o stati emotivi fluttuanti, come
                                stress occasionale o lieve ansia. Il soggetto è autonomo, ma
                                potrebbe beneficiare di interventi per mantenere le capacità
                                motorie e il benessere mentale.
                            """

        elif float(referto.punteggio) >= 5.10 and float(referto.punteggio) <= 7.59:
            testo_risultato ="""
                                Capacità vitale compromessa: Si evidenziano difficoltà motorie
                                moderate, minore forza muscolare e resistenza. Potrebbero
                                esserci segni di declino cognitivo o un aumento di ansia e
                                stress, con possibili difficoltà nella gestione emotiva. Il rischio
                                di cadute, affaticamento mentale e riduzione dell'autonomia
                                cresce. È consigliato un supporto medico e strategie di
                                miglioramento.
                            """

        elif float(referto.punteggio) >= 7.60 and float(referto.punteggio) <= 10:
            testo_risultato ="""
                                Capacità vitale gravemente compromessa: Mobilità e
                                resistenza fisica sono compromesse, con elevato rischio di
                                fragilità e perdita di autonomia. Il declino cognitivo può
                                manifestarsi con difficoltà di concentrazione, memoria e
                                orientamento. Sul piano psicologico, possono essere presenti
                                ansia significativa, depressione o distress emotivo. È necessario
                                un intervento mirato per migliorare la qualità della vita.
                            """

        context = {
            'scarica' : True,
            'persona': persona,
            'ultimo_referto': ultimo_referto,
            'datiEstesi': datiEstesi,
            'referti_test_recenti': referti_test_recenti,
            'dottore' : dottore,
            'referto' : referto,
            'testo_risultato': testo_risultato,
        }

        return render(request, "cartella_paziente/capacita_vitale/EtaVitale.html", context)


## SEZIONE ETA' BIOLOGICA
def safe_float(data, key, default=0.0):
    try:
        return float(data.get(key, default))
    except (ValueError, TypeError):
        return default

@method_decorator(catch_exceptions, name='dispatch')
class EtaBiologicaView(LoginRequiredMixin, View):

    def get(self, request, id):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)

        # 1) Recupera i 2 ultimi referti con select_related sui dati_estesi
        ultimi_referti = (
            RefertiEtaBiologica.objects
            .filter(paziente=persona)
            .select_related('dati_estesi')
            .order_by('-data_referto', '-id')[:2]
        )

        # 2) Estrai i 2 punteggi in due dizionari distinti
        score1 = {}
        score2 = {}

        # Mappatura tra nome campo modello e chiave desiderata
        campi_score = [
            'salute_cuore', 'salute_renale', 'salute_epatica',
            'salute_cerebrale', 'salute_ormonale',
            'salute_sangue', 'salute_s_i', 'salute_m_s',
        ]

        # Scorri i due oggetti in ordine e assegna a score1/score2
        for idx, ref in enumerate(ultimi_referti, start=1):
            dati = getattr(ref, 'dati_estesi', None)
            target = score1 if idx == 1 else score2
            if dati:
                for campo in campi_score:
                    target[campo] = getattr(dati, campo)
            else:
                # se non ci sono dati_estesi, metti None
                for campo in campi_score:
                    target[campo] = None

        context = {
            'dottore': dottore,
            'persona': persona,
            'score1': score1,
            'score2': score2,
            'ultimi_referti': ultimi_referti,
        }
        return render(request, 'cartella_paziente/eta_biologica/etaBiologica.html', context)


@method_decorator(catch_exceptions, name='dispatch')
class CalcolatoreRender(LoginRequiredMixin,View):
    
    def get(self, request, id):

        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        persona = get_object_or_404(TabellaPazienti, id=id)

        context = {
            'dottore' : dottore,
            'persona': persona,
        }

        return render(request, 'cartella_paziente/eta_biologica/calcolatore.html', context)


    def post(self, request, id):
        # 1) Input base
        data = {k: v for k, v in request.POST.items() if k != 'csrfmiddlewaretoken'}

        # 2) Oggetti principali: usa SEMPRE l'id passato alla view
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)
        paziente = persona  # <- niente lookup per codice_fiscale
        paziente_id = paziente.id

        # 3) Crea subito il referto (documento opzionale)
        referto = RefertiEtaBiologica(
            paziente=paziente,
            descrizione=data.get('descrizione'),
            documento=request.FILES.get('documento')
        )
        referto.save()

        # Helper per i float
        def sf(key):
            val = data.get(key)
            try:
                return float(val) if val not in (None, "",) else None
            except (TypeError, ValueError):
                return None

        # 4) Estrazione valori (logica invariata)
        chronological_age = int(persona.chronological_age)

        d_roms = sf('d_roms');   osi = sf('osi');     pat = sf('pat')

        my_acid = sf('my_acid'); p_acid = sf('p_acid'); st_acid = sf('st_acid'); ar_acid = sf('ar_acid')
        beenic_acid = sf('beenic_acid'); pal_acid = sf('pal_acid'); ol_acid = sf('ol_acid'); ner_acid = sf('ner_acid')
        a_linoleic_acid = sf('a_linoleic_acid'); eico_acid = sf('eico_acid'); doco_acid = sf('doco_acid'); lin_acid = sf('lin_acid')
        gamma_lin_acid = sf('gamma_lin_acid'); dih_gamma_lin_acid = sf('dih_gamma_lin_acid'); arachidonic_acid = sf('arachidonic_acid')
        sa_un_fatty_acid = sf('sa_un_fatty_acid'); o3o6_fatty_acid_quotient = sf('o3o6_fatty_acid_quotient')
        aa_epa = sf('aa_epa')
        o3_index = sf('o3_index')

        wbc = sf('wbc'); baso = sf('baso'); eosi = sf('eosi'); lymph = sf('lymph'); mono = sf('mono'); neut = sf('neut')
        neut_ul = sf('neut_ul'); lymph_ul = sf('lymph_ul'); mono_ul = sf('mono_ul'); eosi_ul = sf('eosi_ul'); baso_ul = sf('baso_ul')

        mch = sf('mch'); mchc = sf('mchc'); mcv = sf('mcv'); rdwsd = sf('rdwsd'); rdwcv = sf('rdwcv')
        hct_m = sf('hct_m'); hct_w = sf('hct_w'); hgb_m = sf('hgb_m'); hgb_w = sf('hgb_w'); rbc_m = sf('rbc_m'); rbc_w = sf('rbc_w')

        azotemia = sf('azotemia'); uric_acid = sf('uric_acid')
        creatinine_m = sf('creatinine_m'); creatinine_w = sf('creatinine_w')
        uricemy_m = sf('uricemy_m'); uricemy_w = sf('uricemy_w'); cistatine_c = sf('cistatine_c')

        plt = sf('plt'); mpv = sf('mpv'); plcr = sf('plcr'); pct = sf('pct'); pdw = sf('pdw'); d_dimero = sf('d_dimero'); pai_1 = sf('pai_1')

        tot_chol = sf('tot_chol'); ldl_chol = sf('ldl_chol'); hdl_chol_m = sf('hdl_chol_m'); hdl_chol_w = sf('hdl_chol_w'); trigl = sf('trigl')

        na = sf('na'); k = sf('k'); mg = sf('mg'); ci = sf('ci'); ca = sf('ca'); p = sf('p')

        dhea_m = sf('dhea_m'); dhea_w = sf('dhea_w'); testo_m = sf('testo_m'); testo_w = sf('testo_w')
        tsh = sf('tsh'); ft3 = sf('ft3'); ft4 = sf('ft4'); beta_es_m = sf('beta_es_m'); beta_es_w = sf('beta_es_w')
        prog_m = sf('prog_m'); prog_w = sf('prog_w')

        fe = sf('fe'); transferrin = sf('transferrin'); ferritin_m = sf('ferritin_m'); ferritin_w = sf('ferritin_w')

        glicemy = sf('glicemy'); insulin = sf('insulin'); homa = sf('homa'); ir = sf('ir')

        albuminemia = sf('albuminemia'); tot_prot = sf('tot_prot'); tot_prot_ele = sf('tot_prot_ele'); albumin_ele = sf('albumin_ele')
        a_1 = sf('a_1'); a_2 = sf('a_2'); b_1 = sf('b_1'); b_2 = sf('b_2'); gamma = sf('gamma')
        albumin_dI = sf('albumin_dI'); a_1_dI = sf('a_1_dI'); a_2_dI = sf('a_2_dI'); b_1_dI = sf('b_1_dI'); b_2_dI = sf('b_2_dI'); gamma_dI = sf('gamma_dI')
        ag_rap = sf('ag_rap')

        got_m = sf('got_m'); got_w = sf('got_w')
        gpt_m = sf('gpt_m'); gpt_w = sf('gpt_w')
        g_gt_m = sf('g_gt_m'); g_gt_w = sf('g_gt_w')
        a_photo_m = sf('a_photo_m'); a_photo_w = sf('a_photo_w')
        tot_bili = sf('tot_bili'); direct_bili = sf('direct_bili')
        # tollera typo del form "idirect_bili"
        indirect_bili = sf('indirect_bili') if sf('indirect_bili') is not None else sf('idirect_bili')

        ves = sf('ves'); pcr_c = sf('pcr_c'); sideremia = sf('sideremia')

        tnf_a = sf('tnf_a'); inter_6 = sf('inter_6'); inter_10 = sf('inter_10')

        scatolo = sf('scatolo'); indicano = sf('indicano')

        s_weight = sf('s_weight'); ph = sf('ph'); proteins_ex = sf('proteins_ex'); blood_ex = sf('blood_ex')
        ketones = sf('ketones'); uro = sf('uro'); bilirubin_ex = sf('bilirubin_ex'); leuc = sf('leuc'); glucose = sf('glucose')

        shbg_m = sf('shbg_m'); shbg_w = sf('shbg_w'); nt_pro = sf('nt_pro'); v_b12 = sf('v_b12'); v_d = sf('v_d'); ves2 = sf('ves2')

        telotest = sf('telotest')

        # 5) Exams by gender (invariato)
        exams = []
        if paziente.gender == 'M':
            exams = [
                {'my_acid': my_acid}, {'p_acid': p_acid}, {'st_acid': st_acid}, {'ar_acid': ar_acid},
                {'beenic_acid': beenic_acid}, {'pal_acid': pal_acid}, {'ol_acid': ol_acid}, {'ner_acid': ner_acid},
                {'a_linoleic_acid': a_linoleic_acid}, {'eico_acid': eico_acid}, {'doco_acid': doco_acid}, {'lin_acid': lin_acid},
                {'gamma_lin_acid': gamma_lin_acid}, {'dih_gamma_lin_acid': dih_gamma_lin_acid}, {'arachidonic_acid': arachidonic_acid},
                {'sa_un_fatty_acid': sa_un_fatty_acid}, {'o3o6_fatty_acid_quotient': o3o6_fatty_acid_quotient}, {'aa_epa': aa_epa},
                {'o3_index': o3_index}, {'neut_ul': neut_ul}, {'lymph_ul': lymph_ul}, {'mono_ul': mono_ul}, {'eosi_ul': eosi_ul},
                {'baso_ul': baso_ul}, {'rdwcv': rdwcv}, {'hct_m': hct_m}, {'hgb_m': hgb_m}, {'rbc_m': rbc_m}, {'azotemia': azotemia},
                {'uric_acid': uric_acid}, {'creatinine_m': creatinine_m}, {'uricemy_m': uricemy_m}, {'cistatine_c': cistatine_c},
                {'plt': plt}, {'mpv': mpv}, {'plcr': plcr}, {'pct': pct}, {'pdw': pdw}, {'d_dimero': d_dimero}, {'pai_1': pai_1},
                {'tot_chol': tot_chol}, {'ldl_chol': ldl_chol}, {'hdl_chol_m': hdl_chol_m}, {'trigl': trigl}, {'na': na}, {'k': k},
                {'mg': mg}, {'ci': ci}, {'ca': ca}, {'p': p}, {'dhea_m': dhea_m}, {'testo_m': testo_m}, {'tsh': tsh}, {'ft3': ft3},
                {'ft4': ft4}, {'beta_es_m': beta_es_m}, {'prog_m': prog_m}, {'fe': fe}, {'transferrin': transferrin},
                {'ferritin_m': ferritin_m}, {'glicemy': glicemy}, {'insulin': insulin}, {'homa': homa}, {'ir': ir},
                {'albuminemia': albuminemia}, {'tot_prot': tot_prot}, {'tot_prot_ele': tot_prot_ele}, {'albumin_ele': albumin_ele},
                {'a_1': a_1}, {'a_2': a_2}, {'b_1': b_1}, {'b_2': b_2}, {'gamma': gamma}, {'albumin_dI': albumin_dI},
                {'a_1_dI': a_1_dI}, {'a_2_dI': a_2_dI}, {'b_1_dI': b_1_dI}, {'b_2_dI': b_2_dI}, {'gamma_dI': gamma_dI},
                {'ag_rap': ag_rap}, {'got_m': got_m}, {'gpt_m': gpt_m}, {'g_gt_m': g_gt_m}, {'a_photo_m': a_photo_m},
                {'tot_bili': tot_bili}, {'direct_bili': direct_bili}, {'indirect_bili': indirect_bili}, {'ves': ves},
                {'pcr_c': pcr_c}, {'tnf_a': tnf_a}, {'inter_6': inter_6}, {'inter_10': inter_10}, {'scatolo': scatolo},
                {'indicano': indicano}, {'s_weight': s_weight}, {'ph': ph}, {'proteins_ex': proteins_ex}, {'blood_ex': blood_ex},
                {'ketones': ketones}, {'uro': uro}, {'bilirubin_ex': bilirubin_ex}, {'leuc': leuc}, {'glucose': glucose},
                {'shbg_m': shbg_m}, {'nt_pro': nt_pro}, {'v_b12': v_b12}, {'v_d': v_d}, {'ves2': ves2}, {'telotest': telotest}
            ]
        elif paziente.gender == 'F':
            exams = [
                {'my_acid': my_acid}, {'p_acid': p_acid}, {'st_acid': st_acid}, {'ar_acid': ar_acid},
                {'beenic_acid': beenic_acid}, {'pal_acid': pal_acid}, {'ol_acid': ol_acid}, {'ner_acid': ner_acid},
                {'a_linoleic_acid': a_linoleic_acid}, {'eico_acid': eico_acid}, {'doco_acid': doco_acid}, {'lin_acid': lin_acid},
                {'gamma_lin_acid': gamma_lin_acid}, {'dih_gamma_lin_acid': dih_gamma_lin_acid}, {'arachidonic_acid': arachidonic_acid},
                {'sa_un_fatty_acid': sa_un_fatty_acid}, {'o3o6_fatty_acid_quotient': o3o6_fatty_acid_quotient}, {'aa_epa': aa_epa},
                {'o3_index': o3_index}, {'neut_ul': neut_ul}, {'lymph_ul': lymph_ul}, {'mono_ul': mono_ul}, {'eosi_ul': eosi_ul},
                {'baso_ul': baso_ul}, {'rdwcv': rdwcv}, {'hct_w': hct_w}, {'hgb_w': hgb_w}, {'rbc_w': rbc_w}, {'azotemia': azotemia},
                {'uric_acid': uric_acid}, {'creatinine_w': creatinine_w}, {'uricemy_w': uricemy_w}, {'cistatine_c': cistatine_c},
                {'plt': plt}, {'mpv': mpv}, {'plcr': plcr}, {'pct': pct}, {'pdw': pdw}, {'d_dimero': d_dimero}, {'pai_1': pai_1},
                {'tot_chol': tot_chol}, {'ldl_chol': ldl_chol}, {'hdl_chol_w': hdl_chol_w}, {'trigl': trigl}, {'na': na}, {'k': k},
                {'mg': mg}, {'ci': ci}, {'ca': ca}, {'p': p}, {'dhea_w': dhea_w}, {'testo_w': testo_w}, {'tsh': tsh}, {'ft3': ft3},
                {'ft4': ft4}, {'beta_es_w': beta_es_w}, {'prog_w': prog_w}, {'fe': fe}, {'transferrin': transferrin},
                {'ferritin_w': ferritin_w}, {'glicemy': glicemy}, {'insulin': insulin}, {'homa': homa}, {'ir': ir},
                {'albuminemia': albuminemia}, {'tot_prot': tot_prot}, {'tot_prot_ele': tot_prot_ele}, {'albumin_ele': albumin_ele},
                {'a_1': a_1}, {'a_2': a_2}, {'b_1': b_1}, {'b_2': b_2}, {'gamma': gamma}, {'albumin_dI': albumin_dI},
                {'a_1_dI': a_1_dI}, {'a_2_dI': a_2_dI}, {'b_1_dI': b_1_dI}, {'b_2_dI': b_2_dI}, {'gamma_dI': gamma_dI},
                {'ag_rap': ag_rap}, {'got_w': got_w}, {'gpt_w': gpt_w}, {'g_gt_w': g_gt_w}, {'a_photo_w': a_photo_w},
                {'tot_bili': tot_bili}, {'direct_bili': direct_bili}, {'indirect_bili': indirect_bili}, {'ves': ves},
                {'pcr_c': pcr_c}, {'tnf_a': tnf_a}, {'inter_6': inter_6}, {'inter_10': inter_10}, {'scatolo': scatolo},
                {'indicano': indicano}, {'s_weight': s_weight}, {'ph': ph}, {'proteins_ex': proteins_ex}, {'blood_ex': blood_ex},
                {'ketones': ketones}, {'uro': uro}, {'bilirubin_ex': bilirubin_ex}, {'leuc': leuc}, {'glucose': glucose},
                {'shbg_w': shbg_w}, {'nt_pro': nt_pro}, {'v_b12': v_b12}, {'v_d': v_d}, {'ves2': ves2}, {'telotest': telotest}
            ]

        # Padding anti-IndexError per calculate_biological_age
        REQUIRED_MIN_LEN = 150
        if len(exams) < REQUIRED_MIN_LEN:
            exams.extend({} for _ in range(REQUIRED_MIN_LEN - len(exams)))

        # --- Mapping organi/tests (immutato) ---
        organi_esami = {
            "Cuore": ["Colesterolo Totale", "Colesterolo LDL", "Colesterolo HDL", "Trigliceridi",
                    "PCR", "NT-proBNP", "Omocisteina", "Glicemia", "Insulina",
                    "HOMA Test", "IR Test", "Creatinina", "Stress Ossidativo", "Omega Screening"],
            "Reni": ["Creatinina", "Azotemia", "Sodio", "Potassio", "Cloruri", "Fosforo", "Calcio", "Esame delle Urine"],
            "Fegato": ["Transaminasi GOT", "Transaminasi GPT", "Gamma-GT", "Bilirubina Totale",
                    "Bilirubina Diretta", "Bilirubina Indiretta", "Fosfatasi Alcalina", "Albumina", "Proteine Totali"],
            "Cervello": ["Omocisteina", "Vitamina B12", "Vitamina D", "DHEA", "TSH", "FT3",
                        "FT4", "Omega-3 Index", "EPA", "DHA",
                        "Stress Ossidativo dROMS", "Stress Ossidativo PAT", "Stress Ossidativo OSI REDOX"],
            "Sistema Ormonale": ["TSH", "FT3", "FT4", "Insulina", "HOMA Test", "IR Test", "Glicemia", "DHEA",
                                "Testosterone", "17B-Estradiolo", "Progesterone", "SHBG"],
            "Sangue": ["Emocromo - Globuli Rossi", "Emocromo - Emoglobina", "Emocromo - Ematocrito",
                    "Emocromo - MCV", "Emocromo - MCH", "Emocromo - MCHC", "Emocromo - RDW",
                    "Emocromo - Globuli Bianchi", "Emocromo - Neutrofili", "Emocromo - Linfociti",
                    "Emocromo - Monociti", "Emocromo - Eosinofili", "Emocromo - Basofili",
                    "Emocromo - Piastrine", "Ferritina", "Sideremia", "Transferrina"],
            "Sistema Immunitario": ["PCR", "Omocisteina", "TNF-A", "IL-6", "IL-10"],
        }

        TEST_FIELD_MAP = {
            "Colesterolo Totale": "tot_chol",
            "Colesterolo LDL": "ldl_chol",
            "Colesterolo HDL": "hdl_chol_m",
            "Trigliceridi": "trigl",
            "PCR": "pcr_c",
            "NT-proBNP": "nt_pro",
            "Omocisteina": "omocisteina",
            "Glicemia": "glicemy",
            "Insulina": "insulin",
            "HOMA Test": "homa",
            "IR Test": "ir",
            "Creatinina": "creatinine_m",
            "Stress Ossidativo": "osi",
            "Omega Screening": "o3o6_fatty_acid_quotient",
            "Azotemia": "azotemia",
            "Sodio": "na",
            "Potassio": "k",
            "Cloruri": "ci",
            "Fosforo": "p",
            "Calcio": "ca",
            "Esame delle Urine": "uro",
            "Transaminasi GOT": "got_m",
            "Transaminasi GPT": "gpt_m",
            "Gamma-GT": "g_gt_m",
            "Bilirubina Totale": "tot_bili",
            "Bilirubina Diretta": "direct_bili",
            "Bilirubina Indiretta": "indirect_bili",
            "Fosfatasi Alcalina": "a_photo_m",
            "Albumina": "albuminemia",
            "Proteine Totali": "tot_prot",
            "Vitamina B12": "v_b12",
            "Vitamina D": "v_d",
            "DHEA": "dhea_m",
            "TSH": "tsh",
            "FT3": "ft3",
            "FT4": "ft4",
            "Omega-3 Index": "o3_index",
            "EPA": "aa_epa",
            "DHA": "doco_acid",
            "Stress Ossidativo dROMS": "d_roms",
            "Stress Ossidativo PAT": "pat",
            "Stress Ossidativo OSI REDOX": "osi",
            "Testosterone": "testo_m",
            "17B-Estradiolo": "beta_es_m",
            "Progesterone": "prog_m",
            "SHBG": "shbg_m",
            "Emocromo - Globuli Rossi": "rbc",
            "Emocromo - Emoglobina": "hemoglobin",
            "Emocromo - Ematocrito": "hematocrit",
            "Emocromo - MCV": "mcv",
            "Emocromo - MCH": "mch",
            "Emocromo - MCHC": "mchc",
            "Emocromo - RDW": "rdw",
            "Emocromo - Globuli Bianchi": "wbc",
            "Emocromo - Neutrofili": "neutrophils_pct",
            "Emocromo - Linfociti": "lymphocytes_pct",
            "Emocromo - Monociti": "monocytes_pct",
            "Emocromo - Eosinofili": "eosinophils_pct",
            "Emocromo - Basofili": "basophils_pct",
            "Emocromo - Piastrine": "platelets",
            "Ferritina": "ferritin_m",
            "Sideremia": "sideremia",
            "Transferrina": "transferrin",
            "TNF-A": "tnf_a",
            "IL-6": "inter_6",
            "IL-10": "inter_10",
        }

        raw_values = {
            "tot_chol": tot_chol, "ldl_chol": ldl_chol, "hdl_chol_m": hdl_chol_m, "trigl": trigl,
            "pcr_c": pcr_c, "nt_pro": nt_pro,
            "omocisteina": ves2,
            "glicemy": glicemy, "insulin": insulin, "homa": homa, "ir": ir,
            "creatinine_m": creatinine_m, "osi": osi, "o3o6_fatty_acid_quotient": o3o6_fatty_acid_quotient,
            "azotemia": azotemia, "na": na, "k": k, "ci": ci, "p": p, "ca": ca, "uro": uro,
            "got_m": got_m, "gpt_m": gpt_m, "g_gt_m": g_gt_m, "tot_bili": tot_bili, "direct_bili": direct_bili,
            "indirect_bili": indirect_bili, "a_photo_m": a_photo_m, "albuminemia": albuminemia, "tot_prot": tot_prot,
            "v_b12": v_b12, "v_d": v_d, "dhea_m": dhea_m, "tsh": tsh, "ft3": ft3, "ft4": ft4,
            "o3_index": o3_index, "aa_epa": aa_epa, "doco_acid": doco_acid, "d_roms": d_roms, "pat": pat,
            "testo_m": testo_m, "beta_es_m": beta_es_m, "prog_m": prog_m, "shbg_m": shbg_m,
            "rbc": rbc_m, "hemoglobin": hgb_m, "hematocrit": hct_m, "mcv": mcv, "mch": mch, "mchc": mchc,
            "rdw": rdwsd, "wbc": wbc, "neutrophils_pct": neut_ul, "lymphocytes_pct": lymph_ul, "monocytes_pct": mono_ul,
            "eosinophils_pct": eosi_ul, "basophils_pct": baso_ul, "platelets": plt,
            "ferritin_m": ferritin_m, "sideremia": sideremia, "transferrin": transferrin,
            "tnf_a": tnf_a, "inter_6": inter_6, "inter_10": inter_10,
            "my_acid": my_acid, "p_acid": p_acid, "st_acid": st_acid, "ar_acid": ar_acid, "beenic_acid": beenic_acid,
            "pal_acid": pal_acid, "ol_acid": ol_acid, "ner_acid": ner_acid, "a_linoleic_acid": a_linoleic_acid,
            "eico_acid": eico_acid, "lin_acid": lin_acid, "gamma_lin_acid": gamma_lin_acid,
            "dih_gamma_lin_acid": dih_gamma_lin_acid, "arachidonic_acid": arachidonic_acid, "sa_un_fatty_acid": sa_un_fatty_acid,
            "ves": ves, "d_dimero": d_dimero, "pai_1": pai_1, "blood_ex": blood_ex, "proteins_ex": proteins_ex,
            "bilirubin_ex": bilirubin_ex, "ketones": ketones, "leuc": leuc, "glucose": glucose,
        }

        organi_valori = {
            organo: {
                test: raw_values.get(TEST_FIELD_MAP[test])
                for test in tests
                if TEST_FIELD_MAP.get(test) in raw_values
            }
            for organo, tests in organi_esami.items()
        }

        valori_esami_raw = {
            test: val
            for vals in organi_valori.values()
            for test, val in vals.items()
            if val is not None
        }

        # 7) Calcoli invariati
        punteggi_organi, dettagli_organi = calcola_score_organi(valori_esami_raw, persona.gender)
        score_js = {o.replace(" ", "_"): v for o, v in punteggi_organi.items()}
        _ = genera_report(punteggi_organi, dettagli_organi, mostrar_dettagli=False)

        biological_age = calculate_biological_age(
            chronological_age,
            d_roms=d_roms, osi=osi, pat=pat,
            wbc=wbc, basophils=baso_ul, eosinophils=eosi, lymphocytes=lymph, monocytes=mono, neutrophils=neut,
            rbc=rbc_m, hgb=hgb_m, hct=hct_m, mcv=mcv, mch=mch, mchc=mchc, rdw=rdwsd,
            exams=exams, gender=paziente.gender
        )

        # 8) Salvataggio Dati Estesi (filtrando i campi effettivi del modello)
        allowed_fields = {
            f.name
            for f in DatiEstesiRefertiEtaBiologica._meta.get_fields()
            if getattr(f, "concrete", False) and not getattr(f, "many_to_many", False) and not getattr(f, "auto_created", False)
        }

        payload = dict(
            referto=referto,

            d_roms=d_roms, osi=osi, pat=pat,

            my_acid=my_acid, p_acid=p_acid, st_acid=st_acid, ar_acid=ar_acid, beenic_acid=beenic_acid,
            pal_acid=pal_acid, ol_acid=ol_acid, ner_acid=ner_acid, a_linoleic_acid=a_linoleic_acid,
            eico_acid=eico_acid, doco_acid=doco_acid, lin_acid=lin_acid, gamma_lin_acid=gamma_lin_acid,
            dih_gamma_lin_acid=dih_gamma_lin_acid, arachidonic_acid=arachidonic_acid, sa_un_fatty_acid=sa_un_fatty_acid,
            o3o6_fatty_acid_quotient=o3o6_fatty_acid_quotient, aa_epa=aa_epa, o3_index=o3_index,

            wbc=wbc, baso=baso, eosi=eosi, lymph=lymph, mono=mono, neut=neut,
            neut_ul=neut_ul, lymph_ul=lymph_ul, mono_ul=mono_ul, eosi_ul=eosi_ul, baso_ul=baso_ul,

            mch=mch, mchc=mchc, mcv=mcv, rdwsd=rdwsd, rdwcv=rdwcv,
            hct_m=hct_m, hct_w=hct_w, hgb_m=hgb_m, hgb_w=hgb_w, rbc_m=rbc_m, rbc_w=rbc_w,

            azotemia=azotemia, uric_acid=uric_acid, creatinine_m=creatinine_m, creatinine_w=creatinine_w,
            uricemy_m=uricemy_m, uricemy_w=uricemy_w, cistatine_c=cistatine_c,

            plt=plt, mpv=mpv, plcr=plcr, pct=pct, pdw=pdw, d_dimero=d_dimero, pai_1=pai_1,

            tot_chol=tot_chol, ldl_chol=ldl_chol, hdl_chol_m=hdl_chol_m, hdl_chol_w=hdl_chol_w, trigl=trigl,

            na=na, k=k, mg=mg, ci=ci, ca=ca, p=p,

            dhea_m=dhea_m, dhea_w=dhea_w, testo_m=testo_m, testo_w=testo_w,
            tsh=tsh, ft3=ft3, ft4=ft4, beta_es_m=beta_es_m, beta_es_w=beta_es_w, prog_m=prog_m, prog_w=prog_w,

            fe=fe, transferrin=transferrin, ferritin_m=ferritin_m, ferritin_w=ferritin_w,

            glicemy=glicemy, insulin=insulin, homa=homa, ir=ir,

            albuminemia=albuminemia, tot_prot=tot_prot, tot_prot_ele=tot_prot_ele, albumin_ele=albumin_ele,
            a_1=a_1, a_2=a_2, b_1=b_1, b_2=b_2, gamma=gamma,
            albumin_dI=albumin_dI, a_1_dI=a_1_dI, a_2_dI=a_2_dI, b_1_dI=b_1_dI, b_2_dI=b_2_dI, gamma_dI=gamma_dI, ag_rap=ag_rap,

            got_m=got_m, got_w=got_w, gpt_m=gpt_m, gpt_w=gpt_w, g_gt_m=g_gt_m, g_gt_w=g_gt_w,
            a_photo_m=a_photo_m, a_photo_w=a_photo_w,
            tot_bili=tot_bili, direct_bili=direct_bili, indirect_bili=indirect_bili,

            ves=ves, pcr_c=pcr_c,

            tnf_a=tnf_a, inter_6=inter_6, inter_10=inter_10,

            scatolo=scatolo, indicano=indicano,

            s_weight=s_weight, ph=ph, proteins_ex=proteins_ex, blood_ex=blood_ex,
            ketones=ketones, uro=uro, bilirubin_ex=bilirubin_ex, leuc=leuc, glucose=glucose,

            shbg_m=shbg_m, shbg_w=shbg_w, nt_pro=nt_pro, v_b12=v_b12, v_d=v_d, ves2=ves2,

            telotest=telotest,

            biological_age=biological_age,

            # SCORE
            salute_cuore=score_js.get('Cuore'),
            salute_renale=score_js.get('Reni'),
            salute_epatica=score_js.get('Fegato'),
            salute_cerebrale=score_js.get('Cervello'),
            salute_ormonale=score_js.get('Sistema_Ormonale'),
            salute_sangue=score_js.get('Sangue'),
            salute_s_i=score_js.get('Sistema_Immunitario'),
        )

        filtered_payload = {k: v for k, v in payload.items() if k in allowed_fields}

        dati_estesi = DatiEstesiRefertiEtaBiologica(**filtered_payload)
        dati_estesi.save()

        # 9) Render + pannello attivo + messaggio successo
        context = {
            "show_modal": True,
            "biological_age": biological_age,
            "data": data,
            "id_persona": paziente_id,
            "dottore": dottore,
            "persona": persona,
            "active_panel": "panel-eta-biologica",
        }
        messages.success(request, "Calcolo età biologica salvato correttamente.")
        return render(request, "cartella_paziente/orologi/orologi_home.html", context)
























































@method_decorator(catch_exceptions, name='dispatch')
class ElencoRefertiView(LoginRequiredMixin,View):

    def get(self, request, id):
        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)
        
        #DATI REFERTI ETA' BIOLOGICA
        referti_recenti = persona.referti.all().order_by('-data_referto')
        dati_estesi = DatiEstesiRefertiEtaBiologica.objects.filter(referto__in=referti_recenti)
        
        dati_estesi_ultimo_referto = None

        context = {
            'persona': persona,
            'referti_recenti': referti_recenti,
            'dati_estesi': dati_estesi,
            'dati_estesi_ultimo_referto': dati_estesi_ultimo_referto,
            'dottore' : dottore,
        }

        return render(request, "cartella_paziente/eta_biologica/elencoReferti.html", context)
   
@method_decorator(catch_exceptions, name='dispatch')
class PersonaDetailView(LoginRequiredMixin,View):

    def get(self, request, persona_id):

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, dottore=dottore, id=persona_id)

        referto_id = request.GET.get("referto_id")

        if referto_id:                     
            referto = get_object_or_404(RefertiEtaBiologica, id=referto_id, paziente=persona)
        else:
            referto = RefertiEtaBiologica.objects.filter(paziente=persona).order_by("-data_ora_creazione").first()

        dati_estesi = DatiEstesiRefertiEtaBiologica.objects.filter(referto=referto).first() if referto else None


        context = {
            'persona': persona,
            'referto': referto,
            'datiEstesi': dati_estesi,
            'dottore': dottore,
        }
        return render(request, "cartella_paziente/eta_biologica/Referto.html", context)

@method_decorator(catch_exceptions, name='dispatch')
class GrafiAndamentoBiologica(LoginRequiredMixin, View):

    def get(self, request, persona_id):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, dottore=dottore, id=persona_id)

        # 1) Tutti i referti del paziente
        referti = (
            RefertiEtaBiologica.objects
            .filter(paziente=persona)
            .select_related('dati_estesi')
            .order_by('data_referto')
        )

        labels         =   []
        tot_chol       =   []
        ldl_chol       =   []
        hdl_chol       =   []
        trigl          =   []
        pai_1          =   []
        d_dimero       =   []
        d_roms         =   []
        pat            =   []
        osi            =   []
        labels_renal   =   []
        creat_in       =   []
        azotemia_list  =   []
        cystatine_list =   []
        uric_in        =   [] 
        labels_liver   =   []
        ggt_list       =   []
        alp_list       =   []
        got_list       =   []
        gpt_list       =   []
        bili_dir_list  =   []
        bili_indir_list=   []
        albumin_list   =   []
        labels_brain   =   []
        mag_list       =   []
        na_list        =   []
        k_list         =   []
        b12_list       =   []
        labels_hormonal=   []
        glicemia_list  =   []
        tsh_list       =   []
        insulina_list  =   []
        homa_list      =   []
        ir_list        =   []
        labels_blood   =   []
        wbc_list       =   []
        hct_list       =   []
        hgb_list       =   []
        rbc_list       =   []
        plt_list       =   []
        sider_list     =   []
        ferritin_list  =   []
        transf_list    =   []
        labels_immune  =   []
        pcr_list       =   []
        tnf_list       =   []
        il6_list       =   []
        il10_list      =   []


        for r in referti:
            labels_immune.append(r.data_referto.strftime('%b %Y'))
            de = getattr(r, 'dati_estesi', None)
            pcr_list.append(de.pcr_c         if de else None)
            tnf_list.append(de.tnf_a         if de else None)
            il6_list.append(de.inter_6       if de else None)
            il10_list.append(de.inter_10     if de else None)

        for r in referti:
            labels_blood.append(r.data_referto.strftime('%b %Y'))
            de = getattr(r, 'dati_estesi', None)

            # WBC e PLT
            wbc_list.append(de.wbc        if de else None)
            plt_list.append(de.plt        if de else None)

            # Sideremia e Transferrina
            sider_list.append(de.fe       if de else None)
            transf_list.append(de.transferrin if de else None)

            # Uomo vs Donna per hct, hgb, rbc, ferritina
            if de:
                if persona.gender == 'M':
                    hct_list.append(de.hct_m)
                    hgb_list.append(de.hgb_m)
                    rbc_list.append(de.rbc_m)
                    ferritin_list.append(de.ferritin_m)
                else:
                    hct_list.append(de.hct_w)
                    hgb_list.append(de.hgb_w)
                    rbc_list.append(de.rbc_w)
                    ferritin_list.append(de.ferritin_w)
            else:
                hct_list.append(None)
                hgb_list.append(None)
                rbc_list.append(None)
                ferritin_list.append(None)

        for r in referti:
            labels_hormonal.append(r.data_referto.strftime('%b %Y'))
            de = getattr(r, 'dati_estesi', None)

            glicemia_list.append(de.glicemy if de else None)
            tsh_list.append(     de.tsh     if de else None)
            insulina_list.append(de.insulin if de else None)
            homa_list.append(    de.homa    if de else None)
            ir_list.append(      de.ir      if de else None)

        for r in referti:
            labels_brain.append(r.data_referto.strftime('%b %Y'))
            de = getattr(r, 'dati_estesi', None)

            mag_list.append(    de.mg       if de else None)
            na_list.append(     de.na       if de else None)
            k_list.append(      de.k        if de else None)
            b12_list.append(    de.v_b12    if de else None)

        for r in referti:
            labels_liver.append(r.data_referto.strftime('%b %Y'))
            de = getattr(r, 'dati_estesi', None)

            # GGT
            ggt_list.append(de.g_gt_m    if (de and persona.gender=='M') else
                            de.g_gt_w    if de else None)

            # ALP (Fosfatasi Alcalina)
            alp_list.append(de.a_photo_m if (de and persona.gender=='M') else
                            de.a_photo_w if de else None)

            # GOT (AST)
            got_list.append(de.got_m     if (de and persona.gender=='M') else
                            de.got_w     if de else None)

            # GPT (ALT)
            gpt_list.append(de.gpt_m     if (de and persona.gender=='M') else
                            de.gpt_w     if de else None)

            # Bilirubine
            bili_dir_list.append(   de.direct_bili   if de else None)
            bili_indir_list.append( de.indirect_bili if de else None)

            # Albumina
            albumin_list.append(de.albuminemia if de else None)

        for r in referti:
            labels_renal.append(r.data_referto.strftime('%b %Y'))
            de = getattr(r, 'dati_estesi', None)

            # Creatinina in base al sesso
            if de:
                if persona.gender == 'M':
                    creat_in.append(de.creatinine_m)
                    uric_in.append(de.uricemy_m)
                else:
                    creat_in.append(de.creatinine_w)
                    uric_in.append(de.uricemy_w)
            else:
                creat_in.append(None)
                uric_in.append(None)

            azotemia_list.append(de.azotemia if de else None)
            cystatine_list.append(de.cistatine_c if de else None)

        for r in referti:
        
            labels.append(r.data_referto.strftime('%b %Y'))
            de = getattr(r, 'dati_estesi', None)


            tot_chol.append(de.tot_chol      if de else None)
            ldl_chol.append(de.ldl_chol      if de else None)
            if de:
                hdl_chol.append(de.hdl_chol_m if persona.gender =='M' else de.hdl_chol_w)
            else:
                hdl_chol.append(None)
            trigl.append(de.trigl                if de else None)
            pai_1.append(de.pai_1                if de else None)
            d_dimero.append(de.d_dimero          if de else None)
            d_roms.append(de.d_roms              if de else None)
            pat.append(de.pat                    if de else None)
            osi.append(de.osi                    if de else None)

        context = {
            'persona':       persona,
            'dottore':       dottore,
            'referti':       referti,
            'labels_heart':  labels,
            'tot_chol':      tot_chol,
            'ldl_chol':      ldl_chol,
            'hdl_chol':      hdl_chol,
            'trigl':         trigl,
            'pai_1':         pai_1,
            'd_dimero':      d_dimero,
            'd_roms':        d_roms,
            'pat':           pat,
            'osi':           osi,
            'labels_renal':    labels_renal,
            'creat_in':        creat_in,
            'azotemia_list':   azotemia_list,
            'cystatine_list':  cystatine_list,
            'uric_in':         uric_in,
            'labels_liver':    labels_liver,
            'ggt_list':        ggt_list,
            'alp_list':        alp_list,
            'got_list':        got_list,
            'gpt_list':        gpt_list,
            'bili_dir_list':   bili_dir_list,
            'bili_indir_list': bili_indir_list,
            'albumin_list':    albumin_list,
            'labels_brain':  labels_brain,
            'mag_list':      mag_list,
            'na_list':       na_list,
            'k_list':        k_list,
            'b12_list':      b12_list,
            'labels_hormonal': labels_hormonal,
            'glicemia_list':   glicemia_list,
            'tsh_list':        tsh_list,
            'insulina_list':   insulina_list,
            'homa_list':       homa_list,
            'ir_list':         ir_list,
            'labels_blood':   labels_blood,
            'wbc_list':       wbc_list,
            'hct_list':       hct_list,
            'hgb_list':       hgb_list,
            'rbc_list':       rbc_list,
            'plt_list':       plt_list,
            'sider_list':     sider_list,
            'ferritin_list':  ferritin_list,
            'transf_list':    transf_list,
            'labels_immune': labels_immune,
            'pcr_list':      pcr_list,
            'tnf_list':      tnf_list,
            'il6_list':      il6_list,
            'il10_list':     il10_list,
        }
       
        return render(request, "cartella_paziente/eta_biologica/grafici.html", context)













## SEZIONE RESILIENZA
@method_decorator(catch_exceptions, name='dispatch')
class ResilienzaView(LoginRequiredMixin, View):
    template_name = "cartella_paziente/resilienza/Resilienza.html"

    def get(self, request, persona_id):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=persona_id)

        # elenco misurazioni (più recenti in alto)
        misurazioni = Resilienza.objects.filter(
            paziente=persona
        ).order_by('-data_misurazione')

        context = {
            'persona': persona,
            'dottore': dottore,
            'misurazioni': misurazioni,
        }
        return render(request, self.template_name, context)

    def post(self, request, persona_id):
        persona = get_object_or_404(TabellaPazienti, id=persona_id)

        def to_float(name):
            raw = (request.POST.get(name) or '').strip()
            if not raw:
                return None
            raw = raw.replace(',', '.')
            try:
                return float(raw)
            except ValueError:
                return None

        def parse_when():
            s = (request.POST.get('data_misurazione') or '').strip()
            if not s:
                return timezone.now()
            fmts = ["%Y-%m-%dT%H:%M","%Y-%m-%d %H:%M","%d/%m/%Y %H:%M","%Y-%m-%d","%d/%m/%Y"]
            for f in fmts:
                try:
                    dt = datetime.strptime(s, f)
                    if timezone.is_naive(dt):
                        dt = timezone.make_aware(dt, timezone.get_current_timezone())
                    return dt
                except ValueError:
                    pass
            return timezone.now()

        PROTOCOL_CHOICES = (('30m','30 m'),('60m','60 m'),('24h','24 h'))
        valid_protocol_keys = {k for k,_ in PROTOCOL_CHOICES}

        protocollo = request.POST.get('protocollo')
        if protocollo not in valid_protocol_keys:
            messages.error(request, "Seleziona un protocollo valido (30m, 60m, 24h).")
            return redirect('resilienza', persona_id=persona_id)

        ALLOWED_TESTS = {'hrv','bp','holter'}  # assicurati che coincida con i value del form
        selected_tests = [t for t in request.POST.getlist('selected_tests') if t in ALLOWED_TESTS]
        if not selected_tests:
            messages.error(request, "Seleziona almeno una card (max 3).")
            return redirect('resilienza', persona_id=persona_id)
        if len(selected_tests) > 3:
            messages.error(request, "Puoi selezionare al massimo 3 card.")
            return redirect('resilienza', persona_id=persona_id)

        when = parse_when()

        bp_pp_calc = to_float('bp_pp_calc')
        if bp_pp_calc is None:
            sbp = to_float('bp_sbp_mean')
            dbp = to_float('bp_dbp_mean')
            if sbp is not None and dbp is not None:
                bp_pp_calc = round(sbp - dbp, 2)

        obj = Resilienza.objects.create(
            paziente=persona,
            protocollo=protocollo,
            selected_tests=selected_tests,
            data_misurazione=when,
            hrv_rmssd=to_float('hrv_rmssd'),
            hrv_sdnn=to_float('hrv_sdnn'),
            hrv_pnn50=to_float('hrv_pnn50'),
            hrv_lf_power=to_float('hrv_lf_power'),
            hrv_hf_power=to_float('hrv_hf_power'),
            hrv_lf_hf=to_float('hrv_lf_hf'),
            bp_sbp_mean=to_float('bp_sbp_mean'),
            bp_dbp_mean=to_float('bp_dbp_mean'),
            bp_pp_calc=bp_pp_calc,
            bp_sd_sbp=to_float('bp_sd_sbp'),
            bp_sd_dbp=to_float('bp_sd_dbp'),
            bp_morning_surge=to_float('bp_morning_surge'),
            bp_nocturnal_dip=to_float('bp_nocturnal_dip'),
            holter_hr_mean=to_float('holter_hr_mean'),
            holter_hr_min=to_float('holter_hr_min'),
            holter_hr_max=to_float('holter_hr_max'),
            holter_pac_hour=to_float('holter_pac_hour'),
            holter_pvc_hour=to_float('holter_pvc_hour'),
            holter_af_burden=to_float('holter_af_burden'),
            holter_st_events=to_float('holter_st_events'),
        )

        messages.success(request, f"Misurazione di resilienza salvata (ID {obj.id}).")
        return redirect('resilienza', persona_id=persona_id)



## SEZIONE PIANO TERAPEUTICO
@method_decorator(catch_exceptions, name='dispatch')
class PianoTerapeutico(LoginRequiredMixin,View):

    def get(self, request, persona_id):

        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=persona_id)

        #ELENCO PRESCRIZIONI ESAMI PAZIENTE
        visite_list = PrescrizioniEsami.objects.filter(paziente=persona).order_by('-data_visita')
        
        paginator = Paginator(visite_list, 5)  
        page_number = request.GET.get('page')
        visite_page = paginator.get_page(page_number)

        context = {
            'persona': persona,
            'dottore' : dottore,
            'visite': visite_page,  
        }

        return render(request, 'cartella_paziente/piano_terapeutico/piano_terapeutico.html', context)

### SEZIONE PRESCRIZIONI ESAMI
@method_decorator(catch_exceptions, name='dispatch')
class PrescrizioniView(LoginRequiredMixin,View):

    def get(self, request, persona_id):

        persona = get_object_or_404(TabellaPazienti, id=persona_id)

        
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        context = {
            'persona': persona,
            'dottore': dottore,
        }

        return render(request, "cartella_paziente/sezioni_storico/esami.html", context)


    def post(self, request, persona_id):
        persona = get_object_or_404(TabellaPazienti, id=persona_id)
        
        listaCodici = request.POST.get('codici_esami')
        data_list = json.loads(listaCodici)
        numeri = [x for x in data_list if x.isdigit()]

        nuova_visita = PrescrizioniEsami.objects.create(
            paziente=persona,
            esami_prescritti=json.dumps(numeri),
        )

        return redirect('piano_terapeutico', persona_id)



# TO DEFINE
@method_decorator(catch_exceptions, name='dispatch')
class UpdatePersonaContactView(LoginRequiredMixin,View):

    def post(self, request, id):

        role = get_user_role(request) 
       
        try:   
            data = json.loads(request.body)
            cap = data.get("cap")
            province = data.get("province")
            residence = data.get("residence")
            email = data.get("email")
            phone = data.get("phone")
            associate_staff = data.get("associate_staff")
            blood_group = data.get("blood_group")

            from .models import TabellaPazienti 

            profile = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

            persona = TabellaPazienti.objects.get(id=id)
            persona.cap = cap
            persona.residence = residence
            persona.province = province
            persona.email = email
            persona.phone = phone
            persona.associate_staff = associate_staff
            persona.blood_group = blood_group

            if role:
                doctor_id = request.POST.get('dottore')
                if doctor_id:
                    persona.dottore_id = int(doctor_id)
                else:
                    persona.dottore = None     

            persona.save() 

            return JsonResponse({"success": True})
        
        except TabellaPazienti.DoesNotExist:
            return JsonResponse({"success": False, "error": "Persona non trovata"})
        
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "JSON non valido"})
        
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    



    def get(self, request, id):

        persona = get_object_or_404(TabellaPazienti, id=id)
        referti_test_recenti = persona.referti_test.all().order_by('-data_ora_creazione')
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)

        context = {
            'persona': persona,
            'referti_test_recenti': referti_test_recenti,
            'dottore': dottore
        }
        return render(request, "cartella_paziente/capacita_vitale/EtaVitale.html", context)
    

@method_decorator(catch_exceptions, name='dispatch')
class RefertoView(LoginRequiredMixin,View):
    def get(self, request, referto_id):
        referto = RefertiEtaBiologica.objects.get(id=referto_id)
        return render(request, 'cartella_paziente/eta_biologica//Referto.html', {'data_referto': referto.data_referto})





## SEZIONE MICROIDIOTA
@method_decorator(catch_exceptions, name='dispatch')
class MicrobiotaView(LoginRequiredMixin,View):
    """Microbiota homepage view class"""

    def get(self, request, id): 
        """Handling get request for microbiota home section"""

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)
        ultimo_report = persona.microbiota_reports.order_by('-created_at').first()

        context = {
            'persona': persona,
            'dottore': dottore,
            'ultimo_report': ultimo_report,
        }

        return render(request, 'cartella_paziente/microbiota/microbiota.html', context)

## AGGIUNGI REPORT MICROBIOTA
@method_decorator(catch_exceptions, name='dispatch')
class MicrobiotaAddView(LoginRequiredMixin, View):
    """Microbiota section add and generete report"""
    
    def get(self, request, persona_id):
        """Handling get request for microbiota section"""

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=persona_id)

        context ={
                'persona': persona,        
        } 

        return render(request, "cartella_paziente/microbiota/add.html" , context)
    

    def post(self, request, persona_id):
        """Handling post request for microbiota section"""

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=persona_id)

        report = MicrobiotaReport.objects.create(
            paziente_id=persona_id,
            caricato_da=request.user,
        )
        queryDict = self.request.POST

        for key, values in queryDict.items():
            if hasattr(report, key):
                setattr(report, key, values)
        report.save()

        ultimo_report = persona.microbiota_reports.order_by('-created_at').first()

        context ={
            'persona': persona,
            'ultimo_report' : ultimo_report
        } 

        return render(request, "cartella_paziente/microbiota/microbiota.html" , context)



def _clean_value_for_model(model_cls, field_name, raw_val):
    """
    Normalizza il valore in base al tipo campo del MODELLO:
    - DateField: "" -> None; parse YYYY-MM-DD; se invalido -> None (se nullable).
    - Altri campi: trim stringhe; lascia None se vuoto.
    """
    try:
        field = model_cls._meta.get_field(field_name)
    except Exception:
        # Campo non esiste sul modello; ignora silenziosamente
        return None

    val = raw_val
    if isinstance(val, str):
        val = val.strip()

    # vuoto -> None per campi nullable
    if val in ("", None):
        return None if getattr(field, "null", False) else val

    # Cast specifico per DateField
    if isinstance(field, DateField):
        try:
            return datetime.strptime(val, "%Y-%m-%d").date()
        except Exception:
            return None if getattr(field, "null", False) else val

    # Default: ritorna il valore così com'è
    return val


@method_decorator(catch_exceptions, name='dispatch')
class ElencoVisiteView(LoginRequiredMixin, View):

    def get(self, request, id):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)

        visite = Visita.objects.filter(paziente=persona).order_by('-data_visita', '-visita_numero')
        paginator = Paginator(visite, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context = {'persona': persona, 'visite': page_obj}
        return render(request, "cartella_paziente/visite.html", context)

    def post(self, request, id):
        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=id)
        data = request.POST

        # Campi del MODELLO che vuoi gestire (per coerenza con il template mostrato)
        model_fields = [
            'professione', 'pensionato',
            'menarca', 'ciclo', 'sintomi', 'esordio', 'parto', 'post_parto', 'aborto',
            'alcol', 'alcol_type', 'data_alcol', 'alcol_frequency',
            'smoke', 'smoke_frequency', 'reduced_intake',
            'sport', 'sport_livello', 'sport_frequency',
            'attivita_sedentaria', 'livello_sedentarieta', 'sedentarieta_nota',
            'm_cardiache', 'diabete_m', 'obesita', 'epilessia', 'ipertensione',
            'm_tiroidee', 'm_polmonari', 'tumori', 'allergie', 'm_psichiatriche',
            'patologie', 'p_p_altro', 't_farmaco', 't_dosaggio', 't_durata',
            'p_cardiovascolari', 'm_metabolica', 'p_respiratori_cronici',
            'm_neurologica', 'm_endocrina', 'm_autoimmune', 'p_epatici',
            'm_renale', 'd_gastrointestinali',
            'eloquio', 's_nutrizionale', 'a_genarale', 'psiche', 'r_ambiente',
            's_emotivo', 'costituzione', 'statura',
            'blood_group', 'rh_factor', 'pressure_min', 'pressure_max',
        ]

        # Mappa form->model (alias per i nomi discordanti nel template)
        fields_map = {name: name for name in model_fields}
        fields_map.update({
            'm_cardiache_fam': 'm_cardiache',  # nel template hai questo name
            'a_generale': 'a_genarale',        # template usa "a_generale"
        })

        # --- Aggiornamento PERSONA via .update(**updates) ---
        updates = {}
        for form_name, model_name in fields_map.items():
            if form_name in data:
                cleaned = _clean_value_for_model(TabellaPazienti, model_name, data.get(form_name))
                # Nota: .update(**updates) ignora i campi non esistenti; noi filtriamo già
                updates[model_name] = cleaned

        if updates:
            TabellaPazienti.objects.filter(pk=persona.pk).update(**updates)
            # ricarica persona fresca dal DB per il render successivo
            persona.refresh_from_db()

        # --- Prossimo numero visita ---
        last_visita = Visita.objects.filter(paziente=persona).order_by('-visita_numero').first()
        next_visita_numero = (last_visita.visita_numero or 0) + 1 if last_visita else 1

        # --- Data visita dal form (fallback a oggi se mancante/errata) ---
        data_visita_str = data.get('visita_data_visita', '')
        try:
            data_visita_val = datetime.strptime(data_visita_str, '%Y-%m-%d').date() if data_visita_str else datetime.now().date()
        except ValueError:
            data_visita_val = datetime.now().date()

        # --- Crea VISITA e copia i campi compilati (puliti) ---
        visita = Visita(
            paziente=persona,
            visita_numero=next_visita_numero,
            data_visita=data_visita_val,
        )

        # riusa la stessa mappa ma valida contro il modello Visita
        for form_name, model_name in fields_map.items():
            if form_name in data:
                cleaned = _clean_value_for_model(Visita, model_name, data.get(form_name))
                # evita di settare attributi che non esistono sul modello Visita
                try:
                    Visita._meta.get_field(model_name)
                    setattr(visita, model_name, cleaned)
                except Exception:
                    pass

        visita.save()

        # --- Paginazione come nel GET ---
        visite = Visita.objects.filter(paziente=persona).order_by('-data_visita', '-visita_numero')
        paginator = Paginator(visite, 10)

        page_number = request.POST.get('page') or request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context = {
            'persona': persona,
            'visite': page_obj,
            'message': 'Dati paziente e visita salvati con successo.',
        }
        return render(request, "cartella_paziente/visite.html", context)











@method_decorator(catch_exceptions, name='dispatch')
class GetVisitaView(LoginRequiredMixin, View):
    def get(self, request, visita_id):
        visita = get_object_or_404(Visita, id=visita_id)

        def d(val):  # default string
            return val if val is not None else ""

        def datefmt(val):
            return val.strftime("%Y-%m-%d") if val else ""

        data = {
            # Intestazione visita
            "id": visita.id,
            "visita_numero": d(visita.visita_numero),
            "data_visita": datefmt(getattr(visita, "data_visita", None)),

            # Informazioni occupazione
            "professione": d(getattr(visita, "professione", None)),
            "pensionato": d(getattr(visita, "pensionato", None)),

            # Donna (ciclo/menopausa/gravidanze)
            "menarca": d(getattr(visita, "menarca", None)),
            "ciclo": d(getattr(visita, "ciclo", None)),
            "sintomi": d(getattr(visita, "sintomi", None)),
            "esordio": d(getattr(visita, "esordio", None)),
            "parto": d(getattr(visita, "parto", None)),
            "post_parto": d(getattr(visita, "post_parto", None)),
            "aborto": d(getattr(visita, "aborto", None)),

            # Stile di vita — Alcol
            "alcol": d(getattr(visita, "alcol", None)),
            "alcol_type": d(getattr(visita, "alcol_type", None)),
            "data_alcol": datefmt(getattr(visita, "data_alcol", None)),
            "alcol_frequency": d(getattr(visita, "alcol_frequency", None)),

            # Stile di vita — Fumo
            "smoke": d(getattr(visita, "smoke", None)),
            "smoke_frequency": d(getattr(visita, "smoke_frequency", None)),
            "reduced_intake": d(getattr(visita, "reduced_intake", None)),

            # Stile di vita — Sport
            "sport": d(getattr(visita, "sport", None)),
            "sport_livello": d(getattr(visita, "sport_livello", None)),
            "sport_frequency": d(getattr(visita, "sport_frequency", None)),

            # Stile di vita — Sedentarietà
            "attivita_sedentaria": d(getattr(visita, "attivita_sedentaria", None)),
            "livello_sedentarieta": d(getattr(visita, "livello_sedentarieta", None)),
            "sedentarieta_nota": d(getattr(visita, "sedentarieta_nota", None)),

            # Anamnesi familiare
            "m_cardiache": d(getattr(visita, "m_cardiache", None)),
            "diabete_m": d(getattr(visita, "diabete_m", None)),
            "ipertensione": d(getattr(visita, "ipertensione", None)),
            "obesita": d(getattr(visita, "obesita", None)),
            "epilessia": d(getattr(visita, "epilessia", None)),
            "m_tiroidee": d(getattr(visita, "m_tiroidee", None)),
            "m_polmonari": d(getattr(visita, "m_polmonari", None)),
            "tumori": d(getattr(visita, "tumori", None)),
            "allergie": d(getattr(visita, "allergie", None)),
            "m_psichiatriche": d(getattr(visita, "m_psichiatriche", None)),

            # Anamnesi patologica prossima + Altro
            "patologie": d(getattr(visita, "patologie", None)),
            "p_p_altro": d(getattr(visita, "p_p_altro", None)),

            # Terapie in corso
            "t_farmaco": d(getattr(visita, "t_farmaco", None)),
            "t_dosaggio": d(getattr(visita, "t_dosaggio", None)),
            "t_durata": d(getattr(visita, "t_durata", None)),

            # Esame obiettivo
            # Nota: nel tuo modello il campo pare chiamarsi a_genarale (con la 'r' fuori posto)
            "a_generale": d(getattr(visita, "a_genarale", getattr(visita, "a_generale", None))),
            "psiche": d(getattr(visita, "psiche", None)),
            "r_ambiente": d(getattr(visita, "r_ambiente", None)),
            "s_emotivo": d(getattr(visita, "s_emotivo", None)),
            "costituzione": d(getattr(visita, "costituzione", None)),
            "statura": d(getattr(visita, "statura", None)),
            "s_nutrizionale": d(getattr(visita, "s_nutrizionale", None)),
            "eloquio": d(getattr(visita, "eloquio", None)),

            # Informazioni del sangue / parametri vitali
            "pressure_min": d(getattr(visita, "pressure_min", None)),
            "pressure_max": d(getattr(visita, "pressure_max", None)),
            "heart_rate": d(getattr(visita, "heart_rate", None)),
            "blood_group": d(getattr(visita, "blood_group", None)),
            "rh_factor": d(getattr(visita, "rh_factor", None)),
        }
        return JsonResponse(data, status=200)
    







@method_decorator(catch_exceptions, name='dispatch')
class OrologiView(LoginRequiredMixin, View):
    def get(self, request, persona_id):

        dottore = get_object_or_404(UtentiRegistratiCredenziali, user=request.user)
        persona = get_object_or_404(TabellaPazienti, id=persona_id)
        

        context = {
            'persona': persona,
            'dottore': dottore,
        }

        return render(request, "cartella_paziente/orologi/orologi_home.html", context)