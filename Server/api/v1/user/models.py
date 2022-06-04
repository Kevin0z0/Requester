import re
import json
from numbers import Number
from django.db import models, connection
from typing import Dict, List, Text
from django.db.models.query import QuerySet
from utils.encrypt.user import create_key, hmac_sha256
from config import config
from utils.public.common import db_arr_to_dict
import time


USER_BASE = "SELECT username, uid, password, email, `key`, description, profile, currentRid FROM user WHERE {} = %s LIMIT 1"


class User(models.Model):
    uid = models.AutoField(primary_key=True, unique=True)
    username = models.CharField(max_length=100, unique=True, db_index=True)
    email = models.CharField(max_length=100, default="")
    description = models.TextField()
    password = models.CharField(max_length=64)
    key = models.CharField(max_length=32)
    registerTime = models.DateTimeField(auto_now_add=True)
    currentRid = models.BigIntegerField(null=True)
    current = models.BigIntegerField(null=True)
    profile = models.CharField(max_length=60)

    REQUIRED_FIELDS = ('uid', 'password', 'key', 'registerTime')
    USERNAME_FIELD = 'username'
    is_anonymous = False
    is_authenticated = True

    @classmethod
    def create(cls, *args, **kwargs) -> Dict:
        key = create_key()
        kwargs['password'] = hmac_sha256(kwargs['password'], key)
        kwargs['key'] = key
        obj = cls.objects.create(*args, **kwargs)
        return {
            "user": obj,
            "settings": Settings.create(obj)
        }

    @classmethod
    def getUser(cls, user: [Number, Text]) -> [Dict, None]:
        with connection.cursor() as cursor:
            if isinstance(user, Number):
                cursor.execute(USER_BASE.format('uid'), [user])
            else:
                cursor.execute(USER_BASE.format('username'), [user])
            row = cursor.fetchone()
            if row:
                return db_arr_to_dict(cursor, row)
            return row

    @classmethod
    def auth(cls, request, cookie=None):
        if cookie is not None:
            cookies = cookie
        else:
            cookies = request.COOKIES
        session = cookies.get('session')
        uid = cookies.get('uid')
        if not session or not uid:
            return False
        data = User_Cookie.objects.filter(cookie=session, user_id=User(uid=uid))
        if not data.exists():
            return False
        value = data.values()[0]
        # this code might cause some error
        if int(time.time()) - int(value.get('loginTime').timestamp()) > config['cookie_age']:
            User_Cookie.deleteCookie(uid=uid, cookie=session)
            return None
        return True

    @classmethod
    def deleteUser(cls, uid: Number):
        obj = cls.objects.get(uid=uid)
        obj.delete()

    class Meta:
        db_table = 'user'


SETTINGS = [
    ['General', 'Request', 'timeout', '0'],
    ["General", "Request", "SSLVerification", "0"],
    ["General", "Request", "noCache", "1"],
    ["General", "Response", "maxResponseSize", "50"],
    ["General", "Response", "redirects", "1"],
    ["Proxies", "Proxy", "custom",'{"active":false,"type":{"HTTP":true,"HTTPS":true},"server":{"ip":"","port":""},"auth":{"value":false,"username":"","password":""},"bypass":""}'],
    ["Proxies", "Proxy", "system", '{"active":false,"auth":{"value":false,"username":"","password":""}}'],
    ["General", "Response", "redirectTimes", "10"],
    ["General", "Request", "acceptEncoding", "1"],
    ["General", "Editor", "minimap", "0"],
    ["General", "Editor", "fontSize", "14"]
]


class Settings(models.Model):
    id = models.BigAutoField(primary_key=True, unique=True)
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        to_field='uid',
        related_name="user_uid_id",
        db_column='uid')
    groupName = models.CharField(max_length=30)
    className = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    value = models.TextField()

    @classmethod
    def create(cls, object: QuerySet) -> List:
        bulk_array = []
        for i in SETTINGS:
            bulk_array.append(Settings(user_id=object,
                                       groupName=i[0],
                                       className=i[1],
                                       name=i[2],
                                       value=i[3]))
        return cls.objects.bulk_create(bulk_array)

    @classmethod
    def get(cls, uid):
        data = cls.objects.filter(user_id=User(uid=uid))
        if data.exists():
            obj = {}
            for item in data.values():
                groupName = item['groupName']
                className = item['className']
                name = item['name']
                value = item['value']
                if groupName not in obj:
                    obj[groupName] = {}
                group = obj[groupName]
                if className not in group:
                    group[className] = {}
                group[className][name] = {
                    "value": json.loads(value) if re.match(r"^[{\[]", value) else value
                }
            return obj
        return {}

    class Meta:
        db_table = 'settings'


class User_Cookie(models.Model):
    cid = models.BigAutoField(primary_key=True, unique=True)
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        to_field='uid',
        related_name="user_cookie_user_id_uid",
        db_column='uid')
    cookie = models.CharField(max_length=64)
    key = models.CharField(max_length=32)
    loginTime = models.DateTimeField(auto_now=True)

    @staticmethod
    def generate(uid: Number):
        user = User.objects.get(uid=uid)
        key = create_key()
        return hmac_sha256(user.password + key, key), key

    @staticmethod
    def saveCookie(object: models, uid: Number):
        cookie, key = User_Cookie.generate(uid)
        object.cookie = cookie
        object.key = key
        object.save()

    @classmethod
    def create(cls, uid: Number):
        user = User(uid=uid)
        obj = cls.objects.filter(user_id=user)
        for i in obj:
            if not i.cookie:
                User_Cookie.saveCookie(i, uid)
                return i

        if len(obj) == config['max_login_device']:
            t = obj[0].loginTime.timestamp()
            item = obj[0]
            for i in obj:
                timestamp = i.loginTime.timestamp()
                if timestamp < t:
                    t = timestamp
                    item = i
            User_Cookie.saveCookie(item, uid)
            return item
        cookie, key = User_Cookie.generate(uid)
        return cls.objects.create(cookie=cookie, user_id=user, key=key)

    @classmethod
    def deleteCookie(cls, uid: Number, cookie: Text):
        obj = cls.objects.get(user_id=User(uid=uid), cookie=cookie)
        if not obj:
            return False
        obj.cookie = ""
        obj.save()
        return True

    class Meta:
        db_table = 'user_cookie'
