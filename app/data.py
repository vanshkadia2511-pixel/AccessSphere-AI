"""Data loading layer for AccessMate. Loads the static venues.json file."""

import json
from pathlib import Path
from typing import Any, TypedDict, cast

# Define types for type checking
class Gate(TypedDict):
    name: str
    accessible: bool
    notes: str

class Accessibility(TypedDict):
    verified: bool
    gates: list[Gate]
    elevators: str
    accessible_seating: str
    accessible_restrooms: str
    sensory_room: str
    quiet_route_hint: str
    vision_support: str
    assistive_listening: str

class Services(TypedDict):
    water: str
    first_aid: str
    nursing_room: str

class Venue(TypedDict):
    id: str
    name: str
    commercialName: str
    fifaName: str
    city: str
    country: str
    capacity: int
    accessibility: Accessibility
    services: Services

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "venues.json"
_cached_data: dict[str, Any] | None = None

def load_venues() -> dict[str, Any]:
    """Load the JSON database, caching the result in memory."""
    global _cached_data
    if _cached_data is None:
        with open(_DATA_PATH, encoding="utf-8") as f:
            _cached_data = json.load(f)
    return _cached_data

def list_venues() -> list[Venue]:
    """Return all venues in the database."""
    return cast(list[Venue], load_venues()["venues"])

def get_venue(venue_id: str) -> Venue | None:
    """Find a venue by its unique id, or return None."""
    for v in list_venues():
        if v["id"] == venue_id:
            return v
    return None

def search_venues(q: str) -> list[Venue]:
    """Search venues by name, commercialName, fifaName, city, or country (case-insensitive substring)."""
    query = q.strip().lower()
    if not query:
        return []
    results = []
    for v in list_venues():
        if (query in v["name"].lower() or
            query in v["commercialName"].lower() or
            query in v["fifaName"].lower() or
            query in v["city"].lower() or
            query in v["country"].lower()):
            results.append(v)
    return results
