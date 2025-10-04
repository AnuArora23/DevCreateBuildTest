# Krishimitra AI- Smart Crop Advisory System

A comprehensive agricultural technology platform designed to empower small and marginal farmers with intelligent crop advisory services, real-time market insights, and AI-powered decision support tools.

## 🌾 Overview

Krishimitra AI is a full-stack web application that leverages modern technologies to provide farmers with:
- AI-powered crop recommendations and advice
- Real-time weather monitoring and alerts
- Soil health analysis and fertilizer recommendations
- Market price tracking and forecasting
- Pest detection capabilities
- Secure authentication and user management

## 🚀 Features

### Core Functionality
- **AI Chatbot**: Intelligent crop advisory system powered by Google Generative AI
- **Soil Health Analysis**: Comprehensive soil testing and health monitoring
- **Weather Monitoring**: Real-time weather data and alert system
- **Market Intelligence**: Live market prices and forecasting tools
- **Pest Detection**: AI-powered pest identification and management
- **Fertilizer Recommendations**: Personalized fertilizer suggestions based on soil analysis

### User Management
- Secure authentication via Auth0
- User registration and login
- Role-based access control

### Data Visualization
- Interactive charts and graphs using Chart.js
- Real-time data dashboards
- Historical trend analysis

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Firebase** - Cloud services and storage
- **Google AI/Generative AI** - AI and machine learning
- **Auth0** - Authentication and authorization
- **JWT** - Token-based authentication

### Frontend
- **React** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Chart.js** - Data visualization
- **Axios** - HTTP client

## 📁 Project Structure

```
AgriEco/
├── server.js                 # Main server file
├── package.json             # Backend dependencies
├── app/
│   ├── ai/                  # AI services and chatbots
│   ├── components/          # Backend components
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   ├── config/              # Configuration files
│   ├── db/                  # Database models and connection
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── assets/          # Static assets
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
```

## 🔧 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Firebase project
- Auth0 account
- Google AI API key

### Backend Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AgriEco
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   AUTH0_DOMAIN=your_auth0_domain
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | Various | Authentication routes |
| `/api/soilHealth/*` | GET/POST | Soil health analysis |
| `/api/weather/*` | GET | Weather data and alerts |
| `/api/marketPrice/*` | GET | Market price information |
| `/api/chatBot/*` | POST | AI chatbot interactions |

## 🎯 Usage

1. **Registration/Login**: Create an account or log in using Auth0 authentication
2. **Dashboard**: Access the main dashboard with overview of all features
3. **Soil Health**: Upload soil samples or input parameters for analysis
4. **Weather Alerts**: View current weather conditions and receive alerts
5. **Market Prices**: Check real-time commodity prices and trends
6. **AI Chatbot**: Get personalized crop advice and recommendations
7. **Pest Detection**: Upload images for AI-powered pest identification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Subodh Rana**

## 🙏 Acknowledgments

- Google AI for providing generative AI capabilities
- Auth0 for authentication services
- Firebase for cloud infrastructure
- Open-source community for various libraries and tools

## 📞 Support

For support, email support@agrieco.com or create an issue in the repository.

---

*Empowering farmers with technology for sustainable agriculture*
