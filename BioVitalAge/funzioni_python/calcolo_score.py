
ORGANI_ESAMI_PESI = {
    "Cuore": {
        "Colesterolo Totale": 10,
        "Colesterolo LDL": 15,
        "Colesterolo HDL": 10,
        "Trigliceridi": 10,
        "PCR": 10,
        "NT-proBNP": 20,
        "Omocisteina": 10,
        "Glicemia": 5,
        "Insulina": 5,
        "HOMA Test": 2.5,
        "IR Test": 2.5,
        "Creatinina": 0.5,
        "Stress Ossidativo": 5,
        "Omega Screening": 5,
    },
    "Reni": {
        "Creatinina": 25,
        "Azotemia": 20,
        "Sodio": 10,
        "Potassio": 10,
        "Cloruri": 5,
        "Fosforo": 10,
        "Calcio": 10,
        "Esame delle Urine": 10,
    },
    "Fegato": {
        "Transaminasi GOT": 15,
        "Transaminasi GPT": 15,
        "Gamma-GT": 15,
        "Bilirubina Totale": 10,
        "Bilirubina Diretta": 5,
        "Bilirubina Indiretta": 5,
        "Fosfatasi Alcalina": 10,
        "Albumina": 15,
        "Proteine Totali": 10,
    },
    "Cervello": {
        "Omocisteina": 10,
        "Vitamina B12": 10,
        "Vitamina D": 10,
        "DHEA": 5,
        "TSH": 5,
        "FT3": 5,
        "FT4": 5,
        "Omega-3 Index": 10,
        "EPA": 5,
        "DHA": 5,
        "Stress Ossidativo dROMS": 5,
        "Stress Ossidativo PAT": 5,
        "Stress Ossidativo OSI REDOX": 5,
    },
    "Sistema Ormonale": {
        "TSH": 15,
        "FT3": 15,
        "FT4": 15,
        "Insulina": 10,
        "HOMA Test": 5,
        "IR Test": 5,
        "Glicemia": 5,
        "DHEA": 10,
        "Testosterone": 10,
        "17B-Estradiolo": 5,
        "Progesterone": 5,
        "SHBG": 5,
    },
    "Sangue": {
        "Emocromo - Globuli Rossi": 10,
        "Emocromo - Emoglobina": 10,
        "Emocromo - Ematocrito": 5,
        "Emocromo - MCV": 5,
        "Emocromo - MCH": 3,
        "Emocromo - MCHC": 2,
        "Emocromo - RDW": 5,
        "Emocromo - Globuli Bianchi": 10,
        "Emocromo - Neutrofili": 5,
        "Emocromo - Linfociti": 5,
        "Emocromo - Monociti": 3,
        "Emocromo - Eosinofili": 2,
        "Emocromo - Basofili": 2,
        "Emocromo - Piastrine": 8,
        "Ferritina": 10,
        "Sideremia": 10,
        "Transferrina": 5,
    },
    "Sistema Immunitario": {
        "PCR": 30,
        "Omocisteina": 20,
        "TNF-A": 20,
        "IL-6": 15,
        "IL-10": 15,
    },
}


RANGES_NORMALI = {
    # Esami cardiaci e metabolici
    "Colesterolo Totale": (125, 200),
    "Colesterolo LDL": (0, 100),
    "Colesterolo HDL": (40, 60),
    "Trigliceridi": (0, 150),
    "PCR": (0, 1),
    "NT-proBNP": (0, 125),
    "Omocisteina": (0, 12),
    "Glicemia": (70, 99),
    "Insulina": (2, 25),
    "HOMA Test": (0.5, 2.5),
    "IR Test": (0.5, 2.5),
    
    # Funzionalità renale
    "Creatinina": (0.6, 1.3),
    "Azotemia": (10, 50),
    "Sodio": (135, 145),
    "Potassio": (3.5, 5.1),
    "Cloruri": (95, 105),
    "Fosforo": (2.5, 4.5),
    "Calcio": (8.5, 10.5),
    "Esame delle Urine": (0, 1), 
    
    # Funzionalità epatica
    "Transaminasi GOT": (0, 40),
    "Transaminasi GPT": (0, 41),
    "Gamma-GT": (0, 50),
    "Bilirubina Totale": (0.1, 1.2),
    "Bilirubina Diretta": (0, 0.3),
    "Bilirubina Indiretta": (0.2, 1.0),
    "Fosfatasi Alcalina": (30, 120),
    "Albumina": (3.5, 5.2),
    "Proteine Totali": (6, 8.3),
    
    # Vitamine e ormoni
    "Vitamina B12": (200, 900),
    "Vitamina D": (20, 50),
    "DHEA": (70, 495),
    "TSH": (0.4, 4.0),
    "FT3": (2.3, 4.2),
    "FT4": (0.8, 1.8),
    
    # Acidi grassi e stress ossidativo
    "Omega-3 Index": (8, 12),
    "EPA": (0.5, 2.5),
    "DHA": (2, 5),
    "Stress Ossidativo": (0, 300),
    "Stress Ossidativo dROMS": (0, 300),
    "Stress Ossidativo PAT": (0, 300),
    "Stress Ossidativo OSI REDOX": (0, 300),
    "Omega Screening": (8, 12),
    
    # Ormoni sessuali
    "Testosterone": (300, 1000),
    "17B-Estradiolo": (30, 400),
    "Progesterone": (0.1, 25),
    "SHBG": (10, 57),
    
    # Emocromo - parametri dettagliati
    "Emocromo - Globuli Rossi": (4.5, 5.9),     # x10^12/L (uomini)
    "Emocromo - Emoglobina": (13.5, 17.5),      # g/dL (uomini)
    "Emocromo - Ematocrito": (41, 50),          # % (uomini)
    "Emocromo - MCV": (80, 100),                # fL
    "Emocromo - MCH": (27, 33),                 # pg
    "Emocromo - MCHC": (32, 36),                # g/dL
    "Emocromo - RDW": (11.5, 14.5),             # %
    "Emocromo - Globuli Bianchi": (4.5, 11.0),  # x10^9/L
    "Emocromo - Neutrofili": (40, 74),          # %
    "Emocromo - Linfociti": (20, 40),           # %
    "Emocromo - Monociti": (2, 10),             # %
    "Emocromo - Eosinofili": (0, 6),            # %
    "Emocromo - Basofili": (0, 2),              # %
    "Emocromo - Piastrine": (150, 450),         # x10^9/L
    
    # Metabolismo del ferro
    "Ferritina": (30, 400),
    "Sideremia": (60, 170),
    "Transferrina": (200, 360),
    
    # Citochine infiammatorie
    "TNF-A": (0, 8),
    "IL-6": (0, 5),
    "IL-10": (0, 10),
}

