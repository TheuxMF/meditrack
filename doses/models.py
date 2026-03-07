from django.db import models
from django.contrib.auth.models import User
from medicamentos.models import Medicamento


class RegistroDose(models.Model):
    medicamento      = models.ForeignKey(Medicamento, on_delete=models.CASCADE, related_name='doses')
    usuario          = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doses')
    data_hora_tomada = models.DateTimeField()
    horario_previsto = models.CharField(max_length=5, blank=True)  # ex: "08:00"
    quantidade_tomada = models.DecimalField(max_digits=6, decimal_places=2, default=1)
    no_horario       = models.BooleanField(default=True)
    observacao       = models.TextField(blank=True, default='')
    criado_em        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data_hora_tomada']

    def __str__(self):
        return f"{self.medicamento.nome} — {self.data_hora_tomada:%d/%m/%Y %H:%M}"
