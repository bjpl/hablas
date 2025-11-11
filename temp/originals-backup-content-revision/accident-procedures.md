# Vehicle Accident Procedures

**Level:** All Levels
**Category:** emergency
**Subcategory:** accident
**Target Audience:** gig-workers
**Cultural Context:** US traffic accident protocol

## Description

Critical steps and communication for handling traffic accidents during service

## Vocabulary

| English | Spanish | Pronunciation | Context |
|---------|---------|---------------|---------|
| Accident / Collision | Accidente / Colisión | *ak-see-DEN-teh / koh-lee-see-ON* | Vehicle crash |
| Injured | Herido / Lesionado | *eh-REE-doh / leh-see-oh-NAH-doh* | Person hurt in accident |
| Police report | Reporte policial / Informe policial | *reh-POR-teh poh-lee-see-AL / een-FOR-meh poh-lee-see-AL* | Official accident documentation |
| Insurance | Seguro | *seh-GOO-roh* | Coverage for damages |
| Witness | Testigo | *tes-TEE-goh* | Person who saw accident |
| Damage | Daño | *DAH-nyoh* | Physical harm to vehicle |
| License and registration | Licencia y registro | *lee-SEN-see-ah ee reh-HEES-troh* | Required vehicle documents |

## Cultural Notes

### Legal Requirements

US law requires staying at accident scene. Leaving is hit and run - serious crime

**Colombian Comparison:** Stricter enforcement than Colombian informal accident resolution

### Insurance System

US relies on insurance companies for compensation. Always involve insurance, never cash settlements

**Colombian Comparison:** More formalized than Colombian direct negotiation culture

### Documentation

Extensive documentation protects everyone. Photos, police reports, and records are essential

**Colombian Comparison:** More evidence-based than verbal Colombian agreements

### Platform Protection

Platform insurance provides significant coverage but requires immediate reporting

**Colombian Comparison:** More systematic protection than Colombian informal economy

## Immediate Steps

