"""
Database tables 
"""

from datetime import datetime
from django.utils import timezone # type: ignore
from django.db import models # type: ignore
from django.contrib.auth.models import User # type: ignore
from django.contrib.auth.hashers import make_password # type: ignore
from django.conf import settings


# TABELLA DOTTORI REGISTRATI
class UtentiRegistratiCredenziali(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    nome = models.CharField(max_length=100)
    cognome = models.CharField(max_length=100)
    email = models.CharField(max_length=100, null=True)
    password = models.CharField(max_length=128, null=True)
    ROLE_CHOICES = [
        ("doctor", "Medico"),
        ("secretary", "Segreteria"),
        ("admin", "Admin"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="doctor")
    cookie = models.CharField(max_length=2, null=True)

    #FUNZIONE DI HASHING DELLA PASSWORD
    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith('pbkdf2_sha256$'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.nome} {self.cognome}'

# TABELLA PAZIENTI
class TabellaPazienti(models.Model):

    dottore = models.ForeignKey(
        UtentiRegistratiCredenziali, 
        on_delete=models.CASCADE, 
        related_name='pazienti',
        null=True
    )

    codice_fiscale = models.CharField(max_length=16, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['dottore', 'codice_fiscale'], name='unique_paziente_per_dottore')
    ]
        
    # DATI PERSONALI
    name = models.CharField(max_length=50, null=True, blank=True)
    surname = models.CharField(max_length=50, null=True, blank=True)
    email = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, null=True, blank=True, choices=[('M', 'Male'), ('F', 'Female')])
    cap = models.CharField(max_length=20, null=True, blank=True)
    residence = models.CharField(max_length=100, null=True, blank=True)
    province = models.CharField(max_length=100, null=True, blank=True)
    place_of_birth = models.CharField(max_length=100, null=True, blank=True)
    chronological_age = models.IntegerField(null=True, blank=True)
    heart_rate = models.CharField(max_length=100, null=True, blank=True)
    associate_staff = models.CharField(max_length=100, null=True, blank=True)
    lastVisit = models.DateField(null=True, blank=True)
    upcomingVisit = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    note_patologie = models.TextField(null=True, blank=True)

    # --- DATI BASE ---
    ## DOMINIO OCCUPAZIONE
    professione = models.CharField(max_length=100, null=True, blank=True)
    pensionato = models.CharField(max_length=100, null=True, blank=True)

    ## DOMINIO DONNA
    menarca = models.CharField(max_length=100, null=True, blank=True)
    ciclo = models.CharField(max_length=100, null=True, blank=True)
    sintomi = models.CharField(max_length=100, null=True, blank=True)
    esordio = models.CharField(max_length=100, null=True, blank=True)
    parto = models.CharField(max_length=100, null=True, blank=True)
    post_parto = models.CharField(max_length=100, null=True, blank=True)
    aborto = models.CharField(max_length=100, null=True, blank=True)
    
    ## DOMINIO STILE DI VITA
    ### Alcol
    alcol = models.CharField(max_length=255, null=True, blank=True)
    alcol_type = models.CharField(max_length=255, null=True, blank=True)
    data_alcol = models.DateField(null=True, blank=True)
    alcol_frequency = models.CharField(max_length=255, null=True, blank=True)

    ### Fumo
    smoke = models.CharField(max_length=255, null=True, blank=True)
    smoke_frequency = models.CharField(max_length=100, blank=True, null=True)
    reduced_intake = models.CharField(max_length=100, blank=True, null=True)

    ### Sport
    sport = models.CharField(default=False, max_length=100, null=True, blank=True)
    sport_livello = models.CharField(max_length=100, blank=True, null=True)
    sport_frequency = models.CharField(max_length=100, blank=True, null=True)

    ### Sedentarietà
    attivita_sedentaria = models.CharField(default=False, max_length=100, null=True, blank=True)
    livello_sedentarieta = models.CharField(max_length=100, blank=True, null=True)
    sedentarieta_nota = models.TextField(blank=True, null=True)

    ## DOMINIO ANAMNESI FAMILIARE
    m_cardiache = models.CharField(max_length=100, null=True, blank=True)
    diabete_m = models.CharField(max_length=100, null=True, blank=True)
    obesita = models.CharField(max_length=100, null=True, blank=True)
    epilessia = models.CharField(max_length=100, null=True, blank=True)
    ipertensione = models.CharField(max_length=100, null=True, blank=True)
    m_tiroidee = models.CharField(max_length=100, null=True, blank=True)
    m_polmonari = models.CharField(max_length=100, null=True, blank=True)
    tumori = models.CharField(max_length=100, null=True, blank=True)
    allergie = models.CharField(max_length=100, null=True, blank=True)
    m_psichiatriche = models.CharField(max_length=100, null=True, blank=True)

    patologie = models.CharField(max_length=100, null=True, blank=True)
    p_p_altro = models.CharField(max_length=100, null=True, blank=True)
    t_farmaco = models.CharField(max_length=100, null=True, blank=True)
    t_dosaggio = models.CharField(max_length=100, null=True, blank=True)
    t_durata = models.CharField(max_length=100, null=True, blank=True)

    ## DOMINIO ANAMNESI PATOLOGICA REMOTA
    p_cardiovascolari = models.CharField(max_length=100, null=True, blank=True)
    m_metabolica = models.CharField(max_length=100, null=True, blank=True)
    p_respiratori_cronici = models.CharField(max_length=100, null=True, blank=True)
    m_neurologica = models.CharField(max_length=100, null=True, blank=True)
    m_endocrina = models.CharField(max_length=100, null=True, blank=True)
    m_autoimmune = models.CharField(max_length=100, null=True, blank=True)
    p_epatici = models.CharField(max_length=100, null=True, blank=True)
    m_renale = models.CharField(max_length=100, null=True, blank=True)
    d_gastrointestinali = models.CharField(max_length=100, null=True, blank=True)
    
    ## DOMINIO ESAME OBBIETTIVO
    eloquio = models.CharField(max_length=100, null=True, blank=True)
    s_nutrizionale = models.CharField(max_length=100, null=True, blank=True)
    a_genarale = models.CharField(max_length=100, null=True, blank=True)
    psiche = models.CharField(max_length=100, null=True, blank=True)
    r_ambiente = models.CharField(max_length=100, null=True, blank=True)
    s_emotivo = models.CharField(max_length=100, null=True, blank=True)
    costituzione = models.CharField(max_length=100, null=True, blank=True)
    statura = models.CharField(max_length=100, null=True, blank=True)

    ## DOMINIO INFORMAZIONE DEL SANGUE
    blood_group = models.CharField(max_length=20, null=True, blank=True)
    rh_factor = models.CharField(max_length=20, null=True, blank=True)
    pressure_min = models.CharField(max_length=100, null=True, blank=True)
    pressure_max = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Paziente: {self.name} {self.surname}"





