"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ACCORDION = [
  {
    title: "Customer Care",
    subtitle: "We put yourself in others' shoes",
    content:
      "At Step Up, caring for our customers means understanding their hopes, challenges, and dreams. We listen closely to students, organizations, and partners so we can build tools that truly serve them. Whether responding to a question or improving a feature, we put their success at the center of every decision. We don't just support customers — we empower them to grow, thrive, and unlock opportunities.",
  },
  {
    title: "Team Empathy",
    subtitle: "It's not about 'I' — it's about 'we'",
    content:
      "At Step Up, empathy begins with our own team. We see each other as people first and collaborators second. Whether supporting a teammate on a cross-functional project or celebrating their big wins, we treat each success as shared success. Just like we champion opportunities for students, we champion each other — going the extra mile personally and professionally to build an environment where everyone can grow.",
  },
  {
    title: "We Step Up",
    subtitle: "We rise to every challenge",
    content:
      "At Step Up, we rise to every challenge — big or small. We believe that meaningful change requires courage, resilience, and action. When obstacles appear, we lean in, adapt, and find solutions together. By stepping up for our students, our partners, and each other, we turn challenges into opportunities and ideas into impact.",
  },
];

export default function ValuesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full divide-y divide-gray-200">
      {ACCORDION.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={item.title} className="bg-white">
            <button
              className={`w-full flex flex-col items-start px-8 py-7 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 group`}
              onClick={() => handleToggle(idx)}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${idx}`}
            >
              <div className="flex items-center w-full">
                <span
                  className={`text-xl font-bold mr-4 transition-all duration-300 ${isOpen ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-gray-900'}`}
                  style={{ minWidth: 0 }}
                >
                  {item.title}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`ml-auto text-2xl text-gray-400 group-hover:text-blue-600`}
                >
                  ▶
                </motion.span>
              </div>
              <span className={`mt-2 text-base ${isOpen ? 'text-blue-700 font-semibold' : 'text-gray-500'} transition-colors duration-200`}>{item.subtitle}</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  id={`accordion-panel-${idx}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="px-8 pb-8 pt-2 text-gray-700 text-lg overflow-hidden"
                >
                  {item.content}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
} 