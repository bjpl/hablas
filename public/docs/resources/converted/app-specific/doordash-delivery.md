# DoorDash Delivery - Essential Vocabulary and Scenarios

**Level:** Intermediate-Avanzado
**Category:** app-specific
**Subcategory:** food-delivery-doordash
**Target Audience:** doordash-drivers
**Cultural Context:** US DoorDash platform

## Description

Platform-specific communication for DoorDash delivery drivers (Dashers)

## Vocabulary

| English | Spanish | Pronunciation | Context |
|---------|---------|---------------|---------|
| Dasher | Dasher / Repartidor | *dasher / reh-par-tee-DOR* | DoorDash delivery driver |
| Dash / Dashing | Dash / Repartiendo | *dash / reh-par-tee-EN-doh* | Actively working on DoorDash |
| Peak Pay | Pago pico / Bonificación de hora pico | *PAH-goh PEE-koh / boh-nee-fee-kah-see-ON* | Extra money per delivery during busy times |
| Base pay | Pago base | *PAH-goh BAH-seh* | Minimum guaranteed payment per delivery |
| Completion rate | Tasa de finalización | *TAH-sah deh fee-nah-lee-sah-see-ON* | Percentage of accepted orders you complete |
| Acceptance rate | Tasa de aceptación | *TAH-sah deh ah-sep-tah-see-ON* | Percentage of offers you accept |
| Hot Bag / Red Card | Bolsa térmica / Tarjeta Roja | *BOL-sah TER-mee-kah / tar-HEH-tah ROH-hah* | Required insulated bag and payment card |
| Stacked order | Pedido apilado | *peh-DEE-doh ah-pee-LAH-doh* | Multiple deliveries at once |

## Cultural Notes

### Minimal Interaction

Food delivery has less customer interaction than rideshare - most are contactless

**Colombian Comparison:** Much less social than Colombian delivery culture

### Time Sensitivity

Hot food going cold creates urgency - customers are watching ETA in app

**Colombian Comparison:** Similar urgency to Colombian food delivery

### Tip Culture

Customers pre-tip when ordering. No tip = they don't value service. Decline appropriately

**Colombian Comparison:** More formalized than Colombian propina system

### Restaurant Relationships

Being polite and patient with restaurant staff leads to faster service

**Colombian Comparison:** Similar to Colombian respect for food service workers

## Common Scenarios

This resource includes detailed scenarios for:

- **restaurantPickup**: Comprehensive phrases and tips
- **customerDelivery**: Comprehensive phrases and tips

## Doordash Specifics

```json
{
  "acceptanceRate": {
    "importance": "Does NOT affect account standing (unlike completion rate)",
    "freedom": "Can decline low-pay or far-distance orders without penalty",
    "strategy": "Only accept orders that make financial sense ($1.50-2 per mile minimum)",
    "topDasher": "Need 70% acceptance rate for Top Dasher status - not always worth it"
  },
  "completionRate": {
    "importance": "CRITICAL - must maintain 80% or higher",
    "deactivation": "Below 80% = deactivation risk",
    "affects": "Unassigning orders after accepting",
    "strategy": "Only accept orders you're confident you can complete"
  },
  "peakPay": {
    "how ItWorks": "Extra $1-5 per delivery during busy times in specific zones",
    "display": "Shown on map with + amount",
    "catch": "Can oversaturate zone with drivers - sometimes worse than no peak pay"
  },
  "redCardOrders": {
    "explanation": "Some orders require you to pay with Red Card at restaurant",
    "process": [
      "Order and pay at counter using Red Card",
      "Keep receipt",
      "DoorDash reimburses immediately"
    ],
    "phrases": {
      "english": "I'm ordering for DoorDash and paying with this card",
      "spanish": "Estoy ordenando para DoorDash y pagando con esta tarjeta",
      "pronunciation": "es-TOY or-deh-NAN-doh PAH-rah DoorDash"
    },
    "issues": "If Red Card declines, contact support immediately - don't use personal money"
  },
  "stackedOrders": {
    "pros": "More money, less driving between orders",
    "cons": "One customer gets food later/colder",
    "strategy": "Check that both deliveries are close together",
    "canDecline": "Can unassign one order from stack if it's not worth it"
  }
}
```

