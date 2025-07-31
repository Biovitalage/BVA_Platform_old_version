
import os
import requests
from dotenv import load_dotenv

load_dotenv() 

def get_icd11_token():
    url = "https://icdaccessmanagement.who.int/connect/token"
    data = {
        "client_id": os.getenv("ICD_CLIENT_ID"),
        "client_secret": os.getenv("ICD_CLIENT_SECRET"),
        "scope": "icdapi_access",
        "grant_type": "client_credentials"
    }
    resp = requests.post(url, data=data)
    resp.raise_for_status()
    return resp.json()["access_token"]


def search_icd11_entities(query, token):
    url = "https://id.who.int/icd/entity/search"
    params = {
        "q": query,
        "linearization": "icd11-mms",
        "releaseId": "2024-01" 
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept-Language": "it" 
    }
    resp = requests.get(url, params=params, headers=headers)
    resp.raise_for_status()
    return resp.json()