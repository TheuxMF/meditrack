from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Medicamento
from .serializers import MedicamentoSerializer


class MedicamentoViewSet(viewsets.ModelViewSet):
    serializer_class   = MedicamentoSerializer
    permission_classes = [IsAuthenticated]

    # Cada usuário só vê os próprios remédios
    def get_queryset(self):
        return Medicamento.objects.filter(usuario=self.request.user)

    # Salva o usuário logado automaticamente ao criar
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    # Soft delete — só desativa, não apaga
    def destroy(self, request, *args, **kwargs):
        medicamento = self.get_object()
        medicamento.ativo = False
        medicamento.save()
        return Response({'mensagem': 'Medicamento desativado com sucesso'})

    # GET /api/medicamentos/hoje/
    @action(detail=False, methods=['get'])
    def hoje(self, request):
        hoje = timezone.localdate()
        medicamentos = self.get_queryset().filter(ativo=True)

        resultado = []
        for med in medicamentos:
            doses_hoje = med.doses.filter(
                data_hora_tomada__date=hoje
            ).values('id', 'horario_previsto', 'data_hora_tomada', 'quantidade_tomada')

            resultado.append({
                'id':              med.id,
                'nome':            med.nome,
                'dosagem':         med.dosagem,
                'horarios':        med.horarios,
                'estoque_baixo':   med.estoque_baixo,
                'quantidade_estoque': float(med.quantidade_estoque),
                'doses_hoje':      list(doses_hoje),
            })

        return Response(resultado)