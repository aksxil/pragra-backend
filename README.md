# Pragra MERN Assignment – Full Stack Application

A full-stack e-commerce style application built as part of the Pragra MERN Stack Developer assignment.

---

## 🚀 Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- Axios
- JWT Authentication

### Backend
- NestJS
- MongoDB (Mongoose)
- Passport.js
- JWT
- Stripe (Test Mode)

---

## ✨ Features

### Authentication
- Email & Password Signup/Login
- Email Verification
- Google OAuth Login
- JWT-based authentication

### Products
- View list of products
- Product images, price & description
- Secure checkout

### Payments
- Stripe Checkout integration (Test Mode)
- Secure payment flow

### Orders
- Order creation after payment
- Order & payment history for logged-in users
- Status tracking (paid / pending)

---

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_xxx
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3000

▶️ Run Locally
Backend
npm install
npm run start:dev

Frontend
npm install
npm run dev
