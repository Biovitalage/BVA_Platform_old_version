""" 
    Serializer for API.
"""

from rest_framework import serializers
from BioVitalAge.models import *

## SERAILIZER FOR PATIENTS
class PazienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TabellaPazienti
    
        fields = [
            'id',
            'dottore',
            'codice_fiscale',
            'name',
            'surname',
            'dob',
            'gender',
            'chronological_age',
            'lastVisit',
            'upcomingVisit',
        ]

## SERAILIZER FOR NOTES
class NotaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Nota
        fields = ['id', 'paziente', 'titolo', 'contenuto', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']