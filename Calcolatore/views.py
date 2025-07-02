from django.shortcuts import get_object_or_404, render
from django.views import View
from .models import *
from django.shortcuts import redirect
from .utils import *

class CalcolatoreLogin(View):
    def get(self, request):
        return render(request, 'includes/LoginCalcolatore.html')

    def post(self, request):
        emailInput = request.POST['email']
        passwordInput = request.POST['password']
       
        Query = UtentiCredenzialiCalcolatore.objects.all().values()

        for record in Query:  
            if record['email'] == emailInput: 
                if record['password'] == passwordInput:
                    return render(request, 'includes/index.html')  
                else:
                    return render(request, 'includes/login.html', {'error': 'Password errata'}) 

       
        return render(request, 'includes/login.html', {'error': 'Email inserita non valida o non registrata'})



def safe_float(data, key, default=0.0):
    try:
        return float(data.get(key, default))
    except (ValueError, TypeError):
        return default



class CalcoloEtaBiologica(View):
    def get(self, request):
        dottore = get_object_or_404(UtentiCredenzialiCalcolatore, email=request.user.email)

        context = {
            'dottore': dottore,
        }

        return render(request, 'includes/index.html', context)
    def post(self, request):
        data = {key: value for key, value in request.POST.items() if key != 'csrfmiddlewaretoken'}


        chronological_age = int(data.get('chronological_age'))

        d_roms = safe_float(data, 'd_roms')
        osi = safe_float(data, 'osi')
        pat = safe_float(data, 'pat')

        my_acid = safe_float(data, 'my_acid')
        p_acid = safe_float(data, 'p_acid')
        st_acid = safe_float(data, 'st_acid')
        ar_acid = safe_float(data, 'ar_acid')
        beenic_acid = safe_float(data, 'beenic_acid')
        pal_acid = safe_float(data, 'pal_acid')
        ol_acid = safe_float(data, 'ol_acid')
        ner_acid = safe_float(data, 'ner_acid')
        a_linoleic_acid = safe_float(data, 'a_linoleic_acid')
        eico_acid = safe_float(data, 'eico_acid')
        doco_acid = safe_float(data, 'doco_acid')
        lin_acid = safe_float(data, 'lin_acid')
        gamma_lin_acid = safe_float(data, 'gamma_lin_acid')
        dih_gamma_lin_acid = safe_float(data, 'dih_gamma_lin_acid')
        arachidonic_acid = safe_float(data, 'arachidonic_acid')
        sa_un_fatty_acid = safe_float(data, 'sa_un_fatty_acid')
        o3o6_fatty_acid_quotient =  safe_float(data, 'o3o6_fatty_acid_quotient')
        aa_epa = safe_float(data, 'aa_epa ')
        o3_index = safe_float(data, 'o3_index')

        wbc = safe_float(data, 'wbc')
        baso = safe_float(data, 'baso')
        eosi = safe_float(data, 'eosi')
        lymph = safe_float(data, 'lymph')
        mono = safe_float(data, 'mono')
        neut = safe_float(data, 'neut')
        neut_ul = safe_float(data, 'neut_ul')
        lymph_ul = safe_float(data, 'lymph_ul')
        mono_ul = safe_float(data, 'mono_ul')
        eosi_ul = safe_float(data, 'eosi_ul')
        baso_ul = safe_float(data, 'baso_ul')

        mch = safe_float(data, 'mch')
        mchc = safe_float(data, 'mchc')
        mcv = safe_float(data, 'mcv')
        rdwsd = safe_float(data, 'rdwsd')
        rdwcv = safe_float(data, 'rdwcv')
        hct_m = safe_float(data, 'hct_m')
        hct_w = safe_float(data, 'hct_w')
        hgb_m = safe_float(data, 'hgb_m')
        hgb_w = safe_float(data, 'hgb_w')
        rbc_m = safe_float(data, 'rbc_m')
        rbc_w = safe_float(data, 'rbc_w')

        azotemia = safe_float(data, 'azotemia')
        uric_acid = safe_float(data, 'uric_acid')
        creatinine_m = safe_float(data, 'creatinine_m')
        creatinine_w = safe_float(data, 'creatinine_w')
        uricemy_m = safe_float(data, 'uricemy_m')
        uricemy_w = safe_float(data, 'uricemy_w')
        cistatine_c = safe_float(data, 'cistatine_c')

        plt = safe_float(data, 'plt')
        mpv = safe_float(data, 'mpv')
        plcr = safe_float(data, 'plcr')
        pct = safe_float(data, 'pct')
        pdw = safe_float(data, 'pdw')
        d_dimero = safe_float(data, 'd_dimero')
        pai_1 = safe_float(data, 'pai_1')

        tot_chol = safe_float(data, 'tot_chol')
        ldl_chol = safe_float(data, 'ldl_chol')
        hdl_chol_m = safe_float(data, 'hdl_chol_m')
        hdl_chol_w = safe_float(data, 'hdl_chol_w')
        trigl = safe_float(data, 'trigl')

        na = safe_float(data, 'na')
        k = safe_float(data, 'k')
        mg = safe_float(data, 'mg')
        ci = safe_float(data, 'ci')
        ca = safe_float(data, 'ca')
        p = safe_float(data, 'p')

        dhea_m = safe_float(data, 'dhea_m')
        dhea_w = safe_float(data, 'dhea_w')
        testo_m = safe_float(data, 'testo_m')
        testo_w = safe_float(data, 'testo_w')
        tsh = safe_float(data, 'tsh')
        ft3 = safe_float(data, 'ft3')
        ft4 = safe_float(data, 'ft4')
        beta_es_m = safe_float(data, 'beta_es_m')
        beta_es_w = safe_float(data, 'beta_es_w')
        prog_m = safe_float(data, 'prog_m')
        prog_w = safe_float(data, 'prog_w')

        fe = safe_float(data, 'fe')
        transferrin = safe_float(data, 'transferrin')
        ferritin_m = safe_float(data, 'ferritin_m')
        ferritin_w = safe_float(data, 'ferritin_w')

        glicemy = safe_float(data, 'glicemy')
        insulin = safe_float(data, 'insulin')
        homa = safe_float(data, 'homa')
        ir = safe_float(data, 'ir')

        albuminemia = safe_float(data, 'albuminemia')
        tot_prot = safe_float(data, 'tot_prot')
        tot_prot_ele = safe_float(data, 'tot_prot_ele')
        albumin_ele = safe_float(data, 'albumin_ele')
        a_1 = safe_float(data, 'a_1')
        a_2 = safe_float(data, 'a_2')
        b_1 = safe_float(data, 'b_1')
        b_2 = safe_float(data, 'b_2')
        gamma = safe_float(data, 'gamma')
        albumin_dI = safe_float(data, 'albumin_dI')
        a_1_dI = safe_float(data, 'a_1_dI')
        a_2_dI = safe_float(data, 'a_2_dI')
        b_1_dI = safe_float(data, 'b_1_dI')
        b_2_dI = safe_float(data, 'b_2_dI')
        gamma_dI = safe_float(data, 'gamma_dI')
        ag_rap = safe_float(data, 'ag_rap')
              
        got_m = safe_float(data, 'got_m')
        got_w = safe_float(data, 'got_w')
        gpt_m = safe_float(data, 'gpt_m')
        gpt_w = safe_float(data, 'gpt_w')
        g_gt_m = safe_float(data, 'g_gt_w')
        g_gt_w = safe_float(data, 'g_gt_w')
        a_photo_m = safe_float(data, 'a_photo_m')
        a_photo_w = safe_float(data, 'a_photo_w')
        tot_bili = safe_float(data, 'tot_bili')
        direct_bili = safe_float(data, 'direct_bili')
        indirect_bili = safe_float(data, 'indirect_bili')
                 
        ves = safe_float(data, 'ves')
        pcr_c = safe_float(data, 'pcr_c')

        tnf_a = safe_float(data, 'tnf_a')
        inter_6 = safe_float(data, 'inter_6')
        inter_10 = safe_float(data, 'inter_10')

        scatolo = safe_float(data, 'scatolo')
        indicano = safe_float(data, 'indicano')

        s_weight = safe_float(data, 's_weight')
        ph = safe_float(data, 'ph')
        proteins_ex = safe_float(data, 'proteins_ex')
        blood_ex = safe_float(data, 'blood_ex')
        ketones = safe_float(data, 'ketones')
        uro = safe_float(data, 'uro')
        bilirubin_ex = safe_float(data, 'bilirubin_ex')
        leuc = safe_float(data, 'leuc')
        glucose = safe_float(data, 'glucose')

        shbg_m = safe_float(data, 'shbg_m')
        shbg_w = safe_float(data, 'shbg_w')
        nt_pro = safe_float(data, 'nt_pro')
        v_b12 = safe_float(data, 'v_b12')
        v_d = safe_float(data, 'v_d')
        ves2 = safe_float(data, 'ves2')

        telotest = safe_float(data, 'telotest')


        exams = []

        if data.get('gender') == 'M':

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

        if data.get('gender') == 'F':
                        
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

  
                    # Calcolo dell'età biologica
                    
                    
        biological_age = calculate_biological_age(
                        chronological_age, d_roms = d_roms, osi = osi, pat = pat, wbc = wbc, basophils = baso_ul,
                        eosinophils = eosi, lymphocytes = lymph, monocytes = mono, neutrophils = neut, rbc = rbc_m, hgb = hgb_m, 
                        hct = hct_m, mcv = mcv, mch = mch, mchc = mchc, rdw = rdwsd, exams = exams, gender=data.get('gender')
        )

        datiSalvati = TabellaPazienti(
                        name = data.get('name'),
                        surname = data.get('surname'),
                        dob = data.get('dob'),
                        gender = data.get('gender'),
                        province = data.get('province'),
                        place_of_birth = data.get('place_of_birth'),
                        codice_fiscale = data.get('codice_fiscale'),
                        chronological_age = data.get('chronological_age'),
                        

                        d_roms=d_roms,
                        osi=osi,
                        pat=pat,

                        my_acid=my_acid,
                        p_acid=p_acid,
                        st_acid=st_acid,
                        ar_acid=ar_acid,
                        beenic_acid=beenic_acid,
                        pal_acid=pal_acid,
                        ol_acid=ol_acid,
                        ner_acid=ner_acid,
                        a_linoleic_acid=a_linoleic_acid,
                        eico_acid=eico_acid,
                        doco_acid=doco_acid,
                        lin_acid=lin_acid,
                        gamma_lin_acid=gamma_lin_acid,
                        dih_gamma_lin_acid=dih_gamma_lin_acid,
                        arachidonic_acid=arachidonic_acid,
                        sa_un_fatty_acid=sa_un_fatty_acid,
                        o3o6_fatty_acid_quotient = o3o6_fatty_acid_quotient,
                        aa_epa = aa_epa,
                        o3_index = o3_index,

                        wbc=wbc,
                        baso=baso,
                        eosi=eosi,
                        lymph=lymph,
                        mono=mono,
                        neut=neut,
                        neut_ul=neut_ul,
                        lymph_ul=lymph_ul,
                        mono_ul=mono_ul,
                        eosi_ul=eosi_ul,
                        baso_ul=baso_ul,

                        mch=mch,
                        mchc=mchc,
                        mcv=mcv,
                        rdwsd=rdwsd,
                        rdwcv=rdwcv,
                        hct_m=hct_m,
                        hct_w=hct_w,
                        hgb_m=hgb_m,
                        hgb_w=hgb_w,
                        rbc_m=rbc_m,
                        rbc_w=rbc_w,

                        azotemia=azotemia,
                        uric_acid=uric_acid,
                        creatinine_m=creatinine_m,
                        creatinine_w=creatinine_w,
                        uricemy_m=uricemy_m,
                        uricemy_w=uricemy_w,
                        cistatine_c=cistatine_c,

                        plt=plt,
                        mpv=mpv,
                        plcr=plcr,
                        pct=pct,
                        pdw=pdw,
                        d_dimero=d_dimero,
                        pai_1=pai_1,

                        tot_chol=tot_chol,
                        ldl_chol=ldl_chol,
                        hdl_chol_m=hdl_chol_m,
                        hdl_chol_w=hdl_chol_w,
                        trigl=trigl,

                        na=na,
                        k=k,
                        mg=mg,
                        ci=ci,
                        ca=ca,
                        p=p,

                        dhea_m=dhea_m,
                        dhea_w=dhea_w,
                        testo_m=testo_m,
                        testo_w=testo_w,
                        tsh=tsh,
                        ft3=ft3,
                        ft4=ft4,
                        beta_es_m=beta_es_m,
                        beta_es_w=beta_es_w,
                        prog_m=prog_m,
                        prog_w=prog_w,

                        fe=fe,
                        transferrin=transferrin,
                        ferritin_m=ferritin_m,
                        ferritin_w=ferritin_w,

                        glicemy=glicemy,
                        insulin=insulin,
                        homa=homa,
                        ir=ir,

                        albuminemia=albuminemia,
                        tot_prot=tot_prot,
                        tot_prot_ele=tot_prot_ele,
                        albumin_ele=albumin_ele,
                        a_1=a_1,
                        a_2=a_2,
                        b_1=b_1,
                        b_2=b_2,
                        gamma=gamma,
                        albumin_dI=albumin_dI,
                        a_1_dI=a_1_dI,
                        a_2_dI=a_2_dI,
                        b_1_dI=b_1_dI,
                        b_2_dI=b_2_dI,
                        gamma_dI=gamma_dI,
                        ag_rap=ag_rap,
                      
                        got_m=got_m,
                        got_w=got_w,
                        gpt_m=gpt_m,
                        gpt_w=gpt_w,
                        g_gt_m=g_gt_m,
                        g_gt_w = g_gt_w,    
                        a_photo_m=a_photo_m,
                        a_photo_w=a_photo_w,
                        tot_bili=tot_bili,
                        direct_bili=direct_bili,
                        indirect_bili=indirect_bili,
                       
                        ves=ves,
                        pcr_c=pcr_c,

                        tnf_a=tnf_a,
                        inter_6=inter_6,
                        inter_10=inter_10,

                        scatolo=scatolo,
                        indicano=indicano,

                        s_weight=s_weight,
                        ph=ph,
                        proteins_ex=proteins_ex,
                        blood_ex=blood_ex,
                        ketones=ketones,
                        uro=uro,
                        bilirubin_ex=bilirubin_ex,
                        leuc=leuc,
                        glucose=glucose,

                        shbg_m=shbg_m,
                        shbg_w=shbg_w,
                        nt_pro=nt_pro,
                        v_b12=v_b12,
                        v_d=v_d,
                        ves2=ves2,
                        
                        telotest=telotest,

                        biological_age= biological_age,
            )
        
        datiSalvati.save()

        demo = get_object_or_404(UtentiCredenzialiCalcolatore, email=request.user.email)
        
        context = {
                    "show_modal": True,
                    "biological_age": biological_age,
                    "data": data,
                    "demo": demo,
        }


        return render(request, 'includes/index.html', context)