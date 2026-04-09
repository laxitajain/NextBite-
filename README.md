# NextBite - Food Redistribution Platform

A comprehensive food redistribution platform that connects donors and recipients to reduce food waste and help those in need. Built with Next.js, MongoDB, and real-time location tracking.

## Features

### 🍽️ Core Features

- **Food Listings**: Donors can create detailed food listings with location, expiry time, and dietary information
- **Geo-location Services**: Real-time location tracking and mapping for pickup coordination
- **Interactive Maps**: Google Maps integration showing available food listings and user locations
- **Pickup Management**: Complete pickup request and tracking system
- **Real-time Notifications**: Instant notifications for pickup requests, status updates, and system alerts
- **User Profiles**: Separate interfaces for donors and recipients with role-based navigation

### 🎯 Key Functionality

- **Donor Dashboard**: Create food listings, manage pickup requests, track donations
- **Recipient Interface**: Browse nearby food listings, request pickups, track orders
- **Location-based Search**: Find food within specified radius using GPS coordinates
- **Status Tracking**: Real-time pickup status updates (pending, accepted, en_route, arrived, completed)
- **Rating System**: Rate and review food donations and pickup experiences
- **Allergen Information**: Detailed allergen and dietary restriction information
- **Expiry Management**: Automatic expiry tracking and notifications

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: NextAuth.js
- **Maps**: Google Maps API
- **Icons**: Lucide React
- **Database**: MongoDB with geospatial indexing

## Prerequisites

Before running the application, make sure you have:

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or cloud instance)
3. **Google Maps API Key** (for location services)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd next-bite
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/next-bite

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# Google Maps API (required for location services)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

### 4. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create credentials (API Key)
5. Add the API key to your `.env.local` file

### 5. Database Setup

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env.local with your Atlas connection string
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### Production Build

```bash
npm run build
npm start
```

## Usage Guide

### For Donors

1. **Register/Login** as a donor
2. **Create Food Listings**:
   - Add food details (title, description, servings)
   - Set expiry and pickup times
   - Specify location (auto-detected or manual)
   - Add dietary information and allergens
3. **Manage Requests**:
   - View pickup requests from recipients
   - Accept/reject requests
   - Track pickup status in real-time
4. **Track Donations**:
   - Monitor your food sharing impact
   - View ratings and reviews

### For Recipients

1. **Register/Login** as a recipient
2. **Browse Food Listings**:
   - Use map view to see nearby food
   - Filter by food type, distance, price
   - Search by keywords
3. **Request Pickups**:
   - Select desired food items
   - Add pickup messages
   - Track request status
4. **Manage Pickups**:
   - View accepted requests
   - Track donor location in real-time
   - Rate and review experiences

## API Endpoints

### Food Listings

- `GET /api/listings` - Get food listings with filters
- `POST /api/listings` - Create new food listing
- `GET /api/listings/[id]` - Get single listing
- `PUT /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing

### Pickup Requests

- `GET /api/pickup-requests` - Get pickup requests
- `POST /api/pickup-requests` - Create pickup request
- `GET /api/pickup-requests/[id]` - Get single request
- `PUT /api/pickup-requests/[id]` - Update request status

### Notifications

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/[id]` - Update notification
- `PUT /api/notifications/mark-all-read` - Mark all as read

### User Management

- `POST /api/register` - User registration
- `GET /api/donor/[email]` - Get donor profile
- `POST /api/userExists` - Check user existence

## Database Models

### User Model

- Basic user information (name, email, phone, address)
- Role-based discrimination (donor/recipient)
- Location coordinates and preferences

### FoodListing Model

- Food details (title, description, servings, types)
- Location with geospatial indexing
- Timing (expiry, pickup times)
- Status tracking and reservations
- Rating and review system

### PickupRequest Model

- Request details and status
- Location tracking for both parties
- Real-time status updates
- Completion ratings

### Notification Model

- User-specific notifications
- Type-based categorization
- Read/unread status tracking

## Key Features Implementation

### Geo-location Services

- Automatic location detection using browser geolocation API
- Google Maps integration for visual representation
- Geospatial queries for nearby food listings
- Real-time location tracking during pickups

### Real-time Tracking

- Location updates during pickup process
- Status progression (pending → accepted → en_route → arrived → completed)
- Estimated arrival times
- Live location sharing between donor and recipient

### Notification System

- Instant notifications for pickup requests
- Status change alerts
- System announcements
- Unread count tracking
- Mark as read functionality

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

- **Netlify**: For static hosting (requires API routes)
- **Railway**: For full-stack deployment
- **DigitalOcean**: For custom server setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation
- Review the API endpoints

## Roadmap

- [ ] Mobile app development
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Integration with food delivery services
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Social sharing capabilities
- [ ] Gamification elements

---

**NextBite** - Making every bite count, reducing food waste one meal at a time. 🍽️✨
