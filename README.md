# Kodbank Application

A full-stack banking application with user registration, JWT-based authentication, and balance checking functionality.

## Features

- User registration with automatic initial balance of ₹100,000
- Secure login with JWT token authentication
- Token stored in HttpOnly cookies for security
- User dashboard with balance checking
- Beautiful party popper animation when balance is displayed

## Tech Stack

### Backend
- Node.js with Express
- MySQL (Aiven cloud database)
- JWT for authentication
- bcryptjs for password hashing
- Cookie-based session management

### Frontend
- React with Vite
- React Router for navigation
- Canvas Confetti for animations
- Modern CSS with gradients and animations

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Aiven MySQL database (already configured)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory (copy from `.env.example`):
```env
DB_HOST=mysql-3cff29ea-login-app.b.aivencloud.com
DB_PORT=28014
DB_USER=avnadmin
DB_PASSWORD=your-aiven-database-password
DB_NAME=defaultdb
DB_SSL=true

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h

COOKIE_NAME=KODBANK_TOKEN

```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```
### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Database Schema

The application uses two tables in the MySQL database:

### KodUser Table
- `uid` - User ID
- `username` - Username (unique)
- `email` - Email address (unique)
- `password` - Hashed password
- `balance` - Account balance (default: 100000)
- `phone` - Phone number
- `role` - User role (default: Customer)

### UserToken Table
- `tid` - Token ID
- `token` - JWT token string
- `uid` - User ID (foreign key)
- `expairy` - Token expiration date

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  - Body: `{ uid, uname/username, email, password, phone }`
  - Returns: `{ message: "User registered successfully" }`

- `POST /api/auth/login` - Login user
  - Body: `{ username, password }`
  - Returns: `{ message: "Login successful" }`
  - Sets HttpOnly cookie with JWT token

### User
- `GET /api/user/balance` - Get user balance (requires authentication)
  - Requires: Valid JWT token in cookie
  - Returns: `{ balance: 100000 }`

## Usage Flow

1. **Registration**: Navigate to `/register` and fill in the registration form
2. **Login**: After registration, you'll be redirected to `/login`. Enter your credentials
3. **Dashboard**: Upon successful login, you'll be redirected to `/dashboard`
4. **Check Balance**: Click the "Check Balance" button to see your account balance with a celebration animation

## Security Features

- Passwords are hashed using bcryptjs before storage
- JWT tokens are signed with a secret key
- Tokens are stored in HttpOnly cookies (not accessible via JavaScript)
- CORS configured to allow only the frontend origin
- SSL connection required for database

## Development Notes

- The backend uses ES modules (`type: "module"` in package.json)
- Frontend uses Vite for fast development and building
- Proxy configuration in `vite.config.js` forwards `/api` requests to the backend
- All API requests include `credentials: 'include'` to send cookies

## Troubleshooting

- **Database connection errors**: Verify your `.env` file has the correct Aiven credentials
- **CORS errors**: Ensure `FRONTEND_ORIGIN` in backend `.env` matches your frontend URL
- **Cookie not being set**: Check that `credentials: 'include'` is used in fetch requests
- **Token expired**: Login again to get a new token

[Live Demo](https://uvbank.vercel.app/login)