# TABELLA NOTA
class Nota(models.Model):
    paziente   = models.ForeignKey(
        TabellaPazienti,
        on_delete=models.CASCADE,
        related_name='note'
    )
    titolo     = models.CharField(max_length=255)
    contenuto  = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.paziente}] {self.titolo}"

# ETA BIOLOGICA
class RefertiEtaBiologica(models.Model):
    paziente = models.ForeignKey(
        TabellaPazienti,
        on_delete=models.CASCADE, 
        related_name='referti'
    )
    data_referto = models.DateField(auto_now_add=True)
    data_ora_creazione = models.DateTimeField(auto_now_add=True, null=True)
    descrizione = models.TextField(null=True, blank=True)
    documento = models.FileField(upload_to='referti/', null=True, blank=True)

    def __str__(self):
        return f"Referto ID: {self.id} - Paziente: {self.paziente.name} {self.paziente.surname}"




class DatiEstesiRefertiEtaBiologica(models.Model):
    """
    Dati estesi referto eta biologica table
    """
    referto = models.OneToOneField(
        RefertiEtaBiologica, 
        on_delete=models.CASCADE, 
        related_name='dati_estesi'
    )
    def get_fields_by_help_text(self, text):
        """
        Ritorna la lista dei Field che hanno help_text == text.
        Usalo sull'istanza o sulla classe (il self._meta è lo stesso).
        """
        return [
            field
            for field in self._meta.fields
            if getattr(field, 'help_text', '') == text
        ]

    """ 
    Salute del Cuore 
    """

    tot_chol = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")
    ldl_chol = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")
    hdl_chol_m = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    hdl_chol_w = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    trigl = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")
    pai_1 = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")
    d_dimero = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")
    ves = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")

    # Oxidative Stress
    d_roms = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")
    osi = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")
    pat = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")
    
    # Omega Screening
    my_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    p_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    st_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    ar_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    beenic_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")

    # Acidi grassi insaturi
    ## Omega 7
    pal_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore") 

    ## Omega 9
    ol_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    ner_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore") 

    ## Omega 3
    a_linoleic_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore") 
    eico_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    doco_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  

    ## Omega 6
    lin_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    gamma_lin_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    dih_gamma_lin_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    arachidonic_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore") 

    sa_un_fatty_acid = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")
    o3o6_fatty_acid_quotient = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    aa_epa = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  
    o3_index = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")


    """
    Salute Renale
    """

    creatinine_m = models.FloatField(null=True, blank=True, help_text="Salute Renale")  
    creatinine_w = models.FloatField(null=True, blank=True, help_text="Salute Renale") 
    azotemia = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    cistatine_c = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    ci = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    ca = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    p = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    uricemy_m = models.FloatField(null=True, blank=True, help_text="Salute Renale")  
    uricemy_w = models.FloatField(null=True, blank=True, help_text="Salute Renale")  
    s_weight = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    ph = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    glucose = models.FloatField(null=True, blank=True, help_text="Salute Renale")  
    proteins_ex = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    blood_ex = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    ketones = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    uro = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    bilirubin_ex = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    leuc = models.FloatField(null=True, blank=True, help_text="Salute Renale")
    uric_acid = models.FloatField(null=True, blank=True, help_text="Salute Renale")

    """
    Salute Epatica
    """

    got_m = models.FloatField(null=True, blank=True, help_text="Salute Epatica")  
    got_w = models.FloatField(null=True, blank=True, help_text="Salute Epatica")  
    gpt_m = models.FloatField(null=True, blank=True, help_text="Salute Epatica")  
    gpt_w = models.FloatField(null=True, blank=True, help_text="Salute Epatica")  
    g_gt_m = models.FloatField(null=True, blank=True, help_text="Salute Epatica")
    g_gt_w = models.FloatField(null=True, blank=True, help_text="Salute Epatica") 
    a_photo_m = models.FloatField(null=True, blank=True, help_text="Salute Epatica")  
    a_photo_w = models.FloatField(null=True, blank=True, help_text="Salute Epatica")
    tot_bili = models.FloatField(null=True, blank=True, help_text="Salute Epatica")  
    direct_bili = models.FloatField(null=True, blank=True, help_text="Salute Epatica")  
    indirect_bili = models.FloatField(null=True, blank=True, help_text="Salute Epatica")
    albumin_ele = models.FloatField(null=True, blank=True, help_text="Salute Epatica")
    albumin_dI = models.FloatField(null=True, blank=True, help_text="Salute Epatica")
    tot_prot = models.FloatField(null=True, blank=True, help_text="Salute Epatica")
    tot_prot_ele = models.FloatField(null=True, blank=True, help_text="Salute Epatica")
    albuminemia = models.FloatField(null=True, blank=True, help_text="Salute Epatica")


    """
    Salute Cerebrale
    """

    mg = models.FloatField(null=True, blank=True, help_text="Salute Cerebrale")
    na = models.FloatField(null=True, blank=True, help_text="Salute Cerebrale")
    k = models.FloatField(null=True, blank=True, help_text="Salute Cerebrale")
    v_b12 = models.FloatField(null=True, blank=True, help_text="Salute Cerebrale")  

    
    """
    Salute Ormonale
    """

    glicemy = models.FloatField(null=True, blank=True, help_text="Salute Ormonale") 
    tsh = models.FloatField(null=True, blank=True, help_text="Salute Ormonale")  
    ft3 = models.FloatField(null=True, blank=True, help_text="Salute Ormonale")  
    ft4 = models.FloatField(null=True, blank=True, help_text="Salute Ormonale")  
    insulin = models.FloatField(null=True, blank=True, help_text="Salute Ormonale")
    homa = models.FloatField(null=True, blank=True, help_text="Salute Ormonale")
    ir = models.FloatField(null=True, blank=True, help_text="Salute Ormonale")
    dhea_m = models.FloatField(null=True, blank=True, help_text="Salute Ormonale") 
    dhea_w = models.FloatField(null=True, blank=True, help_text="Salute Ormonale")  
    testo_m = models.FloatField(null=True, blank=True, help_text="Salute Ormonale") 
    testo_w = models.FloatField(null=True, blank=True, help_text="Salute Ormonale") 
    beta_es_m = models.FloatField(null=True, blank=True, help_text="Salute Ormonale") 
    beta_es_w = models.FloatField(null=True, blank=True, help_text="Salute Ormonale")  
    prog_m = models.FloatField(null=True, blank=True, help_text="Salute Ormonale")  
    prog_w = models.FloatField(null=True, blank=True, help_text="Salute Ormonale") 
    shbg_m = models.FloatField(null=True, blank=True, help_text="Salute Ormonale")  
    shbg_w = models.FloatField(null=True, blank=True, help_text="Salute Ormonale") 


    """ 
    Salute del Sangue 
    """ 

    baso = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    eosi = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    lymph = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    mono = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    neut = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    neut_ul = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    lymph_ul = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    mono_ul = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    eosi_ul = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    baso_ul = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    hct_m = models.FloatField(null=True, blank=True, help_text="Salute del sangue")  
    hct_w = models.FloatField(null=True, blank=True, help_text="Salute del sangue") 
    hgb_m = models.FloatField(null=True, blank=True, help_text="Salute del sangue")  
    hgb_w = models.FloatField(null=True, blank=True, help_text="Salute del sangue") 
    mch = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    mchc = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    mcv = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    rbc_m = models.FloatField(null=True, blank=True, help_text="Salute del sangue")  
    rbc_w = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    rdwsd = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    rdwcv = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    plt = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    mpv = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    plcr = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    pct = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    pdw = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    fe = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    transferrin = models.FloatField(null=True, blank=True, help_text="Salute del sangue")
    ferritin_m = models.FloatField(null=True, blank=True, help_text="Salute del sangue")  
    ferritin_w = models.FloatField(null=True, blank=True, help_text="Salute del sangue")  
    wbc = models.FloatField(null=True, blank=True, help_text="Salute del sangue")   
    sideremia = models.FloatField(null=True, blank=True, help_text="Salute del sangue")


    """ 
    Salute del sistema immunitario 
    """

    pcr_c = models.FloatField(null=True, blank=True, help_text="Salute del sistema immunitario")
    ves2 = models.FloatField(null=True, blank=True, help_text="Salute del sistema immunitario") 
    tnf_a = models.FloatField(null=True, blank=True, help_text="Salute del sistema immunitario")  
    inter_6 = models.FloatField(null=True, blank=True, help_text="Salute del sistema immunitario")  
    inter_10 = models.FloatField(null=True, blank=True, help_text="Salute del sistema immunitario") 


    """ 
    Salute muscolo-scheletrica 
    """
    # calcio
    # fosforo
    # magnesio
    # Vitamida D


    # Biological Age
    biological_age = models.IntegerField(null=True, blank=True)

    # Score value
    salute_cuore = models.FloatField(null=True, blank=True)  
    salute_renale = models.FloatField(null=True, blank=True) 
    salute_epatica = models.FloatField(null=True, blank=True) 
    salute_cerebrale = models.FloatField(null=True, blank=True) 
    salute_ormonale = models.FloatField(null=True, blank=True) 
    salute_sangue = models.FloatField(null=True, blank=True) 
    salute_s_i = models.FloatField(null=True, blank=True) 
    salute_m_s = models.FloatField(null=True, blank=True) 

    def __str__(self):
        return f"Dati Estesi Referto ID: {self.referto.id}"
   

    def get_fields_by_help_text(self, help_text):
        """
        Restituisce un dict {nome_campo: valore} per tutti i field che
        hanno help_text esattamente uguale a quello passato.
        """
        out = {}
        for f in self._meta.get_fields():
            if hasattr(f, 'help_text') and f.help_text == help_text:
                out[f.name] = getattr(self, f.name)
        return out


