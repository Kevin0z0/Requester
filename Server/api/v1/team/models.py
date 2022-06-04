from django.db import models

# Create your models here.
class Team(models.Model):
    tid = models.AutoField(primary_key=True, unique=True)
    teamName = models.CharField(max_length=100, unique=True, db_index=True)
    createTime = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "team"