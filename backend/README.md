# Project Kisan - Backend API

Backend server for the Project Kisan AI Farming Assistant application.

## Features

- **Authentication**: User login and signup with JWT
- **Disease Detection**: Crop disease diagnosis from images
- **Market Prices**: Real-time mandi prices and selling advice
- **Government Schemes**: Search and recommendations
- **AI Assistant**: Voice-first chatbot for farming queries

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JWT
- **File Upload**: Multer
- **External APIs**: Axios

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`

4. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify OTP

### Disease Detection
- `POST /api/disease/diagnose` - Upload image and get diagnosis
- `GET /api/disease/history` - Get diagnosis history

### Market Prices
- `GET /api/prices/current` - Get current market prices
- `POST /api/prices/recommendation` - Get selling advice

### Schemes
- `GET /api/schemes/search` - Search government schemes
- `GET /api/schemes/:id` - Get scheme details
- `POST /api/schemes/recommend` - Get personalized recommendations

### Assistant
- `POST /api/assistant/chat` - Send message to AI assistant
- `POST /api/assistant/voice` - Voice input processing

## Folder Structure

```
backend/
├── api/            # API route handlers
├── models/         # Database models
├── services/       # Business logic & external API calls
├── utils/          # Helper functions
├── config/         # Configuration files
├── server.js       # Main server file
└── package.json    # Dependencies
```

## Database Models

- **User**: User profiles and authentication
- **DiseaseHistory**: Crop disease diagnosis records
- **PriceQuery**: Market price search history
- **SchemeQuery**: Government scheme queries
- **ChatHistory**: AI assistant conversations

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Environment variable protection
- CORS configuration
- Input validation

## Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Enable HTTPS
5. Configure proper CORS origins
6. Deploy to cloud platform (AWS, Azure, GCP, etc.)