# ETA METABOLICA
class RefertiEtaMetabolica(models.Model):
    dottore = models.ForeignKey(
        UtentiRegistratiCredenziali,
        on_delete=models.CASCADE,
        related_name='referti_eta_metabolica', 
        null=True
    )

    paziente = models.ForeignKey(
        TabellaPazienti,
        on_delete=models.CASCADE,
        related_name='referti_eta_metabolica'
    )

    punteggio_finale = models.CharField(max_length=100, null=True, blank=True) 
    data_referto = models.DateTimeField(default=timezone.now)

    # --- DOMINI CLINICI ---
    # COMPOSIZIONE CORPOREA
    bmi = models.CharField(max_length=100, null=True, blank=True) 
    grasso = models.CharField(max_length=100, null=True, blank=True)
    acqua = models.CharField(max_length=100, null=True, blank=True)
    massa_muscolare = models.CharField(max_length=100, null=True, blank=True)
    bmr = models.CharField(max_length=100, null=True, blank=True)
    whr = models.CharField(max_length=100, null=True, blank=True)
    whtr = models.CharField(max_length=100, null=True, blank=True)

    # GLICEMICO
    glicemia = models.CharField(max_length=100, null=True, blank=True)
    ogtt1 = models.CharField(max_length=100, null=True, blank=True)
    ogtt2 = models.CharField(max_length=100, null=True, blank=True)
    emoglobina_g = models.CharField(max_length=100, null=True, blank=True)
    insulina_d = models.CharField(max_length=100, null=True, blank=True)
    curva_i = models.CharField(max_length=100, null=True, blank=True)
    homa_ir = models.CharField(max_length=100, null=True, blank=True)
    tyg = models.CharField(max_length=100, null=True, blank=True)

    # LIPIDICO
    c_tot = models.CharField(max_length=100, null=True, blank=True)
    hdl = models.CharField(max_length=100, null=True, blank=True)
    ldl = models.CharField(max_length=100, null=True, blank=True)
    trigliceridi = models.CharField(max_length=100, null=True, blank=True)

    # METABOLICO EPATICO
    ast = models.CharField(max_length=100, null=True, blank=True)
    alt = models.CharField(max_length=100, null=True, blank=True)
    ggt = models.CharField(max_length=100, null=True, blank=True)
    bili_d = models.CharField(max_length=100, null=True, blank=True)
    bili_in = models.CharField(max_length=100, null=True, blank=True)

    # INFIAMMAZIONE
    pcr = models.CharField(max_length=100, null=True, blank=True)
    hgs = models.CharField(max_length=100, null=True, blank=True)
    sii = models.CharField(max_length=100, null=True, blank=True)

    # STRESS
    c_plasmatico = models.CharField(max_length=100, null=True, blank=True)

    # ALTRI DATI
    massa_ossea = models.CharField(max_length=100, null=True, blank=True)
    eta_metabolica = models.CharField(max_length=100, null=True, blank=True)
    grasso_viscerale = models.CharField(max_length=100, null=True, blank=True)
    p_fisico = models.CharField(max_length=100, null=True, blank=True)
    storico_punteggi = models.JSONField(default=list, blank=True)

    # DATI ANTROPOMETRICI
    height = models.CharField(max_length=255, null=True, blank=True)
    weight = models.CharField(max_length=255, null=True, blank=True)
    bmi_detection_date = models.DateField(null=True, blank=True)

    # CIRCONFERENZA ADDOMINALE
    girth_value = models.CharField(max_length=255, null=True, blank=True)
    girth_notes = models.TextField(blank=True, null=True)
    girth_date = models.DateField(null=True, blank=True)

    def aggiungi_punteggio(self, nuovo_punteggio):
        self.storico_punteggi.append({
            "punteggio": nuovo_punteggio,
            "data": timezone.now().isoformat()
        })
        self.punteggio_fisico = nuovo_punteggio
        self.save(update_fields=["punteggio_fisico", "storico_punteggi"])

    def __str__(self):
        return f"Referto {self.id} - {self.paziente.name} {self.paziente.surname} - {self.data_referto.date()}"


