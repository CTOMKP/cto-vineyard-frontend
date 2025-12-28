# CTO Vineyard v2

A scalable, Coolify-optimized meme gallery platform built with Next.js 15.

## Features

- 🖼️ **Meme Gallery** - Browse and download memes
- 📤 **Upload System** - Direct S3 uploads with presigned URLs
- 🔐 **Authentication** - NextAuth with JWT
- 🛡️ **Admin Panel** - Manage listings, payments, and ad boosts
- ☁️ **CloudFront CDN** - Fast image delivery
- 🐳 **Docker Ready** - Optimized for Coolify deployment

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS
- **State**: TanStack Query (React Query)
- **Auth**: NextAuth.js
- **Images**: AWS S3 + CloudFront

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/CTOMKP/cto-vineyard-v2.git
cd cto-vineyard-v2

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Edit .env.local with your values
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.ctomarketplace.com
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=d2cjbd1iqkwr9j.cloudfront.net
NEXTAUTH_URL=https://ctomemes.xyz
NEXTAUTH_SECRET=your-secret-key
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Docker Deployment (Coolify)

### Build Arguments

When deploying to Coolify, set these build arguments:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_CLOUDFRONT_DOMAIN` - CloudFront domain for images

### Health Check

The app exposes `/api/health` for container health checks.

### Docker Build

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.ctomarketplace.com \
  --build-arg NEXT_PUBLIC_CLOUDFRONT_DOMAIN=d2cjbd1iqkwr9j.cloudfront.net \
  -t cto-vineyard-v2 .
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── dashboard/         # User dashboard
│   └── signin/            # Authentication
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── memes/            # Meme-related components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript types
```

## Migration from v1

This is a complete rebuild of the CTO Vineyard frontend with:

- ✅ Fixed infinite re-render loops
- ✅ Proper error handling and retries
- ✅ TanStack Query for data fetching (caching, deduplication)
- ✅ Coolify-optimized Docker configuration
- ✅ Reduced bundle size (removed unused AWS SDK)
- ✅ Same design and features preserved

All existing images on S3/CloudFront remain accessible.

## License

Private - CTO Marketplace

