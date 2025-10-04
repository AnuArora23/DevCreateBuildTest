"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { HeartHandshake, Search, Plus, MapPin, Clock, AlertCircle, Package } from "lucide-react"
import { dataStore, type HelpRequest, type InventoryItem } from "@/lib/data-store"
import { RequestForm } from "@/components/request-form"
import { RequestCard } from "@/components/request-card"

export default function CommunityPortal() {
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"requests" | "resources">("requests")

  useEffect(() => {
    setRequests(dataStore.getRequests())
    setInventory(dataStore.getInventory())
  }, [])

  const filteredRequests = requests.filter(
    (req) =>
      req.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.itemsNeeded.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleRequestSubmit = (request: Omit<HelpRequest, "id" | "timestamp" | "status">) => {
    const newRequest = dataStore.addRequest(request)
    setRequests([newRequest, ...requests])
    setShowRequestForm(false)
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length
  const criticalCount = requests.filter((r) => r.urgency === "critical" && r.status === "pending").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground block">Relief Connect</span>
              <span className="text-xs text-muted-foreground">Community Portal</span>
            </div>
          </Link>
          <Link href="/ngo">
            <Button variant="outline" size="sm">
              NGO Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Community Portal Hero Banner */}
        <div className="mb-8 rounded-2xl overflow-hidden relative">
          <Image
            src="/images/community-banner.jpg"
            alt="Community members helping each other during disaster"
            width={1200}
            height={300}
            className="w-full h-[200px] md:h-[300px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50 flex items-center">
            <div className="container mx-auto px-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Community Portal</h1>
              <p className="text-muted-foreground max-w-2xl">Submit your needs and track relief efforts in real-time</p>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-card border-border">
            <div className="text-2xl font-bold text-foreground">{requests.length}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-2xl font-bold text-warning">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending Help</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <div className="text-sm text-muted-foreground">Critical Cases</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-2xl font-bold text-success">{inventory.length}</div>
            <div className="text-sm text-muted-foreground">Resources Available</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Request Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border-border sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Need Help?</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Submit your request and NGOs in your area will be notified immediately. All requests are tracked in
                real-time.
              </p>
              <Button
                onClick={() => setShowRequestForm(true)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Help Request
              </Button>

              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Response Time</div>
                      <div className="text-xs text-muted-foreground">Average 2-4 hours</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Coverage</div>
                      <div className="text-xs text-muted-foreground">All Punjab districts</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Resources</div>
                      <div className="text-xs text-muted-foreground">{inventory.length} items available</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Requests & Resources */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "requests"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Help Requests
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "resources"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Available Resources
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={activeTab === "requests" ? "Search requests..." : "Search resources..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border text-foreground"
              />
            </div>

            {/* Content */}
            {activeTab === "requests" ? (
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <Card className="p-8 bg-card border-border text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No requests found</p>
                  </Card>
                ) : (
                  filteredRequests.map((request) => (
                    <RequestCard key={request.id} request={request} viewMode="community" />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInventory.length === 0 ? (
                  <Card className="p-8 bg-card border-border text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No resources found</p>
                  </Card>
                ) : (
                  filteredInventory.map((item) => (
                    <Card key={item.id} className="p-4 bg-card border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">{item.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              <span>
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.quantity > 100
                              ? "bg-success/10 text-success"
                              : item.quantity > 50
                                ? "bg-warning/10 text-warning"
                                : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {item.quantity > 100 ? "In Stock" : item.quantity > 50 ? "Low Stock" : "Critical"}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && <RequestForm onClose={() => setShowRequestForm(false)} onSubmit={handleRequestSubmit} />}
    </div>
  )
}
