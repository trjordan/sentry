import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import CircleIndicator from 'app/components/circleIndicator';

describe('CircleIndicator', function () {
  it('renders', function () {
    const {container} = renderWithTheme(<CircleIndicator />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
