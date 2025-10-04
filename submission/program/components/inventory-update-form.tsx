"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { X, Plus, Minus } from "lucide-react"
import type { InventoryItem } from "@/lib/data-store"

interface InventoryUpdateFormProps {
  item: InventoryItem
  onClose: () => void
  onUpdate: (id: string, newQuantity: number) => void
}

export function InventoryUpdateForm({ item, onClose, onUpdate }: InventoryUpdateFormProps) {
  const [adjustment, setAdjustment] = useState(0)
  const [customAmount, setCustomAmount] = useState("")

  const handleQuickAdjust = (amount: number) => {
    setAdjustment(adjustment + amount)
  }

  const handleCustomAdjust = () => {
    const amount = Number.parseInt(customAmount)
    if (!isNaN(amount)) {
      setAdjustment(adjustment + amount)
      setCustomAmount("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newQuantity = Math.max(0, item.quantity + adjustment)
    onUpdate(item.id, newQuantity)
  }

  const newQuantity = Math.max(0, item.quantity + adjustment)

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Update Inventory</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <div className="text-lg font-bold text-foreground mb-1">{item.name}</div>
            <div className="text-sm text-muted-foreground">
              {item.category} • {item.location}
            </div>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Current Quantity</div>
            <div className="text-3xl font-bold text-foreground">
              {item.quantity} {item.unit}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Quick Adjustments</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickAdjust(-100)}
                className="bg-transparent"
              >
                <Minus className="w-4 h-4 mr-1" />
                100
              </Button>
              <Button type="button" variant="outline" onClick={() => handleQuickAdjust(-10)} className="bg-transparent">
                <Minus className="w-4 h-4 mr-1" />
                10
              </Button>
              <Button type="button" variant="outline" onClick={() => handleQuickAdjust(-1)} className="bg-transparent">
                <Minus className="w-4 h-4 mr-1" />1
              </Button>
              <Button type="button" variant="outline" onClick={() => handleQuickAdjust(1)} className="bg-transparent">
                <Plus className="w-4 h-4 mr-1" />1
              </Button>
              <Button type="button" variant="outline" onClick={() => handleQuickAdjust(10)} className="bg-transparent">
                <Plus className="w-4 h-4 mr-1" />
                10
              </Button>
              <Button type="button" variant="outline" onClick={() => handleQuickAdjust(100)} className="bg-transparent">
                <Plus className="w-4 h-4 mr-1" />
                100
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom" className="text-foreground">
              Custom Amount
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-background border-border text-foreground"
              />
              <Button type="button" onClick={handleCustomAdjust} variant="outline" className="bg-transparent">
                Apply
              </Button>
            </div>
          </div>

          {adjustment !== 0 && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Adjustment</div>
              <div className={`text-2xl font-bold ${adjustment > 0 ? "text-success" : "text-destructive"}`}>
                {adjustment > 0 ? "+" : ""}
                {adjustment} {item.unit}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                New quantity: {newQuantity} {item.unit}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAdjustment(0)}
              disabled={adjustment === 0}
              className="flex-1 bg-transparent"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={adjustment === 0}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Update Quantity
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
