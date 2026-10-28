import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { HomeScreen } from '../../src/components/rider/HomeScreen';
import { AgenticBookingScreen } from '../../src/components/rider/AgenticBookingScreen';

describe('Agentic Flow & Home Screen Integration', () => {
  it('renders top instant-typing bar on HomeScreen', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(HomeScreen, {
        selectedVehicle: 'BIKE',
        onSelectVehicle: () => {},
        onOpenSearch: () => {},
        onStartAgenticBooking: () => {},
      })
    );

    expect(html).toContain('Agentic Ride Booking');
    expect(html).toContain('agentic-prompt-input');
    expect(html).toContain('agentic-submit-button');
    expect(html).toContain('Ask GariKoi Agent');
  });

  it('renders AgenticBookingScreen with all sections including See on Map buttons', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AgenticBookingScreen, {
        prompt: 'Book a car to Banani 11',
        status: 'READY_FOR_CONFIRMATION',
        steps: [
          { id: 'parse', title: 'Parse Intent', status: 'COMPLETED' },
          { id: 'geo', title: 'Resolve Coordinates', status: 'COMPLETED' },
          { id: 'clarify', title: 'Clarify Details', status: 'COMPLETED' },
          { id: 'pricing', title: 'Calculate Fare & Route', status: 'COMPLETED' },
          { id: 'confirm', title: 'Final Confirmation', status: 'IN_PROGRESS' },
        ],
        extracted: {
          pickup: { name: 'Mohakhali, Dhaka', lat: 23.778, lng: 90.398 },
          dropoff: { name: 'Banani 11, Dhaka', lat: 23.790, lng: 90.406 },
          vehicleType: 'CAR',
          estimatedDistanceKm: 3.2,
          estimatedFare: 280,
        },
        onAnswerQuestion: () => {},
        onConfirmBooking: () => {},
        onBack: () => {},
        onSwitchToManual: () => {},
        onSeeOnMap: () => {},
      })
    );

    expect(html).toContain('GariKoi AI Agent');
    expect(html).toContain('Book a car to Banani 11');
    expect(html).toContain('final-confirmation-card');
    expect(html).toContain('Confirm &amp; Book Ride');
    expect(html).toContain('See on map');
  });
});
