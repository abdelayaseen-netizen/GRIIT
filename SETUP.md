# GRIIT - Functional Beta Setup Guide

GRIIT is now a **fully functional beta app** with real backend integration, authentication, and data persistence.

## 🎯 What's Been Implemented

### ✅ Backend & Database
- **Supabase Backend** with PostgreSQL database
- **tRPC API** for type-safe client-server communication
- **Authentication** with email/password
- **Session Management** with automatic token refresh
- **Database Schema**:
  - `profiles` - User profiles with username, bio, avatar
  - `challenges` - Challenge definitions
  - `challenge_tasks` - Task templates for challenges
  - `active_challenges` - User's joined challenges
  - `check_ins` - Daily task completions
  - `streaks` - User streak tracking
  - `stories` - 24-hour expiring stories
  - `story_views` - Story view tracking
- **Storage Buckets** for avatars, covers, stories, and proof media
- **Row Level Security (RLS)** policies for data protection

### ✅ Authentication Flow
- **Login Screen** (`/auth/login`)
- **Signup Screen** (`/auth/signup`)
- **Create Profile Screen** (`/create-profile`)
- **Auth Gate** - Automatic routing based on auth state
- **Session Persistence** - Stays logged in after app restart

### ✅ Core Features
- **Challenge Discovery** - Browse and search challenges
- **Challenge Join/Start** - Real challenge enrollment
- **Task Completion** - Complete tasks with verification
- **Progress Tracking** - Real-time progress calculation
- **Streak System** - Automatic streak calculation
- **Day Securing** - Complete all required tasks to secure the day
- **Profile Management** - View and edit profile

## 🚀 Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish provisioning (~2 minutes)

### 2. Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `backend/seed.sql` in this project
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click **Run** to execute the schema and seed data

This will:
- Create all required tables
- Set up RLS policies
- Seed demo challenges
- Create indexes for performance

**Then run the additional migrations in order** so the backend has all expected tables and columns (leaderboard, streaks, push, nudges, accountability, stories FK, etc.). See **[docs/MIGRATIONS.md](docs/MIGRATIONS.md)** for the full list and run order. In short: after `seed.sql`, run each file listed there (e.g. `backend/migration-core-fixes.sql`, then `migration-activation-retention.sql`, and so on) in the Supabase SQL Editor.

### 3. Create Storage Buckets

1. In Supabase dashboard, go to **Storage**
2. Create these buckets (make them **public**):
   - `avatars`
   - `covers`
   - `stories`
   - `proofs`

### 4. Configure Environment Variables

Create a `.env` file in the project root. See **Production environment variables** below for a full checklist.

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=https://your-backend-url.com
```

#### Production environment variables (checklist)

| Variable | Required | Where | Description |
|----------|----------|--------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | App + Backend | Supabase project URL. Set at build time for app; set in env for backend. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | App + Backend | Supabase anon/public key. Set at build time for app; set in env for backend. |
| `EXPO_PUBLIC_API_URL` or `EXPO_PUBLIC_API_BASE_URL` | No (dev) | App | Backend API base URL (no trailing slash). **Required in production** when app and backend are on different hosts (e.g. Rork + Railway). Prefer `EXPO_PUBLIC_API_URL`. |
| `PORT` | No | Backend | Server port (default `8080`). Used by Railway/Node. |
| `NODE_ENV` | No | Backend | Set to `production` to disable verbose logging and enable strict CORS. |
| `CORS_ORIGIN` | No (prod) | Backend | Allowed origin(s) for CORS. In production set to your app origin (e.g. `https://yourapp.com`). Omit to allow `*` (not recommended in prod). |

**Where to find these values:**
- Supabase URL and Anon Key: **Settings** → **API** in your Supabase dashboard
- API base URL: Your deployed backend URL (e.g. from Railway: `https://your-app.up.railway.app`), no trailing slash

### 5. Test the App

1. **Start the app**:
   ```bash
   npm start
   ```

2. **Create an account**:
   - Open the app (on device or web)
   - Tap "Create Account"
   - Enter email and password
   - Create your profile with username

3. **Join a challenge**:
   - Go to Discover tab
   - Browse challenges
   - Tap a challenge → "Start Challenge"

4. **Complete tasks**:
   - Go to Home tab
   - Tap on a task to complete it
   - Complete all required tasks
   - Tap "Secure Today"

5. **Test persistence**:
   - Close the app completely
   - Reopen - you should still be logged in
   - Your progress should be saved

## 📁 Project Structure

