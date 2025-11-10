# Platform Ratings System - Mastery Guide

**Level:** Avanzado
**Category:** app-specific
**Subcategory:** ratings-optimization
**Target Audience:** all-gig-workers
**Cultural Context:** US gig economy ratings

## Description

Understanding and maximizing your ratings across all gig platforms

## Vocabulary

| English | Spanish | Pronunciation | Context |
|---------|---------|---------------|---------|
| Rating / Score | Calificación / Puntuación | *kah-lee-fee-kah-see-ON / poon-too-ah-see-ON* | Star rating or numerical score from customers |
| Deactivation threshold | Umbral de desactivación | *oom-BRAL deh des-ak-tee-vah-see-ON* | Minimum rating to avoid account suspension |
| Rolling average | Promedio móvil | *proh-MEH-dee-oh MOH-veel* | Average calculated from recent ratings, older ratings drop off |

## Cultural Notes

### Rating Culture Intensity

US gig economy has extremely strict rating requirements. Small drops can threaten your income

**Colombian Comparison:** Much more systematic and consequential than Colombian informal reputation

### Customer Rating Power

Customers have significant power through ratings. Platform prioritizes customer satisfaction

**Colombian Comparison:** More formal power balance than Colombian direct negotiation

### Perfectionism Expectation

Anything less than near-perfect (4.6-4.8) is considered problematic

**Colombian Comparison:** Higher standard than typical Colombian service expectations

### Rating Transparency

You can see your rating in real-time. This creates anxiety but also allows quick correction

**Colombian Comparison:** More transparent than Colombian informal feedback

## Rating Systems By Platform

```json
{
  "uber": {
    "scale": "5-star system",
    "minimumRequired": "4.6 (below risks deactivation)",
    "calculation": "Average of last 500 rated trips",
    "visibility": "Passengers can see your rating before accepting ride",
    "passengerRating": "You also rate passengers - helps platform identify problem riders",
    "lowRatingReasons": [
      "Dirty vehicle",
      "Unsafe driving",
      "Wrong route",
      "Unfriendly service",
      "Vehicle didn't match app description",
      "Late to pickup"
    ],
    "protectionFeatures": [
      "Can dispute ratings with evidence",
      "Platform removes ratings from fraudulent passengers",
      "Very low ratings from problem passengers may be excluded",
      "Bad weather or traffic not held against you if documented"
    ]
  },
  "lyft": {
    "scale": "5-star system",
    "minimumRequired": "4.8 (higher than Uber)",
    "calculation": "Average of last 100 rated rides",
    "visibility": "Passengers see your rating",
    "culturalExpectation": "Lyft brand emphasizes friendly service - higher bar for ratings",
    "lowRatingReasons": [
      "Same as Uber, plus:",
      "Not friendly/warm enough (Lyft cultural expectation)",
      "Didn't engage in conversation when passenger wanted to chat",
      "Vehicle temperature not comfortable"
    ]
  },
  "doordash": {
    "scale": "5-star system plus additional metrics",
    "minimumRequired": "4.2 customer rating (more lenient than rideshare)",
    "additionalMetrics": [
      "On-time delivery percentage (must be 80%+)",
      "Completion rate (must be 80%+)",
      "Acceptance rate (doesn't affect standing but affects Top Dasher)"
    ],
    "lowRatingReasons": [
      "Late delivery",
      "Cold food",
      "Missing items (even if restaurant's fault)",
      "Didn't follow delivery instructions",
      "Poor communication",
      "Unprofessional appearance/behavior"
    ],
    "protection": "Can dispute ratings if issue was restaurant's fault, not yours"
  },
  "uberEats": {
    "scale": "Thumbs up/down plus tip (simpler than star rating)",
    "minimumRequired": "Satisfaction rate (% thumbs up) must be reasonable",
    "lessStressful": "Generally less rating anxiety than rideshare since interaction is minimal",
    "factors": [
      "On-time delivery",
      "Followed instructions",
      "Food condition on arrival",
      "Professional communication"
    ]
  }
}
```

## Rating Psychology

