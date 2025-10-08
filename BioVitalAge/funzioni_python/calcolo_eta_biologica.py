# biovitalage.py
from __future__ import annotations
from typing import Dict, Any, List
import json

FEATURES_21: List[str] = [
    "SBP","DBP","BMI","WAIST",
    "WBC","RBC","HGB","HCT","MCV","RDW","PLT",
    "ALB","AST","ALT","GGT",
    "BUN","CREA","GLU","HBA1C","TC","TG"
]

ALIASES = {"Azotemia": "BUN"}  

class BioVitalAgeModel:
    """
    Inferenza per il clock BioVitalAge (GBR Huber + calibrazione isotona + bias per bin 5 anni).
    Compatibile con il modello serializzato in JSON (chiavi: features, init_constant, learning_rate,
    trees[], iso_x, iso_y, bin_starts, bin_bias).
    """
    def __init__(self, model: Dict[str, Any]):
        self.M = model
        if "features" not in model or "trees" not in model:
            raise ValueError("JSON del modello non valido: mancano 'features' o 'trees'.")
        if model["features"] != FEATURES_21:
            raise ValueError("Le 'features' del modello non corrispondono alle 21 attese.")
        self.features = model["features"]

    @classmethod
    def from_json(cls, s: str) -> "BioVitalAgeModel":
        return cls(json.loads(s))

    @classmethod
    def from_file(cls, path: str, encoding: str = "utf-8") -> "BioVitalAgeModel":
        with open(path, "r", encoding=encoding) as f:
            return cls(json.load(f))

    @staticmethod
    def _tree_predict(tr: Dict[str, Any], fv: List[float]) -> float:
        node = 0
        while True:
            L = tr["children_left"][node]
            R = tr["children_right"][node]
            if L == -1 and R == -1:
                return float(tr["value"][node])
            feat = tr["feature"][node]
            thr  = tr["threshold"][node]
            node = L if fv[feat] <= thr else R

    def _gbr_raw(self, fv: List[float]) -> float:
        s  = float(self.M.get("init_constant", 0.0))
        lr = float(self.M.get("learning_rate", 0.1))
        for tr in self.M["trees"]:
            s += lr * self._tree_predict(tr, fv)
        return float(s)

    def _iso(self, r: float) -> float:
        X = self.M.get("iso_x", [])
        Y = self.M.get("iso_y", [])
        if not X:
            return float(r)
        if r <= X[0]:
            return float(Y[0])
        if r >= X[-1]:
            return float(Y[-1])
        lo, hi = 0, len(X) - 1
        while hi - lo > 1:
            mid = (lo + hi) // 2
            if r >= X[mid]:
                lo = mid
            else:
                hi = mid
        x0, x1 = X[lo], X[hi]
        y0, y1 = Y[lo], Y[hi]
        t = (r - x0) / (x1 - x0)
        return float(y0 + t * (y1 - y0))

    def _bin_bias(self, age: float) -> float:
        starts = self.M.get("bin_starts", [])
        vals   = self.M.get("bin_bias", [])
        if not starts:
            return 0.0
        idx = 0
        for i, s in enumerate(starts):
            if age >= s:
                idx = i
        return float(vals[idx])

    def predict(self, inputs: Dict[str, float], age: float, *, return_debug: bool = False):
        """
        Calcola Età Biologica (BA), ΔBA e classe.
        'inputs' deve contenere i 21 marcatori nelle unità standard. Accetta 'Azotemia' come alias per 'BUN'.
        """
        vals = dict(inputs)
        if "Azotemia" in vals and "BUN" not in vals:
            vals["BUN"] = vals["Azotemia"]

        missing = [k for k in self.features if k not in vals or vals[k] is None]
        if missing:
            raise ValueError(f"Mancano i campi obbligatori: {', '.join(missing)}")

        try:
            fv = [float(vals[k]) for k in self.features]
        except Exception as e:
            raise ValueError(f"Impossibile convertire in float uno o più valori: {e}")

        raw = self._gbr_raw(fv)
        cal = self._iso(raw)
        BA  = cal - self._bin_bias(float(age))
        dBA = BA - float(age)
        cls = "fast" if dBA > 5 else ("slow" if dBA < -5 else "normal")

        out = {"BA": round(BA, 6), "dBA": round(dBA, 6), "class": cls}
        if return_debug:
            out.update(raw=round(raw, 6), cal=round(cal, 6))
        return out
