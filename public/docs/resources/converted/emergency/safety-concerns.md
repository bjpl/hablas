# Personal Safety - Threat and Danger Response

**Level:** All Levels
**Category:** emergency
**Subcategory:** safety
**Target Audience:** gig-workers
**Cultural Context:** US personal safety

## Description

Critical communication and actions when facing safety threats during gig work

## Vocabulary

| English | Spanish | Pronunciation | Context |
|---------|---------|---------------|---------|
| Threat | Amenaza | *ah-meh-NAH-sah* | Danger or intimidation |
| Weapon | Arma | *AR-mah* | Gun, knife, or dangerous object |
| Police | Policía | *poh-lee-SEE-ah* | Law enforcement |
| Help | Ayuda | *ah-YOO-dah* | Assistance needed |
| Danger | Peligro | *peh-LEE-groh* | Unsafe situation |
| Safe | Seguro / A salvo | *seh-GOO-roh / ah SAL-voh* | Out of danger |

## Essential Phrases

### 1. I'm calling the police

**Spanish:** Voy a llamar a la policía

**Pronunciation:** *voy ah yah-MAR ah lah poh-lee-SEE-ah*

**Context:** Deterrent statement
**Priority:** CRITICAL

### 2. Get out of the car now

**Spanish:** Salga del carro ahora

**Pronunciation:** *SAL-gah del KA-rroh ah-OH-rah*

**Context:** Ending dangerous ride
**Priority:** CRITICAL

### 3. I need help, I'm in danger

**Spanish:** Necesito ayuda, estoy en peligro

**Pronunciation:** *neh-seh-SEE-toh ah-YOO-dah, es-TOY en peh-LEE-groh*

**Context:** Emergency call
**Priority:** CRITICAL

### 4. Stay back / Don't come closer

**Spanish:** Manténgase atrás / No se acerque

**Pronunciation:** *man-TEN-gah-seh ah-TRAS / noh seh ah-SER-keh*

**Context:** Creating distance
**Priority:** HIGH

### 5. Leave me alone

**Spanish:** Déjeme en paz

**Pronunciation:** *DEH-heh-meh en pas*

**Context:** Clear rejection
**Priority:** HIGH

## Cultural Notes

### It's Okay to Refuse Service

Your safety is more important than ratings. Cancel or end ride if you feel unsafe

**Colombian Comparison:** You have more authority to refuse than traditional Colombian service roles

### Police Response

Police take threats against workers seriously. Always report incidents

**Colombian Comparison:** More reliable emergency response than in many Colombian areas

### No Hero Actions

US culture does not expect you to fight or chase. Escape and report is correct response

**Colombian Comparison:** Different from Colombian machismo culture - safety over pride

### Worker Protection Laws

You have legal protection as worker. Platforms must support your safety decisions

**Colombian Comparison:** Stronger legal framework than Colombian informal economy

## Threat Scenarios

```json
{
  "intoxicatedAggressive": {
    "scenario": "Intoxicated passenger becomes aggressive or threatening",
    "immediateAction": [
      "Pull over in well-lit public area",
      "Turn on interior lights",
      "Tell passenger to exit: 'Salga del carro ahora'",
      "If they refuse, exit vehicle yourself and call 911",
      "Use app emergency button",
      "Do not engage in argument"
    ],
    "spanishPhrases": [
      "El viaje ha terminado. Necesita salir ahora. (The trip is over. You need to exit now.)",
      "Voy a llamar a la policía si no sale. (I will call police if you don't exit.)"
    ]
  },
  "weaponThreat": {
    "scenario": "Passenger displays or threatens with weapon",
    "immediateAction": [
      "Stay calm. Your life is more valuable than money or car",
      "Comply with immediate demands",
      "Look for opportunity to safely exit or escape",
      "Remember: people before things, life before money",
      "After safe, call 911 immediately",
      "Note: description, direction traveled, any details"
    ],
    "spanishPhrases": [
      "Está bien, está bien, tome lo que quiera. (Okay, okay, take whatever you want.)",
      "No voy a resistir. (I won't resist.)"
    ],
    "afterSafety": "Call 911, then platform. Do not pursue. You are witness, not enforcer"
  },
  "suspiciousRequest": {
    "scenario": "Passenger asks you to go to isolated area or makes uncomfortable request",
    "immediateAction": [
      "Trust your instincts",
      "Refuse politely but firmly",
      "Stay in public, well-lit areas",
      "If they insist, end ride",
      "Use app to document"
    ],
    "spanishPhrases": [
      "No me siento cómodo con esa ubicación. (I'm not comfortable with that location.)",
      "Solo puedo ir a direcciones que estén en la aplicación. (I can only go to addresses that are in the app.)"
    ]
  },
  "followingOrStalking": {
    "scenario": "You suspect you're being followed",
    "immediateAction": [
      "Do not go home",
      "Drive to police station or fire station",
      "Well-lit public area with witnesses",
      "Call 911 while driving if possible",
      "Make multiple right turns to confirm following",
      "Use app emergency button"
    ],
    "spanishPhrases": [
      "Estoy siendo seguido, necesito ayuda policial. (I'm being followed, I need police help.)"
    ]
  }
}
```

## Platform Safety Features

```json
{
  "uber": {
    "emergencyButton": "In-app 911 button shares location with dispatcher",
    "shareTrip": "Share ETA and route with trusted contacts",
    "rideCheck": "App detects unusual stops and checks on you",
    "anonymizedPhone": "App masks your real phone number"
  },
  "lyft": {
    "emergencyButton": "Smart 911 integration",
    "shareETA": "Share trip details with friends",
    "safetyCenter": "In-app safety tools",
    "continuousBackground": "App monitors entire trip"
  },
  "doordash": {
    "supportLine": "24/7 emergency support",
    "safetyTips": "In-app safety guidance",
    "incidentReport": "Fast reporting system"
  }
}
```

## Important Numbers

```json
{
  "emergency": "911 (Police, Fire, Medical)",
  "nonEmergency": "311 (in most cities)",
  "nationalDomesticViolence": "1-800-799-7233",
  "uber": "1-800-593-7069",
  "lyft": "1-855-865-9553",
  "doordash": "855-973-1040"
}
```

---

*Generated from: emerg-002*
*Source: JSON Resources Integration Script*