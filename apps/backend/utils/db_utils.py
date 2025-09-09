from sqlalchemy import inspect


def row_to_dict(row) -> dict:
    return {column.name: getattr(row, column.name) for column in row.__table__.columns}