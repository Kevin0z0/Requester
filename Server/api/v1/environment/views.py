import json
from typing import Dict
from utils.type import Request
from .models import Environment
from utils.public.http_request import post, requireAuth
from utils.public.http_response import Json_Response, success, error
from utils.public.common import get_uid


@Json_Response
@post("id", strict=True)
@requireAuth
def getValue(request: Request, params: Dict):
    data = Environment.getValue(int(params['id']), get_uid(request))
    print(json.dumps(data))
    return success(message={
        "value": json.dumps(data)
    })


@Json_Response
@post("id", strict=True)
@requireAuth
def get(request: Request, params: Dict):
    return success(message=Environment.get(int(params['id']), get_uid(request)))


@Json_Response
@post(name="New Environment", strict=True)
@requireAuth
def add(request: Request, params: Dict):
    obj = Environment.add(get_uid(request), params['name'])
    return success(message={"count": 1, "lastInsertRowid": obj.id})


@Json_Response
@post(strict=True)
@requireAuth
def all(request: Request, _):
    obj = Environment.all(get_uid(request))
    return success(message=obj)


@Json_Response
@post("id", strict=True)
@requireAuth
def delete(request: Request, params: Dict):
    return success(message={
        "changes": 1 if Environment.remove(params['id'], get_uid(request)) else 0
    })
