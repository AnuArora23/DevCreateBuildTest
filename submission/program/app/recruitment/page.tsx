"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { HeartHandshake, ArrowLeft, UserPlus, Stethoscope, HardHat, Truck, Users } from "lucide-react"

export default function RecruitmentPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    specialization: "",
    experience: "",
    location: "",
    availability: "",
    certifications: "",
    languages: "",
    motivation: "",
  })

  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store in localStorage for demo
    const professionals = JSON.parse(localStorage.getItem("professionals") || "[]")
    professionals.push({
      ...formData,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
      status: "pending",
    })
    localStorage.setItem("professionals", JSON.stringify(professionals))
    setSubmitted(true)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Registration Successful!</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Thank you for registering as a professional volunteer. Our team will review your application and contact you
            when opportunities matching your skills become available.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full">Return to Home</Button>
            </Link>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Register Another Professional
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SAHAARA</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Professional Volunteer Registration</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join our network of skilled professionals ready to respond to disaster relief operations across India
          </p>
        </div>

        {/* Professional Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="p-4 text-center">
            <Stethoscope className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium text-foreground">Medical</div>
            <div className="text-xs text-muted-foreground">Doctors, Nurses, Paramedics</div>
          </Card>
          <Card className="p-4 text-center">
            <HardHat className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium text-foreground">Engineering</div>
            <div className="text-xs text-muted-foreground">Civil, Structural, Electrical</div>
          </Card>
          <Card className="p-4 text-center">
            <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium text-foreground">Logistics</div>
            <div className="text-xs text-muted-foreground">Supply Chain, Transport</div>
          </Card>
          <Card className="p-4 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium text-foreground">Coordination</div>
            <div className="text-xs text-muted-foreground">Management, Communication</div>
          </Card>
        </div>

        {/* Registration Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Full Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Dr. Rajesh Kumar"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email Address *</label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="rajesh.kumar@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Phone Number *</label>
                  <Input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Current Location *</label>
                  <Input
                    required
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Mumbai, Maharashtra"
                  />
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Professional Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Profession *</label>
                  <Select
                    required
                    value={formData.profession}
                    onValueChange={(value) => handleChange("profession", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="paramedic">Paramedic</SelectItem>
                      <SelectItem value="civil-engineer">Civil Engineer</SelectItem>
                      <SelectItem value="structural-engineer">Structural Engineer</SelectItem>
                      <SelectItem value="electrical-engineer">Electrical Engineer</SelectItem>
                      <SelectItem value="logistics-manager">Logistics Manager</SelectItem>
                      <SelectItem value="supply-chain">Supply Chain Specialist</SelectItem>
                      <SelectItem value="project-manager">Project Manager</SelectItem>
                      <SelectItem value="communications">Communications Specialist</SelectItem>
                      <SelectItem value="psychologist">Psychologist/Counselor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Specialization</label>
                  <Input
                    value={formData.specialization}
                    onChange={(e) => handleChange("specialization", e.target.value)}
                    placeholder="e.g., Emergency Medicine, Structural Assessment"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Years of Experience *</label>
                  <Select
                    required
                    value={formData.experience}
                    onValueChange={(value) => handleChange("experience", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Availability *</label>
                  <Select
                    required
                    value={formData.availability}
                    onValueChange={(value) => handleChange("availability", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (24-48 hours)</SelectItem>
                      <SelectItem value="short-notice">Short Notice (1 week)</SelectItem>
                      <SelectItem value="planned">Planned Deployments Only</SelectItem>
                      <SelectItem value="weekends">Weekends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Certifications & Licenses</label>
                  <Textarea
                    value={formData.certifications}
                    onChange={(e) => handleChange("certifications", e.target.value)}
                    placeholder="List relevant certifications, licenses, or training (e.g., MBBS, First Aid Certified, Disaster Management Training)"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Languages Spoken</label>
                  <Input
                    value={formData.languages}
                    onChange={(e) => handleChange("languages", e.target.value)}
                    placeholder="e.g., Hindi, English, Tamil, Bengali"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Why do you want to volunteer? *
                  </label>
                  <Textarea
                    required
                    value={formData.motivation}
                    onChange={(e) => handleChange("motivation", e.target.value)}
                    placeholder="Share your motivation for joining disaster relief efforts..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                <UserPlus className="w-4 h-4 mr-2" />
                Register as Professional Volunteer
              </Button>
              <Link href="/">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        {/* Benefits Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <Badge className="mb-3">Network</Badge>
            <h4 className="font-bold text-foreground mb-2">Join a Community</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect with like-minded professionals dedicated to disaster relief
            </p>
          </Card>
          <Card className="p-6">
            <Badge className="mb-3">Impact</Badge>
            <h4 className="font-bold text-foreground mb-2">Make a Difference</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use your skills where they matter most during critical times
            </p>
          </Card>
          <Card className="p-6">
            <Badge className="mb-3">Recognition</Badge>
            <h4 className="font-bold text-foreground mb-2">Get Certified</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Receive certificates and recognition for your volunteer work
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
