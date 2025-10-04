// Simulated weather data for Indian regions - updates every 5 minutes
export interface WeatherData {
  region: string
  state: string
  coordinates: [number, number] // [lat, lng]
  temperature: number
  humidity: number
  rainfall: number // mm in last 24h
  windSpeed: number // km/h
  riskLevel: "critical" | "high" | "moderate" | "low"
  disasterType: string[]
  lastUpdated: string
}

export function getWeatherData(): WeatherData[] {
  // Simulate real-time data with slight variations
  const baseTime = Date.now()
  const variation = Math.sin(baseTime / 100000) * 5

  return [
    {
      region: "Mumbai",
      state: "Maharashtra",
      coordinates: [19.076, 72.8777],
      temperature: 32 + variation,
      humidity: 85 + variation,
      rainfall: 120 + variation * 10,
      windSpeed: 45 + variation * 2,
      riskLevel: "critical",
      disasterType: ["Cyclone", "Flooding"],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Chennai",
      state: "Tamil Nadu",
      coordinates: [13.0827, 80.2707],
      temperature: 34 + variation,
      humidity: 78 + variation,
      rainfall: 95 + variation * 8,
      windSpeed: 38 + variation * 2,
      riskLevel: "high",
      disasterType: ["Heavy Rainfall", "Flooding"],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Kolkata",
      state: "West Bengal",
      coordinates: [22.5726, 88.3639],
      temperature: 31 + variation,
      humidity: 82 + variation,
      rainfall: 110 + variation * 9,
      windSpeed: 42 + variation * 2,
      riskLevel: "critical",
      disasterType: ["Cyclone", "Storm Surge"],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Delhi",
      state: "Delhi NCR",
      coordinates: [28.7041, 77.1025],
      temperature: 38 + variation,
      humidity: 45 + variation,
      rainfall: 15 + variation * 2,
      windSpeed: 25 + variation,
      riskLevel: "moderate",
      disasterType: ["Heat Wave"],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Bangalore",
      state: "Karnataka",
      coordinates: [12.9716, 77.5946],
      temperature: 28 + variation,
      humidity: 65 + variation,
      rainfall: 45 + variation * 4,
      windSpeed: 18 + variation,
      riskLevel: "low",
      disasterType: [],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Hyderabad",
      state: "Telangana",
      coordinates: [17.385, 78.4867],
      temperature: 35 + variation,
      humidity: 55 + variation,
      rainfall: 30 + variation * 3,
      windSpeed: 22 + variation,
      riskLevel: "moderate",
      disasterType: ["Drought Risk"],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Ahmedabad",
      state: "Gujarat",
      coordinates: [23.0225, 72.5714],
      temperature: 40 + variation,
      humidity: 35 + variation,
      rainfall: 8 + variation,
      windSpeed: 28 + variation,
      riskLevel: "high",
      disasterType: ["Extreme Heat", "Drought"],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Pune",
      state: "Maharashtra",
      coordinates: [18.5204, 73.8567],
      temperature: 30 + variation,
      humidity: 70 + variation,
      rainfall: 55 + variation * 5,
      windSpeed: 20 + variation,
      riskLevel: "low",
      disasterType: [],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Jaipur",
      state: "Rajasthan",
      coordinates: [26.9124, 75.7873],
      temperature: 42 + variation,
      humidity: 25 + variation,
      rainfall: 5 + variation,
      windSpeed: 32 + variation,
      riskLevel: "critical",
      disasterType: ["Extreme Heat", "Severe Drought"],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Lucknow",
      state: "Uttar Pradesh",
      coordinates: [26.8467, 80.9462],
      temperature: 36 + variation,
      humidity: 60 + variation,
      rainfall: 40 + variation * 4,
      windSpeed: 24 + variation,
      riskLevel: "moderate",
      disasterType: ["Heat Wave"],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Bhubaneswar",
      state: "Odisha",
      coordinates: [20.2961, 85.8245],
      temperature: 33 + variation,
      humidity: 80 + variation,
      rainfall: 105 + variation * 8,
      windSpeed: 40 + variation * 2,
      riskLevel: "high",
      disasterType: ["Cyclone Risk", "Heavy Rainfall"],
      lastUpdated: new Date().toISOString(),
    },
    {
      region: "Patna",
      state: "Bihar",
      coordinates: [25.5941, 85.1376],
      temperature: 35 + variation,
      humidity: 75 + variation,
      rainfall: 85 + variation * 7,
      windSpeed: 30 + variation,
      riskLevel: "high",
      disasterType: ["Flooding", "Waterlogging"],
      lastUpdated: new Date().toISOString(),
    },
  ]
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "critical":
      return "#dc2626" // red-600
    case "high":
      return "#ea580c" // orange-600
    case "moderate":
      return "#f59e0b" // amber-500
    case "low":
      return "#22c55e" // green-500
    default:
      return "#6b7280" // gray-500
  }
}
