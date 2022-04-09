from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render, redirect, reverse
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
import os
import base64
import pyrebase
from cryptography.hazmat.backends import default_backend
from django.contrib import auth
from yodhaapp.models import WebUser
from django.core.files.storage import default_storage
from .utils import *
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import secrets
from base64 import urlsafe_b64encode as b64e, urlsafe_b64decode as b64d
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

config = {
    "apiKey": "AIzaSyDDakZxrvAPUlcGdk4wWFEQu5IyXP0JAJc",
    "authDomain": "yodha-37993.firebaseapp.com",
    "projectId": "yodha-37993",
    "storageBucket": "yodha-37993.appspot.com",
    "messagingSenderId": "400054556198",
    "appId": "1:400054556198:web:c48ee53aa1899f45b478e7",
    "databaseURL": ""
}

firebase = pyrebase.initialize_app(config)
authe = firebase.auth()
storage = firebase.storage()
backend = default_backend()
iterations = 100_000


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

def patient_shop(request):
    return render(request,'patient/shop.html')

def login_page(request):
    return render(request,'login.html')


def handleLogin(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        try:
            user = authe.sign_in_with_email_and_password(email, password)
            if authe.get_account_info(user['idToken'])['users'][0]["emailVerified"] is False:
                try:
                    authe.send_email_verification(user['idToken'])
                    message = "Please verify the email! Link has been sent!"
                    auth.logout(request)
                    authe.current_user = None
                except Exception:
                    message = "Please verify the email! Link has been sent!"
                return render(request, 'login.html', {"msg": message})
            else:
                
                session_id = user['localId']
                request.session['email'] = email
                request.session['usrname'] = email.split("@")[0]
                request.session['uid'] = str(session_id)

                user = WebUser.objects.filter(id=request.session['uid'])[0]

                if not user.added_blockchain:
                    nonce = web.eth.get_transaction_count(web.toChecksumAddress(web.eth.default_account))
                    if user.user_type == "donor":
                        operation_tx = operations_contract.functions.addDonor(user.id, user.name, web.toChecksumAddress(user.account_address), user.public_key, user.private_key).buildTransaction({
                            'chainId': 4,
                            'gas': 7000000,
                            'gasPrice': web.toHex((10**11)),
                            'nonce': nonce,
                        })
                    elif user.user_type == "hospital":
                        operation_tx = operations_contract.functions.addHospital(user.id, user.name, user.hospital_location,  web.toChecksumAddress(user.account_address), user.public_key, user.private_key).buildTransaction({
                            'chainId': 4,
                            'gas': 7000000,
                            'gasPrice': web.toHex((10**11)),
                            'nonce': nonce,
                        })
                    else:
                        operation_tx = operations_contract.functions.addPatient(user.id, user.name, user.age, user.gender, user.proof_hashs,  web.toChecksumAddress(user.account_address), user.public_key, user.private_key).buildTransaction({
                            'chainId': 4,
                            'gas': 7000000,
                            'gasPrice': web.toHex((10**11)),
                            'nonce': nonce,
                        })

                    signed_tx = web.eth.account.sign_transaction(operation_tx, private_key=os.getenv("PRIVATE_KEY"))
                    receipt = web.eth.send_raw_transaction(signed_tx.rawTransaction)
                    web.eth.wait_for_transaction_receipt(receipt)


                    user.added_blockchain = True
                    user.save()

        except Exception as e:
            print(e)
            message = "Invalid Credentials"
            return render(request, 'login.html', {"msg": message})


    return HttpResponseRedirect(reverse("login_page"))


def handleSignUpDonor(request):
    if request.method == "POST":
        name = request.POST.get("fname") + " " + request.POST.get("lname")
        email = request.POST.get("email_add")
        acc_address = request.POST.get("acc_address")
        password = request.POST.get("password")
        new_user = authe.create_user_with_email_and_password(email, password)

        pvt_key, pub_key = generate_pub_pvt()

        pvt_key = password_encrypt(pvt_key, password)

        web_user = WebUser(
            id=new_user["localId"],
            name=name,
            user_email=email,
            public_key=pub_key.decode(),
            private_key=pvt_key.decode(),
            account_address=acc_address)
        web_user.save()

    return HttpResponseRedirect(reverse("login_page"))


def handleSignUpHospital(request):
    if request.method == "POST":
        name = request.POST.get("fname") + " " + request.POST.get("lname")
        email = request.POST.get("email_add")
        acc_address = request.POST.get("acc_address")
        password = request.POST.get("password")
        hospital_location = request.POST.get("location")
        new_user = authe.create_user_with_email_and_password(email, password)

        pvt_key, pub_key = generate_pub_pvt()

        pvt_key = password_encrypt(pvt_key, password)

        fernet_key = Fernet.generate_key()

        public_key = PKCS1_OAEP.new(RSA.import_key(pub_key))

        f_key = base64.b64encode(public_key.encrypt(fernet_key))

        fernet = Fernet(fernet_key)

        web_user = WebUser(
            id=new_user["localId"],
            name=name,
            user_email=email,
            account_address=acc_address,
            hospital_location=fernet.encrypt(hospital_location.encode()).decode(),
            public_key=pub_key.decode(),
            private_key=pvt_key.decode(),
            user_type="hospital",
            fernet_keys={new_user["localId"]: f_key.decode()},
            )
        web_user.save()

    return HttpResponseRedirect(reverse("login_page"))


def handleSignUpPatient(request):
    if request.method == "POST":
        password = request.POST.get("password")

        pvt_key, pub_key = generate_pub_pvt()

        pvt_key = password_encrypt(pvt_key, password)

        fernet_key = Fernet.generate_key()

        public_key = PKCS1_OAEP.new(RSA.import_key(pub_key))

        f_key = base64.b64encode(public_key.encrypt(fernet_key))

        fernet = Fernet(fernet_key)

        name = fernet.encrypt((request.POST.get("fname") + " " + request.POST.get("lname")).encode()).decode()
        email = request.POST.get("email_add")
        acc_address = fernet.encrypt(request.POST.get("acc_address").encode()).decode()
        age = fernet.encrypt(request.POST.get("age").encode()).decode()
        gender = fernet.encrypt(request.POST.get("gender").encode()).decode()
        validation_proofs = request.FILES.getlist("patient_proof")

        all_hashs = encrypt_upload_docs(validation_proofs, fernet_key)

        new_user = authe.create_user_with_email_and_password(email, password)

        email = fernet.encrypt(email.encode()).decode()

        web_user = WebUser(
            id=new_user["localId"],
            name=name,
            user_email=email,
            account_address=acc_address,
            age=age,
            gender=gender,
            public_key=pub_key.decode(),
            private_key=pvt_key.decode(),
            proof_hashs=all_hashs,
            fernet_keys={new_user["localId"]:f_key.decode()},
            user_type="patient"
            )

        web_user.save()

    return HttpResponseRedirect(reverse("login_page"))


def handleLogout(request):
    if request.session.get('uid') is not None:
        auth.logout(request)
        authe.current_user = None
    return HttpResponseRedirect(reverse("login_page"))