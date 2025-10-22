import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import Checkbox from 'app/components/checkbox';

describe('Checkbox', function () {
  it('renders', function () {
    const {container} = renderWithTheme(<Checkbox onChange={() => {}} />);
    expect(container).toSnapshot();
  });
});