PROTOCOL_CHOICES = (
    ('30m', '30 m'),
    ('60m', '60 m'),
    ('24h', '24 h'),
)

class Resilienza(models.Model):
    paziente = models.ForeignKey(
        TabellaPazienti,
        on_delete=models.CASCADE,
        related_name='resilienza'
    )

    # meta
    protocollo = models.CharField(max_length=10, choices=PROTOCOL_CHOICES, null=True)
    selected_tests = models.JSONField(default=list, blank=True)  # es: ["hrv","bp","holter"]
    data_misurazione = models.DateTimeField(default=timezone.now)

    # HRV
    hrv_rmssd = models.FloatField(null=True, blank=True)
    hrv_sdnn = models.FloatField(null=True, blank=True)
    hrv_pnn50 = models.FloatField(null=True, blank=True)
    hrv_lf_power = models.FloatField(null=True, blank=True)
    hrv_hf_power = models.FloatField(null=True, blank=True)
    hrv_lf_hf = models.FloatField(null=True, blank=True)

    # Pressione arteriosa
    bp_sbp_mean = models.FloatField(null=True, blank=True)
    bp_dbp_mean = models.FloatField(null=True, blank=True)
    bp_pp_calc = models.FloatField(null=True, blank=True)
    bp_sd_sbp = models.FloatField(null=True, blank=True)
    bp_sd_dbp = models.FloatField(null=True, blank=True)
    bp_morning_surge = models.FloatField(null=True, blank=True)
    bp_nocturnal_dip = models.FloatField(null=True, blank=True)

    # Holter / Stabilità cardiaca
    holter_hr_mean = models.FloatField(null=True, blank=True)
    holter_hr_min = models.FloatField(null=True, blank=True)
    holter_hr_max = models.FloatField(null=True, blank=True)
    holter_pac_hour = models.FloatField(null=True, blank=True)
    holter_pvc_hour = models.FloatField(null=True, blank=True)
    holter_af_burden = models.FloatField(null=True, blank=True)
    holter_st_events = models.FloatField(null=True, blank=True)

    # eventuale composito
    risultato = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Resilienza - {self.paziente.name} {self.paziente.surname} ({self.data_misurazione:%Y-%m-%d %H:%M})"


