"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Cloud, Droplets, Wind, Thermometer, MapPin, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getWeatherData, getRiskColor, type WeatherData } from "@/lib/weather-data"

export default function DisasterMapPage() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [selectedRegion, setSelectedRegion] = useState<WeatherData | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load weather data
  useEffect(() => {
    loadWeatherData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadWeatherData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Load Leaflet dynamically (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Add Leaflet CSS
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)

      // Load Leaflet JS
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.async = true
      script.onload = () => initializeMap()
      document.body.appendChild(script)

      return () => {
        document.head.removeChild(link)
        document.body.removeChild(script)
      }
    }
  }, [weatherData])

  const loadWeatherData = () => {
    const data = getWeatherData()
    setWeatherData(data)
    setLastUpdate(new Date())
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadWeatherData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const initializeMap = () => {
    if (typeof window === "undefined" || !window.L || weatherData.length === 0) return

    // Remove existing map if any
    const mapContainer = document.getElementById("disaster-map")
    if (!mapContainer) return
    mapContainer.innerHTML = ""

    // Initialize map centered on India
    const map = window.L.map("disaster-map").setView([20.5937, 78.9629], 5)

    // Add OpenStreetMap tiles
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map)

    // Add markers for each region
    weatherData.forEach((region) => {
      const color = getRiskColor(region.riskLevel)

      // Create custom icon
      const icon = window.L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const marker = window.L.marker(region.coordinates, { icon }).addTo(map)

      // Add popup
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${region.region}, ${region.state}</h3>
          <div style="margin-bottom: 8px;">
            <span style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              background-color: ${color};
              color: white;
            ">${region.riskLevel.toUpperCase()}</span>
          </div>
          <div style="font-size: 14px; line-height: 1.6;">
            <div><strong>🌡️ Temp:</strong> ${region.temperature.toFixed(1)}°C</div>
            <div><strong>💧 Humidity:</strong> ${region.humidity.toFixed(0)}%</div>
            <div><strong>🌧️ Rainfall:</strong> ${region.rainfall.toFixed(1)}mm</div>
            <div><strong>💨 Wind:</strong> ${region.windSpeed.toFixed(1)} km/h</div>
            ${
              region.disasterType.length > 0
                ? `<div style="margin-top: 8px;"><strong>⚠️ Risks:</strong> ${region.disasterType.join(", ")}</div>`
                : ""
            }
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      // Click handler
      marker.on("click", () => {
        setSelectedRegion(region)
      })
    })
  }

  const criticalRegions = weatherData.filter((r) => r.riskLevel === "critical")
  const highRiskRegions = weatherData.filter((r) => r.riskLevel === "high")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">SAHAARA - Disaster Risk Map</span>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-card border-border">
            <div className="text-2xl font-bold text-red-500">{criticalRegions.length}</div>
            <div className="text-sm text-muted-foreground">Critical Zones</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-2xl font-bold text-orange-500">{highRiskRegions.length}</div>
            <div className="text-sm text-muted-foreground">High Risk Zones</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-2xl font-bold text-primary">{weatherData.length}</div>
            <div className="text-sm text-muted-foreground">Monitored Regions</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-2xl font-bold text-green-500">
              {lastUpdate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-sm text-muted-foreground">Last Updated</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Real-Time Weather & Risk Map</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cloud className="w-4 h-4" />
                  <span>Live Data</span>
                </div>
              </div>

              {/* Map Container */}
              <div id="disaster-map" className="w-full h-[500px] rounded-lg overflow-hidden border border-border" />

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="font-semibold text-foreground">Risk Levels:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600" />
                  <span className="text-muted-foreground">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-600" />
                  <span className="text-muted-foreground">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Low</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Region Details & Alerts */}
          <div className="space-y-6">
            {/* Selected Region Details */}
            {selectedRegion && (
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Selected Region</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xl font-bold text-foreground">{selectedRegion.region}</div>
                    <div className="text-sm text-muted-foreground">{selectedRegion.state}</div>
                  </div>

                  <Badge className="text-white" style={{ backgroundColor: getRiskColor(selectedRegion.riskLevel) }}>
                    {selectedRegion.riskLevel.toUpperCase()} RISK
                  </Badge>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Thermometer className="w-4 h-4" />
                        <span>Temperature</span>
                      </div>
                      <span className="font-semibold text-foreground">{selectedRegion.temperature.toFixed(1)}°C</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Droplets className="w-4 h-4" />
                        <span>Humidity</span>
                      </div>
                      <span className="font-semibold text-foreground">{selectedRegion.humidity.toFixed(0)}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Cloud className="w-4 h-4" />
                        <span>Rainfall (24h)</span>
                      </div>
                      <span className="font-semibold text-foreground">{selectedRegion.rainfall.toFixed(1)}mm</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wind className="w-4 h-4" />
                        <span>Wind Speed</span>
                      </div>
                      <span className="font-semibold text-foreground">{selectedRegion.windSpeed.toFixed(1)} km/h</span>
                    </div>
                  </div>

                  {selectedRegion.disasterType.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>Active Threats</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedRegion.disasterType.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Critical Alerts */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-foreground">Critical Alerts</h3>
              </div>

              <div className="space-y-3">
                {criticalRegions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No critical alerts at this time</p>
                ) : (
                  criticalRegions.map((region) => (
                    <div
                      key={region.region}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors"
                      onClick={() => setSelectedRegion(region)}
                    >
                      <div className="font-semibold text-foreground text-sm">{region.region}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {region.disasterType.join(", ") || "Extreme conditions"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* All Regions List */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">All Monitored Regions</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {weatherData.map((region) => (
                  <div
                    key={region.region}
                    className="p-3 rounded-lg bg-card/50 border border-border cursor-pointer hover:bg-card transition-colors"
                    onClick={() => setSelectedRegion(region)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground text-sm">{region.region}</span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getRiskColor(region.riskLevel) }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">{region.state}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {region.temperature.toFixed(0)}°C • {region.humidity.toFixed(0)}% • {region.rainfall.toFixed(0)}
                      mm
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Extend Window interface for Leaflet
declare global {
  interface Window {
    L: any
  }
}
