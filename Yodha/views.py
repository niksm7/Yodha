from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render, redirect, reverse
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse, FileResponse
import os
import base64
import pyrebase
from cryptography.hazmat.backends import default_backend
from django.contrib import auth
from yodhaapp.models import WebUser,VerificationRequests
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
import ast
import urllib.request
import tempfile


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
    all_hosps = operations_contract.functions.getAllHospitals().call()
    return render(request,'donor/hospitalleads.html',{"all_hosps":all_hosps})

def home(request):
    return render(request,'home.html')

def under_verification(request):
    all_verification_requests = VerificationRequests.objects.filter(donor_id=request.session['uid'])
    
    for verif_requests in all_verification_requests:
        if not verif_requests.is_verified and verif_requests.submitted_string != "":
            user = WebUser.objects.filter(id=request.session['uid'])[0]
            pvt_enc_key = operations_contract.functions.user_to_pvtkey(request.session['uid']).call()
            pvt_key = password_decrypt(pvt_enc_key, request.session["pass"]).decode()
            curr_req_string = base64.b64decode(ast.literal_eval(verif_requests.verification_string)[request.session['uid']])
            pvt_key = PKCS1_OAEP.new(RSA.import_key(pvt_key))
            check_string = pvt_key.decrypt(curr_req_string).decode()

            if check_string == verif_requests.submitted_string:
                verif_requests.is_verified = True
                verif_requests.save()


    all_verification_requests = VerificationRequests.objects.filter(donor_id=request.session['uid'])

    return render(request,'donor/under_verification.html',{"all_verification_requests":all_verification_requests})

def donations(request):
    return render(request,'donor/donations.html')


def hospital_add(request):
    return render(request,'hospital/hospitaladd.html')


def hospital_donation_request(request):
    all_requested_donations = operations_contract.functions.getHospitalRDonations(request.session["uid"]).call()
    all_requests = []
    for donation in all_requested_donations:
        curr_donation = operations_contract.functions.id_to_request_donation(donation).call()
        all_requests.append(curr_donation)
    print(all_requests)
    return render(request,'hospital/hospitaldonationrequest.html',{"all_requests":all_requests})

def hospital_verify_donor(request):
    all_verification_requests = VerificationRequests.objects.filter(hosp_id=request.session['uid'])
    return render(request,'hospital/hospitalverifydonor.html',{"all_verification_requests":all_verification_requests})


def patient_hleads(request):
    return render(request,'patient/hleads.html')

def patient_shop(request, hosp_id):
    all_medicines = operations_contract.functions.getHospitalMedicines(hosp_id).call()
    all_services = operations_contract.functions.getHospitalServices(hosp_id).call()

    medicines_services = []
    for medicine_id in all_medicines:
        med = operations_contract.functions.id_to_medicine(medicine_id).call()
        medicines_services.append(med + ["medicine"])
    
    for service_id in all_services:
        service = operations_contract.functions.id_to_service(service_id).call()
        medicines_services.append(service + ["service"])

    print(medicines_services)
    return render(request,'patient/shop.html',{"medicines_services":medicines_services, "hosp_id":hosp_id})

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
                request.session["pass"] = password

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
                
                if user.user_type == "donor":
                    return redirect(reverse("under_verification"))
                elif user.user_type == "hospital":
                    return redirect(reverse("hospitaldonationrequest"))
                else:
                    return redirect(reverse("patienthleads"))

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
        acc_address = web.toChecksumAddress(request.POST.get("acc_address"))
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


def uploadIPFS(request):
    img_of = request.POST.get("options")
    if img_of == "Medicine":
        addition_image = request.FILES.get("medicine_img")
    else:
        addition_image = request.FILES.get("service_img")
    image_hash = upload_to_ipfs(addition_image)
    return JsonResponse({"image_hash":image_hash})


def sendVerification(request):
    hosp_id = request.GET.get("hosp_id")
    verification_string = "helloworld"
    hosp_public_key = operations_contract.functions.user_to_pubkey(hosp_id).call()
    hosp_public_key = hosp_public_key.encode()
    hosp_public_key  = PKCS1_OAEP.new(RSA.import_key(hosp_public_key))
    hosp_verif_key = base64.b64encode(hosp_public_key.encrypt(verification_string.encode()))

    donor = WebUser.objects.filter(id=request.session['uid'])[0]
    hosp = WebUser.objects.filter(id=request.session['uid'])[0]

    donor_public_key = operations_contract.functions.user_to_pubkey(request.session['uid']).call()
    donor_public_key = donor_public_key.encode()
    donor_public_key  = PKCS1_OAEP.new(RSA.import_key(donor_public_key))
    donor_verif_key = base64.b64encode(donor_public_key.encrypt(verification_string.encode()))

    new_verif_req = VerificationRequests(hosp_id=hosp_id, donor_id=request.session['uid'], hosp_address=hosp.account_address, donor_name=donor.name, hosp_name=hosp.name, verification_string={hosp_id:hosp_verif_key.decode(), request.session['uid']:donor_verif_key.decode()})

    new_verif_req.save()

    return JsonResponse({"Ok":"success"})


