from django.urls import path
from .consumer import *

channel_routing = [
    path('request', Request.as_asgi())
]