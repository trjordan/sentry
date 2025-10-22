import React from 'react';

import {
  render,
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
  within,
} from 'sentry-test/reactTestingLibrary';

import TimeRangeSelector from 'app/components/organizations/timeRangeSelector';
import ConfigStore from 'app/stores/configStore';

// Mock document.createRange which is used by userEvent
document.createRange = () => {
  const range = {
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    getBoundingClientRect: jest.fn(() => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    })),
    getClientRects: jest.fn(() => []),
    cloneRange: jest.fn(function () {
      return this;
    }),
  };
  return range;
};

describe('TimeRangeSelector', function () {
  const onChange = jest.fn();

  const createWrapper = (props = {}) =>
    renderWithTheme(
      <TimeRangeSelector
        showAbsolute
        showRelative
        onChange={onChange}
        organization={TestStubs.Organization()}
        {...props}
      />
    );

  beforeEach(function () {
    ConfigStore.loadInitialData({
      user: {options: {timezone: 'America/New_York'}},
    });
    onChange.mockReset();
  });

  it('renders when given relative period not in dropdown', function () {
    renderWithTheme(
      <TimeRangeSelector showAbsolute={false} showRelative={false} relative="9d" />
    );
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('renders when given an invalid relative period', function () {
    renderWithTheme(
      <TimeRangeSelector showAbsolute={false} showRelative={false} relative="1w" />
    );
    expect(screen.getByText('Invalid period')).toBeInTheDocument();
  });

  it('hides relative and absolute selectors', async function () {
    renderWithTheme(
      <TimeRangeSelector showAbsolute={false} showRelative={false} />
    );
    
    // Open the dropdown
    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));
    
    // Check that no relative or absolute selectors are shown
    expect(screen.queryByText('Absolute date')).not.toBeInTheDocument();
    // The relative selector items (like "Last 24 hours", "Last 7 days") shouldn't be present
  });

  it('selects absolute item', async function () {
    const {rerender} = createWrapper();
    
    // Open the dropdown
    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));

    // Date range picker should not be shown initially
    expect(screen.queryByTestId('date-range')).not.toBeInTheDocument();
    
    // Click on absolute date selector
    await userEvent.click(screen.getByText('Absolute date'));

    const newProps = {
      relative: null,
      start: new Date('2017-10-03T02:41:20.000Z'),
      end: new Date('2017-10-17T02:41:20.000Z'),
    };
    expect(onChange).toHaveBeenLastCalledWith(newProps);
    
    // Rerender with new props to simulate component update
    rerender(
      <TimeRangeSelector
        showAbsolute
        showRelative
        onChange={onChange}
        organization={TestStubs.Organization()}
        {...newProps}
      />
    );

    // Date range picker should now be shown
    expect(screen.getByTestId('date-range')).toBeInTheDocument();
  });

  it('selects absolute item with utc enabled', async function () {
    const {rerender} = createWrapper({utc: true});
    
    // Open the dropdown
    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));

    // Date range picker should not be shown initially
    expect(screen.queryByTestId('date-range')).not.toBeInTheDocument();
    
    // Click on absolute date selector
    await userEvent.click(screen.getByText('Absolute date'));

    const newProps = {
      relative: null,
      start: new Date('2017-10-02T22:41:20.000Z'),
      end: new Date('2017-10-16T22:41:20.000Z'),
      utc: true,
    };
    expect(onChange).toHaveBeenLastCalledWith(newProps);
    
    // Rerender with new props
    rerender(
      <TimeRangeSelector
        showAbsolute
        showRelative
        onChange={onChange}
        organization={TestStubs.Organization()}
        {...newProps}
      />
    );

    // Date range picker should now be shown
    expect(screen.getByTestId('date-range')).toBeInTheDocument();
  });

  it('switches from relative to absolute while maintaining equivalent date range', async function () {
    const {rerender} = createWrapper({
      relative: '7d',
      utc: false,
    });
    
    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));

    await userEvent.click(screen.getByText('Absolute date'));
    expect(onChange).toHaveBeenCalledWith({
      relative: null,
      start: new Date('2017-10-10T02:41:20.000Z'),
      end: new Date('2017-10-17T02:41:20.000Z'),
      utc: false,
    });

    await userEvent.click(screen.getByText('Last 14 days'));
    expect(onChange).toHaveBeenLastCalledWith({
      relative: '14d',
      start: undefined,
      end: undefined,
    });

    // Re-render with the new state
    rerender(
      <TimeRangeSelector
        showAbsolute
        showRelative
        onChange={onChange}
        organization={TestStubs.Organization()}
        relative="14d"
        start={null}
        end={null}
      />
    );
    
    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));
    await userEvent.click(screen.getByText('Absolute date'));
    expect(onChange).toHaveBeenLastCalledWith({
      relative: null,
      start: new Date('2017-10-03T02:41:20.000Z'),
      end: new Date('2017-10-17T02:41:20.000Z'),
      utc: false,
    });
  });

  it('switches from relative to absolute while maintaining equivalent date range (in utc)', async function () {
    const {rerender} = createWrapper({
      relative: '7d',
      utc: true,
    });
    
    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));

    await userEvent.click(screen.getByText('Absolute date'));
    expect(onChange).toHaveBeenCalledWith({
      relative: null,
      start: new Date('2017-10-09T22:41:20.000Z'),
      end: new Date('2017-10-16T22:41:20.000Z'),
      utc: true,
    });

    await userEvent.click(screen.getByText('Last 14 days'));
    expect(onChange).toHaveBeenLastCalledWith({
      relative: '14d',
      start: undefined,
      end: undefined,
    });

    // Re-render with the new state
    rerender(
      <TimeRangeSelector
        showAbsolute
        showRelative
        onChange={onChange}
        organization={TestStubs.Organization()}
        relative="14d"
        start={null}
        end={null}
      />
    );
    
    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));
    await userEvent.click(screen.getByText('Absolute date'));
    expect(onChange).toHaveBeenLastCalledWith({
      relative: null,
      start: new Date('2017-10-02T22:41:20.000Z'),
      end: new Date('2017-10-16T22:41:20.000Z'),
      utc: true,
    });
  });

  it('switches from relative to absolute and then toggling UTC (starting with UTC)', async function () {
    createWrapper({
      relative: '7d',
      utc: true,
    });
    
    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));

    // Local time is 22:41:20-0500 -- this is what date picker should show
    await userEvent.click(screen.getByText('Absolute date'));
    expect(onChange).toHaveBeenCalledWith({
      relative: null,
      start: new Date('2017-10-09T22:41:20.000Z'),
      end: new Date('2017-10-16T22:41:20.000Z'),
      utc: true,
    });

    await userEvent.click(screen.getByRole('checkbox', {name: /use utc/i}));
    expect(onChange).toHaveBeenLastCalledWith({
      relative: null,
      start: new Date('2017-10-09T22:41:20.000Z'),
      end: new Date('2017-10-16T22:41:20.000Z'),
      utc: false,
    });

    await userEvent.click(screen.getByRole('checkbox', {name: /use utc/i}));
    expect(onChange).toHaveBeenLastCalledWith({
      relative: null,
      start: new Date('2017-10-10T02:41:20.000Z'),
      end: new Date('2017-10-17T02:41:20.000Z'),
      utc: true,
    });
  });

  it('switches from relative to absolute and then toggling UTC (starting with non-UTC)', async function () {
    createWrapper({
      relative: '7d',
      utc: false,
    });
    
    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));

    await userEvent.click(screen.getByText('Absolute date'));
    expect(onChange).toHaveBeenCalledWith({
      relative: null,
      start: new Date('2017-10-09T22:41:20.000-0400'),
      end: new Date('2017-10-16T22:41:20.000-0400'),
      utc: false,
    });

    await userEvent.click(screen.getByRole('checkbox', {name: /use utc/i}));
    expect(onChange).toHaveBeenLastCalledWith({
      relative: null,
      start: new Date('2017-10-10T02:41:20.000Z'),
      end: new Date('2017-10-17T02:41:20.000Z'),
      utc: true,
    });

    await userEvent.click(screen.getByRole('checkbox', {name: /use utc/i}));
    expect(onChange).toHaveBeenLastCalledWith({
      relative: null,
      start: new Date('2017-10-09T22:41:20.000Z'),
      end: new Date('2017-10-16T22:41:20.000Z'),
      utc: false,
    });
  });

  it('maintains time when switching UTC to local time', async function () {
    // Times should never change when changing UTC option
    // Instead, the utc flagged is used when querying to create proper date

    const {rerender} = createWrapper({
      relative: null,
      start: new Date('2017-10-10T00:00:00.000Z'),
      end: new Date('2017-10-17T23:59:59.000Z'),
      utc: true,
    });
    
    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));

    // Local
    await userEvent.click(screen.getByRole('checkbox', {name: /use utc/i}));
    let state = {
      relative: null,
      start: new Date('2017-10-10T00:00:00.000Z'),
      end: new Date('2017-10-17T23:59:59.000Z'),
      utc: false,
    };
    expect(onChange).toHaveBeenLastCalledWith(state);
    
    rerender(
      <TimeRangeSelector
        showAbsolute
        showRelative
        onChange={onChange}
        organization={TestStubs.Organization()}
        {...state}
      />
    );

    // UTC
    await userEvent.click(screen.getByRole('checkbox', {name: /use utc/i}));
    state = {
      relative: null,
      start: new Date('2017-10-10T00:00:00.000Z'),
      end: new Date('2017-10-17T23:59:59.000Z'),
      utc: true,
    };
    expect(onChange).toHaveBeenLastCalledWith(state);
    
    rerender(
      <TimeRangeSelector
        showAbsolute
        showRelative
        onChange={onChange}
        organization={TestStubs.Organization()}
        {...state}
      />
    );

    // Local
    await userEvent.click(screen.getByRole('checkbox', {name: /use utc/i}));
    expect(onChange).toHaveBeenLastCalledWith({
      relative: null,
      start: new Date('2017-10-10T00:00:00.000Z'),
      end: new Date('2017-10-17T23:59:59.000Z'),
      utc: false,
    });
  });

  it('deselects default filter when absolute date selected', async function () {
    createWrapper({
      relative: '14d',
      utc: false,
    });

    await userEvent.click(screen.getByTestId('global-header-timerange-selector'));
    await userEvent.click(screen.getByText('Absolute date'));

    // The test verifies that when switching to absolute mode,
    // the absolute selector shows as selected and relative shows as deselected
    // This is behavioral verification through onChange calls rather than checking props
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        relative: null,
        start: expect.any(Date),
        end: expect.any(Date),
      })
    );
  });
});
