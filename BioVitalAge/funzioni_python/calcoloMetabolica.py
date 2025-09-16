from statistics import mean

def calcola_eta_metabolica(dati_paziente):
    eta = dati_paziente['eta']
    sesso = dati_paziente['sesso'].lower()  # 'maschio' o 'femmina'

    # -------------------- DOMINIO 1: COMPOSIZIONE CORPOREA --------------------
    delta_dom1 = 0

    # BMI
    bmi = dati_paziente['BMI']
    if bmi < 16:
        delta_dom1 += 3
    elif 16 <= bmi < 18.5:
        delta_dom1 += 1
    elif 18.5 <= bmi <= 24.99:
        delta_dom1 += 0
    elif 25 <= bmi < 30:
        delta_dom1 += 1
    elif 30 <= bmi < 35:
        delta_dom1 += 2
    else:
        delta_dom1 += 3


    grasso = dati_paziente['grasso_percento']
    acqua = dati_paziente['acqua_percento']

    if (sesso == 'maschio' and not (50 <= acqua <= 65)) or (sesso == 'femmina' and not (45 <= acqua <= 60)):
        delta_dom1 += 1

    massa = dati_paziente['massa_muscolare_percento']
    eta_range = min(70, eta)  
    ranges_uomo = {
        (20,29): (39,44), (30,39): (38,43), (40,49): (37,42),
        (50,59): (36,41), (60,69): (35,40), (70,150): (34,39)
    }
    ranges_donna = {
        (20,29): (30,35), (30,39): (29,34), (40,49): (28,33),
        (50,59): (27,32), (60,69): (26,31), (70,150): (25,30)
    }
    ranges = ranges_uomo if sesso == 'maschio' else ranges_donna
    for k, v in ranges.items():
        if k[0] <= eta <= k[1]:
            if not (v[0] <= massa <= v[1]):
                delta_dom1 += 1
            break

    # WHR
    whr = dati_paziente['WHR']
    if (sesso == 'maschio' and whr > 1) or (sesso == 'femmina' and whr > 0.85):
        delta_dom1 += 2
    elif (sesso == 'maschio' and whr >= 0.9) or (sesso == 'femmina' and whr >= 0.75):
        delta_dom1 += 1

    eta_dom1 = eta + delta_dom1

    # -------------------- DOMINIO 2: GLICEMIA/INSULINA --------------------
    delta_dom2 = 0

    glicemia = dati_paziente['glicemia']
    if glicemia < 70:
        delta_dom2 += 1
    elif 100 <= glicemia <= 125:
        delta_dom2 += 2
    elif glicemia >= 126:
        delta_dom2 += 4

    hba1c = dati_paziente['HbA1c']
    if hba1c > 6.4:
        delta_dom2 += 4
    elif hba1c >= 5.8:
        delta_dom2 += 2

    homa_ir = dati_paziente['HOMA_IR']
    if homa_ir > 2.4:
        delta_dom2 += 3
    elif homa_ir > 1:
        delta_dom2 += 1

    tyg_index = dati_paziente['TyG']
    if tyg_index > 9.5:
        delta_dom2 += 3
    elif tyg_index > 8.5:
        delta_dom2 += 1

    eta_dom2 = eta + delta_dom2

    # -------------------- DOMINIO 3: LIPIDI --------------------
    delta_dom3 = 0
    if dati_paziente['HDL'] < 40:
        delta_dom3 += 2
    if dati_paziente['LDL'] > 130:
        delta_dom3 += 2
    if dati_paziente['trigliceridi'] > 150:
        delta_dom3 += 2
    eta_dom3 = eta + delta_dom3

    # -------------------- DOMINIO 4: FEGATO --------------------
    delta_dom4 = 0
    if dati_paziente['AST'] > 40:
        delta_dom4 += 1
    if dati_paziente['ALT'] > 40:
        delta_dom4 += 1
    if dati_paziente['GGT'] > 60:
        delta_dom4 += 1
    if dati_paziente['bilirubina'] > 1.2:
        delta_dom4 += 1
    eta_dom4 = eta + delta_dom4

    # -------------------- DOMINIO 5: INFIAMMAZIONE --------------------
    delta_dom5 = 0
    sii = dati_paziente['SII']
    hgs = dati_paziente['HGS']  # in kg
    if sii > 500:
        delta_dom5 += 2
    elif sii < 300:
        delta_dom5 += 1
    if hgs > 30:
        delta_dom5 -= 1
    eta_dom5 = eta + delta_dom5

    # -------------------- DOMINIO 6: STRESS --------------------
    delta_dom6 = 0
    cortisolo = dati_paziente['cortisolo']
    if cortisolo < 5 or cortisolo > 23:
        delta_dom6 += 2
    eta_dom6 = eta + delta_dom6

    # -------------------- CALCOLO FINALE --------------------
    eta_finale = round(mean([eta_dom1, eta_dom2, eta_dom3, eta_dom4, eta_dom5, eta_dom6]), 1)
    return eta_finale