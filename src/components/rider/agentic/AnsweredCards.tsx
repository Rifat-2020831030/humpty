'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { AnsweredQuestion } from './QuestionCarousel';

export interface AnsweredCardsProps {
  answeredQuestions: AnsweredQuestion[];
  className?: string;
}

export function AnsweredCards({
  answeredQuestions,
  className = '',
}: AnsweredCardsProps) {
  if (!answeredQuestions || answeredQuestions.length === 0) {
    return null;
  }

  return (
    <div className={`w-full space-y-2.5 ${className}`} data-testid="answered-cards-container">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Answered Clarifications ({answeredQuestions.length})
        </span>
      </div>

      <div className="space-y-2">
        {answeredQuestions.map((item) => (
          <div
            key={item.id}
            data-testid={`answered-card-${item.id}`}
            className="flex items-center justify-between gap-3 p-3 bg-neutral-900/70 border border-emerald-500/30 rounded-xl backdrop-blur-sm shadow-sm transition-all"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-neutral-400 truncate">
                {item.question}
              </p>
              <p className="text-xs font-bold text-white mt-0.5 truncate">
                {item.answer}
              </p>
            </div>

            <div
              data-testid="answered-check-badge"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold shrink-0"
            >
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Resolved</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnsweredCards;
