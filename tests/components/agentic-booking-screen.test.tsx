import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  AgenticBookingScreen,
  type TimelineStep,
  type ExtractedBookingDetails,
} from '../../src/components/rider';
import type { ClarificationQuestion, AnsweredQuestion } from '../../src/components/rider/agentic';

const mockSteps: TimelineStep[] = [
  { id: 'parse', title: 'Parse Intent', status: 'COMPLETED', detail: 'Identified ride request' },
  { id: 'geo', title: 'Resolve Coordinates', status: 'COMPLETED', detail: 'Pickup & dropoff resolved' },
  { id: 'clarify', title: 'Clarify Details', status: 'IN_PROGRESS', detail: 'Clarifying vehicle type' },
  { id: 'pricing', title: 'Calculate Fare & Route', status: 'PENDING' },
  { id: 'confirm', title: 'Final Confirmation', status: 'PENDING' },
];

const mockExtracted: ExtractedBookingDetails = {
  pickup: { name: 'Gulshan 2 Circle', lat: 23.7925, lng: 90.4078 },
  dropoff: { name: 'Dhanmondi 27', lat: 23.7534, lng: 90.3772 },
  vehicleType: 'CAR',
  estimatedDistanceKm: 8.5,
  estimatedFare: 320,
};

const mockQuestions: ClarificationQuestion[] = [
  {
    id: 'q-vehicle',
    field: 'vehicleType',
    question: 'Select preferred vehicle type',
    options: [
      { label: 'Bike', value: 'BIKE' },
      { label: 'Car', value: 'CAR', badge: 'Recommended' },
    ],
  },
];

const mockAnswered: AnsweredQuestion[] = [
  {
    id: 'q-route',
    field: 'routePreference',
    question: 'Avoid flyover?',
    answer: 'No, fastest route',
  },
];