# CAPACITA VITALE TABLE
class RefertiCapacitaVitale(models.Model):
    paziente = models.ForeignKey(
        TabellaPazienti, 
        on_delete=models.CASCADE, 
        related_name='referti_test'
    )
    data_referto = models.DateField(auto_now_add=True)
    data_ora_creazione = models.DateTimeField(auto_now_add=True, null=True)
    punteggio = models.TextField(null=True, blank=True)
    documento = models.FileField(upload_to='referti/', null=True, blank=True)

    def __str__(self):
        return f"Referto ID: {self.id} - Paziente: {self.paziente.name} {self.paziente.surname}"

class DatiEstesiRefertiCapacitaVitale(models.Model):
    referto = models.OneToOneField(
        RefertiCapacitaVitale, 
        on_delete=models.CASCADE, 
        related_name='dati_estesi_test'
    )

    #DOMINIO COGNITIVO
    MMSE = models.IntegerField(null=True, blank=True)

    #DOMINIO PSICOLOGICO
    GDS = models.IntegerField(null=True, blank=True)
    LOC = models.IntegerField(null=True, blank=True)

    #DOMINIO SENSORIALE
    Vista = models.IntegerField(null=True, blank=True)
    Udito = models.IntegerField(null=True, blank=True)

    #DOMINIO DELLA VITALITA'
    HGS = models.TextField(null=True, blank=True)
    PFT = models.IntegerField(null=True, blank=True)

    #SISTEMA IMMUNITARIO
    ISQ = models.IntegerField(null=True, blank=True)
    BMI = models.FloatField(null=True, blank=True)
    CDP = models.FloatField(null=True, blank=True)
    WHR = models.FloatField(null=True, blank=True)
    WHR_Ratio = models.TextField(null=True, blank=True)

    #DOMINIO DELLA LOCOMOZIONE
    CST = models.FloatField(null=True, blank=True)
    GS = models.FloatField(null=True, blank=True)
    PPT = models.IntegerField(null=True, blank=True)
    SARC_F = models.IntegerField(null=True, blank=True)
    FSS = models.IntegerField(null=True, blank=True)

    #BIOMARCATORI CIRCOLANTI DEL METABOLISMO
    Glic = models.FloatField(null=True, blank=True)
    Emog = models.FloatField(null=True, blank=True)
    Insu = models.FloatField(null=True, blank=True)
    Pept_c = models.FloatField(null=True, blank=True)
    Col_tot = models.FloatField(null=True, blank=True)
    Col_ldl = models.FloatField(null=True, blank=True)
    Col_hdl = models.FloatField(null=True, blank=True)
    Trigl = models.FloatField(null=True, blank=True)
    albumina = models.FloatField(null=True, blank=True)
    clearance_urea = models.FloatField(null=True, blank=True)
    igf_1 = models.FloatField(null=True, blank=True)    

    #BIOMARCATORI CIRCOLANTI DELL'INFIAMMAZIONE
    Inter_6 = models.FloatField(null=True, blank=True)
    Tnf = models.FloatField(null=True, blank=True)
    Mono = models.FloatField(null=True, blank=True)
    Mono_el = models.FloatField(null=True, blank=True)
    Proteins_c = models.FloatField(null=True, blank=True)
    wbc = models.FloatField(null=True, blank=True)
    Lymph = models.FloatField(null=True, blank=True)
    Lymph_el = models.FloatField(null=True, blank=True)
      
    def __str__(self):
        return f"Dati Estesi Referto ID: {self.referto.id}"
    
# VALUTAZIONE MUSCOLO SCHELETRICO
class ValutazioneMS(models.Model):
    paziente = models.ForeignKey(
        TabellaPazienti,
        on_delete=models.CASCADE,
        related_name='valutazioneMS'
    )   

     # Attività fisica
    frequenza_a_f = models.CharField(max_length=50, blank=True, null=True)
    tipo_a_f = models.CharField(max_length=100, blank=True, null=True)
    stile_vita = models.CharField(max_length=100, blank=True, null=True)

    # Anamnesi muscolo-scheletrica
    terapie_inf = models.CharField(max_length=255, blank=True, null=True)
    diagnosi_t = models.CharField(max_length=255, blank=True, null=True)
    sintomi_t = models.TextField(blank=True, null=True)

    # Esame Generale
    palpazione = models.CharField(max_length=255, blank=True, null=True)
    osservazione = models.CharField(max_length=255, blank=True, null=True)
    m_attiva = models.CharField(max_length=255, blank=True, null=True)
    m_passiva = models.CharField(max_length=255, blank=True, null=True)
    dolorabilità = models.CharField(max_length=255, blank=True, null=True)
    scala_v_a = models.CharField(max_length=50, blank=True, null=True)

    # Esame muscolo-scheletrico
    mo_attivo = models.CharField(max_length=255, blank=True, null=True)
    mo_a_limitazioni = models.CharField(max_length=255, blank=True, null=True)
    mo_passivo = models.CharField(max_length=255, blank=True, null=True)
    mo_p_limitazioni = models.CharField(max_length=255, blank=True, null=True)
    comparazioni_m = models.TextField(blank=True, null=True)
    circ_polp = models.CharField(max_length=50, blank=True, null=True)
    tono_m = models.CharField(max_length=50, blank=True, null=True)
    scala_ashworth = models.CharField(max_length=100, blank=True, null=True)

    # Esame posturale
    v_frontale = models.CharField(max_length=255, blank=True, null=True)
    v_laterale = models.CharField(max_length=255, blank=True, null=True)
    p_testa = models.CharField(max_length=100, blank=True, null=True)
    spalle = models.CharField(max_length=100, blank=True, null=True)
    ombelico = models.CharField(max_length=100, blank=True, null=True)
    a_inferiori = models.CharField(max_length=100, blank=True, null=True)
    piedi = models.CharField(max_length=100, blank=True, null=True)
    colonna_v = models.CharField(max_length=100, blank=True, null=True)
    curvatura_c = models.CharField(max_length=100, blank=True, null=True)
    curvatura_d = models.CharField(max_length=100, blank=True, null=True)
    curvatura_l = models.CharField(max_length=100, blank=True, null=True)
    posizione_b = models.CharField(max_length=100, blank=True, null=True)
    equilibrio_s = models.CharField(max_length=100, blank=True, null=True)
    equilibrio_d = models.CharField(max_length=100, blank=True, null=True)
    p_dolenti = models.CharField(max_length=255, blank=True, null=True)

    # Valutazione complessiva funzionale
    gravita_disfunzione_posturale = models.CharField(max_length=100, blank=True, null=True)
    rischio_infortuni = models.CharField(max_length=100, blank=True, null=True)
    suggerimenti = models.CharField(max_length=255, blank=True, null=True)
    considerazioni_finali = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Referto - {self.paziente.name} {self.paziente.surname}"

