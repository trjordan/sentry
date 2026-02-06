import React from 'react';

import {fireEvent, render, screen} from '@testing-library/react';

import ArrayValue from 'app/utils/discover/arrayValue';

describe('Discover > ArrayValue', function () {
  it('renders an expand link', function () {
    render(<ArrayValue value={['one', 'two', 'three']} />);

    // Should have a button
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('[+2 more]');

    // Should show last value.
    expect(screen.getByText('three')).toBeInTheDocument();
  });

  it('renders all elements when expanded', function () {
    render(<ArrayValue value={['one', 'two', 'three']} />);

    // Should have a button
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Button text should update.
    expect(button).toHaveTextContent('[collapse]');

    // Should show all values.
    expect(screen.getByText('three')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  it('hides toggle on 1 element', function () {
    render(<ArrayValue value={['one']} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  it('hides toggle on 0 elements', function () {
    render(<ArrayValue value={[]} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
