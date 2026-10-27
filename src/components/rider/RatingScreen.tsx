'use client';

import React, { useState } from 'react';

export interface RatingScreenProps {
  driverName: string;
  driverVehicle?: string;
  onSubmit: (rating: number, feedback: string, tags: string[]) => void;
  className?: string;
}

const FEEDBACK_TAGS = [
  'Safe Driver',
  'Polite',
  'Clean Vehicle',
  'On Time',
  'Great Music',
  'Smooth Route',
];

export function RatingScreen({
  driverName,
  driverVehicle = 'Dhaka Ride',
  onSubmit,
  className = '',
}: RatingScreenProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Safe Driver']);
  const [comment, setComment] = useState<string>('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, comment, selectedTags);
  };

  const currentDisplayRating = hoverRating || rating;

  return (
    <div
      className={`w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 text-white shadow-2xl ${className}`}
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="text-center pb-4 mb-4 border-b border-neutral-800">
          <div className="w-14 h-14 rounded-full bg-neutral-900 border-2 border-emerald-500 mx-auto mb-2 flex items-center justify-center text-xl font-bold text-neutral-100">
            {driverName.charAt(0)}
          </div>
          <h3 className="text-lg font-bold text-neutral-100">
            Rate your trip with {driverName}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">{driverVehicle}</p>
        </div>

        {/* 1-5 Star Selectors */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-3xl focus:outline-none transition-transform hover:scale-110"
                aria-label={`${star} star`}
              >
                <span
                  className={
                    star <= currentDisplayRating
                      ? 'text-yellow-400'
                      : 'text-neutral-700'
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <div className="text-xs text-neutral-400 font-medium mt-1">
            {currentDisplayRating === 5 && 'Outstanding!'}
            {currentDisplayRating === 4 && 'Very Good'}
            {currentDisplayRating === 3 && 'Average'}
            {currentDisplayRating === 2 && 'Needs Improvement'}
            {currentDisplayRating === 1 && 'Poor Experience'}
          </div>
        </div>

        {/* Feedback Tags */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-neutral-400 mb-2">
            What went well?
          </label>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tag} {isSelected ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment Box */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Additional Comments (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about your trip in Dhaka..."
            rows={2}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Submit Rating Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg"
        >
          Submit Rating
        </button>
      </form>
    </div>
  );
}

export default RatingScreen;
