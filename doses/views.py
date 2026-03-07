from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import RegistroDose
from .serializers import RegistroDoseSerializer
from medicamentos.models import Medicamento


class RegistroDoseViewSet(viewsets.ModelViewSet):
    serializer_class   = RegistroDoseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = RegistroDose.objects.filter(usuario=self.request.user)

        # Filtros opcionais via query params
        # ex: /api/doses/?medicamento=3&data=2025-01-10
        medicamento_id = self.request.query_params.get('medicamento')
        data           = self.request.query_params.get('data')

        if medicamento_id:
            queryset = queryset.filter(medicamento_id=medicamento_id)
        if data:
            queryset = queryset.filter(data_hora_tomada__date=data)

        return queryset

    def perform_create(self, serializer):
        medicamento = serializer.validated_data['medicamento']

        # Segurança: o remédio deve pertencer ao usuário logado
        if medicamento.usuario != self.request.user:
            raise PermissionError('Medicamento não pertence ao usuário')

        dose = serializer.save(usuario=self.request.user)

        # Desconta do estoque automaticamente
        medicamento.quantidade_estoque -= dose.quantidade_tomada
        if medicamento.quantidade_estoque < 0:
            medicamento.quantidade_estoque = 0
        medicamento.save()

    def destroy(self, request, *args, **kwargs):
        dose = self.get_object()

        # Só pode excluir nas últimas 24 horas
        limite = timezone.now() - timedelta(hours=24)
        if dose.criado_em < limite:
            return Response(
                {'erro': 'Só é possível excluir doses registradas nas últimas 24 horas'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Devolve ao estoque antes de excluir
        med = dose.medicamento
        med.quantidade_estoque += dose.quantidade_tomada
        med.save()

        dose.delete()
        return Response({'mensagem': 'Dose excluída e estoque restaurado'})