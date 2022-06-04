from re import fullmatch
from typing import Dict, Text
from utils.encrypt.user import hmac_sha256
from .models import User, User_Cookie, Settings
from utils.public.http_request import get, post, requireAuth
from utils.public.http_response import Json_Response, Http_Response, error, success
from utils.public.common import get_uid
from utils.type import Request
from config import config

__all__ = ['home', 'test', 'register', 'delete', "login", "logout"]
EMAIL_FORMAT = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}"


def checkEmail(email: Text):
    return fullmatch(EMAIL_FORMAT, email)


@Http_Response
def home(_):
    return '<a href="/api/v1/user">/api/v1/user</a>'


@Json_Response
@post(uid=1)
def test(_, params: Dict):
    print(User_Cookie.create(params['uid']))
    return {}


def set_cookie(cookie, uid):
    return [
        {
            'key': 'session',
            'value': cookie,
            'max_age': config['cookie_age']
        },
        {
            'key': 'uid',
            'value': uid,
            'max_age': config['cookie_age']
        }
    ]


@Json_Response
@post(username='', email='', password='', confirm='', strict=True)
def register(_, params: Dict):
    username = params['username']
    if len(username) < 6:
        return error(message="用户名长度不得少于6个字符")
    if checkEmail(username):
        return error(message="用户名不能为邮箱")

    email = params['email']
    if not checkEmail(email):
        return error(message="邮箱格式错误，请重新填写")

    passwd = params['password']
    if len(passwd) != 32:
        return error(message="fuck you!")
    if passwd != params.pop('confirm'):
        return error(message="两次密码不一致，请确认后注册")

    name = User.objects.filter(username=username)
    if name.exists():
        return error(message="用户名重复，请重新填写")
    user = User.create(username=username, password=passwd, email=email)
    uid = user['user'].uid
    cookie = User_Cookie.create(uid)
    return success({
        "data": {
            'username': params['username'],
            'email': params['email'],
            'uid': uid
        },
        "settings": Settings.get(uid),
        "set_cookie": set_cookie(cookie.cookie, uid)
    })


@Json_Response
@post('username', 'password', strict=True)
def login(request: Request, params: Dict):
    auth = User.auth(request)
    if auth:
        uid = get_uid(request)
        user = User.getUser(int(uid))
        return success({
            "data": {
                "username": user['username'],
                "uid": user['uid'],
                "email": user['email'],
                "profile": config['profile_path'] + '/' + (user['profile'] or 'default.jpg'),
                "description": user['description'],
                "currentRid": user['currentRid'],
                "privateKey": config['encrypt']['privateKey']
            },
            "settings": Settings.get(uid)
        })
    # elif auth is None:
    #     return error(message="cookie过期，请重新登录")
    uname = params['username']
    passwd = params['password']
    if not uname:
        return error(message="请输入用户名")
    if not passwd:
        return error(message="请输入密码")
    user = User.getUser(uname)
    if not user:
        return error(message="用户名或密码错误")
    encPasswd = hmac_sha256(passwd, user['key'])
    if encPasswd != user['password']:
        return error(message="用户名或密码错误")
    uid = user['uid']
    cookie = User_Cookie.create(uid=uid)
    return success({
        "data": {
            "username": uname,
            "uid": uid,
            "email": user['email']
        },
        "settings": Settings.get(uid),
        "set_cookie": set_cookie(cookie.cookie, uid)
    })


@Json_Response
@requireAuth
def logout(request: Request):
    cookie = request.COOKIES.get('session')
    uid = get_uid(request)
    if User_Cookie.deleteCookie(uid, cookie):
        return success()
    return error(message="登出失败")


@Json_Response
@post('current', 'new', 'confirm', strict=True)
@requireAuth
def updatePassword(_, params):
    return {}


@Json_Response
@post('uid')
@requireAuth
def delete(_, params):
    return {
        "data": params
    }
