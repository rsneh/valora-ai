import httpx
import asyncio
from typing import List, Optional
from fastapi import HTTPException
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
from app.core.config import settings
from app.schemas.location import LocationSuggestion

geolocator = Nominatim(
    user_agent=f"ValoraApp/1.0 ({settings.ADMIN_EMAIL or 'contact@valoraai.net'})"
)


async def geocode_address(address: str) -> tuple[Optional[float], Optional[float]]:
    """Geocodes a textual address to latitude and longitude using Nominatim."""
    try:
        location = await asyncio.to_thread(
            geolocator.geocode, address, timeout=10
        )  # Run synchronous geopy call in thread
        if location:
            return location.latitude, location.longitude
    except GeocoderTimedOut:
        print(f"Nominatim geocoding timed out for address: {address}")
    except GeocoderUnavailable:
        print(f"Nominatim service unavailable for address: {address}")
    except Exception as e:
        print(f"Error geocoding address '{address}': {e}")
    return None, None


async def reverse_geocode_coordinates(lat: float, lon: float) -> Optional[str]:
    """Reverse geocodes coordinates to a textual address using Nominatim."""
    try:
        location = await asyncio.to_thread(
            geolocator.reverse, (lat, lon), language="en", timeout=10, zoom=12
        )
        if location and location.address:
            # Construct a readable address (customize as needed)
            raw_address = location.raw.get("address", {})
            address_parts = [
                # raw_address.get("road"),
                raw_address.get("city")
                or raw_address.get("town")
                or raw_address.get("village"),
                raw_address.get("country"),
                # location.raw.get('address', {}).get('state'),
            ]
            return ", ".join(filter(None, address_parts)) or location.address
    except GeocoderTimedOut:
        print(f"Nominatim reverse geocoding timed out for coords: {lat},{lon}")
    except GeocoderUnavailable:
        print(f"Nominatim service unavailable for coords: {lat},{lon}")
    except Exception as e:
        print(f"Error reverse geocoding coordinates '{lat},{lon}': {e}")
    return None


async def geocode_ip_address(
    ip_address: str,
) -> tuple[Optional[str], Optional[float], Optional[float]]:
    """
    Geocodes an IP address to get approximate city, country, latitude, and longitude.
    Uses a free service like ip-api.com (check their terms and rate limits).
    Returns (location_text, latitude, longitude)
    """
    if (
        not ip_address or ip_address == "127.0.0.1" or ip_address == "localhost"
    ):  # Skip local IPs
        return None, None, None
    try:
        # Example using ip-api.com (replace with your preferred service if needed)
        # Ensure you comply with the terms of service of any IP geolocation API.
        url = f"http://ip-api.com/json/{ip_address}?fields=status,message,country,city,lat,lon"
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            response.raise_for_status()  # Raise an exception for bad status codes
            data = response.json()

        if data.get("status") == "success":
            city = data.get("city")
            country = data.get("country")
            lat = data.get("lat")
            lon = data.get("lon")
            location_text_parts = [part for part in [city, country] if part]
            location_text = (
                ", ".join(location_text_parts) if location_text_parts else None
            )
            return location_text, lat, lon
        else:
            print(f"IP Geolocation failed for {ip_address}: {data.get('message')}")
    except httpx.RequestError as e:
        print(f"HTTPX RequestError during IP geolocation for {ip_address}: {e}")
    except Exception as e:
        print(f"Error geocoding IP '{ip_address}': {e}")
    return None, None, None


async def get_location_suggestions(query: str) -> list[dict]:
    """
    Provides location suggestions based on the user's query.
    This would typically call a geocoding service or query your own location database.
    """
    try:
        locations_raw = await asyncio.to_thread(
            geolocator.geocode,
            query,
            exactly_one=False,
            addressdetails=True,
            language="en",  # Prefer English results
            limit=5,
            timeout=10,
        )

        suggestions: List[LocationSuggestion] = []
        if locations_raw:
            for loc_raw in locations_raw:
                print(f"Processing location: {loc_raw.raw}")
                if (
                    loc_raw
                    and loc_raw.raw
                    and loc_raw.raw.get("address")
                    and loc_raw.raw.get("addresstype") in ["town", "city"]
                ):
                    address_details = loc_raw.raw.get("address", {})
                    city = (
                        address_details.get("city")
                        or address_details.get("town")
                        or address_details.get("village")
                        or address_details.get("county")
                    )  # Fallback to county if city/town/village not present

                    country = address_details.get("country", "Unknown")

                    # Construct a display name. Nominatim's display_name is often good.
                    display_name = ", ".join(filter(None, [city, country]))

                    # Ensure city is part of display_name if available, otherwise construct
                    if city and city.lower() not in display_name.lower():
                        name_parts = [part for part in [city, country] if part]
                        constructed_name = ", ".join(name_parts)
                        if (
                            constructed_name
                            and constructed_name.lower() not in display_name.lower()
                        ):
                            display_name = f"{city}, {country}"  # Fallback to simpler format if needed

                    # Use place_id as a unique ID if available, otherwise generate one (less ideal)
                    # Nominatim's place_id is a good unique identifier.
                    suggestion_id = str(
                        loc_raw.raw.get(
                            "place_id",
                            f"osm_{loc_raw.raw.get('osm_type', '')}_{loc_raw.raw.get('osm_id', '')}",
                        )
                    )

                    suggestions.append(
                        LocationSuggestion(
                            id=suggestion_id,
                            name=display_name,
                            city=city or "Unknown",  # Provide a fallback
                            country=country,
                            latitude=loc_raw.latitude,
                            longitude=loc_raw.longitude,
                        )
                    )

            # If Nominatim returns nothing, but query is somewhat long, you could try a broader search
            # or return a message indicating no specific matches.
            # For this example, we just return what we found.
            if not suggestions and len(query) > 3:  # Simple heuristic
                # You might want to log that no results were found for a specific query
                pass

        return suggestions
    except GeocoderTimedOut:
        print(f"Nominatim geocoding timed out for query: {query}")
        raise HTTPException(
            status_code=504, detail="Location service timed out. Please try again."
        )
    except GeocoderUnavailable:
        print(f"Nominatim service unavailable for query: {query}")
        raise HTTPException(
            status_code=503, detail="Location service is currently unavailable."
        )
    except Exception as e:
        print(f"Error fetching location suggestions for query '{query}': {e}")
        # Consider logging the full traceback here for debugging
        # import traceback
        # print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Could not fetch location suggestions due to an internal error.",
        )
