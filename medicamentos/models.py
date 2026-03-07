from django.db import models
from django.contrib.auth.models import User


class Medicamento(models.Model):
    UNIDADE_CHOICES = [
        ('comprimidos', 'Comprimidos'),
        ('capsulas',    'Cápsulas'),
        ('ml',          'ml'),
        ('gotas',       'Gotas'),
        ('outro',       'Outro'),
    ]

    usuario                = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medicamentos')
    nome                   = models.CharField(max_length=200)
    dosagem                = models.CharField(max_length=100)  # ex: "500mg", "10ml"
    unidade_estoque        = models.CharField(max_length=20, choices=UNIDADE_CHOICES, default='comprimidos')
    quantidade_estoque     = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    alerta_estoque_minimo  = models.PositiveIntegerField(default=5)
    frequencia_diaria      = models.PositiveIntegerField(default=1)  # vezes por dia
    horarios               = models.JSONField(default=list)  # ex: ["08:00", "20:00"]
    observacoes            = models.TextField(blank=True, default='')
    data_inicio            = models.DateField(null=True, blank=True)
    data_fim               = models.DateField(null=True, blank=True)
    ativo                  = models.BooleanField(default=True)
    criado_em              = models.DateTimeField(auto_now_add=True)
    atualizado_em          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.usuario.username})"

    @property
    def estoque_baixo(self):
        return self.quantidade_estoque <= self.alerta_estoque_minimo