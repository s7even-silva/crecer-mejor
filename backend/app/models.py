from sqlalchemy import Column, Date, Float, ForeignKey, String
from sqlalchemy.orm import relationship

from .database import Base


class Nino(Base):
    __tablename__ = "ninos"

    id = Column(String, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    sexo = Column(String(1), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)

    mediciones = relationship(
        "Medicion", back_populates="nino", order_by="Medicion.fecha"
    )


class Medicion(Base):
    __tablename__ = "mediciones"

    id = Column(String, primary_key=True)
    nino_id = Column(String, ForeignKey("ninos.id"), nullable=False, index=True)
    fecha = Column(Date, nullable=False)
    fuente = Column(String, nullable=False)
    peso_valor = Column(Float, nullable=False)
    peso_unidad = Column(String, nullable=False)
    talla_valor = Column(Float, nullable=False)
    talla_unidad = Column(String, nullable=False)

    nino = relationship("Nino", back_populates="mediciones")