# PRESCRIZIONI ESAMI UTENTE
class PrescrizioniEsami(models.Model):
    paziente = models.ForeignKey(
        TabellaPazienti, 
        on_delete=models.CASCADE, 
        related_name='visite'
    )
    data_visita = models.DateField(auto_now_add=True)
    esami_prescritti = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Visita di - {self.data_visita}"

# TABELLA APPUNTAMENTI
class Appointment(models.Model):
    dottore = models.ForeignKey(UtentiRegistratiCredenziali, on_delete=models.CASCADE, null=True, blank=True)
    paziente = models.ForeignKey(TabellaPazienti, on_delete=models.SET_NULL, null=True, blank=True, related_name="appuntamenti")
    cognome_paziente = models.CharField(max_length=255, blank=True, null=True)
    nome_paziente = models.CharField(max_length=255, blank=True, null=True)
    tipologia_visita = models.CharField(max_length=100, blank=True, null=True)
    data = models.DateField(default=datetime.now)
    giorno = models.CharField(max_length=255, blank=True, null=True)
    orario = models.TimeField()
    durata = models.CharField(max_length=255, blank=True, null=True)
    visita = models.CharField(max_length=255, blank=True, null=True)
    prezzo = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    numero_studio = models.CharField(max_length=100, choices=[('Studio 1', 'Studio 1'), ('Studio 2', 'Studio 2'), ('Studio 3', 'Studio 3')], blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    confermato = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.nome_paziente} - {self.orario}"
    
## TERAPIA DOMICILIARE
class TerapiaDomiciliare(models.Model):
    paziente = models.ForeignKey(TabellaPazienti, on_delete=models.CASCADE, related_name="terapie_domiciliari")
    farmaco = models.CharField(max_length=255)
    assunzioni = models.IntegerField()
    orari = models.JSONField(null=True)
    data_inizio = models.DateField(null=True)
    data_fine = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

## TERAPIA IN STUDIO
class TerapiaInStudio(models.Model):
    paziente = models.ForeignKey(TabellaPazienti, on_delete=models.CASCADE, related_name="terapie_studio")
    tipologia = models.CharField(max_length=100)
    descrizione = models.TextField()
    data_inizio = models.DateField()
    data_fine = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

## DIAGNOSI
class Diagnosi(models.Model):
    paziente = models.ForeignKey(TabellaPazienti, on_delete=models.CASCADE, related_name="diagnosi")
    descrizione = models.TextField()
    data_diagnosi = models.DateField()
    stato = models.CharField(max_length=100)
    note = models.TextField(blank=True, null=True)
    gravita = models.IntegerField()
    rischi = models.TextField(blank=True, null=True)
    problemi = models.TextField(blank=True, null=True)
    risolta = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

## LABORATORIO
class AllegatiLaboratorio(models.Model):
    paziente = models.ForeignKey(TabellaPazienti, on_delete=models.CASCADE, related_name="allegati_laboratorio")
    file = models.FileField(upload_to='laboratorio/', null=True, blank=True)
    data_referto = models.DateField(default=datetime.now)
    created_at = models.DateTimeField(auto_now_add=True)

## STRUMENTALE
class AllegatiStrumentale (models.Model):
    paziente = models.ForeignKey(TabellaPazienti, on_delete=models.CASCADE, related_name="allegati_strumentale")
    file = models.FileField(upload_to='strumentale/', null=True, blank=True)
    data_referto = models.DateField(default=datetime.now)
    created_at = models.DateTimeField(auto_now_add=True)


