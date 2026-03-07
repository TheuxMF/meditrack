from rest_framework import serializers
from .models import RegistroDose


class RegistroDoseSerializer(serializers.ModelSerializer):
    medicamento_nome = serializers.CharField(source='medicamento.nome', read_only=True)

    class Meta:
        model  = RegistroDose
        fields = '__all__'
        read_only_fields = ['usuario', 'criado_em']