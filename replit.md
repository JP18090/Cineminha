# Cineminha - Theater Ticket Management System

## Overview

Cineminha is a full-stack theater ticket management system built with React and Express.js. The application allows users to manage shows (espetáculos), clients (clientes), and ticket sales (vendas) through an intuitive dashboard interface. It features seat selection, different ticket types with pricing, and comprehensive metrics tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers
- **Styling**: Tailwind CSS with custom navy-themed design system and CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging middleware
- **Build System**: esbuild for production builds, tsx for development server
- **Development**: Vite integration for HMR and development workflow

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless driver for PostgreSQL connections
- **Temporary Storage**: In-memory storage implementation (MemStorage class) for development/testing
- **Data Validation**: Zod schemas for runtime type checking and API validation

### Authentication and Authorization
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: Basic request validation and error handling (extensible for future auth implementation)

### Application Features
- **Dashboard**: Real-time metrics showing total shows, clients, tickets sold, and revenue
- **Show Management**: CRUD operations for theater shows with seat allocation
- **Client Management**: Customer registration and management with CPF validation
- **Ticket Sales**: Interactive seat map with multiple ticket types (full price, half price, teacher discount)
- **Search and Filtering**: Real-time search capabilities across all data entities

### Code Organization
- **Shared Schema**: Common TypeScript types and Zod schemas in `/shared` directory
- **Client Structure**: React components organized by feature with reusable UI components
- **Server Structure**: Express routes and business logic separated from storage layer
- **Database Layer**: Abstract storage interface with multiple implementations (memory, future database)

### Development Workflow
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared code
- **Component System**: Shadcn/ui component library with consistent theming
- **API Communication**: Centralized API client with error handling and TypeScript types
- **Build Process**: Separate builds for client (Vite) and server (esbuild) with production optimization

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting platform
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Component Libraries
- **Radix UI**: Headless component primitives for accessible UI components
- **Shadcn/ui**: Pre-built component library based on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Fast build tool and development server with React plugin
- **esbuild**: Fast JavaScript bundler for production server builds
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### Data Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development environment integration (conditional loading)