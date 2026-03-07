from rest_framework import serializers
from .models import Medicamento


class MedicamentoSerializer(serializers.ModelSerializer):
    estoque_baixo = serializers.ReadOnlyField()  # vem do @property do model

    class Meta:
        model  = Medicamento
        fields = '__all__'
        read_only_fields = ['usuario', 'criado_em', 'atualizado_em']