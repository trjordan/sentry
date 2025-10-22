import React from 'react';

import {fireEvent, render, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import {
  addErrorMessage,
  addMessage,
  addSuccessMessage,
  clearIndicators,
} from 'app/actionCreators/indicator';
import Indicators from 'app/components/indicators';
import IndicatorStore from 'app/stores/indicatorStore';

// Make sure we use `duration: null` to test add/remove
jest.useFakeTimers();

jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  AnimatePresence: jest.fn(({children}) => children),
}));

describe('Indicators', function () {
  beforeEach(function () {
    render(<Indicators />);

    clearIndicators();
    jest.runAllTimers();
  });

  it('renders nothing by default', function () {
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('has a loading indicator by default', async function () {
    // when "type" is empty, we should treat it as loading state
    IndicatorStore.add('Loading');
    await waitFor(() => {
      const toast = document.querySelector('[data-test-id="toast-loading"]');
      expect(toast).toBeTruthy();
    });
  });

  it('adds and removes a toast by calling IndicatorStore directly', async function () {
    // when "type" is empty, we should treat it as loading state
    const indicator = IndicatorStore.add('Loading');
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast-loading"]')).toBeTruthy();
    });
    expect(screen.getByText('Loading')).toBeInTheDocument();

    jest.runAllTimers();
    expect(document.querySelector('[data-test-id="toast-loading"]')).toBeInTheDocument();

    // Old indicator gets replaced when a new one is added
    IndicatorStore.remove(indicator);
    jest.runAllTimers();
    expect(screen.queryByTestId('toast-loading')).toBeNull();
  });

  // This is a common pattern used throughout the code for API calls
  it('adds and replaces toast by calling IndicatorStore directly', async function () {
    IndicatorStore.add('Loading');
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast-loading"]')).toBeTruthy();
    });
    expect(screen.getByText('Loading')).toBeInTheDocument();

    // Old indicator gets replaced when a new one is added
    IndicatorStore.add('success', 'success');
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast-success"]')).toBeTruthy();
    });
    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('does not have loading indicator when "type" is empty (default)', async function () {
    addMessage('Loading', '', {duration: null});
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast"]')).toBeTruthy();
    });
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  it('has a loading indicator when type is "loading"', async function () {
    addMessage('Loading', 'loading', {duration: null});
    await waitFor(() => {
      expect(document.querySelector('.loading-indicator')).toBeTruthy();
    });
  });

  it('adds and removes toast by calling action creators', async function () {
    // action creators don't return anything
    addMessage('Loading', '', {duration: null});
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast"]')).toBeTruthy();
    });
    expect(screen.getByText('Loading')).toBeInTheDocument();

    // If no indicator is specified, will remove all indicators
    clearIndicators();
    jest.runAllTimers();
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('adds and replaces toast by calling action creators', async function () {
    addMessage('Loading', '', {duration: null});
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast"]')).toBeTruthy();
    });
    expect(screen.getByText('Loading')).toBeInTheDocument();

    // Old indicator gets replaced when a new one is added
    addMessage('success', 'success', {duration: null});
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast-success"]')).toBeTruthy();
    });
    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('adds and replaces toasts by calling action creators helpers', async function () {
    // Old indicator gets replaced when a new one is added
    addSuccessMessage('success');
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast-success"]')).toBeTruthy();
    });
    expect(screen.getByText('success')).toBeInTheDocument();

    clearIndicators();
    addErrorMessage('error');
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast-error"]')).toBeTruthy();
    });
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('appends toasts', async function () {
    addMessage('Loading', '', {append: true, duration: null});
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast"]')).toBeTruthy();
    });
    expect(screen.getByText('Loading')).toBeInTheDocument();

    addMessage('Success', 'success', {append: true, duration: null});
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast-success"]')).toBeTruthy();
    });
    expect(document.querySelector('[data-test-id="toast"]')).toBeInTheDocument();
    expect(document.querySelector('[data-test-id="toast-success"]')).toBeInTheDocument();
    // Toasts get appended to the end
    expect(screen.getByText('Success')).toBeInTheDocument();

    addMessage('Error', 'error', {append: true, duration: null});
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="toast-error"]')).toBeTruthy();
    });
    expect(document.querySelector('[data-test-id="toast"]')).toBeInTheDocument();
    expect(document.querySelector('[data-test-id="toast-success"]')).toBeInTheDocument();
    expect(document.querySelector('[data-test-id="toast-error"]')).toBeInTheDocument();
    // Toasts get appended to the end
    expect(screen.getByText('Error')).toBeInTheDocument();

    // clears all toasts
    clearIndicators();
    jest.runAllTimers();
    expect(screen.queryByTestId('toast')).toBeNull();
    expect(screen.queryByTestId('toast-success')).toBeNull();
    expect(screen.queryByTestId('toast-error')).toBeNull();
  });

  it('dismisses on click', function () {
    addMessage('Loading', '', {append: true, duration: null});
    jest.runAllTimers();
    expect(screen.getByTestId('toast')).toHaveTextContent('Loading');

    fireEvent.click(screen.getByTestId('toast'));
    jest.runAllTimers();
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('hides after 10s', function () {
    addMessage('Duration', '', {append: true, duration: 10000});
    jest.advanceTimersByTime(9000);
    expect(screen.getByTestId('toast')).toHaveTextContent('Duration');

    // Still visible
    jest.advanceTimersByTime(999);
    expect(screen.getByTestId('toast')).toHaveTextContent('Duration');

    jest.advanceTimersByTime(2);
    expect(screen.queryByTestId('toast')).toBeNull();
  });
});
