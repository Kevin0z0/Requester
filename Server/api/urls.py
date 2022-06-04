from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('', views.home),
    path('v1/', include('api.v1.urls'))

]

__all__ = ['path', 're_path', 'include']