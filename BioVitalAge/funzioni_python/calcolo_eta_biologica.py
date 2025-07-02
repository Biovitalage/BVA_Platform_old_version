
def adjust_age_basophils(basophils):
    basophils = float(basophils) if basophils else 0
    if 0 <= basophils <= 2.5:
        return 0
    elif basophils > 2.5:
        return 2
    return 0

def adjust_age_eosinophils(eosinophils):
    eosinophils = float(eosinophils) if eosinophils else 0
    if 0 <= eosinophils <= 5:
        return 0
    elif eosinophils > 5:
        return 2
    return 0

def adjust_age_lymphocytes(lymphocytes):
    lymphocytes = float(lymphocytes) if lymphocytes else 0

    if 15 <= lymphocytes <= 45:
        return 0
    
    else:
        return 2
    
    return 0

def adjust_age_monocytes(monocytes):
    monocytes = float(monocytes) if monocytes else 0
    if 2 <= monocytes <= 10:
        return 0
    elif 2 < monocytes > 10:
        return 2
    return 0

def adjust_age_neutrophils(neutrophils):
    neutrophils = float(neutrophils) if neutrophils else 0
    if 40 <= neutrophils <= 70:
        return 0
    elif 40 < neutrophils > 70:
        return 2
    return 0

def adjust_age_rbc(rbc):
    rbc = float(rbc) if rbc else 0
    if 4.2 <= rbc <= 5.4:
        return 0
    elif 4.2 < rbc > 5.4:
        return 2
    return 0

def adjust_age_hct(hct):
    hct = float(hct) if hct else 0
    if 38 <= hct <= 48:
        return 0
    elif 38 < hct > 48:
        return 2
    return 0

def adjust_age_hgb(hgb):
    hgb = float(hgb) if hgb else 0
    if 12 <= hgb <= 16:
        return 0
    elif 12 < hgb > 16:
        return 2
    return 0

def adjust_age_mch(mch):
    mch = float(mch) if mch else 0
    if 27 <= mch <= 31:
        return 0
    elif 27 < mch > 31:
        return 2
    return 0

def adjust_age_mchc(mchc):
    mchc = float(mchc) if mchc else 0

    if 32 <= mchc <= 37:
        return 0
    
    elif mchc < 32 or mchc > 37:
        return 2
    
    return 0

def adjust_age_mcv(mcv):
    mcv = float(mcv) if mcv else 0
    if 80 <= mcv <= 100:
        return 0
    elif 80 < mcv > 100:
        return 2
    return 0

def adjust_age_mpv(mpv):
    mpv = float(mpv) if mpv else 0
    if 9.1 <= mpv <= 12.3 :
        return 0
    elif 9.1 < mpv > 12.3:
        return 2
    return 0

def adjust_age_mpd(mpd):
    mpd = float(mpd) if mpd else 0
    if 10 <= mpd <= 16:
        return 0
    elif 10 < mpd > 16:
        return 2
    return 0

def adjust_age_wbc(wbc):
    wbc = float(wbc) if wbc else 0
    if 4000 <= wbc <= 11000:
        return 0
    elif 4000 < wbc > 11000:
        return 2
    return 0

def adjust_age_bilirubin(bilirubin):
    bilirubin = float(bilirubin) if bilirubin else 0
    if 0 <= bilirubin <= 1.2:
        return 0
    elif bilirubin > 1.2:
        return 2
    return 0

def adjust_age_uric_acidM(uric_acid):
    uric_acid = float(uric_acid) if uric_acid else 0

    if 3.4 <= uric_acid <= 7.0:
        return 0
    
    elif uric_acid < 3.4:
        return 2
    
    return 0

def adjust_age_uric_acidF(uric_acid):
    uric_acid = float(uric_acid) if uric_acid else 0

    if 2.4 <= uric_acid <= 5.7:
        return 0
    
    elif uric_acid < 2.4:
        return 2
    
    return 0

def adjust_age_rdw(rdw):
    rdw = float(rdw) if rdw else 0

    if 38 <= rdw <= 48:
        return 0
    
    elif rdw < 38 or rdw > 48:
        return 2
    return 0

def adjust_age_glucose(glucose):

    glucose = float(glucose) if glucose else 0 

    if 70 <= glucose <= 105:
        return 0  # Range normale
    elif 106 <= glucose <= 140:
        return 2  # Glucosio leggermente elevato
    elif glucose > 140:
        return 5  # Alto rischio
    return 0

