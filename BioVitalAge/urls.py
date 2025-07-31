"""
Routing core app
"""

from django.urls import path # type: ignore
from . import views
from .views import *
from django.conf.urls.static import static
from django.http import HttpResponse



urlpatterns = [

    # URL PER LOGIN
    path("",                                                    views.LoginRenderingPage.as_view(),                  name='loginPage'),
    path("logout",                                              LogOutRender.as_view(),                              name="logout"),
  
    # URL NAVBAR    
    path('accounts/profile/',                                   ProfileView.as_view(),                               name='profile'),

    # -- URL HOME PAGE --
    path("Home_Page/",                                           HomePageRender.as_view(),                            name='HomePage'),

    ## URL SIDEBAR
    path('api/appointment-notifications/',                      AppointmentNotificationsView.as_view(),              name='appointment-notifications'),
    path('api/medical-news-notifications/',                     MedicalNewsNotificationsView.as_view(),              name='medical-news-notifications'),
    path('api/email-notifications/',                            EmailNotificationsView.as_view(),                    name='email_notifications'),

    ## URL HOME PAGE / STATISTICHE
    path("Home_Page/Statistiche",                               views.StatisticheView.as_view(),                     name="statistiche"),

    ## URL APPUNTAMENTI
    path('Home_Page/Appuntamenti',                              views.AppointmentViewHome.as_view(),                 name='appointment_home'),
    path('Home_Page/Calendario',                                views.AppuntamentiView.as_view(),                    name='appuntamenti'),
    path("salva-appuntamento/",                                 views.AppuntamentiSalvaView.as_view(),               name="salva_appuntamento"),
    path('get-appointments/',                                   AppuntamentiGetView.as_view(),                       name='get_appointments'),
    path('get-appointment/<int:appointment_id>/',               GetSingleAppointmentView.as_view(),                  name='get_appointment'),
    path('update-appointment/<int:appointment_id>/',            UpdateAppointmentView.as_view(),                     name='update_appointment'),
    path('delete-appointment/<int:appointment_id>/',            DeleteAppointmentView.as_view(),                     name='delete_appointment'),
    path("api/appointments/<int:appointment_id>/approve/",      views.ApproveAppointmentView.as_view(),              name="approve_appointment"),
    path("api/appointments/<int:appointment_id>/delete/",       views.DeleteAppointmentView.as_view(),               name="delete_appointment"),
    path('search-appointments/',                                SearchAppointmentsView.as_view(),                    name='search_appointments'),

    ## URL INSERISCI PAZIENTE
    path("AggiungiPaziente/",                                   views.InserisciPazienteView.as_view(),               name="inserisci_paziente"),
    path("aggiungi-paziente/",                                  views.CreaPazienteView.as_view(),                    name="aggiungi_paziente"),

    # -----------------------------------------#
    # URL SEZIONE CARTELLA PAZIENTE            #
    # -----------------------------------------#

    ## URL PER LA CARTELLA DEL PAZIENTE
    path("CartellaPaziente/<int:id>/",                          views.CartellaPazienteView.as_view(),                 name="cartella_paziente"),
    path("CartellaPaziente/requestSaveNote/<int:id>",           views.CartellaPazienteNote.as_view(),                 name="cartellaPaziente_note"),
    path("CartellaPaziente/requestSaveProblemi/<int:id>",       views.CartellaPazienteProblemi.as_view(),             name="cartellaPaziente_problemi"),

    ## URL SEZIONE DIARIO CLINICO
    path('aggiungi-farmaco/',                                   AggiungiFarmacoView.as_view(),                        name='aggiungi_farmaco'),
    path('rimuovi-farmaco/<int:prescrizione_id>/',              RimuoviFarmacoView.as_view(),                         name='rimuovi_farmaco'),
    path('get-farmaci-paziente/<int:paziente_id>/',             GetFarmaciPazienteView.as_view(),                     name='get_farmaci_paziente'),

    ## URL SEZIONI STORICO
    path("CartellaPaziente/<int:id>/Storico",                   views.StoricoView.as_view(),                          name="storico"),
    path("CartellaPaziente/<int:id>/Terapie",                   views.TerapiaView.as_view(),                          name="terapie"),
    path("CartellaPaziente/<int:id>/Esami",                     views.EsamiView.as_view(),                            name="esami"),
    path("CartellaPaziente/<int:id>/Diagnosi",                  views.DiagnosiView.as_view(),                         name="diagnosi"),
    path("CartellaPaziente/<int:id>/Allegati",                  views.AllegatiView.as_view(),                         name="allegati"),
    path("CartellaPaziente/<int:id>/Visite",                    views.VisiteView.as_view(),                           name="visite"),

    ## URL SEZIONE DIAGNOSI
    path('diagnosi/<int:diagnosi_id>/dettagli/',                                                    views.DiagnosiDettaglioView.as_view(),                name='diagnosi_dettaglio'),
    path("CartellaPaziente/<int:id>/Diagnosi/<int:diagnosi_id>/delete/",                            views.DeleteDiagnosiView.as_view(),                   name="delete_diagnosi"),

    ## URL SEZIONE TERAPIE
    path("elimina-terapia-studio/<int:id>/",                    EliminaTerapiaStudioView.as_view(),                   name="elimina_terapia_studio"),
    path("elimina-terapia-domiciliare/<int:id>/",               TerapiaDomiciliareDeleteView.as_view(),               name="elimina_terapia_domiciliare"),
    path("modifica-terapia-studio/<int:id>/",                   ModificaTerapiaStudioView.as_view(),                  name="modifica_terapia_studio"),
    path('terapie/domiciliare/<int:id>/modifica/',              ModificaTerapiaDomiciliareView.as_view(),             name='modifica_terapia_domiciliare'),
    path('terapie/domiciliare/<int:id>/dettagli/',              DettagliTerapiaDomiciliareView.as_view(),             name='dettagli_terapia_domiciliare'),

    ## URL SEZIONE ALLEGATI
    path("download/<str:tipo>/<int:allegato_id>/",                                                  DownloadAllegatoView.as_view(),                       name="download_allegato"),
    path("CartellaPaziente/<int:paziente_id>/Allegato/<str:tipo>/<int:allegato_id>/delete/",        DeleteAllegatoView.as_view(),                         name="delete_allegato"),

    ## URL SEZIONE VISITE
    path('elimina-visita/<int:id>/',                            EliminaVisitaView.as_view(),                          name='elimina_visita'),

    ## SEZIONE MUSCOLO
    path('Valutazione_Muscolo_Scheletrica/<int:persona_id>/',   views.ValutazioneMSView.as_view(),                    name='valutazione_m_s'), 

    ## URL PER SEZIONE DATI BASE 
    path("DatiBase/<int:id>/",                                  views.DatiBaseView.as_view(),                         name="dati_base"),
    path(
        'pazienti/<int:paziente_pk>/note/',
        NotaListCreateAPIView.as_view(),
        name='note-list-create'
    ),
    path(
        'pazienti/<int:paziente_pk>/note/<int:pk>/',
        NotaRetrieveUpdateDestroyAPIView.as_view(),
        name='note-detail'
    ),

    ## -- URL SEZIONE ETA' METABOLICA --
    path("Patients/<int:id>/Composizione",                      views.ComposizioneView.as_view(),                     name="composizione"),
    path("Patients/<int:id>/Composizione/Chart",                views.ComposizioneChartView.as_view(),                name="grafici_composizione"),
    path("Patients/<int:id>/Composizione/Referti",              views.RefertiComposizioneView.as_view(),              name="referti_composizione"),
    
    # URL PER IL TEST DELLA CAPACITA' VITALE
    path('EtaVitale/<int:id>/',                                 views.EtaVitaleView.as_view(),                        name='etaVitale'),
    path('TestVitale/<int:id>/',                                views.TestEtaVitaleView.as_view(),                    name='TestetaVitale'),
    path('RefertoTest/<int:persona_id>/<int:referto_id>/',      views.RefertoQuizView.as_view(),                      name='referto_test'),
    path('UpdateTestVitale/<int:id>/',                          views.QuizEtaVitaleUpdateView.as_view(),              name='updateTestEtaVitale'), 
    
    # URL PER ETA BIOLOGICA 
    path("Eta_Biologica/<int:id>/",                                    views.EtaBiologicaView.as_view(),                     name='eta_biologica'),
    path("Eta_Biologica/ElencoReferti/<int:id>/",                      views.ElencoRefertiView.as_view(),                    name="elenco_referti"),
    path("Eta_Biologica/GraficiAndamento/<int:persona_id>/",           views.GrafiAndamentoBiologica.as_view(),              name="grafici_eta_biologica"),
    path("Eta_Biologica/Calcolatore/<int:id>/",                        views.CalcolatoreRender.as_view(),                    name='Calcolatore'),
    path("Eta_Biologica/ElencoReferti/Referto/<int:persona_id>/",      views.PersonaDetailView.as_view(),                    name="persona_detail"),
    
    ## URL SEZIONE RESILIENZA 
    path('Resilienza/<int:persona_id>/',                               views.ResilienzaView.as_view(),                name='resilienza'),
    
    ## URL PIANO TERAPEUTICO
    path('Cartella_Paziente/Piano_Terapeutico/<int:persona_id>/',                                   views.PianoTerapeutico.as_view(),                       name='piano_terapeutico'),
    path("Cartella_Paziente/Piano_Terapeutico/Prescrizioni/<int:persona_id>/",                      views.PrescrizioniView.as_view(),                       name='prescrizioni'),
    
    ## SEZIONE MICROBIOTA
    path('CartellaPaziente/Microbiota/<int:id>/',                      views.MicrobiotaView.as_view(),                name='microbiota_detail'),
    path('CartellaPaziente/Microbiota/add/<int:persona_id>/',          views.MicrobiotaAddView.as_view(),             name='microbiota_add'),

    # TO DEFINE
    path('DownloadPdfVitale/<int:persona_id>/<int:referto_id>',        views.StampaRefertoView.as_view(),            name='download_pdf_vitale'),
    path('update-persona/<int:id>/',                                   views.UpdatePersonaContactView.as_view(),     name='update_persona_contact'), 


]
