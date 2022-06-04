from django.db import models, connection
from django.forms.models import model_to_dict
from utils.public.common import db_arr_to_dict
from numbers import Number
from typing import List, Dict, Tuple
import json
from api.v1.user.models import User


def none():
    return 'none'


def search(rid, uid, table, *args, getAll=False):
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT {', '.join(args)} from {table} WHERE rid = %s AND uid = %s", [rid, uid])
        if getAll:
            row = cursor.fetchall()
            return [db_arr_to_dict(cursor, i) for i in row]
        row = cursor.fetchone()
        return db_arr_to_dict(cursor, row)


def to_string(obj):
    if isinstance(obj, list) or isinstance(obj, dict):
        return json.dumps(obj)
    return obj


def dict_to_list(obj: Dict) -> Tuple:
    array = ([], [])
    for i, j in obj.items():
        array[0].append(f"{to_string(i)} = %s")
        array[1].append(to_string(j))
    return array


GET_QUERY = "SELECT id, showIndex, name, url, requestMethod, star, father_id FROM request WHERE uid = %s AND showIndex"


class Request(models.Model):
    id = models.BigAutoField(primary_key=True, unique=True)
    name = models.TextField(null=True)
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        to_field='uid',
        related_name="user_uid_creator",
        db_column='uid')
    url = models.TextField(null=True, default='')
    bodyType = models.CharField(max_length=40, default='none')
    environment = models.BigIntegerField(null=True)
    star = models.BooleanField(default=False)
    description = models.TextField(null=True)
    father_id = models.BigIntegerField(null=True)
    showIndex = models.IntegerField(null=True)
    authentication = models.CharField(max_length=30, default="none")
    resultFormat = models.CharField(max_length=30, default='Auto')
    requestMethod = models.CharField(max_length=100, default='GET')
    createTime = models.DateTimeField(auto_now_add=True)
    modifyTime = models.DateTimeField(auto_now=True)

    @classmethod
    def create(cls, *args, **kwargs):
        obj = cls.objects.create(*args, **kwargs)
        uid = kwargs['user_id'].uid
        Request_Param.create(rid=obj, uid=uid)
        Request_Body.create(rid=obj, uid=uid)
        Request_Auth.create(rid=obj, uid=uid)
        Request_Headers.create(rid=obj, uid=uid)
        Request_Settings.create(rid=obj, uid=uid)
        Request_Test.create(rid=obj, uid=uid)
        return obj

    @classmethod
    def get(cls, rid, uid, showIndex: [bool, Number] = False) -> List:
        data = cls.objects.get(id=rid, user_id=uid)
        uid = uid.uid
        temp = model_to_dict(data)
        temp['createTime'] = str(data.createTime).split('.')[0]
        array = [
            temp,
            Request_Param.get(rid=rid, uid=uid),
            Request_Body.get(rid=rid, uid=uid),
            Request_Headers.get(rid=rid, uid=uid),
            Request_Auth.get(rid=rid, uid=uid),
            Request_Settings.get(rid=rid, uid=uid),
            Request_Test.get(rid=rid, uid=uid)
        ]

        print(showIndex)
        if isinstance(showIndex, bool) and not showIndex:
            return array
        with connection.cursor() as cursor:
            if isinstance(showIndex, bool) and showIndex:
                cursor.execute(GET_QUERY + " IS NOT NULL order by showIndex DESC", [uid])
                row = cursor.fetchall()
                array.append([db_arr_to_dict(cursor, i) for i in row])
            elif isinstance(showIndex, Number):
                cursor.execute(GET_QUERY + "= %s", [uid, showIndex])
                array.append(db_arr_to_dict(cursor, cursor.fetchone()))
        return array

    @classmethod
    def update(cls, uid, table, args, where):
        updateArg = dict_to_list(args)
        whereArg = dict_to_list(where)
        with connection.cursor() as cursor:
            cursor.execute(
                f'UPDATE {table} SET {",".join(updateArg[0])} WHERE {" AND ".join(whereArg[0])} AND uid = %s',
                (*updateArg[1], *whereArg[1], uid)
            )
            return {
                "changes": cursor.rowcount,
                "lastInsertRowid": cursor.lastrowid
            }

    @classmethod
    def remove(cls, id, uid):
        obj = cls.objects.filter(id=id, user_id=User(uid))
        if obj.exists():
            return obj.delete()
        return False

    class Meta:
        db_table = "request"


