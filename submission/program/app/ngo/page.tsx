"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  HeartHandshake,
  Search,
  LayoutDashboard,
  Package,
  ClipboardList,
  Menu,
  AlertCircle,
  CheckCircle,
  Trash2,
  LogOut,
  User,
  Map,
} from "lucide-react"
import { dataStore, type HelpRequest, type InventoryItem } from "@/lib/data-store"
import { authStore, type AuthSession } from "@/lib/auth-store"
import { NGOLogin } from "@/components/ngo-login"
import { RequestCard } from "@/components/request-card"
import { InventoryForm } from "@/components/inventory-form"
import { InventoryUpdateForm } from "@/components/inventory-update-form"
import { getWeatherData, getRiskColor, type WeatherData } from "@/lib/weather-data"

export default function NGODashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "inventory" | "disaster-map">("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showInventoryForm, setShowInventoryForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [updatingItem, setUpdatingItem] = useState<InventoryItem | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "claimed" | "fulfilled">("all")

  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [selectedRegion, setSelectedRegion] = useState<WeatherData | null>(null)

  useEffect(() => {
    const currentSession = authStore.getSession()
    if (currentSession) {
      setIsAuthenticated(true)
      setSession(currentSession)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      setRequests(dataStore.getRequests())
      setInventory(dataStore.getInventory())
      setWeatherData(getWeatherData())
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (activeTab === "disaster-map" && typeof window !== "undefined") {
      // Add Leaflet CSS if not already added
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Load Leaflet JS if not already loaded
      if (!window.L) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.async = true
        script.onload = () => setTimeout(initializeMap, 100)
        document.body.appendChild(script)
      } else {
        setTimeout(initializeMap, 100)
      }
    }
  }, [activeTab, weatherData])

  const initializeMap = () => {
    if (typeof window === "undefined" || !window.L || weatherData.length === 0) return

    const mapContainer = document.getElementById("ngo-disaster-map")
    if (!mapContainer) return
    mapContainer.innerHTML = ""

    const map = window.L.map("ngo-disaster-map").setView([20.5937, 78.9629], 5)

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map)

    weatherData.forEach((region) => {
      const color = getRiskColor(region.riskLevel)
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
          </div>
        </div>
      `

      marker.bindPopup(popupContent)
      marker.on("click", () => setSelectedRegion(region))
    })
  }

  const handleLoginSuccess = () => {
    const currentSession = authStore.getSession()
    setSession(currentSession)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authStore.logout()
    setIsAuthenticated(false)
    setSession(null)
  }

  const handleClaimRequest = (id: string) => {
    dataStore.updateRequest(id, {
      status: "claimed",
      claimedBy: session?.organizationName || "Your NGO",
    })
    setRequests(dataStore.getRequests())
  }

  const handleFulfillRequest = (id: string) => {
    dataStore.updateRequest(id, {
      status: "fulfilled",
      fulfilledAt: new Date().toISOString(),
    })
    setRequests(dataStore.getRequests())
  }

  const handleDeleteRequest = (id: string) => {
    dataStore.deleteRequest(id)
    setRequests(dataStore.getRequests())
  }

  const handleAddInventory = (item: Omit<InventoryItem, "id" | "lastUpdated">) => {
    dataStore.addInventoryItem(item)
    setInventory(dataStore.getInventory())
    setShowInventoryForm(false)
  }

  const handleEditInventory = (item: Omit<InventoryItem, "id" | "lastUpdated">) => {
    if (editingItem) {
      dataStore.updateInventoryItem(editingItem.id, item)
      setInventory(dataStore.getInventory())
      setEditingItem(null)
    }
  }

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    dataStore.updateInventoryItem(id, { quantity: newQuantity })
    setInventory(dataStore.getInventory())
    setUpdatingItem(null)
  }

  const handleDeleteInventory = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      dataStore.deleteInventoryItem(id)
      setInventory(dataStore.getInventory())
    }
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.itemsNeeded.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = filterStatus === "all" || req.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const claimedRequests = requests.filter((r) => r.status === "claimed")
  const fulfilledRequests = requests.filter((r) => r.status === "fulfilled")
  const criticalRequests = requests.filter((r) => r.urgency === "critical" && r.status === "pending")

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = inventory.filter((item) => item.quantity < 100)

  // Calculate critical and high risk regions for the disaster map
  const criticalRegions = weatherData.filter((r) => r.riskLevel === "critical")
  const highRiskRegions = weatherData.filter((r) => r.riskLevel === "high")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <HeartHandshake className="w-10 h-10 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <NGOLogin onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <HeartHandshake className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground block">SAHAARA</span>
                <span className="text-xs text-muted-foreground">NGO Dashboard</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium text-foreground">{session?.organizationName}</div>
                <div className="text-xs text-muted-foreground">{session?.email}</div>
              </div>
            </div>
            <Link href="/community">
              <Button variant="outline" size="sm">
                Community Portal
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive bg-transparent">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 bg-card border-r border-border transition-transform duration-300 z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab("overview")
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "overview" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Overview</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("requests")
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "requests" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                <span className="font-medium">Requests</span>
                {pendingRequests.length > 0 && (
                  <Badge className="ml-auto bg-destructive text-destructive-foreground">{pendingRequests.length}</Badge>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab("inventory")
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "inventory"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="font-medium">Inventory</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("disaster-map")
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "disaster-map"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <Map className="w-5 h-5" />
                <span className="font-medium">Disaster Map</span>
                {criticalRegions.length > 0 && (
                  <Badge className="ml-auto bg-destructive text-destructive-foreground">{criticalRegions.length}</Badge>
                )}
              </button>
            </nav>

            <div className="mt-8 p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span className="text-sm font-semibold text-foreground">Quick Stats</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium text-foreground">{pendingRequests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Critical</span>
                  <span className="font-medium text-destructive">{criticalRequests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low Stock</span>
                  <span className="font-medium text-warning">{lowStockItems.length}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden relative mb-6">
                <Image
                  src="/images/ngo-operations.jpg"
                  alt="NGO relief operations and coordination center"
                  width={1200}
                  height={250}
                  className="w-full h-[200px] md:h-[250px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50 flex items-center">
                  <div className="px-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
                    <p className="text-muted-foreground">Monitor and coordinate relief efforts in real-time</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-card border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Requests</span>
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{requests.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">All time</div>
                </Card>

                <Card className="p-6 bg-card border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <AlertCircle className="w-5 h-5 text-warning" />
                  </div>
                  <div className="text-3xl font-bold text-warning">{pendingRequests.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">{criticalRequests.length} critical cases</div>
                </Card>

                <Card className="p-6 bg-card border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Fulfilled</span>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="text-3xl font-bold text-success">{fulfilledRequests.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {requests.length > 0 ? Math.round((fulfilledRequests.length / requests.length) * 100) : 0}%
                    completion rate
                  </div>
                </Card>

                <Card className="p-6 bg-card border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Inventory Items</span>
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{inventory.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">{totalInventoryValue} total units</div>
                </Card>
              </div>

              {/* Critical Requests */}
              {criticalRequests.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <h2 className="text-xl font-bold text-foreground">Critical Requests</h2>
                    <Badge className="bg-destructive text-destructive-foreground">{criticalRequests.length}</Badge>
                  </div>
                  <div className="space-y-4">
                    {criticalRequests.slice(0, 3).map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        viewMode="ngo"
                        onClaim={handleClaimRequest}
                        onFulfill={handleFulfillRequest}
                        onDelete={handleDeleteRequest}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Recent Requests</h2>
                <div className="space-y-4">
                  {requests.slice(0, 5).map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      viewMode="ngo"
                      onClaim={handleClaimRequest}
                      onFulfill={handleFulfillRequest}
                      onDelete={handleDeleteRequest}
                    />
                  ))}
                </div>
              </div>

              {/* Low Stock Alert */}
              {lowStockItems.length > 0 && (
                <Card className="p-6 bg-warning/5 border-warning/20">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <h3 className="text-lg font-bold text-foreground">Low Stock Alert</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                        <div>
                          <div className="font-medium text-foreground">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-warning">
                            {item.quantity} {item.unit}
                          </div>
                          <div className="text-xs text-muted-foreground">Low stock</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Help Requests</h1>
                <p className="text-muted-foreground">Manage and respond to community requests</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  All: {requests.length}
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "pending"
                      ? "bg-warning text-warning-foreground"
                      : "bg-warning/10 text-warning hover:bg-warning/20"
                  }`}
                >
                  Pending: {pendingRequests.length}
                </button>
                <button
                  onClick={() => setFilterStatus("claimed")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "claimed"
                      ? "bg-info text-info-foreground"
                      : "bg-info/10 text-info hover:bg-info/20"
                  }`}
                >
                  Claimed: {claimedRequests.length}
                </button>
                <button
                  onClick={() => setFilterStatus("fulfilled")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "fulfilled"
                      ? "bg-success text-success-foreground"
                      : "bg-success/10 text-success hover:bg-success/20"
                  }`}
                >
                  Fulfilled: {fulfilledRequests.length}
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, location, or items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border text-foreground"
                />
              </div>

              {/* Requests List */}
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <Card className="p-8 bg-card border-border text-center">
                    <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No requests found</p>
                  </Card>
                ) : (
                  filteredRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      viewMode="ngo"
                      onClaim={handleClaimRequest}
                      onFulfill={handleFulfillRequest}
                      onDelete={handleDeleteRequest}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
                  <p className="text-muted-foreground">Track and manage relief supplies</p>
                </div>
                <Button
                  onClick={() => setShowInventoryForm(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Inventory Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-6 bg-card border-border">
                  <div className="text-sm text-muted-foreground mb-1">Total Items</div>
                  <div className="text-2xl font-bold text-foreground">{inventory.length}</div>
                </Card>
                <Card className="p-6 bg-card border-border">
                  <div className="text-sm text-muted-foreground mb-1">Total Units</div>
                  <div className="text-2xl font-bold text-foreground">{totalInventoryValue}</div>
                </Card>
                <Card className="p-6 bg-card border-border">
                  <div className="text-sm text-muted-foreground mb-1">Low Stock Items</div>
                  <div className="text-2xl font-bold text-warning">{lowStockItems.length}</div>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.map((item) => (
                  <Card key={item.id} className="p-5 bg-card border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.quantity > 100
                            ? "bg-success/10 text-success"
                            : item.quantity > 50
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {item.quantity > 100 ? "In Stock" : item.quantity > 50 ? "Low" : "Critical"}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium text-foreground">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium text-foreground">{item.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                        className="flex-1 bg-transparent"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUpdatingItem(item)}
                        className="flex-1 bg-transparent"
                      >
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInventory(item.id)}
                        className="bg-transparent text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "disaster-map" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Disaster Risk Map</h1>
                <p className="text-muted-foreground">Monitor weather conditions and disaster risk zones across India</p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <div className="text-2xl font-bold text-green-500">Live</div>
                  <div className="text-sm text-muted-foreground">Real-time Data</div>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Map Section */}
                <div className="lg:col-span-2">
                  <Card className="p-6 bg-card border-border">
                    <h2 className="text-xl font-bold text-foreground mb-4">Interactive Weather Map</h2>
                    <div
                      id="ngo-disaster-map"
                      className="w-full h-[500px] rounded-lg overflow-hidden border border-border"
                    />
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

                {/* Sidebar - Region Details */}
                <div className="space-y-6">
                  {selectedRegion && (
                    <Card className="p-6 bg-card border-border">
                      <h3 className="text-lg font-bold text-foreground mb-4">Selected Region</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xl font-bold text-foreground">{selectedRegion.region}</div>
                          <div className="text-sm text-muted-foreground">{selectedRegion.state}</div>
                        </div>
                        <Badge
                          className="text-white"
                          style={{ backgroundColor: getRiskColor(selectedRegion.riskLevel) }}
                        >
                          {selectedRegion.riskLevel.toUpperCase()} RISK
                        </Badge>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Temperature</span>
                            <span className="font-semibold text-foreground">
                              {selectedRegion.temperature.toFixed(1)}°C
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Humidity</span>
                            <span className="font-semibold text-foreground">{selectedRegion.humidity.toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rainfall</span>
                            <span className="font-semibold text-foreground">
                              {selectedRegion.rainfall.toFixed(1)}mm
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Wind Speed</span>
                            <span className="font-semibold text-foreground">
                              {selectedRegion.windSpeed.toFixed(1)} km/h
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Critical Alerts */}
                  <Card className="p-6 bg-card border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <h3 className="text-lg font-bold text-foreground">Critical Alerts</h3>
                    </div>
                    <div className="space-y-3">
                      {criticalRegions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No critical alerts</p>
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

                  {/* All Regions */}
                  <Card className="p-6 bg-card border-border">
                    <h3 className="text-lg font-bold text-foreground mb-4">All Regions</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showInventoryForm && <InventoryForm onClose={() => setShowInventoryForm(false)} onSubmit={handleAddInventory} />}

      {editingItem && (
        <InventoryForm editItem={editingItem} onClose={() => setEditingItem(null)} onSubmit={handleEditInventory} />
      )}

      {updatingItem && (
        <InventoryUpdateForm
          item={updatingItem}
          onClose={() => setUpdatingItem(null)}
          onUpdate={handleUpdateQuantity}
        />
      )}
    </div>
  )
}

declare global {
  interface Window {
    L: any
  }
}
