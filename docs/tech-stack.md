# ProsperMentor Tech Stack

## Summary
ProsperMentor is a Nuxt 3 and Vue 3 TypeScript frontend backed by a Java Spring Boot API.
The frontend owns the marketplace, session booking, and corporate mentorship workspaces.
The backend owns company data, programs, participants, sessions, billing context, matching, and validation.

## Frontend
- Nuxt 3
- Vue 3
- TypeScript
- Pinia for state management
- Tailwind CSS
- shadcn-nuxt and shared UI primitives
- Nitro node-server build target

## Backend
- Java
- Spring Boot
- Gradle
- Spring Data/JPA-style repositories and specifications
- Jakarta Bean Validation for request DTO validation

Backend repository:

```text
/Users/macbookpro/IdeaProjects/ProsperMentor
```

## Product Architecture
Role-specific navigation is the primary product entry point.

- Corporate admin routes live under `/app/admin/*`
- Employee routes live under `/app/employee/*`
- Mentor routes use mentor-oriented routes unless a dedicated corporate mentor area is introduced
- Shared routes like `/app/sessions` and `/app/profile` are used only when they still fit the role journey

Frontend request flow should follow:

```text
component -> store -> http request -> backend API
```

## ASCII Architecture Diagram

```text
                         ProsperMentor
                               |
          +--------------------+--------------------+
          |                                         |
      Frontend                                  Backend
  Nuxt 3 / Vue 3 / TS                    Java / Spring Boot
          |                                         |
          |                                         |
  +-------+--------+                         +------+------+
  | Role Routes    |                         | REST APIs    |
  +-------+--------+                         +------+------+
          |                                         |
          |                                         |
  +-------+------------------------------+          |
  |                                      |          |
  |  /app/admin/*       Corporate admin |          |
  |  /app/employee/*    Employee        |          |
  |  mentor routes      Mentor          |          |
  |                                      |          |
  +-------------------+------------------+          |
                      |                             |
                      v                             v
              +-------+-------+             +-------+-------+
              | Vue Pages     |             | Controllers   |
              | Components    |             | DTOs          |
              +-------+-------+             +-------+-------+
                      |                             |
                      v                             v
              +-------+-------+             +-------+-------+
              | Pinia Stores  |             | Services      |
              +-------+-------+             +-------+-------+
                      |                             |
                      v                             v
              +-------+-------+             +-------+-------+
              | HTTP Request  |------------>| Repositories  |
              | Modules       |             | Specifications|
              +---------------+             +-------+-------+
                                                    |
                                                    v
                                             +------+------+
                                             | Database    |
                                             +-------------+
```

## Role Navigation Files
- Corporate admin: `navigation/vertical/corporate-admin.ts`
- Employee: `navigation/vertical/employee.ts`
- Mentor: `navigation/vertical/mentor.ts`

## Permission And Access Layer
New role-specific routes should be wired through:

- `types/auth.ts` for permission constants
- `utils/roleManager.ts` for permission definitions and route access rules
- the matching role navigation file
- page-level auth metadata when the page enforces permissions directly

## Corporate Product Direction
The corporate product is program-centric rather than marketplace-centric.
Admin workflows should focus on company programs, participants, mentor matching, analytics, billing, and trust.
Employee workflows should focus on programs, journey progress, goals, matches, sessions, and feedback.