# Range specifici per sesso - dizionario aggiuntivo per gestire differenze di genere
RANGES_PER_SESSO = {
    "M": {
        "Emocromo - Globuli Rossi": (4.5, 5.9),     
        "Emocromo - Emoglobina": (13.5, 17.5),      
        "Emocromo - Ematocrito": (41, 50),         
        "Ferritina": (30, 400),                     
        "Testosterone": (300, 1000),               
        "Creatinina": (0.7, 1.3),                   
    },
    "F": {
        "Emocromo - Globuli Rossi": (4.0, 5.2),    
        "Emocromo - Emoglobina": (12.0, 16.0),      
        "Emocromo - Ematocrito": (36, 46),          
        "Ferritina": (15, 150),                   
        "Testosterone": (15, 70),                   
        "Creatinina": (0.6, 1.1),                   
    }
}


def calcola_carica_rimanente(valore, minimo, massimo):

    if minimo <= valore <= massimo:
        return 100.0
    
    range_width = massimo - minimo
    
    if valore < minimo:
        
        deviation = (minimo - valore) / range_width
        penalty_factor = min(0.5, deviation) 
        return max(0, 100 * (1 - penalty_factor))
    else: 
 
        deviation = (valore - massimo) / range_width
        penalty_factor = min(0.5, deviation) * 2 
        return max(0, 100 * (1 - penalty_factor))


def ottieni_range_corretto(esame, sesso=None):

    if sesso and sesso in RANGES_PER_SESSO and esame in RANGES_PER_SESSO[sesso]:
        return RANGES_PER_SESSO[sesso][esame]
    

    if esame in RANGES_NORMALI:
        return RANGES_NORMALI[esame]

    return None


def calcola_score_organi(valori_esami, sesso=None):

    punteggi = {}
    dettagli = {}

    for organo, esami in ORGANI_ESAMI_PESI.items():
        score_totale = 0
        peso_totale_considerato = 0
        dettagli[organo] = {}
        
        for esame, peso_percentuale in esami.items():
            if esame in valori_esami:
                valore = valori_esami[esame]
                
       
                range_esame = ottieni_range_corretto(esame, sesso)
                
                if range_esame:
                    minimo, massimo = range_esame
                    
            
                    carica_rimanente = calcola_carica_rimanente(valore, minimo, massimo)
                    

                    contributo = (carica_rimanente * peso_percentuale / 100)
                    score_totale += contributo
                    peso_totale_considerato += peso_percentuale
                    
      
                    dettagli[organo][esame] = {
                        "valore": valore,
                        "range": (minimo, massimo),
                        "carica_rimanente": carica_rimanente,
                        "peso": peso_percentuale,
                        "contributo": contributo
                    }

        if peso_totale_considerato > 0:

            punteggi[organo] = round((score_totale / peso_totale_considerato) * 100, 2)
        else:
            punteggi[organo] = 0

    return punteggi, dettagli


def genera_report(punteggi, dettagli, mostrar_dettagli=False):

    report = []
    report.append("=== REPORT STATO DI SALUTE DEGLI ORGANI ===\n")

    organi_ordinati = sorted(punteggi.items(), key=lambda x: x[1])
    
    for organo, punteggio in organi_ordinati:
        report.append(f"{organo}: {punteggio}% di carica rimanente")
    
    if mostrar_dettagli:
        report.append("\n=== DETTAGLI PER ORGANO ===")
        for organo, punteggio in organi_ordinati:
            report.append(f"\n{organo} ({punteggio}%):")
            
            esami_ordinati = sorted(
                dettagli[organo].items(), 
                key=lambda x: x[1]["carica_rimanente"]
            )
            
            for esame, info in esami_ordinati:
                valore = info["valore"]
                min_range, max_range = info["range"]
                carica = info["carica_rimanente"]
                peso = info["peso"]
                
                stato = "nel range" if min_range <= valore <= max_range else "fuori range"
                report.append(f"  - {esame}: {valore} ({stato}, range: {min_range}-{max_range})")
                report.append(f"    Carica: {carica:.2f}%, Peso: {peso}%, Contributo: {info['contributo']:.2f}%")
    
    return "\n".join(report)
