from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.auth import UserOut, UserUpdate
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("", response_model=UserOut)
def update_profile(
    profile_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = profile_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(current_user, field, val)

    db.commit()
    db.refresh(current_user)
    return current_user