```json
{
  "step1": {
    "order": 1,
    "action": "STOP immediately and secure scene",
    "spanish": "DETÉNGASE inmediatamente y asegure la escena",
    "critical": "Leaving accident scene is illegal (hit and run) - serious crime",
    "details": [
      "Turn off engine",
      "Turn on hazard lights",
      "If safe, move vehicles to shoulder",
      "Set up warning triangles if you have them",
      "DO NOT LEAVE SCENE until released by police"
    ]
  },
  "step2": {
    "order": 2,
    "action": "Check for injuries",
    "spanish": "Verificar si hay heridos",
    "priority": "CRITICAL",
    "protocol": [
      "Check yourself first",
      "Check passenger(s)",
      "Check other vehicle occupants if possible",
      "If anyone injured, call 911 immediately",
      "Do not move seriously injured people unless immediate danger"
    ],
    "phrases": {
      "english": "Are you okay? Are you hurt anywhere?",
      "spanish": "¿Está bien? ¿Está herido/a en alguna parte?",
      "pronunciation": "es-TAH bee-EN? es-TAH eh-REE-doh en al-GOO-nah PAR-teh"
    }
  },
  "step3": {
    "order": 3,
    "action": "Call 911 if needed",
    "spanish": "Llame al 911 si es necesario",
    "call911if": [
      "Anyone injured (even slightly)",
      "Significant vehicle damage",
      "Other driver appears intoxicated",
      "Other driver has no insurance",
      "Other driver wants to leave scene",
      "Dispute about fault",
      "Passenger in your vehicle (always for gig work)",
      "ANY doubt - better safe than sorry"
    ],
    "call911script": {
      "english": "I need to report a traffic accident at [location]. [Anyone injured? Yes/No]. [Number of vehicles involved]. [Blocking traffic? Yes/No].",
      "spanish": "Necesito reportar un accidente de tráfico en [ubicación]. [¿Alguien herido? Sí/No]. [Número de vehículos involucrados]. [¿Bloqueando tráfico? Sí/No]."
    }
  },
  "step4": {
    "order": 4,
    "action": "Notify platform immediately",
    "spanish": "Notifique a la plataforma inmediatamente",
    "importance": "CRITICAL - Platform insurance coverage requires immediate notification",
    "howTo": [
      "Use app emergency button",
      "Call platform support line",
      "Notify even for minor accidents with passenger",
      "Platform guides you through insurance process"
    ]
  },
  "step5": {
    "order": 5,
    "action": "Exchange information",
    "spanish": "Intercambie información",
    "required": [
      "Driver name and contact",
      "Insurance company and policy number",
      "License plate number",
      "Vehicle make, model, color",
      "Driver's license number",
      "Accident location and time"
    ],
    "phrases": {
      "english": "We need to exchange insurance information. Here is my information. May I see your license and insurance card?",
      "spanish": "Necesitamos intercambiar información de seguro. Aquí está mi información. ¿Puedo ver su licencia y tarjeta de seguro?",
      "pronunciation": "neh-seh-see-TAH-mohs een-ter-kam-bee-AR een-for-mah-see-ON deh seh-GOO-roh"
    },
    "photograph": "Take photos of other driver's license, insurance card, license plate"
  },
  "step6": {
    "order": 6,
    "action": "Document everything",
    "spanish": "Documente todo",
    "photograph": [
      "All vehicle damage (yours and theirs)",
      "License plates (all vehicles)",
      "Overall accident scene",
      "Street signs and surroundings",
      "Skid marks or debris",
      "Traffic signals if relevant",
      "Other driver's insurance and license"
    ],
    "notes": [
      "Time and exact location",
      "Weather conditions",
      "Road conditions",
      "Traffic flow",
      "What you were doing immediately before",
      "What other driver was doing",
      "Direction of travel for all vehicles"
    ]
  },
  "step7": {
    "order": 7,
    "action": "Get witness information",
    "spanish": "Obtenga información de testigos",
    "importance": "Witnesses can be crucial for insurance claims",
    "phrases": {
      "english": "Excuse me, did you see what happened? Would you be willing to provide your contact information as a witness?",
      "spanish": "Disculpe, ¿vio lo que pasó? ¿Estaría dispuesto/a a proveer su información de contacto como testigo?",
      "pronunciation": "dees-KOOL-peh, vee-OH loh keh pah-SOH"
    },
    "collect": [
      "Witness name",
      "Phone number",
      "What they saw"
    ]
  },
  "step8": {
    "order": 8,
    "action": "Wait for police if they're coming",
    "spanish": "Espere a la policía si vienen",
    "policeReport": "Police report is crucial for insurance claims. Never leave before police arrive if 911 was called",
    "talking To Police": [
      "Be honest and factual",
      "Don't speculate about fault",
      "Don't apologize (can be seen as admission of guilt)",
      "Explain you were working for gig platform with passenger",
      "Request copy of police report for insurance"
    ]
  }
}
```

## Passenger Communication

```json
{
  "immediately": {
    "english": "Are you okay? Are you hurt at all?",
    "spanish": "¿Está bien? ¿Está herido/a?",
    "pronunciation": "es-TAH bee-EN? es-TAH eh-REE-doh",
    "priority": "Check passenger first"
  },
  "afterChecking": {
    "english": "I'm sorry this happened. I'm calling 911 and my platform immediately. Please stay calm and don't move if you feel any pain.",
    "spanish": "Lamento que esto haya pasado. Estoy llamando al 911 y a mi plataforma inmediatamente. Por favor mantenga la calma y no se mueva si siente algún dolor.",
    "pronunciation": "lah-MEN-toh keh ES-toh AH-yah pah-SAH-doh"
  },
  "reassurance": {
    "english": "You're covered by the platform's insurance. They will handle all medical costs and any other expenses.",
    "spanish": "Está cubierto/a por el seguro de la plataforma. Ellos manejarán todos los costos médicos y cualquier otro gasto.",
    "pronunciation": "es-TAH koo-bee-ER-toh por el seh-GOO-roh deh lah plah-tah-FOR-mah"
  },
  "information": {
    "english": "I need your contact information for the insurance report. The platform will follow up with you about this incident.",
    "spanish": "Necesito su información de contacto para el reporte de seguro. La plataforma hará seguimiento con usted sobre este incidente.",
    "pronunciation": "neh-seh-SEE-toh soo een-for-mah-see-ON deh kon-TAK-toh"
  }
}
```

