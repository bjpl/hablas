-- Resources table for learning materials
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('pdf', 'audio', 'image', 'video')),
  category VARCHAR(50),
  level VARCHAR(50),
  size VARCHAR(20),
  download_url TEXT NOT NULL,
  tags TEXT[],
  offline_available BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp groups table
CREATE TABLE IF NOT EXISTS whatsapp_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  invite_link TEXT NOT NULL,
  member_count INTEGER DEFAULT 0,
  rules TEXT[],
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table for tracking usage
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  user_agent TEXT,
  ip_address INET,
  city VARCHAR(100),
  region VARCHAR(100),
  device_type VARCHAR(50),
  network_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) CHECK (type IN ('meetup', 'resource', 'general')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_level ON resources(level);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_whatsapp_groups_active ON whatsapp_groups(is_active);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_groups_updated_at BEFORE UPDATE ON whatsapp_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to resources" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to active WhatsApp groups" ON whatsapp_groups
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public insert to analytics" ON analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to active announcements" ON announcements
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));