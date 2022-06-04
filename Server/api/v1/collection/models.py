from django.db import models, connection
from django.db.backends.utils import CursorDebugWrapper
from utils.public.common import db_arr_to_dict
from api.v1.request.models import Request
from api.v1.user.models import User

cid = 0
name = 1
expand = 2
url = 2


def _getItem(cursor: CursorDebugWrapper, id, uid,first=True):
    cursor.execute(f"SELECT cid, name, expand FROM collections WHERE uid = %s AND father_id = %s {'AND cid > 0' if first else ''}",
                   [uid, id])
    value = cursor.fetchall()
    arr = []
    for i in value:
        obj = {
            "name": i[name],
            "id": i[cid],
            "isFolder": True,
            "expand": not not i[expand],
            "father_id": id,
            "hasValue": False
        }
        if i[expand]:
            obj['children'] = _getItem(cursor, i[cid], uid, False)
            obj['hasValue'] = True
        arr.append(obj)
    cursor.execute("SELECT id, name, url FROM request WHERE father_id = %s AND uid = %s", [id, uid])
    for i in cursor.fetchall():
        arr.append(db_arr_to_dict(cursor, i))
    return arr


class Collection(models.Model):
    cid = models.BigAutoField(primary_key=True, unique=True)
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        to_field='uid',
        related_name="collection_uid_id",
        db_column='uid',
    )
    father_id = models.BigIntegerField(null=True)
    name = models.TextField(null=True)
    doc = models.TextField(null=True)
    expand = models.BooleanField(default=0)
    createTime = models.DateTimeField(auto_now_add=True)

    @classmethod
    def get(cls, id, uid):
        with connection.cursor() as cursor:
            return _getItem(cursor, id, uid)

    @classmethod
    def add(cls, name, father_id, uid):
        obj = cls.objects.create(name=name, father_id=father_id, user_id=User(uid))
        return {
            "changes": 1,
            "lastInsertRowid": obj.cid
        }

    @classmethod
    def _delete(cls, id, activeList):
        collection = cls.objects.filter(father_id=id)
        request = Request.objects.filter(father_id=id)
        if collection.exists():
            for i in collection:
                cls._delete(i.cid, activeList)
            collection.delete()

        if request.exists():
            for i in request:
                if not i.showIndex:
                    i.delete()
                else:
                    i.father_id = None
                    activeList.add(i.id)
                    i.save()

    @classmethod
    def remove(cls, id, uid):
        obj = cls.objects.filter(cid=id, user_id=User(uid))
        if obj.exists():
            activeList = set()
            cls._delete(id, activeList)
            obj.delete()
            return list(activeList)
        return False

    class Meta:
        db_table = "collections"
