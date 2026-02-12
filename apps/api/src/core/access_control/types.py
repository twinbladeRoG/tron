class Subject:
    def __init__(self, **attrs):
        self.__dict__.update(attrs)


class Resource:
    def __init__(self, type: str, **attrs):
        self.type = type
        self.__dict__.update(attrs)
