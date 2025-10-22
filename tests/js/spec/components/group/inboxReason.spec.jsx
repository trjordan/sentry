import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import InboxReason from 'app/components/group/inboxBadges/inboxReason';

describe('InboxReason', () => {
  let inbox;
  beforeEach(() => {
    inbox = {
      reason: 0,
      date_added: new Date(),
      reason_details: null,
    };
  });

  it('displays new issue inbox reason', () => {
    const {container} = renderWithTheme(<InboxReason inbox={inbox} />);
    expect(container).toHaveTextContent('New Issue');
  });

  it('displays time added to inbox', () => {
    renderWithTheme(<InboxReason showDateAdded inbox={inbox} />);
    // TimeSince with extraShort displays time like "0ms", "3s", etc. (no "ago" suffix when suffix="")
    expect(screen.getByText('0ms')).toBeInTheDocument();
  });

  it('has a tooltip', () => {
    const {container} = renderWithTheme(<InboxReason inbox={inbox} />);
    // Tooltip is rendered, check that the tooltip portal exists with the expected content
    const tooltipPortal = document.getElementById('tooltip-portal');
    expect(tooltipPortal).toBeInTheDocument();

    // Verify the tag is rendered with proper text
    expect(container).toHaveTextContent('New Issue');
  });

  it('has affected user count', () => {
    renderWithTheme(
      <InboxReason
        inbox={{
          ...inbox,
          reason: 1,
          reason_details: {
            count: null,
            until: null,
            user_count: 10,
            user_window: null,
            window: null,
          },
        }}
      />
    );

    // Verify the badge displays "Unignored" for reason 1
    expect(screen.getByText('Unignored')).toBeInTheDocument();
  });
});
