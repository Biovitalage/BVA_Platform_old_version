#DOMINIO COGNITIVO 
def Calcolo_Dominio_Cognitivo(Somma_MMSE):
    print('Somma_MMSE')
    if int(Somma_MMSE) >= 25:
        return 0
    elif int(Somma_MMSE) >= 18 and int(Somma_MMSE) <= 24:
        return 1
    elif int(Somma_MMSE) <= 17:
        return 2
    
    #ADJUST
    else:
        return 0
    
#DOMINIO PSICOLOGICO
def Calcolo_GDS(Somma_GDS):

    if int(Somma_GDS) >= 0 and int(Somma_GDS) <= 5:
        return 0
    elif int(Somma_GDS) >= 6 and int(Somma_GDS) <= 10:
        return 0.5
    elif int(Somma_GDS) >= 11 and int(Somma_GDS) <= 15:
        return 1
    
    #ADJUST
    else:
        return 0
    
def Calcolo_Locus_of_control(Somma_LOC):

    if int(Somma_LOC) >= 30 and int(Somma_LOC) <= 40:
        return 0
    elif int(Somma_LOC) >= 19 and int(Somma_LOC) <= 29:
        return 0.5
    elif int(Somma_LOC) >= 8 and int(Somma_LOC) <= 18:
        return 1
    
    #ADJUST
    else:
        return 0
    
#DOMINIO SENSORIALE
def Calcolo_Vista(Somma_Vista):
   
    if int(Somma_Vista) >= 6:
        return 0
    elif int(Somma_Vista) >= 3 and int(Somma_Vista) <= 5:
        return 0.5
    elif int(Somma_Vista) >= 1 and int(Somma_Vista) <= 2:
        return 1
    
    #ADJUST
    else:
        return 0
    
def Calcolo_Udito(Somma_Udito):

    if int(Somma_Udito) >= 6:
        return 0
    elif int(Somma_Udito) >= 3 and int(Somma_Udito) <= 5:
        return 0.5
    elif int(Somma_Udito) >= 1 and int(Somma_Udito) <= 2:
        return 1
    
    #ADJUST
    else:
        return 0
    
#DOMINIO DELLA VITALIA'
def Calcolo_HGS(HGS):
    print('HGS')
    if str(HGS) == 'Strong':
        return 0
    elif str(HGS) == 'Normal':
        return 0.5
    elif str(HGS) == 'Weak':
        return 1
    
    #ADJUST
    else:
        return 0
    
def Calcolo_Peak_Flow(PFT):

    if int(PFT) >= 90 and int(PFT) <= 100:
        return 0
    elif int(PFT) >= 50 and int(PFT) <= 80:
        return 0.5
    elif int(PFT) < 50:
        return 1
    
    #ADJUST
    else:
        return 0
    
def Calcolo_ISQ(ISQ): 

    if int(ISQ) >= 0 and int(ISQ) <= 8:
        return 0
    elif int(ISQ) >= 9 and int(ISQ) <= 18:
        return 0.5
    elif int(ISQ) >= 19 and int(ISQ) <= 28:
        return 1
    
    #ADJUST
    else:
        return 0
       
def Calcolo_BMI(BMI):

    if float(BMI) >= 18.5 and float(BMI) <= 24.9:
        return 0
    elif float(BMI) >= 16 and float(BMI) <= 18.4 or float(BMI) <= 25 and float(BMI) >= 29.9:
        return 0.5
    elif float(BMI) < 16 or float(BMI) >= 30:
        return 1
    
    #ADJUST
    else:
        return 0
      
def Calcolo_Circoferenza_del_polpaccio_W(CDP):

    if int(CDP) > 33:
        return 0
    
    elif float(CDP) >= 28 and float(CDP) <= 33:
        return 0.5
    
    elif float(CDP) < 28:
        return 1
    
    #ADJUST
    else:
        return 0
    
def Calcolo_Circoferenza_del_polpaccio_M(CDP):

    if int(CDP) > 35:
        return 0
    
    elif int(CDP) >= 30 and int(CDP) <= 35:
        return 0.5
    
    elif int(CDP) < 30 and int(CDP) > 28:
        return 1
    
    #ADJUST
    else:
        return 0
    
def Calcolo_WHR_M(WHR):

    if float(WHR) < 0.90:
        return 0
    elif float(WHR) >= 0.90 and float(WHR) <= 1.00:
        return 0.5
    elif float(WHR) > 1.00:
        return 1 
    
    #ADJUST
    else:
        return 0
    
