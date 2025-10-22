import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import SimilarScoreCard from 'app/components/similarScoreCard';

describe('SimilarScoreCard', function () {
  it('renders', function () {
    const {container} = renderWithTheme(<SimilarScoreCard />);
    // Component returns null when scoreList is empty
    expect(container.firstChild).toBeNull();
  });

  it('renders with score list', function () {
    renderWithTheme(
      <SimilarScoreCard
        scoreList={[
          ['exception:message:character-shingles', null],
          ['exception:stacktrace:application-chunks', 0.8],
          ['exception:stacktrace:pairs', 1],
          ['message:message:character-shingles', 0.5],
          ['unknown:foo:bar', 0.5],
        ]}
      />
    );

    // Check that the score labels are rendered correctly
    expect(screen.getByText('Exception Message')).toBeInTheDocument();
    expect(screen.getByText('In-App Frames')).toBeInTheDocument();
    expect(screen.getByText('Stack Trace Frames')).toBeInTheDocument();
    expect(screen.getByText('Log Message')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });
});
