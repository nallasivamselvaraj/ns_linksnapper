# NS LinkSnapper - Setup Guide

## 🔧 Configuration Required

### Step 1: Set Up Supabase

1. **Create a Supabase project** at https://supabase.com
2. **Create the links table**:
   ```sql
   CREATE TABLE links (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     url TEXT NOT NULL,
     category TEXT,
     user_id UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Enable Row Level Security
   ALTER TABLE links ENABLE ROW LEVEL SECURITY;
   
   -- Policy: Users can only see their own links
   CREATE POLICY "Users can view own links" ON links
     FOR SELECT USING (auth.uid() = user_id);
   
   -- Policy: Users can insert their own links
   CREATE POLICY "Users can insert own links" ON links
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

3. **Get your credentials**:
   - Go to Project Settings → API
   - Copy the `Project URL` (e.g., https://xxxxx.supabase.co)
   - Copy the `anon public` key

### Step 2: Configure the Web Dashboard

1. Open `web/js/app.js`
2. Replace placeholders on lines 1-2:
   ```javascript
   const supabaseUrl = "https://yourproject.supabase.co";
   const supabaseKey = "your_anon_public_key";
   ```

### Step 3: Configure the Bot

1. In the `bot/` folder, create a `.env` file:
   ```bash
   cd bot
   copy .env.example .env
   ```

2. Edit `.env` with your values:
   ```
   SUPABASE_URL=https://yourproject.supabase.co
   SUPABASE_KEY=your_anon_public_key
   USER_ID=your_user_uuid
   PORT=3000
   ```

3. **Get your USER_ID**:
   - Sign up through the web dashboard first
   - Go to Supabase Dashboard → Authentication → Users
   - Copy your user's UUID

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the bot:
   ```bash
   npm start
   ```

### Step 4: Set Up Twilio WhatsApp (Optional)

1. Create a Twilio account at https://www.twilio.com
2. Set up WhatsApp Sandbox or get approved number
3. Configure webhook URL:
   - When a message comes in: `https://your-server.com/whatsapp`
   - Use ngrok for local testing: `ngrok http 3000`

## 🚀 Running the Application

### Web Dashboard
Simply open `web/index.html` in your browser, or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node
npx http-server web -p 8000
```

Then visit: http://localhost:8000

### Bot Server
```bash
cd bot
npm start
```

## ✅ Testing

1. **Test Web Dashboard**: Sign up and log in at http://localhost:8000
2. **Test Bot**: Send a POST request:
   ```bash
   curl -X POST http://localhost:3000/whatsapp -d "Body=https://example.com"
   ```
3. **Health Check**: Visit http://localhost:3000/

## 📝 Notes

- The bot currently saves ALL links to ONE user (the USER_ID in .env)
- To support multiple users, you'll need to implement user mapping from phone numbers
- Make sure Supabase RLS policies match your security requirements
