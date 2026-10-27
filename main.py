from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
import datetime

# 1. Database Setup (SQLite local file)
SQLALCHEMY_DATABASE_URL = "sqlite:///./grid_data.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Database Model
class TransformerTelemetry(Base):
    __tablename__ = "telemetry"
    id = Column(Integer, primary_key=True, index=True)
    transformer_id = Column(String, index=True)
    phase_a_amps = Column(Float)
    phase_b_amps = Column(Float)
    phase_c_amps = Column(Float)
    oil_temp_c = Column(Float)
    status = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# Generate the database tables
Base.metadata.create_all(bind=engine)

# 3. FastAPI App Setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. Pydantic Schemas
class TelemetryInput(BaseModel):
    transformer_id: str
    phase_a_amps: float
    phase_b_amps: float
    phase_c_amps: float
    oil_temp_c: float
    status: str

# 5. API Endpoints
@app.post("/api/telemetry")
def ingest_telemetry(data: TelemetryInput, db: Session = Depends(get_db)):
    """Receives live data from the simulator and saves it to SQLite."""
    db_record = TransformerTelemetry(**data.dict())
    db.add(db_record)
    db.commit()
    return {"message": "Data logged"}

@app.get("/api/telemetry")
def get_all_telemetry(db: Session = Depends(get_db)):
    """Fetches the latest 50 readings for the React dashboard."""
    return db.query(TransformerTelemetry).order_by(TransformerTelemetry.timestamp.desc()).limit(50).all()