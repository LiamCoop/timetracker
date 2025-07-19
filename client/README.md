This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Setup (Prisma)

This project uses Prisma as the ORM with PostgreSQL. Here are the essential commands:

### Initial Setup
```bash
# Generate Prisma client from schema (run after schema changes)
npx prisma generate

# Start local Prisma PostgreSQL server (for development)
npx prisma dev

# Check status of local Prisma dev server
npx prisma dev status
```

### Database Migrations
```bash
# Create and apply a new migration (for schema changes)
npx prisma migrate dev --name your-migration-name

# Apply pending migrations to database
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Database Management
```bash
# Push schema changes to database without creating migration files
# (useful for prototyping, not recommended for production)
npx prisma db push

# Pull schema from existing database to update schema.prisma
npx prisma db pull

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Troubleshooting
```bash
# View detailed connection information
npx prisma db execute --sql "SELECT version();"

# Validate schema file
npx prisma validate
```

The database connection is configured in `.env` with the `DATABASE_URL` variable.

## Clerk User Sync Setup

To sync Clerk users with your database, you need to set up a webhook in your Clerk Dashboard:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** in the sidebar
3. Click **Add Endpoint**
4. Set the endpoint URL to: `https://your-domain.com/api/webhooks/clerk`
   - For local development: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
5. Select the following events:
   - `user.created`
   - `user.updated` 
   - `user.deleted`
6. Copy the **Signing Secret** and add it to your `.env` file as `CLERK_WEBHOOK_SECRET`

This webhook will automatically create, update, or delete users in your database when they sign up, update their profile, or delete their account in Clerk.
