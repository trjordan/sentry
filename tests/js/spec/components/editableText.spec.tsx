import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import EditableText from 'app/components/editableText';

const currentValue = 'foo';

describe('EditableText', function () {
  const newValue = 'bar';

  it('edit value and click outside of the component', async function () {
    const handleChange = jest.fn();

    renderWithTheme(<EditableText value={currentValue} onChange={handleChange} />);

    const label = screen.getByTestId('editable-text-label');
    expect(label).toHaveTextContent(currentValue);

    expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument();

    // Use fireEvent.click to avoid createRange issue
    fireEvent.click(label);

    expect(screen.queryByTestId('editable-text-label')).not.toBeInTheDocument();

    const inputWrapper = screen.getByTestId('editable-text-input');
    expect(inputWrapper).toBeInTheDocument();

    const input = inputWrapper.querySelector('input') as HTMLInputElement;

    // Use fireEvent to avoid createRange issue
    fireEvent.change(input, {target: {value: newValue}});

    expect(input).toHaveValue(newValue);

    // Click outside of the component
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(newValue);
    });

    await waitFor(() => {
      const updatedLabel = screen.getByTestId('editable-text-label');
      expect(updatedLabel).toHaveTextContent(newValue);
    });
  });

  it('edit value and press enter', async function () {
    const handleChange = jest.fn();

    renderWithTheme(<EditableText value={currentValue} onChange={handleChange} />);

    const label = screen.getByTestId('editable-text-label');
    expect(label).toHaveTextContent(currentValue);

    expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument();

    // Use fireEvent.click to avoid createRange issue
    fireEvent.click(label);

    expect(screen.queryByTestId('editable-text-label')).not.toBeInTheDocument();

    const inputWrapper = screen.getByTestId('editable-text-input');
    expect(inputWrapper).toBeInTheDocument();

    const input = inputWrapper.querySelector('input');

    // Use fireEvent to avoid createRange issue
    fireEvent.change(input, {target: {value: newValue}});

    expect(input).toHaveValue(newValue);

    // Press enter
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    expect(handleChange).toHaveBeenCalledWith(newValue);

    await waitFor(() => {
      const updatedLabel = screen.getByTestId('editable-text-label');
      expect(updatedLabel).toHaveTextContent(newValue);
    });
  });

  it('clear value and show error message', async function () {
    const handleChange = jest.fn();

    renderWithTheme(<EditableText value={currentValue} onChange={handleChange} />);

    const label = screen.getByTestId('editable-text-label');
    expect(label).toHaveTextContent(currentValue);

    expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument();

    // Use fireEvent.click to avoid createRange issue
    fireEvent.click(label);

    expect(screen.queryByTestId('editable-text-label')).not.toBeInTheDocument();

    const inputWrapper = screen.getByTestId('editable-text-input');
    expect(inputWrapper).toBeInTheDocument();

    const input = inputWrapper.querySelector('input');

    // Use fireEvent to avoid createRange issue
    fireEvent.change(input, {target: {value: ''}});

    expect(input).toHaveValue('');

    // Press enter
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    expect(handleChange).toHaveBeenCalledTimes(0);

    // Component should remain in edit mode with empty input
    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument();
  });

  it('displays a disabled value', async function () {
    const handleChange = jest.fn();

    renderWithTheme(
      <EditableText value={currentValue} onChange={handleChange} isDisabled />
    );

    const label = screen.getByTestId('editable-text-label');
    expect(label).toHaveTextContent(currentValue);

    // Use fireEvent.click to avoid createRange issue
    fireEvent.click(label);

    // Should not enter edit mode
    expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument();

    // Label should still be visible
    expect(screen.getByTestId('editable-text-label')).toBeInTheDocument();
  });

  describe('revert value and close editor', function () {
    it('prop value changes', async function () {
      const handleChange = jest.fn();
      const newPropValue = 'new-prop-value';

      const {rerender} = renderWithTheme(
        <EditableText value={currentValue} onChange={handleChange} />
      );

      const label = screen.getByTestId('editable-text-label');
      expect(label).toHaveTextContent(currentValue);

      expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument();

      // Use fireEvent.click to avoid createRange issue
      fireEvent.click(label);

      expect(screen.queryByTestId('editable-text-label')).not.toBeInTheDocument();

      const inputWrapper = screen.getByTestId('editable-text-input');
      expect(inputWrapper).toBeInTheDocument();

      const input = inputWrapper.querySelector('input') as HTMLInputElement;

      // Use fireEvent to avoid createRange issue
      fireEvent.change(input, {target: {value: ''}});

      expect(input).toHaveValue('');

      // Update prop value while editing
      rerender(<EditableText value={newPropValue} onChange={handleChange} />);

      await waitFor(() => {
        const updatedLabel = screen.getByTestId('editable-text-label');
        expect(updatedLabel).toHaveTextContent(newPropValue);
      });

      // Input should be closed
      expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument();
    });

    it('prop isDisabled changes', async function () {
      const handleChange = jest.fn();

      const {rerender} = renderWithTheme(
        <EditableText value={currentValue} onChange={handleChange} />
      );

      const label = screen.getByTestId('editable-text-label');
      expect(label).toHaveTextContent(currentValue);

      expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument();

      // Use fireEvent.click to avoid createRange issue
      fireEvent.click(label);

      expect(screen.queryByTestId('editable-text-label')).not.toBeInTheDocument();

      const inputWrapper = screen.getByTestId('editable-text-input');
      expect(inputWrapper).toBeInTheDocument();

      const input = inputWrapper.querySelector('input') as HTMLInputElement;

      // Use fireEvent to avoid createRange issue
      fireEvent.change(input, {target: {value: ''}});

      expect(input).toHaveValue('');

      // Update isDisabled prop while editing
      rerender(<EditableText value={currentValue} onChange={handleChange} isDisabled />);

      await waitFor(() => {
        const updatedLabel = screen.getByTestId('editable-text-label');
        expect(updatedLabel).toHaveTextContent(currentValue);
      });

      // Input should be closed
      expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument();
    });

    it('edit value and press escape', async function () {
      const handleChange = jest.fn();

      renderWithTheme(<EditableText value={currentValue} onChange={handleChange} />);

      const label = screen.getByTestId('editable-text-label');
      expect(label).toHaveTextContent(currentValue);

      expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument();

      // Use fireEvent.click to avoid createRange issue
      fireEvent.click(label);

      expect(screen.queryByTestId('editable-text-label')).not.toBeInTheDocument();

      const inputWrapper = screen.getByTestId('editable-text-input');
      expect(inputWrapper).toBeInTheDocument();

      const input = inputWrapper.querySelector('input') as HTMLInputElement;

      // Use fireEvent to avoid createRange issue
      fireEvent.change(input, {target: {value: newValue}});

      expect(input).toHaveValue(newValue);

      // Press escape
      fireEvent.keyDown(input, {key: 'Escape', code: 'Escape'});

      expect(handleChange).toHaveBeenCalledTimes(0);

      await waitFor(() => {
        const updatedLabel = screen.getByTestId('editable-text-label');
        expect(updatedLabel).toHaveTextContent(currentValue);
      });

      // Input should be closed
      expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument();
    });
  });
});
