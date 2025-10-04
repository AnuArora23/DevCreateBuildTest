// Client-side data store using localStorage for persistence
export interface HelpRequest {
  id: string
  victimName: string
  location: string
  contactInfo: string
  itemsNeeded: string[]
  description: string
  urgency: "critical" | "high" | "medium" | "low"
  status: "pending" | "claimed" | "fulfilled"
  timestamp: string
  claimedBy?: string
  fulfilledAt?: string
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  location: string
  lastUpdated: string
}

class DataStore {
  private REQUESTS_KEY = "relief_connect_requests"
  private INVENTORY_KEY = "relief_connect_inventory"

  // Help Requests
  getRequests(): HelpRequest[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.REQUESTS_KEY)
    return data ? JSON.parse(data) : this.getInitialRequests()
  }

  saveRequests(requests: HelpRequest[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests))
  }

  addRequest(request: Omit<HelpRequest, "id" | "timestamp" | "status">): HelpRequest {
    const requests = this.getRequests()
    const newRequest: HelpRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: "pending",
    }
    requests.unshift(newRequest)
    this.saveRequests(requests)
    return newRequest
  }

  updateRequest(id: string, updates: Partial<HelpRequest>): void {
    const requests = this.getRequests()
    const index = requests.findIndex((r) => r.id === id)
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates }
      this.saveRequests(requests)
    }
  }

  deleteRequest(id: string): void {
    const requests = this.getRequests()
    this.saveRequests(requests.filter((r) => r.id !== id))
  }

  // Inventory
  getInventory(): InventoryItem[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.INVENTORY_KEY)
    return data ? JSON.parse(data) : this.getInitialInventory()
  }

  saveInventory(inventory: InventoryItem[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.INVENTORY_KEY, JSON.stringify(inventory))
  }

  addInventoryItem(item: Omit<InventoryItem, "id" | "lastUpdated">): InventoryItem {
    const inventory = this.getInventory()
    const newItem: InventoryItem = {
      ...item,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date().toISOString(),
    }
    inventory.unshift(newItem)
    this.saveInventory(inventory)
    return newItem
  }

  updateInventoryItem(id: string, updates: Partial<InventoryItem>): void {
    const inventory = this.getInventory()
    const index = inventory.findIndex((i) => i.id === id)
    if (index !== -1) {
      inventory[index] = { ...inventory[index], ...updates, lastUpdated: new Date().toISOString() }
      this.saveInventory(inventory)
    }
  }

  deleteInventoryItem(id: string): void {
    const inventory = this.getInventory()
    this.saveInventory(inventory.filter((i) => i.id !== id))
  }

  // Initial seed data
  private getInitialRequests(): HelpRequest[] {
    const initial: HelpRequest[] = [
      // Critical Pending Requests
      {
        id: "req_1",
        victimName: "Sharma Family",
        location: "Mumbai, Maharashtra",
        contactInfo: "+91 98765 43210",
        itemsNeeded: ["Food", "Water", "Medicine"],
        description:
          "Family of 6 stranded on rooftop due to flash flooding. Need immediate food, clean water, and basic medicines. Children showing signs of dehydration.",
        urgency: "critical",
        status: "pending",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_2",
        victimName: "Village Relief Committee",
        location: "Patna, Bihar",
        contactInfo: "+91 98234 56789",
        itemsNeeded: ["Water", "Medical Supplies", "Shelter"],
        description:
          "Entire village affected by severe flooding. 200+ people need clean water, medical supplies, and temporary shelter. Several elderly residents need urgent medical attention.",
        urgency: "critical",
        status: "pending",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_3",
        victimName: "Lakshmi Devi",
        location: "Varanasi, Uttar Pradesh",
        contactInfo: "+91 97654 32109",
        itemsNeeded: ["Medicine", "Food"],
        description:
          "Elderly woman with diabetes needs insulin and food supplies. House flooded, unable to reach pharmacy.",
        urgency: "critical",
        status: "pending",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },

      // High Priority Requests
      {
        id: "req_4",
        victimName: "Chennai Community Center",
        location: "Chennai, Tamil Nadu",
        contactInfo: "+91 98123 45678",
        itemsNeeded: ["Blankets", "Food", "Volunteers"],
        description:
          "Community shelter housing 50 displaced families. Need blankets for cold nights, food supplies for 3 days, and volunteers for distribution and organization.",
        urgency: "high",
        status: "claimed",
        claimedBy: "Indian Red Cross Society",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_5",
        victimName: "Kolkata Coastal Community",
        location: "Kolkata, West Bengal",
        contactInfo: "+91 99887 76655",
        itemsNeeded: ["Water", "Food", "Shelter"],
        description:
          "Coastal area hit by cyclone. 80 families need clean drinking water, food packages, and tarpaulin sheets for temporary shelter.",
        urgency: "high",
        status: "pending",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_6",
        victimName: "Uttarakhand Earthquake Relief",
        location: "Dehradun, Uttarakhand",
        contactInfo: "+91 98765 11223",
        itemsNeeded: ["Medical Supplies", "Shelter", "Blankets"],
        description:
          "Earthquake damaged 30 homes. Need medical supplies for injured, tents for displaced families, and warm blankets as temperatures drop at night.",
        urgency: "high",
        status: "claimed",
        claimedBy: "Goonj Foundation",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_7",
        victimName: "Rajasthan Drought Committee",
        location: "Jaisalmer, Rajasthan",
        contactInfo: "+91 97123 45678",
        itemsNeeded: ["Water", "Food", "Medicine"],
        description:
          "Severe drought affecting 150 families. Wells dried up, need water tankers, food supplies, and medicines for malnourished children.",
        urgency: "high",
        status: "pending",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },

      // Medium Priority Requests
      {
        id: "req_8",
        victimName: "Delhi School",
        location: "New Delhi, Delhi NCR",
        contactInfo: "+91 98234 67890",
        itemsNeeded: ["Food", "Water", "Volunteers"],
        description:
          "School converted to temporary shelter for 40 families. Need food supplies, clean water, and volunteers to help with children's activities and education.",
        urgency: "medium",
        status: "pending",
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_9",
        victimName: "Hyderabad Relief Camp",
        location: "Hyderabad, Telangana",
        contactInfo: "+91 99123 45678",
        itemsNeeded: ["Blankets", "Food"],
        description:
          "Relief camp needs additional blankets and food supplies for 25 families staying temporarily after homes were damaged.",
        urgency: "medium",
        status: "claimed",
        claimedBy: "Akshaya Patra Foundation",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_10",
        victimName: "Bangalore Community",
        location: "Bangalore, Karnataka",
        contactInfo: "+91 98765 43219",
        itemsNeeded: ["Water", "Medicine"],
        description:
          "Neighborhood affected by contaminated water supply. Need clean drinking water and basic medicines for waterborne diseases.",
        urgency: "medium",
        status: "pending",
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_11",
        victimName: "Pune Welfare Society",
        location: "Pune, Maharashtra",
        contactInfo: "+91 97654 32198",
        itemsNeeded: ["Food", "Volunteers"],
        description:
          "Organizing food distribution for 60 affected families. Need food packages and volunteers to help with logistics and distribution.",
        urgency: "medium",
        status: "pending",
        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      },

      // Fulfilled Requests (showing successful operations)
      {
        id: "req_12",
        victimName: "Shimla Relief Center",
        location: "Shimla, Himachal Pradesh",
        contactInfo: "+91 98123 67890",
        itemsNeeded: ["Food", "Water", "Blankets"],
        description: "Emergency shelter needed food, water, and blankets for 35 families displaced by landslides.",
        urgency: "high",
        status: "fulfilled",
        claimedBy: "Indian Red Cross",
        fulfilledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_13",
        victimName: "Ahmedabad Medical Camp",
        location: "Ahmedabad, Gujarat",
        contactInfo: "+91 99234 56789",
        itemsNeeded: ["Medical Supplies", "Medicine"],
        description: "Medical camp required supplies for treating flood-affected patients.",
        urgency: "critical",
        status: "fulfilled",
        claimedBy: "Seva Bharati",
        fulfilledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_14",
        victimName: "Bhubaneswar Flood Relief",
        location: "Bhubaneswar, Odisha",
        contactInfo: "+91 98345 67891",
        itemsNeeded: ["Water", "Food"],
        description: "Flood-affected area needed clean water and food for 45 families.",
        urgency: "high",
        status: "fulfilled",
        claimedBy: "Indian Red Cross Society",
        fulfilledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_15",
        victimName: "Jaipur Community",
        location: "Jaipur, Rajasthan",
        contactInfo: "+91 97123 45679",
        itemsNeeded: ["Shelter", "Blankets"],
        description: "Families needed temporary shelter and blankets after building collapse.",
        urgency: "medium",
        status: "fulfilled",
        claimedBy: "Goonj Foundation",
        fulfilledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // Low Priority (Recovery Phase)
      {
        id: "req_16",
        victimName: "Lucknow Reconstruction",
        location: "Lucknow, Uttar Pradesh",
        contactInfo: "+91 98234 56790",
        itemsNeeded: ["Volunteers", "Food"],
        description: "Community rebuilding after floods. Need volunteers for cleanup and food supplies for workers.",
        urgency: "low",
        status: "pending",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "req_17",
        victimName: "Srinagar Recovery Center",
        location: "Srinagar, Jammu & Kashmir",
        contactInfo: "+91 97654 32190",
        itemsNeeded: ["Food", "Water"],
        description:
          "Recovery center supporting families returning home. Need food and water supplies for transition period.",
        urgency: "low",
        status: "pending",
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    this.saveRequests(initial)
    return initial
  }

  private getInitialInventory(): InventoryItem[] {
    const initial: InventoryItem[] = [
      // Water Supplies
      {
        id: "inv_1",
        name: "Bottled Water (500ml)",
        category: "Water",
        quantity: 5000,
        unit: "bottles",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_2",
        name: "Water Purification Tablets",
        category: "Water",
        quantity: 2000,
        unit: "packets",
        location: "Delhi Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_3",
        name: "Large Water Containers (20L)",
        category: "Water",
        quantity: 300,
        unit: "containers",
        location: "Chennai Hub",
        lastUpdated: new Date().toISOString(),
      },

      // Food Supplies
      {
        id: "inv_4",
        name: "Rice",
        category: "Food",
        quantity: 2000,
        unit: "kg",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_5",
        name: "Wheat Flour",
        category: "Food",
        quantity: 1500,
        unit: "kg",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_6",
        name: "Lentils (Dal)",
        category: "Food",
        quantity: 800,
        unit: "kg",
        location: "Bangalore Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_7",
        name: "Cooking Oil",
        category: "Food",
        quantity: 500,
        unit: "liters",
        location: "Chennai Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_8",
        name: "Ready-to-Eat Meals",
        category: "Food",
        quantity: 1200,
        unit: "packets",
        location: "Delhi Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_9",
        name: "Biscuits & Snacks",
        category: "Food",
        quantity: 3000,
        unit: "packets",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_10",
        name: "Baby Food",
        category: "Food",
        quantity: 400,
        unit: "jars",
        location: "Bangalore Hub",
        lastUpdated: new Date().toISOString(),
      },

      // Medical Supplies
      {
        id: "inv_11",
        name: "First Aid Kits",
        category: "Medicine",
        quantity: 150,
        unit: "kits",
        location: "Chennai Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_12",
        name: "Antibiotics",
        category: "Medicine",
        quantity: 500,
        unit: "boxes",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_13",
        name: "Pain Relievers",
        category: "Medicine",
        quantity: 800,
        unit: "boxes",
        location: "Delhi Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_14",
        name: "Bandages & Gauze",
        category: "Medicine",
        quantity: 1000,
        unit: "rolls",
        location: "Bangalore Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_15",
        name: "Antiseptic Solution",
        category: "Medicine",
        quantity: 300,
        unit: "bottles",
        location: "Chennai Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_16",
        name: "Oral Rehydration Salts (ORS)",
        category: "Medicine",
        quantity: 2000,
        unit: "packets",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_17",
        name: "Insulin",
        category: "Medicine",
        quantity: 50,
        unit: "vials",
        location: "Delhi Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_18",
        name: "Blood Pressure Monitors",
        category: "Medicine",
        quantity: 25,
        unit: "devices",
        location: "Bangalore Hub",
        lastUpdated: new Date().toISOString(),
      },

      // Shelter & Bedding
      {
        id: "inv_19",
        name: "Blankets",
        category: "Shelter",
        quantity: 800,
        unit: "pieces",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_20",
        name: "Tents (Family Size)",
        category: "Shelter",
        quantity: 120,
        unit: "tents",
        location: "Bangalore Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_21",
        name: "Tarpaulin Sheets",
        category: "Shelter",
        quantity: 500,
        unit: "sheets",
        location: "Delhi Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_22",
        name: "Sleeping Mats",
        category: "Shelter",
        quantity: 600,
        unit: "mats",
        location: "Chennai Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_23",
        name: "Mosquito Nets",
        category: "Shelter",
        quantity: 400,
        unit: "nets",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },

      // Hygiene & Sanitation
      {
        id: "inv_24",
        name: "Hygiene Kits",
        category: "Other",
        quantity: 350,
        unit: "kits",
        location: "Delhi Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_25",
        name: "Soap Bars",
        category: "Other",
        quantity: 2000,
        unit: "bars",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_26",
        name: "Sanitary Pads",
        category: "Other",
        quantity: 1000,
        unit: "packets",
        location: "Bangalore Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_27",
        name: "Diapers (Baby)",
        category: "Other",
        quantity: 600,
        unit: "packets",
        location: "Chennai Hub",
        lastUpdated: new Date().toISOString(),
      },

      // Tools & Equipment
      {
        id: "inv_28",
        name: "Flashlights",
        category: "Other",
        quantity: 200,
        unit: "pieces",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_29",
        name: "Solar Lanterns",
        category: "Other",
        quantity: 150,
        unit: "pieces",
        location: "Delhi Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_30",
        name: "Portable Stoves",
        category: "Other",
        quantity: 80,
        unit: "stoves",
        location: "Bangalore Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_31",
        name: "Cooking Utensils Sets",
        category: "Other",
        quantity: 250,
        unit: "sets",
        location: "Chennai Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_32",
        name: "Water Buckets",
        category: "Other",
        quantity: 400,
        unit: "buckets",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },

      // Clothing
      {
        id: "inv_33",
        name: "Children's Clothing Sets",
        category: "Other",
        quantity: 300,
        unit: "sets",
        location: "Delhi Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_34",
        name: "Adult Clothing Sets",
        category: "Other",
        quantity: 250,
        unit: "sets",
        location: "Mumbai Central Hub",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "inv_35",
        name: "Shoes (Assorted Sizes)",
        category: "Other",
        quantity: 200,
        unit: "pairs",
        location: "Bangalore Hub",
        lastUpdated: new Date().toISOString(),
      },
    ]
    this.saveInventory(initial)
    return initial
  }
}

export const dataStore = new DataStore()
