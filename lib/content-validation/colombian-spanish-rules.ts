/**
 * Colombian Spanish validation rules for gig worker content
 */

import { ValidationIssue, ResourceCategory } from './types';

export const COLOMBIAN_TERMS = {
  required: ['usted', 'señor', 'señora'],
  discouraged: ['tú', 'vos'],
  preferred: {
    apartamento: 'Use "apartamento" not "piso" (Colombian term)',
    celular: 'Use "celular" not "móvil" (Colombian term)',
    plata: 'Common Colombian slang for money (acceptable in casual context)',
  },
};

export const DELIVERY_TERMS = {
  rappi: ['entrega', 'domicilio', 'pedido', 'restaurante'],
  uber: ['pasajero', 'viaje', 'destino', 'recoger'],
  didi: ['conductor', 'ruta', 'aplicación'],
  common: ['cliente', 'dirección', 'efectivo', 'tarjeta', 'propina'],
};

export const CULTURAL_CHECKS = [
  {
    trigger: /building|edificio|apartamento/i,
    rule: 'Mention security guard/portero for Colombian context',
    severity: 'info' as const,
  },
  {
    trigger: /payment|pago|efectivo|tarjeta/i,
    rule: 'Include Nequi/Daviplata as Colombian digital payment option',
    severity: 'info' as const,
  },
  {
    trigger: /tip|propina/i,
    rule: 'Clarify tipping customs (10% optional in Colombia)',
    severity: 'info' as const,
  },
  {
    trigger: /address|dirección/i,
    rule: 'Colombian addresses use # format (Calle 10 # 20-30)',
    severity: 'warning' as const,
  },
];

export const SCENARIO_REQUIREMENTS = {
  repartidor: {
    required: ['customer greeting', 'delivery confirmation', 'location clarification'],
    recommended: [
      'apartment building entry',
      'payment collection',
      'problem resolution',
    ],
  },
  conductor: {
    required: ['passenger greeting', 'destination confirmation', 'route discussion'],
    recommended: ['traffic situation', 'payment collection', 'rating request'],
  },
  general: {
    required: ['polite greeting', 'basic communication'],
    recommended: ['emergency phrases', 'problem resolution'],
  },
};

/**
 * Validate content for Colombian Spanish and gig worker context
 */
export function validateContent(
  content: string,
  category: ResourceCategory,
  level: string
): {
  colombian: ValidationIssue[];
  context: ValidationIssue[];
  scenarios: {
    covered: string[];
    missing: string[];
  };
} {
  const lines = content.split('\n');
  const colombianIssues: ValidationIssue[] = [];
  const contextIssues: ValidationIssue[] = [];
  const coveredScenarios = new Set<string>();

  // Check each line for issues
  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    const lowerLine = line.toLowerCase();

    // Check for discouraged terms (tú, vos instead of usted)
    COLOMBIAN_TERMS.discouraged.forEach(term => {
      if (new RegExp(`\\b${term}\\b`, 'i').test(line)) {
        colombianIssues.push({
          type: 'warning',
          category: 'colombian',
          line: lineNumber,
          message: `Consider using "usted" instead of "${term}" for formal Colombian address`,
          suggestion: line.replace(new RegExp(`\\b${term}\\b`, 'gi'), 'usted'),
        });
      }
    });

    // Check cultural context triggers
    CULTURAL_CHECKS.forEach(check => {
      if (check.trigger.test(line)) {
        const existing = contextIssues.find(
          issue => issue.message === check.rule
        );
        if (!existing) {
          contextIssues.push({
            type: check.severity === 'warning' ? 'warning' : 'info',
            category: 'context',
            line: lineNumber,
            message: check.rule,
          });
        }
      }
    });

    // Track covered scenarios
    const scenarios = SCENARIO_REQUIREMENTS[category] || SCENARIO_REQUIREMENTS.general;
    [...scenarios.required, ...scenarios.recommended].forEach(scenario => {
      const scenarioKeywords = scenario.toLowerCase().split(' ');
      if (scenarioKeywords.every(keyword => lowerLine.includes(keyword))) {
        coveredScenarios.add(scenario);
      }
    });
  });

  // Check for missing required scenarios
  const requiredScenarios =
    SCENARIO_REQUIREMENTS[category]?.required || SCENARIO_REQUIREMENTS.general.required;
  const missingScenarios = requiredScenarios.filter(
    scenario => !coveredScenarios.has(scenario)
  );

  return {
    colombian: colombianIssues,
    context: contextIssues,
    scenarios: {
      covered: Array.from(coveredScenarios),
      missing: missingScenarios,
    },
  };
}

/**
 * Get terminology suggestions for a given category
 */
export function getTerminologySuggestions(
  category: ResourceCategory,
  context: string
): string[] {
  const categoryTerms = {
    repartidor: DELIVERY_TERMS.rappi,
    conductor: DELIVERY_TERMS.uber,
    general: DELIVERY_TERMS.common,
  };

  return categoryTerms[category] || DELIVERY_TERMS.common;
}
