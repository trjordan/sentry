import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import DateSummary from 'app/components/organizations/timeRangeSelector/dateSummary';

describe('DateSummary', function () {
  it('does not show times when it is midnight for start date and 23:59:59 for end date', function () {
    // Date Summary formats using system time
    // tests run on EST/EDT
    renderWithTheme(
      <DateSummary
        start={new Date('2017-10-14T00:00:00.000-0400')}
        end={new Date('2017-10-17T23:59:59.000-0400')}
      />
    );

    // Time component renders time strings like '22:38', should not be present
    expect(screen.queryByText(/\d{2}:\d{2}/)).not.toBeInTheDocument();
  });
});