def adjust_age_creatinine(creatinine):
    creatinine = float(creatinine) if creatinine else 0

    if 0.5 <= creatinine <= 0.9:
        return 0
    
    elif creatinine > 0.9:
        return 3
    return 0

def adjust_age_ferritin(ferritin):
    ferritin = float(ferritin) if ferritin else 0
    if 13 <= ferritin <= 150:
        return 0
    
    elif ferritin > 150:
        return 2
    return 0

def adjust_age_albumin(albumin):

    albumin = float(albumin) if albumin else 0
    if 3.5 <= albumin <= 5.2:
        return 0
    
    elif albumin < 3.5:
        return 2
    return 0

def adjust_age_protein(protein):
    protein = float(protein) if protein else 0
    if 6.6 <= protein <= 8.7:
        return 0
    elif protein < 6.6:
        return 2
    return 0

def adjust_age_bilirubin(bilirubin):
    bilirubin = float(bilirubin) if bilirubin else 0
    if 0 <= bilirubin <= 1.2:
        return 0
    elif bilirubin > 1.2:
        return 2
    return 0

def adjust_age_uric_acid(uric_acid):
    uric_acid = float(uric_acid) if uric_acid else 0
    if 3.5 <= uric_acid <= 7.2:
        return 0
    elif uric_acid > 7.2:
        return 2
    return 0

def adjust_age_obri(obri_index):
    obri_index = float(obri_index) if obri_index else 0
    if 0.8 <= obri_index <= 1.2:
        return 0
    elif 1.3 <= obri_index <= 1.7:
        return 2
    elif 1.8 <= obri_index <= 2.2:
        return 5
    elif obri_index > 2.2:
        return 10
    return 0

def adjust_age_d_roms(d_roms):
    d_roms = float(d_roms) if d_roms else 0
    if 250 <= d_roms <= 300:
        return 0
    elif 301 <= d_roms <= 320:
        return 1
    elif 321 <= d_roms <= 340:
        return 1
    elif 341 <= d_roms <= 400:
        return 3
    elif d_roms > 400:
        return 6
    return 0

def adjust_age_aa_epa(aa_epa):
    aa_epa = float(aa_epa) if aa_epa else 0
    if 1 <= aa_epa <= 3:
        return 0
    elif 3.1 <= aa_epa <= 15:
        return 2
    elif aa_epa > 15:
        return 4
    return 0

def adjust_age_aa_dha(aa_dha):
    aa_dha = float(aa_dha) if aa_dha else 0
    if 1.6 <= aa_dha <= 3.6:
        return 0
    elif 3.7 <= aa_dha <= 4.3:
        return 2
    elif aa_dha > 4.3:
        return 4
    return 0

def adjust_age_homa(homa_test):
    homa_test = float(homa_test) if homa_test else 0
    if 0.23 <= homa_test <= 2.5:
        return 0
    else:
        return 5

def adjust_age_cardio(cardiovascular_risk):
    cardiovascular_risk = float(cardiovascular_risk) if cardiovascular_risk else 0
    if cardiovascular_risk < 3:
        return 0
    elif 3 <= cardiovascular_risk <= 20:
        return 2
    else:
        return 5

def adjust_age_osi(osi):
    osi = float(osi) if osi else 0
    if 0 <= osi <= 40:
        return 0
    elif 41 <= osi <= 65:
        return 2
    elif 66 <= osi <= 120:
        return 5
    else:
        return 10

def adjust_age_pat(pat):
    pat = float(pat) if pat else 0
    if pat < 1800:
        return 10
    elif 1800 <= pat < 2270:
        return 2
    elif 2270 <= pat < 2800:
        return 0
    else:
        return -5

