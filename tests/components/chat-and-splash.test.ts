import { describe, it, expect } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { ChatPanel } from '../../src/components/chat/ChatPanel';
import RoleSplashPage from '../../src/app/page';
import { TRPCProvider } from '../../src/trpc/Provider';

describe('ChatPanel Component', () => {
  it('renders chat header and other party name when open', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        TRPCProvider,
        null,
        React.createElement(ChatPanel, {
          rideId: 'test-ride-123',
          currentUserRole: 'RIDER',
          isOpen: true,
          onClose: () => {},
          otherPartyName: 'Rahim (Driver)',
        })
      )
    );

    expect(html).toContain('Rahim (Driver)');
    expect(html).toContain('In-Trip Chat');
    expect(html).toContain('RIDER');
    expect(html).toContain('Type your message...');
  });

  it('renders nothing when isOpen is false', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        TRPCProvider,
        null,
        React.createElement(ChatPanel, {
          rideId: 'test-ride-123',
          currentUserRole: 'RIDER',
          isOpen: false,
          onClose: () => {},
        })
      )
    );

    expect(html).toBe('');
  });
});

describe('RoleSplashPage Component', () => {
  it('renders GariKoi brand header and both Rider and Driver role options safely in SSR', () => {
    const html = ReactDOMServer.renderToStaticMarkup(React.createElement(RoleSplashPage));

    expect(html).toContain('GariKoi');
    expect(html).toContain('(গাড়ী কই?)');
    expect(html).toContain('I need a Ride');
    expect(html).toContain('Driver');
    expect(html).toContain('Flexible Location');
    expect(html).toContain('AI Search');
    expect(html).toContain('Dhaka Roads');
    expect(html).toContain('Live Demand Heatmap');
    expect(html).toContain('Reset Session');
  });
});

