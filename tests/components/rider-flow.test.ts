import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  HomeScreen,
  ServiceTiles,
  OffersStrip,
  LocationSearch,
  FareSelector,
  SearchingOverlay,
  DriverCard,
  TripActiveHUD,
  TripCompleted,
  RatingScreen,
} from '../../src/components/rider';
import RiderPage from '../../src/app/rider/page';
import { SEED_DRIVERS } from '../../src/lib/constants';
import { calculateFare } from '../../src/lib/fare';

describe('Rider Flow Components - Module Exports', () => {
  it('exports all rider screens and components from src/components/rider', () => {
    expect(typeof HomeScreen).toBe('function');
    expect(typeof ServiceTiles).toBe('function');
    expect(typeof OffersStrip).toBe('function');
    expect(typeof LocationSearch).toBe('function');
    expect(typeof FareSelector).toBe('function');
    expect(typeof SearchingOverlay).toBe('function');
    expect(typeof DriverCard).toBe('function');
    expect(typeof TripActiveHUD).toBe('function');
    expect(typeof TripCompleted).toBe('function');
    expect(typeof RatingScreen).toBe('function');
  });

  it('exports RiderPage as default export from src/app/rider/page', () => {
    expect(typeof RiderPage).toBe('function');
  });
});

describe('HomeScreen Component', () => {
  it('renders GariKoi brand header, search pill, and service tiles', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(HomeScreen, {
        selectedVehicle: 'BIKE',
        onSelectVehicle: () => {},
        onOpenSearch: () => {},
        userLocationName: 'Gulshan 2, Dhaka',
        nearbyDriversCount: 5,
      })
    );

    expect(html).toContain('GariKoi');
    expect(html).toContain('Where to?');
    expect(html).toContain('5 drivers nearby');
    expect(html).toContain('Gulshan 2, Dhaka');
    expect(html).toContain('Select Service');
  });
});

describe('ServiceTiles Component', () => {
  it('renders all three vehicle types (Bike, CNG, Car)', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(ServiceTiles, {
        selected: 'CNG',
        onSelect: () => {},
      })
    );
    expect(html).toContain('Bike');
    expect(html).toContain('CNG');
    expect(html).toContain('Car');
    expect(html).toContain('🛺');
    expect(html).toContain('🏍');
    expect(html).toContain('🚗');
    expect(html).toContain('from ৳70');
  });

  it('highlights the selected vehicle with emerald styling', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(ServiceTiles, {
        selected: 'BIKE',
        onSelect: () => {},
      })
    );
    expect(html).toContain('border-emerald-500');
  });
});

describe('OffersStrip Component', () => {
  it('renders promo offers and discounts', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(OffersStrip, {
        onApplyPromo: () => {},
      })
    );
    expect(html).toContain('20%');
    expect(html).toContain('DHAKA20');
    expect(html).toContain('GARIKOI30');
  });
});

describe('LocationSearch Component', () => {
  it('renders search input with explicit [📍 Use my GPS] and [🗺 Select Manually] buttons', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(LocationSearch, {
        pickupText: 'Gulshan 2',
        dropoffText: 'Motijheel',
        onPickupChange: () => {},
        onDropoffChange: () => {},
        onUseGPS: () => {},
        onSelectManually: () => {},
        aiMode: false,
        onToggleAI: () => {},
        onSubmitSearch: () => {},
      })
    );

    expect(html).toContain('Use my GPS');
    expect(html).toContain('Select Manually');
    expect(html).toContain('Gulshan 2');
    expect(html).toContain('Motijheel');
    expect(html).toContain('[AI]');
    expect(html).toContain('Standard');
  });

  it('renders clean flat AI toggle without neon-blue or purple glows', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(LocationSearch, {
        pickupText: 'Gulshan 2',
        dropoffText: '',
        onPickupChange: () => {},
        onDropoffChange: () => {},
        onUseGPS: () => {},
        onSelectManually: () => {},
        aiMode: true,
        onToggleAI: () => {},
      })
    );

    expect(html).toContain('[AI]');
    expect(html).toContain('AI Mode ON');
    expect(html).toContain('AI Search');
    expect(html).toContain('AI Search Active');
    // Enforce design constraint: strictly avoid neon blues, violet/purple gradients
    expect(html).not.toContain('bg-purple');
    expect(html).not.toContain('from-purple');
    expect(html).not.toContain('from-blue');
    expect(html).not.toContain('shadow-cyan');
  });

  it('renders error message without blocking flow when error is present', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(LocationSearch, {
        pickupText: '',
        dropoffText: '',
        onPickupChange: () => {},
        onDropoffChange: () => {},
        onUseGPS: () => {},
        onSelectManually: () => {},
        aiMode: false,
        onToggleAI: () => {},
        onSubmitSearch: () => {},
        error: 'GPS permission denied. Please enter address manually.',
      })
    );

    expect(html).toContain('GPS permission denied');
    expect(html).toContain('Use my GPS');
  });

  it('renders suggestions list with Show on map buttons when suggestions are provided', () => {
    const suggestions = [
      { displayName: 'Dhanmondi 27, Dhaka', lat: 23.7461, lng: 90.3742 },
      { displayName: 'Gulshan 2 Circle', lat: 23.7925, lng: 90.4078 },
    ];
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(LocationSearch, {
        pickupText: 'Dhanmondi',
        dropoffText: '',
        onPickupChange: () => {},
        onDropoffChange: () => {},
        onUseGPS: () => {},
        onSelectManually: () => {},
        aiMode: false,
        onToggleAI: () => {},
        suggestions,
      })
    );

    expect(html).toContain('Dhanmondi 27, Dhaka');
    expect(html).toContain('Gulshan 2 Circle');
    expect(html).toContain('Show on map');
  });
});

