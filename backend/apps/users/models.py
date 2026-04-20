from django.db import models

class Profile(models.Model):
    user = models.OneToOneField("authentication.User", on_delete=models.CASCADE)