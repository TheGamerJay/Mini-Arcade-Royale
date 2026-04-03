# Mini Arcade Royale - Frontend

React 18 + Next.js 14 frontend for Mini Arcade Royale arcade gaming platform.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3 + PostCSS
- **State Management**: Zustand (for global state)
- **HTTP Client**: Axios
- **UI Components**: Custom components with CVA pattern

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
npm run type-check
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── reset/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── games/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── store/page.tsx
│   │   └── wallet/page.tsx
│   └── lib/
│       ├── api.ts
│       ├── storage.ts
│       └── utils.ts
├── public/
│   ├── fonts/
│   ├── images/
│   └── og-image.png
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .eslintrc.json
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update with your values:

```env
NEXT_PUBLIC_API_URL=https://mini-arcade-royale-production.up.railway.app
NEXT_PUBLIC_APP_NAME=Mini Arcade Royale
NEXT_PUBLIC_GAMES_ENABLED=true
NEXT_PUBLIC_LEADERBOARD_ENABLED=true
NEXT_PUBLIC_STORE_ENABLED=true
```

## Features (Phase 2)

- ✅ Next.js 14 with App Router
- ✅ Authentication pages (Register, Login)
- ✅ Dashboard with user stats
- ✅ Design system with TailwindCSS
- ✅ Responsive layout
- ✅ Dark theme (arcade style)
- ⏳ Game integration (Phase 3+)
- ⏳ API integration (Phase 3+)
- ⏳ Real-time updates (Phase 4+)

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`.

### Authentication Flow

1. User registers via `/auth/register`
2. Backend returns JWT token and user data
3. Token stored in localStorage
4. Subsequent requests include token in Authorization header
5. Protected routes redirect to login if not authenticated

## Performance

- Next.js optimizations (image, font, code splitting)
- TailwindCSS purging for minimal CSS
- Lazy loading of non-critical routes
- Optimized build with SWC

## Deployment

The frontend is automatically deployed to Vercel when pushed to main branch.

Environment variables are managed via Vercel dashboard.

## Contributing

Follow Next.js and TypeScript best practices:

- Use TypeScript throughout
- Component files: `.tsx`
- Utility files: `.ts`
- Use functional components with hooks
- Keep components small and focused
- Type all props and returns

## License

Proprietary - Mini Arcade Royale
