import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  tick,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import {Form, SelectAsyncField} from 'app/components/forms';

describe('SelectAsyncField', function () {
  let api;

  beforeEach(function () {
    api = MockApiClient.addMockResponse({
      url: '/foo/bar/',
      query: {
        autocomplete_query: 'baz',
        autocomplete_field: 'fieldName',
      },
      body: {
        fieldName: [{id: 'baz', text: 'Baz Label'}],
      },
    });
  });

  it('supports autocomplete arguments from an integration', async function () {
    const {container} = renderWithTheme(<SelectAsyncField url="/foo/bar/" name="fieldName" />);

    const selectInput = container.querySelector('#id-fieldName input[type="text"]');
    
    // Type into the input to trigger the async load
    await userEvent.type(selectInput, 'baz');

    // Wait for the API to be called
    await waitFor(() => {
      expect(api).toHaveBeenCalled();
    });

    // Wait for the response to be processed and options to appear
    await tick();

    // Wait for the option to appear in the menu - react-select options don't have proper role
    await waitFor(() => {
      expect(screen.getByText('Baz Label')).toBeInTheDocument();
    });
  });

  it('with Form context', async function () {
    const submitMock = jest.fn();
    const {container} = renderWithTheme(
      <Form onSubmit={submitMock}>
        <SelectAsyncField url="/foo/bar/" name="fieldName" />
      </Form>
    );

    const selectInput = container.querySelector('#id-fieldName input[type="text"]');
    
    // Type into the input to trigger the async load
    await userEvent.type(selectInput, 'baz');

    // Wait for the API to be called
    await waitFor(() => {
      expect(api).toHaveBeenCalled();
    });

    // Wait another tick for the response to be processed
    await tick();

    // Is in select menu - react-select options don't have proper role in some cases
    await waitFor(() => {
      expect(screen.getByText('Baz Label')).toBeInTheDocument();
    });

    // Select item - use container.querySelector for react-select option
    const option = container.querySelector('[id*="react-select"][id*="option"]');
    await userEvent.click(option);

    // SelectControl MUST have the value object, not just a simple value
    // otherwise it means that selecting an item that has been populated in the menu by
    // an async request will not work (nothing will appear selected).
    await waitFor(() => {
      const selectControl = container.querySelector('[name="fieldName"]');
      // Check that the select has a value displayed (the label should be visible in the control)
      expect(selectControl).toHaveValue('baz');
    });

    fireEvent.submit(screen.getByRole('form'));
    expect(submitMock).toHaveBeenCalledWith(
      {
        fieldName: 'baz',
      },
      expect.anything(),
      expect.anything()
    );
  });
});
