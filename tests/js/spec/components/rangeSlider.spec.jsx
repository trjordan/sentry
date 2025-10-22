import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
} from 'sentry-test/reactTestingLibrary';

import RangeSlider from 'app/views/settings/components/forms/controls/rangeSlider';

describe('RangeSlider', function () {
  const creator = props => (
    <RangeSlider name="test" value={5} min={0} max={10} onChange={() => {}} {...props} />
  );

  it('changes value', function () {
    const {container} = renderWithTheme(creator());
    const slider = container.querySelector('input[type="range"]');

    // Initial label should show value 5
    expect(screen.getByText('5')).toBeInTheDocument();

    // Change slider value
    fireEvent.input(slider, {target: {value: '7'}});

    // Label should update to 7
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('has right label', function () {
    const {container} = renderWithTheme(creator());
    const slider = container.querySelector('input[type="range"]');

    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.input(slider, {target: {value: '7'}});

    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('can use formatLabel', function () {
    const {container} = renderWithTheme(
      creator({
        formatLabel: value => (
          <div className="test">{value === 7 ? 'SEVEN!' : value + 1}</div>
        ),
      })
    );

    const slider = container.querySelector('input[type="range"]');
    const formattedLabel = container.querySelector('.test');

    expect(formattedLabel).toBeInTheDocument();
    expect(formattedLabel).toHaveTextContent('6');

    fireEvent.input(slider, {target: {value: '7'}});

    expect(formattedLabel).toHaveTextContent('SEVEN!');
  });

  it('calls onChange', function () {
    const onChange = jest.fn();
    const {container} = renderWithTheme(
      creator({
        onChange,
      })
    );

    const slider = container.querySelector('input[type="range"]');

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.input(slider, {target: {value: '7'}});

    expect(onChange).toHaveBeenCalledWith(7, expect.anything());
  });

  it('can provide a list of allowedValues', function () {
    const onChange = jest.fn();
    const {container} = renderWithTheme(
      creator({
        // support unsorted arrays?
        allowedValues: [0, 100, 1000, 10000, 20000],
        value: 1000,
        onChange,
      })
    );

    const slider = container.querySelector('input[type="range"]');

    // With `allowedValues` sliderValue will be the index to value in `allowedValues`
    // The displayed label should show the actual value (1000)
    expect(screen.getByText('1000')).toBeInTheDocument();

    fireEvent.input(slider, {target: {value: '0'}});

    expect(screen.getByText('0')).toBeInTheDocument();

    // onChange will callback with a value from `allowedValues`
    expect(onChange).toHaveBeenCalledWith(0, expect.anything());
  });

  it('handles invalid values', function () {
    const onChange = jest.fn();
    const {container} = renderWithTheme(
      creator({
        // support unsorted arrays?
        allowedValues: [0, 100, 1000, 10000, 20000],
        value: 1000,
        onChange,
      })
    );

    const slider = container.querySelector('input[type="range"]');

    fireEvent.input(slider, {target: {value: '-1'}});

    expect(screen.getByText('Invalid value')).toBeInTheDocument();

    // onChange will callback with a value from `allowedValues`
    expect(onChange).toHaveBeenCalledWith(undefined, expect.anything());
  });
});
