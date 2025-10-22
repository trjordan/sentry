import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import EventOrGroupTitle from 'app/components/eventOrGroupTitle';

describe('EventOrGroupTitle', function () {
  const data = {
    metadata: {
      type: 'metadata type',
      directive: 'metadata directive',
      uri: 'metadata uri',
    },
    culprit: 'culprit',
  };

  it('renders with subtitle when `type = error`', function () {
    const {container} = renderWithTheme(
      <EventOrGroupTitle
        data={{
          ...data,
          ...{
            type: 'error',
          },
        }}
      />
    );

    expect(container).toSnapshot();
  });

  it('renders with subtitle when `type = csp`', function () {
    const {container} = renderWithTheme(
      <EventOrGroupTitle
        data={{
          ...data,
          ...{
            type: 'csp',
          },
        }}
      />
    );

    expect(container).toSnapshot();
  });

  it('renders with no subtitle when `type = default`', function () {
    const {container} = renderWithTheme(
      <EventOrGroupTitle
        data={{
          ...data,
          type: 'default',
          metadata: {
            ...data.metadata,
            title: 'metadata title',
          },
        }}
      />
    );

    expect(container).toSnapshot();
  });

  it('renders with title override', function () {
    const organization = TestStubs.Organization({features: ['custom-event-title']});

    renderWithTheme(
      <EventOrGroupTitle
        organization={organization}
        data={{
          ...data,
          type: 'error',
          metadata: {
            ...data.metadata,
            title: 'metadata title',
          },
        }}
      />
    );

    expect(screen.getByText(/metadata title/i)).toBeInTheDocument();
  });
});
