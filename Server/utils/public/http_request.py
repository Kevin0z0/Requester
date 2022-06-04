import json
from utils.type import Request
from typing import Dict, List, Text, Callable, Tuple, Any
from api.v1.user.models import User
from .http_response import error
from utils.public.STATUS import METHOD_NOT_ALLOWED


def _handle_args(arr: Tuple, obj: Dict, existed: Dict = None) -> Dict:
    if existed is None:
        existed = {}
    else:
        # precheck if data in existed dict
        for i in obj:
            if i in existed:
                obj[i] = existed[i]
    for i in arr:
        if i in existed:
            obj[i] = existed[i]
            continue
        if i not in obj:
            obj[i] = None
    return obj


def get(*args, strict = False, **kwargs) -> Callable:
    def handle(callback) -> Callable:
        def req(request: Request) -> [Dict, List, Text]:
            if strict and request.method == 'GET':
                return METHOD_NOT_ALLOWED
            params = _handle_args(args, kwargs)
            for key in params:
                data = request.GET.get(key)
                if data:
                    params[key] = data
            return callback(request, params)
        return req
    return handle


def _getBody(method: Text, request: Request) -> [Dict]:
    if method == 'json':
        try:
            return json.loads(request.body)
        except Exception:
            return {}


def post(*args, receive_method: Text = 'json', strict = False, **kwargs) -> Callable:
    def handle(callback) -> Callable:
        def req(request: Request) -> [Dict, List, Text]:
            if strict and request.method != 'POST':
                return METHOD_NOT_ALLOWED
            body = _getBody(receive_method, request)
            return callback(request, _handle_args(args, kwargs, body))
        return req
    return handle


def requireAuth(callback: Callable) -> Callable:
    def req(request: Request, *args) -> Any:
        if not isinstance(request, Request):
            return request
        if User.auth(request):
            return callback(request, *args)
        return error(message="用户安全性验证失败，请重新登录")
    return req
