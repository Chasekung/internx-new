"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function B2BPricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Blobs - Preserved */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* BLURRED PRICING CONTENT - Ready for production when pilot ends */}
      <div className="relative z-10 blur-lg opacity-50 pointer-events-none select-none">
        {/* HEADER SECTION - YC Style, No Gradient Text */}
        <div className="max-w-7xl mx-auto pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-6">
              Pricing Plans
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Choose the plan that fits your organization. All plans include our core features.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white rounded-xl p-1 shadow-lg border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Save 15%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
        {/* BUSINESS PRICING CARDS - YC Quality Design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">For Businesses</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Starter Plan */}
            <PricingCard
              name="Starter"
              tagline="Perfect for small teams"
              monthlyPrice={39}
              yearlyPrice={399}
              billingCycle={billingCycle}
              features={[
                "3–5 active listings",
                "Basic AI matching",
                "Email support",
                "Branded company profile page",
                "Save intern profiles to talent pool"
              ]}
              cta="Start Starter Plan"
              popular={false}
            />

            {/* Professional Plan - Most Popular */}
            <PricingCard
              name="Professional"
              tagline="Best for growing companies"
              monthlyPrice={99}
              yearlyPrice={999}
              billingCycle={billingCycle}
              features={[
                "5–9 active internship listings",
                "Advanced AI matching & filters",
                "Branded company profile page",
                "Internship analytics dashboard",
                "Save intern profiles to talent pool",
                "Add up to 5 team members",
                "Built-in onboarding/legal docs",
                "Priority email support"
              ]}
              cta="Start Professional Plan"
              popular={true}
            />

            {/* Enterprise Plan */}
            <PricingCard
              name="Enterprise"
              tagline="Custom solutions for large organizations"
              monthlyPrice={null}
              yearlyPrice={null}
              billingCycle={billingCycle}
              features={[
                "Unlimited active listings",
                "Advanced AI matching & analytics",
                "Dedicated account manager",
                "Custom integrations",
                "Unlimited team members",
                "Priority support & onboarding",
                "Custom legal documentation",
                "Advanced security features"
              ]}
              cta="Contact Sales"
              popular={false}
              isCustom={true}
            />
          </div>

          <div className="text-center text-gray-500 text-sm mb-8">
            <p>💡 Discounts available for nonprofits and schools. Post-trial upgrades include a 10–15% first-year discount.</p>
          </div>
        </div>
        {/* NON-PROFIT PRICING - YC Quality Design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 mb-4">
              Special Pricing
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For Non-Profits</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We support mission-driven organizations with special pricing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Non-Profit Monthly */}
            <NonProfitPricingCard
              name="Monthly"
              monthlyPrice={14.99}
              yearlyPrice={null}
              billingCycle={billingCycle}
              features={[
                "Up to 3 active volunteer listings",
                "Basic AI matching",
                "Email support",
                "Branded organization profile page"
              ]}
              cta="Start Monthly Plan"
            />

            {/* Non-Profit Yearly */}
            <NonProfitPricingCard
              name="Yearly"
              monthlyPrice={null}
              yearlyPrice={99}
              billingCycle={billingCycle}
              features={[
                "Up to 5 active volunteer listings",
                "Basic AI matching",
                "Email support",
                "Branded organization profile page",
                "Save volunteer profiles to talent pool"
              ]}
              cta="Start Yearly Plan"
            />
          </div>
        </div>

        {/* FEATURE COMPARISON SECTION */}
        <FeatureComparison />

        {/* WHY COMPANIES CHOOSE STEP UP */}
        <WhyStepUp />

        {/* TESTIMONIAL PLACEHOLDER */}
        <TestimonialPlaceholder />
      </div>

      {/* PILOT TRIALS OVERLAY - Premium YC-Style Notice */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-auto max-w-2xl w-full"
        >
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200 p-8 sm:p-12">
            {/* Gradient accent border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 -z-10" />
            
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Pilot Trials in Progress
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We are currently in pilot trials. To learn more or get access, please book a demo with our team.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/company#book-demo"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Book a Demo
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/company"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>

            {/* Additional info */}
            <p className="text-center text-sm text-gray-500 mt-6">
              📧 Or email us at{' '}
              <a href="mailto:contact@joinstepup.com" className="text-blue-600 hover:text-blue-700 font-medium">
                stepuphs.67@gmail.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #a78bfa 1px, transparent 1px),
            linear-gradient(to bottom, #a78bfa 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
}

// PRICING CARD COMPONENT - YC Quality
interface PricingCardProps {
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  cta: string;
  popular: boolean;
  isCustom?: boolean;
}

function PricingCard({ name, tagline, monthlyPrice, yearlyPrice, billingCycle, features, cta, popular, isCustom }: PricingCardProps) {
  const price = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;
  const savings = monthlyPrice && yearlyPrice ? Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className={`relative rounded-3xl p-8 transition-all duration-300 ${
        popular
          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl scale-105 z-10'
          : 'bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl hover:shadow-2xl'
      }`}
    >
      {popular && (
        <div className="absolute -top-5 left-0 right-0 flex justify-center">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
            ⭐ Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className={`text-2xl font-bold mb-2 ${popular ? 'text-white' : 'text-gray-900'}`}>
          {name}
        </h3>
        <p className={`text-sm ${popular ? 'text-blue-100' : 'text-gray-600'}`}>
          {tagline}
        </p>
      </div>

      <div className="text-center mb-8">
        {isCustom ? (
          <div className={`text-4xl font-bold ${popular ? 'text-white' : 'text-gray-900'}`}>
            Custom
          </div>
        ) : (
          <>
            <div className={`text-5xl font-bold mb-2 ${popular ? 'text-white' : 'text-gray-900'}`}>
              ${price}
              <span className={`text-xl font-normal ${popular ? 'text-blue-100' : 'text-gray-500'}`}>
                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>
            {billingCycle === 'yearly' && savings > 0 && !isCustom && (
              <p className={`text-sm ${popular ? 'text-blue-100' : 'text-green-600'}`}>
                Save {savings}% vs monthly
              </p>
            )}
          </>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${popular ? 'text-blue-200' : 'text-green-500'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className={`text-sm ${popular ? 'text-blue-50' : 'text-gray-600'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={isCustom ? '/about/contact' : '/company-get-started'}
        className={`block w-full text-center px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
          popular
            ? 'bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
        }`}
      >
        {cta}
      </Link>
    </motion.div>
  );
}

// NON-PROFIT PRICING CARD
interface NonProfitPricingCardProps {
  name: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  cta: string;
}

function NonProfitPricingCard({ name, monthlyPrice, yearlyPrice, billingCycle, features, cta }: NonProfitPricingCardProps) {
  const isYearly = name === 'Yearly';
  const price = isYearly ? yearlyPrice : monthlyPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name} Plan</h3>
        <div className="text-4xl font-bold text-purple-600 mb-2">
          ${price}
          <span className="text-xl font-normal text-gray-500">
            /{isYearly ? 'yr' : 'mo'}
          </span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/company-get-started"
        className="block w-full text-center px-6 py-4 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        {cta}
      </Link>
    </motion.div>
  );
}

// FEATURE COMPARISON COMPONENT
function FeatureComparison() {
  const features = [
    {
      category: 'Core Features',
      items: [
        { name: 'Active Listings', starter: '3-5', professional: '5-9', enterprise: 'Unlimited' },
        { name: 'AI Matching', starter: 'Basic', professional: 'Advanced', enterprise: 'Advanced + Analytics' },
        { name: 'Company Profile', starter: true, professional: true, enterprise: true },
        { name: 'Talent Pool', starter: true, professional: true, enterprise: true },
      ]
    },
    {
      category: 'Team & Collaboration',
      items: [
        { name: 'Team Members', starter: '1', professional: 'Up to 5', enterprise: 'Unlimited' },
        { name: 'Analytics Dashboard', starter: false, professional: true, enterprise: true },
        { name: 'Dedicated Account Manager', starter: false, professional: false, enterprise: true },
      ]
    },
    {
      category: 'Support & Legal',
      items: [
        { name: 'Email Support', starter: 'Standard', professional: 'Priority', enterprise: 'Priority + Phone' },
        { name: 'Legal Documentation', starter: false, professional: true, enterprise: 'Custom' },
        { name: 'Custom Integrations', starter: false, professional: false, enterprise: true },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Compare Features</h2>
        <p className="text-lg text-gray-600">See what's included in each plan</p>
      </motion.div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Professional</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {features.map((category, catIndex) => (
                <React.Fragment key={catIndex}>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-3 text-sm font-bold text-gray-900">
                      {category.category}
                    </td>
                  </tr>
                  {category.items.map((item, itemIndex) => (
                    <tr key={itemIndex} className="border-t border-gray-100 hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{item.name}</td>
                      <td className="px-6 py-4 text-center text-sm">
                        <FeatureCell value={item.starter} />
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <FeatureCell value={item.professional} />
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <FeatureCell value={item.enterprise} />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FeatureCell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  }
  return <span className="font-medium text-gray-700">{value}</span>;
}

// WHY STEP UP COMPONENT
function WhyStepUp() {
  const benefits = [
    {
      icon: '🎯',
      title: 'Pre-Vetted Talent',
      description: 'Every student goes through our AI-powered screening process, ensuring quality candidates for your team.'
    },
    {
      icon: '⚡',
      title: '90% Less Supervision',
      description: 'Our AI coach guides interns through tasks, dramatically reducing your team\'s management burden.'
    },
    {
      icon: '💡',
      title: 'Early Investment',
      description: 'Build relationships with future industry leaders and create your talent pipeline early.'
    },
    {
      icon: '📊',
      title: 'Data-Driven Insights',
      description: 'Track performance, engagement, and ROI with our comprehensive analytics dashboard.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100 mb-4">
          Why Step Up
        </span>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Why Companies Choose Step Up
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join innovative companies transforming their internship programs
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
              <div className="text-5xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// TESTIMONIAL PLACEHOLDER COMPONENT
function TestimonialPlaceholder() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Trusted by Leading Companies
        </h2>
        <p className="text-lg text-gray-600">
          See what our customers are saying
        </p>
      </motion.div>

      <div className="relative min-h-[300px] rounded-3xl overflow-hidden border-2 border-gray-200 bg-white/50">
        {/* Blurred placeholder testimonials */}
        <div className="absolute inset-0 blur-sm opacity-30 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                  <div>
                    <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 rounded" />
                  <div className="h-3 w-4/6 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center px-6 py-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-2xl font-bold text-blue-600">Coming Soon</span>
            </div>
            <p className="text-gray-600 max-w-md">
              Customer testimonials and case studies will be featured here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}