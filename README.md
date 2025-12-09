# TuttoScuola

A mobile application designed to streamline communication and organization within Italian high schools. Built as a modern solution for students, teachers, and school staff to manage their daily academic activities.

## Overview

TuttoScuola connects students and teachers through a unified platform that combines messaging, scheduling, and booking features. The app is designed specifically for the Italian school system, with domain-based authentication to ensure only verified school members can access the platform.

## Features

- **Authentication** — Secure email-based signup restricted to school domains, with role selection (student/teacher)
- **Class Chats** — Group messaging for each class, enabling communication between classmates and teachers
- **Direct Messages** — Private one-on-one conversations between users
- **Booking System** — Teachers can create available slots for oral exams, tests, and meetings; students can book their preferred times
- **Calendar View** — Visual overview of upcoming events, bookings, and school activities
- **User Profiles** — Customizable profiles with avatars and role-based information
- **Notifications** — Stay updated on new messages and booking confirmations

## Tech Stack

### Frontend
- **React Native** with **Expo SDK 52**
- **Expo Router** — File-based navigation
- **React Native Safe Area Context** — Cross-platform safe area handling

### Backend
- **Supabase** — Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS) for data protection
  - Real-time subscriptions for live messaging
  - Authentication with email verification

### Key Libraries
- `@expo/vector-icons` — Icon system
- `expo-image-picker` — Avatar uploads
- `react-native-safe-area-context` — Device-specific layouts

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (main)/            # Authenticated routes
│   │   ├── (tabs)/        # Tab navigation
│   │   │   ├── calendar.jsx
│   │   │   ├── chats.jsx
│   │   │   ├── profile.jsx
│   │   │   └── notifications.jsx
│   │   └── chat/          # Chat screens
│   ├── login.jsx
│   ├── signUp.jsx
│   └── onboarding.jsx
├── components/            # Reusable UI components
│   ├── common/           # Shared components
│   └── attendance/       # Booking-related components
├── contexts/             # React Context providers
├── hooks/                # Custom hooks
├── services/             # API/Supabase services
├── constants/            # Theme and configuration
├── helpers/              # Utility functions
└── assets/               # Icons and images
```

## Database Schema

The app uses a relational database with the following main tables:

- `institutes` — School information and email domains
- `classes` — Class definitions (e.g., 1A, 2B)
- `users` — User profiles linked to Supabase Auth
- `chats` — Chat rooms (private, group, class)
- `chat_members` — Chat membership
- `messages` — Chat messages
- `booking_slots` — Teacher-created availability slots
- `bookings` — Student bookings for slots

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Supabase project and run the schema SQL
4. Configure environment variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
5. Start the development server:
   ```bash
   npx expo start
   ```

## License

MIT
