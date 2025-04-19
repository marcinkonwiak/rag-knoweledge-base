class ResourceNotFoundException(Exception):
    def __init__(self):
        super().__init__("Resource with not found")


class ResourceAlreadyExistsException(Exception):
    def __init__(self):
        super().__init__("Resource already exists")
