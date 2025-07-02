import time
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build
from social_django.utils import load_strategy
from social_django.models import UserSocialAuth
import logging
from django.contrib.auth.models import AnonymousUser
try:
    import PyPDF2
except ImportError:
    raise ImportError("Il modulo 'PyPDF2' non è installato. Puoi installarlo eseguendo 'pip install PyPDF2'.")
import re


# Set up logging
logger = logging.getLogger(__name__)

def get_gmail_emails_for_user(user):
    try:
        # Verifica che l'utente sia valido
        if not user or isinstance(user, AnonymousUser):
            logger.warning("Tentativo di recuperare email da utente non autenticato o anonimo.")
            return []

        # Recupera social auth
        user_social = UserSocialAuth.objects.get(user=user, provider="google-oauth2")
        extra_data = user_social.extra_data

        # Costruisci le credenziali
        credentials = Credentials(
            token=extra_data.get("access_token"),
            refresh_token=extra_data.get("refresh_token"),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=extra_data.get("client_id"),
            client_secret=extra_data.get("client_secret"),
            scopes=["https://www.googleapis.com/auth/gmail.readonly"],
        )

        # Refresh se necessario
        if extra_data.get('auth_time', 0) + 3600 < int(time.time()):
            strategy = load_strategy()
            user_social.refresh_token(strategy)
            credentials.token = user_social.extra_data['access_token']

        if not credentials.valid:
            credentials.refresh(GoogleRequest())
            user_social.extra_data["access_token"] = credentials.token
            user_social.save()

        # Costruisci il servizio Gmail
        service = build("gmail", "v1", credentials=credentials, static_discovery=False)
        results = service.users().messages().list(userId="me", maxResults=5, q="is:unread").execute()
        messages = results.get("messages", [])

        emails = []
        for msg in messages:
            msg_data = service.users().messages().get(userId="me", id=msg["id"], format="metadata").execute()
            headers = msg_data.get("payload", {}).get("headers", [])
            message_id = msg["id"]
            emails.append({
                "subject": next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject"),
                "from": next((h["value"] for h in headers if h["name"] == "From"), "No Sender"),
                "date": next((h["value"] for h in headers if h["name"] == "Date"), "No Date"),
                "link": f"https://mail.google.com/mail/u/0/#all/{message_id}",  # 👈 URL diretto
            })

        return emails

    except UserSocialAuth.DoesNotExist:
        logger.warning(f"⚠️ Nessun account Gmail collegato per l'utente: {user}")
    except Exception as e:
        logger.exception("Errore durante il recupero delle email:", exc_info=True)

    return []



#SEZIONE MICROBIOTA FUNZIONE PER ESTRARRE VALORI DAL REFERTO 
import re
import unicodedata
from PyPDF2 import PdfReader

def slugify(text: str) -> str:
    """
    Normalizza una stringa: rimuove accenti, caratteri non alfanumerici,
    converte spazi e trattini in underscore e mette tutto in minuscolo.
    """
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[-\s]+", "_", text).strip('_').lower()


def extract_microbiota_values(pdf_path: str) -> dict:
    """
    Estrae valori dal PDF fino al marker "SEZIONE PER IL PROFESSIONISTA".
    Restituisce un dizionario con chiavi slugificate e valori raw o interpretati.

    - Foto1: prende valore numerico per i primi 4 indici.
    - Foto2: patobionti (Batteri, Miceti, Virus, Parassiti).
    - Foto3: indicatori (-4…4) mappati in carente/aumento.
    - Foto4: percentuali Phyla: prende solo il numero percentuale.
    - Foto5: dettaglio Miceti: per ciascuna specie prende l'abbondanza relativa.
    """
    reader = PdfReader(pdf_path)
    pages_text = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        if "SEZIONE PER IL PROFESSIONISTA" in page_text.upper():
            break
        pages_text.append(page_text)
    text = "\n".join(pages_text)

    data = {}

    # 1) Foto1 & Foto2 & Foto3 & Foto4: static labels
    labels = [
        # Biodiversità (Foto1)
        "Indice di biodiversità", "Numero di specie (Obs. species)",
        "Distanza filogenetica (P.D. whole tree)", "Distribuzione delle specie (Indice di Pielou)",
        # Patobionti (Foto2)
        "Batteri", "Miceti", "Virus", "Parassiti",
        # Metaboliti (Foto3 convertiti indicatori)
        "Acetato", "Butirrato", "Propionato", "Succinato", "Lattato",
        "GABA", "Istamina", "Indolo", "Acido indolacetico (IAA)", "Acido indolpropionico (IPA)",
        "Triptammina", "Serotonina", "Trimetilammina (TMA)", "Polifenoli",
        "Vitamine gruppo B", "Vitamina K2", "Degradazione glutine", "Mucolisi", "Proteolisi",
        "Lipopolisaccaride (LPS)", "Acidi biliari secondari", "Etanolo", "Acido solfidrico (H2S)",
        "Metano (CH4)",
        # Funzioni (Foto3 indicatori)
        "Omeostasi immunitaria", "Omeostasi della mucosa", "Omeostasi del glucosio",
        "Metabolismo lipidico", "Attività antinfiammatoria", "Attività antimicrobica",
        "Asse intestino-cervello", "Asse intestino-cardiocircolatorio", "Asse intestino-fegato",
        "Asse intestino-pelle", "Ritmo circadiano",
        # Phyla (Foto4 percentuali)
        "Firmicutes", "Bacteroidetes", "Actinobacteria", "Verrucomicrobia",
        "Euryarchaeota", "Fusobacteria", "Lentisphaerae"
    ]

    for label in labels:
        slug = slugify(label)
        # percentuali (Foto4)
        pct = re.search(rf"{re.escape(label)}[\s:\-–]+(\d+(?:\.\d+)?%)", text, re.IGNORECASE)
        if pct:
            data[slug] = pct.group(1)
            continue
        # indicatori o numerici (Foto1 e Foto3): numeri con o senza decimale
        num = re.search(rf"{re.escape(label)}[\s:\-–]+(-?\d+(?:\.\d+)?)", text, re.IGNORECASE)
        if num:
            val_str = num.group(1)
            try:
                val = float(val_str)
                # indicatori -4..4 (Foto3)
                if -4 <= val <= 4 and label not in ["Indice di biodiversità", "Numero di specie (Obs. species)", "Distanza filogenetica (P.D. whole tree)", "Distribuzione delle specie (Indice di Pielou)"]:
                    data[slug] = "carente" if val <= 0 else "aumento"
                else:
                    data[slug] = val_str  # Foto1 valori raw
            except ValueError:
                data[slug] = val_str
            continue
        # testo libero (Foto2)
        txt = re.search(rf"{re.escape(label)}[\s:\-–]+([A-Za-z].*?)($|\n)", text, re.IGNORECASE)
        if txt:
            data[slug] = txt.group(1).strip()

    # 2) Foto5: dettaglio Miceti - abbondanza relativa
    miceti_idx = text.upper().find("MICETI")
    if miceti_idx != -1:
        sec = text[miceti_idx:]
        # riga tipo: NomeSpecie <spazio> valore (es 62.63) <spazio> Patogenicita
        spec_re = re.compile(r"^([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)\s+(\d+(?:\.\d+)?)(?=\s+Non patogena|\s+Patogena)", re.MULTILINE)
        for m in spec_re.finditer(sec):
            name = m.group(1).strip()
            abund = m.group(2)
            data[slugify(name)] = abund

    print(data)
    return data
