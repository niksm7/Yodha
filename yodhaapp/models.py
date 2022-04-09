from django.db import models

# Create your models here.


class WebUser(models.Model):
    id = models.TextField(primary_key=True)
    name = models.CharField(max_length=500, null=True, blank=True)
    age = models.TextField(null=True, blank=True)
    gender = models.TextField(null=True, blank=True)
    account_address = models.CharField(max_length=400, null=True, blank=True)
    hospital_location = models.TextField(null=True, blank=True)
    user_email = models.CharField(max_length=400)
    added_blockchain = models.BooleanField(default=False)
    proof_hashs = models.TextField(null=True, blank=True)
    fernet_keys = models.TextField(null=True, blank=True)
    public_key = models.TextField(null=True, blank=True)
    private_key = models.TextField(null=True, blank=True)

    USER_CHOICES = (
        ('donor','DONOR'),
        ('hospital', 'HOSPITAL'),
        ('patient','PATIENT'),
    )
    user_type = models.CharField(max_length=10, choices=USER_CHOICES, default="donor")

    def __str__(self):
        return self.id


class HashFileType(models.Model):
    hash_val = models.CharField(max_length=50, primary_key=True)
    suffix_ext = models.CharField(max_length=50)
    prefix_name = models.CharField(max_length=100)