def adjust_age_examsF(exams):
    age_adjustment = 0
   
    normal_values = {
        'glucose': (0, 5),

        #DONNA
        'creatinine_w': (0.5, 0.9), 
        'uricemy_w':(3.4, 7.0),
        'dhea_w':(2.49, 8.36),
        'hdl_chol_w': (35, 65), 
        'testo_w':(0.084, 0.408),
        'ferritin_w': (13, 150),
        'gpt_w': (0, 33),
        'g_gt_w': (0, 40),
        'a_photo_w': (35, 104),
        'got_w': (0, 32),
        'beta_es_w':(0.05, 0.149),
        'prog_w':(0.05, 0.149),
        'shbg_w':(19.1, 149),
        'hct_w':(38, 48),
        'hgb_w':(12, 16),
        'rbc_w':(4.0, 5.5),

        #GENERIC
        'uric_acid': (2.4, 5.7),
        'rdwcv': (11, 15),
        'baso_ul': (0, 0.1),
        'eosi_ul': (0, 0.7),
        'mono_ul': (0, 0.99),
        'lymph_ul': (1.0, 3.5),
        'neut_ul' : (2.0, 7.5),
        'my_acid': (24, 64),
        'p_acid': (609, 893),
        'st_acid': (186, 279),
        'ar_acid': (5, 9),
        'beenic_acid': (14, 26),
        'pal_acid': (48, 124), 
        'ol_acid': (593, 916),
        'ner_acid': (24, 41),
        'a_linoleic_acid': (13, 33),
        'eico_acid': (16, 61),
        'doco_acid': (44, 111), 
        'lin_acid': (781, 1167),
        'gamma_lin_acid': (8, 25),
        'dih_gamma_lin_acid': (37, 75),
        'arachidonic_acid': (188, 343),
        'sa_un_fatty_acid': (0.4, 0.6),
        'o3o6_fatty_acid_quotient': (14, 64),
        'aa_epa': (0, 4),
        'o3_index': (6, 8),
        'rdwcv': (11.0, 15.0),
        'azotemia': (16.6, 48.5),
        'cistatine_c': (0.56, 0.95),
        'plt': (150, 450),
        'mpv': (9.1, 12.3),
        'plcr': (16.4, 44.2),
        'pct': (0.158, 0.425),
        'pdw': (10, 16),
        'd_dimero': (0, 200),
        'pai_1': (98, 122),
        'tot_chol': (0, 200), 
        'ldl_chol': (0, 100),
        'trigl': (150, 200),
        'na':(136, 145),
        'k':(3.5, 5.1),
        'mg':(1.6, 2.6),
        'ci':(98, 107),
        'ca':(8.6, 10.0),
        'p':(2.5, 4.5),
        'tsh':(0.270, 4.20),
        'ft3':(2.0, 4.4),
        'ft4':(0.93, 1.70),
        'fe':(33, 193),
        'transferrin': (200, 360),
        'glicemy': (74, 106),
        'insulin': (3, 16),
        'homa': (0.23, 2.5),
        'ir': (1, 3),
        'albuminemia':(3.50, 5.20),
        'tot_prot': (6.6, 8.7),
        'tot_prot_ele': (6.6, 8.7),
        'albumin_ele': (52.7, 67.4),
        'a_1': (3.6, 8.0),
        'a_2': (6.4, 11.50),
        'b_1': (5.2, 8.30),
        'b_2': (2.2, 8.0),
        'gamma': (8.7, 18.0),
        'albumin_dI': (3.50, 5.20),
        'a_1_dI': (0.24, 0.70),
        'a_2_dI': (0.42, 1.0),
        'b_1_dI': (0.34, 0.72),
        'b_2_dI': (0.15, 0.70),
        'gamma_dI': (0.57, 1.56),
        'ag_rap': (1.20, 2.06),
        'tot_bili': (0, 1.20),
        'direct_bili':(0, 0.30),
        'indirect_bili':(0, 1.00),
        'ves':(0, 20),
        'pcr_c':(0, 5),
        'tnf_a':(4.60, 12.40),
        'inter_6':(0, 4.4),
        'inter_10':(0, 10.8),
        'scatolo': (10, 40),
        'indicano': (20, 80),
        's_weight':(1000, 1030),
        'ph':(5.0, 9.0),
        'proteins_ex':(0, 15),
        'blood_ex':(0, 0),
        'ketones':(0, 5),
        'uro':(0, 17),
        'bilirubin_ex':(0, 1),
        'leuc':(0, 15),
        'nt_pro': (0, 125),
        'v_b12': (5, 15),
        'v_d': (10, 100),
        'telotest':(0, 0.49),
        'ves2': (5, 15),
   }
    
    for exam in exams:
        for key, value in exam.items():
            value = float(value)

            if value == 0:
                minValue, maxValue = normal_values[key]
                if minValue != 0:
                    age_adjustment += 0
                    #print(f"{key}: ✅ {value} il valore non è stato inserito ({minValue}, {maxValue})")
                    continue

            if key in normal_values:

                minValue, maxValue = normal_values[key]
            
                if minValue <= value <= maxValue:
                    #print(f"{key}: ✅ {value} è dentro il range ({minValue}, {maxValue})")
                    age_adjustment -= 0.2  
                else:
                    #print(f"{key}: ❌ {value} è FUORI dal range ({minValue}, {maxValue})")
                    age_adjustment += 0.4 
         
    return age_adjustment