```json
{
  "whatCustomersActuallyRate": {
    "perception": "Customers rate their overall experience, not just you",
    "factors": [
      "Their mood when they booked",
      "Traffic delays beyond your control",
      "Restaurant errors (for delivery)",
      "App/platform issues",
      "Price (if they think fare was too high)",
      "Their personality (some never give 5 stars)"
    ],
    "reality": "You can provide perfect service and still get 4 stars or less from some people"
  },
  "theRecencyBias": {
    "principle": "Last impression matters most",
    "application": [
      "Ending on positive note crucial",
      "Help with luggage at end = better rating",
      "Friendly farewell = better rating",
      "Mention rating at end if service was excellent"
    ]
  },
  "theConfirmationBias": {
    "principle": "Small issues confirm negative expectations",
    "implication": [
      "First 30 seconds set tone for entire trip",
      "Dirty vehicle spotted immediately = whole trip colored negatively",
      "Late pickup = passenger looks for other problems",
      "Professional greeting = passenger more forgiving of issues"
    ]
  }
}
```

## Maximizing Ratings

```json
{
  "vehiclePresentation": {
    "critical": "Single most important factor within your control",
    "checklist": [
      "Exterior: Clean, no major dents/damage visible",
      "Interior: Vacuumed, no trash, no odors",
      "Windows: Clean inside and out",
      "Dashboard: Free of clutter",
      "Temperature: Comfortable before passenger enters",
      "Music: Low volume or off until passenger indicates preference"
    ],
    "frequency": "Daily exterior check, vacuum 2-3 times per week minimum, deep clean weekly"
  },
  "personalPresentation": {
    "appearance": [
      "Clean, neat clothing (no torn or stained clothes)",
      "Good personal hygiene (shower, deodorant, brushed teeth)",
      "Minimal cologne/perfume (strong scents hurt ratings)",
      "Professional but comfortable (button-up shirt or clean polo, not formal suit)"
    ],
    "demeanor": [
      "Smile and make eye contact",
      "Friendly but not overly familiar",
      "Professional tone",
      "Respectful of personal space"
    ]
  },
  "serviceExcellence": {
    "amenities": [
      "Phone chargers (lightning and USB-C minimum)",
      "Bottled water (individually wrapped)",
      "Gum or mints",
      "Tissues",
      "Umbrella for rainy days"
    ],
    "cost": "$20-30 monthly investment = significant tip and rating improvement",
    "offering": {
      "english": "I have water and phone chargers available if you need them",
      "spanish": "Tengo agua y cargadores de teléfono disponibles si los necesita",
      "pronunciation": "TEN-go AH-gwah ee kar-gah-DOH-res dees-poh-NEE-bles",
      "timing": "Offer within first minute of trip"
    }
  },
  "drivingQuality": {
    "crucial": "Bad driving = instant low rating regardless of other factors",
    "principles": [
      "Smooth acceleration and braking",
      "Maintain safe following distance",
      "Use turn signals always",
      "Obey speed limits (or match flow of traffic if faster)",
      "Avoid sudden lane changes",
      "Take turns at reasonable speed",
      "Minimize phone handling (navigation only)"
    ],
    "gpsUse": {
      "english": "I'm following the app's navigation for the fastest route. Let me know if you prefer a different route.",
      "spanish": "Estoy siguiendo la navegación de la aplicación para la ruta más rápida. Avíseme si prefiere una ruta diferente.",
      "pronunciation": "es-TOY see-gee-EN-doh lah nah-veh-gah-see-ON"
    }
  },
  "communication": {
    "greeting": {
      "english": "Hi [name]! How are you today? [Destination confirmation]",
      "spanish": "¡Hola [nombre]! ¿Cómo está hoy? [Confirmación de destino]",
      "importance": "Sets positive tone for entire interaction"
    },
    "readingCustomer": {
      "talkative": "Engage in friendly conversation about neutral topics",
      "quiet": "Respect their space, minimal interaction beyond professionalism",
      "working": "Don't interrupt, offer charger",
      "onPhone": "Be absolutely quiet"
    },
    "farewell": {
      "english": "Thank you so much! Have a great [day/evening]!",
      "spanish": "¡Muchas gracias! ¡Que tenga un excelente [día/tarde]!",
      "importance": "Last thing they remember = huge rating impact"
    }
  }
}
```

## Rating Recovery

```json
{
  "ifRatingDrops": {
    "dontPanic": "One or two bad ratings won't destroy your average if you have volume",
    "analyze": "Check feedback if platform provides it. Identify pattern",
    "adjust": "Make specific improvements based on feedback",
    "volume": "More trips = bad ratings diluted faster"
  },
  "commonProblems": {
    "cleanlinessIssues": {
      "fix": "Deep clean vehicle immediately. Daily maintenance checks",
      "timeline": "Noticeable rating improvement within 20-30 trips"
    },
    "unfriendlyPerception": {
      "fix": [
        "Warmer greeting",
        "More smiling",
        "Proactive amenity offers",
        "Better farewell"
      ],
      "timeline": "Immediate impact on ratings"
    },
    "navigationComplaints": {
      "fix": [
        "Always mention following app navigation",
        "Offer route alternatives proactively",
        "Explain traffic avoidance",
        "Use Waze or Google Maps alongside platform navigation"
      ]
    },
    "drivingComplaints": {
      "fix": [
        "Smoother driving (practice!)",
        "Slower turns",
        "More gradual braking",
        "Reduce phone handling"
      ],
      "critical": "This is most serious issue - bad driving can't be offset by friendliness"
    }
  }
}
```

