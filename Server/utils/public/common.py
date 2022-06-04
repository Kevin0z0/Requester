from utils.type import Request


def db_arr_to_dict(cursor, row):
    return dict(zip([desc[0] for desc in cursor.description], row))


def get_uid(request: Request):
    return int(request.COOKIES.get('uid'))
