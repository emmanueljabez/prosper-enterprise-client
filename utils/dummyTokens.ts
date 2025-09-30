// Dummy JWT tokens for testing different roles
// These are pre-generated tokens with embedded role data

import { DEFAULT_ROLES } from './roleManager'

export const DUMMY_TOKENS = {
  // Employee Token - Sarah Njeri Kamau
  employee: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbXBsb3llZS0wMDEiLCJlbWFpbCI6InNhcmFoLm5qZXJpQGV4YW1wbGUuY29tIiwibmFtZSI6IlNhcmFoIE5qZXJpIEthbWF1IiwicGljdHVyZSI6Ii9pbWFnZXMvYXZhdGFycy9zYXJhaC5qcGciLCJwcm92aWRlciI6ImxvY2FsIiwicm9sZXMiOlsiZW1wbG95ZWUiXSwiaXNWZXJpZmllZCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyMy0wMS0xNVQwOTowMDowMC4wMDBaIiwibGFzdExvZ2luQXQiOiIyMDI0LTAxLTE5VDA4OjMwOjAwLjAwMFoiLCJpYXQiOjE3MDU2NTQyMDAsImV4cCI6MTcwNTc0MDYwMH0.xKjQ8vL2R5wN9mPzT1uK7sV8bF3hG6yE4xC9nM0aL2s",

  // Mentor Token - Grace Wanjiku Mwangi  
  mentor: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZW50b3ItMDAxIiwiZW1haWwiOiJncmFjZS53YW5qaWt1QHNhZmFyaWNvbS5jby5rZSIsIm5hbWUiOiJHcmFjZSBXYW5qaWt1IE13YW5naSIsInBpY3R1cmUiOiIvaW1hZ2VzL2F2YXRhcnMvZ3JhY2UuanBnIiwicHJvdmlkZXIiOiJsb2NhbCIsInJvbGVzIjpbIm1lbnRvciJdLCJpc1ZlcmlmaWVkIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDIyLTA2LTEwVDA5OjAwOjAwLjAwMFoiLCJsYXN0TG9naW5BdCI6IjIwMjQtMDEtMTlUMDc6NDU6MDAuMDAwWiIsImlhdCI6MTcwNTY1NDIwMCwiZXhwIjoxNzA1NzQwNjAwfQ.yB5mK8nL9vP3Q2xT6uJ4sW7bE1hF4yR3xD0oN5aM8s",

  // Corporate Admin Token - Dr. James Kiprotich
  corporate_admin: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0wMDEiLCJlbWFpbCI6ImphbWVzLmtpcHJvdGljaEBwcm9zcGVybWVudG9yLmNvbSIsIm5hbWUiOiJEci4gSmFtZXMgS2lwcm90aWNoIE11dGFpIiwicGljdHVyZSI6Ii9pbWFnZXMvYXZhdGFycy9qYW1lcy5qcGciLCJwcm92aWRlciI6ImxvY2FsIiwicm9sZXMiOlsiY29ycG9yYXRlX2FkbWluIl0sImlzVmVyaWZpZWQiOnRydWUsImNyZWF0ZWRBdCI6IjIwMjItMDEtMDFUMDk6MDA6MDAuMDAwWiIsImxhc3RMb2dpbkF0IjoiMjAyNC0wMS0xOVQwNjozMDowMC4wMDBaIiwiaWF0IjoxNzA1NjU0MjAwLCJleHAiOjE3MDU3NDA2MDB9.zC6nM9oQ8wR4T3yU7vK5tX8cF2iG5zS4yE1pO6bN9t",

  // Multi-role Token - Someone with both mentor and employee roles
  mentor_employee: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtdWx0aS0wMDEiLCJlbWFpbCI6Im1hcnkub25qYWxhQHRlY2guY29tIiwibmFtZSI6Ik1hcnkgT25qYWxhIEtpbWFuaSIsInBpY3R1cmUiOiIvaW1hZ2VzL2F2YXRhcnMvbWFyeS5qcGciLCJwcm92aWRlciI6Imdvb2dsZSIsInJvbGVzIjpbIm1lbnRvciIsImVtcGxveWVlIl0sImlzVmVyaWZpZWQiOnRydWUsImNyZWF0ZWRBdCI6IjIwMjMtMDMtMTVUMDk6MDA6MDAuMDAwWiIsImxhc3RMb2dpbkF0IjoiMjAyNC0wMS0xOVQxMDoxNTowMC4wMDBaIiwiaWF0IjoxNzA1NjU0MjAwLCJleHAiOjE3MDU3NDA2MDB9.aD7oP0rS9xU5V4zW8yL6uY9dG3jH6aT5yF2qR7cO0u",

  // Google SSO Employee Token - Peter Mwangi
  google_employee: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUtZW1wLTAwMSIsImVtYWlsIjoicGV0ZXIubXdhbmdpQGdtYWlsLmNvbSIsIm5hbWUiOiJQZXRlciBNd2FuZ2kgS2FyYW5qYSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKOXh4eCIsInByb3ZpZGVyIjoiZ29vZ2xlIiwicm9sZXMiOlsiZW1wbG95ZWUiXSwiaXNWZXJpZmllZCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyMy0wOC0yMFQwOTowMDowMC4wMDBaIiwibGFzdExvZ2luQXQiOiIyMDI0LTAxLTE5VDA5OjEwOjAwLjAwMFoiLCJpYXQiOjE3MDU2NTQyMDAsImV4cCI6MTcwNTc0MDYwMH0.bE8pQ1sT0yV6W5aX9zM7vZ0eH4kI7bU6zG3rS8dP1v",

  // Microsoft SSO Mentor Token - Dr. Amina Hassan
  microsoft_mentor: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtc2Z0LW1lbnRvci0wMDEiLCJlbWFpbCI6ImFtaW5hLmhhc3NhbkB1b24uYWMua2UiLCJuYW1lIjoiRHIuIEFtaW5hIEhhc3NhbiBBYmRpIiwicGljdHVyZSI6Imh0dHBzOi8vZ3JhcGgubWljcm9zb2Z0LmNvbS92MS4wL21lL3Bob3RvLyRjb250ZW50IiwicHJvdmlkZXIiOiJtaWNyb3NvZnQiLCJyb2xlcyI6WyJtZW50b3IiXSwiaXNWZXJpZmllZCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyMi0xMS0wNVQwOTowMDowMC4wMDBaIiwibGFzdExvZ2luQXQiOiIyMDI0LTAxLTE5VDA3OjIwOjAwLjAwMFoiLCJpYXQiOjE3MDU2NTQyMDAsImV4cCI6MTcwNTc0MDYwMH0.cF9qR2tU1zW7X6bY0aO8wA1fI5lJ8cV7zH4sT9eQ2w"
}

