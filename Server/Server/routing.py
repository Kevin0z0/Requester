from utils.JWTAuthMiddleware import JWTAuthMiddleware
from channels.routing import ProtocolTypeRouter, URLRouter
import api.routing as route
from django.core.asgi import get_asgi_application
application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': JWTAuthMiddleware(
            URLRouter(
                route.channel_routing
            )
        ),
})