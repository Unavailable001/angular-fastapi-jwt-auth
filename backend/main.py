from fastapi import FastAPI,HTTPException,Depends
from pydantic import BaseModel,EmailStr
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pwdlib import PasswordHash
import os
from sqlalchemy.orm import Session
from database import Base,engine,get_db
from models import User
from schemas import RegisterRequest,LoginRequest
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

security = HTTPBearer()
password_Hash=PasswordHash.recommended()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)



@app.post("/auth/register")
def register(request: RegisterRequest,db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == request.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = password_Hash.hash(
        request.password
    )

    user = User(
        email=request.email,
        password_Hash=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "email": user.email
    }


# fake_user = {
#     "id": 1,
#     "email": "deb@example.com",
#     "password": password_Hash.hash("123456")
# }


#token utilization
def create_access_token(user_id: int):

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )



@app.get("/")
def root():
    return {
        "message": "FastAPI JWT Backend is running"
    }


@app.post("/auth/login")
def login(request: LoginRequest,db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not password_Hash.verify(request.password,user.password_Hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }




@app.get("/users/me")
def get_current_user(payload: dict = Depends(verify_token),db:Session=Depends(get_db)):

    user_id = int(payload["sub"])

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "email": user.email
    }