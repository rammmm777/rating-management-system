# Rating Management System

A full-stack web application for managing store ratings with role-based access control. Built with Node.js, Express, SQLite, React, and Ant Design.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 🌟 Features

### User Roles
- **Admin**: Manage users, stores, and view system statistics
- **User**: Browse stores, submit and update ratings  
- **Owner**: View store ratings and user feedback

### Core Functionality
- 🔐 **User authentication** with JWT
- 👥 **Role-based authorization**
- 🏪 **Store management** system
- ⭐ **Rating system** (1-5 stars)
- 🔍 **Search and filtering** capabilities
- 📱 **Responsive UI** with Ant Design
- 🔄 **Real-time updates** with React
- 📊 **Dashboard analytics** for all roles

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** for database
- **JWT** for authentication
- **bcrypt** for password hashing
- **express-validator** for input validation
- **CORS** for cross-origin requests

### Frontend
- **React** with TypeScript
- **Ant Design** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **Formik** for form handling
- **ESLint** for code quality

## 📁 Project Structure

```
rating-management-system/
├── backend/
│   ├── package.json
│   ├── server.js              # Main Express server
│   ├── create_admin.js         # Admin user creation script
│   ├── create_sample_data.js   # Sample data script
│   └── rating_system.db       # SQLite database (auto-created)
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Layout.tsx
│   │   │   └── PrivateRoute.tsx
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── OwnerDashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── Profile.tsx
│   │   ├── App.tsx            # Main App component
│   │   └── App.css            # Global styles
│   └── public/               # Static assets
├── README.md                  # This file
├── DEPLOYMENT.md             # Deployment guide
├── GITHUB_UPLOAD.md           # GitHub upload instructions
└── package.json              # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/rating-management-system.git
   cd rating-management-system
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

4. **Start the application**:
   ```bash
   # Start backend (in backend folder)
   npm start
   
   # Start frontend (in frontend folder) 
   npm start
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Default Login Credentials
- **Admin**: `admin@example.com` / `AdminPass123!`
- **User**: `user@example.com` / `UserPass123!`
- **Owner**: `owner@example.com` / `OwnerPass123!`

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user (role: 'user')

**Request Body:**
```json
{
  "name": "John Doe Smith Johnson",
  "email": "john@example.com",
  "password": "Password123!",
  "address": "123 Main St, City, State"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe Smith Johnson",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and get JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe Smith Johnson",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### PATCH `/api/auth/update-password`
Update user password (requires authentication)

**Request Body:**
```json
{
  "oldPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

### Admin Endpoints (Requires admin role)

#### GET `/api/admin/dashboard`
Get system statistics

**Response:**
```json
{
  "usersCount": 10,
  "storesCount": 5,
  "ratingsCount": 25
}
```

#### POST `/api/admin/users`
Create new user (any role)

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "role": "admin",
  "address": "456 Admin St"
}
```

#### GET `/api/admin/users`
List all users with optional filtering

**Query Parameters:**
- `name`: Filter by name (partial match)
- `email`: Filter by email (exact match)
- `role`: Filter by role
- `sort`: Sort by field:order (e.g., `name:asc`)

#### GET `/api/admin/stores`
List all stores with average ratings

**Query Parameters:**
- `name`: Filter by store name (partial match)
- `email`: Filter by email (exact match)
- `sort`: Sort by field:order

#### POST `/api/admin/stores`
Create new store

**Request Body:**
```json
{
  "name": "Amazing Store Name Here",
  "email": "store@example.com",
  "address": "789 Store Ave",
  "owner_id": 2
}
```

### User Endpoints (Requires user role)

#### GET `/api/user/stores`
List stores with user's ratings

**Query Parameters:**
- `name`: Search by store name
- `address`: Search by address

#### POST `/api/user/ratings`
Submit rating for a store

**Request Body:**
```json
{
  "store_id": 1,
  "rating": 4
}
```

#### PATCH `/api/user/ratings/:storeId`
Update existing rating

**Request Body:**
```json
{
  "rating": 5
}
```

### Owner Endpoints (Requires owner role)

#### GET `/api/owner/dashboard`
Get store information and ratings

**Response:**
```json
{
  "storeInfo": {
    "id": 1,
    "name": "Store Name",
    "email": "store@example.com",
    "address": "123 Store St",
    "average_rating": 4.2,
    "rating_count": 15
  },
  "raters": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "rating": 4,
      "created_at": "2023-01-01T12:00:00Z"
    }
  ]
}
```

## Validation Rules

### Name
- Length: 20-60 characters
- Required for all users and stores

### Email
- Valid email format
- Unique across users and stores

### Password
- Length: 8-16 characters
- Must contain at least one uppercase letter
- Must contain at least one special character (!@#$%^&*)

### Address
- Optional
- Maximum 400 characters

### Rating
- Integer between 1 and 5
- One rating per user per store

## Database Schema

### Users Table
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL (20-60 chars)
- `email`: TEXT UNIQUE NOT NULL
- `password`: TEXT NOT NULL (hashed)
- `address`: TEXT (max 400 chars)
- `role`: TEXT NOT NULL ('admin', 'user', 'owner')

### Stores Table
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL (20-60 chars)
- `email`: TEXT UNIQUE NOT NULL
- `address`: TEXT (max 400 chars)
- `owner_id`: INTEGER REFERENCES Users(id)

### Ratings Table
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id`: INTEGER NOT NULL REFERENCES Users(id)
- `store_id`: INTEGER NOT NULL REFERENCES Stores(id)
- `rating`: INTEGER NOT NULL (1-5)
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- UNIQUE (user_id, store_id)

## Usage Examples

### Creating an Admin User
1. Start the backend server
2. Use the admin endpoints to create the first admin user
3. Login with admin credentials
4. Create additional users and stores

### User Workflow
1. Sign up for a new account
2. Browse stores and search/filter
3. Rate stores (1-5 stars)
4. Update existing ratings
5. View profile and change password

### Owner Workflow
1. Admin assigns a store to owner
2. Owner logs in to view dashboard
3. See average rating and rating count
4. View list of users who rated their store
5. See individual ratings and dates

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

Frontend:
```bash
cd frontend
npm start
```

### Environment Variables

Backend:
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: JWT secret key (default: 'your-secret-key')

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based authorization
- Input validation and sanitization
- CORS enabled
- SQL injection prevention with prepared statements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.
