# Mina Kitchen - Setup Instructions

## Database Setup (PostgreSQL)

### 1. Install PostgreSQL locally

**macOS (using Homebrew):**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database and user
CREATE DATABASE mina_kitchen;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE mina_kitchen TO postgres;
\q
```

### 3. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### 4. Environment Variables

Make sure your `.env` file has the correct DATABASE_URL:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/mina_kitchen?schema=public"
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## Checkout Process Features

The checkout process includes:

1. **Multi-step Flow**: Delivery/pickup selection, address management, scheduling, and order summary
2. **Address Management**: Add, edit, and select delivery addresses
3. **Order Scheduling**: Date and time picker for order delivery/pickup
4. **Order Summary**: Complete review with pricing breakdown
5. **Order Submission**: Creates orders in the database
6. **Order Confirmation**: Detailed confirmation page with tracking info

### API Endpoints

- `POST /api/orders` - Create new order
- `GET /api/orders?orderId=<id>` - Get specific order
- `GET /api/orders?customerId=<id>` - Get customer orders

### Pages

- `/checkout` - Multi-step checkout flow
- `/order-confirmation?orderId=<id>` - Order confirmation page
