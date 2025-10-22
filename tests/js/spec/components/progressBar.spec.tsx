import React from 'react';

import {render, screen} from 'sentry-test/reactTestingLibrary';

import ProgressBar from 'app/components/progressBar';

describe('ProgressBar', function () {
  it('basic', function () {
    const progressBarValue = 50;
    render(<ProgressBar value={progressBarValue} />);

    // element exists
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();

    // check aria attributes
    expect(progressBar).toHaveAttribute('aria-valuenow', String(progressBarValue));
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });
});
