'use client';

import React, { useState } from 'react';
import { ContentReviewTool, ContentItem } from '@/components/content-review';

/**
 * Demo page for the Content Review Tool
 *
 * This page demonstrates the content review tool functionality with:
 * - Side-by-side comparison
 * - Real-time editing
 * - Auto-save functionality
 * - Manual save controls
 */
export default function ReviewPage() {
  // Sample content for demonstration
  const [sampleContent] = useState<ContentItem>({
    id: 'demo-1',
    original: `# English Learning Resource

## Common Greetings

Hello - Hola
Good morning - Buenos días
Good afternoon - Buenas tardes
Good evening - Buenas noches
How are you? - ¿Cómo estás?

## Essential Phrases

Thank you - Gracias
You're welcome - De nada
Please - Por favor
Excuse me - Disculpe
I don't understand - No entiendo

## Numbers

One - Uno
Two - Dos
Three - Tres
Four - Cuatro
Five - Cinco`,
    edited: `# English Learning Resource

## Common Greetings

Hello - Hola
Good morning - Buenos días
Good afternoon - Buenas tardes
Good evening - Buenas noches
How are you? - ¿Cómo estás?

## Essential Phrases

Thank you - Gracias
You're welcome - De nada
Please - Por favor
Excuse me - Disculpe
I don't understand - No entiendo

## Numbers

One - Uno
Two - Dos
Three - Tres
Four - Cuatro
Five - Cinco`,
    metadata: {
      title: 'Spanish-English Basics',
      category: 'Vocabulary',
      lastModified: new Date().toISOString(),
    },
  });

  // Mock save function for demonstration
  const handleSave = async (content: ContentItem) => {
    console.log('Saving content:', content);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would save to your backend/database
    console.log('Content saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ContentReviewTool
        initialContent={sampleContent}
        onSave={handleSave}
        autoSaveDelay={2000}
      />
    </div>
  );
}
