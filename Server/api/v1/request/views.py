from utils.public.http_response import Http_Response, Json_Response, error, success
from utils.type import Request
from typing import Dict
from utils.public.http_request import requireAuth, post
from .models import Request as model
from api.v1.user.models import User
from utils.public.common import get_uid

__all__ = ['home', 'create', 'get', 'delete']


@Http_Response
def home(_):
    return '<a href="/api/v1/request">/api/v1/request</a>'


@Json_Response
@post("showIndex", father_id=None, strict=True)
@requireAuth
def create(request: Request, params: Dict):
    uid = User(get_uid(request))
    try:
        obj = model.create(showIndex=params['showIndex'], father_id=params['father_id'], user_id=uid)
        return success(message=model.get(obj.id, uid, params['showIndex']))
    except Exception as e:
        print(e)
        return error(message="创建失败")


@Json_Response
@post("id", showIndex=False, strict=True)
@requireAuth
def get(request: Request, params: Dict):
    if not params.get('id'):
        return error(message="无参数")
    return success(message=model.get(params['id'], uid=User(get_uid(request)), showIndex=params['showIndex']))


@Json_Response
@post("id", strict=True)
@requireAuth
def delete(request: Request, params: Dict):
    if not id:
        return error(message="无参数")
    if not model.remove(params['id'], get_uid(request)):
        return error(message={
            "changes": 0,
        })
    return success(message={
            "changes": 1,
        })