def arr():
    return []


def dic():
    return {}


class Request_Param(models.Model):
    pid = models.BigAutoField(primary_key=True, unique=True)
    rid = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        to_field='id',
        related_name="params_rid_id",
        db_column='rid')
    value = models.JSONField(default=arr)
    uid = models.IntegerField()

    @classmethod
    def create(cls, *args, **kwargs):
        return cls.objects.create(*args, **kwargs)

    @classmethod
    def get(cls, rid, uid):
        return search(rid, uid, 'request_params', 'pid', 'value')

    class Meta:
        db_table = "request_params"


class Request_Body(models.Model):
    bid = models.BigAutoField(primary_key=True, unique=True)
    rid = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        to_field='id',
        related_name="body_rid_id",
        db_column='rid')
    type = models.CharField(max_length=30)
    value = models.JSONField(default=arr)
    uid = models.IntegerField()

    @classmethod
    def create(cls, *args, **kwargs):
        array = []
        name = {
            "x-www-form-urlencoded": [],
            "form-data": [],
            "raw": {"type": "Text", "value": ""},
            "binary": {"file": ""}
        }
        for i, j in name.items():
            array.append(cls.objects.create(type=i, value=j, *args, **kwargs))
        return array

    @classmethod
    def get(cls, rid, uid):
        return search(rid, uid, 'request_body', 'bid', 'type', 'value', getAll=True)

    class Meta:
        db_table = "request_body"


class Request_Auth(models.Model):
    aid = models.BigAutoField(primary_key=True, unique=True)
    rid = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        to_field='id',
        related_name="auth_rid_id",
        db_column='rid')
    type = models.CharField(max_length=30)
    value = models.JSONField(default=dic)
    uid = models.IntegerField()

    @classmethod
    def create(cls, *args, **kwargs):
        array = []
        name = ["basic", "bearer", "api-key", "digest"]

        for i in name:
            array.append(cls.objects.create(type=i, *args, **kwargs))
        return array

    @classmethod
    def get(cls, rid, uid):
        return search(rid, uid, 'request_auth', 'aid', 'type', 'value', getAll=True)

    class Meta:
        db_table = "request_auth"


class Request_Headers(models.Model):
    hid = models.BigAutoField(primary_key=True, unique=True)
    rid = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        to_field='id',
        related_name="headers_rid_id",
        db_column='rid')
    defaultValue = models.IntegerField(default=31)
    value = models.JSONField(default=arr)
    uid = models.IntegerField()

    @classmethod
    def create(cls, *args, **kwargs):
        return cls.objects.create(*args, **kwargs)

    @classmethod
    def get(cls, rid, uid):
        return search(rid, uid, 'request_headers', 'hid', 'value', 'defaultValue')

    class Meta:
        db_table = "request_headers"


class Request_Settings(models.Model):
    sid = models.BigAutoField(primary_key=True, unique=True)
    rid = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        to_field='id',
        related_name="settings_rid_id",
        db_column='rid')
    value = models.JSONField(default=dic)
    uid = models.IntegerField()

    @classmethod
    def create(cls, *args, **kwargs):
        return cls.objects.create(*args, **kwargs)

    @classmethod
    def get(cls, rid, uid):
        return search(rid, uid, 'request_settings', 'sid', 'value')

    class Meta:
        db_table = "request_settings"


class Request_Test(models.Model):
    tid = models.BigAutoField(primary_key=True, unique=True)
    rid = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        to_field='id',
        related_name="test_rid_id",
        db_column='rid')
    pretest = models.TextField(null=True)
    test = models.TextField(null=True)
    uid = models.IntegerField()

    @classmethod
    def create(cls, *args, **kwargs):
        return cls.objects.create(*args, **kwargs)

    @classmethod
    def get(cls, rid, uid):
        return search(rid, uid, 'request_test', 'tid', 'pretest', 'test')

    class Meta:
        db_table = "request_test"
