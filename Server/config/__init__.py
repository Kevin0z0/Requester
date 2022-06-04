import json
import os


def getPath():
    file = os.path.abspath(__file__)
    return os.path.join(os.path.dirname(file), 'config.json')


def saveConfig():
    with open(path, 'w') as g:
        g.write(json.dumps(config, indent=2))


path = getPath()
f = open(path, 'r')
config = json.loads(f.read())
f.close()

if not config['encrypt']['publicKey']:
    import rsa
    (pubkey, privkey) = rsa.newkeys(1024)
    priv = privkey.save_pkcs1()
    config['encrypt']['publicKey'] = pubkey.save_pkcs1().decode()
    config['encrypt']['privateKey'] = privkey.save_pkcs1().decode()
    saveConfig()

__all__ = ["config"]
