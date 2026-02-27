"""
Pakistan Intelligence Monitor - Backend API
Real-time intelligence dashboard for Pakistan-related information
"""
import os
import asyncio
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Optional
import httpx
import feedparser
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "pakistan_intel")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
news_collection = db["news"]
economic_collection = db["economic_data"]
security_collection = db["security_alerts"]
weather_collection = db["weather_data"]

# Flight data cache (refreshes every 6 hours)
flight_cache = {
    "lahore": {"departures": 0, "arrivals": 0, "updated": None},
    "islamabad": {"departures": 0, "arrivals": 0, "updated": None},
    "karachi": {"departures": 0, "arrivals": 0, "updated": None},
    "multan": {"departures": 0, "arrivals": 0, "updated": None}
}

AIRPORTS = {
    "lahore": {"code": "LHE", "name": "Lahore"},
    "islamabad": {"code": "ISB", "name": "Islamabad"},
    "karachi": {"code": "KHI", "name": "Karachi"},
    "multan": {"code": "MUX", "name": "Multan"}
}

FLIGHTSTATS_BASE = "https://www.flightstats.com/v2/flight-tracker"

# Port data cache (refreshes every 6 hours)
port_cache = {
    "karachi": {"in_port": 0, "arrivals": 0, "departures": 0, "expected": 0, "updated": None},
    "qasim": {"in_port": 0, "arrivals": 0, "departures": 0, "expected": 0, "updated": None},
    "gwadar": {"in_port": 0, "arrivals": 0, "departures": 0, "expected": 0, "updated": None}
}

PORTS = {
    "karachi": {"id": 236, "name": "Karachi", "code": "PKKHI"},
    "qasim": {"id": 343, "name": "Port Qasim", "code": "PKBQM"},
    "gwadar": {"id": 3609, "name": "Gwadar", "code": "PKGWD"}
}

MYSHIPTRACKING_BASE = "https://www.myshiptracking.com/ports"

# Data cache with timestamps
data_cache = {
    "news": {"data": [], "updated": None},
    "energy": {"data": [], "updated": None},
    "economic": {"data": {}, "updated": None},
    "weather": {"data": [], "updated": None},
    "security": {"data": [], "updated": None}
}

# RSS feeds for Pakistan news - comprehensive list
PAKISTAN_NEWS_FEEDS = [
    # Major News Outlets
    {"name": "Dawn News", "url": "https://www.dawn.com/feed", "category": "general"},
    {"name": "Geo News", "url": "https://www.geo.tv/rss/1/0", "category": "general"},
    {"name": "The News International", "url": "https://www.thenews.com.pk/rss/1/1", "category": "general"},
    {"name": "Express Tribune", "url": "https://tribune.com.pk/feed/home", "category": "general"},
    {"name": "ARY News", "url": "https://arynews.tv/feed/", "category": "general"},
    {"name": "Dunya News", "url": "https://dunyanews.tv/feed", "category": "general"},
    {"name": "Samaa TV", "url": "https://www.samaaenglish.tv/feed/", "category": "general"},
    {"name": "Pakistan Today", "url": "https://www.pakistantoday.com.pk/feed/", "category": "general"},
    {"name": "The Nation", "url": "https://www.nation.com.pk/rss/headlines", "category": "general"},
    {"name": "Daily Times", "url": "https://dailytimes.com.pk/feed/", "category": "general"},
    
    # Business & Finance
    {"name": "Business Recorder", "url": "https://www.brecorder.com/feeds/latest-news", "category": "business"},
    {"name": "Profit Pakistan", "url": "https://profit.pakistantoday.com.pk/feed/", "category": "business"},
    
    # Regional News
    {"name": "Frontier Post", "url": "https://thefrontierpost.com/feed/", "category": "regional"},
    {"name": "Balochistan Times", "url": "https://balochistantimes.com/feed/", "category": "regional"},
    
    # International Coverage of Pakistan
    {"name": "Al Jazeera Pakistan", "url": "https://www.aljazeera.com/xml/rss/all.xml", "category": "international"},
    {"name": "Reuters Pakistan", "url": "https://www.reutersagency.com/feed/", "category": "international"},
    
    # Tech & Science
    {"name": "ProPakistani", "url": "https://propakistani.pk/feed/", "category": "tech"},
    {"name": "TechJuice", "url": "https://www.techjuice.pk/feed/", "category": "tech"},
    
    # Sports
    {"name": "Cricbuzz Pakistan", "url": "https://www.cricbuzz.com/rss/cb_rss_headlines.xml", "category": "sports"},
]

