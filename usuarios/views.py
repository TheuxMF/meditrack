from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    email    = request.data.get('email')
    password = request.data.get('password')

    if not username or not password or not email:
        return Response(
            {'erro': 'username, email e password são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'erro': 'Username já está em uso'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'erro': 'E-mail já cadastrado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(username=username, email=email, password=password)
    refresh = RefreshToken.for_user(user)

    return Response({
        'mensagem': 'Usuário criado com sucesso',
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'usuario': {'id': user.id, 'username': user.username, 'email': user.email}
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if not user:
        return Response(
            {'erro': 'Credenciais inválidas'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'usuario': {'id': user.id, 'username': user.username, 'email': user.email}
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get('refresh')

    if not refresh_token:
        return Response(
            {'erro': 'Token de refresh é obrigatório'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'mensagem': 'Logout realizado com sucesso'})
    except TokenError:
        return Response(
            {'erro': 'Token inválido ou já expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        'id':       user.id,
        'username': user.username,
        'email':    user.email,
    })