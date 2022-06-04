from utils.public.http_response import Json_Response, success, error
from utils.public.http_request import post, requireAuth
from utils.type import Request
from typing import Dict
from .models import Collection
from utils.public.common import get_uid


@Json_Response
@post("id", strict=True)
@requireAuth
def get(request: Request, params: Dict):
    data = Collection.get(params['id'], get_uid(request))
    print(data)
    return success(message=data)


@Json_Response
@post("name", father_id=0, strict=True)
@requireAuth
def add(request: Request, params: Dict):
    return success(message=Collection.add(params['name'], params['father_id'], get_uid(request)))


@Json_Response
@post("id", strict=True)
@requireAuth
def remove(request: Request, params: Dict):
    data = Collection.remove(params['id'], get_uid(request))
    if data != False:
        return success(message={
            "message": "Collection delete successful",
            "activeList": data
        })
    return error(message="Collection delete failed")
