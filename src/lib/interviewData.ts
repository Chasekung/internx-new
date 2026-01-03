/**
 * Interview Types and Mock Data
 * Comprehensive interview categories with domain-specific subcategories
 */

export interface Interview {
  id: string;
  title: string;
  description: string;
  category: InterviewCategory;
  subcategory: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  keywords: string[];
  slug: string;
  hasTask: boolean; // Whether this interview includes interactive tasks
  taskType?: 'coding' | 'whiteboard' | 'math' | 'writing' | 'design';
}

export type InterviewCategory = 
  | 'Computer Science'
  | 'Finance'
  | 'Mathematics'
  | 'Consulting'
  | 'Design'
  | 'Engineering'
  | 'Healthcare'
  | 'Business'
  | 'Law'
  | 'Science';

export const INTERVIEW_CATEGORIES: InterviewCategory[] = [
  'Computer Science',
  'Finance',
  'Mathematics',
  'Consulting',
  'Design',
  'Engineering',
  'Healthcare',
  'Business',
  'Law',
  'Science',
];

export const CATEGORY_SUBCATEGORIES: Record<InterviewCategory, string[]> = {
  'Computer Science': ['Coding / Algorithms', 'System Design', 'Debugging / Code Review', 'DevOps / Infrastructure', 'Machine Learning Engineering'],
  'Finance': ['Investment Banking Technical', 'Corporate Finance', 'Markets & Trading', 'Quantitative Finance', 'Accounting & Valuation'],
  'Mathematics': ['Probability & Statistics', 'Stochastic Calculus', 'Optimization & Linear Algebra', 'Quant Trading Logic', 'Quant Research Theory'],
  'Consulting': ['Case Interview', 'Market Sizing', 'Strategy & Operations', 'Behavioral / Fit', 'Data-Driven Analysis'],
  'Design': ['UX/UI Design', 'Product Design', 'Graphic Design', 'Creative Direction', 'Portfolio Critique'],
  'Engineering': ['Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Aerospace Engineering', 'Manufacturing / Industrial'],
  'Healthcare': ['Medical School MMI', 'Clinical Reasoning', 'Ethical Scenarios', 'Patient Communication', 'Healthcare Systems'],
  'Business': ['Product Management', 'Marketing Strategy', 'Business Analytics', 'Leadership & Behavioral', 'Go-To-Market Strategy'],
  'Law': ['Case Analysis', 'Legal Reasoning', 'Ethics & Responsibility', 'Client Interaction', 'Writing & Argumentation'],
  'Science': ['Experimental Design', 'Data Interpretation', 'Research Methods', 'Lab Skills', 'Scientific Reasoning'],
};

export const CATEGORY_ICONS: Record<InterviewCategory, string> = {
  'Computer Science': '',
  'Finance': '',
  'Mathematics': '',
  'Consulting': '',
  'Design': '',
  'Engineering': '',
  'Healthcare': '',
  'Business': '',
  'Law': '',
  'Science': '',
};

