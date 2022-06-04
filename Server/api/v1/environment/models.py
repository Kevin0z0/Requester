from django.db import models
from django.forms.models import model_to_dict
from api.v1.user.models import User


def arr():
    return []


class Environment(models.Model):
    id = models.BigAutoField(primary_key=True, unique=True)
    name = models.TextField()
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        to_field='uid',
        related_name="environment_uid_id",
        db_column='uid',
    )
    createTime = models.DateTimeField(auto_now_add=True)
    value = models.JSONField(default=arr)

    @classmethod
    def add(cls, uid, name):
        return cls.objects.create(user_id=User(uid), name=name)

    @classmethod
    def get(cls, id, uid):
        obj = cls.objects.filter(id=id, user_id=User(uid))
        if obj.exists():
            temp = obj[0]
            return {
                "name": temp.name,
                "creator": temp.user_id.uid,
                "createTime": str(temp.createTime).split('.')[0]
            }
        return {}

    @classmethod
    def getValue(cls, id, uid):
        obj = cls.objects.filter(id=id, user_id=uid)
        if obj.exists():
            return obj[0].value
        return None

    @classmethod
    def all(cls, uid):
        obj = cls.objects.filter(user_id=uid)
        if obj.exists():
            return [model_to_dict(x) for x in obj]
        return []

    @classmethod
    def remove(cls, id, uid):
        obj = cls.objects.filter(id=id, user_id=uid)
        if obj.exists():
            obj.delete()
            return True
        return False

    class Meta:
        db_table = "environment"