def adjust_age_examsM(exams):
    age_adjustment = 0

    normal_values = {
        'glucose': (0, 5),

        #UOMO
        'creatinine_m': (0.7, 1.2),
        'uricemy_m':(0.56, 5.7),
        'dhea_m':(0.084, 0.408),
        'hdl_chol_m': (35, 55),
        'testo_m':(2.49, 8.36),
        'ferritin_m': (30, 400),
        'gpt_m': (0, 41),
        'g_gt_m': (0, 60),
        'a_photo_m': (40, 129),
        'got_m': (0, 40),
        'beta_es_m':(11.3, 43.2),
        'prog_m':(0.05, 0.149),
        'shbg_m':(14.4, 70.7),
        'hct_m':(42, 54),
        'hgb_m':(13,17),
        'rbc_m':(4.5, 6.0),

        #GENERIC
        'uric_acid': (2.4, 5.7),
        'rdwcv': (11, 15),
        'baso_ul': (0, 0.1),
        'eosi_ul': (0, 0.7),
        'mono_ul': (0, 0.99),
        'lymph_ul': (1.0, 3.5),
        'neut_ul' : (2.0, 7.5),
        'my_acid': (24, 64),
        'p_acid': (609, 893),
        'st_acid': (186, 279),
        'ar_acid': (5, 9),
        'beenic_acid': (14, 26),
        'pal_acid': (48, 124), 
        'ol_acid': (593, 916),
        'ner_acid': (24, 41),
        'a_linoleic_acid': (13, 33),
        'eico_acid': (16, 61),
        'doco_acid': (44, 111), 
        'lin_acid': (781, 1167),
        'gamma_lin_acid': (8, 25),
        'dih_gamma_lin_acid': (37, 75),
        'arachidonic_acid': (188, 343),
        'sa_un_fatty_acid': (0.4, 0.6),
        'o3o6_fatty_acid_quotient': (5-14, 64),
        'aa_epa': (0, 4),
        'o3_index': (6, 8),
        'rdwcv': (11.0, 15.0),
        'azotemia': (16.6, 48.5),
        'cistatine_c': (0.56, 0.95),
        'plt': (150, 450),
        'mpv': (9.1, 12.3),
        'plcr': (16.4, 44.2),
        'pct': (0.158, 0.425),
        'pdw': (10, 16),
        'd_dimero': (0, 200),
        'pai_1': (98, 122),
        'tot_chol': (0, 200),
        'ldl_chol': (0, 100),
        'trigl': (150, 200),
        'na':(136, 145),
        'k':(3.5, 5.1),
        'mg':(1.6, 2.6),
        'ci':(98, 107),
        'ca':(8.6, 10.0),
        'p':(2.5, 4.5),
        'tsh':(0.270, 4.20),
        'ft3':(2.0, 4.4),
        'ft4':(0.93, 1.70),
        'fe':(33, 193),
        'transferrin': (200, 360),
        'glicemy': (74, 106),
        'insulin': (3, 16),
        'homa': (0.23, 2.5),
        'ir': (1, 3),
        'albuminemia':(3.50, 5.20),
        'tot_prot': (6.6, 8.7),
        'tot_prot_ele': (6.6, 8.7),
        'albumin_ele': (52.7, 67.4),
        'a_1': (3.6, 8.0),
        'a_2': (6.4, 11.50),
        'b_1': (5.2, 8.30),
        'b_2': (2.2, 8.0),
        'gamma': (8.7, 18.0),
        'albumin_dI': (3.50, 5.20),
        'a_1_dI': (0.24, 0.70),
        'a_2_dI': (0.42, 1.0),
        'b_1_dI': (0.34, 0.72),
        'b_2_dI': (0.15, 0.70),
        'gamma_dI': (0.57, 1.56),
        'ag_rap': (1.20, 2.06),
        'tot_bili': (0, 1.20),
        'direct_bili':(0, 0.30),
        'indirect_bili':(0, 1.00),
        'ves':(0, 20),
        'pcr_c':(0, 5),
        'tnf_a':(4.60, 12.40),
        'inter_6':(0, 4.4),
        'inter_10':(0, 10.8),
        'scatolo': (10, 40),
        'indicano': (20, 80),
        's_weight':(1000, 1030),
        'ph':(5.0, 9.0),
        'proteins_ex':(0, 15),
        'blood_ex':(0, 0),
        'ketones':(0, 5),
        'uro':(0, 17),
        'bilirubin_ex':(0, 1),
        'leuc':(0, 15),
        'nt_pro': (0, 125),
        'v_b12': (5, 15),
        'v_d': (10, 100),
        'telotest':(0, 0.49),
        'ves2': (5, 15),
   }
    
    for exam in exams:
        for key, value in exam.items():
            value = float(value)

            if value == 0:
                minValue, maxValue = normal_values[key]
                if minValue != 0:
                    age_adjustment += 0
                    #print(f"{key}: ✅ {value} il valore non è stato inserito ({minValue}, {maxValue})")
                    continue

            if key in normal_values:

                minValue, maxValue = normal_values[key]
            
                if minValue <= value <= maxValue:
                    #print(f"{key}: ✅ {value} è dentro il range ({minValue}, {maxValue})")
                    age_adjustment -= 0.2  
                else:
                    #print(f"{key}: ❌ {value} è FUORI dal range ({minValue}, {maxValue})")
                    age_adjustment += 0.4 
         
    return age_adjustment

