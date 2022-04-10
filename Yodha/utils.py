import os
from pathlib import Path
import requests
from dotenv import load_dotenv
from django.core.files.storage import default_storage
from cryptography.fernet import Fernet
from django.core.files.storage import default_storage
from yodhaapp.models import HashFileType
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import secrets
from base64 import urlsafe_b64encode as b64e, urlsafe_b64decode as b64d
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import secrets
import os
import requests
from web3.middleware import geth_poa_middleware
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

infura_url = "https://rinkeby.infura.io/v3/384b2420ae804f5ca4b5d6aa630f3c7b"

web = Web3(Web3.HTTPProvider(infura_url))
web.middleware_onion.inject(geth_poa_middleware, layer=0)

web.eth.default_account = web.eth.account.privateKeyToAccount(os.getenv("PRIVATE_KEY")).address

# Operations
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}

operations_abi = requests.get("https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=0xc3E08895515aBa848ee0A2d01218335B72DB8376&apikey=39MRYT8W4D35AH26BJZVGQ1KK19SR5XWXG", headers=headers).json()['result']

operations_address = "0xc3E08895515aBa848ee0A2d01218335B72DB8376"

operations_contract = web.eth.contract(abi=operations_abi, address=operations_address)

# Token
token_address = "0x29f54D028a811c00bF25cabe3b10BcF774525807"


backend = default_backend()
iterations = 100_000


def upload_to_ipfs(_image):
    ipfs_url = "http://127.0.0.1:5001"
    end_point = "/api/v0/add"
    response = requests.post(ipfs_url + end_point, files={"file": _image})
    ipfs_hash = response.json()["Hash"]
    print(ipfs_hash)
    return ipfs_hash


def upload_to_ipfs_encrypted(_image, fernet_key):
    ipfs_url = "http://127.0.0.1:5001"
    end_point = "/api/v0/add"
    file_name = str(_image).replace(" ","_")
    default_storage.save(file_name, _image)
    file_path = default_storage.path(file_name)
    with open(file_path, "rb") as img_file:
        unencrypted_blob = img_file.read()

    fernet = Fernet(fernet_key)

    encrypted = fernet.encrypt(unencrypted_blob)

    with open(file_path, "wb") as img_file:
        img_file.write(encrypted)
    # upload
    response = requests.post(ipfs_url + end_point, files={"file": encrypted})
    ipfs_hash = response.json()["Hash"]
    print(ipfs_hash)
    return ipfs_hash


# Following three functions are used to encrypt and decrypt private key using password

def _derive_key(password: bytes, salt: bytes, iterations: int = iterations) -> bytes:
    """Derive a secret key from a given password and salt"""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(), length=32, salt=salt,
        iterations=iterations, backend=backend)
    return b64e(kdf.derive(password))


def password_encrypt(message: bytes, password: str, iterations: int = iterations) -> bytes:
    salt = secrets.token_bytes(16)
    key = _derive_key(password.encode(), salt, iterations)
    return b64e(
        b'%b%b%b' % (
            salt,
            iterations.to_bytes(4, 'big'),
            b64d(Fernet(key).encrypt(message)),
        )
    )


def password_decrypt(token: bytes, password: str) -> bytes:
    decoded = b64d(token)
    salt, iter, token = decoded[:16], decoded[16:20], b64e(decoded[20:])
    iterations = int.from_bytes(iter, 'big')
    key = _derive_key(password.encode(), salt, iterations)
    return Fernet(key).decrypt(token)


# Generating new public and private keys
def generate_pub_pvt():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    public_key = private_key.public_key()

    pvt_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    return pvt_pem, pub_pem


def encrypt_upload_docs(all_docs, fernet_key):
    all_uri = []
    for doc in all_docs:
        file_name = str(doc).split(".")
        hash_value = upload_to_ipfs_encrypted(doc, fernet_key)
        all_uri.append(hash_value)
        new_file = HashFileType(hash_val=hash_value, suffix_ext="."+file_name[-1], prefix_name=file_name[0])
        new_file.save()

    return all_uri
