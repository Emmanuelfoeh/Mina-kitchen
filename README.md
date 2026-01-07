# Mina's Kitchen - African Food Ordering Platform

A comprehensive food ordering web application for authentic West African cuisine, built with Next.js 16, React 19, and TypeScript.

## Features

- 🍽️ Browse authentic West African dishes and packages
- 🛒 Shopping cart with customization options
- 👤 User authentication and profile management
- 📱 Responsive design for all devices
- 🔐 Admin dashboard for menu and order management
- 🧪 Comprehensive testing with Jest and property-based testing

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: Zustand with persistence
- **Testing**: Jest, React Testing Library, fast-check (property-based testing)
- **Code Quality**: ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage
- `pnpm type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Development Guidelines

- Follow the established code style (enforced by ESLint and Prettier)
- Write tests for new functionality
- Use TypeScript for type safety
- Follow the component-based architecture
- Implement responsive design principles

## Testing

The project uses a dual testing approach:

- **Unit Tests**: For specific functionality and edge cases
- **Property-Based Tests**: For universal properties across all inputs

Run tests with:

```bash
pnpm test
```

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Ensure all tests pass before submitting
4. Use meaningful commit messages

## License

This project is private and proprietary.
