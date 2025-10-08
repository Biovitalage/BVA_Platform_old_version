# biovitalage_wrapper.py
from typing import Dict, Any
from .bva_runtime import get_bva_model

def calculate_biological_age(
    chronological_age: float,
    *,
    features21: Dict[str, Any],
    return_full: bool = False
):
    """
    Wrapper per il clock GBR+ISO+bin.
    Ritorna int(BA). Se return_full=True, ritorna anche dBA e class.
    """
    M = get_bva_model()
    out = M.predict(inputs=features21, age=float(chronological_age), return_debug=False)
    if return_full:
        return out
    return int(round(out["BA"]))
