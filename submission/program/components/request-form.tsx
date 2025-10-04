"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { X, Plus, Trash2 } from "lucide-react"
import type { HelpRequest } from "@/lib/data-store"

interface RequestFormProps {
  onClose: () => void
  onSubmit: (request: Omit<HelpRequest, "id" | "timestamp" | "status">) => void
}

export function RequestForm({ onClose, onSubmit }: RequestFormProps) {
  const [formData, setFormData] = useState({
    victimName: "",
    location: "",
    contactInfo: "",
    description: "",
    urgency: "medium" as "critical" | "high" | "medium" | "low",
  })
  const [itemsNeeded, setItemsNeeded] = useState<string[]>([""])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const filteredItems = itemsNeeded.filter((item) => item.trim() !== "")
    if (filteredItems.length === 0) {
      alert("Please add at least one item needed")
      return
    }
    onSubmit({
      ...formData,
      itemsNeeded: filteredItems,
    })
  }

  const addItem = () => {
    setItemsNeeded([...itemsNeeded, ""])
  }

  const removeItem = (index: number) => {
    setItemsNeeded(itemsNeeded.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...itemsNeeded]
    newItems[index] = value
    setItemsNeeded(newItems)
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Submit Help Request</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="victimName" className="text-foreground">
              Name / Organization
            </Label>
            <Input
              id="victimName"
              required
              value={formData.victimName}
              onChange={(e) => setFormData({ ...formData, victimName: e.target.value })}
              placeholder="Your name or organization name"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground">
              Location
            </Label>
            <Input
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, District, Province"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo" className="text-foreground">
              Contact Information
            </Label>
            <Input
              id="contactInfo"
              required
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              placeholder="Phone number or email"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Items Needed</Label>
            <div className="space-y-2">
              {itemsNeeded.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder="e.g., Food, Water, Medicine"
                    className="bg-background border-border text-foreground"
                  />
                  {itemsNeeded.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your situation and specific needs..."
              rows={4}
              className="bg-background border-border text-foreground resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency" className="text-foreground">
              Urgency Level
            </Label>
            <select
              id="urgency"
              value={formData.urgency}
              onChange={(e) =>
                setFormData({ ...formData, urgency: e.target.value as "critical" | "high" | "medium" | "low" })
              }
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground"
            >
              <option value="low">Low - Can wait a few days</option>
              <option value="medium">Medium - Needed within 24 hours</option>
              <option value="high">High - Needed within 12 hours</option>
              <option value="critical">Critical - Immediate assistance required</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
