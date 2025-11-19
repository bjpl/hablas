/**
 * GigWorkerContextValidator Component
 * Colombian Spanish terminology and cultural context validation
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Flag,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
} from 'lucide-react';
import {
  validateContent,
  getTerminologySuggestions,
} from '@/lib/content-validation/colombian-spanish-rules';
import { ResourceCategory, ResourceLevel, ValidationIssue } from '@/lib/content-validation/types';

interface GigWorkerContextValidatorProps {
  content: string;
  category: ResourceCategory;
  level: ResourceLevel;
  onApplySuggestion?: (line: number, suggestion: string) => void;
  className?: string;
}

interface AlertProps {
  variant: 'warning' | 'info' | 'success';
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ variant, icon, title, children }) => {
  const variantStyles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
  };

  const iconColors = {
    warning: 'text-amber-600',
    info: 'text-blue-600',
    success: 'text-green-600',
  };

  return (
    <div className={`p-4 border rounded-lg ${variantStyles[variant]}`}>
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 mt-0.5 ${iconColors[variant]}`}>{icon}</span>
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

interface IssueItemProps {
  issue: ValidationIssue;
  onApplySuggestion?: (line: number, suggestion: string) => void;
}

const IssueItem: React.FC<IssueItemProps> = ({ issue, onApplySuggestion }) => {
  const handleApply = useCallback(() => {
    if (issue.suggestion && onApplySuggestion) {
      onApplySuggestion(issue.line, issue.suggestion);
    }
  }, [issue, onApplySuggestion]);

  const getIcon = () => {
    switch (issue.type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <li className="flex items-start gap-2 text-sm">
      {getIcon()}
      <div className="flex-1">
        <span className="font-medium">Line {issue.line}:</span> {issue.message}
        {issue.suggestion && onApplySuggestion && (
          <button
            onClick={handleApply}
            className="ml-2 text-blue-600 underline hover:text-blue-800"
          >
            Apply fix
          </button>
        )}
      </div>
    </li>
  );
};

export const GigWorkerContextValidator: React.FC<GigWorkerContextValidatorProps> = ({
  content,
  category,
  level,
  onApplySuggestion,
  className = '',
}) => {
  // Validate content
  const validationResults = useMemo(
    () => validateContent(content, category, level),
    [content, category, level]
  );

  const { colombian, context, scenarios } = validationResults;

  const totalIssues = colombian.length + context.length;
  const scenarioCoverage =
    scenarios.covered.length + scenarios.missing.length > 0
      ? Math.round(
          (scenarios.covered.length /
            (scenarios.covered.length + scenarios.missing.length)) *
            100
        )
      : 100;

  // Get terminology suggestions
  const terminologySuggestions = useMemo(
    () => getTerminologySuggestions(category, 'general'),
    [category]
  );

  return (
    <div className={`gig-worker-context-validator space-y-4 ${className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Content Validation</h3>
            <p className="text-sm text-gray-600 mt-1">
              Colombian Spanish & Gig Worker Context Analysis
            </p>
          </div>

          {/* Summary Badge */}
          <div className="text-right">
            <div className="flex items-center gap-2">
              {totalIssues === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              <span className="text-2xl font-bold text-gray-900">{totalIssues}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {totalIssues === 0 ? 'No issues' : 'Issues found'}
            </p>
          </div>
        </div>

        {/* Category & Level */}
        <div className="flex gap-2 mt-3">
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
            {category === 'repartidor'
              ? '📦 Delivery Driver'
              : category === 'conductor'
              ? '🚗 Rideshare Driver'
              : '💼 General'}
          </span>
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
            {level === 'basico'
              ? 'Basic'
              : level === 'intermedio'
              ? 'Intermediate'
              : 'Advanced'}
          </span>
        </div>
      </div>

      {/* Colombian Spanish Warnings */}
      {colombian.length > 0 && (
        <Alert
          variant="warning"
          icon={<Flag className="w-5 h-5" />}
          title="🇨🇴 Colombian Spanish Suggestions"
        >
          <ul className="space-y-2 mt-3">
            {colombian.map((issue, idx) => (
              <IssueItem
                key={`colombian-${idx}`}
                issue={issue}
                onApplySuggestion={onApplySuggestion}
              />
            ))}
          </ul>
        </Alert>
      )}

      {/* Missing Gig Worker Context */}
      {context.length > 0 && (
        <Alert
          variant="info"
          icon={<Briefcase className="w-5 h-5" />}
          title="💼 Gig Worker Context"
        >
          <ul className="space-y-2 mt-3">
            {context.map((issue, idx) => (
              <IssueItem
                key={`context-${idx}`}
                issue={issue}
                onApplySuggestion={onApplySuggestion}
              />
            ))}
          </ul>
        </Alert>
      )}

      {/* Practical Scenario Coverage */}
      <Alert
        variant={scenarioCoverage === 100 ? 'success' : 'info'}
        icon={<CheckCircle2 className="w-5 h-5" />}
        title="✅ Scenario Coverage"
      >
        <div className="mt-3">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Coverage: {scenarioCoverage}%</span>
              <span className="text-gray-600">
                {scenarios.covered.length} of{' '}
                {scenarios.covered.length + scenarios.missing.length} scenarios
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  scenarioCoverage === 100 ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${scenarioCoverage}%` }}
              />
            </div>
          </div>

          {/* Scenario Lists */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Covered Scenarios */}
            <div>
              <p className="font-medium mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Covered:
              </p>
              {scenarios.covered.length > 0 ? (
                <ul className="space-y-1">
                  {scenarios.covered.map((scenario, idx) => (
                    <li key={idx} className="text-green-700 text-xs pl-5">
                      ✓ {scenario}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-xs pl-5">None</p>
              )}
            </div>

            {/* Missing Scenarios */}
            <div>
              <p className="font-medium mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Missing:
              </p>
              {scenarios.missing.length > 0 ? (
                <ul className="space-y-1">
                  {scenarios.missing.map((scenario, idx) => (
                    <li key={idx} className="text-amber-700 text-xs pl-5">
                      ⚠ {scenario}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-700 text-xs pl-5">All covered!</p>
              )}
            </div>
          </div>
        </div>
      </Alert>

      {/* Terminology Suggestions */}
      {terminologySuggestions.length > 0 && (
        <Alert
          variant="info"
          icon={<Lightbulb className="w-5 h-5" />}
          title="💡 Recommended Terminology"
        >
          <div className="mt-3">
            <p className="text-sm mb-2">
              Common terms for{' '}
              {category === 'repartidor'
                ? 'delivery drivers'
                : category === 'conductor'
                ? 'rideshare drivers'
                : 'gig workers'}
              :
            </p>
            <div className="flex flex-wrap gap-2">
              {terminologySuggestions.map((term, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </Alert>
      )}

      {/* All Clear Message */}
      {totalIssues === 0 && scenarioCoverage === 100 && (
        <Alert
          variant="success"
          icon={<CheckCircle2 className="w-5 h-5" />}
          title="Content Validated Successfully"
        >
          <p className="text-sm mt-2">
            No issues detected. Content follows Colombian Spanish guidelines and includes
            appropriate gig worker context.
          </p>
        </Alert>
      )}
    </div>
  );
};