def verifyVerificationRequest(request):
    password = request.POST.get("password")
    curr_req_id = int(request.POST.get("curr_req"))
    pvt_enc_key = operations_contract.functions.user_to_pvtkey(request.session['uid']).call()
    pvt_key = password_decrypt(pvt_enc_key, password).decode()
    pvt_key = PKCS1_OAEP.new(RSA.import_key(pvt_key))

    curr_req = VerificationRequests.objects.get(id=curr_req_id)

    curr_req_string = base64.b64decode(ast.literal_eval(curr_req.verification_string)[request.session['uid']])

    check_string = pvt_key.decrypt(curr_req_string).decode()

    curr_req.submitted_string = check_string
    curr_req.save()

    return JsonResponse({"check_string":check_string})


def getPatientdetails(request):
    patient_address = request.POST.get("curr_patient")
    patient_id = WebUser.objects.filter(account_address=patient_address)[0].id
    password = request.POST.get("password")
    pvt_enc_key = operations_contract.functions.user_to_pvtkey(request.session['uid']).call()
    pvt_key = password_decrypt(pvt_enc_key, password).decode()
    pvt_key = PKCS1_OAEP.new(RSA.import_key(pvt_key))

    user = WebUser.objects.filter(id=patient_id)[0]

    all_fkeys = ast.literal_eval(user.fernet_keys)

    enc_fernet_key = base64.b64decode(all_fkeys[request.session['uid']])

    fernet_key = pvt_key.decrypt(enc_fernet_key).decode()

    patient_info = operations_contract.functions.id_to_patient(patient_id).call()

    fernet = Fernet(fernet_key)

    name = str(fernet.decrypt(patient_info[1].encode()).decode())
    age = str(fernet.decrypt(patient_info[2].encode()).decode())
    gender = str(fernet.decrypt(patient_info[3].encode()).decode())
    ipfs_hashes = ast.literal_eval(patient_info[4])


    return JsonResponse({"name":name, "age":age, "gender":gender, "patient_id":patient_info[0], "ipfs_hashes":ipfs_hashes})


def patientShareIdentity(request):

    hosp_id = request.GET.get("hosp_id")

    pvt_enc_key = operations_contract.functions.user_to_pvtkey(request.session['uid']).call()
    pvt_key = password_decrypt(pvt_enc_key, request.session["pass"]).decode()
    pvt_key = PKCS1_OAEP.new(RSA.import_key(pvt_key))

    user = WebUser.objects.filter(id=request.session['uid'])[0]

    all_fkeys = ast.literal_eval(user.fernet_keys)

    enc_fernet_key = base64.b64decode(all_fkeys[request.session['uid']])

    fernet_key = pvt_key.decrypt(enc_fernet_key).decode()

    hosp_public_key = operations_contract.functions.user_to_pubkey(hosp_id).call()
    hosp_public_key = hosp_public_key.encode()
    hosp_public_key  = PKCS1_OAEP.new(RSA.import_key(hosp_public_key))
    hosp_fkey = base64.b64encode(hosp_public_key.encrypt(fernet_key.encode()))

    all_fkeys[hosp_id] = hosp_fkey

    user.fernet_keys = all_fkeys

    user.save()

    return JsonResponse({"success":"ok"})


def getFileIPFS(request, ipfs_hash, patient_id):
    pvt_enc_key = operations_contract.functions.user_to_pvtkey(request.session['uid']).call()
    pvt_key = password_decrypt(pvt_enc_key, request.session["pass"])
    pvt_key = PKCS1_OAEP.new(RSA.import_key(pvt_key))

    user = WebUser.objects.filter(id=patient_id)[0]

    all_fkeys = ast.literal_eval(user.fernet_keys)

    enc_fernet_key = base64.b64decode(all_fkeys[request.session['uid']])

    fernet_key = pvt_key.decrypt(enc_fernet_key).decode()

    data = urllib.request.urlopen("https://ipfs.io/ipfs/{}".format(ipfs_hash))
    file_db = HashFileType.objects.filter(hash_val=ipfs_hash)[0]
    f = tempfile.NamedTemporaryFile(suffix=file_db.suffix_ext, prefix=file_db.prefix_name)
    fer = Fernet(fernet_key)
    decrypted_content = fer.decrypt(data.read())
    f.write(decrypted_content)
    return FileResponse(open(os.path.abspath(f.name) ,'rb'))