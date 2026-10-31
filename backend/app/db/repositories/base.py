from collections.abc import Sequence
from typing import Generic, Optional, TypeVar

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Generic repository providing baseline querying operations."""

    def __init__(self, model_class: type[ModelT], db: Session):
        self.model_class = model_class
        self.db = db

    def get_by_id(self, entity_id: str) -> Optional[ModelT]:
        """Fetch entity by UUID primary key."""
        return self.db.get(self.model_class, entity_id)

    def list_by_store(self, store_id: str, limit: int = 50) -> Sequence[ModelT]:
        """Fetch entities scoped to a specific store."""
        stmt = select(self.model_class).filter_by(store_id=store_id).limit(limit)
        return self.db.scalars(stmt).all()
