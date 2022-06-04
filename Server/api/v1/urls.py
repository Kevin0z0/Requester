from api.urls import *

urlpatterns = [
    path('user/', include('api.v1.user.urls')),
    path('request/', include('api.v1.request.urls')),
    path('collection/', include('api.v1.collection.urls')),
    path('environment/', include('api.v1.environment.urls')),
]
