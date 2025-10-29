# Severe Weather and Hazardous Conditions

**Level:** All Levels
**Category:** emergency
**Subcategory:** weather
**Target Audience:** gig-workers
**Cultural Context:** US weather emergencies

## Description

Safety communication and procedures for dangerous weather while working

## Vocabulary

| English | Spanish | Pronunciation | Context |
|---------|---------|---------------|---------|
| Severe weather | Clima severo | *KLEE-mah seh-VEH-roh* | Dangerous weather conditions |
| Tornado | Tornado | *tor-NAH-doh* | Rotating wind storm |
| Flash flood | Inundación repentina | *een-oon-dah-see-ON reh-pen-TEE-nah* | Sudden flooding |
| Ice / Black ice | Hielo / Hielo negro | *ee-EH-loh / ee-EH-loh NEH-groh* | Frozen road surface |
| Zero visibility | Visibilidad cero | *vee-see-bee-lee-DAD SEH-roh* | Cannot see to drive |
| Shelter | Refugio | *reh-FOO-hee-oh* | Safe place during storm |

## Cultural Notes

### Weather Seriousness

US weather can be more extreme than Colombian weather. Warnings are serious - follow them

**Colombian Comparison:** US has tornadoes, blizzards, hurricanes not present in Colombia

### Infrastructure Response

US has good emergency warning systems. Download weather alert apps. Follow official instructions

**Colombian Comparison:** More organized emergency response than many Colombian areas

### Vehicle Equipment

Emergency kit in vehicle is essential. Not optional for gig workers

**Colombian Comparison:** More emphasis on emergency preparedness than typical Colombian drivers

### Platform Support

Platforms support safety decisions. Weather delays/cancellations won't hurt your standing

**Colombian Comparison:** More formal safety policies than Colombian informal work

## Weather Types

```json
{
  "tornado": {
    "warning": "Tornado warning - actual tornado spotted or detected on radar",
    "immediateAction": [
      "Pull over immediately - DO NOT keep driving",
      "Seek substantial building shelter",
      "If no building: exit vehicle, lie flat in ditch or low area, cover head",
      "NEVER stay in vehicle or try to outrun tornado",
      "NEVER shelter under highway overpass"
    ],
    "communication": {
      "passenger": {
        "english": "There's a tornado warning. We need to take shelter immediately. Follow me to [building/safe area].",
        "spanish": "Hay una alerta de tornado. Necesitamos refugiarnos inmediatamente. Sígame hacia [edificio/área segura].",
        "pronunciation": "eye OO-nah ah-LER-tah deh tor-NAH-doh"
      },
      "platform": {
        "english": "Taking emergency shelter due to tornado warning at [location]. Will update when safe.",
        "spanish": "Tomando refugio de emergencia debido a alerta de tornado en [ubicación]. Actualizaré cuando esté a salvo."
      }
    },
    "culturalNote": "Tornadoes common in Midwest/South US (March-June). Colombia doesn't have tornadoes - take warnings very seriously"
  },
  "flashFlood": {
    "warning": "Flash flood warning - dangerous flooding expected or occurring",
    "criticalRule": "Turn around, don't drown - NEVER drive through flooded roads",
    "facts": [
      "6 inches of water can sweep away most vehicles",
      "You cannot judge water depth by looking",
      "Flooded roads may have washed out pavement underneath"
    ],
    "immediateAction": [
      "If approaching flooded road: turn around immediately",
      "If caught in flood: abandon vehicle and move to high ground",
      "Call 911 if trapped",
      "Never walk through flowing water above ankles"
    ],
    "communication": {
      "passenger": {
        "english": "The road ahead is flooded. For safety, I must take an alternate route or end the trip here.",
        "spanish": "El camino adelante está inundado. Por seguridad, debo tomar una ruta alternativa o terminar el viaje aquí.",
        "pronunciation": "el kah-MEE-noh ah-deh-LAN-teh es-TAH een-oon-DAH-doh"
      }
    }
  },
  "iceSnow": {
    "blackIce": "Clear ice on road - invisible and extremely dangerous. Common on bridges, overpasses, shaded areas",
    "signs": [
      "Temperature at or below freezing",
      "Road looks wet and shiny",
      "Other vehicles sliding or having difficulty",
      "Steering feels different"
    ],
    "immediateAction": [
      "Slow down significantly - speed limits don't apply in ice",
      "Increase following distance to 8-10 seconds",
      "No sudden movements - gentle steering, gentle braking",
      "If you start to slide: ease off gas, steer direction you want to go, don't brake hard"
    ],
    "communication": {
      "passenger": {
        "english": "Road conditions are icy. I need to drive much slower than normal for everyone's safety.",
        "spanish": "Las condiciones del camino están heladas. Necesito conducir mucho más lento de lo normal por la seguridad de todos.",
        "pronunciation": "lahs kon-dee-see-OH-nes del kah-MEE-noh es-TAN eh-LAH-dahs"
      }
    },
    "whenToStop": "If roads are ice rinks, stop working. Not worth the risk. Platform won't penalize weather-related stops"
  },
  "severeThunderstorm": {
    "dangers": "Lightning, high winds, hail, flash flooding, possible tornado",
    "action": [
      "Pull over if lightning very close (within seconds of thunder)",
      "Stay in vehicle - it's safe from lightning",
      "Avoid parking under trees or power lines",
      "Wait out worst of storm if safe to do so"
    ],
    "hail": {
      "ifCaught": "Pull over under parking garage or covered area if possible. Stay in vehicle. Hail can total a vehicle"
    }
  },
  "extremeHeat": {
    "danger": "Heat exhaustion, heat stroke, vehicle overheating",
    "prevention": [
      "Keep AC working properly",
      "Extra water in vehicle always",
      "Monitor engine temperature",
      "Take breaks in AC when possible"
    ],
    "heatStroke": {
      "symptoms": "Confusion, hot dry skin, rapid pulse, loss of consciousness",
      "action": "Call 911 immediately, move to AC, remove excess clothing, apply cool water"
    }
  }
}
```

