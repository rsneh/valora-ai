from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Request, status, Depends
from app.services import location_service
from app.schemas.location import LocationResponse, LocationSuggestion
from app.core.utils import get_client_ip
from app.lib.locale import AppLocale, get_locale_from_header


router = APIRouter()


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
)
async def get_location(
    *,
    request: Request,
):
    """
    Retrieve client location based on given location, coordinates, or IP address.
    """
    final_latitude: Optional[float] = None
    final_longitude: Optional[float] = None
    location_source_info: str = "unknown"
    final_location_text: str = "Unknown (IP based)"

    client_ip = get_client_ip(request)
    if final_latitude is None and final_longitude is None and client_ip:
        ip_location_text, ip_lat, ip_lon = await location_service.geocode_ip_address(
            client_ip
        )
        if ip_lat is not None and ip_lon is not None:
            final_latitude = ip_lat
            final_longitude = ip_lon
            final_location_text = ip_location_text or "Unknown (IP based)"
            location_source_info = "ip_geolocation"

    print(
        f"Final location: {final_location_text}, lat: {final_latitude}, lon: {final_longitude}, source: {location_source_info}"
    )
    return LocationResponse(
        location_text=final_location_text,
        latitude=final_latitude,
        longitude=final_longitude,
        location_source=location_source_info,
    )


@router.get("/suggest", response_model=List[LocationSuggestion])
async def suggest_locations(
    q: str = Query(..., min_length=1, description="Search query for location"),
    locale: AppLocale = Depends(get_locale_from_header),
):
    """
    Provides location suggestions based on the user's query.
    This would typically call a geocoding service or query your own location database.
    """
    if not q:
        return []
    try:
        suggestions = await location_service.get_location_suggestions(q, locale)
        return suggestions
    except Exception as e:
        # Log the error
        print(f"Error fetching location suggestions: {e}")
        raise HTTPException(
            status_code=500, detail="Could not fetch location suggestions."
        )
