# Architecture Overview

## 1. Overview

The Product Data Enhancer is a full-stack web application designed to help e-commerce sellers transform incomplete product data into marketplace-ready listings. The application allows users to upload product data in CSV format, enhance it using AI capabilities (via Gemini API), and export it in various formats suitable for different e-commerce marketplaces.

The application follows a modern client-server architecture with a React frontend, Express.js backend, and PostgreSQL database, deployed in a containerized environment.

## 2. System Architecture

The system follows a layered architecture with clear separation between:

- **Client Layer**: React-based SPA with component-based UI using shadcn/UI
- **Server Layer**: Express.js REST API
- **Data Layer**: PostgreSQL database with Drizzle ORM
- **Integration Layer**: External services (Gemini AI API)

### High-Level Architecture Diagram

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│  React Frontend │────▶│  Express Backend  │────▶│ PostgreSQL DB   │
│  (SPA)          │◀────│  (REST API)       │◀────│ (Drizzle ORM)   │
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └─────────────────┘
                               │   ▲
                               │   │
                               ▼   │
                        ┌─────────────────┐
                        │                 │
                        │  Gemini AI API  │
                        │  (Product Data  │
                        │   Enhancement)  │
                        │                 │
                        └─────────────────┘
```

## 3. Key Components

### 3.1 Frontend Architecture

The frontend is built using React with TypeScript, adopting a component-based architecture:

- **UI Framework**: Uses shadcn/UI components library with Tailwind CSS for styling
- **State Management**: Combination of React Query for server state and Zustand for local state
- **Routing**: Uses Wouter for lightweight client-side routing
- **Directory Structure**:
  - `/client/src/components`: Reusable UI components
  - `/client/src/pages`: Page-level components
  - `/client/src/hooks`: Custom React hooks
  - `/client/src/lib`: Utility functions and services
  - `/client/src/store`: State management (Zustand store)
  - `/client/src/types`: TypeScript type definitions

Key frontend architectural decisions:
1. **Component-based design**: UI is built using composable, reusable components
2. **Separation of concerns**: Clear distinction between UI components, pages, and business logic
3. **Type safety**: TypeScript is used throughout for compile-time type checking
4. **Responsive design**: Tailwind CSS is used for responsive layouts

### 3.2 Backend Architecture

The backend is built using Express.js with TypeScript, implementing a RESTful API:

- **API Server**: Express.js
- **Database Access**: Drizzle ORM for type-safe database operations
- **File Processing**: Multer for file uploads, Papa Parse for CSV parsing
- **Directory Structure**:
  - `/server`: Main server code
  - `/server/routes.ts`: API route definitions
  - `/server/services`: Business logic services
  - `/server/storage.ts`: Database access layer
  - `/shared`: Shared code between client and server (schemas, types)

Key backend architectural decisions:
1. **RESTful API design**: Clear API endpoints with appropriate HTTP methods
2. **Service layer pattern**: Business logic encapsulated in dedicated service modules
3. **Type sharing**: Common types shared between frontend and backend
4. **Middleware-based processing**: Request processing follows middleware chain pattern

### 3.3 Database Architecture

The application uses PostgreSQL with Drizzle ORM for database access:

- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Uses Neon serverless PostgreSQL
- **Schema**: Defined in `/shared/schema.ts`
- **Main Entities**:
  - `users`: User accounts
  - `products`: Product listings with enhancement data
  - `exportHistory`: Record of export operations

Key database architectural decisions:
1. **Schema-first approach**: Database schema is defined in code and migrations are generated
2. **Type safety**: Schema definitions generate TypeScript types for database operations
3. **Relational design**: Proper relationships between entities
4. **Serverless database**: Uses Neon for serverless PostgreSQL capabilities

### 3.4 External Services Integration

The application integrates with external services:

- **Gemini AI API**: Used for enhancing product data (descriptions, titles, etc.)
- **Marketplace-specific formatting**: Supports various e-commerce platforms (Amazon, eBay, etc.)

## 4. Data Flow

The application follows these primary data flows:

### 4.1 Product Data Enhancement Flow

1. User uploads CSV file containing product data
2. Backend parses CSV and stores products in database
3. User selects target marketplace
4. Backend analyzes product data for missing or incomplete fields
5. Backend calls Gemini API to enhance product data
6. Enhanced data is stored in database
7. User reviews enhanced product data
8. User exports enhanced data in desired format

### 4.2 Data Storage Flow

1. Raw product data is stored in `products` table with status "pending"
2. Enhanced product data updates existing products with status "enhanced"
3. Export history is recorded in `exportHistory` table
4. Many-to-many relationship between products and export history via join table

## 5. External Dependencies

### 5.1 Frontend Dependencies

- **UI Components**: RadixUI, shadcn/UI
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form, Zod validation
- **CSV Processing**: Papa Parse

### 5.2 Backend Dependencies

- **Web Framework**: Express.js
- **Database ORM**: Drizzle ORM
- **Database Driver**: @neondatabase/serverless
- **File Upload**: Multer
- **CSV Processing**: Papa Parse
- **Authentication**: Custom authentication middleware

### 5.3 AI Integration

- **Google Gemini API**: Used for product data enhancement
- **Integration Pattern**: HTTP REST API calls from backend to Gemini API

## 6. Deployment Strategy

The application is designed for deployment in a containerized environment:

- **Build Process**:
  - Frontend: Vite for bundling and building
  - Backend: esbuild for TypeScript compilation
  - Combined: Single-container deployment with server serving static files
  
- **Environment Configuration**:
  - Uses environment variables for configuration (DATABASE_URL, GEMINI_API_KEY)
  - Development vs. production modes determined by NODE_ENV
  
- **Deployment Target**:
  - Configured for Replit's autoscaling deployment
  - Single process handles both API and serving static assets
  - Exposed on port 80 (mapped from local port 5000)

- **Database Provisioning**:
  - Uses Neon serverless PostgreSQL
  - Connection via DATABASE_URL environment variable
  - Schema migrations handled via Drizzle Kit

## 7. Security Considerations

- **API Key Security**: Gemini API key stored in environment variables
- **Data Validation**: Input validation using Zod schemas
- **Error Handling**: Structured error responses with appropriate HTTP status codes
- **Authentication**: Session-based authentication flow (TODO: Implementation details not fully visible)

## 8. Scalability Considerations

- **Stateless API**: Backend designed as stateless API for horizontal scaling
- **Database Scaling**: Neon serverless PostgreSQL handles database scaling
- **File Processing**: CSV processing happens in-memory with streaming for efficiency
- **Caching**: React Query provides client-side caching for API responses

## 9. Development Workflow

- **Type Safety**: TypeScript throughout the codebase
- **Schema Evolution**: Drizzle migrations for database schema changes
- **Local Development**: Vite dev server with hot module replacement
- **Build Process**: Separated frontend and backend builds combined for deployment