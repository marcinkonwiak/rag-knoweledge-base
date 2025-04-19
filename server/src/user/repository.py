from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.core import DbSession
from src.user.models import User
from src.user.schemas import UserCreate, UserInDB, UserUpdate


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, id: int) -> UserInDB | None:
        user = await self.session.get(UserInDB, id)
        if user:
            return UserInDB.model_validate(user)

        return None

    async def get_by_azure_id(self, azure_id: str) -> UserInDB | None:
        query = select(User).where(User.azure_id == azure_id)
        result = await self.session.execute(query)
        user = result.scalars().first()
        if user:
            return UserInDB.model_validate(user)

        return None

    async def get_all(self, *, skip: int = 0, limit: int = 100) -> list[UserInDB]:
        query = select(User).order_by(User.id).offset(skip).limit(limit)
        result = await self.session.execute(query)
        users = result.scalars().all()
        return [UserInDB.model_validate(user) for user in users]

    async def create(self, *, obj_in: UserCreate) -> UserInDB:
        user = User(**obj_in.model_dump())
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return UserInDB.model_validate(user)

    async def update(self, *, id: int, obj_in: UserUpdate) -> UserInDB | None:
        user = await self.session.get(User, id)
        if not user:
            return None

        update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(user, field, value)

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return UserInDB.model_validate(user)

    async def delete(self, *, id: int) -> UserInDB | None:
        user = await self.session.get(User, id)
        if not user:
            return None

        await self.session.delete(user)
        await self.session.commit()
        return UserInDB.model_validate(user)


def get_user_repository(
    session: DbSession,
) -> UserRepository:
    return UserRepository(session=session)
