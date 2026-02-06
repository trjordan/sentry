import React from 'react';

import {render, screen} from 'sentry-test/reactTestingLibrary';

import AlertBadge from 'app/views/alerts/alertBadge';
import {IncidentStatus} from 'app/views/alerts/types';

describe('AlertBadge', function () {
  it('displays status', function () {
    render(<AlertBadge status={IncidentStatus.CLOSED} />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });
  it('hides status text', function () {
    const {container} = render(<AlertBadge hideText status={IncidentStatus.CLOSED} />);
    expect(container).toHaveTextContent('');
  });
  it('can be an issue badge', function () {
    const {container} = render(<AlertBadge hideText isIssue />);
    expect(container).toHaveTextContent('');
  });
});