def Calcolo_WHR_W(WHR):

    if float(WHR) < 0.75:
        return 0
    elif float(WHR) >= 0.75 and float(WHR) <= 0.85:
        return 0.5
    elif float(WHR) > 0.85:
        return 1 
    
    #ADJUST
    else:
        return 0
    
def Calcolo_Weist_Height_Ratio(WHR_Ratio):

    if str(WHR_Ratio) == 'Verde':
        return 0 
    elif str(WHR_Ratio) == 'Giallo' or str(WHR_Ratio) == 'Marrone':
        return 0.5
    elif str(WHR_Ratio) == 'Rosso':
        return 1
    
    #ADJUST
    else:
        return 0
      
#DOMIONIO DELLA LOCOMOZIONE
def Calcolo_CST(CST):
  
    if float(CST) > 0.50:
        return 0
    elif float(CST) >= 0.35 and float(CST) <= 0.50:
        return 0.5
    elif float(CST) < 0.35:
        return 1
    
    #ADJUST
    else:
        return 0
       
def Calcolo_GS(GS):
 
    if float(GS) > 1.0:   
        return 0
    elif float(GS) >= 0.6 and float(GS) <= 1.0:
        return 0.5
    elif float(GS) < 0.6 or float(GS) > 1.0:
        return 1
    
    #ADJUST
    else:
        return 0
       
def Calcolo_PPT(PPT):   
 
    if float(PPT) >= 0.50:
        return 0
    elif float(PPT) <= 0.34 and float(PPT) >= 0.49:
        return 0.5
    elif float(PPT) <= 0.20 and float(PPT) >= 0.33: 
        return 0.75
    elif float(PPT) < 0.20:
        return 1
    
    #ADJUST
    else:
        return 0
      
def Calcolo_Sarc_F(SARC_F):

    if float(SARC_F) >= 4:
        return 0
    if float(SARC_F) < 4:
        return 1
    
    #ADJUST
    else:
        return 0
      
def CalcoloPunteggioCapacitaVitale(
        Somma_MMSE, Somma_GDS, Somma_LOC,
        Somma_Vista, Somma_Udito, HGS, PFT,
        ISQ, BMI, CDP, WHR, WHR_Ratio, CST, 
        GS, PPT, SARC_F, gender ):
    
    calcoloCapacitaVitale = 0

    # DOMINIO COGNITIVO
    calcoloCapacitaVitale += Calcolo_Dominio_Cognitivo(Somma_MMSE)

    # DOMINIO PSICOLOGICO
    calcoloCapacitaVitale += Calcolo_GDS(Somma_GDS)
    
    calcoloCapacitaVitale += Calcolo_Locus_of_control(Somma_LOC)

    # DOMINIO SENSORIALE 
    calcoloCapacitaVitale += Calcolo_Vista(Somma_Vista)
    calcoloCapacitaVitale += Calcolo_Udito(Somma_Udito)

    # DOMINIO DELLA VITALITA'
    calcoloCapacitaVitale += Calcolo_HGS(HGS) * 0.286
    calcoloCapacitaVitale += Calcolo_Peak_Flow(PFT) * 0.286
    calcoloCapacitaVitale += Calcolo_ISQ(ISQ) * 0.286
    calcoloCapacitaVitale += Calcolo_BMI(BMI) * 0.286

    if gender == 'M':
        calcoloCapacitaVitale += Calcolo_Circoferenza_del_polpaccio_M(CDP) * 0.286
        calcoloCapacitaVitale += Calcolo_WHR_M(WHR) * 0.286

    if gender == 'F':
        calcoloCapacitaVitale += Calcolo_Circoferenza_del_polpaccio_W(CDP) * 0.286
        calcoloCapacitaVitale += Calcolo_WHR_W(WHR) * 0.286

    calcoloCapacitaVitale += Calcolo_Weist_Height_Ratio(WHR_Ratio) * 0.286

    # DOMINIO DELLA LOCOMOZIONE
    calcoloCapacitaVitale += Calcolo_CST(CST) * 0.5
    calcoloCapacitaVitale += Calcolo_GS(GS) * 0.5
    calcoloCapacitaVitale += Calcolo_PPT(PPT) * 0.5
    calcoloCapacitaVitale += Calcolo_Sarc_F(SARC_F) * 0.5

    return round(calcoloCapacitaVitale, 2)


#result = CalcoloPunteggioCapacitaVitale(26,1,1,7,7,'Strong',95,1,19,36,0.80,'Verde',0.60,1.2,60,4,gender = 'M')

#print(result)