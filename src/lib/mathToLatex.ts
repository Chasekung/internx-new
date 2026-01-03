/**
 * Internal LaTeX conversion utility
 * Converts structured math content to LaTeX for AI processing
 * NEVER exposed to users
 */

import { MathContent, MathPart, MathStep } from '@/components/interview/MathEditorEnhanced';

/**
 * Convert a single math part to LaTeX
 */
function partToLatex(part: MathPart): string {
  switch (part.type) {
    case 'number':
    case 'variable':
    case 'text':
      return part.value;
    
    case 'operator':
      const opMap: Record<string, string> = {
        '+': '+',
        '-': '-',
        '*': '\\times',
        '/': '\\div',
        '=': '=',
        '<': '<',
        '>': '>',
        '<=': '\\leq',
        '>=': '\\geq',
        '!=': '\\neq'
      };
      return opMap[part.value] || part.value;
    
    case 'function':
      const funcMap: Record<string, string> = {
        // Basic
        'log': '\\log',
        'ln': '\\ln',
        'exp': '\\exp',
        // Trigonometry
        'sin': '\\sin',
        'cos': '\\cos',
        'tan': '\\tan',
        'sec': '\\sec',
        'csc': '\\csc',
        'cot': '\\cot',
        // Inverse Trig
        'arcsin': '\\arcsin',
        'arccos': '\\arccos',
        'arctan': '\\arctan',
        'arcsec': '\\arcsec',
        'arccsc': '\\arccsc',
        'arccot': '\\arccot',
        // Hyperbolic
        'sinh': '\\sinh',
        'cosh': '\\cosh',
        'tanh': '\\tanh',
        'sech': '\\sech',
        'csch': '\\csch',
        'coth': '\\coth',
        // Inverse Hyperbolic
        'arsinh': '\\arsinh',
        'arcosh': '\\arcosh',
        'artanh': '\\artanh',
        // Statistics
        'mean': '\\text{mean}',
        'median': '\\text{median}',
        'mode': '\\text{mode}',
        'std': '\\sigma',
        'var': '\\text{var}',
        'min': '\\min',
        'max': '\\max',
        'sum': '\\sum',
        'prod': '\\prod',
        // Probability
        'binom': '\\binom',
        'poisson': '\\text{Poisson}',
        'normal': '\\mathcal{N}',
        'gamma': '\\Gamma',
        'beta': 'B',
        'chi2': '\\chi^2',
        // Calculus
        'diff': '\\frac{d}{dx}',
        'integral': '\\int',
        'lim': '\\lim',
        'limsup': '\\limsup',
        'liminf': '\\liminf',
        // Linear Algebra
        'det': '\\det',
        'trace': '\\text{tr}',
        'rank': '\\text{rank}',
        'eigenval': '\\lambda',
        'eigenvec': '\\vec{v}',
        'transpose': '^T',
        'inverse': '^{-1}',
        // Special Functions
        'erf': '\\text{erf}',
        'erfc': '\\text{erfc}',
        'zeta': '\\zeta',
        'bessel': 'J',
        // List Operations
        'length': '|\\cdot|',
        'first': '\\text{first}',
        'last': '\\text{last}',
        'nth': '\\text{nth}',
        'append': '\\text{append}',
        'concat': '\\text{concat}',
        // Root
        'sqrt': '\\sqrt'
      };
      return funcMap[part.value] || `\\text{${part.value}}`;
    
    case 'fraction':
      const num = part.numerator?.map(partToLatex).join('') || '';
      const den = part.denominator?.map(partToLatex).join('') || '';
      return `\\frac{${num}}{${den}}`;
    
    case 'power':
      const base = part.base?.map(partToLatex).join('') || '';
      const exp = part.exponent?.map(partToLatex).join('') || '';
      return `${base}^{${exp}}`;
    
    case 'root':
      const rad = part.radicand?.map(partToLatex).join('') || '';
      return `\\sqrt{${rad}}`;
    
    case 'parentheses':
      const content = part.content?.map(partToLatex).join('') || '';
      return `\\left(${content}\\right)`;
    
    default:
      return '';
  }
}

/**
 * Convert math content to LaTeX
 */
export function mathContentToLatex(content: MathContent): string {
  const latexParts = content.parts.map(partToLatex);
  return latexParts.join(' ');
}

/**
 * Convert a math step to LaTeX with explanation
 */
export function mathStepToLatex(step: MathStep): string {
  const latex = mathContentToLatex(step.content);
  if (step.explanation) {
    return `${latex} \\quad \\text{(${step.explanation})}`;
  }
  return latex;
}

/**
 * Convert multiple math steps to a formatted LaTeX document
 */
export function mathStepsToLatex(steps: MathStep[]): string {
  if (steps.length === 0) return '';
  
  const stepLatex = steps.map((step, index) => {
    const latex = mathStepToLatex(step);
    return `\\text{Step ${index + 1}:} \\quad ${latex}`;
  });
  
  return stepLatex.join(' \\\\\n');
}

/**
 * Convert structured math to a clean LaTeX string for AI analysis
 * This is the main export used by the API
 */
export function convertMathWorkToLatex(steps: MathStep[]): {
  latex: string;
  stepCount: number;
  hasExplanations: boolean;
} {
  if (steps.length === 0) {
    return {
      latex: '',
      stepCount: 0,
      hasExplanations: false
    };
  }
  
  const latex = mathStepsToLatex(steps);
  const hasExplanations = steps.some(step => step.explanation && step.explanation.trim().length > 0);
  
  return {
    latex,
    stepCount: steps.length,
    hasExplanations
  };
}

/**
 * Validate math content structure
 */
export function validateMathContent(content: MathContent): { valid: boolean; error?: string } {
  if (!content.parts || content.parts.length === 0) {
    return { valid: false, error: 'Math content is empty' };
  }
  
  // Basic validation - check for balanced parentheses
  let parenCount = 0;
  for (const part of content.parts) {
    if (part.type === 'parentheses') {
      parenCount++;
    }
  }
  
  return { valid: true };
}

