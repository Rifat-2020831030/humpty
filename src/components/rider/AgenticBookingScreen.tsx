'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Bot,
  CheckCircle2,
  Loader2,
  Circle,
  MapPin,
  Car,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import {
  QuestionCarousel,
  ClarificationQuestion,
  AnsweredQuestion,
} from './agentic/QuestionCarousel';
import { AnsweredCards } from './agentic/AnsweredCards';
import { MapLocationOverlay } from './agentic/MapLocationOverlay';

export interface TimelineStep {
  id: 'parse' | 'geo' | 'clarify' | 'pricing' | 'confirm' | string;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  detail?: string;
}

export interface ExtractedBookingDetails {
  pickup?: { name: string; lat: number; lng: number };
  dropoff?: { name: string; lat: number; lng: number };
  vehicleType?: 'BIKE' | 'CNG' | 'CAR' | string;
  estimatedDistanceKm?: number;
  estimatedFare?: number;
}

export interface AgenticBookingScreenProps {
  prompt: string;
  status: 'NEED_CLARIFICATION' | 'READY_FOR_CONFIRMATION' | 'UNAVAILABLE' | 'PROCESSING';
  steps: TimelineStep[];
  extracted?: ExtractedBookingDetails;
  questions?: ClarificationQuestion[];
  answeredQuestions?: AnsweredQuestion[];
  errorMessage?: string;
  onAnswerQuestion: (answer: AnsweredQuestion) => void;
  onConfirmBooking: (details?: ExtractedBookingDetails) => void;
  onBack: () => void;
  onSwitchToManual: () => void;
  onSeeOnMap?: (location: { lat: number; lng: number; name: string; type?: 'pickup' | 'dropoff' }) => void;
  onUpdateLocation?: (location: { type: 'pickup' | 'dropoff'; lat: number; lng: number; name: string }) => void;
  isLoading?: boolean;
}

const DEFAULT_STEPS: TimelineStep[] = [
  { id: 'parse', title: 'Parse Intent', status: 'PENDING' },
  { id: 'geo', title: 'Resolve Coordinates', status: 'PENDING' },
  { id: 'clarify', title: 'Clarify Details', status: 'PENDING' },
  { id: 'pricing', title: 'Calculate Fare & Route', status: 'PENDING' },
  { id: 'confirm', title: 'Final Confirmation', status: 'PENDING' },
];

