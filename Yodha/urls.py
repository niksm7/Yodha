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
    path('under-verification',views.under_verification,name="home"),
]+static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
