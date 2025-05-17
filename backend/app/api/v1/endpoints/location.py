from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Request, status
from app.services import location_service
from app.schemas.location import Location, LocationResponse
from app.core.utils import get_client_ip


router = APIRouter()


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
)
async def get_location(
    *,
    request: Request,
    location_text: Optional[str] = Query(
        None, description="Filter products by location text"
    ),
    lat: Optional[float] = Query(
        None, description="Filter products by location latitude"
    ),
    lng: Optional[float] = Query(
        None, description="Filter products by location longitude"
    ),
):
    """
    Retrieve client location based on given location, coordinates, or IP address.
    """
    final_latitude: Optional[float] = None
    final_longitude: Optional[float] = None
    final_location_text: str = location_text
    location_source_info: str = "user_input_text"

    # Priority 1: Use client-provided coordinates if available
    if lat is not None and lng is not None:
        final_latitude = lat
        final_longitude = lng
        # Optionally, reverse geocode to standardize/verify location_text
        reverse_geocoded_text = await location_service.reverse_geocode_coordinates(
            final_latitude, final_longitude
        )
        if reverse_geocoded_text:
            final_location_text = (
                reverse_geocoded_text  # Prefer reverse geocoded for consistency
            )
        location_source_info = "browser_geolocation"

    # Priority 2: Geocode user-provided location_text if coordinates weren't set
    elif location_text:
        lat, lon = await location_service.geocode_address(location_text)
        if lat is not None and lon is not None:
            final_latitude = lat
            final_longitude = lon
            # final_location_text is already product_in.location_text
            location_source_info = "user_input_geocoded"

    # Priority 3: Fallback to IP-based geolocation if other methods failed
    client_ip = get_client_ip(request)
    if final_latitude is None and final_longitude is None and client_ip:
        ip_location_text, ip_lat, ip_lon = await location_service.geocode_ip_address(
            client_ip
        )
        if ip_lat is not None and ip_lon is not None:
            final_latitude = ip_lat
            final_longitude = ip_lon
            final_location_text = (
                ip_location_text or location_text or "Unknown (IP based)"
            )
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
