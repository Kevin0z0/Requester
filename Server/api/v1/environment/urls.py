from api.urls import *
from .views import *

urlpatterns = [
    path('get', get),
    path('add', add),
    path('getvalue', getValue),
    path('all', all),
    path('delete',delete),
]