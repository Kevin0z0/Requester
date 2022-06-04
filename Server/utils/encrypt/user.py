import hmac
import random
from hashlib import sha256

def create_key():
    arr = []
    for i in range(16):
        s = str(hex(random.randint(0, 0xff)))[2:]
        arr.append("0" * (2 - len(s)) + s)
    return ''.join(arr)


def hmac_sha256(text, key):
    return hmac.new(key.encode('utf-8'), text.encode('utf-8'), digestmod=sha256).hexdigest()



__all__ = ['create_key', 'hmac_sha256']