from django.http import HttpResponse

def home(request):
    return HttpResponse('<a href="/api">/api</a>')