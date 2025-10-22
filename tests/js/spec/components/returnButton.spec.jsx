import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import ReturnButton from 'app/views/settings/components/forms/returnButton';

describe('returnButton', function () {
  it('renders', function () {
    const {container} = renderWithTheme(<ReturnButton />);
    expect(container).toSnapshot();
  });
});
