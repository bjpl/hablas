# Lyft Driver - Essential Scenarios and Vocabulary

**Level:** Intermediate-Avanzado
**Category:** app-specific
**Subcategory:** rideshare-lyft
**Target Audience:** lyft-drivers
**Cultural Context:** US Lyft platform

## Description

Platform-specific communication for Lyft rideshare drivers

## Vocabulary

| English | Spanish | Pronunciation | Context |
|---------|---------|---------------|---------|
| Prime Time | Tiempo Prime / Tarifa elevada | *tee-EM-poh prime / tah-REE-fah eh-leh-VAH-dah* | Lyft's version of surge pricing - shown as percentage increase |
| Lyft / Lyft XL / Lux / Lux Black | Lyft / Lyft XL / Lux / Lux Black | *lift / lift ex-el / looks / looks black* | Different service levels - Lux requires premium vehicles |
| Power Driver Bonus | Bono de conductor destacado | *BOH-noh deh kon-dook-TOR des-tah-KAH-doh* | Weekly bonus for completing certain number of rides |
| Streak bonus | Bono de racha | *BOH-noh deh RAH-chah* | Complete 3 rides in a row without declining = bonus |
| Ride Challenge | Reto de viajes | *REH-toh deh vee-AH-hehs* | Complete X rides, earn Y bonus |

## Cultural Notes

### Lyft vs Uber Culture

Lyft passengers often choose platform for "friendlier" experience. Lean into that

**Colombian Comparison:** Lyft style closer to Colombian warmth than Uber's efficiency focus

### Community Feel

Lyft emphasizes community over pure transaction. Drivers are 'members' not 'partners'

**Colombian Comparison:** More aligned with Colombian relationship-oriented culture

### Streak Pressure

Streak bonuses can make you feel pressured to accept marginal rides. Know your limits

**Colombian Comparison:** Different from Colombian flexible work pacing

## Common Scenarios

This resource includes detailed scenarios for:

- **pickup**: Comprehensive phrases and tips
- **duringRide**: Comprehensive phrases and tips
- **endOfTrip**: Comprehensive phrases and tips

## Lyft Specific Features

```json
{
  "streakBonus": {
    "howItWorks": "Complete 3 consecutive rides without declining = bonus (usually $5-15)",
    "strategy": [
      "Accept all reasonable requests during streak",
      "Be strategic about when you start streak",
      "Don't start streak if low on gas or near end of shift",
      "3rd ride can be longer distance - you're committed"
    ],
    "communication": {
      "english": "I'm on a streak bonus, so I really appreciate your patience",
      "spanish": "Estoy en un bono de racha, así que realmente aprecio su paciencia",
      "context": "If you need to explain why you're being extra accommodating"
    }
  },
  "rideChallenge": {
    "explanation": "Complete 50 rides by Sunday, earn $200 bonus (example)",
    "strategy": "Plan work schedule to hit challenges. Often makes working weekends worth it",
    "monitoring": "Check progress in app daily"
  },
  "lux/luxBlack": {
    "requirements": "Premium/luxury vehicle, higher standards for cleanliness and service",
    "dress": "Professional attire expected (button-up shirt, no t-shirts)",
    "amenities": "Phone chargers, water, mints required",
    "phrases": {
      "english": "Good [morning/afternoon/evening]. Welcome. May I help you with your bags?",
      "spanish": "Buenos [días/tardes/noches]. Bienvenido/a. ¿Puedo ayudarle con sus maletas?",
      "pronunciation": "BWEH-nohs [DEE-ahs/TAR-des/NOH-ches]",
      "context": "More formal greeting for luxury service"
    }
  }
}
```

## Platform Policies

```json
{
  "twoMinuteWarning": {
    "feature": "Lyft notifies passenger when you're 2 minutes away",
    "benefit": "Usually means passenger is ready when you arrive - less wait time"
  },
  "waitTime": {
    "freeWait": "2 minutes free wait time (shorter than Uber's 5 minutes)",
    "afterTwo": "Per-minute wait fee applies",
    "noShowFee": "Can cancel with fee after 5 minutes total wait",
    "phrases": {
      "english": "I've been waiting for 4 minutes. I'll need to cancel in 1 minute if you're not here.",
      "spanish": "He estado esperando por 4 minutos. Tendré que cancelar en 1 minuto si no está aquí.",
      "pronunciation": "eh es-TAH-doh es-peh-RAN-doh",
      "context": "Warning text through app"
    }
  },
  "accessibility": {
    "wheelchairs": "Lyft offers wheelchair-accessible vehicles through Lyft WAV (Wheelchair Accessible Vehicles)",
    "serviceAnimals": "Must accept service animals - it's federal law (not pets, service animals only)",
    "phrases": {
      "english": "Of course, I'm happy to accommodate your service animal.",
      "spanish": "Por supuesto, con mucho gusto acomodo a su animal de servicio.",
      "pronunciation": "por soo-PWES-toh, kon MOO-choh GOOS-toh",
      "context": "Professional response to service animal"
    }
  }
}
```

## Earnings Optimization

```json
{
  "primeTime": {
    "how ItWorks": "Shown as percentage increase (25%, 50%, 100%, etc.)",
    "strategy": "Position yourself in areas that typically go Prime Time before they activate",
    "hotspots": "Airports, business districts during rush hour, entertainment areas weekend nights"
  },
  "bonusStacking": {
    "streakDuringChallenge": "If you're working on a Ride Challenge, complete Streak bonuses at same time",
    "primeTimeStreak": "Starting streak during Prime Time maximizes earnings",
    "calculation": "Base fare + Prime Time % + Streak Bonus + Ride Challenge progress + Tips"
  },
  "scheduled Rides": {
    "benefit": "Lyft Scheduled rides often have Prime Time pricing built in",
    "reliability": "Passengers more likely to be ready on time",
    "commitment": "Must accept if you schedule yourself for them"
  }
}
```

## Lyft Culture

```json
{
  "friendlyBrand": {
    "note": "Lyft markets itself as friendlier, more community-oriented than Uber",
    "expectation": "Passengers expect warmer, more personal service",
    "balance": "But still professional - friendly doesn't mean overly familiar"
  },
  "fistBump": {
    "history": "Lyft originally encouraged \"fist bumps\" at pickup - now optional",
    "current": "Not required or expected. Only if you and passenger both comfortable",
    "covid": "Post-COVID, physical greetings less common"
  },
  "rating System": {
    "minimum": "4.8 rating to stay active (higher than Uber's 4.6)",
    "importance": "Lyft passengers can be more critical - service excellence essential",
    "recovery": "If rating drops, focus on friendly service, cleanliness, and safety"
  }
}
```

## Troubleshooting

```json
{
  "app Differences": {
    "navigation": "Lyft nav can be less accurate than Uber. Many drivers use Google Maps alongside",
    "switching": "Can run Lyft and Uber simultaneously - turn off one when you accept other's ride"
  },
  "customerIssues": {
    "wrongPassenger": "Verify name before starting. Wrong passenger = you don't get paid and may be penalized",
    "report": "Use in-app reporting for any issues during trip - creates documentation"
  },
  "deactivation": {
    "threshold": "Rating below 4.8, high cancellation rate, safety issues",
    "appeal": "Can appeal through Lyft support with documentation",
    "prevention": "Monitor your metrics weekly, respond quickly to any platform concerns"
  }
}
```

---

*Generated from: app-002*
*Source: JSON Resources Integration Script*