from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegistroDoseViewSet

router = DefaultRouter()
router.register(r'', RegistroDoseViewSet, basename='dose')

urlpatterns = [
    path('', include(router.urls)),
]