## MICROBIOTA
class MicrobiotaReport(models.Model):
    """Tabella Referti Microbiota"""

    paziente = models.ForeignKey(
        'TabellaPazienti',
        on_delete=models.CASCADE,
        related_name='microbiota_reports'
    )
    caricato_da = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_microbiota_reports'
    )
    created_at = models.DateTimeField(default=timezone.now)

    # Indici di biodiversità
    ind_biod = models.CharField(max_length=50, blank=True, null=True)
    num_spec = models.CharField(max_length=50, blank=True, null=True)
    dis_filo = models.CharField(max_length=50, blank=True, null=True)
    dis_spec = models.CharField(max_length=50, blank=True, null=True)

    # Patobionti rilevati
    batteri_g = models.CharField(max_length=100, blank=True, null=True)
    miceti_g = models.CharField(max_length=100, blank=True, null=True)
    virus_g = models.CharField(max_length=100, blank=True, null=True)
    parassiti_g = models.CharField(max_length=100, blank=True, null=True)

    # Metabolismi Alterati
    butirrato = models.CharField(max_length=50, blank=True, null=True)
    propionato = models.CharField(max_length=50, blank=True, null=True)
    lattato = models.CharField(max_length=50, blank=True, null=True)
    gaba = models.CharField(max_length=50, blank=True, null=True)
    istamina = models.CharField(max_length=50, blank=True, null=True)
    indolo = models.CharField(max_length=50, blank=True, null=True)
    ac_indolacetico = models.CharField(max_length=50, blank=True, null=True)
    triptamina = models.CharField(max_length=50, blank=True, null=True)
    serotonina = models.CharField(max_length=50, blank=True, null=True)
    polifenoli = models.CharField(max_length=50, blank=True, null=True)
    vitamine_gr = models.CharField(max_length=50, blank=True, null=True)
    vitamina_k2 = models.CharField(max_length=50, blank=True, null=True)
    proteolisi = models.CharField(max_length=50, blank=True, null=True)
    ac_biliari = models.CharField(max_length=50, blank=True, null=True)
    etanolo = models.CharField(max_length=50, blank=True, null=True)

    # Funzioni / Assi
    o_immu = models.CharField(max_length=50, blank=True, null=True)
    o_muco = models.CharField(max_length=50, blank=True, null=True)
    ome_gluc = models.CharField(max_length=50, blank=True, null=True)
    meta_lip = models.CharField(max_length=50, blank=True, null=True)
    att_antinf = models.CharField(max_length=50, blank=True, null=True)
    att_antim = models.CharField(max_length=50, blank=True, null=True)
    as_cerv = models.CharField(max_length=50, blank=True, null=True)
    as_card = models.CharField(max_length=50, blank=True, null=True)
    as_fegato = models.CharField(max_length=50, blank=True, null=True)
    as_pelle = models.CharField(max_length=50, blank=True, null=True)
    ri_circa = models.CharField(max_length=50, blank=True, null=True)

    # Rapporti e enterotipo
    firmicutes = models.CharField(max_length=50, blank=True, null=True)
    bacteronamees = models.CharField(max_length=50, blank=True, null=True)
    prevotella = models.CharField(max_length=50, blank=True, null=True)
    bacte_1 = models.CharField(max_length=50, blank=True, null=True)
    enter = models.CharField(max_length=50, blank=True, null=True)

    # Ecologia Batterica – Phylum
    firmi = models.CharField(max_length=50, blank=True, null=True)
    bacte_2 = models.CharField(max_length=50, blank=True, null=True)
    actino = models.CharField(max_length=50, blank=True, null=True)
    verruc = models.CharField(max_length=50, blank=True, null=True)
    eurya = models.CharField(max_length=50, blank=True, null=True)
    fusob = models.CharField(max_length=50, blank=True, null=True)
    lentis = models.CharField(max_length=50, blank=True, null=True)

    # Ecologia Batterica – Famiglia
    rumino = models.CharField(max_length=50, blank=True, null=True)
    lachno = models.CharField(max_length=50, blank=True, null=True)
    firmicutes_u = models.CharField(max_length=50, blank=True, null=True)
    eubacteria = models.CharField(max_length=50, blank=True, null=True)
    oscillo = models.CharField(max_length=50, blank=True, null=True)
    strept = models.CharField(max_length=50, blank=True, null=True)
    veillo = models.CharField(max_length=50, blank=True, null=True)
    pepto = models.CharField(max_length=50, blank=True, null=True)
    bactero = models.CharField(max_length=50, blank=True, null=True)
    rikene = models.CharField(max_length=50, blank=True, null=True)
    tannere = models.CharField(max_length=50, blank=True, null=True)
    odoribac = models.CharField(max_length=50, blank=True, null=True)
    corioba = models.CharField(max_length=50, blank=True, null=True)
    desulfovi = models.CharField(max_length=50, blank=True, null=True)

    # Dettaglio patogenicità e abbondanze
    patogeni_rilevati = models.TextField(blank=True, null=True)
    miceti_n = models.TextField(blank=True, null=True)
    virus_n = models.TextField(blank=True, null=True)
    parassiti_n = models.TextField(blank=True, null=True)


    scatolo = models.FloatField(null=True, blank=True, help_text="Salute del Cuore") 
    indicano = models.FloatField(null=True, blank=True, help_text="Salute del Cuore")  

    def __str__(self):
        return f"Report {self.id} – {self.paziente} ({self.created_at.date()})"



## FARMACI PRESCRITTI
class Farmaco(models.Model):
    codice_univoco_farmaco = models.CharField(max_length=50, unique=True)
    nome_farmaco = models.CharField(max_length=200)
    principio_attivo = models.CharField(max_length=200)
    cod_aic = models.CharField(max_length=20, blank=True, null=True)
    cod_atc = models.CharField(max_length=20, blank=True, null=True)
    forma_farmaceutica = models.CharField(max_length=100, blank=True, null=True)
    dosaggio = models.CharField(max_length=100, blank=True, null=True)
    posologia_adulto = models.TextField(blank=True, null=True)
    posologia_bambino = models.TextField(blank=True, null=True)
    indicazioni = models.TextField(blank=True, null=True)
    controindicazioni = models.TextField(blank=True, null=True)
    effetti_collaterali = models.TextField(blank=True, null=True)
    apparato_sistemi = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Farmaco"
        verbose_name_plural = "Farmaci"
        ordering = ['nome_farmaco']

    def __str__(self):
        return f"{self.nome_farmaco} - {self.dosaggio}"

