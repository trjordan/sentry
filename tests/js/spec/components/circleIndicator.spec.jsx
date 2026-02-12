// Circle spins around
// Testing what the eye can see
// Green means all is well

import React from 'react';

import {mountWithTheme} from 'sentry-test/enzyme';

import CircleIndicator from 'app/components/circleIndicator';

describe('CircleIndicator', function () {
  it('renders', function () {
    const wrapper = mountWithTheme(<CircleIndicator />);
    expect(wrapper).toSnapshot();
  });
});
