"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, AlertCircle, Phone, CheckCircle, Eye } from "lucide-react"
import type { HelpRequest } from "@/lib/data-store"
import { RequestDetailsModal } from "./request-details-modal"

interface RequestCardProps {
  request: HelpRequest
  viewMode: "community" | "ngo"
  onClaim?: (id: string) => void
  onFulfill?: (id: string) => void
  onDelete?: (id: string) => void
}

export function RequestCard({ request, viewMode, onClaim, onFulfill, onDelete }: RequestCardProps) {
  const [showDetails, setShowDetails] = useState(false)

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

  const timeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)} days ago`
    } else if (diffHours > 0) {
      return `${diffHours} hours ago`
    } else {
      return `${diffMins} minutes ago`
    }
  }

  return (
    <>
      <Card className="p-5 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-foreground text-lg">{request.victimName}</h3>
              <Badge className={getUrgencyColor(request.urgency)} variant="outline">
                {request.urgency}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{request.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{timeAgo(request.timestamp)}</span>
              </div>
              {viewMode === "ngo" && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{request.contactInfo}</span>
                </div>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(request.status)} variant="outline">
            {request.status}
          </Badge>
        </div>

        <p className="text-sm text-foreground mb-4 leading-relaxed line-clamp-2">{request.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {request.itemsNeeded.slice(0, 3).map((item, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
            >
              {item}
            </span>
          ))}
          {request.itemsNeeded.length > 3 && (
            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
              +{request.itemsNeeded.length - 3} more
            </span>
          )}
        </div>

        {request.claimedBy && (
          <div className="flex items-center gap-2 text-sm text-info mb-3">
            <AlertCircle className="w-4 h-4" />
            <span>Claimed by {request.claimedBy}</span>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-border">
          <button
            onClick={() => setShowDetails(true)}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          {viewMode === "ngo" && (
            <>
              {request.status === "pending" && onClaim && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onClaim(request.id)
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Claim
                </button>
              )}
              {request.status === "claimed" && onFulfill && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onFulfill(request.id)
                  }}
                  className="flex-1 px-4 py-2 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Fulfill
                </button>
              )}
            </>
          )}
        </div>
      </Card>

      {showDetails && (
        <RequestDetailsModal
          request={request}
          onClose={() => setShowDetails(false)}
          onClaim={onClaim}
          onFulfill={onFulfill}
          onDelete={onDelete}
          viewMode={viewMode}
        />
      )}
    </>
  )
}
