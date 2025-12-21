<div align="center">
  <h1>LiveStream</h1>
  <p>A real-time communication platform for church production teams, connecting mixers, cameramen, and admins.</p>
</div>

## 🚀 Features

- **Real-time Communication**: Instant updates between team members
- **Role-based Access**: Separate interfaces for Mixers, Cameramen, and Admins
- **Multi-tenant Architecture**: Support for multiple churches
- **Live Cue System**: Send and receive cues in real-time
- **Camera Status Tracking**: Monitor camera operator readiness
- **Service Management**: Organize and manage church services

## 🛠️ Prerequisites

- Node.js 16.x or later
- npm or yarn
- Supabase account
- Modern web browser

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone [your-repository-url]
cd livestream-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Optional: Gemini AI (if used)
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Database Setup

1. Create a new project in [Supabase](https://supabase.com/)
2. Run the SQL script from `supabase/schema.sql` in the SQL editor
3. Enable Row Level Security (RLS) on all tables
4. Set up the required storage buckets if using file uploads

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Supabase Configuration

### Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anon/public key from Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: The service role key (keep this server-side only)

### Database Tables

The application uses the following tables:

1. `churches` - Stores church/organization information
2. `church_members` - Maps users to churches and their roles
3. `services` - Tracks church services
4. `cameras` - Manages camera operators and their status
5. `cues` - Stores real-time cues between team members

## 👥 User Roles

- **Admin**: Full access to all features and settings
- **Mixer**: Can send cues and control the flow of the service
- **Cameraman**: Receives cues and updates camera status

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
