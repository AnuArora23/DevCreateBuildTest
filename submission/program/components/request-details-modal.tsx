"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, MapPin, Clock, Phone, AlertCircle, CheckCircle, User } from "lucide-react"
import type { HelpRequest } from "@/lib/data-store"

interface RequestDetailsModalProps {
  request: HelpRequest
  onClose: () => void
  onClaim?: (id: string) => void
  onFulfill?: (id: string) => void
  onDelete?: (id: string) => void
  viewMode: "community" | "ngo"
}

export function RequestDetailsModal({
  request,
  onClose,
  onClaim,
  onFulfill,
  onDelete,
  viewMode,
}: RequestDetailsModalProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "high":
        return "bg-warning/10 text-warning border-warning/20"
      case "medium":
        return "bg-info/10 text-info border-info/20"
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "bg-success/10 text-success border-success/20"
      case "claimed":
        return "bg-info/10 text-info border-info/20"
      default:
        return "bg-warning/10 text-warning border-warning/20"
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Request Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-2xl font-bold text-foreground">{request.victimName}</h3>
              <Badge className={getUrgencyColor(request.urgency)} variant="outline">
                {request.urgency}
              </Badge>
              <Badge className={getStatusColor(request.status)} variant="outline">
                {request.status}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{request.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatDate(request.timestamp)}</span>
              </div>
              {viewMode === "ngo" && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{request.contactInfo}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Request ID: {request.id}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
            <p className="text-foreground leading-relaxed">{request.description}</p>
          </div>

          {/* Items Needed */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Items Needed</h4>
            <div className="flex flex-wrap gap-2">
              {request.itemsNeeded.map((item, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Status Information */}
          {request.claimedBy && (
            <Card className="p-4 bg-info/5 border-info/20">
              <div className="flex items-center gap-2 text-info mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Claimed Information</span>
              </div>
              <div className="text-sm text-foreground">
                <p>This request has been claimed by {request.claimedBy}</p>
              </div>
            </Card>
          )}

          {request.status === "fulfilled" && request.fulfilledAt && (
            <Card className="p-4 bg-success/5 border-success/20">
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Fulfilled</span>
              </div>
              <div className="text-sm text-foreground">
                <p>This request was fulfilled on {formatDate(request.fulfilledAt)}</p>
              </div>
            </Card>
          )}

          {/* Actions */}
          {viewMode === "ngo" && (
            <div className="flex gap-3 pt-4 border-t border-border">
              {request.status === "pending" && onClaim && (
                <Button
                  onClick={() => {
                    onClaim(request.id)
                    onClose()
                  }}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Claim Request
                </Button>
              )}
              {request.status === "claimed" && onFulfill && (
                <Button
                  onClick={() => {
                    onFulfill(request.id)
                    onClose()
                  }}
                  className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Fulfilled
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this request?")) {
                      onDelete(request.id)
                      onClose()
                    }
                  }}
                  variant="outline"
                  className="bg-transparent text-destructive hover:text-destructive"
                >
                  Delete Request
                </Button>
              )}
            </div>
          )}

          {viewMode === "community" && (
            <div className="pt-4 border-t border-border">
              <Button onClick={onClose} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Close
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
