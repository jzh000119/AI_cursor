import pytest
from app.database import DATABASE_URL, Base, get_db
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 将数据库名替换为 postgres_test
_url_parts = DATABASE_URL.rsplit("/", 1)
TEST_DATABASE_URL = _url_parts[0] + "/postgres_test"

_test_engine = create_engine(TEST_DATABASE_URL)
_TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Session 级别：创建所有表，测试结束后删除。"""
    Base.metadata.create_all(_test_engine)
    yield
    Base.metadata.drop_all(_test_engine)
    _test_engine.dispose()


@pytest.fixture(scope="function")
def db(setup_database):
    """Function 级别：每个测试函数使用独立 Session，测试结束后清空所有表数据。"""
    session = _TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        # 按依赖顺序逆向删除，保证外键约束不报错
        with _test_engine.begin() as conn:
            for table in reversed(Base.metadata.sorted_tables):
                conn.execute(table.delete())


@pytest.fixture(scope="function")
def client(db):
    """Function 级别：注入测试 Session 后的 TestClient。"""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
