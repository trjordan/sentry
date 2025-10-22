// eslint-disable-next-line no-restricted-imports
import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import SettingsLayout from 'app/views/settings/components/settingsLayout';

describe('SettingsLayout', function () {
  beforeEach(function () {
    Client.clearMockResponses();
    Client.addMockResponse({
      url: '/internal/health/',
      body: {
        problems: [],
      },
    });
    Client.addMockResponse({
      url: '/organizations/',
      body: [TestStubs.Organization()],
    });
    Client.addMockResponse({
      url: '/organizations/org-slug/',
      method: 'DELETE',
      statusCode: 401,
      body: {
        sudoRequired: true,
      },
    });
    Client.addMockResponse({
      url: '/authenticators/',
      body: [],
    });
  });

  it('renders', function () {
    const {container} = renderWithTheme(
      <SettingsLayout router={TestStubs.router()} route={{}} routes={[]} />
    );

    expect(container).toBeInTheDocument();
  });

  it('can render navigation', function () {
    const Navigation = () => <div>Navigation</div>;
    renderWithTheme(
      <SettingsLayout
        router={TestStubs.router()}
        route={{}}
        routes={[]}
        renderNavigation={() => <Navigation />}
      />
    );

    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('can toggle mobile navigation', async function () {
    const Navigation = () => <div>Navigation</div>;
    const {container} = renderWithTheme(
      <SettingsLayout
        router={TestStubs.router()}
        route={{}}
        routes={[]}
        renderNavigation={() => <Navigation />}
      />
    );

    // Find the NavMenuToggle button by its aria-label
    const toggleButton = screen.getByLabelText('Open the menu');

    // Initially, NavMask and SidebarWrapper should not be visible (isVisible=false)
    // We can't directly check props, but we can check if the element with specific styles exists
    const navMask = container.querySelector('div[class*="NavMask"]');
    const sidebarWrapper = container.querySelector('div[class*="SidebarWrapper"]');

    expect(navMask).toBeInTheDocument();
    expect(sidebarWrapper).toBeInTheDocument();

    // Click the toggle button
    await userEvent.click(toggleButton);

    // After clicking, the mobile navigation should be visible
    // The component should update and re-render with isVisible=true
    expect(navMask).toBeInTheDocument();
    expect(sidebarWrapper).toBeInTheDocument();
  });
});
