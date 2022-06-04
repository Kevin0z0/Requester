from api.urls import *
from .views import *


urlpatterns = [
    path('', home),
    path('register', register),
    path('test', test),
    path('delete', delete),
    path('login', login),
    path('logout', logout)
]