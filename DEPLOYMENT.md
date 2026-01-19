# Deployment Guide - Mina's Kitchen

This guide covers deploying the Mina's Kitchen application to Vercel with a PostgreSQL database.

## Prerequisites

- Vercel account
- GitHub repository with your code
- Database provider (Vercel Postgres, Supabase, Neon, or Railway)

## Environment Variables

Create these environment variables in your Vercel project settings:

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
JWT_SECRET="your-secure-jwt-secret-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="https://your-domain.vercel.app"

# File Upload (Optional)
UPLOAD_DIR="/tmp/uploads"
MAX_FILE_SIZE="5242880"
```

### Generate Secure Secrets

Generate secure secrets for JWT and NextAuth:

```bash
# For JWT_SECRET (64 bytes hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# For NEXTAUTH_SECRET (32 bytes hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup Options

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database" and select "Postgres"
4. Follow the setup wizard
5. Copy the `DATABASE_URL` from the connection details

### Option 2: Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > Database
3. Copy the connection string and replace `[YOUR-PASSWORD]` with your password
4. Use this as your `DATABASE_URL`

### Option 3: Neon

1. Create a new project at [neon.tech](https://neon.tech)
2. Copy the connection string from the dashboard
3. Use this as your `DATABASE_URL`

### Option 4: Railway

1. Create a new project at [railway.app](https://railway.app)
2. Add a PostgreSQL service
3. Copy the connection string from the service variables
4. Use this as your `DATABASE_URL`

## Deployment Steps

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub with all the latest changes:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (if your Next.js app is in the root)
   - **Build Command**: `pnpm run build` (or leave default)
   - **Output Directory**: `.next` (leave default)
   - **Install Command**: `pnpm install` (or leave default)

### 3. Configure Environment Variables

In your Vercel project settings:

1. Go to "Settings" > "Environment Variables"
2. Add all the required environment variables listed above
3. Make sure to set them for "Production", "Preview", and "Development" environments

### 4. Configure Build Settings

The project includes a `vercel.json` configuration file that should handle most settings automatically. If you need to customize:

```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": []
}
```

### 5. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. If the build fails, check the build logs for errors

## Post-Deployment Setup

### 1. Database Migration

After successful deployment, you need to run database migrations:

1. Install Vercel CLI locally:

   ```bash
   npm i -g vercel
   ```

2. Link your project:

   ```bash
   vercel link
   ```

3. Run migrations using Vercel CLI:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

### 2. Seed Database (Optional)

If you want to populate your database with initial data:

```bash
npx prisma db seed
```

### 3. Test Your Deployment

1. Visit your deployed URL
2. Test key functionality:
   - User registration/login
   - Menu browsing
   - Cart functionality
   - Admin dashboard (if applicable)
   - Order placement

## Troubleshooting

### Common Build Errors

#### TypeScript Errors

- Ensure all TypeScript errors are fixed locally first
- Run `pnpm run type-check` locally to verify

#### Missing Environment Variables

- Double-check all required environment variables are set in Vercel
- Ensure variable names match exactly (case-sensitive)

#### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure your database allows connections from Vercel's IP ranges
- Check if your database provider requires SSL (most do)

#### Build Timeout

- If builds are timing out, consider optimizing your build process
- Check for any infinite loops or blocking operations during build

### Performance Optimization

#### Database

- Ensure proper database indexes are in place
- Use connection pooling if available
- Consider read replicas for high-traffic applications

#### Caching

- Leverage Vercel's Edge Network for static assets
- Implement proper cache headers for API responses
- Use Next.js built-in caching strategies

#### Monitoring

- Set up Vercel Analytics for performance monitoring
- Monitor database performance and query times
- Set up error tracking (Sentry, LogRocket, etc.)

## Maintenance

### Regular Updates

- Keep dependencies updated
- Monitor security advisories
- Update Node.js version as needed

### Database Maintenance

- Regular backups (most providers handle this automatically)
- Monitor database size and performance
- Clean up old data as needed

### Monitoring

- Set up uptime monitoring
- Monitor error rates and performance metrics
- Set up alerts for critical issues

## Security Considerations

- Use strong, unique secrets for JWT and NextAuth
- Enable HTTPS only (Vercel handles this automatically)
- Implement proper input validation
- Use environment variables for all sensitive data
- Regularly update dependencies for security patches
- Consider implementing rate limiting for API endpoints

## Support

If you encounter issues during deployment:

1. Check Vercel's build logs for specific error messages
2. Verify all environment variables are correctly set
3. Test the build locally with `pnpm run build`
4. Check database connectivity and permissions
5. Review this guide for any missed steps

For additional help, consult:

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
