/**
 * Domain-specific interview questions organized by category, subcategory, and difficulty
 */

export interface QuestionSet {
  easy: string[];
  medium: string[];
  hard: string[];
}

export type QuestionBank = Record<string, Record<string, QuestionSet>>;

export const INTERVIEW_QUESTIONS: QuestionBank = {
  'Computer Science': {
    'Coding / Algorithms': {
      easy: [
        "What is the difference between an array and a linked list? When would you use each?",
        "Explain how a hash table works. What is a collision and how do you handle it?",
        "What is the time complexity of searching in a sorted array vs unsorted array?",
        "How would you reverse a string without using built-in functions?",
        "What is Big O notation and why is it important?",
      ],
      medium: [
        "How would you detect a cycle in a linked list? Walk me through your approach.",
        "Explain how you would implement a LRU cache. What data structures would you use?",
        "Given an array of integers, how would you find two numbers that sum to a target?",
        "How does quicksort work? What's its average and worst-case complexity?",
        "Explain the difference between BFS and DFS. When would you use each?",
      ],
      hard: [
        "How would you design an algorithm to find the longest increasing subsequence?",
        "Explain how you would implement a trie and its applications.",
        "How would you solve the N-queens problem? What's your approach?",
        "Describe how Dijkstra's algorithm works. How would you handle negative edges?",
        "How would you optimize a recursive solution using dynamic programming?",
      ],
    },
    'System Design': {
      easy: [
        "What is horizontal vs vertical scaling? Give examples of when to use each.",
        "Explain the difference between SQL and NoSQL databases.",
        "What is a load balancer and why is it important?",
        "What is caching and how does it improve performance?",
      ],
      medium: [
        "How would you design a URL shortening service? What are the key components?",
        "Explain how you would handle database sharding. What are the tradeoffs?",
        "How would you design a rate limiting system?",
        "What is eventual consistency vs strong consistency?",
      ],
      hard: [
        "How would you design a distributed messaging queue like Kafka?",
        "Design a real-time collaborative document editing system.",
        "How would you architect a global content delivery network?",
        "Design a system that can handle 1 million requests per second.",
      ],
    },
    'Machine Learning Engineering': {
      easy: [
        "What is the difference between supervised and unsupervised learning?",
        "Explain what overfitting is and how to prevent it.",
        "What is the bias-variance tradeoff?",
      ],
      medium: [
        "How does backpropagation work in neural networks?",
        "Explain different regularization techniques and when to use them.",
        "How would you handle imbalanced datasets?",
        "What is the difference between batch, mini-batch, and stochastic gradient descent?",
      ],
      hard: [
        "How would you design a recommendation system at scale?",
        "Explain transformer architecture and attention mechanisms.",
        "How would you deploy and monitor ML models in production?",
        "Design an A/B testing framework for ML models.",
      ],
    },
  },

  'Finance': {
    'Investment Banking Technical': {
      easy: [
        "Walk me through the three financial statements and how they connect.",
        "What is EBITDA and why is it commonly used?",
        "Explain the difference between enterprise value and equity value.",
      ],
      medium: [
        "Walk me through a DCF valuation. What are the key assumptions?",
        "How would you value a company with negative earnings?",
        "Explain how an M&A deal works from start to finish.",
        "What are the main methods of valuation and when would you use each?",
      ],
      hard: [
        "Walk me through an LBO model. What drives returns?",
        "How would you analyze an accretion/dilution in a merger?",
        "A company's stock price drops 20% after earnings. Walk me through the analysis.",
        "How do you calculate WACC and what are the key considerations?",
      ],
    },
    'Markets & Trading': {
      easy: [
        "What is a stock? What is a bond? Key differences?",
        "Explain how supply and demand affect stock prices.",
        "What is the difference between a market order and limit order?",
      ],
      medium: [
        "How would you price an option? Explain the key factors.",
        "What are the Greeks and why do traders care about them?",
        "Explain how a market maker profits.",
        "What is the yield curve and what does its shape indicate?",
      ],
      hard: [
        "How would you construct a delta-neutral portfolio?",
        "Explain volatility smile and its implications.",
        "How would you arbitrage a mispriced option?",
        "Design a trading strategy based on mean reversion.",
      ],
    },
    'Quantitative Finance': {
      easy: [
        "What is expected value and how do you calculate it?",
        "Explain the normal distribution and its properties.",
      ],
      medium: [
        "Derive the Black-Scholes formula intuitively.",
        "What is Value at Risk (VaR) and how is it calculated?",
        "Explain the difference between correlation and covariance.",
      ],
      hard: [
        "Explain Ito's lemma and its application in finance.",
        "How would you model credit risk?",
        "Derive the optimal hedge ratio for a portfolio.",
      ],
    },
  },

  'Mathematics': {
    'Probability & Statistics': {
      easy: [
        "You flip a fair coin 3 times. What's the probability of getting at least 2 heads?",
        "Explain the difference between probability and odds.",
        "What is the expected value of rolling a fair die?",
      ],
      medium: [
        "You have 2 children. At least one is a boy born on Tuesday. What's the probability both are boys?",
        "Explain Bayes' theorem and give an example.",
        "100 people are at a party. What's the probability at least 2 share a birthday?",
        "You pick a random chord in a circle. What's the probability it's longer than the radius?",
      ],
      hard: [
        "Derive the expectation of the maximum of n uniform random variables.",
        "Explain the Monty Hall problem and prove the solution.",
        "You have a biased coin (unknown bias). How do you generate fair coin flips?",
        "What is the expected number of coin flips to get n consecutive heads?",
      ],
    },
    'Stochastic Calculus': {
      medium: [
        "What is a Brownian motion and what are its key properties?",
        "Explain the difference between a martingale and a random walk.",
      ],
      hard: [
        "State and explain Ito's lemma.",
        "Derive the Black-Scholes PDE using risk-neutral pricing.",
        "What is the Girsanov theorem and when is it used?",
        "Explain how to simulate stochastic differential equations.",
      ],
      easy: [
        "What is a stochastic process? Give some examples.",
        "What is the difference between discrete and continuous time processes?",
      ],
    },
    'Quant Trading Logic': {
      easy: [
        "What is arbitrage? Give a simple example.",
        "Explain the concept of market efficiency.",
      ],
      medium: [
        "You see a stock trading at $100 in NY and $102 in London. How do you profit?",
        "A stock has 60% chance of going up 10% and 40% chance of going down 10%. Would you invest?",
        "How would you construct a pairs trading strategy?",
      ],
      hard: [
        "Design an optimal execution algorithm for a large order.",
        "How would you detect and exploit a momentum signal?",
        "Explain Kelly criterion and its practical limitations.",
        "You have 3 correlated assets. How do you find the minimum variance portfolio?",
      ],
    },
  },

  'Consulting': {
    'Case Interview': {
      easy: [
        "A coffee shop's profits have declined 20%. How would you approach this problem?",
        "What framework would you use to analyze a company's profitability?",
        "Explain the 80/20 rule and how it applies to business analysis.",
      ],
      medium: [
        "A major airline wants to enter the Asian market. How would you evaluate this decision?",
        "A retail chain is considering closing stores. Walk me through your analysis.",
        "A pharmaceutical company's drug sales are declining. What could be causing this?",
        "How would you help a company decide whether to make or buy a component?",
      ],
      hard: [
        "A PE firm is evaluating a hospital chain acquisition. What would you analyze?",
        "Design a pricing strategy for a new SaaS product entering a competitive market.",
        "A major bank wants to transform digitally. What are the key considerations?",
        "How would you help a company respond to a new disruptive competitor?",
      ],
    },
    'Market Sizing': {
      easy: [
        "Estimate the number of gas stations in the US.",
        "How many smartphones are sold in the US each year?",
        "Estimate the market size for bottled water in your city.",
      ],
      medium: [
        "Estimate the revenue of the US wedding industry.",
        "How many golf balls fit in a school bus?",
        "Estimate the total addressable market for electric scooters in a major city.",
        "How would you size the market for online tutoring?",
      ],
      hard: [
        "Estimate the number of piano tuners in Chicago.",
        "Size the market for autonomous vehicle software in 2030.",
        "Estimate the revenue potential for a new pharmaceutical drug.",
      ],
    },
    'Data-Driven Analysis': {
      easy: [
        "You see conversion rate dropped. What data would you look at first?",
        "How would you segment customers for analysis?",
      ],
      medium: [
        "Revenue is up but profit is down. Walk me through your analysis.",
        "How would you measure the success of a new feature launch?",
        "Design an A/B test for a website redesign.",
      ],
      hard: [
        "How would you attribute revenue across marketing channels?",
        "Design a customer lifetime value model.",
        "How would you identify cross-sell opportunities using data?",
      ],
    },
  },

  'Design': {
    'UX/UI Design': {
      easy: [
        "What is the difference between UX and UI design?",
        "Walk me through your design process.",
        "What makes a good user interface?",
      ],
      medium: [
        "Design an app for seniors to order groceries. Walk me through your approach.",
        "How would you improve the checkout experience of an e-commerce site?",
        "Explain how you would conduct user research for a new product.",
        "How do you balance user needs with business goals?",
      ],
      hard: [
        "Design a dashboard for air traffic controllers. What are the key considerations?",
        "How would you redesign a complex enterprise software interface?",
        "Design an accessible interface for users with visual impairments.",
      ],
    },
    'Product Design': {
      easy: [
        "What is your favorite product and why?",
        "How do you define a good product?",
      ],
      medium: [
        "Pick a product you use daily. How would you improve it?",
        "How do you prioritize features in a product roadmap?",
        "Explain how you would validate a product idea.",
      ],
      hard: [
        "Design a new feature for Spotify to increase user engagement.",
        "How would you design a product for a two-sided marketplace?",
        "Design a solution for the problem of food waste.",
      ],
    },
  },

  'Engineering': {
    'Mechanical Engineering': {
      easy: [
        "Explain Newton's three laws of motion.",
        "What is the difference between stress and strain?",
        "How does a simple gear train work?",
      ],
      medium: [
        "Calculate the stress in a beam under a given load.",
        "How would you design a mechanism to convert rotary to linear motion?",
        "Explain the principles of heat transfer and give examples.",
        "How would you analyze the fatigue life of a component?",
      ],
      hard: [
        "Design a suspension system for a vehicle. What are the tradeoffs?",
        "How would you optimize a structure for minimum weight and maximum strength?",
        "Analyze the vibration modes of a cantilevered beam.",
      ],
    },
    'Electrical Engineering': {
      easy: [
        "Explain Ohm's law and give an example.",
        "What is the difference between AC and DC current?",
        "How does a capacitor store energy?",
      ],
      medium: [
        "Analyze this circuit and find the current through each resistor.",
        "Explain how a transistor works as a switch.",
        "Design a simple low-pass filter. What are the cutoff frequency considerations?",
      ],
      hard: [
        "Design a power supply for a sensitive analog circuit.",
        "How would you minimize electromagnetic interference in a circuit?",
        "Analyze the stability of a control system using Bode plots.",
      ],
    },
  },

  'Healthcare': {
    'Medical School MMI': {
      easy: [
        "Why do you want to become a doctor?",
        "What qualities make a good physician?",
        "Tell me about a time you showed empathy.",
      ],
      medium: [
        "A patient wants a treatment you believe is unnecessary. How do you handle this?",
        "You notice a colleague may be impaired. What do you do?",
        "How would you handle a patient who refuses a life-saving treatment?",
      ],
      hard: [
        "You have one organ available and two patients who need it. How do you decide?",
        "A parent refuses vaccination for their child. Walk me through this ethical dilemma.",
        "How would you handle end-of-life decisions with a family in conflict?",
      ],
    },
    'Clinical Reasoning': {
      easy: [
        "A patient presents with a headache. What questions would you ask?",
        "What is your approach to taking a patient history?",
      ],
      medium: [
        "A 45-year-old presents with chest pain. Walk me through your differential diagnosis.",
        "How would you evaluate a patient with shortness of breath?",
        "What tests would you order for a patient with abdominal pain?",
      ],
      hard: [
        "A patient has conflicting symptoms. How do you approach the diagnosis?",
        "How would you manage a patient with multiple comorbidities?",
        "Walk me through a complex case involving drug interactions.",
      ],
    },
  },

  'Business': {
    'Product Management': {
      easy: [
        "What is the role of a product manager?",
        "How do you prioritize features?",
        "What is a good product metric?",
      ],
      medium: [
        "How would you improve Instagram Stories?",
        "You have limited engineering resources. How do you decide what to build?",
        "How would you measure the success of a new feature?",
        "Walk me through launching a product from idea to market.",
      ],
      hard: [
        "Design a new product for Amazon to enter the healthcare space.",
        "How would you turn around a failing product?",
        "Design a product strategy for a two-sided marketplace.",
      ],
    },
    'Go-To-Market Strategy': {
      easy: [
        "What is a go-to-market strategy?",
        "What are the key components of a product launch?",
      ],
      medium: [
        "How would you launch a new SaaS product in a competitive market?",
        "Design a pricing strategy for a freemium product.",
        "How would you identify your target market?",
      ],
      hard: [
        "How would you enter a market dominated by an established competitor?",
        "Design a GTM strategy for a B2B enterprise product.",
      ],
    },
  },

  'Law': {
    'Case Analysis': {
      easy: [
        "How would you approach reading a new case for the first time?",
        "What are the key components of a legal brief?",
      ],
      medium: [
        "Analyze this contract clause. What are the potential issues?",
        "How would you advise a client facing a breach of contract claim?",
        "Explain the doctrine of precedent.",
      ],
      hard: [
        "Analyze the constitutional implications of this proposed legislation.",
        "How would you argue both sides of this complex civil rights case?",
        "Draft a legal memo analyzing the merits of this case.",
      ],
    },
    'Legal Reasoning': {
      easy: [
        "What is the difference between civil and criminal law?",
        "Explain what 'burden of proof' means.",
      ],
      medium: [
        "Apply the reasonable person standard to this scenario.",
        "How would you analyze whether a duty of care exists?",
        "Explain the elements of negligence.",
      ],
      hard: [
        "How would you approach a case of first impression?",
        "Analyze the competing policy considerations in this case.",
      ],
    },
  },

  'Science': {
    'Experimental Design': {
      easy: [
        "What is a control group and why is it important?",
        "Explain the difference between independent and dependent variables.",
      ],
      medium: [
        "Design an experiment to test whether a new drug is effective.",
        "How would you control for confounding variables?",
        "What is the difference between correlation and causation?",
      ],
      hard: [
        "Design a double-blind randomized controlled trial.",
        "How would you analyze the results of a multi-factor experiment?",
        "Explain how you would handle ethical considerations in human subjects research.",
      ],
    },
    'Data Interpretation': {
      easy: [
        "What does a p-value tell you?",
        "How do you read an error bar on a graph?",
      ],
      medium: [
        "Interpret these experimental results. What conclusions can you draw?",
        "How would you determine if this result is statistically significant?",
        "What are the limitations of this study based on the data?",
      ],
      hard: [
        "Analyze this complex dataset and identify trends.",
        "How would you detect and handle outliers in your data?",
        "Design an analysis plan for a longitudinal study.",
      ],
    },
  },
};

/**
 * Get questions for a specific interview type and difficulty
 */
export function getQuestionsForInterview(
  category: string,
  subcategory: string,
  difficulty: 'easy' | 'medium' | 'hard'
): string[] {
  const categoryQuestions = INTERVIEW_QUESTIONS[category];
  if (!categoryQuestions) return [];
  
  const subcategoryQuestions = categoryQuestions[subcategory];
  if (!subcategoryQuestions) return [];
  
  return subcategoryQuestions[difficulty] || [];
}

/**
 * Get a random question for an interview
 */
export function getRandomQuestion(
  category: string,
  subcategory: string,
  difficulty: 'easy' | 'medium' | 'hard',
  excludeQuestions: string[] = []
): string | null {
  const questions = getQuestionsForInterview(category, subcategory, difficulty);
  const available = questions.filter(q => !excludeQuestions.includes(q));
  
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

