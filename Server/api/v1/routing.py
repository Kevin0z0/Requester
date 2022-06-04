from api.routing import *
import api.v1.ws.routing as route

channel_routing = [
    path('v1', URLRouter(route.channel_routing))
]