## Earnings Optimization

```json
{
  "orderSelection": {
    "minimumPay": "$1.50-2 per mile is standard minimum",
    "hiddenTips": "DoorDash hides tips above $4 - order might pay more than shown",
    "redFlags": [
      "$2-3 orders going 5+ miles",
      "Apartment deliveries late at night",
      "Restaurants consistently slow",
      "Orders to businesses during closed hours"
    ]
  },
  "hotspots": {
    "feature": "App shows busy restaurant areas",
    "reality": "Sometimes inaccurate - trust your local knowledge",
    "strategy": "Position between multiple popular restaurants, not in hotspot center"
  },
  "timeManagement": {
    "peakHours": "Lunch (11am-1:30pm), Dinner (5:30pm-9pm), Late night Fri-Sat (10pm-1am)",
    "slowTimes": "2pm-5pm typically dead - not worth working",
    "scheduling": "Don't need to schedule - can Dash Now during busy times"
  },
  "multiApping": {
    "concept": "Run DoorDash, Uber Eats, Grubhub simultaneously",
    "strategy": "Accept best-paying order from any app, pause others",
    "warning": "Can hurt completion rate if you're not careful - don't double-book"
  }
}
```

## Food Safety

```json
{
  "hotBag": {
    "required": "Must use insulated hot bag - customer can see if you don't in app",
    "benefit": "Food stays hot = better tips and ratings",
    "multiple": "Consider buying extra bags for large or multiple orders"
  },
  "drinks": {
    "challenge": "Spills hurt ratings significantly",
    "solutions": [
      "Use cup holders",
      "Place in floor behind front seat (most stable)",
      "Ask restaurant to seal lids with tape",
      "Drive extra carefully with drinks"
    ]
  },
  "tampering": {
    "rule": "NEVER open sealed food bags or eat customer's food",
    "photos": "Customer can see photo evidence",
    "consequence": "Instant deactivation for tampering"
  }
}
```

## Challenging Situations

```json
{
  "noTipOrders": {
    "identification": "$2-3 pay for any distance = no tip",
    "decision": "Most experienced Dashers decline these",
    "phrase": "No tip, no trip (common Dasher saying)",
    "exception": "If very short distance (under 1 mile) and on your route"
  },
  "customerRequestsChange": {
    "scenario": "Customer texts asking for different item or extra item",
    "response": {
      "english": "I've already picked up your order. Please contact DoorDash support for order changes.",
      "spanish": "Ya recogí su pedido. Por favor contacte al soporte de DoorDash para cambios de pedido.",
      "pronunciation": "yah reh-koh-HEE soo peh-DEE-doh"
    },
    "rule": "Don't go back to restaurant or buy extra items with your money"
  },
  "unsafeNeighborhoods": {
    "right": "You can decline deliveries to areas where you don't feel safe",
    "timing": "Night deliveries to unfamiliar areas - trust your instincts",
    "protection": "Don't risk your safety for any amount of money"
  }
}
```

## Top Dasher Program

```json
{
  "requirements": [
    "200 lifetime deliveries",
    "100 deliveries in last month",
    "4.7+ customer rating",
    "70%+ acceptance rate",
    "95%+ completion rate",
    "Measured monthly 15th-end of month"
  ],
  "benefits": [
    "Dash anytime without scheduling",
    "Priority access to high-value orders (allegedly)",
    "Higher catering order priority"
  ],
  "debate": "Many Dashers debate if 70% acceptance rate requirement is worth it - accepting bad orders to maintain rate"
}
```

---

*Generated from: app-003*
*Source: JSON Resources Integration Script*