from api.urls import *
from .views import *

urlpatterns = [
    path('', home),
    path('create', create),
    path('get', get),
    path('delete', delete)
]