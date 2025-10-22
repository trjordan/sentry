import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import NotAvailable from 'app/components/notAvailable';

describe('NotAvailable', function () {
  it('renders', function () {
    const {container} = renderWithTheme(<NotAvailable />);
    expect(container.textContent).toEqual('\u2014');
  });

  it('renders with tooltip', async function () {
    const {container} = renderWithTheme(<NotAvailable tooltip="Tooltip text" />);
    expect(container.textContent).toEqual('\u2014');

    // Hover over the em dash to trigger tooltip
    const emDash = screen.getByText('\u2014');
    await userEvent.hover(emDash);

    // Verify tooltip content appears
    expect(await screen.findByText('Tooltip text')).toBeInTheDocument();
  });
});