describe('FareSelector Component', () => {
  it('renders vehicle cards with computed fares in BDT (৳) and estimated duration', () => {
    const distanceKm = 8.5;
    const bikeFare = calculateFare('BIKE', distanceKm).totalFare;
    const cngFare = calculateFare('CNG', distanceKm).totalFare;
    const carFare = calculateFare('CAR', distanceKm).totalFare;

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(FareSelector, {
        distanceKm,
        selectedVehicle: 'BIKE',
        onSelectVehicle: () => {},
        onConfirm: () => {},
      })
    );

    expect(html).toContain(`৳${bikeFare}`);
    expect(html).toContain(`৳${cngFare}`);
    expect(html).toContain(`৳${carFare}`);
    expect(html).toContain('8.5 km');
    expect(html).toContain('Cash in BDT (৳)');
    expect(html).toContain('Confirm');
    expect(html).toContain('Collapse Map');
  });

  it('renders compact collapsible view when isInitiallyCollapsed is true', () => {
    const distanceKm = 8.5;
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(FareSelector, {
        distanceKm,
        selectedVehicle: 'BIKE',
        onSelectVehicle: () => {},
        onConfirm: () => {},
        isInitiallyCollapsed: true,
      })
    );

    expect(html).toContain('Expand Carousel');
    expect(html).toContain('Change');
    expect(html).toContain('Confirm');
    expect(html).toContain('8.5 km');
  });
});

describe('SearchingOverlay Component', () => {
  it('renders radar pulse visual, status text, and cancel button', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(SearchingOverlay, {
        pickupAddress: 'Gulshan 2, Dhaka',
        vehicleType: 'CNG',
        onCancel: () => {},
      })
    );

    expect(html).toContain('Connecting to nearby drivers');
    expect(html).toContain('Gulshan 2, Dhaka');
    expect(html).toContain('Cancel Request');
  });
});

describe('DriverCard Component', () => {
  it('displays driver profile, rating, vehicle plate, and call/chat actions', () => {
    const driver = SEED_DRIVERS[0];
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(DriverCard, {
        driverName: driver.name,
        driverPlate: driver.plate,
        driverVehicle: driver.vehicle,
        driverRating: driver.rating,
        etaMinutes: 4,
        onCall: () => {},
        onOpenChat: () => {},
        unreadChatCount: 2,
      })
    );

    expect(html).toContain(driver.name);
    expect(html).toContain(driver.plate);
    expect(html).toContain('4.9');
    expect(html).toContain('4 min');
    expect(html).toContain('Call');
    expect(html).toContain('Chat');
    expect(html).toContain('2'); // unread badge
  });
});

describe('TripActiveHUD Component', () => {
  it('renders active in-progress trip meter, live fare, and SOS emergency button', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(TripActiveHUD, {
        driverName: 'Rahim Uddin',
        vehiclePlate: 'DHA-1234',
        currentFare: 165,
        distanceTraveledKm: 3.2,
        totalDistanceKm: 7.8,
        onSOS: () => {},
      })
    );

    expect(html).toContain('Rahim Uddin');
    expect(html).toContain('DHA-1234');
    expect(html).toContain('৳165');
    expect(html).toContain('3.2 km');
    expect(html).toContain('SOS');
  });
});

describe('TripCompleted Component', () => {
  it('renders fare breakdown and one-tap Pay (Cash) button', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(TripCompleted, {
        pickupAddress: 'Gulshan 2',
        dropoffAddress: 'Dhanmondi 27',
        distanceKm: 9.4,
        baseFare: 40,
        distanceFare: 183,
        totalFare: 223,
        onPayCash: () => {},
      })
    );

    expect(html).toContain('Gulshan 2');
    expect(html).toContain('Dhanmondi 27');
    expect(html).toContain('Base Fare');
    expect(html).toContain('৳40');
    expect(html).toContain('৳183');
    expect(html).toContain('৳223');
    expect(html).toContain('Pay ৳223 (Cash)');
  });
});

describe('RatingScreen Component', () => {
  it('renders 1-5 star selector, feedback tags, and comment input', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(RatingScreen, {
        driverName: 'Rahim Uddin',
        onSubmit: () => {},
      })
    );

    expect(html).toContain('Rate your trip with Rahim Uddin');
    expect(html).toContain('Safe Driver');
    expect(html).toContain('Polite');
    expect(html).toContain('Clean Vehicle');
    expect(html).toContain('Submit Rating');
  });
});

describe('RiderPage Orchestrator', () => {
  it('renders GariKoi brand header and initial state safely in SSR', () => {
    const html = ReactDOMServer.renderToStaticMarkup(React.createElement(RiderPage));
    expect(html).toContain('GariKoi');
  });
});
