import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HeartHandshake, Users, MapPin, Package, TrendingUp, Shield, Zap, Globe, Map, Briefcase } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SAHAARA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#impact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Impact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/community">
              <Button variant="ghost" size="sm">
                Community Portal
              </Button>
            </Link>
            <Link href="/ngo">
              <Button variant="ghost" size="sm">
                NGO Dashboard
              </Button>
            </Link>
            <Link href="/recruitment">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Professional Recruitment
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto mb-12 rounded-2xl overflow-hidden">
          <Image
            src="/images/hero-relief.jpg"
            alt="Disaster relief workers distributing aid to affected communities"
            width={1200}
            height={500}
            className="w-full h-[300px] md:h-[500px] object-cover"
            priority
          />
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
            Connecting communities in crisis with coordinated relief
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
            A centralized platform for India that bridges the gap between disaster-affected communities and NGOs with
            real-time weather monitoring, ensuring faster response, transparent coordination, and efficient resource
            distribution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/community">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                Request Help
              </Button>
            </Link>
            <Link href="/ngo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                NGO Access
              </Button>
            </Link>
            <Link href="/disaster-map">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                <Map className="w-4 h-4 mr-2" />
                View Risk Map
              </Button>
            </Link>
            <Link href="/recruitment">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Professional Recruitment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">Real-time</div>
              <div className="text-sm text-muted-foreground">Response Coordination</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Transparent Tracking</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">Zero</div>
              <div className="text-sm text-muted-foreground">Duplication of Efforts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">Global</div>
              <div className="text-sm text-muted-foreground">Scalable Platform</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Three interconnected portals working together to save lives and coordinate relief efforts
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 bg-card border-border">
            <div className="mb-6 rounded-lg overflow-hidden">
              <Image
                src="/images/community-help.jpg"
                alt="Community members receiving relief supplies"
                width={400}
                height={250}
                className="w-full h-[200px] object-cover"
              />
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Community Portal</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Public-facing platform where affected communities can voice their urgent needs directly.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Post urgent needs with location and time tags</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Request specific items or volunteer help</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Track request status in real-time</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">View available resources nearby</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 bg-card border-border">
            <div className="mb-6 rounded-lg overflow-hidden">
              <Image
                src="/images/ngo-coordination.jpg"
                alt="NGO workers coordinating relief operations"
                width={400}
                height={250}
                className="w-full h-[200px] object-cover"
              />
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">NGO Dashboard</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Secure platform for NGOs to coordinate relief efforts and manage resources efficiently.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Access real-time needs feed by location</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Track inventory and resource availability</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Claim and fulfill requests efficiently</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Coordinate with other NGOs to avoid duplication</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 bg-card border-border">
            <div className="mb-6 rounded-lg overflow-hidden">
              <Image
                src="/professional-volunteers-coordinating-disaster-reli.jpg"
                alt="Professional volunteers coordinating relief"
                width={400}
                height={250}
                className="w-full h-[200px] object-cover"
              />
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Professional Recruitment</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Connect skilled professionals with disaster relief opportunities to maximize impact.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Match professionals with urgent skill needs</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Coordinate medical, engineering, and logistics experts</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Track volunteer hours and certifications</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-foreground">Build a network of trained disaster responders</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-card/30 border-y border-border py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Built for speed, transparency, and effective coordination during critical times
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="p-6 bg-card border-border">
              <Map className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Weather Monitoring</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real-time weather data and disaster risk assessment across Indian regions with interactive maps
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <MapPin className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Location-Based</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All requests tagged with precise location data for efficient resource allocation
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Real-Time Updates</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Instant notifications and status updates for both communities and NGOs
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <Package className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Inventory Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Comprehensive resource management to prevent waste and duplication
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <TrendingUp className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Data-driven insights to optimize relief operations and measure impact
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <Shield className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Secure & Verified</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Verified NGO access and credible community requests with time stamps
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <Briefcase className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Professional Network</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect skilled professionals with disaster relief opportunities
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <Globe className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Globally Scalable</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built to scale from local disasters to global humanitarian crises
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Expected Impact</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transforming disaster response through technology and coordination
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden">
          <Image
            src="/images/relief-impact.jpg"
            alt="Successful disaster relief distribution showing impact"
            width={1000}
            height={400}
            className="w-full h-[300px] md:h-[400px] object-cover"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Faster Response</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time visibility into community needs enables immediate action and reduces response time
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Transparent System</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete visibility into donations, volunteer efforts, and resource distribution builds trust
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Better Coordination</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              NGOs work together instead of in silos, eliminating duplication and maximizing impact
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card/30">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
              Ready to make a difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Whether you need help or want to provide it, SAHAARA is here to coordinate effective disaster response
              across India.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/community">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                  Access Community Portal
                </Button>
              </Link>
              <Link href="/ngo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Access NGO Dashboard
                </Button>
              </Link>
              <Link href="/recruitment">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Access Professional Recruitment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">SAHAARA - Disaster Relief Management Platform</span>
            </div>
            <div className="text-sm text-muted-foreground">Built for humanity, powered by coordination</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
