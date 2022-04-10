import imp
from django.contrib import admin
from .models import WebUser, HashFileType, VerificationRequests
# Register your models here.

admin.site.register(WebUser)
admin.site.register(HashFileType)
admin.site.register(VerificationRequests)