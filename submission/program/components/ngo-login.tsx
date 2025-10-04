"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { HeartHandshake, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react"
import { authStore } from "@/lib/auth-store"

interface NGOLoginProps {
  onLoginSuccess: () => void
}

export function NGOLogin({ onLoginSuccess }: NGOLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate network delay
    setTimeout(() => {
      const result = authStore.login(email, password)

      if (result.success) {
        onLoginSuccess()
      } else {
        setError(result.message)
      }
      setLoading(false)
    }, 500)
  }

  const demoCredentials = [
    { email: "admin@redcrescent.org", password: "admin123", org: "Red Crescent Society" },
    { email: "coordinator@edhi.org", password: "edhi123", org: "Edhi Foundation" },
    { email: "relief@alkhidmat.org", password: "alkhidmat123", org: "Al-Khidmat Foundation" },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">NGO Dashboard</h1>
          <p className="text-muted-foreground">Sign in to access relief coordination tools</p>
        </div>

        {/* Login Card */}
        <Card className="p-6 bg-card border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@ngo.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-background border-border text-foreground"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>

        {/* Demo Credentials */}
        <Card className="p-4 bg-secondary/50 border-border">
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="w-full flex items-center justify-between text-sm font-medium text-foreground mb-2"
          >
            <span>Demo Credentials (For Judges)</span>
            <span className="text-primary">{showCredentials ? "Hide" : "Show"}</span>
          </button>

          {showCredentials && (
            <div className="space-y-2 mt-3">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="p-3 bg-card rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">{cred.org}</div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono text-foreground truncate">{cred.email}</div>
                      <div className="text-sm font-mono text-muted-foreground">{cred.password}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEmail(cred.email)
                        setPassword(cred.password)
                      }}
                      className="flex-shrink-0"
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Security Note */}
        <p className="text-xs text-center text-muted-foreground">
          This is a demo system. In production, all credentials would be encrypted and secured with industry-standard
          authentication protocols.
        </p>
      </div>
    </div>
  )
}