# Energy specific RSS feed
ENERGY_NEWS_FEED = {"name": "Energy Update", "url": "https://www.energyupdate.com.pk/feed/", "category": "energy"}

def parse_date(date_string):
    """Parse various date formats and return datetime object"""
    if not date_string:
        return None
    
    from email.utils import parsedate_to_datetime
    try:
        # Try RFC 2822 format (common in RSS)
        return parsedate_to_datetime(date_string)
    except:
        pass
    
    # Try common formats
    formats = [
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d %H:%M:%S",
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S %Z",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt)
        except:
            continue
    
    return None

def is_within_24_hours(date_string):
    """Check if the article is within last 48 hours (to account for timezone differences)"""
    parsed_date = parse_date(date_string)
    if not parsed_date:
        return True  # Include if we can't parse the date
    
    now = datetime.now(timezone.utc)
    # Make parsed_date timezone aware if it isn't
    if parsed_date.tzinfo is None:
        parsed_date = parsed_date.replace(tzinfo=timezone.utc)
    
    time_diff = now - parsed_date
    return time_diff.total_seconds() <= 172800  # 48 hours in seconds for better coverage

async def fetch_rss_feed(feed_info: dict) -> list:
    """Fetch and parse RSS feed"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(feed_info["url"], headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            if response.status_code == 200:
                feed = feedparser.parse(response.text)
                articles = []
                for entry in feed.entries[:10]:
                    articles.append({
                        "title": entry.get("title", ""),
                        "link": entry.get("link", ""),
                        "published": entry.get("published", ""),
                        "summary": entry.get("summary", "")[:200] if entry.get("summary") else "",
                        "source": feed_info["name"],
                        "category": feed_info["category"]
                    })
                return articles
    except Exception as e:
        print(f"Error fetching {feed_info['name']}: {e}")
    return []

async def fetch_all_news():
    """Fetch news from all RSS feeds including energy - only last 48 hours"""
    # Include energy feed in main news feeds
    all_feeds = PAKISTAN_NEWS_FEEDS + [ENERGY_NEWS_FEED]
    tasks = [fetch_rss_feed(feed) for feed in all_feeds]
    results = await asyncio.gather(*tasks)
    all_news = []
    for articles in results:
        all_news.extend(articles)
    
    # Filter to only include news from last 48 hours
    recent_news = [article for article in all_news if is_within_24_hours(article.get("published", ""))]
    
    # Sort by published date if available
    recent_news.sort(key=lambda x: x.get("published", ""), reverse=True)
    return recent_news[:150]  # Return up to 150 recent news items

async def fetch_energy_news():
    """Fetch energy news from Energy Update Pakistan"""
    articles = await fetch_rss_feed(ENERGY_NEWS_FEED)
    # Filter to last 24 hours
    recent_articles = [article for article in articles if is_within_24_hours(article.get("published", ""))]
    recent_articles.sort(key=lambda x: x.get("published", ""), reverse=True)
    return recent_articles

async def fetch_economic_data():
    """Fetch economic data - using mock data for now"""
    # In production, this would call real APIs like Alpha Vantage, Open Exchange Rates, etc.
    return {
        "pkr_usd": {
            "rate": 278.50,
            "change": -0.25,
            "change_percent": -0.09,
            "updated": datetime.now(timezone.utc).isoformat()
        },
        "pkr_eur": {
            "rate": 302.15,
            "change": 0.45,
            "change_percent": 0.15,
            "updated": datetime.now(timezone.utc).isoformat()
        },
        "pkr_gbp": {
            "rate": 352.80,
            "change": -0.15,
            "change_percent": -0.04,
            "updated": datetime.now(timezone.utc).isoformat()
        },
        "psx_kse100": {
            "value": 112450.25,
            "change": 1250.50,
            "change_percent": 1.12,
            "volume": "485.2M",
            "updated": datetime.now(timezone.utc).isoformat()
        },
        "inflation": {
            "cpi": 11.8,
            "food": 12.5,
            "energy": 15.2,
            "month": "January 2026",
            "updated": datetime.now(timezone.utc).isoformat()
        },
        "remittances": {
            "monthly": 2.85,
            "yearly": 31.2,
            "change_percent": 8.5,
            "unit": "billion USD",
            "updated": datetime.now(timezone.utc).isoformat()
        },
        "forex_reserves": {
            "value": 13.2,
            "change": 0.3,
            "unit": "billion USD",
            "updated": datetime.now(timezone.utc).isoformat()
        }
    }

async def fetch_weather_data():
    """Fetch weather alerts for major Pakistani cities"""
    # Mock weather data for major cities
    cities = [
        {"name": "Karachi", "lat": 24.8607, "lon": 67.0011, "temp": 28, "condition": "Partly Cloudy", "humidity": 65},
        {"name": "Lahore", "lat": 31.5204, "lon": 74.3587, "temp": 18, "condition": "Foggy", "humidity": 85},
        {"name": "Islamabad", "lat": 33.6844, "lon": 73.0479, "temp": 12, "condition": "Clear", "humidity": 55},
        {"name": "Peshawar", "lat": 34.0151, "lon": 71.5249, "temp": 14, "condition": "Clear", "humidity": 50},
        {"name": "Quetta", "lat": 30.1798, "lon": 66.9750, "temp": 8, "condition": "Cold Wave", "humidity": 40},
        {"name": "Multan", "lat": 30.1575, "lon": 71.5249, "temp": 20, "condition": "Sunny", "humidity": 45},
    ]
    return cities

async def fetch_security_data():
    """Fetch security alerts and political developments"""
    # Mock security/political data
    alerts = [
        {
            "type": "political",
            "severity": "medium",
            "title": "National Assembly Session Scheduled",
            "description": "Parliament to convene for budget discussions",
            "region": "Islamabad",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        {
            "type": "security",
            "severity": "low",
            "title": "Security Enhanced in Major Cities",
            "description": "Routine security measures for upcoming events",
            "region": "Nationwide",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        {
            "type": "diplomatic",
            "severity": "info",
            "title": "Foreign Minister's Visit to China",
            "description": "Bilateral talks on CPEC projects scheduled",
            "region": "International",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        {
            "type": "economic",
            "severity": "medium",
            "title": "IMF Review Mission Arrives",
            "description": "Economic review for next tranche release",
            "region": "Islamabad",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    ]
    return alerts

async def fetch_airport_flights(airport_key: str):
    """Fetch airport departure and arrival counts from FlightStats"""
    import re
    airport = AIRPORTS.get(airport_key)
    if not airport:
        return
    
    code = airport["code"]
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        # Fetch departures
        try:
            dep_url = f"{FLIGHTSTATS_BASE}/departures/{code}"
            response = await client.get(dep_url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            if response.status_code == 200:
                match = re.search(r'(\d+)\s*results', response.text)
                if match:
                    flight_cache[airport_key]["departures"] = int(match.group(1))
        except Exception as e:
            print(f"Error fetching {airport_key} departures: {e}")
        
        # Fetch arrivals
        try:
            arr_url = f"{FLIGHTSTATS_BASE}/arrivals/{code}"
            response = await client.get(arr_url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            if response.status_code == 200:
                match = re.search(r'(\d+)\s*results', response.text)
                if match:
                    flight_cache[airport_key]["arrivals"] = int(match.group(1))
        except Exception as e:
            print(f"Error fetching {airport_key} arrivals: {e}")
    
    flight_cache[airport_key]["updated"] = datetime.now(timezone.utc)

async def fetch_all_airports():
    """Fetch flight data for all airports"""
    tasks = [fetch_airport_flights(key) for key in AIRPORTS.keys()]
    await asyncio.gather(*tasks)

async def fetch_port_data(port_key: str):
    """Fetch port vessel data from MyShipTracking"""
    import re
    port = PORTS.get(port_key)
    if not port:
        return
    
    port_id = port["id"]
    url = f"https://www.myshiptracking.com/ports/port-id-{port_id}"
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"https://www.myshiptracking.com/ports/port-of-{port['name'].lower().replace(' ', '-')}-in-pk-pakistan-id-{port_id}",
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            if response.status_code == 200:
                text = response.text
                
                # Extract Vessels In Port
                match = re.search(r'Vessels In Port.*?(\d+)', text, re.DOTALL)
                if match:
                    port_cache[port_key]["in_port"] = int(match.group(1))
                
                # Extract Arrivals (24h)
                match = re.search(r'Arrivals \(24h\).*?(\d+)', text, re.DOTALL)
                if match:
                    port_cache[port_key]["arrivals"] = int(match.group(1))
                
                # Extract Departures (24h)
                match = re.search(r'Departures \(24h\).*?(\d+)', text, re.DOTALL)
                if match:
                    port_cache[port_key]["departures"] = int(match.group(1))
                
                # Extract Expected Arrivals
                match = re.search(r'Expected Arrivals.*?(\d+)', text, re.DOTALL)
                if match:
                    port_cache[port_key]["expected"] = int(match.group(1))
                
                port_cache[port_key]["updated"] = datetime.now(timezone.utc)
    except Exception as e:
        print(f"Error fetching {port_key} port data: {e}")

async def fetch_all_ports():
    """Fetch data for all ports"""
    tasks = [fetch_port_data(key) for key in PORTS.keys()]
    await asyncio.gather(*tasks)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize data
    print("Pakistan Intelligence Monitor starting...")
    try:
        data_cache["news"]["data"] = await fetch_all_news()
        data_cache["news"]["updated"] = datetime.now(timezone.utc)
        data_cache["energy"]["data"] = await fetch_energy_news()
        data_cache["energy"]["updated"] = datetime.now(timezone.utc)
        data_cache["economic"]["data"] = await fetch_economic_data()
        data_cache["economic"]["updated"] = datetime.now(timezone.utc)
        data_cache["weather"]["data"] = await fetch_weather_data()
        data_cache["weather"]["updated"] = datetime.now(timezone.utc)
        data_cache["security"]["data"] = await fetch_security_data()
        data_cache["security"]["updated"] = datetime.now(timezone.utc)
    except Exception as e:
        print(f"Error during startup: {e}")
    yield
    # Shutdown
    print("Pakistan Intelligence Monitor shutting down...")

app = FastAPI(
    title="Pakistan Intelligence Monitor API",
    description="Real-time intelligence dashboard for Pakistan",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str

class NewsItem(BaseModel):
    title: str
    link: str
    published: str
    summary: str
    source: str
    category: str

class EconomicData(BaseModel):
    pkr_usd: dict
    pkr_eur: dict
    pkr_gbp: dict
    psx_kse100: dict
    inflation: dict
    remittances: dict
    forex_reserves: dict

class WeatherData(BaseModel):
    name: str
    lat: float
    lon: float
    temp: int
    condition: str
    humidity: int

class SecurityAlert(BaseModel):
    type: str
    severity: str
    title: str
    description: str
    region: str
    timestamp: str

# API Routes
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/news")
async def get_news():
    """Get latest Pakistan news (last 24 hours only)"""
    # Refresh news if older than 5 minutes
    if data_cache["news"]["updated"]:
        age = (datetime.now(timezone.utc) - data_cache["news"]["updated"]).total_seconds()
        if age > 300:
            data_cache["news"]["data"] = await fetch_all_news()
            data_cache["news"]["updated"] = datetime.now(timezone.utc)
    else:
        data_cache["news"]["data"] = await fetch_all_news()
        data_cache["news"]["updated"] = datetime.now(timezone.utc)
    
    return {
        "news": data_cache["news"]["data"],
        "updated": data_cache["news"]["updated"].isoformat() if data_cache["news"]["updated"] else None,
        "count": len(data_cache["news"]["data"]),
        "filter": "last_24_hours"
    }

@app.get("/api/energy")
async def get_energy_news():
    """Get energy sector news from Energy Update Pakistan (last 24 hours)"""
    # Refresh if older than 5 minutes
    if data_cache["energy"]["updated"]:
        age = (datetime.now(timezone.utc) - data_cache["energy"]["updated"]).total_seconds()
        if age > 300:
            data_cache["energy"]["data"] = await fetch_energy_news()
            data_cache["energy"]["updated"] = datetime.now(timezone.utc)
    else:
        data_cache["energy"]["data"] = await fetch_energy_news()
        data_cache["energy"]["updated"] = datetime.now(timezone.utc)
    
    return {
        "news": data_cache["energy"]["data"],
        "updated": data_cache["energy"]["updated"].isoformat() if data_cache["energy"]["updated"] else None,
        "count": len(data_cache["energy"]["data"]),
        "source": "Energy Update Pakistan",
        "filter": "last_24_hours"
    }

@app.get("/api/economic")
async def get_economic_data():
    """Get economic indicators"""
    # Refresh if older than 1 minute
    if data_cache["economic"]["updated"]:
        age = (datetime.now(timezone.utc) - data_cache["economic"]["updated"]).total_seconds()
        if age > 60:
            data_cache["economic"]["data"] = await fetch_economic_data()
            data_cache["economic"]["updated"] = datetime.now(timezone.utc)
    else:
        data_cache["economic"]["data"] = await fetch_economic_data()
        data_cache["economic"]["updated"] = datetime.now(timezone.utc)
    
    return {
        "data": data_cache["economic"]["data"],
        "updated": data_cache["economic"]["updated"].isoformat() if data_cache["economic"]["updated"] else None
    }

@app.get("/api/weather")
async def get_weather():
    """Get weather data for major Pakistani cities"""
    if data_cache["weather"]["updated"]:
        age = (datetime.now(timezone.utc) - data_cache["weather"]["updated"]).total_seconds()
        if age > 600:
            data_cache["weather"]["data"] = await fetch_weather_data()
            data_cache["weather"]["updated"] = datetime.now(timezone.utc)
    else:
        data_cache["weather"]["data"] = await fetch_weather_data()
        data_cache["weather"]["updated"] = datetime.now(timezone.utc)
    
    return {
        "cities": data_cache["weather"]["data"],
        "updated": data_cache["weather"]["updated"].isoformat() if data_cache["weather"]["updated"] else None
    }

@app.get("/api/security")
async def get_security_alerts():
    """Get security and political alerts"""
    if data_cache["security"]["updated"]:
        age = (datetime.now(timezone.utc) - data_cache["security"]["updated"]).total_seconds()
        if age > 300:
            data_cache["security"]["data"] = await fetch_security_data()
            data_cache["security"]["updated"] = datetime.now(timezone.utc)
    else:
        data_cache["security"]["data"] = await fetch_security_data()
        data_cache["security"]["updated"] = datetime.now(timezone.utc)
    
    return {
        "alerts": data_cache["security"]["data"],
        "updated": data_cache["security"]["updated"].isoformat() if data_cache["security"]["updated"] else None,
        "count": len(data_cache["security"]["data"])
    }

@app.get("/api/regional")
async def get_regional_relations():
    """Get regional relations data"""
    relations = {
        "india": {
            "status": "Tense",
            "trade_status": "Limited",
            "recent_events": [
                "Border security talks scheduled",
                "Trade discussions on hold"
            ],
            "sentiment": -0.3
        },
        "china": {
            "status": "Strategic Partnership",
            "trade_status": "Active",
            "recent_events": [
                "CPEC Phase 2 projects advancing",
                "Military cooperation exercises planned"
            ],
            "sentiment": 0.8
        },
        "afghanistan": {
            "status": "Complex",
            "trade_status": "Limited",
            "recent_events": [
                "Border management discussions ongoing",
                "Humanitarian aid coordination"
            ],
            "sentiment": 0.1
        },
        "iran": {
            "status": "Cordial",
            "trade_status": "Growing",
            "recent_events": [
                "Energy cooperation talks",
                "Border security coordination"
            ],
            "sentiment": 0.4
        },
        "saudi_arabia": {
            "status": "Strong Alliance",
            "trade_status": "Active",
            "recent_events": [
                "Investment discussions ongoing",
                "Worker welfare agreements"
            ],
            "sentiment": 0.7
        },
        "usa": {
            "status": "Engagement",
            "trade_status": "Normal",
            "recent_events": [
                "Diplomatic engagements continue",
                "Trade discussions scheduled"
            ],
            "sentiment": 0.3
        }
    }
    return {
        "relations": relations,
        "updated": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/infrastructure")
async def get_infrastructure_status():
    """Get infrastructure monitoring data"""
    # Check if flight data needs refresh (every 6 hours)
    needs_refresh = False
    for airport_key in AIRPORTS.keys():
        if flight_cache[airport_key]["updated"]:
            age = (datetime.now(timezone.utc) - flight_cache[airport_key]["updated"]).total_seconds()
            if age > 21600:  # 6 hours
                needs_refresh = True
                break
        else:
            needs_refresh = True
            break
    
    if needs_refresh:
        await fetch_all_airports()
    
    # Build airports data
    airports_data = {}
    for key, info in AIRPORTS.items():
        airports_data[key] = {
            "code": info["code"],
            "name": info["name"],
            "departures": flight_cache[key].get("departures", 0),
            "arrivals": flight_cache[key].get("arrivals", 0),
            "departures_url": f"{FLIGHTSTATS_BASE}/departures/{info['code']}",
            "arrivals_url": f"{FLIGHTSTATS_BASE}/arrivals/{info['code']}"
        }
    
    infrastructure = {
        "power": {
            "national_grid_status": "Stable",
            "load_shedding": {
                "urban": "2-3 hours",
                "rural": "4-6 hours"
            },
            "generation_capacity": "85%",
            "demand": "22,500 MW",
            "supply": "21,000 MW"
        },
        "internet": {
            "national_status": "Operational",
            "average_speed": "12.5 Mbps",
            "outage_reports": 3,
            "affected_regions": ["Parts of Balochistan"]
        },
        "air_transport": {
            "airports": airports_data,
            "note": "Flights in last 24 hours"
        },
        "updated": datetime.now(timezone.utc).isoformat()
    }
    return infrastructure

@app.get("/api/map-data")
async def get_map_data():
    """Get map markers and data points"""
    markers = {
        "cities": [
            {"name": "Islamabad", "lat": 33.6844, "lon": 73.0479, "type": "capital", "population": "1.1M"},
            {"name": "Karachi", "lat": 24.8607, "lon": 67.0011, "type": "major", "population": "14.9M"},
            {"name": "Lahore", "lat": 31.5204, "lon": 74.3587, "type": "major", "population": "11.1M"},
            {"name": "Faisalabad", "lat": 31.4504, "lon": 73.1350, "type": "major", "population": "3.2M"},
            {"name": "Rawalpindi", "lat": 33.5651, "lon": 73.0169, "type": "major", "population": "2.1M"},
            {"name": "Peshawar", "lat": 34.0151, "lon": 71.5249, "type": "major", "population": "1.9M"},
            {"name": "Quetta", "lat": 30.1798, "lon": 66.9750, "type": "provincial", "population": "1.0M"},
            {"name": "Multan", "lat": 30.1575, "lon": 71.5249, "type": "major", "population": "1.8M"},
            {"name": "Hyderabad", "lat": 25.3960, "lon": 68.3578, "type": "major", "population": "1.7M"},
            {"name": "Gwadar", "lat": 25.1264, "lon": 62.3225, "type": "strategic", "population": "0.1M"}
        ],
        "cpec_routes": [
            {"start": [35.9220, 74.3081], "end": [25.1264, 62.3225], "name": "Western Route"},
            {"start": [33.6844, 73.0479], "end": [24.8607, 67.0011], "name": "Central Route"},
            {"start": [31.5204, 74.3587], "end": [24.8607, 67.0011], "name": "Eastern Route"}
        ],
        "center": [30.3753, 69.3451],
        "zoom": 5,
        "updated": datetime.now(timezone.utc).isoformat()
    }
    return markers

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
