import requests

data = {
    "client_id": "ccdd0ce3-ab41-4534-a5e3-98190c993a1b_8ba35711-9459-464d-a8fa-695f6c4dab9d",
    "client_secret": "kXDsQgsq1TVDGJG4rhSh3JQJv3x5nYVD/HuCI/EjFIg=",
    "scope": "icdapi_access",
    "grant_type": "client_credentials"
}

resp = requests.post("https://icdaccessmanagement.who.int/connect/token", data=data)
print(resp.json())