```
├── app/
│   ├── auth/
│   │   ├── login.tsx          # Login screen
│   │   ├── signup.tsx         # Signup screen
│   │   └── create-profile.tsx # Profile creation
│   ├── (tabs)/                # Main app tabs
│   │   ├── index.tsx          # Home (with real data)
│   │   ├── discover.tsx       # Browse challenges
│   │   ├── activity.tsx       # Activity feed
│   │   ├── create.tsx         # Create challenges
│   │   └── profile.tsx        # User profile
│   ├── challenge/[id]/        # Challenge details
│   └── task/                  # Task screens
├── backend/
│   ├── hono.ts                # API entry point
│   ├── seed.sql               # Database schema & seed data
│   └── trpc/
│       ├── create-context.ts  # tRPC context
│       ├── app-router.ts      # Main router
│       └── routes/            # API routes
│           ├── auth.ts        # Auth endpoints
│           ├── profiles.ts    # Profile management
│           ├── challenges.ts  # Challenge CRUD
│           ├── checkins.ts    # Task completion
│           └── stories.ts     # Stories system
├── contexts/
│   ├── AuthContext.tsx        # Auth state management
│   └── AppContext.tsx         # App state (legacy, can migrate)
└── lib/
    ├── supabase.ts            # Supabase client
    └── trpc.ts                # tRPC client setup
```

## 🔧 Backend API Endpoints

### Authentication
- `auth.signUp` - Create account
- `auth.signIn` - Login
- `auth.signOut` - Logout
- `auth.getSession` - Get current session

### Profiles
- `profiles.create` - Create profile (required after signup)
- `profiles.get` - Get current user's profile
- `profiles.update` - Update profile
- `profiles.getStats` - Get user statistics

### Challenges
- `challenges.list` - List all challenges (with search/filter)
- `challenges.getById` - Get challenge details
- `challenges.join` - Join a challenge
- `challenges.getActive` - Get user's active challenge

### Check-ins
- `checkins.complete` - Complete a task
- `checkins.getTodayCheckins` - Get today's check-ins
- `checkins.secureDay` - Secure the day (all tasks complete)

### Stories (for future implementation)
- `stories.create` - Create a story
- `stories.list` - List active stories
- `stories.markViewed` - Mark story as viewed

## 🎮 User Flow

```
1. Open App
   ↓
2. Login/Signup → Create Profile
   ↓
3. Discover Challenges
   ↓
4. Join Challenge
   ↓
5. Home Screen shows active challenge
   ↓
6. Complete tasks (journal, timer, run, etc.)
   ↓
7. Secure Day when all required tasks done
   ↓
8. Streak increases
   ↓
9. Repeat daily
```

## ✨ Key Features in Detail

### Streak System
- Tracks consecutive days of completed challenges
- Resets if a day is missed
- Updates `longest_streak_count` automatically
- Shows in profile and home screen

### Progress Calculation
- Computed from required tasks only
- Real-time updates as tasks complete
- Percentage shown on home screen
- Challenge-specific (different challenges can have different requirements)

### Task Verification
- **Journal**: Word count, typing time, paste detection
- **Timer**: Duration tracking, background detection
- **Run**: GPS tracking, distance verification
- **Photo**: Camera capture, same-day requirement
- **Check-in**: Location and time window verification

### Day Securing
- Requires ALL required tasks to be completed
- Creates check-in records in database
- Updates streak count
- Prevents duplicate securing
- Advances challenge day counter

## 🔒 Security

- **RLS Policies**: Users can only access their own data
- **JWT Authentication**: Secure session management
- **Password Requirements**: Minimum 6 characters
- **Unique Usernames**: Enforced at database level
- **Protected Routes**: tRPC procedures require authentication

## 🐛 Troubleshooting

### "Supabase credentials missing" warning
- Make sure environment variables are set correctly
- Restart the app after adding environment variables

### "Username already taken" error
- Choose a different username
- Usernames are case-insensitive and unique

### Tasks not saving
- Check internet connection
- Verify Supabase project is running
- Check browser console for API errors

### Stuck on loading screen
- Clear app data and restart
- Check if Supabase project is active
- Verify environment variables are correct

## 📊 Database Monitoring

Monitor your app's usage in Supabase:
1. **Database** → View table data
2. **Auth** → See registered users
3. **Storage** → View uploaded files
4. **API** → Monitor API usage
5. **Logs** → Debug issues

## 🚀 Next Steps

The app is now fully functional! You can:

1. **Add more seed challenges** in `backend/seed.sql`
2. **Implement stories feature** (backend ready, UI needed)
3. **Add social features** (following, feed, comments)
4. **Implement notifications** (Expo notifications)
5. **Add photo uploads** (use Supabase storage)
6. **Enhance profile editing** (avatar/cover upload)
7. **Add challenge creation UI** (backend ready)

## 📝 Notes

- **Free Tier Limits**: Supabase free tier includes 500MB database, 1GB file storage, 50,000 monthly active users
- **Data Persistence**: All data persists in Supabase - survives app restarts
- **Cross-Platform**: Works on iOS, Android, and Web
- **Type Safety**: Full TypeScript + tRPC type inference

## 🎯 Acceptance Test Checklist

- [x] Signup with email/password
- [x] Create profile with username
- [x] Home loads with empty state (no active challenge)
- [x] Discover shows seeded challenges
- [x] Can join a challenge
- [x] Home shows active challenge with tasks
- [x] Can navigate to task screens
- [x] Progress updates in real-time
- [x] Close app, reopen → everything persists
- [x] Session stays logged in after restart

---

**Your GRIIT app is now a fully functional beta! 🎉**

For support or questions, contact the development team.
