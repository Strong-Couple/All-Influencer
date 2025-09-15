# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-09-06

### Added
- 🚀 Initial project setup with pnpm monorepo structure
- 📁 Created workspace structure with apps and packages
- 🌐 **Web App (apps/web)**
  - Next.js 14 with App Router
  - TypeScript configuration
  - Tailwind CSS styling
  - Responsive homepage with hero section
  - Users listing page
  - Modern UI components integration
- 🔌 **API Server (apps/api)**
  - NestJS framework setup
  - Swagger/OpenAPI documentation
  - Users CRUD operations
  - Class-validator for data validation
  - Global error handling
  - Response interceptor
  - Helmet security middleware
- 🎨 **UI Package (packages/ui)**
  - Reusable React components
  - Button with multiple variants
  - Input with validation states
  - Card layouts
  - Typography system
  - Tailwind CSS integration
  - CVA (Class Variance Authority) for variants
- 📝 **Types Package (packages/types)**
  - Zod schema definitions
  - User types and validation
  - API response types
  - Pagination types
  - Common utility types
- 🧰 **Utils Package (packages/utils)**
  - Date formatting and manipulation
  - Price formatting with internationalization
  - Environment variable parsing with validation
  - String utilities (slugify, capitalize, etc.)
- 🔗 **SDK Package (packages/sdk)**
  - Axios-based HTTP client
  - Type-safe API methods
  - Request/response interceptors
  - OpenAPI client generation script
- ⚙️ **Development Tools**
  - Turbo for build optimization
  - ESLint configuration
  - Prettier code formatting
  - Husky git hooks
  - Commitlint for commit message standards
  - TypeScript shared configuration

### Infrastructure
- 📦 pnpm workspace configuration
- 🔧 Turbo.json for build pipelines
- 🔨 Shared TypeScript configuration
- 🎯 Import aliases for packages
- 🚦 CI/CD ready structure

### Documentation
- 📖 Comprehensive README with setup instructions
- 🤝 Contributing guidelines
- 📝 Changelog setup
- 🔍 API documentation with Swagger

## [0.0.0] - 2024-09-06
### Added
- Initial project structure

