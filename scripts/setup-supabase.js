/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up Supabase database...');
  
  // Note: For production, run the SQL schema directly in Supabase Dashboard
  // This script adds sample data
  
  try {
    // Add sample WhatsApp groups
    const { error: groupError } = await supabase
      .from('whatsapp_groups')
      .upsert([
        {
          name: 'Inglés para Principiantes',
          description: 'Grupo para quienes están empezando con el inglés',
          invite_link: 'https://chat.whatsapp.com/HablasBeginners2024',
          member_count: 523,
          rules: ['Solo inglés para trabajo', 'Respeto mutuo', 'No spam', 'Ayudarse entre todos'],
          category: 'principiantes',
          is_active: true
        },
        {
          name: 'Práctica Diaria Conductores',
          description: 'Practica con otros conductores y repartidores',
          invite_link: 'https://chat.whatsapp.com/HablasPractice2024',
          member_count: 341,
          rules: ['Práctica diaria obligatoria', 'Compartir experiencias', 'No audio largos'],
          category: 'practica',
          is_active: true
        }
      ], { onConflict: 'name' });
    
    if (groupError) console.error('Error adding groups:', groupError);
    else console.log('✓ WhatsApp groups added');
    
    // Add sample resources
    const { error: resourceError } = await supabase
      .from('resources')
      .upsert([
        {
          title: 'Frases Esenciales para Entregas',
          description: 'Las 50 frases más importantes para domiciliarios',
          type: 'pdf',
          category: 'repartidor',
          level: 'basico',
          size: '1.2 MB',
          download_url: '/resources/delivery-phrases.pdf',
          tags: ['Rappi', 'Entregas', 'Básico'],
          offline_available: true,
          download_count: 0
        },
        {
          title: 'Pronunciación: Saludos y Despedidas',
          description: 'Audio con pronunciación correcta de saludos',
          type: 'audio',
          category: 'all',
          level: 'basico',
          size: '3.5 MB',
          download_url: '/resources/greetings.mp3',
          tags: ['Audio', 'Pronunciación'],
          offline_available: true,
          download_count: 0
        }
      ], { onConflict: 'title' });
    
    if (resourceError) console.error('Error adding resources:', resourceError);
    else console.log('✓ Sample resources added');
    
    // Add welcome announcement
    const { error: announcementError } = await supabase
      .from('announcements')
      .upsert([
        {
          title: '¡Bienvenidos a Hablas!',
          content: 'Únete a nuestra comunidad de conductores y domiciliarios aprendiendo inglés. Nuevos recursos cada semana.',
          type: 'general',
          is_active: true
        }
      ], { onConflict: 'title' });
    
    if (announcementError) console.error('Error adding announcement:', announcementError);
    else console.log('✓ Welcome announcement added');
    
    console.log('\n✅ Database setup complete!');
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupDatabase();