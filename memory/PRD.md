# Pakistan Intelligence Monitor - Product Requirements Document

## Project Overview
A real-time intelligence dashboard for monitoring Pakistan-related information, inspired by the World Monitor project (github.com/koala73/worldmonitor).

## Original Problem Statement
Clone the World Monitor GitHub app design, layout and features to create a Pakistan Intelligence Monitoring tool focusing specifically on Pakistan-related information.

## Tech Stack
- **Frontend**: React.js with CSS (no Tailwind)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Maps**: MapLibre GL JS with CARTO dark basemap
- **Styling**: Custom CSS with dark theme and Pakistan green (#22C55E) accents

## User Personas
1. **Intelligence Analysts** - Need real-time data aggregation
2. **Researchers** - Academic study of Pakistan affairs
3. **Journalists** - News monitoring and story tracking
4. **Policy Makers** - Quick situational awareness
5. **Citizens** - General interest in Pakistan news

## Core Requirements (Static)
1. Real-time news aggregation from Pakistani sources
2. Economic indicators dashboard (PKR exchange rates, KSE-100, inflation)
3. Security and political alerts panel
4. Weather data for major Pakistani cities
5. Regional relations tracking (India, China, Afghanistan, etc.)
6. Infrastructure monitoring (power, internet, transport)
7. Interactive map centered on Pakistan with city markers
8. Auto-refresh capability
9. Dark theme with Pakistan green accents
10. Responsive design

## What's Been Implemented (Feb 28, 2026)

### Backend (FastAPI)
- [x] `/api/health` - Health check endpoint
- [x] `/api/news` - RSS feed aggregation from 12+ Pakistani news sources with category filtering
- [x] `/api/economic` - Economic indicators (PKR/USD, PKR/EUR, KSE-100, inflation)
- [x] `/api/weather` - Weather data for major cities (Karachi, Lahore, Islamabad, Peshawar, Quetta, Multan)
- [x] `/api/security` - Security and political alerts
- [x] `/api/regional` - Regional relations data (India, China, Afghanistan, Iran, Saudi Arabia, USA)
- [x] `/api/infrastructure` - Real scraped data for 5 airports (ISB, KHI, LHE, MUX, PEW) and 3 ports (Karachi, Port Qasim, Gwadar)
- [x] `/api/map-data` - Map markers for Pakistani cities and CPEC routes
- [x] `/api/remittances` - **LIVE** Workers' remittances data from SBP API (1972-present, MoM & YoY)
- [x] `/api/gold-reserves` - **LIVE** Gold reserves data from SBP API (1990-present, MoM & YoY)
- [x] `/api/forex-reserves` - **LIVE** Total forex reserves data from SBP API (1990-present, MoM & YoY)

### Frontend (React)
- [x] Header with logo, live indicator, **Pakistan time (PKT/UTC+5)**, refresh button
- [x] News ticker (scrolling headlines)
- [x] Bento grid layout with responsive panels
- [x] NewsPanel - Displays latest news with category tabs (All, General, Energy, Business, International, Tech, Regional) and infinite scroll
- [x] EconomicPanel - Shows 7 indicators with **3 LIVE from SBP** (Gold, Forex, Remittances) with clickable chart modals
- [x] **SBPDataModal** - Reusable interactive chart modal with MoM%, YoY%, time range selectors (YTD, 6M, 1Y, 5Y, 10Y, ALL)
- [x] SecurityPanel - Shows security/political alerts with severity indicators
- [x] WeatherPanel - Shows weather for major cities
- [x] RegionalPanel - Shows diplomatic relations status
- [x] InfrastructurePanel - Airport status (5 airports with full names) and Port status (3 ports with vessel counts)
- [x] MapSection - Interactive map with Pakistan focus, city markers, legend

### Design
- [x] Dark theme (background: #020617, surface: #0F172A)
- [x] Pakistan green accent color (#22C55E)
- [x] Barlow Condensed font for headings
- [x] JetBrains Mono font for data/code
- [x] Panel borders and shadows
- [x] Status indicators (good/warning/critical)
- [x] Responsive grid layout

## Data Sources
- **News**: Real RSS feeds from Pakistani news outlets
- **Remittances**: **LIVE** - State Bank of Pakistan EasyData API (1972-present, 643 data points)
- **Gold Reserves**: **LIVE** - State Bank of Pakistan EasyData API (1990-present)
- **Forex Reserves**: **LIVE** - State Bank of Pakistan EasyData API (1990-present)
- **Economic**: PKR rates, KSE-100, Inflation - MOCKED (ready for API integration)
- **Weather**: MOCKED (ready for OpenWeatherMap integration)
- **Security**: MOCKED (ready for API integration)
- **Regional**: MOCKED (ready for API integration)
- **Infrastructure**: **LIVE** - Scraped from FlightStats (airports) and MyShipTracking (ports)

## Prioritized Backlog

### P0 (Critical) - COMPLETED
- [x] Basic dashboard layout
- [x] News feed integration with category filtering
- [x] Map display
- [x] All panels rendering
- [x] Infrastructure panel with real scraped airport & port data
- [x] Pakistan local time display (PKT/UTC+5) in header
- [x] **LIVE remittances data from SBP API with interactive chart modal (YTD, 6M, 1Y, 5Y, 10Y, ALL)**

### P1 (High Priority)
- [ ] Real-time data for Security & Politics panel (GDELT, ACLED, or RSS feeds)
- [ ] Real economic data API (Alpha Vantage, Open Exchange Rates)
- [ ] Real weather API integration (OpenWeatherMap)
- [ ] WebSocket for real-time updates
- [ ] User preferences persistence

### P2 (Medium Priority)
- [ ] Historical data charts
- [ ] News search and filtering
- [ ] Export functionality
- [ ] Dark/Light theme toggle
- [ ] Notifications system

### P3 (Nice to Have)
- [ ] Mobile app version
- [ ] Push notifications
- [ ] User authentication
- [ ] Saved watchlists
- [ ] Social sharing

## Next Tasks
1. Integrate real economic data APIs (Alpha Vantage for PKR rates)
2. Add OpenWeatherMap API for real weather data
3. Implement WebSocket for real-time data updates
4. Add charts/graphs for economic trends
5. Implement news search and category filtering

## Technical Notes
- Preview URL may show "unavailable" due to gateway warm-up; app runs correctly locally
- MapLibre GL requires async import pattern in React
- RSS feeds refresh every 5 minutes
- All data-testid attributes added for testing
