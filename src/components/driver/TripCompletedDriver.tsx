'use client';

import React, { useState } from 'react';
import { ActiveRide } from '../../types';
import { formatBDT } from './driverUtils';
import { CheckCircle2, Star, CircleDollarSign, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export interface TripCompletedDriverProps {
  ride: ActiveRide;
  onSubmitRating?: (rating: number, feedback?: string) => void;
  onBackOnline: () => void;
  isSubmittingRating?: boolean;
}

const FEEDBACK_TAGS = ['Polite passenger', 'On time at pickup', 'Clean & respectful', 'Smooth trip'];

export function TripCompletedDriver({
  ride,
  onSubmitRating,
  onBackOnline,
  isSubmittingRating = false,
}: TripCompletedDriverProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const finalFare = ride.fareFinal ?? ride.fareEstimate;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFinish = () => {
    if (onSubmitRating && !ratingSubmitted && rating > 0) {
      onSubmitRating(rating, selectedTags.join(', '));
      setRatingSubmitted(true);
    }
    onBackOnline();
  };

  return (
    <div className="w-full bg-neutral-950/95 border border-neutral-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-5 text-white">
      {/* Success Badge & Title */}
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-2">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>
        <div className="text-xl font-black text-white">Trip Completed!</div>
        <div className="text-xs text-neutral-400 mt-0.5">
          Great job! Cash collected from passenger.
        </div>
      </div>

      {/* Final Fare Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">
          Total Cash To Collect
        </span>
        <div className="text-3xl font-black text-white my-1">
          {formatBDT(finalFare)}
        </div>
        <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-emerald-950/80 border border-emerald-800/80 rounded-full text-xs font-semibold text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Fare Finalized ({ride.distanceKm} km)</span>
        </div>
      </div>

      {/* Locations Summary */}
      <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-xl p-3 flex flex-col gap-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-neutral-400 truncate">From: {ride.pickupAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-300">
          <div className="w-2 h-2 rounded-full bg-neutral-500 shrink-0" />
          <span className="text-neutral-400 truncate">To: {ride.dropoffAddress}</span>
        </div>
      </div>

      {/* Rate Passenger Card */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 flex flex-col items-center text-center gap-3">
        <div className="text-xs uppercase font-bold text-neutral-300 tracking-wider">
          Rate Passenger
        </div>

        {/* 5 Stars Rating Bar */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = (hoverRating ?? rating) >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => setRating(star)}
                className="p-1 text-2xl transition-transform active:scale-125 focus:outline-none cursor-pointer"
              >
                <Star
                  className={`w-7 h-7 ${
                    isFilled
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-neutral-700 hover:text-neutral-500'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Compliment Chips */}
        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
          {FEEDBACK_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-semibold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Back Online CTA Button */}
      <button
        type="button"
        disabled={isSubmittingRating}
        onClick={handleFinish}
        className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-base rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer border border-emerald-500"
      >
        <span>BACK ONLINE</span>
        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
}

export default TripCompletedDriver;
