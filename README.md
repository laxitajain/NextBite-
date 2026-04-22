# NextBite - Food Redistribution Platform

A comprehensive food redistribution platform that connects donors and recipients to reduce food waste and help those in need. Built with Next.js, MongoDB, and real-time location tracking.

## Features

### 🍽️ Core Features

- **Food Listings**: Donors can create, edit, and delete detailed food listings with images, location, expiry time, and dietary information
- **Geo-location Services**: Browser geolocation + MongoDB geospatial indexing for nearby pickup discovery
- **Interactive Maps**: Leaflet + OpenStreetMap powered maps showing available food listings and user locations
- **Pickup Management**: Complete pickup request and tracking system with status lifecycle
- **In-app Notifications**: Notification center and dedicated page for pickup requests, status updates, and alerts
- **User Profiles**: Separate, role-based interfaces and profile pages for donors and recipients
- **Image Uploads**: Attach photos to food listings via the built-in upload API
- **Platform Stats**: Live aggregate stats (total listings, completed pickups, servings, users) on the landing page

### 🎯 Key Functionality

- **Donor Dashboard**: Create listings, manage "My Listings" (edit/delete), handle incoming pickup requests
- **Recipient Interface**: Browse nearby food in grid / list / map views, filter by type, radius and price, request pickups, track "My Pickups"
- **Location-based Search**: Find food within a specified radius using GeoJSON `$near` queries
- **Status Tracking**: Pickup status updates (pending → accepted → en_route → arrived → completed), plus cancel / reject flows
- **Ratings & Reviews**: Both donors and recipients can rate each pickup; averages are shown on food listing cards
- **Allergen & Dietary Info**: Allergen tags, vegetarian / vegan flags, estimated value
- **Expiry Management**: Expiry / pickup time validation on listing create and edit

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose (with discriminators for Donor / Recipient)
- **Authentication**: NextAuth.js (Credentials provider, JWT sessions)
- **Maps**: Leaflet + React-Leaflet with OpenStreetMap tiles
- **Charts**: Recharts (demo trend data on the landing page)
- **Icons**: Lucide React
- **Database**: MongoDB with 2dsphere geospatial indexing

## Prerequisites

Before running the application, make sure you have:

1. **Node.js** (v18 or higher)
2. **MongoDB** (local instance or MongoDB Atlas)

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

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/next-bite
# Or, with Atlas (URL-encode any special characters in the password):
# MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/next-bite?appName=Cluster0

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

Generate a strong `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

For production, set `NEXTAUTH_URL` to your deployed URL (no trailing slash).

### 4. Database Setup

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

On first run, the app creates the required collections automatically. Geospatial indexes are defined on the `FoodListing` model.

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Usage Guide

### For Donors

1. **Register / Login** as a donor
2. **Create Food Listings**:
   - Add food details (title, description, servings, estimated value)
   - Set expiry and preferred pickup times
   - Specify location (auto-detected or manual)
   - Choose food types, allergens, and upload images
3. **Manage Listings**:
   - View all your listings in "My Listings"
   - Edit or delete any listing
4. **Manage Requests**:
   - Accept / reject pickup requests from recipients
   - Progress pickups through `accepted → en_route → arrived → completed`
   - Rate the recipient after completion
5. **Track Donations**:
   - See listing ratings and reviews
   - Get notifications for every incoming request

### For Recipients

1. **Register / Login** as a recipient
2. **Browse Food Listings**:
   - Switch between grid, list, and map views
   - Filter by food type, distance (5 – 50 km), max price, or keyword search
3. **Request Pickups**:
   - Send a pickup request with an optional message
   - Track the request in "My Pickups"
4. **Manage Pickups**:
   - Watch live status updates from the donor
   - Cancel a pending or accepted pickup if plans change
   - Rate and review the donor after completion

## API Endpoints

### Food Listings

- `GET /api/listings` - Get food listings (supports `lat`, `lng`, `radius`, `foodType`, `status`, `donorId`, `includeAllStatuses`, `limit`)
- `POST /api/listings` - Create a new listing (GeoJSON coordinates)
- `GET /api/listings/[id]` - Get a single listing
- `PUT /api/listings/[id]` - Update a listing
- `DELETE /api/listings/[id]` - Delete a listing

### Pickup Requests

- `GET /api/pickup-requests` - Get pickup requests (by `userId` + `role` = `donor` | `recipient`)
- `POST /api/pickup-requests` - Create a pickup request (notifies donor)
- `GET /api/pickup-requests/[id]` - Get a single request
- `PUT /api/pickup-requests/[id]` - Update request status, or submit a rating / review

### Notifications

- `GET /api/notifications` - Get notifications for a user
- `POST /api/notifications` - Create a notification
- `PUT /api/notifications/[id]` - Mark a notification as read / update
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/[id]` - Delete a notification

### User Management

- `POST /api/register` - User registration (donor or recipient)
- `GET /api/donor/[email]` - Get user profile by email
- `PUT /api/donor/[email]` - Update user profile (uses correct discriminator)
- `POST /api/userExists` - Check if a user exists

### Uploads & Stats

- `POST /api/upload` - Upload an image (multipart/form-data, max 5 MB, stored under `public/uploads/`)
- `GET /api/stats` - Aggregate platform stats (listings, pickups, users, etc.)

## Database Models

### User Model

- Basic user info (name, email, phone, address, coordinates)
- Role-based discrimination (`Donor` / `Recipient`)
- Role-specific fields (pickup notes, avg servings, org type, allergies, avg requirement)

### FoodListing Model

- Food details (title, description, servings, food types, allergens, dietary flags, estimated value, images)
- Location stored as GeoJSON `Point` with a `2dsphere` index
- Timing (expiry, pickup times) and status lifecycle
- Embedded `reviews` and computed average `rating`

### PickupRequest Model

- References to listing, donor, and recipient
- Status lifecycle (`pending`, `accepted`, `rejected`, `en_route`, `arrived`, `completed`, `cancelled`)
- Requested / actual pickup times and completion timestamps
- Recipient location snapshot for coordination

### Notification Model

- User-scoped notifications
- Type-based categorization (pickup_request, pickup_accepted, pickup_rejected, pickup_completed, etc.)
- Read / unread state and arbitrary `data` payload

## Key Features Implementation

### Geo-location Services

- Browser geolocation API for auto-detection on registration, listing creation, and browsing
- Leaflet + OpenStreetMap for map rendering (donor profile, recipient browse, food map)
- MongoDB `$near` queries over GeoJSON Point coordinates for radius search

### Status Tracking

- Status progression: `pending → accepted → en_route → arrived → completed`
- Cancel / reject paths supported on both sides
- Each transition emits a notification to the counterparty

### Notification System

- Shared `lib/notify` helper creates notifications from pickup API routes
- Notification bell in the header (`NotificationCenter`) + dedicated `/notifications` page
- Filters (all / unread), mark-as-read, mark-all-read, and delete

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect the repository to Vercel
3. Add `MONGODB_URI`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` as environment variables
4. Deploy

Note: local image uploads are written to `public/uploads/`, which is ephemeral on most serverless hosts. For production you may want to swap `app/api/upload/route.js` for an object-storage provider (S3, Cloudinary, etc.).

### Other Platforms

- **Railway**: For full-stack deployment with persistent storage
- **DigitalOcean / any Node host**: Works with `npm run build && npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**NextBite** - Making every bite count, reducing food waste one meal at a time. 🍽️✨