## General Safety Principles

```json
{
  "yourSafetyFirst": {
    "principle": "Your life and passenger's life more important than completing trip or maintaining rating",
    "platforms": "All platforms support weather-related delays or cancellations. Your safety decisions protected"
  },
  "passengerExpectations": {
    "english": "I need to drive slower/stop temporarily due to dangerous weather conditions. Your safety is my priority.",
    "spanish": "Necesito conducir más lento/detenerme temporalmente debido a condiciones climáticas peligrosas. Su seguridad es mi prioridad.",
    "pronunciation": "neh-seh-SEE-toh kon-doo-SEER mahs LEN-toh"
  },
  "rightToRefuse": {
    "principle": "You can refuse trips or stop working when weather is dangerous",
    "communication": {
      "english": "Due to severe weather conditions, I cannot safely complete this trip. The platform can arrange alternative transportation.",
      "spanish": "Debido a condiciones climáticas severas, no puedo completar este viaje de forma segura. La plataforma puede organizar transporte alternativo."
    }
  },
  "weatherMonitoring": {
    "apps": "Weather apps with alerts: NOAA Weather Radio, Weather Channel, local news apps",
    "importance": "Check weather before starting shift. Monitor during shift. Don't wait for conditions to become dangerous"
  }
}
```

## Vehicle Preparedness

```json
{
  "winterKit": [
    "Ice scraper and snow brush",
    "Small shovel",
    "Blanket",
    "Flashlight with extra batteries",
    "First aid kit",
    "Jumper cables",
    "Sand or cat litter for traction",
    "Extra warm clothing",
    "Water and non-perishable snacks"
  ],
  "summerKit": [
    "Extra water (at least 1 gallon)",
    "Sunscreen",
    "First aid kit",
    "Flashlight",
    "Coolant for engine",
    "Umbrella for rain"
  ],
  "yearRound": [
    "Charged phone",
    "Phone charger",
    "Emergency contact list",
    "Basic tools",
    "Reflective triangles or flares",
    "Rain gear"
  ]
}
```

## Regional Weather Awareness

```json
{
  "tornado Alley": {
    "states": "Oklahoma, Kansas, Nebraska, Texas, South Dakota",
    "season": "March through June",
    "awareness": "Download tornado warning app. Know where shelters are. Take watches and warnings seriously"
  },
  "hurricaneZones": {
    "areas": "Gulf Coast, Atlantic Coast, Florida",
    "season": "June through November",
    "preparation": "Monitor forecasts. Evacuate if ordered. Don't work during hurricane conditions"
  },
  "winterWeather": {
    "areas": "Northern states, mountains",
    "season": "November through March",
    "skills": "Learn winter driving if working in snow areas. Consider winter tires. Practice in empty parking lot"
  },
  "desertHeat": {
    "areas": "Southwest US, California interior, Arizona, Nevada",
    "season": "May through September",
    "awareness": "Extreme heat danger for humans and vehicles. Extra water critical. Monitor engine temperature"
  }
}
```

## Emergency Numbers

```json
{
  "police911": "911 - Police, Fire, Medical",
  "weatherInfo": "Local news radio stations (FM dial)",
  "roadConditions": "511 in most states",
  "nonEmergency": "311 in most cities"
}
```

## Platform Specific Policies

```json
{
  "uber": {
    "weatherSupport": "Won't penalize for weather-related cancellations or delays",
    "reporting": "Report weather issues through app safety features"
  },
  "lyft": {
    "weatherSupport": "Protects drivers making safety decisions due to weather",
    "reporting": "Use app to report weather delays"
  },
  "doordash": {
    "weatherSupport": "Can pause Dash due to dangerous weather",
    "reporting": "Document weather conditions if affecting deliveries"
  }
}
```

---

*Generated from: emerg-007*
*Source: JSON Resources Integration Script*