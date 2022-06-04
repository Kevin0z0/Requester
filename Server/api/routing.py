from django.urls import path
from channels.routing import URLRouter
import api.v1.routing as route

channel_routing = [
    path('ws/', URLRouter(route.channel_routing))
]

__all__ = ['path', 'URLRouter']