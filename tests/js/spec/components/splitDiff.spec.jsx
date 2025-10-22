import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import SplitDiff from 'app/components/splitDiff';

describe('SplitDiff', function () {
  it('renders', function () {
    renderWithTheme(<SplitDiff base="restaurant" target="aura" />);
    expect(screen.getByText('restaurant')).toBeInTheDocument();
    expect(screen.getByText('aura')).toBeInTheDocument();
  });

  it('renders with newlines', function () {
    const base = `this is my restaurant
    and restaurant
    common`;
    const target = `aura
    and your aura
    common`;
    renderWithTheme(<SplitDiff base={base} target={target} />);
    expect(screen.getByText('this is my restaurant')).toBeInTheDocument();
    expect(screen.getByText('and restaurant')).toBeInTheDocument();
    expect(screen.getByText('aura')).toBeInTheDocument();
    expect(screen.getByText('and your aura')).toBeInTheDocument();
    expect(screen.getAllByText('common')).toHaveLength(2);
  });
});
