# Lost Items and Property Disputes

**Level:** All Levels
**Category:** emergency
**Subcategory:** property
**Target Audience:** gig-workers
**Cultural Context:** US property handling

## Description

Handle lost and found items, property disputes, and theft situations professionally

## Vocabulary

| English | Spanish | Pronunciation | Context |
|---------|---------|---------------|---------|
| Lost item / Lost property | Artículo perdido / Propiedad perdida | *ar-TEE-koo-loh per-DEE-doh / proh-pee-eh-DAD per-DEE-dah* | Item left behind |
| Found / Located | Encontrado / Ubicado | *en-kon-TRAH-doh / oo-bee-KAH-doh* | Item has been recovered |
| Return / Give back | Devolver / Regresar | *deh-vol-VER / reh-greh-SAR* | Give item back to owner |
| Valuable | Valioso | *vah-lee-OH-soh* | High-value item |
| Identification | Identificación | *ee-den-tee-fee-kah-see-ON* | ID document |
| Theft / Stolen | Robo / Robado | *ROH-boh / roh-BAH-doh* | Item taken illegally |

## Cultural Notes

### Lost and Found Expectations

US culture expects honest return of lost items. Most people will tip generously for returned valuable items

**Colombian Comparison:** Similar honesty expectations but more formalized return process through platforms

### Legal Protection

Platform system protects you from false accusations with GPS, timing, and passenger records

**Colombian Comparison:** More systematic evidence than Colombian informal resolution

### Return Compensation

Appropriate to receive compensation for time and gas to return items - not seen as greedy

**Colombian Comparison:** More acceptance of compensation than Colombian favor culture

## Lost Item Protocol

```json
{
  "immediateDiscovery": {
    "scenario": "You find item immediately after passenger exits",
    "action": [
      "If passenger still visible, call out to them",
      "If they've gone, check if you can contact through app",
      "Take photo of item",
      "Secure item safely",
      "Report through platform lost and found system immediately"
    ],
    "phrases": {
      "english": "Excuse me! You left something in the car!",
      "spanish": "¡Disculpe! ¡Dejó algo en el carro!",
      "pronunciation": "dees-KOOL-peh! deh-HOH AL-go en el KA-rroh"
    }
  },
  "laterDiscovery": {
    "scenario": "You find item hours later after multiple trips",
    "action": [
      "Take photo of item",
      "Report through platform lost and found",
      "Platform matches item to passenger",
      "Platform coordinates return",
      "Follow platform instructions for return"
    ],
    "neverDo": [
      "Don't contact passenger directly outside app",
      "Don't agree to meet anywhere private",
      "Don't go to passenger's home alone",
      "Don't handle return outside platform system"
    ]
  },
  "platformProcess": {
    "uber": {
      "reporting": "Go to Account > Help > Trip issues > I found an item",
      "communication": "Platform connects you and passenger through app",
      "return": "Platform provides instructions for safe return meeting",
      "fee": "Uber may arrange return fee for your time and gas"
    },
    "lyft": {
      "reporting": "Go to trip history > select trip > 'Find Lost Item'",
      "communication": "Platform coordinates through app messaging",
      "return": "Platform guides return process",
      "fee": "Return fee possible through platform"
    },
    "doordash": {
      "reporting": "Report through app support",
      "customerContact": "Platform handles customer contact",
      "return": "Follow platform instructions"
    }
  }
}
```

## Item Categories

```json
{
  "highValueItems": {
    "examples": [
      "Phone",
      "Wallet",
      "Purse",
      "Laptop",
      "Jewelry",
      "Keys",
      "Passport"
    ],
    "specialCare": [
      "Report immediately - customer will be panicked",
      "Secure safely",
      "Don't look through wallet or phone",
      "Take photo to verify",
      "Priority return coordination"
    ],
    "customerRelief": {
      "english": "I found your [item]. I've reported it through the app. The platform will help coordinate return. Your item is safe.",
      "spanish": "Encontré su [artículo]. Lo he reportado a través de la aplicación. La plataforma ayudará a coordinar la devolución. Su artículo está seguro.",
      "pronunciation": "en-kon-TREH soo [ar-TEE-koo-loh]"
    }
  },
  "lowValueItems": {
    "examples": [
      "Water bottle",
      "Sunglasses (not expensive)",
      "Umbrella",
      "Book",
      "Clothing"
    ],
    "handling": [
      "Still report through platform",
      "Store safely for reasonable time",
      "Platform may not prioritize return coordination",
      "May need to dispose after 30 days if unclaimed"
    ]
  },
  "perishableItems": {
    "examples": [
      "Food",
      "Drinks",
      "Groceries"
    ],
    "handling": [
      "Contact platform but may need to dispose for hygiene",
      "Take photo before disposal",
      "Document through platform",
      "Cannot safely return perishables"
    ]
  },
  "illegalItems": {
    "examples": [
      "Drugs",
      "Weapons",
      "Stolen property (if you suspect)"
    ],
    "action": [
      "Do NOT touch or handle",
      "Report to platform immediately",
      "Platform will advise on police involvement",
      "Document with photo if safe",
      "Your safety priority"
    ]
  }
}
```

## Return Meeting

