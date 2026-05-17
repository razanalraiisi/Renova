# User Object Structure - Renova Codebase

## Overview
The user object is created during login and contains all fields defined in the MongoDB `UserModel`. It's stored in both Redux state and browser storage (localStorage/sessionStorage).

---

## Complete User Object Structure

### User Object Fields (All Roles)

```javascript
{
  // === BASIC USER FIELDS ===
  _id: String,                    // MongoDB ObjectId
  email: String,                  // REQUIRED, unique
  password: String,               // Hashed password (never sent to client after login)
  role: String,                   // "user" | "collector" | "admin"
  uname: String,                  // Username (for regular users)
  phone: String,                  // Phone number
  pic: String,                    // Profile picture/logo URL
  
  // === USER AUTO-ID (for regular users) ===
  userId: String,                 // e.g., "U100"
  userIdNumber: Number,           // e.g., 100
  
  // === COLLECTOR-SPECIFIC FIELDS ===
  companyName: String,            // Collector's company name
  collectorType: String,          // Type of collector (see types below)
  collectorId: String,            // e.g., "C100" (auto-generated)
  collectorIdNumber: Number,      // e.g., 100
  acceptedCategories: [String],   // Categories collector accepts (see categories below)
  address: String,                // Business address
  openHr: String,                 // Operating hours
  
  // === GEO-LOCATION (Collector only) ===
  location: {
    lat: Number,                  // Latitude
    lng: Number                   // Longitude
  },
  locationConsent: Boolean,       // Whether user consented to location tracking
  locationName: String,           // Optional: human-readable location name
  
  // === APPROVAL & STATUS ===
  isApproved: Boolean,            // true = approved, false = pending approval
                                  // Default: true for users/admins, false for collectors
  deactivatedAt: Date,            // null = active, Date = deactivated date
  
  // === TIMESTAMPS (Auto-added by MongoDB) ===
  createdAt: Date,                // Account creation date
  updatedAt: Date                 // Last update date
}
```

---

## Authentication Flow

### 1. **Registration**
- **Regular User**: `POST /registerUser` with `{ uname, email, password, phone, pic }`
- **Collector**: `POST /registerCollector` with `{ companyName, email, password, phone, pic, collectorType, acceptedCategories, address, openHr, location, locationConsent }`
- **Admin**: `POST /registerAdmin` with `{ email, password, secretKey }`

### 2. **Login** 
- **Request**: `POST /login` with `{ email, password }`
- **Response**:
  ```javascript
  {
    user: { ...all fields above },
    token: "JWT token string"
  }
  ```

### 3. **Storage**
After successful login, the `getUser` async thunk in `UserSlice.js`:
- Stores user object in localStorage (if "Remember Me" checked) OR sessionStorage
- Stores JWT token in the same storage location
- Stores user in Redux state: `state.users.user`

---

## How User Data is Stored & Accessed

### Storage Locations
```javascript
// Frontend - localStorage (persistent)
localStorage.getItem("user")    // Returns JSON string
localStorage.getItem("token")   // JWT token

// Frontend - sessionStorage (session-based)
sessionStorage.getItem("user")  // Returns JSON string
sessionStorage.getItem("token") // JWT token

// Frontend - Redux State
useSelector((state) => state.users.user)
```

### Storage Implementation (UserSlice.js)
```javascript
// Login - stores based on "Remember Me"
const storage = rememberMe ? localStorage : sessionStorage;
storage.setItem("user", JSON.stringify(data.user));
storage.setItem("token", data.token);

// Profile Update - updates both storage locations
localStorage.setItem("user", JSON.stringify(response.data.user));
sessionStorage.setItem("user", JSON.stringify(response.data.user));

// Logout - clears all storage
localStorage.removeItem("user");
localStorage.removeItem("token");
sessionStorage.removeItem("user");
sessionStorage.removeItem("token");
```

---

## Collector-Specific Usage

### Fields Accessed by Collector Components:

