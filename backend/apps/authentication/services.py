from django.contrib.auth import authenticate

def login_user(username, password):
    return authenticate(username=username, password=password)