export function AgenticBookingScreen({
  prompt,
  status,
  steps = DEFAULT_STEPS,
  extracted,
  questions = [],
  answeredQuestions = [],
  errorMessage,
  onAnswerQuestion,
  onConfirmBooking,
  onBack,
  onSwitchToManual,
  onSeeOnMap,
  onUpdateLocation,
  isLoading = false,
}: AgenticBookingScreenProps) {
  const displaySteps = steps && steps.length > 0 ? steps : DEFAULT_STEPS;
  const isReady = status === 'READY_FOR_CONFIRMATION';
  const isUnavailable = status === 'UNAVAILABLE';
  const hasUnfulfilledQuestions = questions && questions.length > 0 && !isReady && !isUnavailable;

  const confirmationCardRef = useRef<HTMLDivElement | null>(null);

  // Overlay & Editable Location State
  const [activeMapLocation, setActiveMapLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
    type?: 'pickup' | 'dropoff';
  } | null>(null);

  const [localExtracted, setLocalExtracted] = useState<ExtractedBookingDetails | undefined>(extracted);

  useEffect(() => {
    setLocalExtracted(extracted);
  }, [extracted]);

  const currentExtracted = localExtracted || extracted;

  const handleOpenMapOverlay = (loc: { lat: number; lng: number; name: string; type?: 'pickup' | 'dropoff' }) => {
    setActiveMapLocation(loc);
    if (onSeeOnMap) {
      onSeeOnMap(loc);
    }
  };

  const handleSaveLocation = (updated: {
    lat: number;
    lng: number;
    name: string;
    type?: 'pickup' | 'dropoff';
  }) => {
    setLocalExtracted((prev) => {
      if (!prev) return prev;
      if (updated.type === 'pickup') {
        return {
          ...prev,
          pickup: { lat: updated.lat, lng: updated.lng, name: updated.name },
        };
      } else {
        return {
          ...prev,
          dropoff: { lat: updated.lat, lng: updated.lng, name: updated.name },
        };
      }
    });

    if (onUpdateLocation && updated.type) {
      onUpdateLocation({
        type: updated.type,
        lat: updated.lat,
        lng: updated.lng,
        name: updated.name,
      });
    }
  };

  useEffect(() => {
    if (isReady && confirmationCardRef.current) {
      confirmationCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isReady]);

  const getVehicleDisplay = (vehicleType?: string) => {
    switch (vehicleType) {
      case 'BIKE':
        return 'Motorbike (Fastest)';
      case 'CNG':
        return 'CNG Auto Rickshaw';
      case 'CAR':
        return 'Sedan Car (AC)';
      default:
        return vehicleType || 'Not specified';
    }
  };

  return (
    <div className="w-full h-full bg-neutral-950 text-white flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to home"
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                <span>GariKoi AI Agent</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </h1>
              <p className="text-[10px] text-neutral-400 font-mono">Autonomous Dispatch Console</p>
            </div>
          </div>
        </div>

        {/* Live Pulsing Status Indicator */}
        <div
          data-testid="agent-status-indicator"
          className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium"
        >
          {isUnavailable ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[11px] text-rose-400 font-mono">Offline</span>
            </>
          ) : isReady ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-300 font-mono">Ready to Dispatch</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-[11px] text-blue-300 font-mono">Agent Active</span>
            </>
          )}
        </div>
      </header>

      {/* Main Scrollable Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4 pb-36 overflow-y-auto no-scrollbar">
        {/* Rider Prompt Banner */}
        <section
          data-testid="agentic-prompt-banner"
          className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 shadow-md flex items-start gap-3"
        >
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400">
              Your Request
            </span>
            <p className="text-sm font-semibold text-neutral-100 mt-0.5 break-words">
              &quot;{prompt}&quot;
            </p>
          </div>
        </section>

        {/* Unavailable State Fallback */}
        {isUnavailable && (
          <section
            data-testid="agentic-unavailable-banner"
            className="bg-rose-950/30 border border-rose-800/50 rounded-2xl p-4 text-white space-y-3 shadow-lg"
          >
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-sm font-bold text-rose-200">Agentic Booking Unavailable</h2>
            </div>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              {errorMessage ||
                'The AI agent could not process this route. Please switch to manual booking to select your pickup and dropoff.'}
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onSwitchToManual}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Switch to Manual Booking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* Execution Timeline (Vertical Stepper) */}
        <section
          data-testid="agentic-timeline"
          className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 shadow-md backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
              Execution Timeline
            </h2>
            {isLoading && (
              <span className="flex items-center gap-1 text-[11px] text-blue-400 font-mono">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </span>
            )}
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-800">
            {displaySteps.map((step) => {
              const isCompleted = step.status === 'COMPLETED';
              const isInProgress = step.status === 'IN_PROGRESS';

              return (
                <div
                  key={step.id}
                  data-testid={`timeline-step-${step.id}`}
                  className="relative flex flex-col gap-1"
                >
                  {/* Step status icon marker */}
                  <div className="absolute -left-6 top-0.5">
                    {isCompleted ? (
                      <div
                        data-testid="timeline-step-completed"
                        className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : isInProgress ? (
                      <div
                        data-testid="timeline-step-in_progress"
                        className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/60 flex items-center justify-center text-blue-400 shadow-md shadow-blue-500/20 animate-pulse"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    ) : (
                      <div
                        data-testid="timeline-step-pending"
                        className="w-5 h-5 rounded-full bg-neutral-900 border border-neutral-700/70 flex items-center justify-center text-neutral-500"
                      >
                        <Circle className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Step Title & Detail */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isCompleted
                          ? 'text-neutral-200'
                          : isInProgress
                          ? 'text-blue-300 font-bold'
                          : 'text-neutral-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {step.detail && (
                    <p className="text-[11px] text-neutral-400 leading-snug">
                      {step.detail}
                    </p>
                  )}

                  {/* If this is the geo step and coordinates are resolved, show "See on map" links */}
                  {step.id === 'geo' && isCompleted && currentExtracted && (
                    <div className="mt-1.5 space-y-1.5 pt-0.5">
                      {currentExtracted.pickup && (
                        <div className="flex items-center justify-between gap-2 text-[11px] bg-neutral-950/60 px-2.5 py-1 rounded-lg border border-neutral-850">
                          <span className="text-neutral-300 truncate">
                            Pickup: {currentExtracted.pickup.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenMapOverlay({
                                lat: currentExtracted.pickup!.lat,
                                lng: currentExtracted.pickup!.lng,
                                name: currentExtracted.pickup!.name,
                                type: 'pickup',
                              })
                            }
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-[10px] text-emerald-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                          >
                            <Compass className="w-2.5 h-2.5 text-emerald-400" />
                            <span>See on map</span>
                          </button>
                        </div>
                      )}
                      {currentExtracted.dropoff && (
                        <div className="flex items-center justify-between gap-2 text-[11px] bg-neutral-950/60 px-2.5 py-1 rounded-lg border border-neutral-850">
                          <span className="text-neutral-300 truncate">
                            Dropoff: {currentExtracted.dropoff.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenMapOverlay({
                                lat: currentExtracted.dropoff!.lat,
                                lng: currentExtracted.dropoff!.lng,
                                name: currentExtracted.dropoff!.name,
                                type: 'dropoff',
                              })
                            }
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-[10px] text-rose-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                          >
                            <Compass className="w-2.5 h-2.5 text-rose-400" />
                            <span>See on map</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Answered Clarifications Stack */}
        {answeredQuestions && answeredQuestions.length > 0 && (
          <AnsweredCards answeredQuestions={answeredQuestions} />
        )}

        {/* Question Carousel for missing or ambiguous fields */}
        {hasUnfulfilledQuestions && (
          <QuestionCarousel
            questions={questions}
            onAnswer={onAnswerQuestion}
          />
        )}

        {/* Final Confirmation Card */}
        {isReady && currentExtracted && (
          <section
            ref={confirmationCardRef}
            data-testid="final-confirmation-card"
            className="bg-neutral-900 border border-emerald-500/40 rounded-2xl p-4 text-white shadow-2xl space-y-4 transition-all scroll-mt-6"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-neutral-100">
                  Trip Summary & Confirmation
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Verified
              </span>
            </div>

            {/* Route Points */}
            <div className="space-y-3 bg-neutral-950/70 p-3 rounded-xl border border-neutral-850">
              {/* Pickup Address */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-sm shadow-emerald-400/50" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">
                      Pickup Location
                    </span>
                    <p className="text-xs font-semibold text-neutral-100 truncate">
                      {currentExtracted.pickup?.name || 'Current Location'}
                    </p>
                  </div>
                </div>
                {currentExtracted.pickup && (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenMapOverlay({
                        lat: currentExtracted.pickup!.lat,
                        lng: currentExtracted.pickup!.lng,
                        name: currentExtracted.pickup!.name,
                        type: 'pickup',
                      })
                    }
                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-[10px] font-medium text-emerald-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>See on map</span>
                  </button>
                )}
              </div>

              {/* Connecting line */}
              <div className="ml-1 pl-3.5 -my-1 border-l-2 border-dashed border-neutral-800 h-4" />

              {/* Dropoff Address */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0 shadow-sm shadow-rose-400/50" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">
                      Dropoff Destination
                    </span>
                    <p className="text-xs font-semibold text-neutral-100 truncate">
                      {currentExtracted.dropoff?.name || 'Destination'}
                    </p>
                  </div>
                </div>
                {currentExtracted.dropoff && (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenMapOverlay({
                        lat: currentExtracted.dropoff!.lat,
                        lng: currentExtracted.dropoff!.lng,
                        name: currentExtracted.dropoff!.name,
                        type: 'dropoff',
                      })
                    }
                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-[10px] font-medium text-rose-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>See on map</span>
                  </button>
                )}
              </div>
            </div>

            {/* Vehicle, Distance, Fare Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 bg-neutral-950/70 border border-neutral-850 rounded-xl">
                <span className="text-[10px] text-neutral-400 block font-mono">Vehicle</span>
                <span className="text-xs font-bold text-neutral-200 mt-0.5 block truncate">
                  {getVehicleDisplay(currentExtracted.vehicleType)}
                </span>
              </div>
              <div className="p-2.5 bg-neutral-950/70 border border-neutral-850 rounded-xl">
                <span className="text-[10px] text-neutral-400 block font-mono">Distance</span>
                <span className="text-xs font-bold text-neutral-200 mt-0.5 block font-mono">
                  {currentExtracted.estimatedDistanceKm !== undefined
                    ? `${currentExtracted.estimatedDistanceKm.toFixed(1)} km`
                    : '--'}
                </span>
              </div>
              <div className="p-2.5 bg-neutral-950/70 border border-neutral-850 rounded-xl">
                <span className="text-[10px] text-neutral-400 block font-mono">Estimated Fare</span>
                <span className="text-xs font-extrabold text-emerald-400 mt-0.5 block font-mono">
                  {currentExtracted.estimatedFare !== undefined
                    ? `৳ ${currentExtracted.estimatedFare}`
                    : '--'}
                </span>
              </div>
            </div>

            {/* Prominent Action Button */}
            <button
              type="button"
              onClick={() => onConfirmBooking(currentExtracted)}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Confirm & Book Ride</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </section>
        )}
      </main>

      {/* Map Location Overlay Modal with Close & Edit Options */}
      <MapLocationOverlay
        isOpen={Boolean(activeMapLocation)}
        location={activeMapLocation}
        onClose={() => setActiveMapLocation(null)}
        onSaveLocation={handleSaveLocation}
      />
    </div>
  );
}

export default AgenticBookingScreen;
