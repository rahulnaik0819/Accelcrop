from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class FarmAuditLog(Base):
    """
    SQLAlchemy model representing field telemetry audit and recommendation logs.
    """
    __tablename__ = "farm_audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    field_id = Column(String(100), index=True, nullable=False)
    soil_ph = Column(Float, nullable=False)
    moisture_pct = Column(Float, nullable=False)
    nitrogen_level = Column(Float, nullable=True)
    target_yield = Column(Float, nullable=True)
    recommended_urea_kg = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<FarmAuditLog id={self.id} field_id='{self.field_id}' ph={self.soil_ph} moisture={self.moisture_pct}>"