**[CollectorProfile.js](client/src/components/CollectorProfile.js#L107)**
```javascript
user.role                    // "collector"
user.acceptedCategories      // [String]
user.companyName             // String
user.pic                     // String (logo)
user.collectorId             // String
user.collectorType           // String
user.openHr                  // String (working hours)
user.phone                   // String
user.email                   // String
user.address                 // String
user._id                     // String (MongoDB ID)
```

**[CollectorDash.js](client/src/components/CollectorDash.js#L59)**
```javascript
const collector = JSON.parse(
  localStorage.getItem("user") || 
  sessionStorage.getItem("user")
);
// Uses: collector._id for API calls
```

**[CollectorRequestsHistory.js](client/src/components/CollectorRequestsHistory.js#L33)**
```javascript
const collector = JSON.parse(
  localStorage.getItem("user") || 
  sessionStorage.getItem("user")
);
// Uses: collector._id for fetching history
```

---

## Collector Type Options

Available values for `collectorType`:
```javascript
- "individual"                      // Individual Collector
- "private_company"                 // Private Collection Company
- "government_approved"             // Government-Approved Collector
- "recycling_center"                // Recycling Center
- "scrap_dealer"                    // Scrap Dealer / Scrap Yard
- "ngo"                             // NGO / Community Organization
- "retailer_program"                // Retailer Take-Back Program
- "corporate_collector"             // Corporate Collector
- "logistics_partner"               // Transport & Logistics Partner
- "hazardous_specialist"            // Specialized Hazardous Waste Collector
```

---

## Accepted Categories for Collectors

Available categories that collectors can accept:
```javascript
[
  "Small Electronics",
  "Large Electronics",
  "Home Appliances (Small)",
  "Home Appliances (Large)",
  "IT & Office Equipment",
  "Kitchen & Cooking Appliances",
  "Entertainment Devices",
  "Personal Care Electronics",
  "Tools & Outdoor Equipment",
  "Lighting Equipment",
  "Medical & Fitness Devices",
  "Batteries & Accessories"
]
```

---

## Approval Status

### For Collectors
- **After Registration**: `isApproved: false` (pending admin approval)
- **After Admin Approval**: `isApproved: true`
- **After Deactivation**: `deactivatedAt` is set to current date

### Login Behavior
```javascript
if (user.role === "collector" && user.isApproved === false) {
  if (user.deactivatedAt) {
    // Error: "Your collector account has been deactivated"
  }
  // Error: "Your collector account is pending admin approval"
}
```

### For Users & Admins
- `isApproved: true` (always approved)

---

## API Endpoints Using User Object

### Collector-Related Endpoints
```
GET  /api/pickups/all/{collector._id}        // Get all pickups for collector
GET  /api/pickups/history/{collector._id}    // Get pickup history
GET  /api/dropoffs/all/{collector._id}       // Get all drop-offs
GET  /api/dropoffs/history/{collector._id}   // Get drop-off history
PUT  /updateUser/{user._id}                  // Update profile
```

---

## Key Implementation Files

1. **Backend**
   - [UserModel.js](server/models/UserModel.js) - Schema definition
   - [authController.js](server/controllers/authController.js#L163) - Login handler
   - [authRoutes.js](server/routes/authRoutes.js) - Auth endpoints

2. **Frontend**
   - [UserSlice.js](client/src/features/UserSlice.js) - Redux state management
   - [CollectorProfile.js](client/src/components/CollectorProfile.js#L107) - Profile access
   - [CollectorDash.js](client/src/components/CollectorDash.js#L59) - Dashboard usage

---

## Summary Table

| Field | Type | Required | Collector | User | Admin | Notes |
|-------|------|----------|-----------|------|-------|-------|
| `_id` | ObjectId | ✓ | ✓ | ✓ | ✓ | MongoDB ID |
| `email` | String | ✓ | ✓ | ✓ | ✓ | Unique |
| `password` | String | ✓ | ✓ | ✓ | ✓ | Hashed |
| `role` | String | ✓ | ✓ | ✓ | ✓ | "collector"\|"user"\|"admin" |
| `uname` | String | - | - | ✓ | - | Username |
| `phone` | String | - | ✓ | ✓ | - | Contact |
| `pic` | String | - | ✓ | ✓ | - | Profile/Logo |
| `companyName` | String | - | ✓ | - | - | Collector only |
| `collectorType` | String | - | ✓ | - | - | Collector only |
| `acceptedCategories` | [String] | - | ✓ | - | - | Collector only |
| `address` | String | - | ✓ | - | - | Collector only |
| `openHr` | String | - | ✓ | - | - | Operating hours |
| `location` | Object | - | ✓ | - | - | `{lat, lng}` |
| `locationConsent` | Boolean | - | ✓ | - | - | Default: false |
| `isApproved` | Boolean | - | ✓ | ✓ | ✓ | Default: false for collectors |
| `deactivatedAt` | Date | - | ✓ | ✓ | ✓ | null if active |
| `createdAt` | Date | ✓ | ✓ | ✓ | ✓ | Auto |
| `updatedAt` | Date | ✓ | ✓ | ✓ | ✓ | Auto |

