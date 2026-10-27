import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RiderBottomNav } from '../../src/components/rider/RiderBottomNav';
import ActivityPage from '../../src/app/rider/activity/page';
import OffersPage from '../../src/app/rider/offers/page';
import ProfilePage from '../../src/app/rider/profile/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/rider',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock('@/hooks/useSession', () => ({
  useSession: () => ({
    sessionId: 'test-session-123',
    role: 'RIDER',
    setRole: vi.fn(),
  }),
}));

describe('RiderBottomNav Component', () => {
  it('renders all four navigation items with proper hrefs', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(RiderBottomNav, { activeTab: 'home' })
    );

    expect(html).toContain('href="/rider"');
    expect(html).toContain('href="/rider/activity"');
    expect(html).toContain('href="/rider/offers"');
    expect(html).toContain('href="/rider/profile"');

    expect(html).toContain('Home');
    expect(html).toContain('Activity');
    expect(html).toContain('Offers');
    expect(html).toContain('Profile');
  });

  it('highlights the active tab correctly', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(RiderBottomNav, { activeTab: 'offers' })
    );

    expect(html).toContain('text-emerald-400 font-bold');
  });
});

describe('Activity Page', () => {
  it('renders ride history, trips, and bottom nav', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(ActivityPage)
    );

    expect(html).toContain('Your Activity');
    expect(html).toContain('Dhaka Ride History');
    expect(html).toContain('Dhanmondi');
    expect(html).toContain('Gulshan');
    expect(html).toContain('Rebook');
  });
});

describe('Offers Page', () => {
  it('renders Dhaka promo vouchers, promo input, and copy buttons', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(OffersPage)
    );

    expect(html).toContain('Offers &amp; Promos');
    expect(html).toContain('DHAKA50');
    expect(html).toContain('CNG25');
    expect(html).toContain('AIRPORT150');
    expect(html).toContain('Apply &amp; Ride');
  });
});

describe('Profile Page', () => {
  it('renders user account details, saved locations, and payment options', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(ProfilePage)
    );

    expect(html).toContain('Tanvir Ahmed');
    expect(html).toContain('GOLD');
    expect(html).toContain('Saved Locations');
    expect(html).toContain('bKash Linked');
    expect(html).toContain('Switch to Driver Dashboard');
  });
});
