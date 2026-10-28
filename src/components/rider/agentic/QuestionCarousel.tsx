'use client';

import React, { useState } from 'react';
import { Send, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

export interface ClarificationOption {
  label: string;
  value: string;
  badge?: string;
}

export interface ClarificationQuestion {
  id: string;
  field: 'vehicleType' | 'dropoff' | 'pickup' | string;
  question: string;
  options?: ClarificationOption[];
  placeholder?: string;
}

export interface AnsweredQuestion {
  id: string;
  field: string;
  question: string;
  answer: string;
}

export interface QuestionCarouselProps {
  questions: ClarificationQuestion[];
  onAnswer: (answered: AnsweredQuestion) => void;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
}

export function QuestionCarousel({
  questions,
  onAnswer,
  currentIndex,
  onIndexChange,
  className = '',
}: QuestionCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');

  if (!questions || questions.length === 0) {
    return null;
  }

  const activeIndex = currentIndex !== undefined ? currentIndex : internalIndex;
  const currentQuestion = questions[activeIndex] || questions[0];
  const totalQuestions = questions.length;

  const handleIndexChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < totalQuestions) {
      if (onIndexChange) {
        onIndexChange(newIndex);
      } else {
        setInternalIndex(newIndex);
      }
    }
  };

  const handleSelectOption = (option: ClarificationOption) => {
    onAnswer({
      id: currentQuestion.id,
      field: currentQuestion.field,
      question: currentQuestion.question,
      answer: option.value || option.label,
    });
    setCustomInput('');
  };

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    onAnswer({
      id: currentQuestion.id,
      field: currentQuestion.field,
      question: currentQuestion.question,
      answer: trimmed,
    });
    setCustomInput('');
  };

  return (
    <div
      className={`w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 text-white shadow-xl backdrop-blur-md transition-all ${className}`}
      data-testid="question-carousel"
    >
      {/* Top Header: Step Counter & Indicators */}
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-neutral-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-neutral-300">
            Question {activeIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Indicator dots */}
        <div className="flex items-center gap-1.5" data-testid="carousel-indicators">
          {questions.map((q, idx) => (
            <button
              key={q.id || idx}
              type="button"
              onClick={() => handleIndexChange(idx)}
              aria-label={`Go to question ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-6 bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'w-1.5 bg-neutral-700 hover:bg-neutral-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Prompt */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-neutral-100 leading-snug">
          {currentQuestion.question}
        </h3>
      </div>

      {/* Quick Option Chips / Buttons */}
      {currentQuestion.options && currentQuestion.options.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={`${option.value}-${idx}`}
              type="button"
              onClick={() => handleSelectOption(option)}
              className="group relative flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-750 active:bg-neutral-700 border border-neutral-700/80 hover:border-emerald-500/50 rounded-xl text-xs font-medium text-neutral-200 hover:text-white transition-all duration-150 shadow-sm"
            >
              <span>{option.label}</span>
              {option.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  {option.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Custom Text Input with Submit */}
      <form onSubmit={handleCustomSubmit} className="relative flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={currentQuestion.placeholder || 'Type custom response...'}
          className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          aria-label="Submit answer"
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Navigation footer if multiple questions */}
      {totalQuestions > 1 && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-400">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => handleIndexChange(activeIndex - 1)}
            className="flex items-center gap-1 hover:text-neutral-200 disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>Previous</span>
          </button>
          <button
            type="button"
            disabled={activeIndex === totalQuestions - 1}
            onClick={() => handleIndexChange(activeIndex + 1)}
            className="flex items-center gap-1 hover:text-neutral-200 disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export default QuestionCarousel;