```json
{
  "safetyFirst": {
    "rules": [
      "Meet in public place only - police station parking lot is ideal",
      "Daytime preferred",
      "Bring friend if possible",
      "Tell someone where you're going",
      "Keep platform informed of meeting",
      "Don't give your home address",
      "Trust your instincts - reschedule if uncomfortable"
    ]
  },
  "verifyOwnership": {
    "steps": [
      "Ask them to describe item before showing it",
      "Check ID matches name in app",
      "If phone, ask them to call it (while in your vehicle) to verify",
      "If wallet, ask them to describe contents",
      "Platform should have confirmed identity"
    ],
    "phrases": {
      "english": "Can you describe what you lost? Can I see your ID to confirm it matches the app?",
      "spanish": "¿Puede describir lo que perdió? ¿Puedo ver su identificación para confirmar que coincide con la aplicación?",
      "pronunciation": "PWEH-deh des-kree-BEER loh keh per-dee-OH"
    }
  },
  "returnFee": {
    "appropriateness": "Return fee is appropriate for your time and gas - platforms often facilitate this",
    "amount": "$15-25 is typical for local return",
    "throughPlatform": "Arrange fee through platform if possible - protects both parties",
    "phrases": {
      "english": "The platform arranged a return fee of $[X] for the trip to return your item.",
      "spanish": "La plataforma organizó una tarifa de devolución de $[X] por el viaje para devolver su artículo.",
      "pronunciation": "lah plah-tah-FOR-mah or-gah-nee-SOH OO-nah tah-REE-fah"
    }
  }
}
```

## Theft Situations

```json
{
  "customerAccusesYou": {
    "scenario": "Customer claims you stole their item",
    "immediateResponse": [
      "Stay calm and professional",
      "Do not get defensive or angry",
      "Check your vehicle thoroughly",
      "Take photos/video of empty vehicle",
      "Report accusation to platform immediately",
      "Platform will investigate"
    ],
    "communication": {
      "english": "I understand you're missing your [item]. I've checked my vehicle thoroughly and don't have it. I'm reporting this to the platform so they can investigate. They have GPS and timing records of all pickups after yours.",
      "spanish": "Entiendo que le falta su [artículo]. He revisado mi vehículo exhaustivamente y no lo tengo. Estoy reportando esto a la plataforma para que investiguen. Tienen registros de GPS y tiempo de todas las recogidas después de la suya.",
      "pronunciation": "en-tee-EN-doh keh leh FAL-tah soo [ar-TEE-koo-loh]"
    },
    "protection": [
      "Platform has trip records showing who was in vehicle when",
      "GPS tracks your movements",
      "Next passengers are documented",
      "Your honest cooperation protects you"
    ],
    "dashcam": "Dashcam with interior camera provides definitive proof - highly recommended investment"
  },
  "actualTheft": {
    "scenario": "Customer left vehicle without paying or took something from you",
    "action": [
      "Report to platform immediately",
      "Report to police if significant value or you saw them take something",
      "Document everything - time, location, description",
      "Platform may deactivate customer",
      "Don't chase or confront"
    ]
  },
  "suspiciousRequest": {
    "scenario": "Customer asks unusual questions about your vehicle contents or delivery packages",
    "redFlags": [
      "Asking about other deliveries in vehicle",
      "Trying to look in trunk or packages",
      "Questions about your schedule or routes",
      "Attempting to get you out of vehicle"
    ],
    "response": [
      "Trust your instincts",
      "Don't answer invasive questions",
      "Keep vehicle locked",
      "End trip if you feel unsafe",
      "Report suspicious behavior to platform"
    ]
  }
}
```

## Best Practices

```json
{
  "prevention": [
    "Check vehicle after every passenger before next pickup",
    "Use cup holder dividers and organizers so items don't slide under seats",
    "Keep vehicle interior well-lit for easier checking",
    "Remind passengers to check for belongings (especially phone, wallet, keys)",
    "Install interior dashcam for protection"
  ],
  "reminderPhrases": {
    "english": "Please make sure you have all your belongings. Check for phone, wallet, and keys.",
    "spanish": "Por favor asegúrese de tener todas sus pertenencias. Revise su teléfono, billetera y llaves.",
    "pronunciation": "por fah-VOR ah-seh-GOO-reh-seh deh teh-NER TOH-dahs soos per-teh-NEN-see-ahs"
  },
  "storage": {
    "secured": "Keep found items in secure container in trunk",
    "documented": "Photo each item immediately when found",
    "organized": "Label or bag items with date found for tracking"
  }
}
```

## Legal Considerations

```json
{
  "yourObligations": [
    "Make reasonable effort to return items",
    "Report high-value items through platform",
    "Don't keep valuable items without attempt to return",
    "Follow platform procedures",
    "Can't be forced to spend excessive time/money on return"
  ],
  "customerExpectations": [
    "You make reasonable effort to return",
    "You respond to platform inquiries",
    "You arrange mutually convenient return",
    "You keep item safe while in your possession"
  ],
  "timeframe": {
    "reporting": "Report to platform within 24 hours of discovery",
    "holding": "Hold item for reasonable time (30 days typical)",
    "disposal": "After reasonable unclaimed period, may dispose of low-value items",
    "highValue": "High-value items may require longer holding period - check local laws"
  }
}
```

## Platform Contacts

```json
{
  "uber": {
    "lostAndFound": "In app: Account > Help > Trip issues > I found an item",
    "phone": "1-800-593-7069 for urgent issues"
  },
  "lyft": {
    "lostAndFound": "Trip history > select trip > 'Find Lost Item'",
    "phone": "855-865-9553"
  },
  "doordash": {
    "support": "In app help section",
    "phone": "855-973-1040"
  }
}
```

---

*Generated from: emerg-008*
*Source: JSON Resources Integration Script*