export const CATEGORY_COLORS: Record<InterviewCategory, { bg: string; text: string; border: string }> = {
  'Computer Science': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-700' },
  'Finance': { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700' },
  'Mathematics': { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-700' },
  'Consulting': { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700' },
  'Design': { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-700' },
  'Engineering': { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700' },
  'Healthcare': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700' },
  'Business': { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-700' },
  'Law': { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-700' },
  'Science': { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-700' },
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Hard': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// Comprehensive interview data
export const MOCK_INTERVIEWS: Interview[] = [
  // ============ COMPUTER SCIENCE ============
  // Coding / Algorithms
  { id: 'cs-1', title: 'Array & String Manipulation', description: 'Master fundamental array operations, two-pointer techniques, and string algorithms.', category: 'Computer Science', subcategory: 'Coding / Algorithms', difficulty: 'Easy', duration: '30 min', keywords: ['arrays', 'strings', 'two pointers', 'sliding window'], slug: 'array-string-manipulation', hasTask: true, taskType: 'coding' },
  { id: 'cs-2', title: 'Linked Lists & Trees', description: 'Navigate linked list operations and tree traversal algorithms.', category: 'Computer Science', subcategory: 'Coding / Algorithms', difficulty: 'Medium', duration: '35 min', keywords: ['linked lists', 'trees', 'BST', 'traversal', 'recursion'], slug: 'linked-lists-trees', hasTask: true, taskType: 'coding' },
  { id: 'cs-3', title: 'Dynamic Programming', description: 'Solve optimization problems using memoization and tabulation.', category: 'Computer Science', subcategory: 'Coding / Algorithms', difficulty: 'Hard', duration: '45 min', keywords: ['dynamic programming', 'memoization', 'optimization', 'subproblems'], slug: 'dynamic-programming', hasTask: true, taskType: 'coding' },
  { id: 'cs-4', title: 'Graph Algorithms', description: 'BFS, DFS, shortest paths, and graph theory applications.', category: 'Computer Science', subcategory: 'Coding / Algorithms', difficulty: 'Hard', duration: '45 min', keywords: ['graphs', 'BFS', 'DFS', 'Dijkstra', 'topological sort'], slug: 'graph-algorithms', hasTask: true, taskType: 'coding' },
  
  // System Design
  { id: 'cs-5', title: 'URL Shortener Design', description: 'Design a scalable URL shortening service like bit.ly.', category: 'Computer Science', subcategory: 'System Design', difficulty: 'Medium', duration: '40 min', keywords: ['system design', 'scalability', 'hashing', 'database'], slug: 'url-shortener-design', hasTask: true, taskType: 'whiteboard' },
  { id: 'cs-6', title: 'Chat Application Architecture', description: 'Design a real-time messaging system with millions of users.', category: 'Computer Science', subcategory: 'System Design', difficulty: 'Hard', duration: '50 min', keywords: ['websockets', 'real-time', 'messaging', 'distributed'], slug: 'chat-app-design', hasTask: true, taskType: 'whiteboard' },
  { id: 'cs-7', title: 'Rate Limiter Design', description: 'Build a distributed rate limiting system.', category: 'Computer Science', subcategory: 'System Design', difficulty: 'Medium', duration: '35 min', keywords: ['rate limiting', 'API', 'distributed systems', 'algorithms'], slug: 'rate-limiter-design', hasTask: true, taskType: 'whiteboard' },
  
  // DevOps
  { id: 'cs-8', title: 'CI/CD Pipeline Design', description: 'Design and explain continuous integration workflows.', category: 'Computer Science', subcategory: 'DevOps / Infrastructure', difficulty: 'Medium', duration: '30 min', keywords: ['CI/CD', 'DevOps', 'automation', 'deployment'], slug: 'cicd-pipeline', hasTask: false },
  { id: 'cs-9', title: 'Container Orchestration', description: 'Kubernetes concepts and container management.', category: 'Computer Science', subcategory: 'DevOps / Infrastructure', difficulty: 'Hard', duration: '40 min', keywords: ['Kubernetes', 'Docker', 'containers', 'orchestration'], slug: 'container-orchestration', hasTask: false },
  
  // ML Engineering
  { id: 'cs-10', title: 'ML System Design', description: 'Design end-to-end machine learning pipelines.', category: 'Computer Science', subcategory: 'Machine Learning Engineering', difficulty: 'Hard', duration: '50 min', keywords: ['ML', 'pipelines', 'model serving', 'feature engineering'], slug: 'ml-system-design', hasTask: true, taskType: 'whiteboard' },
  { id: 'cs-11', title: 'Neural Network Fundamentals', description: 'Explain backpropagation, activation functions, and architectures.', category: 'Computer Science', subcategory: 'Machine Learning Engineering', difficulty: 'Medium', duration: '35 min', keywords: ['neural networks', 'deep learning', 'backpropagation'], slug: 'neural-network-fundamentals', hasTask: true, taskType: 'math' },

  // ============ FINANCE ============
  // Investment Banking
  { id: 'fin-1', title: 'Walk Me Through a DCF', description: 'Build and explain a discounted cash flow valuation model.', category: 'Finance', subcategory: 'Investment Banking Technical', difficulty: 'Medium', duration: '40 min', keywords: ['DCF', 'valuation', 'modeling', 'investment banking'], slug: 'dcf-walkthrough', hasTask: true, taskType: 'math' },
  { id: 'fin-2', title: 'M&A Accretion/Dilution', description: 'Analyze merger impact on earnings per share.', category: 'Finance', subcategory: 'Investment Banking Technical', difficulty: 'Hard', duration: '45 min', keywords: ['M&A', 'accretion', 'dilution', 'EPS'], slug: 'ma-accretion-dilution', hasTask: true, taskType: 'math' },
  { id: 'fin-3', title: 'LBO Modeling Basics', description: 'Understand leveraged buyout mechanics and returns.', category: 'Finance', subcategory: 'Investment Banking Technical', difficulty: 'Hard', duration: '50 min', keywords: ['LBO', 'private equity', 'leverage', 'IRR'], slug: 'lbo-modeling', hasTask: true, taskType: 'math' },
  
  // Markets & Trading
  { id: 'fin-4', title: 'Options Pricing', description: 'Black-Scholes, Greeks, and options strategies.', category: 'Finance', subcategory: 'Markets & Trading', difficulty: 'Hard', duration: '45 min', keywords: ['options', 'derivatives', 'Black-Scholes', 'Greeks'], slug: 'options-pricing', hasTask: true, taskType: 'math' },
  { id: 'fin-5', title: 'Market Making Concepts', description: 'Bid-ask spreads, inventory risk, and market dynamics.', category: 'Finance', subcategory: 'Markets & Trading', difficulty: 'Medium', duration: '35 min', keywords: ['market making', 'trading', 'liquidity', 'spreads'], slug: 'market-making', hasTask: false },
  { id: 'fin-6', title: 'Fixed Income Analysis', description: 'Bond pricing, duration, and yield curve analysis.', category: 'Finance', subcategory: 'Markets & Trading', difficulty: 'Medium', duration: '40 min', keywords: ['bonds', 'fixed income', 'duration', 'yield curve'], slug: 'fixed-income', hasTask: true, taskType: 'math' },
  
  // Accounting
  { id: 'fin-7', title: 'Three Statement Modeling', description: 'Link income statement, balance sheet, and cash flow.', category: 'Finance', subcategory: 'Accounting & Valuation', difficulty: 'Medium', duration: '40 min', keywords: ['financial statements', 'accounting', 'modeling'], slug: 'three-statement-modeling', hasTask: true, taskType: 'math' },
  { id: 'fin-8', title: 'Comparable Company Analysis', description: 'Valuation using trading multiples.', category: 'Finance', subcategory: 'Accounting & Valuation', difficulty: 'Easy', duration: '30 min', keywords: ['comps', 'multiples', 'valuation', 'peer analysis'], slug: 'comparable-analysis', hasTask: false },

  // ============ MATHEMATICS / QUANT ============
  { id: 'math-1', title: 'Probability Brain Teasers', description: 'Classic probability puzzles and conditional probability.', category: 'Mathematics', subcategory: 'Probability & Statistics', difficulty: 'Medium', duration: '35 min', keywords: ['probability', 'brain teasers', 'Bayes', 'conditional'], slug: 'probability-brain-teasers', hasTask: true, taskType: 'math' },
  { id: 'math-2', title: 'Expected Value Problems', description: 'Calculate expected values for complex scenarios.', category: 'Mathematics', subcategory: 'Probability & Statistics', difficulty: 'Medium', duration: '30 min', keywords: ['expected value', 'probability', 'statistics'], slug: 'expected-value-problems', hasTask: true, taskType: 'math' },
  { id: 'math-3', title: 'Stochastic Processes', description: 'Brownian motion, Ito calculus, and martingales.', category: 'Mathematics', subcategory: 'Stochastic Calculus', difficulty: 'Hard', duration: '50 min', keywords: ['stochastic', 'Brownian motion', 'Ito', 'martingales'], slug: 'stochastic-processes', hasTask: true, taskType: 'math' },
  { id: 'math-4', title: 'Linear Algebra Applications', description: 'Matrix operations, eigenvalues, and PCA.', category: 'Mathematics', subcategory: 'Optimization & Linear Algebra', difficulty: 'Medium', duration: '40 min', keywords: ['linear algebra', 'matrices', 'eigenvalues', 'PCA'], slug: 'linear-algebra-applications', hasTask: true, taskType: 'math' },
  { id: 'math-5', title: 'Optimization Problems', description: 'Convex optimization and gradient descent.', category: 'Mathematics', subcategory: 'Optimization & Linear Algebra', difficulty: 'Hard', duration: '45 min', keywords: ['optimization', 'convex', 'gradient descent'], slug: 'optimization-problems', hasTask: true, taskType: 'math' },
  { id: 'math-6', title: 'Trading Logic Puzzles', description: 'Arbitrage, market efficiency, and trading scenarios.', category: 'Mathematics', subcategory: 'Quant Trading Logic', difficulty: 'Hard', duration: '40 min', keywords: ['trading', 'arbitrage', 'quant', 'logic'], slug: 'trading-logic-puzzles', hasTask: true, taskType: 'math' },
  { id: 'math-7', title: 'Quant Research Interview', description: 'Statistical modeling and research methodology.', category: 'Mathematics', subcategory: 'Quant Research Theory', difficulty: 'Hard', duration: '50 min', keywords: ['quant research', 'statistics', 'modeling', 'research'], slug: 'quant-research-interview', hasTask: true, taskType: 'math' },

  // ============ CONSULTING ============
  { id: 'cons-1', title: 'Profitability Case', description: 'Diagnose why a company is losing money and recommend solutions.', category: 'Consulting', subcategory: 'Case Interview', difficulty: 'Medium', duration: '40 min', keywords: ['profitability', 'case study', 'framework', 'consulting'], slug: 'profitability-case', hasTask: false },
  { id: 'cons-2', title: 'Market Entry Case', description: 'Evaluate whether a company should enter a new market.', category: 'Consulting', subcategory: 'Case Interview', difficulty: 'Medium', duration: '40 min', keywords: ['market entry', 'case study', 'strategy'], slug: 'market-entry-case', hasTask: false },
  { id: 'cons-3', title: 'Market Sizing: TAM/SAM/SOM', description: 'Estimate market sizes using top-down and bottom-up approaches.', category: 'Consulting', subcategory: 'Market Sizing', difficulty: 'Easy', duration: '25 min', keywords: ['market sizing', 'estimation', 'TAM', 'fermi'], slug: 'market-sizing', hasTask: true, taskType: 'math' },
  { id: 'cons-4', title: 'Operations Optimization', description: 'Improve operational efficiency and reduce costs.', category: 'Consulting', subcategory: 'Strategy & Operations', difficulty: 'Medium', duration: '35 min', keywords: ['operations', 'efficiency', 'cost reduction'], slug: 'operations-optimization', hasTask: false },
  { id: 'cons-5', title: 'Data-Driven Insights', description: 'Analyze data to drive business recommendations.', category: 'Consulting', subcategory: 'Data-Driven Analysis', difficulty: 'Medium', duration: '35 min', keywords: ['data analysis', 'insights', 'business intelligence'], slug: 'data-driven-insights', hasTask: true, taskType: 'math' },
  { id: 'cons-6', title: 'Behavioral Fit Interview', description: 'Tell your story and demonstrate consulting skills.', category: 'Consulting', subcategory: 'Behavioral / Fit', difficulty: 'Easy', duration: '30 min', keywords: ['behavioral', 'fit', 'story', 'leadership'], slug: 'behavioral-fit', hasTask: false },

  // ============ DESIGN ============
  { id: 'des-1', title: 'UX Design Challenge', description: 'Design a user experience for a given problem.', category: 'Design', subcategory: 'UX/UI Design', difficulty: 'Medium', duration: '45 min', keywords: ['UX', 'user experience', 'design thinking', 'wireframes'], slug: 'ux-design-challenge', hasTask: true, taskType: 'design' },
  { id: 'des-2', title: 'Product Design Critique', description: 'Analyze and improve an existing product.', category: 'Design', subcategory: 'Product Design', difficulty: 'Medium', duration: '35 min', keywords: ['product design', 'critique', 'improvement', 'user needs'], slug: 'product-design-critique', hasTask: true, taskType: 'design' },
  { id: 'des-3', title: 'Design System Discussion', description: 'Explain design systems and component libraries.', category: 'Design', subcategory: 'UX/UI Design', difficulty: 'Easy', duration: '25 min', keywords: ['design system', 'components', 'consistency'], slug: 'design-system-discussion', hasTask: false },
  { id: 'des-4', title: 'Creative Direction Case', description: 'Lead a creative vision for a brand or campaign.', category: 'Design', subcategory: 'Creative Direction', difficulty: 'Hard', duration: '45 min', keywords: ['creative direction', 'brand', 'vision', 'campaign'], slug: 'creative-direction-case', hasTask: true, taskType: 'design' },
  { id: 'des-5', title: 'Portfolio Review', description: 'Present and discuss your design portfolio.', category: 'Design', subcategory: 'Portfolio Critique', difficulty: 'Medium', duration: '40 min', keywords: ['portfolio', 'review', 'presentation', 'design work'], slug: 'portfolio-review', hasTask: true, taskType: 'design' },

  // ============ ENGINEERING (Non-CS) ============
  { id: 'eng-1', title: 'Mechanical Design Problem', description: 'Solve a mechanical engineering design challenge.', category: 'Engineering', subcategory: 'Mechanical Engineering', difficulty: 'Medium', duration: '40 min', keywords: ['mechanical', 'design', 'statics', 'dynamics'], slug: 'mechanical-design-problem', hasTask: true, taskType: 'math' },
  { id: 'eng-2', title: 'Circuit Analysis', description: 'Analyze and design electrical circuits.', category: 'Engineering', subcategory: 'Electrical Engineering', difficulty: 'Medium', duration: '40 min', keywords: ['circuits', 'electrical', 'Ohm', 'Kirchhoff'], slug: 'circuit-analysis', hasTask: true, taskType: 'math' },
  { id: 'eng-3', title: 'Structural Analysis', description: 'Calculate loads, stresses, and design structures.', category: 'Engineering', subcategory: 'Civil Engineering', difficulty: 'Medium', duration: '40 min', keywords: ['structural', 'civil', 'loads', 'stress'], slug: 'structural-analysis', hasTask: true, taskType: 'math' },
  { id: 'eng-4', title: 'Aerospace Fundamentals', description: 'Aerodynamics, propulsion, and flight mechanics.', category: 'Engineering', subcategory: 'Aerospace Engineering', difficulty: 'Hard', duration: '45 min', keywords: ['aerospace', 'aerodynamics', 'propulsion', 'flight'], slug: 'aerospace-fundamentals', hasTask: true, taskType: 'math' },
  { id: 'eng-5', title: 'Manufacturing Process Design', description: 'Optimize manufacturing and production processes.', category: 'Engineering', subcategory: 'Manufacturing / Industrial', difficulty: 'Medium', duration: '35 min', keywords: ['manufacturing', 'industrial', 'process', 'optimization'], slug: 'manufacturing-process', hasTask: false },

  // ============ HEALTHCARE ============
  { id: 'hc-1', title: 'MMI Scenario Stations', description: 'Multiple mini-interview ethical and situational scenarios.', category: 'Healthcare', subcategory: 'Medical School MMI', difficulty: 'Medium', duration: '30 min', keywords: ['MMI', 'medical school', 'ethics', 'scenarios'], slug: 'mmi-scenarios', hasTask: false },
  { id: 'hc-2', title: 'Clinical Reasoning Case', description: 'Diagnose a patient based on symptoms and history.', category: 'Healthcare', subcategory: 'Clinical Reasoning', difficulty: 'Hard', duration: '40 min', keywords: ['clinical', 'diagnosis', 'patient', 'reasoning'], slug: 'clinical-reasoning-case', hasTask: false },
  { id: 'hc-3', title: 'Medical Ethics Dilemma', description: 'Navigate complex ethical situations in healthcare.', category: 'Healthcare', subcategory: 'Ethical Scenarios', difficulty: 'Medium', duration: '30 min', keywords: ['ethics', 'medical', 'dilemma', 'decision'], slug: 'medical-ethics-dilemma', hasTask: false },
  { id: 'hc-4', title: 'Patient Communication', description: 'Practice delivering difficult news and building rapport.', category: 'Healthcare', subcategory: 'Patient Communication', difficulty: 'Easy', duration: '25 min', keywords: ['communication', 'patient', 'empathy', 'bedside manner'], slug: 'patient-communication', hasTask: false },
  { id: 'hc-5', title: 'Healthcare Systems Analysis', description: 'Understand healthcare policy and system dynamics.', category: 'Healthcare', subcategory: 'Healthcare Systems', difficulty: 'Medium', duration: '35 min', keywords: ['healthcare systems', 'policy', 'economics'], slug: 'healthcare-systems', hasTask: false },

  // ============ BUSINESS / PRODUCT ============
  { id: 'bus-1', title: 'Product Sense Interview', description: 'Design and improve products with user-centric thinking.', category: 'Business', subcategory: 'Product Management', difficulty: 'Medium', duration: '40 min', keywords: ['product sense', 'PM', 'user needs', 'design'], slug: 'product-sense', hasTask: true, taskType: 'whiteboard' },
  { id: 'bus-2', title: 'Metrics & Analytics', description: 'Define and analyze product and business metrics.', category: 'Business', subcategory: 'Business Analytics', difficulty: 'Medium', duration: '35 min', keywords: ['metrics', 'analytics', 'KPIs', 'data'], slug: 'metrics-analytics', hasTask: true, taskType: 'math' },
  { id: 'bus-3', title: 'Go-To-Market Strategy', description: 'Plan a product launch and market entry strategy.', category: 'Business', subcategory: 'Go-To-Market Strategy', difficulty: 'Medium', duration: '40 min', keywords: ['GTM', 'launch', 'marketing', 'strategy'], slug: 'gtm-strategy', hasTask: false },
  { id: 'bus-4', title: 'Marketing Strategy Case', description: 'Develop marketing campaigns and positioning.', category: 'Business', subcategory: 'Marketing Strategy', difficulty: 'Medium', duration: '35 min', keywords: ['marketing', 'strategy', 'positioning', 'campaigns'], slug: 'marketing-strategy-case', hasTask: false },
  { id: 'bus-5', title: 'Leadership Behavioral', description: 'Demonstrate leadership through STAR stories.', category: 'Business', subcategory: 'Leadership & Behavioral', difficulty: 'Easy', duration: '30 min', keywords: ['leadership', 'behavioral', 'STAR', 'management'], slug: 'leadership-behavioral', hasTask: false },

  // ============ LAW ============
  { id: 'law-1', title: 'Legal Case Analysis', description: 'Analyze a legal case and identify key issues.', category: 'Law', subcategory: 'Case Analysis', difficulty: 'Medium', duration: '40 min', keywords: ['legal', 'case analysis', 'law', 'issues'], slug: 'legal-case-analysis', hasTask: true, taskType: 'writing' },
  { id: 'law-2', title: 'Legal Reasoning Exercise', description: 'Apply legal principles to hypothetical scenarios.', category: 'Law', subcategory: 'Legal Reasoning', difficulty: 'Medium', duration: '35 min', keywords: ['legal reasoning', 'hypothetical', 'principles'], slug: 'legal-reasoning', hasTask: true, taskType: 'writing' },
  { id: 'law-3', title: 'Professional Ethics', description: 'Navigate ethical dilemmas in legal practice.', category: 'Law', subcategory: 'Ethics & Responsibility', difficulty: 'Easy', duration: '30 min', keywords: ['ethics', 'professional responsibility', 'legal ethics'], slug: 'professional-ethics', hasTask: false },
  { id: 'law-4', title: 'Client Interview Simulation', description: 'Practice client intake and communication skills.', category: 'Law', subcategory: 'Client Interaction', difficulty: 'Medium', duration: '30 min', keywords: ['client', 'interview', 'communication', 'legal'], slug: 'client-interview', hasTask: false },
  { id: 'law-5', title: 'Legal Writing Assessment', description: 'Draft legal arguments and memos.', category: 'Law', subcategory: 'Writing & Argumentation', difficulty: 'Hard', duration: '50 min', keywords: ['legal writing', 'memo', 'argumentation', 'drafting'], slug: 'legal-writing', hasTask: true, taskType: 'writing' },

  // ============ SCIENCE & RESEARCH ============
  { id: 'sci-1', title: 'Experimental Design', description: 'Design experiments with proper controls and variables.', category: 'Science', subcategory: 'Experimental Design', difficulty: 'Medium', duration: '35 min', keywords: ['experimental design', 'controls', 'variables', 'research'], slug: 'experimental-design', hasTask: true, taskType: 'whiteboard' },
  { id: 'sci-2', title: 'Data Interpretation', description: 'Analyze and interpret scientific data and graphs.', category: 'Science', subcategory: 'Data Interpretation', difficulty: 'Medium', duration: '30 min', keywords: ['data', 'interpretation', 'graphs', 'analysis'], slug: 'data-interpretation', hasTask: true, taskType: 'math' },
  { id: 'sci-3', title: 'Research Methods Review', description: 'Discuss research methodology and study design.', category: 'Science', subcategory: 'Research Methods', difficulty: 'Easy', duration: '25 min', keywords: ['research methods', 'methodology', 'study design'], slug: 'research-methods', hasTask: false },
  { id: 'sci-4', title: 'Lab Techniques Discussion', description: 'Explain laboratory procedures and best practices.', category: 'Science', subcategory: 'Lab Skills', difficulty: 'Medium', duration: '30 min', keywords: ['lab', 'techniques', 'procedures', 'safety'], slug: 'lab-techniques', hasTask: false },
  { id: 'sci-5', title: 'Scientific Reasoning Test', description: 'Apply scientific method to novel problems.', category: 'Science', subcategory: 'Scientific Reasoning', difficulty: 'Hard', duration: '40 min', keywords: ['scientific method', 'reasoning', 'hypothesis', 'testing'], slug: 'scientific-reasoning', hasTask: true, taskType: 'math' },
];

/**
 * Get interviews grouped by category
 */
export function getInterviewsByCategory(): Record<InterviewCategory, Interview[]> {
  const grouped: Record<InterviewCategory, Interview[]> = {} as Record<InterviewCategory, Interview[]>;
  
  for (const category of INTERVIEW_CATEGORIES) {
    grouped[category] = [];
  }

  for (const interview of MOCK_INTERVIEWS) {
    grouped[interview.category].push(interview);
  }

  return grouped;
}

/**
 * Get interviews by subcategory within a category
 */
export function getInterviewsBySubcategory(category: InterviewCategory): Record<string, Interview[]> {
  const subcategories = CATEGORY_SUBCATEGORIES[category];
  const grouped: Record<string, Interview[]> = {};
  
  for (const sub of subcategories) {
    grouped[sub] = [];
  }
  
  for (const interview of MOCK_INTERVIEWS) {
    if (interview.category === category) {
      grouped[interview.subcategory]?.push(interview);
    }
  }
  
  return grouped;
}

/**
 * Search interviews by query
 */
export function searchInterviews(query: string): Interview[] {
  if (!query.trim()) return MOCK_INTERVIEWS;
  
  const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
  
  return MOCK_INTERVIEWS.filter(interview => {
    const searchableText = [
      interview.title,
      interview.description,
      interview.category,
      interview.subcategory,
      ...interview.keywords,
    ].join(' ').toLowerCase();
    
    return searchTerms.every(term => searchableText.includes(term));
  });
}

/**
 * Get a single interview by slug
 */
export function getInterviewBySlug(slug: string): Interview | undefined {
  return MOCK_INTERVIEWS.find(interview => interview.slug === slug);
}

/**
 * Filter interviews by difficulty
 */
export function filterByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Interview[] {
  return MOCK_INTERVIEWS.filter(interview => interview.difficulty === difficulty);
}
