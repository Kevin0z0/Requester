from channels.generic.websocket import AsyncJsonWebsocketConsumer, WebsocketConsumer
import uuid
import abc
from typing import Dict, NoReturn
from utils.public.http_response import error

NO_JSON = "No JSON Format"

__all__ = ['JsonWebsocket']

def parseCookie(cookie):
    obj = {}
    for i in cookie.split(';'):
        temp = i.strip().split('=')
        obj[temp[0]] = temp[1]
    return obj


def getHeaders(headers, default='cookie'):
    cookie = None
    for i in headers:
        print(i)
        if i[0] == default.encode():
            cookie = i[1].decode()
            break
    if not cookie:
        return None
    return parseCookie(cookie)


class JsonWebsocket(AsyncJsonWebsocketConsumer):
    # group_name = str(uuid.uuid4())

    async def connect(self, *args, **kwargs):
        await self.channel_layer.group_add(
            self.scope['uid'],
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.scope['uid'],
            self.channel_name
        )

    def getHeaders(self, default='cookie') -> [Dict, NoReturn]:
        return getHeaders(self.scope['headers'], default)

    @abc.abstractmethod
    async def response(self, content=None):
        pass

    async def send_result(self, content=None):
        symbol = content.get('message').pop('symbol')
        data = await self.response(content['message'])
        if not data:
            await self.send_json(error(message='Error', symbol=symbol))
        await self.send_json({
            "message": data,
            "symbol": symbol
        })

    async def receive_json(self, content, **kwargs):
        # await self.channel_layer.send(self.group_name, {
        #     'type': 'send_result',
        #     'message': content
        # })
        await self.channel_layer.group_send(self.scope['uid'], {
            'type': 'send_result',
            'message': content
        })
