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

## What's Been Implemented (Mar 8-10, 2026)

### Latest Updates (Mar 10, 2026)
- [x] Added new **Business Environment** panel (EPU + Business Confidence):
  - New endpoint `/api/business-environment` using SBP EasyData datasets `TS_GP_MFS_EPUI_M` and `TS_GP_RL_BCSIND_M`
  - KPI cards: EPU (4 newspapers), Current BCI, Expected BCI
  - Tabbed analysis views: **Overview** (trend lines), **Sectors** (bar chart), **Drivers** (current vs expected metrics)
  - Coverage metadata included (selected series vs available BCI series)
- [x] Debt semantics corrected end-to-end:
  - For Gov. Debt, **increase = red (bad)** and **decrease = green (good)** on card + modal + % change bars
- [x] Added **Central Government Debt** to Economic Indicators:
  - New backend endpoint: `/api/gov-debt` using SBP EasyData series
  - Card shows latest total debt with MoM change in PKR Billion format
  - Modal supports breakdown view with **Internal Debt + External Debt** and total overlay
- [x] Added **SPI integration** in Inflation Monitor using Google Sheet source:
  - Weekly SPI from `main raw data` and Monthly SPI from `monthly_spi`
  - Added new APIs: `/api/spi-weekly` and `/api/spi-monthly` with low-frequency cache (12h)
  - Added SPI cards + SPI modal with historical chart and `% Change` toggle
- [x] Enhanced Weekly SPI modal and panel UX:
  - Weekly chart now includes **Combined + Quintile series (Q1–Q5)** with select/deselect controls
  - Tooltip now shows full **week-ending date** (month + day + year)
  - Inflation panel now shows item movement chips for Weekly SPI: **↑ increase, ↓ decrease, = stable**
- [x] SPI sentiment and source polish:
  - SPI increases are now treated visually as **negative** (red), while decreases are **positive** (green)
  - Modal source now links directly to **spi.pakesda.com** (without Google Sheet wording)
- [x] Fixed missing latest SPI weekly points (2026 rows):
  - Switched backend SPI ingestion from CSV export to **XLSX export parsing** to capture formula-evaluated latest values
  - Weekly SPI now correctly includes values up to **Mar 05, 2026** (as present in the sheet)
- [x] Completed **Liquid FX modal breakdown flow** end-to-end:
  - Breakdown toggle now cleanly switches between total and stacked breakdown views
  - `% Change` and `Breakdown` toggles now reset each other to avoid conflicting chart states
  - Breakdown legend labels now match Liquid FX semantics: **Net Reserves with SBP / Net Reserves with Banks**
- [x] Fixed Liquid FX summary metadata in modal:
  - Shows latest weekly date (`dateFormatted`) instead of `N/A`
  - Uses **WoW** change label/value (instead of MoM)
- [x] Verified in browser smoke test with interactive modal checks (open, toggle, labels, summary)

### Backend (FastAPI)
- [x] `/api/health` - Health check endpoint
- [x] `/api/news` - RSS feed aggregation from 12+ Pakistani news sources with category filtering
- [x] `/api/economic` - Economic indicators (PKR/USD, KSE-100, inflation)
- [x] `/api/weather` - Weather data for major cities (Karachi, Lahore, Islamabad, Peshawar, Quetta, Multan)
- [x] `/api/security` - Security and political alerts
- [x] `/api/regional` - Regional relations data (India, China, Afghanistan, Iran, Saudi Arabia, USA)
- [x] `/api/infrastructure` - Power grid, internet, airport & port data for 5 airports and 3 ports
- [x] `/api/map-data` - Map markers for Pakistani cities and CPEC routes
- [x] `/api/remittances` - **LIVE** Workers' remittances from SBP API (1972-present)
- [x] `/api/gold-reserves` - **LIVE** Gold reserves from SBP API (1990-present)
- [x] `/api/forex-reserves` - **LIVE** Total forex reserves from SBP API (1990-present)
- [x] `/api/current-account` - **LIVE** Current account balance from SBP API
- [x] `/api/imports` - **LIVE** Imports data from SBP API (1990-present)
- [x] `/api/exports` - **LIVE** Exports data from SBP API (1990-present)
- [x] `/api/pkr-usd` - **LIVE** PKR/USD exchange rate from SBP API
- [x] `/api/psx-data` - **LIVE** KSE-100 Index data scraped from PSX (dps.psx.com.pk)
- [x] `/api/cpi-yoy` - **LIVE** CPI Year-on-Year inflation from SBP API (2016-present)
- [x] `/api/cpi-mom` - **LIVE** CPI Month-on-Month inflation from SBP API (2016-present)
- [x] `/api/cpi-yoy-historical` - **LIVE** Complete CPI YoY history (1965-2026, 656 points, 8 base year periods)
- [x] `/api/cpi-mom-historical` - **LIVE** Complete CPI MoM history (1964-2026, 711 points, 8 base year periods)
- [x] `/api/spi-weekly` - **LIVE** Weekly SPI (Combined + Q1-Q5 + increase/decrease/stable counts) from Google Sheet
- [x] `/api/spi-monthly` - **LIVE** Monthly SPI (Q1 index) from Google Sheet
- [x] `/api/gov-debt` - **LIVE** Central Government Debt (Total + Internal + External) from SBP EasyData
- [x] `/api/business-environment` - **LIVE** EPU + Business Confidence composite data for new panel
- [x] `/api/admin/airport-history` - Historical airport traffic data with date/code filters
- [x] `/api/admin/port-history` - Historical port traffic data with date/code filters
- [x] `/api/admin/airport-history/summary` - Airport history statistics (avg/max departures, arrivals)
- [x] `/api/admin/port-history/summary` - Port history statistics (avg/max vessels, arrivals, departures)

