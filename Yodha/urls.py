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
    path('hospital/hospitaladd',views.hospital_add,name="hospitaladd"),
    path('hospital/hospitaldonationrequest',views.hospital_donation_request,name="hospitaldonationrequest"),
    path('hospital/hospitalverifydonor',views.hospital_verify_donor,name="hospitalverifydonor"),
    path('patient/patienthleads',views.patient_hleads,name="patienthleads")
]+static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
