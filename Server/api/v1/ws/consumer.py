from utils.websocket import *
from api.v1.request.models import Request as Req
from typing import Dict
from asgiref.sync import sync_to_async

__all__ = ['Request']

methods = {
    "update": Req.update
}

table_list = {
    'request',
    'request_params',
    'request_body',
    'request_headers',
    'request_auth',
    'request_settings',
    'request_test',
    'user',
    'collections',
    'environment',
    "settings"
}


class Request(JsonWebsocket):
    async def response(self, content: Dict = None):
        method = content.pop('method')
        table = content.pop('table')
        print(content)
        if table in table_list:
            try:
                return await sync_to_async(methods[method])(self.scope['uid'], table, **content)
            except Exception as e:
                print(e)
        return False