class PrescrizioneFarmaco(models.Model):
    # Relazioni
    paziente = models.ForeignKey(
        TabellaPazienti, 
        on_delete=models.CASCADE, 
        related_name='prescrizioni_farmaci'
    )
    medico = models.ForeignKey(
        UtentiRegistratiCredenziali, 
        on_delete=models.CASCADE, 
        related_name='farmaci_prescritti'
    )
    farmaco = models.ForeignKey(Farmaco, on_delete=models.CASCADE)

    # Dati della prescrizione
    data_prescrizione = models.DateTimeField(auto_now_add=True)
    data_inizio = models.DateField()
    data_fine = models.DateField(blank=True, null=True)
    posologia_personalizzata = models.TextField(blank=True, null=True)
    note_medico = models.TextField(blank=True, null=True)
    diagnosi = models.CharField(max_length=500, blank=True, null=True)

    # Stati
    STATO_CHOICES = [
        ('attiva', 'Attiva'),
        ('sospesa', 'Sospesa'),
        ('completata', 'Completata'),
        ('annullata', 'Annullata'),
    ]
    stato = models.CharField(max_length=20, choices=STATO_CHOICES, default='attiva')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Prescrizione Farmaco"
        verbose_name_plural = "Prescrizioni Farmaci"
        ordering = ['-data_prescrizione']
        unique_together = ['paziente', 'farmaco', 'data_prescrizione']

    def __str__(self):
        return f"{self.farmaco.nome_farmaco} - {self.paziente} ({self.data_prescrizione.strftime('%d/%m/%Y')})"



class PrescrizioneLibera(models.Model):
    persona = models.ForeignKey('TabellaPazienti', on_delete=models.CASCADE, related_name='prescrizioni_libere')
    testo = models.TextField()
    data_creazione = models.DateTimeField(auto_now_add=True)

    def str(self):
        return f"Prescrizione libera per {self.persona} del {self.data_creazione.strftime('%d/%m/%Y %H:%M')}"



class Visita(models.Model):
    paziente = models.ForeignKey('TabellaPazienti', on_delete=models.CASCADE, related_name='visite_paziente', null=True, blank=True)
    visita_numero = models.IntegerField(null=True, blank=True)
    data_visita = models.DateField(default=timezone.now, null=True, blank=True)

    professione = models.CharField(max_length=100, null=True, blank=True)
    pensionato = models.CharField(max_length=100, null=True, blank=True)

    menarca = models.CharField(max_length=100, null=True, blank=True)
    ciclo = models.CharField(max_length=100, null=True, blank=True)
    sintomi = models.CharField(max_length=100, null=True, blank=True)
    esordio = models.CharField(max_length=100, null=True, blank=True)
    parto = models.CharField(max_length=100, null=True, blank=True)
    post_parto = models.CharField(max_length=100, null=True, blank=True)
    aborto = models.CharField(max_length=100, null=True, blank=True)

    alcol = models.CharField(max_length=255, null=True, blank=True)
    alcol_type = models.CharField(max_length=255, null=True, blank=True)
    data_alcol = models.DateField(null=True, blank=True)
    alcol_frequency = models.CharField(max_length=255, null=True, blank=True)

    smoke = models.CharField(max_length=255, null=True, blank=True)
    smoke_frequency = models.CharField(max_length=100, blank=True, null=True)
    reduced_intake = models.CharField(max_length=100, blank=True, null=True)

    sport = models.CharField(default=False, max_length=100, null=True, blank=True)
    sport_livello = models.CharField(max_length=100, blank=True, null=True)
    sport_frequency = models.CharField(max_length=100, blank=True, null=True)

    attivita_sedentaria = models.CharField(default=False, max_length=100, null=True, blank=True)
    livello_sedentarieta = models.CharField(max_length=100, blank=True, null=True)
    sedentarieta_nota = models.TextField(blank=True, null=True)

    m_cardiache = models.CharField(max_length=100, null=True, blank=True)
    diabete_m = models.CharField(max_length=100, null=True, blank=True)
    obesita = models.CharField(max_length=100, null=True, blank=True)
    epilessia = models.CharField(max_length=100, null=True, blank=True)
    ipertensione = models.CharField(max_length=100, null=True, blank=True)
    m_tiroidee = models.CharField(max_length=100, null=True, blank=True)
    m_polmonari = models.CharField(max_length=100, null=True, blank=True)
    tumori = models.CharField(max_length=100, null=True, blank=True)
    allergie = models.CharField(max_length=100, null=True, blank=True)
    m_psichiatriche = models.CharField(max_length=100, null=True, blank=True)

    patologie = models.CharField(max_length=100, null=True, blank=True)
    p_p_altro = models.CharField(max_length=100, null=True, blank=True)
    t_farmaco = models.CharField(max_length=100, null=True, blank=True)
    t_dosaggio = models.CharField(max_length=100, null=True, blank=True)
    t_durata = models.CharField(max_length=100, null=True, blank=True)

    p_cardiovascolari = models.CharField(max_length=100, null=True, blank=True)
    m_metabolica = models.CharField(max_length=100, null=True, blank=True)
    p_respiratori_cronici = models.CharField(max_length=100, null=True, blank=True)
    m_neurologica = models.CharField(max_length=100, null=True, blank=True)
    m_endocrina = models.CharField(max_length=100, null=True, blank=True)
    m_autoimmune = models.CharField(max_length=100, null=True, blank=True)
    p_epatici = models.CharField(max_length=100, null=True, blank=True)
    m_renale = models.CharField(max_length=100, null=True, blank=True)
    d_gastrointestinali = models.CharField(max_length=100, null=True, blank=True)

    eloquio = models.CharField(max_length=100, null=True, blank=True)
    s_nutrizionale = models.CharField(max_length=100, null=True, blank=True)
    a_genarale = models.CharField(max_length=100, null=True, blank=True)
    psiche = models.CharField(max_length=100, null=True, blank=True)
    r_ambiente = models.CharField(max_length=100, null=True, blank=True)
    s_emotivo = models.CharField(max_length=100, null=True, blank=True)
    costituzione = models.CharField(max_length=100, null=True, blank=True)
    statura = models.CharField(max_length=100, null=True, blank=True)

    blood_group = models.CharField(max_length=20, null=True, blank=True)
    rh_factor = models.CharField(max_length=20, null=True, blank=True)
    pressure_min = models.CharField(max_length=100, null=True, blank=True)
    pressure_max = models.CharField(max_length=100, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Visita {self.visita_numero} del {self.data_visita} per {self.paziente}"
