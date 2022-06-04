from django.http import HttpResponse, JsonResponse
from typing import Callable, Dict, NoReturn
from utils.type import Request
from numbers import Number

__all__ = ['Json_Response', 'Http_Response', 'error', 'success']


def _set_cookie(response: HttpResponse, cookie: Dict) -> NoReturn:
    response.set_cookie(cookie['key'],
                        cookie['value'],
                        max_age=cookie.get('max_age'))


def _add_cookie(response: HttpResponse, data: Dict) -> NoReturn:
    if not data:
        return
    if isinstance(data, dict):
        _set_cookie(response, data)
    elif isinstance(data, list):
        for i in data:
            _set_cookie(response, i)


def Json_Response(callback: Callable) -> Callable:
    def res(request: Request) -> [JsonResponse, NoReturn]:
        if isinstance(request, dict):
            return JsonResponse(request, safe=False)
        response = callback(request)
        if isinstance(response, tuple):
            query, data = response
        else:
            data = response
        cookie = None
        status_code = 200
        if 'set_cookie' in data:
            cookie = data.pop('set_cookie')
        if 'status_code' in data:
            status_code = data.pop('status_code')
        http = JsonResponse(data, safe=False, status=status_code)
        _add_cookie(http, cookie)
        return http
    return res


def Http_Response(callback: Callable) -> Callable:
    def res(request: Request) -> HttpResponse:
        response = callback(request)
        if isinstance(response, tuple):
            query, data = response
        else:
            data = response
        if isinstance(data, dict):
            cookie = None
            status_code = 200
            if 'set_cookie' in data:
                cookie = data.pop('set_cookie')
            if 'status_code' in data:
                data.pop('status_code')
            http = HttpResponse(data['text'], status=status_code)
            _add_cookie(http, cookie)
            return http
        return HttpResponse(data)

    return res


def _base_message(code: Number, extra: Dict, send_message: Dict = None) -> Dict:
    if send_message is None:
        send_message = {}
    return {
        "code": code,
        **send_message,
        **extra
    }


def error(send_message: Dict = None, **kwargs) -> Dict:
    return _base_message(0, kwargs, send_message)


def success(send_message: Dict = None, **kwargs) -> Dict:
    return _base_message(200, kwargs, send_message)
