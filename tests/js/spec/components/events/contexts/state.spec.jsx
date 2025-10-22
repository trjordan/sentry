import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import StateContextType from 'app/components/events/contexts/state';

const STATE_CONTEXT = {
  type: 'state',
  state: {
    type: 'redux',
    value: {
      a: 'abc',
    },
  },
  otherState: {
    value: {
      b: 'bcd',
    },
  },
};

describe('StateContext', function () {
  it('renders', () => {
    const {container} = renderWithTheme(
      <StateContextType alias="state" data={STATE_CONTEXT} />
    );

    const keys = container.querySelectorAll('.key');
    const values = container.querySelectorAll('.val');

    expect(keys[0].textContent).toEqual('State (Redux)');
    expect(keys[1].textContent).toEqual('otherState');

    expect(values[0].textContent).toEqual('{a: abc}');
    expect(values[1].textContent).toEqual('{b: bcd}');
  });
});
