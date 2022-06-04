from channels.auth import AuthMiddlewareStack
from channels.middleware import BaseMiddleware
from api.v1.user.models import User
import jwt
from config import config
from .websocket import parseCookie
from asgiref.sync import sync_to_async

class JwtAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)
        self.inner = inner

    async def __call__(self, scope, receive, send):
        for i in scope['query_string'].split(b"&"):
            temp = i.split(b'=')
            if temp[0] == b'auth':
                try:
                    decode = jwt.decode(temp[1], config['encrypt']['publicKey'], algorithms=["RS256"])
                    cookie = parseCookie(decode.get('session'))
                    if await sync_to_async(User.auth)(None, cookie):
                        scope['uid'] = cookie['uid']
                        return await super(JwtAuthMiddleware, self).__call__(scope, receive, send)
                except Exception as e:
                    raise e
        return



def JWTAuthMiddleware(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))

