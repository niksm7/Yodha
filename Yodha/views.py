from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseRedirect,HttpResponse


def sidebar(request):
    return render(request,'donations/sidebar.html')

def hospitalleads(request):
    return render(request,'donor/hospitalleads.html')

def home(request):
    return render(request,'home.html')

def under_verification(request):
    return render(request,'donor/under_verification.html')

def donations(request):
    return render(request,'donor/donations.html')



def hospital_add(request):
    return render(request,'hospital/hospitaladd.html')


def hospital_donation_request(request):
    return render(request,'hospital/hospitaldonationrequest.html')

def hospital_verify_donor(request):
    return render(request,'hospital/hospitalverifydonor.html')


def patient_hleads(request):
    return render(request,'patient/hleads.html')