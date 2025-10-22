import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import {Form, SelectCreatableField} from 'app/components/forms';

describe('SelectCreatableField', function () {
  it('can add user input into select field when using options', async function () {
    const {container} = renderWithTheme(
      <SelectCreatableField options={[{value: 'foo', label: 'Foo'}]} name="fieldName" />
    );

    // react-select renders the input as a textbox, and without a label it has no accessible name
    const selectInput = container.querySelector(
      'input[id^="react-select-"][id$="-input"]'
    );
    await userEvent.type(selectInput, 'bar');

    // Text is in input
    expect(selectInput).toHaveValue('bar');

    // Click on create option
    await waitFor(() => {
      expect(screen.getByText(/Create "bar"/i)).toBeInTheDocument();
    });
    const createOption = screen.getByText(/Create "bar"/i);
    await userEvent.click(createOption);

    // Is active hidden input value
    await waitFor(() => {
      const hiddenInput = container.querySelector(
        'input[type="hidden"][name="fieldName"]'
      );
      expect(hiddenInput).toHaveValue('bar');
    });
  });

  it('can add user input into select field when using choices', async function () {
    const {container} = renderWithTheme(
      <SelectCreatableField choices={['foo']} name="fieldName" />
    );

    // react-select renders the input as a textbox, and without a label it has no accessible name
    const selectInput = container.querySelector(
      'input[id^="react-select-"][id$="-input"]'
    );
    await userEvent.type(selectInput, 'bar');

    // Text is in input
    expect(selectInput).toHaveValue('bar');

    // Click on create option
    await waitFor(() => {
      expect(screen.getByText(/Create "bar"/i)).toBeInTheDocument();
    });
    const createOption = screen.getByText(/Create "bar"/i);
    await userEvent.click(createOption);

    // Is active hidden input value
    await waitFor(() => {
      const hiddenInput = container.querySelector(
        'input[type="hidden"][name="fieldName"]'
      );
      expect(hiddenInput).toHaveValue('bar');
    });
  });

  it('can add user input into select field when using paired choices', async function () {
    const {container} = renderWithTheme(
      <SelectCreatableField choices={[['foo', 'foo']]} name="fieldName" />
    );

    // react-select renders the input as a textbox, and without a label it has no accessible name
    const selectInput = container.querySelector(
      'input[id^="react-select-"][id$="-input"]'
    );
    await userEvent.type(selectInput, 'bar');

    // Text is in input
    expect(selectInput).toHaveValue('bar');

    // Click on create option
    await waitFor(() => {
      expect(screen.getByText(/Create "bar"/i)).toBeInTheDocument();
    });
    const createOption = screen.getByText(/Create "bar"/i);
    await userEvent.click(createOption);

    // Is active hidden input value
    await waitFor(() => {
      const hiddenInput = container.querySelector(
        'input[type="hidden"][name="fieldName"]'
      );
      expect(hiddenInput).toHaveValue('bar');
    });
  });

  it('with Form context', async function () {
    const submitMock = jest.fn();
    const {container} = renderWithTheme(
      <Form onSubmit={submitMock}>
        <SelectCreatableField choices={[['foo', 'foo']]} name="fieldName" />
      </Form>
    );

    // react-select renders the input as a textbox, and without a label it has no accessible name
    const selectInput = container.querySelector(
      'input[id^="react-select-"][id$="-input"]'
    );
    await userEvent.type(selectInput, 'bar');

    // Text is in input
    expect(selectInput).toHaveValue('bar');

    // Click on create option
    await waitFor(() => {
      expect(screen.getByText(/Create "bar"/i)).toBeInTheDocument();
    });
    const createOption = screen.getByText(/Create "bar"/i);
    await userEvent.click(createOption);

    // Verify the value is set
    await waitFor(() => {
      const hiddenInput = container.querySelector(
        'input[type="hidden"][name="fieldName"]'
      );
      expect(hiddenInput).toHaveValue('bar');
    });

    fireEvent.submit(container.querySelector('form'));
    expect(submitMock).toHaveBeenCalledWith(
      {
        fieldName: 'bar',
      },
      expect.anything(),
      expect.anything()
    );
  });
});
