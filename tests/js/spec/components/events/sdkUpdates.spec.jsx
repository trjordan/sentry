import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import EventSdkUpdates from 'app/components/events/sdkUpdates';

describe('EventSdkUpdates', function () {
  it('renders a suggestion to update the sdk and then enable an integration', function () {
    const props = {
      event: TestStubs.UpdateSdkAndEnableIntegrationSuggestion(),
    };

    renderWithTheme(<EventSdkUpdates {...props} />);

    // Verify the SDK update suggestion is rendered
    expect(screen.getByText(/We recommend you/)).toBeInTheDocument();
    expect(
      screen.getByText(/update your SDK from version 0.1.0 to version 0.9.0/)
    ).toBeInTheDocument();
    expect(screen.getByText(/django/i)).toBeInTheDocument();
  });
});
