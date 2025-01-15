# Event Management System

## Description

This is a simple event management system built with Next.js, MongoDB, and Socket.io. It allows users to create, manage, and attend events.

## Setup

1. Clone the repository
2. Run `npm install`
3. set the environment variables in the .env.local file following the .env.example file
env variables are:
```
NEXT_PUBLIC_MONGODB_URI=mongodb://localhost:27017/event-management
NEXT_PUBLIC_JWT_SECRET=test
NEXT_PUBLIC_NODE_ENV=development
NEXT_PUBLIC_SOCKET_PORT=3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```
4. Run `npm run dev`

