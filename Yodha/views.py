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