## Requesting Ratings

```json
{
  "appropriateTiming": {
    "when": "Only if service was genuinely excellent and customer seems satisfied",
    "whenNot": "Never if there were any issues, delays, or complaints"
  },
  "howToAsk": {
    "uber": {
      "english": "If you were satisfied with the ride, I'd really appreciate a 5-star rating. Thank you!",
      "spanish": "Si quedó satisfecho con el viaje, realmente agradecería una calificación de 5 estrellas. ¡Gracias!",
      "pronunciation": "see keh-DOH sah-tees-FEH-choh kon el vee-AH-heh",
      "tone": "Friendly request, not demand"
    },
    "lyft": {
      "english": "If you enjoyed the ride, I'd be so grateful for 5 stars and any tip you feel is appropriate!",
      "spanish": "Si disfrutó el viaje, ¡estaría muy agradecido por 5 estrellas y cualquier propina que considere apropiada!",
      "pronunciation": "see dees-froo-TOH el vee-AH-heh",
      "note": "Lyft culture allows more direct tip mention"
    },
    "doordash": {
      "method": "Usually through text or note, not in person (contactless)",
      "example": "Thank you! If you're satisfied, I appreciate any rating. Enjoy your meal!",
      "spanish": "¡Gracias! Si está satisfecho, agradezco cualquier calificación. ¡Buen provecho!"
    }
  },
  "alternativeApproach": {
    "subtle": "Your satisfaction is very important to me. Thank you for your business!",
    "spanish": "Su satisfacción es muy importante para mí. ¡Gracias por su preferencia!",
    "benefit": "Plants rating idea without directly asking"
  }
}
```

## Dealing With Bad Ratings

```json
{
  "acceptance": {
    "reality": "You WILL get bad ratings occasionally even with perfect service",
    "reasons": [
      "Passenger having bad day",
      "Passenger misunderstands rating system (thinks 4 stars is good)",
      "Passenger unhappy about price (not your fault)",
      "Passenger has unrealistic expectations",
      "Passenger is just mean"
    ],
    "mindset": "Don't let individual bad ratings destroy your motivation"
  },
  "disputing": {
    "platforms": "All platforms allow rating disputes with evidence",
    "whenToDispute": [
      "Passenger made false claim",
      "Issue was outside your control (restaurant delay, traffic)",
      "Passenger behaved inappropriately and you documented",
      "Rating given for discriminatory reason"
    ],
    "howToDispute": [
      "Use in-app support tools",
      "Provide specific evidence (GPS, photos, messages)",
      "Explain factual situation calmly",
      "Reference platform policies that protect you"
    ],
    "success": "Legitimate disputes often result in rating removal"
  },
  "emotionalManagement": {
    "dontsPersonalize": "Rating reflects that specific trip/delivery, not your worth as person",
    "focusOnAverage": "Your overall rating is what matters, not individual ratings",
    "improvement": "Use criticism to improve, but don't obsess over impossible-to-please customers"
  }
}
```

## Advanced Strategies

```json
{
  "strategicTiming": {
    "principle": "Work during times when passengers are happier",
    "good Times": [
      "Friday evening (people happy, going to fun activities)",
      "Brunch time weekends (relaxed passengers)",
      "Holidays (people in good mood)"
    ],
    "difficult Times": [
      "Monday morning rush (stressed commuters)",
      "Late night weekend (intoxicated passengers)",
      "During major traffic issues (everyone frustrated)"
    ]
  },
  "passengerScreening": {
    "uber": "Can see passenger rating before accepting. Consider declining below 4.7",
    "lyft": "See passenger rating. Low-rated passengers often problematic",
    "risk": "Very low-rated passengers more likely to give bad ratings regardless of service"
  },
  "volumeStrategy": {
    "principle": "More trips = faster rating recovery from bad ratings",
    "calculation": "If 4.9 average, one 1-star rating drops you to 4.88. Fifty 5-star ratings restore you",
    "implication": "High volume drivers recover faster from bad ratings"
  }
}
```

---

*Generated from: app-005*
*Source: JSON Resources Integration Script*