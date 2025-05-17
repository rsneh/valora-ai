from pydantic import BaseModel
from typing import Optional


class Location(BaseModel):
    location_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_source: Optional[str] = None


class LocationResponse(Location):
    pass