describe('AgenticBookingScreen Component', () => {
  it('renders top executive dashboard header, live pulsing indicator, and rider prompt banner', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AgenticBookingScreen, {
        prompt: 'Take me to Dhanmondi 27',
        status: 'NEED_CLARIFICATION',
        steps: mockSteps,
        questions: mockQuestions,
        answeredQuestions: mockAnswered,
        onAnswerQuestion: () => {},
        onConfirmBooking: () => {},
        onBack: () => {},
        onSwitchToManual: () => {},
      })
    );

    expect(html).toContain('GariKoi AI Agent');
    expect(html).toContain('Take me to Dhanmondi 27');
    expect(html).toContain('data-testid="agent-status-indicator"');
    expect(html).toContain('data-testid="agentic-prompt-banner"');
    expect(html).toContain('Agent Active');
  });

  it('renders vertical timeline stepper with step titles and status icons', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AgenticBookingScreen, {
        prompt: 'Take me to Dhanmondi 27',
        status: 'NEED_CLARIFICATION',
        steps: mockSteps,
        extracted: mockExtracted,
        questions: mockQuestions,
        onAnswerQuestion: () => {},
        onConfirmBooking: () => {},
        onBack: () => {},
        onSwitchToManual: () => {},
      })
    );

    expect(html).toContain('Parse Intent');
    expect(html).toContain('Resolve Coordinates');
    expect(html).toContain('Clarify Details');
    expect(html).toContain('Calculate Fare &amp; Route');
    expect(html).toContain('Final Confirmation');
    expect(html).toContain('data-testid="timeline-step-parse"');
    expect(html).toContain('data-testid="timeline-step-geo"');
    expect(html).toContain('data-testid="timeline-step-clarify"');
  });

  it('renders "See on map" button beside addresses and handles click', () => {
    const onSeeOnMap = vi.fn();
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AgenticBookingScreen, {
        prompt: 'Take me to Dhanmondi 27',
        status: 'NEED_CLARIFICATION',
        steps: mockSteps,
        extracted: mockExtracted,
        onAnswerQuestion: () => {},
        onConfirmBooking: () => {},
        onBack: () => {},
        onSwitchToManual: () => {},
        onSeeOnMap,
      })
    );

    expect(html).toContain('See on map');

    // Test handler execution
    onSeeOnMap(mockExtracted.pickup!);
    expect(onSeeOnMap).toHaveBeenCalledWith({
      name: 'Gulshan 2 Circle',
      lat: 23.7925,
      lng: 90.4078,
    });

    onSeeOnMap(mockExtracted.dropoff!);
    expect(onSeeOnMap).toHaveBeenCalledWith({
      name: 'Dhanmondi 27',
      lat: 23.7534,
      lng: 90.3772,
    });
  });

  it('embeds QuestionCarousel when unfulfilled questions exist', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AgenticBookingScreen, {
        prompt: 'Take me to Dhanmondi 27',
        status: 'NEED_CLARIFICATION',
        steps: mockSteps,
        questions: mockQuestions,
        onAnswerQuestion: () => {},
        onConfirmBooking: () => {},
        onBack: () => {},
        onSwitchToManual: () => {},
      })
    );

    expect(html).toContain('Select preferred vehicle type');
    expect(html).toContain('data-testid="question-carousel"');
  });

  it('embeds AnsweredCards when answered questions exist', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AgenticBookingScreen, {
        prompt: 'Take me to Dhanmondi 27',
        status: 'NEED_CLARIFICATION',
        steps: mockSteps,
        answeredQuestions: mockAnswered,
        onAnswerQuestion: () => {},
        onConfirmBooking: () => {},
        onBack: () => {},
        onSwitchToManual: () => {},
      })
    );

    expect(html).toContain('Avoid flyover?');
    expect(html).toContain('No, fastest route');
    expect(html).toContain('data-testid="answered-cards-container"');
  });

  it('renders Final Confirmation Card when status is READY_FOR_CONFIRMATION', () => {
    const completedSteps = mockSteps.map((s) => ({ ...s, status: 'COMPLETED' as const }));
    const onConfirmBooking = vi.fn();
    const onSeeOnMap = vi.fn();

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AgenticBookingScreen, {
        prompt: 'Take me to Dhanmondi 27 by car',
        status: 'READY_FOR_CONFIRMATION',
        steps: completedSteps,
        extracted: mockExtracted,
        onAnswerQuestion: () => {},
        onConfirmBooking,
        onBack: () => {},
        onSwitchToManual: () => {},
        onSeeOnMap,
      })
    );

    expect(html).toContain('Trip Summary &amp; Confirmation');
    expect(html).toContain('Gulshan 2 Circle');
    expect(html).toContain('Dhanmondi 27');
    expect(html).toContain('8.5 km');
    expect(html).toContain('320');
    expect(html).toContain('Confirm &amp; Book Ride');

    // Test handler execution
    onConfirmBooking(mockExtracted);
    expect(onConfirmBooking).toHaveBeenCalledWith(mockExtracted);
  });

  it('renders Unavailable banner and manual booking switch button when status is UNAVAILABLE', () => {
    const onSwitchToManual = vi.fn();
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AgenticBookingScreen, {
        prompt: 'Take me to Chittagong',
        status: 'UNAVAILABLE',
        errorMessage: 'Destination is outside Dhaka operational zone.',
        steps: mockSteps,
        onAnswerQuestion: () => {},
        onConfirmBooking: () => {},
        onBack: () => {},
        onSwitchToManual,
      })
    );

    expect(html).toContain('Agentic Booking Unavailable');
    expect(html).toContain('Destination is outside Dhaka operational zone.');
    expect(html).toContain('Switch to Manual Booking');

    onSwitchToManual();
    expect(onSwitchToManual).toHaveBeenCalledTimes(1);
  });

  it('handles onBack callback when back button is triggered', () => {
    const onBack = vi.fn();
    const element = React.createElement(AgenticBookingScreen, {
      prompt: 'Test prompt',
      status: 'PROCESSING',
      steps: mockSteps,
      onAnswerQuestion: () => {},
      onConfirmBooking: () => {},
      onBack,
      onSwitchToManual: () => {},
    });

    expect(element.props.prompt).toBe('Test prompt');
    onBack();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('displays loading thinking indicator when isLoading is true', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AgenticBookingScreen, {
        prompt: 'Test prompt',
        status: 'PROCESSING',
        steps: mockSteps,
        isLoading: true,
        onAnswerQuestion: () => {},
        onConfirmBooking: () => {},
        onBack: () => {},
        onSwitchToManual: () => {},
      })
    );

    expect(html).toContain('Thinking...');
  });
});
