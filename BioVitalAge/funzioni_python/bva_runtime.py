# bva_runtime.py
from pathlib import Path
from django.conf import settings
from .calcolo_eta_biologica import BioVitalAgeModel

_MODEL = None

def get_bva_model() -> BioVitalAgeModel:
    global _MODEL
    if _MODEL is None:
        model_path = Path(settings.BASE_DIR) / "models" / "bva_gbr_v1.json"
        _MODEL = BioVitalAgeModel.from_file(str(model_path))
    return _MODEL
