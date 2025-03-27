# Etsy Promo Applier

A web application for managing and applying Etsy promo codes with a secure one-time token system.

## Features

- **Secure One-Time Token System**
  - Token Generation: Admin can generate tokens linked to specific promo codes
  - One-Time Use: Tokens automatically become invalid after first use
  - Token Status Tracking: Admin panel shows which tokens have been used and when
  - Privacy Protection: Success messages don't reveal the actual promo code to users

- **Performance Optimizations**
  - Client-side caching with 5-minute TTL
  - Server-side API caching with field projection
  - Proper cache invalidation on data mutations
  - Background refresh mechanism for admin pages

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

## MongoDB Configuration

This application uses MongoDB for data storage. You can:

1. Use a local MongoDB instance (development)
2. Use MongoDB Atlas for cloud-based storage (recommended for production)

## Deployment

This project is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Vercel Platform](https://vercel.com)
