import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import DetailedError from 'app/components/errors/detailedError';

describe('DetailedError', function () {
  it('renders', function () {
    const {container} = renderWithTheme(
      <DetailedError heading="Error heading" message={<div>Message</div>} />
    );

    // Verify heading is rendered
    expect(screen.getByRole('heading', {name: 'Error heading'})).toBeInTheDocument();
    // Verify message is rendered
    expect(screen.getByText('Message')).toBeInTheDocument();
    // Verify icon is present
    expect(container.querySelector('svg')).toBeInTheDocument();
    // Verify support links are shown (default behavior)
    expect(screen.getByText('Service status')).toBeInTheDocument();
    expect(screen.getByText('Contact support')).toBeInTheDocument();
  });

  it('renders with "Retry" button', function () {
    const onRetry = jest.fn();
    renderWithTheme(
      <DetailedError
        onRetry={onRetry}
        heading="Error heading"
        message={<div>Message</div>}
      />
    );

    // Verify retry button is rendered
    expect(screen.getByText('Retry')).toBeInTheDocument();
    // Verify support links are also shown
    expect(screen.getByText('Service status')).toBeInTheDocument();
    expect(screen.getByText('Contact support')).toBeInTheDocument();
  });

  it('can hide support links', function () {
    const onRetry = jest.fn();
    renderWithTheme(
      <DetailedError
        hideSupportLinks
        onRetry={onRetry}
        heading="Error heading"
        message={<div>Message</div>}
      />
    );

    // Verify retry button is still rendered
    expect(screen.getByText('Retry')).toBeInTheDocument();
    // Verify support links are NOT rendered
    expect(screen.queryByText('Service status')).not.toBeInTheDocument();
    expect(screen.queryByText('Contact support')).not.toBeInTheDocument();
    expect(screen.queryByText('Fill out a report')).not.toBeInTheDocument();
  });

  it('hides footer when no "Retry" and no support links', function () {
    const {container} = renderWithTheme(
      <DetailedError
        hideSupportLinks
        heading="Error heading"
        message={<div>Message</div>}
      />
    );

    // Verify heading and message are still rendered
    expect(screen.getByRole('heading', {name: 'Error heading'})).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    // Verify footer is NOT rendered
    expect(
      container.querySelector('.detailed-error-content-footer')
    ).not.toBeInTheDocument();
    // Verify no retry button
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    // Verify no support links
    expect(screen.queryByText('Service status')).not.toBeInTheDocument();
    expect(screen.queryByText('Contact support')).not.toBeInTheDocument();
  });
});
