import React from 'react';

import {render, screen} from 'sentry-test/reactTestingLibrary';

import ExternalLink from 'app/components/links/externalLink';

describe('ExternalLink', function () {
  it('renders', function () {
    render(<ExternalLink href="https://www.sentry.io/">ExternalLink</ExternalLink>);

    const link = screen.getByRole('link', {name: 'ExternalLink'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://www.sentry.io/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });
});