// Decoded payload examples for reference
export const DUMMY_USER_DATA = {
  employee: {
    id: "employee-001",
    email: "sarah.njeri@example.com",
    name: "Sarah Njeri Kamau",
    picture: "/images/avatars/sarah.jpg",
    provider: "local" as const,
    roles: [DEFAULT_ROLES.employee],
    isVerified: true,
    createdAt: "2023-01-15T09:00:00.000Z",
    lastLoginAt: "2024-01-19T08:30:00.000Z"
  },
  
  mentor: {
    id: "mentor-001", 
    email: "grace.wanjiku@safaricom.co.ke",
    name: "Grace Wanjiku Mwangi",
    picture: "/images/avatars/grace.jpg",
    provider: "local" as const,
    roles: [DEFAULT_ROLES.mentor],
    isVerified: true,
    createdAt: "2022-06-10T09:00:00.000Z",
    lastLoginAt: "2024-01-19T07:45:00.000Z"
  },
  
  corporate_admin: {
    id: "admin-001",
    email: "james.kiprotich@prospermentor.com", 
    name: "Dr. James Kiprotich Mutai",
    picture: "/images/avatars/james.jpg",
    provider: "local" as const,
    roles: [DEFAULT_ROLES.corporate_admin],
    isVerified: true,
    createdAt: "2022-01-01T09:00:00.000Z",
    lastLoginAt: "2024-01-19T06:30:00.000Z"
  },
  
  mentor_employee: {
    id: "multi-001",
    email: "mary.onjala@tech.com",
    name: "Mary Onjala Kimani", 
    picture: "/images/avatars/mary.jpg",
    provider: "google" as const,
    roles: [DEFAULT_ROLES.mentor, DEFAULT_ROLES.employee],
    isVerified: true,
    createdAt: "2023-03-15T09:00:00.000Z",
    lastLoginAt: "2024-01-19T10:15:00.000Z"
  },
  
  google_employee: {
    id: "google-emp-001",
    email: "peter.mwangi@gmail.com",
    name: "Peter Mwangi Karanja",
    picture: "https://lh3.googleusercontent.com/a/ACg8ocJ9xxx",
    provider: "google" as const,
    roles: [DEFAULT_ROLES.employee],
    isVerified: true,
    createdAt: "2023-08-20T09:00:00.000Z", 
    lastLoginAt: "2024-01-19T09:10:00.000Z"
  },
  
  microsoft_mentor: {
    id: "msft-mentor-001",
    email: "amina.hassan@uon.ac.ke",
    name: "Dr. Amina Hassan Abdi",
    picture: "https://graph.microsoft.com/v1.0/me/photo/$content",
    provider: "microsoft" as const,
    roles: [DEFAULT_ROLES.mentor],
    isVerified: true,
    createdAt: "2022-11-05T09:00:00.000Z",
    lastLoginAt: "2024-01-19T07:20:00.000Z"
  }
} 