## Insurance Coverage

```json
{
  "platformInsurance": {
    "uber": {
      "withPassenger": "$1 million liability coverage while passenger in vehicle",
      "deductible": "Typically $1,000-$2,500 for collision",
      "requirement": "Must report immediately through app"
    },
    "lyft": {
      "withPassenger": "$1 million liability coverage during ride",
      "deductible": "Typically $2,500 for collision",
      "requirement": "Report immediately through app and safety line"
    },
    "doordash": {
      "coverage": "Varies by situation - auto insurance primary",
      "requirement": "Report immediately, may need your personal insurance"
    }
  },
  "personalInsurance": {
    "importance": "Platform insurance is supplemental. Maintain your own commercial or rideshare insurance",
    "rideshareEndorsement": "Many insurers offer rideshare endorsement - essential for full coverage",
    "disclosure": "MUST tell your insurance company you do gig work - failure to disclose can void coverage"
  }
}
```

## What N O Tto Do

```json
{
  "critical": [
    "DO NOT leave accident scene",
    "DO NOT admit fault or apologize excessively",
    "DO NOT agree to handle privately without insurance",
    "DO NOT accept cash settlement",
    "DO NOT sign anything except police report",
    "DO NOT let other driver pressure you",
    "DO NOT discuss details on social media",
    "DO NOT fail to report to platform",
    "DO NOT move seriously injured person (unless immediate danger)",
    "DO NOT argue with other driver about fault"
  ]
}
```

## Statement To Others

```json
{
  "toOtherDriver": {
    "safe": "I'm okay. Are you okay? Let's exchange insurance information and wait for police.",
    "spanish": "Estoy bien. ¿Está usted bien? Intercambiemos información de seguro y esperemos a la policía.",
    "avoid": "Don't say 'I'm sorry' or 'It was my fault' - can be used against you"
  },
  "toPolice": {
    "safe": "I was driving for [platform] with a passenger. The accident happened at [time] when [factual description]. I was following traffic laws.",
    "spanish": "Estaba conduciendo para [plataforma] con un pasajero. El accidente ocurrió a las [hora] cuando [descripción factual]. Estaba siguiendo las leyes de tráfico.",
    "avoid": "Don't speculate about cause or fault. Stick to facts you directly observed"
  },
  "toPassenger": {
    "safe": "The platform's insurance will cover you. They'll contact you. Please provide your information.",
    "spanish": "El seguro de la plataforma lo/la cubrirá. Ellos se contactarán con usted. Por favor provea su información.",
    "avoid": "Don't promise specific outcomes. Let platform and insurance handle it"
  }
}
```

## After Accident

```json
{
  "immediate": [
    "Get checked by doctor even if you feel fine - injuries can appear later",
    "Keep all medical documentation",
    "Continue to document any developing symptoms",
    "Follow up with platform insurance adjuster",
    "Provide all requested documentation promptly"
  ],
  "vehicleRepair": [
    "Get estimate from approved repair shop",
    "Don't repair until insurance approves",
    "Keep all receipts and documentation",
    "Platform may provide rental car during repairs"
  ],
  "legalProtection": [
    "Keep copy of police report",
    "Document all communications",
    "Consider consulting attorney if serious",
    "Don't sign releases without understanding them",
    "Platform's insurance includes legal defense"
  ]
}
```

## Emergency Contacts

```json
{
  "police": "911",
  "uber": "1-800-593-7069",
  "lyft": "855-865-9553",
  "doordash": "855-973-1040",
  "insurance": "[Your insurance company number - keep in glove box]"
}
```

---

*Generated from: emerg-006*
*Source: JSON Resources Integration Script*