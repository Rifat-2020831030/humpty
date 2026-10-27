import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { DriverBottomNav } from '../../src/components/driver/DriverBottomNav';
import DriverEarningsPage from '../../src/app/driver/earnings/page';
import DriverTripsPage from '../../src/app/driver/trips/page';
import DriverProfilePage from '../../src/app/driver/profile/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/driver',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock('@/hooks/useSession', () => ({
  useSession: () => ({
    sessionId: 'test-session-driver',
    role: 'DRIVER',
    setRole: vi.fn(),
  }),
}));

describe('DriverBottomNav Component', () => {
  it('renders all four navigation items with proper hrefs', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(DriverBottomNav, { activeTab: 'drive' })
    );

    expect(html).toContain('href="/driver"');
    expect(html).toContain('href="/driver/earnings"');
    expect(html).toContain('href="/driver/trips"');
    expect(html).toContain('href="/driver/profile"');

    expect(html).toContain('Drive');
    expect(html).toContain('Earnings');
    expect(html).toContain('Trips');
    expect(html).toContain('Profile');
  });

  it('highlights the active tab correctly', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(DriverBottomNav, { activeTab: 'earnings' })
    );

    expect(html).toContain('text-emerald-400 font-bold');
  });
});

describe('Driver Earnings Page', () => {
  it('renders today earnings, bKash wallet cashout, and quest progress', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(DriverEarningsPage)
    );

    expect(html).toContain('Driver Earnings');
    expect(html).toContain('৳2,850');
    expect(html).toContain('Digital Wallet (bKash)');
    expect(html).toContain('Instant Cashout');
    expect(html).toContain('15 Trips Daily Target');
  });
});

describe('Driver Trips Page', () => {
  it('renders driver completed trip log and net fares', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(DriverTripsPage)
    );

    expect(html).toContain('Driver Trip Log');
    expect(html).toContain('Tanvir Ahmed');
    expect(html).toContain('Pink City, Gulshan 2');
    expect(html).toContain('Fare Breakdown');
  });
});

describe('Driver Profile Page', () => {
  it('renders driver credentials, BRTA documents, and KPIs', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(DriverProfilePage)
    );

    expect(html).toContain('Rafiqul Islam');
    expect(html).toContain('VERIFIED CAPTAIN');
    expect(html).toContain('Toyota Axio');
    expect(html).toContain('BRTA Registration');
    expect(html).toContain('Switch to Rider Mode');
  });
});
