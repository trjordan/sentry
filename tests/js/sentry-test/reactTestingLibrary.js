import React from 'react';
import {cache} from '@emotion/css'; // eslint-disable-line emotion/no-vanilla
import {CacheProvider, ThemeProvider} from '@emotion/react';
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import GlobalModal from 'app/components/globalModal';
import {lightTheme} from 'app/utils/theme';

/**
 * Utility to wait for a single tick (for microtasks/promises to resolve).
 * Useful for waiting on async state updates or promise resolutions.
 *
 * @returns {Promise<void>}
 */
export const tick = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Renders a React component with the Sentry theme provider wrapper.
 * This is the RTL equivalent of mountWithTheme from Enzyme.
 *
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} options - Additional render options (no context support)
 * @returns {RenderResult} RTL render result
 */
export function renderWithTheme(ui, options) {
  const Wrapper = ({children}) => (
    <CacheProvider value={cache}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </CacheProvider>
  );

  return render(ui, {wrapper: Wrapper, ...options});
}

/**
 * Renders the GlobalModal component for testing modal interactions.
 * This is the RTL equivalent of mountGlobalModal from Enzyme.
 *
 * @returns {Promise<typeof screen>} Returns screen for querying modal content
 */
export async function renderGlobalModal() {
  renderWithTheme(<GlobalModal />);
  await tick();
  // No .update() needed - RTL automatically sees DOM changes
  // Return screen for consistency with RTL patterns
  return screen;
}

/**
 * Opens a react-select dropdown menu by clicking on it.
 *
 * @param {string} name - The accessible name (label) of the select component
 * @returns {Promise<void>}
 */
export async function openSelectMenu(name) {
  const selectInput = screen.getByRole('combobox', {name});
  await userEvent.click(selectInput);
  await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
}

/**
 * Selects an option from a react-select component by its visible label.
 *
 * @param {string} selectName - The accessible name (label) of the select component
 * @param {string} optionLabel - The label text of the option to select
 * @returns {Promise<void>}
 */
export async function selectByLabel(selectName, optionLabel) {
  await openSelectMenu(selectName);
  const option = screen.getByRole('option', {name: optionLabel});
  await userEvent.click(option);
}

/**
 * Selects an option from a react-select component by its value.
 * Note: This uses a regex match on the option name since react-select
 * may not expose the value directly in the accessible name.
 *
 * @param {string} selectName - The accessible name (label) of the select component
 * @param {string} value - The value of the option to select
 * @returns {Promise<void>}
 */
export async function selectByValue(selectName, value) {
  await openSelectMenu(selectName);
  // react-select options may need custom query if value isn't in accessible name
  const option = screen.getByRole('option', {name: new RegExp(value, 'i')});
  await userEvent.click(option);
}

/**
 * Selects an option from an async react-select after typing a query.
 * Useful for async/searchable select components that load options dynamically.
 *
 * @param {string} selectName - The accessible name (label) of the select component
 * @param {string} query - Text to type before selecting
 * @returns {Promise<void>}
 */
export async function selectByQuery(selectName, query) {
  const selectInput = screen.getByRole('combobox', {name: selectName});
  await userEvent.type(selectInput, query);
  await tick(); // Wait for async options to load
  const option = screen.getByRole('option', {name: new RegExp(query, 'i')});
  await userEvent.click(option);
}

/**
 * Changes the value of a react-mentions textarea.
 * React-mentions requires special handling for selection and activeElement.
 * This uses fireEvent instead of userEvent because react-mentions needs
 * precise low-level DOM manipulation.
 *
 * @param {string} value - The new value for the textarea
 * @param {Object} options - Optional selector options
 * @param {string} options.name - Accessible name if multiple textareas exist
 */
export function changeReactMentionsInput(value, options = {}) {
  const textarea = options.name
    ? screen.getByRole('textbox', {name: options.name})
    : screen.getByRole('textbox');

  // Focus the element (react-mentions checks document.activeElement)
  textarea.focus();

  // Set up selection (react-mentions requires non-zero width selection)
  textarea.selectionStart = 2;
  textarea.selectionEnd = 3;

  // Trigger select event
  fireEvent.select(textarea);

  // Update value and selection
  fireEvent.change(textarea, {target: {value}});
  textarea.selectionEnd = value.length;
}

// Re-export RTL utilities for convenience
export {screen, waitFor, within, fireEvent, userEvent, render};
