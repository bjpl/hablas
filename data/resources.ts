/**
 * Generated Resources
 * Auto-generated from AI-created learning materials
 * Generated: 2025-10-08T05:59:31.875Z
 * Total Resources: 34
 * Average Quality Score: 87.6%
 */

export interface MediaMetadata {
  duration?: number;
  dimensions?: { width: number; height: number };
  format: string;
  size?: number;
}

export interface Resource {
  id: number
  title: string
  description: string
  type: 'pdf' | 'audio' | 'image' | 'video'
  category: 'all' | 'repartidor' | 'conductor'
  level: 'basico' | 'intermedio' | 'avanzado'
  size: string
  downloadUrl: string
  tags: readonly string[] | string[]
  offline: boolean
  contentPath?: string // Optional: absolute path to source file (for development/debugging)
  audioUrl?: string // Optional: path to MP3 audio file
  metadata?: MediaMetadata
  hidden?: boolean // Optional: hide from public pages (for review)
}

export const resources: Resource[] = [
  {
    "id": 1,
    "title": "Frases Esenciales para Entregas - Var 1",
    "description": "21 frases esenciales para entregas con ejemplos prácticos para repartidores",
    "type": "pdf",
    "category": "repartidor",
    "level": "basico",
    "size": "31.0 KB",
    "downloadUrl": "/generated-resources/50-batch/repartidor/basic_phrases_1.md",
    "tags": [
      "entregas",
      "delivery",
      "rappi",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-1.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\repartidor\\basic_phrases_1.md"
  },
  {
    "id": 2,
    "title": "Pronunciación: Entregas - Var 1",
    "description": "Audio de pronunciación con ejemplos hablados para repartidores",
    "type": "pdf",
    "category": "repartidor",
    "level": "basico",
    "size": "7.8 KB",
    "downloadUrl": "/generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt",
    "tags": [
      "entregas",
      "delivery",
      "rappi",
      "basico",
      "pronunciación"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-2.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\repartidor\\basic_audio_1-audio-script.txt"
  },
  {
    "id": 4,
    "title": "Frases Esenciales para Entregas - Var 2",
    "description": "30 frases prácticas para entregas con ejemplos para repartidores",
    "type": "pdf",
    "category": "repartidor",
    "level": "basico",
    "size": "31.5 KB",
    "downloadUrl": "/generated-resources/50-batch/repartidor/basic_phrases_2.md",
    "tags": [
      "entregas",
      "delivery",
      "rappi",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-4.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\repartidor\\basic_phrases_2.md"
  },
  {
    "id": 5,
    "title": "Situaciones Complejas en Entregas - Var 1",
    "description": "30 frases para situaciones complejas en entregas con ejemplos prácticos",
    "type": "pdf",
    "category": "repartidor",
    "level": "intermedio",
    "size": "31.0 KB",
    "downloadUrl": "/generated-resources/50-batch/repartidor/intermediate_situations_1.md",
    "tags": [
      "entregas",
      "delivery",
      "rappi",
      "intermedio",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio-scripts/intermediate_situations_1-audio-script.txt",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\repartidor\\intermediate_situations_1.md"
  },
  {
    "id": 6,
    "title": "Frases Esenciales para Entregas - Var 3",
    "description": "30 frases prácticas para entregas con ejemplos para repartidores",
    "type": "pdf",
    "category": "repartidor",
    "level": "basico",
    "size": "31.3 KB",
    "downloadUrl": "/generated-resources/50-batch/repartidor/basic_phrases_3.md",
    "tags": [
      "entregas",
      "delivery",
      "rappi",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-6.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\repartidor\\basic_phrases_3.md"
  },
  {
    "id": 7,
    "title": "Pronunciación: Entregas - Var 2",
    "description": "Audio de pronunciación con ejemplos hablados para repartidores",
    "type": "pdf",
    "category": "repartidor",
    "level": "basico",
    "size": "7.8 KB",
    "downloadUrl": "/generated-resources/50-batch/repartidor/basic_audio_2-audio-script.txt",
    "tags": [
      "entregas",
      "delivery",
      "rappi",
      "basico",
      "pronunciación"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-7.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\repartidor\\basic_audio_2-audio-script.txt",
  },
  {
    "id": 9,
    "title": "Frases Esenciales para Entregas - Var 4",
    "description": "30 frases esenciales para entregas con ejemplos prácticos para repartidores",
    "type": "pdf",
    "category": "repartidor",
    "level": "basico",
    "size": "32.1 KB",
    "downloadUrl": "/generated-resources/50-batch/repartidor/basic_phrases_4.md",
    "tags": [
      "entregas",
      "delivery",
      "rappi",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-9.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\repartidor\\basic_phrases_4.md"
  },
  {
    "id": 10,
    "title": "Conversaciones con Clientes - Var 1",
    "description": "Audio de pronunciación con ejemplos hablados para repartidores",
    "type": "pdf",
    "category": "repartidor",
    "level": "basico",
    "size": "9.3 KB",
    "downloadUrl": "/generated-resources/50-batch/repartidor/intermediate_conversations_1-audio-script.txt",
    "tags": [
      "entregas",
      "delivery",
      "rappi",
      "customer-service",
      "basico",
      "pronunciación"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-10.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\repartidor\\intermediate_conversations_1-audio-script.txt",
  },
  {
    "id": 11,
    "title": "Saludos y Confirmación de Pasajeros - Var 1",
    "description": "30 frases para saludos y confirmación de pasajeros con ejemplos prácticos",
    "type": "pdf",
    "category": "conductor",
    "level": "basico",
    "size": "31.2 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/basic_greetings_1.md",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "greetings",
      "customer-service",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-11.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\basic_greetings_1.md"
  },
  {
    "id": 12,
    "title": "Direcciones y Navegación GPS - Var 1",
    "description": "30 frases de direcciones y navegación GPS con ejemplos para conductores",
    "type": "pdf",
    "category": "conductor",
    "level": "basico",
    "size": "34.5 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/basic_directions_1.md",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "direcciones",
      "navigation",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-12.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\basic_directions_1.md"
  },
  {
    "id": 13,
    "title": "Audio: Direcciones en Inglés - Var 1",
    "description": "Audio de pronunciación con ejemplos hablados para conductores",
    "type": "pdf",
    "category": "conductor",
    "level": "basico",
    "size": "7.1 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/basic_audio_navigation_1-audio-script.txt",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "direcciones",
      "navigation",
      "basico",
      "pronunciación"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-13.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\basic_audio_navigation_1-audio-script.txt",
  },
  {
    "id": 14,
    "title": "Saludos y Confirmación de Pasajeros - Var 2",
    "description": "30 frases prácticas para saludos y confirmación con ejemplos para conductores",
    "type": "pdf",
    "category": "conductor",
    "level": "basico",
    "size": "31.8 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/basic_greetings_2.md",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "greetings",
      "customer-service",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-14.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\basic_greetings_2.md"
  },
  {
    "id": 15,
    "title": "Direcciones y Navegación GPS - Var 2",
    "description": "30 frases de direcciones y navegación GPS con ejemplos para conductores",
    "type": "pdf",
    "category": "conductor",
    "level": "basico",
    "size": "33.4 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/basic_directions_2.md",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "direcciones",
      "navigation",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-15.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\basic_directions_2.md"
  },
  {
    "id": 16,
    "title": "Small Talk con Pasajeros - Var 1",
    "description": "30 frases prácticas para conversación con pasajeros con ejemplos",
    "type": "pdf",
    "category": "conductor",
    "level": "intermedio",
    "size": "32.6 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/intermediate_smalltalk_1.md",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "customer-service",
      "intermedio",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-16.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\intermediate_smalltalk_1.md"
  },
  {
    "id": 17,
    "title": "Saludos y Confirmación de Pasajeros - Var 3",
    "description": "30 frases prácticas para saludos con pasajeros",
    "type": "pdf",
    "category": "conductor",
    "level": "basico",
    "size": "31.4 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/basic_greetings_3.md",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "greetings",
      "customer-service",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-17.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\basic_greetings_3.md"
  },
  {
    "id": 18,
    "title": "Audio: Direcciones en Inglés - Var 2",
    "description": "Audio de pronunciación con ejemplos hablados para conductores",
    "type": "pdf",
    "category": "conductor",
    "level": "basico",
    "size": "7.1 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/basic_audio_navigation_2-audio-script.txt",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "direcciones",
      "navigation",
      "basico",
      "pronunciación"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-18.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\basic_audio_navigation_2-audio-script.txt",
  },
  {
    "id": 19,
    "title": "Direcciones y Navegación GPS - Var 3",
    "description": "30 frases de direcciones y navegación GPS",
    "type": "pdf",
    "category": "conductor",
    "level": "basico",
    "size": "34.0 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/basic_directions_3.md",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "direcciones",
      "navigation",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-19.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\basic_directions_3.md"
  },
  {
    "id": 20,
    "title": "Manejo de Situaciones Difíciles - Var 1",
    "description": "30 frases prácticas para situaciones difíciles",
    "type": "pdf",
    "category": "conductor",
    "level": "intermedio",
    "size": "33.2 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/intermediate_problems_1.md",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "intermedio",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-20.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\intermediate_problems_1.md"
  },
  {
    "id": 21,
    "title": "Saludos Básicos en Inglés - Var 1",
    "description": "Audio de pronunciación con ejemplos hablados para todos los trabajadores",
    "type": "pdf",
    "category": "all",
    "level": "basico",
    "size": "6.9 KB",
    "downloadUrl": "/generated-resources/50-batch/all/basic_greetings_all_1-audio-script.txt",
    "tags": [
      "greetings",
      "basico",
      "pronunciación"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-21.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\all\\basic_greetings_all_1-audio-script.txt",
  },
  {
    "id": 22,
    "title": "Números y Direcciones - Var 1",
    "description": "30 frases esenciales sobre números y direcciones",
    "type": "pdf",
    "category": "all",
    "level": "basico",
    "size": "31.5 KB",
    "downloadUrl": "/generated-resources/50-batch/all/basic_numbers_1.md",
    "tags": [
      "direcciones",
      "navigation",
      "numbers",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-22.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\all\\basic_numbers_1.md"
  },
  {
    "id": 23,
    "title": "Tiempo y Horarios - Var 1",
    "description": "30 frases prácticas sobre tiempo y horarios",
    "type": "pdf",
    "category": "all",
    "level": "basico",
    "size": "31.6 KB",
    "downloadUrl": "/generated-resources/50-batch/all/basic_time_1.md",
    "tags": [
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-23.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace/active-development/hablas/generated-resources/50-batch/all/basic_time_1.md"
  },
  {
    "id": 25,
    "title": "Servicio al Cliente en Inglés - Var 1",
    "description": "25 frases esenciales de servicio al cliente con ejemplos prácticos",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "33.1 KB",
    "downloadUrl": "/generated-resources/50-batch/all/intermediate_customer_service_1.md",
    "tags": [
      "customer-service",
      "intermedio",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-25.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\all\\intermediate_customer_service_1.md"
  },
  {
    "id": 26,
    "title": "Manejo de Quejas y Problemas - Var 1",
    "description": "Guía completa con frases prácticas y ejemplos para todos los trabajadores",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "32.7 KB",
    "downloadUrl": "/generated-resources/50-batch/all/intermediate_complaints_1.md",
    "tags": [
      "problemas",
      "intermedio",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-26.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\all\\intermediate_complaints_1.md"
  },
  {
    "id": 27,
    "title": "Frases de Emergencia - Var 1",
    "description": "30 frases esenciales de emergencia con ejemplos prácticos para todos los trabajadores",
    "type": "pdf",
    "category": "all",
    "level": "basico",
    "size": "32.3 KB",
    "downloadUrl": "/generated-resources/50-batch/all/emergency_phrases_1.md",
    "tags": [
      "emergencia",
      "safety",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-27.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\all\\emergency_phrases_1.md"
  },
  {
    "id": 28,
    "title": "Saludos Básicos en Inglés - Var 2",
    "description": "Audio de pronunciación con ejemplos hablados para todos los trabajadores",
    "type": "pdf",
    "category": "all",
    "level": "basico",
    "size": "7.7 KB",
    "downloadUrl": "/generated-resources/50-batch/all/basic_greetings_all_2-audio-script.txt",
    "tags": [
      "greetings",
      "basico",
      "pronunciación"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-28.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\all\\basic_greetings_all_2-audio-script.txt",
  },
  {
    "id": 29,
    "title": "Números y Direcciones - Var 2",
    "description": "30 frases prácticas para números y direcciones con ejemplos para todos los trabajadores",
    "type": "pdf",
    "category": "all",
    "level": "basico",
    "size": "34.3 KB",
    "downloadUrl": "/generated-resources/50-batch/all/basic_numbers_2.md",
    "tags": [
      "direcciones",
      "navigation",
      "numbers",
      "basico",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-29.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\all\\basic_numbers_2.md"
  },
  {
    "id": 30,
    "title": "Protocolos de Seguridad - Var 1",
    "description": "30 frases de protocolos de seguridad con ejemplos prácticos para todos",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "32.1 KB",
    "downloadUrl": "/generated-resources/50-batch/all/safety_protocols_1.md",
    "tags": [
      "intermedio",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-30.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\all\\safety_protocols_1.md"
  },
  {
    "id": 31,
    "title": "Situaciones Complejas en Entregas - Var 2",
    "description": "30 frases prácticas para situaciones complejas en entregas con ejemplos",
    "type": "pdf",
    "category": "repartidor",
    "level": "intermedio",
    "size": "33.7 KB",
    "downloadUrl": "/generated-resources/50-batch/repartidor/intermediate_situations_2.md",
    "tags": [
      "entregas",
      "delivery",
      "rappi",
      "intermedio",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio-scripts/intermediate_situations_2-audio-script.txt",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\repartidor\\intermediate_situations_2.md"
  },
  {
    "id": 32,
    "title": "Conversaciones con Clientes - Var 2",
    "description": "Audio de pronunciación con ejemplos hablados para repartidores",
    "type": "pdf",
    "category": "repartidor",
    "level": "basico",
    "size": "7.7 KB",
    "downloadUrl": "/generated-resources/50-batch/repartidor/intermediate_conversations_2-audio-script.txt",
    "tags": [
      "entregas",
      "delivery",
      "rappi",
      "customer-service",
      "basico",
      "pronunciación"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-32.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\repartidor\\intermediate_conversations_2-audio-script.txt"
  },
  {
    "id": 33,
    "title": "Small Talk con Pasajeros - Var 2",
    "description": "30 frases esenciales para conversación con pasajeros con ejemplos prácticos",
    "type": "pdf",
    "category": "conductor",
    "level": "intermedio",
    "size": "31.5 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/intermediate_smalltalk_2.md",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "customer-service",
      "intermedio",
      "pdf"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-33.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\intermediate_smalltalk_2.md"
  },
  {
    "id": 34,
    "title": "Diálogos Reales con Pasajeros - Var 1",
    "description": "Audio de pronunciación con ejemplos hablados para conductores",
    "type": "pdf",
    "category": "conductor",
    "level": "basico",
    "size": "10.8 KB",
    "downloadUrl": "/generated-resources/50-batch/conductor/intermediate_audio_conversations_1-audio-script.txt",
    "tags": [
      "uber",
      "didi",
      "pasajeros",
      "rideshare",
      "customer-service",
      "basico",
      "pronunciación"
    ],
    "offline": true,
    "audioUrl": "/audio/resource-34.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch\\conductor\\intermediate_audio_conversations_1-audio-script.txt",
  },
  // JSON-converted resources (IDs 35-59) - Added 2025-10-28
  // NOTE: These resources are hidden from public pages pending review
  {
    "id": 35,
    "title": "Gig Economy Business Terminology",
    "description": "Essential business vocabulary for navigating the US gig economy platforms and contracts",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "3.9 KB",
    "downloadUrl": "/docs/resources/converted/avanzado/business-terminology.md",
    "tags": ["avanzado", "business-terminology", "gig-workers", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-35.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\avanzado\\business-terminology.md",
    "hidden": true
  },
  {
    "id": 36,
    "title": "Professional Complaint Handling",
    "description": "Turn customer complaints into opportunities for excellent service recovery",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "4.3 KB",
    "downloadUrl": "/docs/resources/converted/avanzado/complaint-handling.md",
    "tags": ["avanzado", "complaint-handling", "gig-workers", "professional", "business", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-36.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\avanzado\\complaint-handling.md",
    "hidden": true
  },
  {
    "id": 37,
    "title": "Professional Conflict Resolution",
    "description": "De-escalate tensions and resolve customer disputes professionally while protecting your ratings",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "4.9 KB",
    "downloadUrl": "/docs/resources/converted/avanzado/conflict-resolution.md",
    "tags": ["avanzado", "conflict-resolution", "gig-workers", "professional", "business", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-37.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\avanzado\\conflict-resolution.md",
    "hidden": true
  },
  {
    "id": 38,
    "title": "Cross-Cultural Professional Communication",
    "description": "Navigate cultural differences between Colombian and US professional communication styles",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "4.7 KB",
    "downloadUrl": "/docs/resources/converted/avanzado/cross-cultural-communication.md",
    "tags": ["avanzado", "cross-cultural", "gig-workers", "professional", "business", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-38.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\avanzado\\cross-cultural-communication.md",
    "hidden": true
  },
  {
    "id": 39,
    "title": "Customer Service Excellence",
    "description": "Advanced techniques for delivering outstanding customer experiences in gig work",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "3.5 KB",
    "downloadUrl": "/docs/resources/converted/avanzado/customer-service-excellence.md",
    "tags": ["avanzado", "customer-service", "gig-workers", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-39.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\avanzado\\customer-service-excellence.md",
    "hidden": true
  },
  {
    "id": 40,
    "title": "Earnings Optimization Communication",
    "description": "Professional communication to maximize tips, ratings, and repeat business",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "4.9 KB",
    "downloadUrl": "/docs/resources/converted/avanzado/earnings-optimization.md",
    "tags": ["avanzado", "earnings-optimization", "gig-workers", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-40.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\avanzado\\earnings-optimization.md",
    "hidden": true
  },
  {
    "id": 41,
    "title": "Professional Negotiation Skills",
    "description": "Navigate customer requests, rate discussions, and conflict resolution professionally",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "4.6 KB",
    "downloadUrl": "/docs/resources/converted/avanzado/negotiation-skills.md",
    "tags": ["avanzado", "negotiation", "gig-workers", "professional", "business", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-41.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\avanzado\\negotiation-skills.md",
    "hidden": true
  },
  {
    "id": 42,
    "title": "Professional Boundaries and Self-Protection",
    "description": "Maintain professional boundaries and protect yourself from inappropriate requests or behavior",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "4.9 KB",
    "downloadUrl": "/docs/resources/converted/avanzado/professional-boundaries.md",
    "tags": ["avanzado", "professional-boundaries", "gig-workers", "professional", "business", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-42.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\avanzado\\professional-boundaries.md",
    "hidden": true
  },
  {
    "id": 43,
    "title": "Professional Communication Essentials",
    "description": "Master formal business communication for professional gig work interactions",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "3.1 KB",
    "downloadUrl": "/docs/resources/converted/avanzado/professional-communication.md",
    "tags": ["avanzado", "professional-communication", "gig-workers", "professional", "business", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-43.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\avanzado\\professional-communication.md",
    "hidden": true
  },
  {
    "id": 44,
    "title": "Professional Time Management",
    "description": "Communicate effectively about schedules, delays, and time commitments in gig work",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "4.2 KB",
    "downloadUrl": "/docs/resources/converted/avanzado/time-management.md",
    "tags": ["avanzado", "time-management", "gig-workers", "professional", "business", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-44.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\avanzado\\time-management.md",
    "hidden": true
  },
  {
    "id": 45,
    "title": "Vehicle Accident Procedures",
    "description": "Critical steps and communication for handling traffic accidents during service",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "11.8 KB",
    "downloadUrl": "/docs/resources/converted/emergency/accident-procedures.md",
    "tags": ["emergency", "accident", "gig-workers", "intermedio", "pdf"],
    "offline": true,
    "audioUrl": "/audio-scripts/accident-procedures-audio-script.txt",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\emergency\\accident-procedures.md",
    "hidden": true
  },
  {
    "id": 46,
    "title": "Customer Conflicts and Disputes",
    "description": "De-escalation and resolution strategies for serious customer conflicts",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "10.0 KB",
    "downloadUrl": "/docs/resources/converted/emergency/customer-conflict.md",
    "tags": ["emergency", "conflict", "gig-workers", "intermedio", "customer-service", "conflict-resolution", "pdf"],
    "offline": true,
    "audioUrl": "/audio-scripts/customer-conflict-audio-script.txt",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\emergency\\customer-conflict.md",
    "hidden": true
  },
  {
    "id": 47,
    "title": "Lost Items and Property Disputes",
    "description": "Handle lost and found items, property disputes, and theft situations professionally",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "11.3 KB",
    "downloadUrl": "/docs/resources/converted/emergency/lost-or-found-items.md",
    "tags": ["emergency", "property", "gig-workers", "intermedio", "pdf"],
    "offline": true,
    "audioUrl": "/audio-scripts/lost-or-found-items-audio-script.txt",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\emergency\\lost-or-found-items.md",
    "hidden": true
  },
  {
    "id": 48,
    "title": "Medical Emergencies - Critical Communication",
    "description": "Essential phrases and procedures for handling medical emergencies during gig work",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "6.2 KB",
    "downloadUrl": "/docs/resources/converted/emergency/medical-emergencies.md",
    "tags": ["emergency", "medical", "gig-workers", "intermedio", "safety", "health", "pdf"],
    "offline": true,
    "audioUrl": "/audio-scripts/medical-emergencies-audio-script.txt",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\emergency\\medical-emergencies.md",
    "hidden": true
  },
  {
    "id": 49,
    "title": "Payment Disputes and Financial Conflicts",
    "description": "Handle payment issues, fare disputes, and tip conflicts professionally",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "11.3 KB",
    "downloadUrl": "/docs/resources/converted/emergency/payment-disputes.md",
    "tags": ["emergency", "payment", "gig-workers", "intermedio", "conflict-resolution", "pdf"],
    "offline": true,
    "audioUrl": "/audio-scripts/payment-disputes-audio-script.txt",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\emergency\\payment-disputes.md",
    "hidden": true
  },
  {
    "id": 50,
    "title": "Personal Safety - Threat and Danger Response",
    "description": "Critical communication and actions when facing safety threats during gig work",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "5.8 KB",
    "downloadUrl": "/docs/resources/converted/emergency/safety-concerns.md",
    "tags": ["emergency", "safety", "gig-workers", "intermedio", "pdf"],
    "offline": true,
    "audioUrl": "/audio-scripts/safety-concerns-audio-script.txt",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\emergency\\safety-concerns.md",
    "hidden": true
  },
  {
    "id": 51,
    "title": "Vehicle Breakdown and Mechanical Emergencies",
    "description": "Essential communication for handling vehicle problems during service",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "6.0 KB",
    "downloadUrl": "/docs/resources/converted/emergency/vehicle-breakdown.md",
    "tags": ["emergency", "vehicle", "gig-workers", "intermedio", "safety", "pdf"],
    "offline": true,
    "audioUrl": "/audio-scripts/vehicle-breakdown-audio-script.txt",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\emergency\\vehicle-breakdown.md",
    "hidden": true
  },
  {
    "id": 52,
    "title": "Severe Weather and Hazardous Conditions",
    "description": "Safety communication and procedures for dangerous weather while working",
    "type": "pdf",
    "category": "all",
    "level": "intermedio",
    "size": "9.6 KB",
    "downloadUrl": "/docs/resources/converted/emergency/weather-hazards.md",
    "tags": ["emergency", "weather", "gig-workers", "intermedio", "pdf"],
    "offline": true,
    "audioUrl": "/audio-scripts/weather-hazards-audio-script.txt",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\emergency\\weather-hazards.md",
    "hidden": true
  },
  {
    "id": 53,
    "title": "Airport Rideshare - Essential Procedures and Communication",
    "description": "Specialized vocabulary and procedures for airport pickups and drop-offs",
    "type": "pdf",
    "category": "conductor",
    "level": "avanzado",
    "size": "13.4 KB",
    "downloadUrl": "/docs/resources/converted/app-specific/airport-rideshare.md",
    "tags": ["app-specific", "airport-rideshare", "rideshare-drivers", "avanzado", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-53.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\app-specific\\airport-rideshare.md",
    "hidden": true
  },
  {
    "id": 54,
    "title": "DoorDash Delivery - Essential Vocabulary and Scenarios",
    "description": "Platform-specific communication for DoorDash delivery drivers (Dashers)",
    "type": "pdf",
    "category": "conductor",
    "level": "avanzado",
    "size": "7.3 KB",
    "downloadUrl": "/docs/resources/converted/app-specific/doordash-delivery.md",
    "tags": ["app-specific", "food-delivery-doordash", "doordash-drivers", "avanzado", "platform-specific", "doordash", "delivery", "repartidor", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-54.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\app-specific\\doordash-delivery.md",
    "hidden": true
  },
  {
    "id": 55,
    "title": "Lyft Driver - Essential Scenarios and Vocabulary",
    "description": "Platform-specific communication for Lyft rideshare drivers",
    "type": "pdf",
    "category": "conductor",
    "level": "avanzado",
    "size": "7.1 KB",
    "downloadUrl": "/docs/resources/converted/app-specific/lyft-driver-essentials.md",
    "tags": ["app-specific", "rideshare-lyft", "lyft-drivers", "avanzado", "platform-specific", "lyft", "rideshare", "conductor", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-55.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\app-specific\\lyft-driver-essentials.md",
    "hidden": true
  },
  {
    "id": 56,
    "title": "Multi-App Strategy - Maximizing Gig Work Earnings",
    "description": "Advanced techniques for working multiple platforms simultaneously",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "14.1 KB",
    "downloadUrl": "/docs/resources/converted/app-specific/multi-app-strategy.md",
    "tags": ["app-specific", "earnings-maximization", "experienced-gig-workers", "avanzado", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-56.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\app-specific\\multi-app-strategy.md",
    "hidden": true
  },
  {
    "id": 57,
    "title": "Platform Ratings System - Mastery Guide",
    "description": "Understanding and maximizing your ratings across all gig platforms",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "13.7 KB",
    "downloadUrl": "/docs/resources/converted/app-specific/platform-ratings-mastery.md",
    "tags": ["app-specific", "ratings-optimization", "all-gig-workers", "avanzado", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-57.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\app-specific\\platform-ratings-mastery.md",
    "hidden": true
  },
  {
    "id": 58,
    "title": "Tax Management and Business Expenses for Gig Workers",
    "description": "Essential vocabulary and procedures for managing taxes as independent contractor",
    "type": "pdf",
    "category": "all",
    "level": "avanzado",
    "size": "12.5 KB",
    "downloadUrl": "/docs/resources/converted/app-specific/tax-and-expenses.md",
    "tags": ["app-specific", "financial-management", "all-gig-workers", "avanzado", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-58.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\app-specific\\tax-and-expenses.md",
    "hidden": true
  },
  {
    "id": 59,
    "title": "Uber Driver - Essential Scenarios and Vocabulary",
    "description": "Platform-specific communication for Uber rideshare drivers",
    "type": "pdf",
    "category": "conductor",
    "level": "avanzado",
    "size": "5.9 KB",
    "downloadUrl": "/docs/resources/converted/app-specific/uber-driver-essentials.md",
    "tags": ["app-specific", "rideshare-uber", "uber-drivers", "avanzado", "platform-specific", "uber", "rideshare", "conductor", "pdf"],
    "offline": true,
    "audioUrl": "/audio/resource-59.mp3",
    "contentPath": "C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\resources\\converted\\app-specific\\uber-driver-essentials.md",
    "hidden": true
  }
]

/**
 * Helper to get only visible (non-hidden) resources
 */
export const visibleResources = resources.filter(r => !r.hidden)

/**
 * Helper to check if a resource is hidden
 */
export function isResourceHidden(resourceId: number): boolean {
  const resource = resources.find(r => r.id === resourceId)
  return resource?.hidden ?? false
}