def calculate_biological_age(chronological_age, d_roms = 260, osi = 10, pat = 2500, wbc = 5000, basophils = 0.1,
                eosinophils = 1, lymphocytes = 30, monocytes = 5, neutrophils = 50, rbc = 5, hgb = 14, 
                hct = 40, mcv = 90, mch = 33 , mchc =  33, rdw = 12 , exams = [], gender = 'F'):
    
    biological_age = chronological_age

    if gender == 'M':
        biological_age += adjust_age_examsM(exams)
    
    if gender == 'F':
        biological_age += adjust_age_examsF(exams)

    # Aggiustamenti basati sui vari parametri
    biological_age += adjust_age_d_roms(d_roms)
    biological_age += adjust_age_osi(osi)
    biological_age += adjust_age_pat(pat)
    biological_age += adjust_age_wbc(wbc)
    biological_age += adjust_age_basophils(basophils)
    biological_age += adjust_age_eosinophils(eosinophils)
    biological_age += adjust_age_lymphocytes(lymphocytes)
    biological_age += adjust_age_monocytes(monocytes)
    biological_age += adjust_age_neutrophils(neutrophils)
    biological_age += adjust_age_rbc(rbc)
    biological_age += adjust_age_hgb(hgb)
    biological_age += adjust_age_hct(hct)
    biological_age += adjust_age_mcv(mcv)
    biological_age += adjust_age_mch(mch)
    biological_age += adjust_age_mchc(mchc)
    biological_age += adjust_age_rdw(rdw)

    # Aggiustamenti basati sugli esami specifici
    biological_age += adjust_age_glucose(exams[102].get('glucose', 0))
   
    if gender == 'M':
        biological_age += adjust_age_ferritin(exams[59].get('ferritin_m', 0))
        biological_age += adjust_age_creatinine(exams[30].get('creatinine_m', 0))
        biological_age += adjust_age_uric_acidM(exams[29].get('uric_acid', 0))

    if gender == 'F':
        biological_age += adjust_age_ferritin(exams[59].get('ferritin_w', 0))
        biological_age += adjust_age_creatinine(exams[30].get('creatinine_w', 0))
        biological_age += adjust_age_uric_acidF(exams[29].get('uric_acid', 0))

    biological_age += adjust_age_albumin(exams[73].get('albumin_dI', 0))
    biological_age += adjust_age_protein(exams[65].get('tot_prot', 0))
    biological_age += adjust_age_bilirubin(exams[84].get('tot_bili', 0))

    return int(biological_age)


#risultatoTest = calculate_biological_age(chronological_age = 53, wbc = 5430 , basophils = 0.6,
               # lymphocytes = 36.8, monocytes = 0.2, neutrophils = 54.3 , rbc = 4.45, hgb = 13.6, 
               # hct = 37.7, mcv = 84.7, mch = 30.6, mchc = 36.1, rdw = 37.4, gender = 'F', exams = exams)