### Frontend (React)
- [x] Header with logo, live indicator, **Pakistan time (PKT/UTC+5)**, refresh button
- [x] News ticker (scrolling headlines)
- [x] Bento grid layout with responsive panels (10 bottom panels)
- [x] NewsPanel - Latest news with category tabs and infinite scroll
- [x] EconomicPanel - 10 indicators with all **LIVE** (PSX, PKR/USD, Current A/C, Gold, Forex, Imports, Exports, Remittances, Gov. Debt, Liquid FX)
- [x] **InflationPanel** - CPI (YoY/MoM) + SPI (Weekly/Monthly) with clickable chart modals and movement summary chips
- [x] **BusinessEnvironmentPanel** - EPU + BCI composite panel with Overview/Sectors/Drivers tabs
- [x] **SBPDataModal** - Reusable chart modal with MoM%, YoY%, time range selectors
- [x] **PSXDataModal** - KSE-100 modal with Day High/Low, Volume, Previous Close, YTD/YoY changes
- [x] **CPIDataModal** - CPI modal with 60-year history, base year markers, 10Y/20Y/ALL time ranges
- [x] SecurityPanel - Security/political alerts with severity indicators
- [x] WeatherPanel - Weather for 6 major cities
- [x] RegionalPanel - Diplomatic relations status
- [x] **InfrastructurePanel** - Power Grid (status, load shedding, capacity) and Internet (status, speed, outages)
- [x] **AirTrafficPanel** - 5 airports with operational status, departures/arrivals (FlightStats)
- [x] **MarineTrafficPanel** - 3 ports with In Port, Arrivals, Departures, Expected (MyShipTracking)
- [x] **GovernancePanel** - Provincial CM Tracker with projects, completed, focus area, impact score, days in power
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
- **KSE-100 Index**: **LIVE** - Scraped from Pakistan Stock Exchange (dps.psx.com.pk)
- **PKR/USD Exchange Rate**: **LIVE** - State Bank of Pakistan EasyData API
- **Remittances**: **LIVE** - State Bank of Pakistan EasyData API (1972-present, 643 data points)
- **Gold Reserves**: **LIVE** - State Bank of Pakistan EasyData API (1990-present)
- **Forex Reserves**: **LIVE** - State Bank of Pakistan EasyData API (1990-present)
- **Current Account**: **LIVE** - State Bank of Pakistan EasyData API
- **Imports/Exports**: **LIVE** - State Bank of Pakistan EasyData API
- **CPI Inflation (YoY/MoM)**: **LIVE** - State Bank of Pakistan EasyData API (1964-2026, 8 base year periods combined)
- **SPI (Weekly/Monthly)**: **LIVE** - Google Sheet source (`main raw data`, `monthly_spi`)
- **Central Government Debt**: **LIVE** - SBP EasyData (`TS_GP_BAM_CENGOVTD_M` dataset via total/internal/external series)
- **Business Environment (EPU + BCI)**: **LIVE** - SBP EasyData (`TS_GP_MFS_EPUI_M`, `TS_GP_RL_BCSIND_M`)
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
- [x] **LIVE remittances data from SBP API with interactive chart modal**
- [x] **LIVE PKR/USD exchange rate from SBP API**
- [x] **LIVE KSE-100 Index data from PSX with clickable modal** (Mar 6, 2026)
- [x] **LIVE CPI Inflation Monitor panel with YoY/MoM data** (Mar 8, 2026)

### P1 (High Priority)
- [ ] Make Governance Panel dynamic (scrape from pakistanprojects.pakesda.com)
- [ ] Real-time data for Security & Politics panel (GDELT, ACLED, or RSS feeds)
- [ ] Real weather API integration (OpenWeatherMap)
- [ ] WebSocket for real-time updates
- [ ] User preferences persistence

### P2 (Medium Priority)
- [ ] Historical data charts for PSX (intraday graphs)
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
1. Make Governance Panel dynamic
2. Implement real-time data for Security & Politics panel
3. Improve SBP initial-load resilience (parallel fetch/caching tuning)
4. Add OpenWeatherMap API for real weather data

## Technical Notes
- Preview URL may show "unavailable" due to gateway warm-up; app runs correctly locally
- MapLibre GL requires async import pattern in React
- RSS feeds refresh every 5 minutes
- PSX data cached for 5 minutes
- All data-testid attributes added for testing
