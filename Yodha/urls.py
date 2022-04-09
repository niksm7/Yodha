from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from django.conf.urls import include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('donor/hospitalleads',views.hospitalleads,name="hospitalleads"),
    path('',views.home,name="home"),
    path('donor/under-verification',views.under_verification,name="under_verification"),
    path('donations',views.donations,name="donations"),
]+static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
