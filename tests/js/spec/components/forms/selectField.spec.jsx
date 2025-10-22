import React from 'react';

import {fireEvent, renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import {Form, SelectField} from 'app/components/forms';

describe('SelectField', function () {
  it('renders without form context', function () {
    const {container} = renderWithTheme(
      <SelectField
        options={[
          {label: 'a', value: 'a'},
          {label: 'b', value: 'b'},
        ]}
        name="fieldName"
        value="a"
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with flat choices', function () {
    const {container} = renderWithTheme(
      <Form initialData={{fieldName: 'fieldValue'}}>
        <SelectField choices={['a', 'b', 'c']} name="fieldName" />
      </Form>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with paired choices', function () {
    const {container} = renderWithTheme(
      <Form initialData={{fieldName: 'fieldValue'}}>
        <SelectField
          choices={[
            ['a', 'abc'],
            ['b', 'bcd'],
            ['c', 'cde'],
          ]}
          name="fieldName"
        />
      </Form>
    );
    expect(container).toMatchSnapshot();
  });

  it('can change value and submit', async function () {
    const mock = jest.fn();
    const {container} = renderWithTheme(
      <Form onSubmit={mock}>
        <SelectField
          options={[
            {label: 'a', value: 'a'},
            {label: 'b', value: 'b'},
          ]}
          name="fieldName"
        />
      </Form>
    );
    // Focus input and trigger keyDown to open menu  
    const input = container.querySelector('#id-fieldName input');
    input.focus();
    fireEvent.keyDown(input, {key: 'ArrowDown', code: 'ArrowDown'});
    
    const optionA = await screen.findByRole('option', {name: /a/i});
    fireEvent.click(optionA);

    fireEvent.submit(screen.getByRole('form'));
    expect(mock).toHaveBeenCalledWith(
      {fieldName: 'a'},
      expect.anything(),
      expect.anything()
    );
  });

  it('can set the value to empty string via props with no options', async function () {
    const mock = jest.fn();
    const {rerender, container} = renderWithTheme(
      <SelectField
        options={[
          {label: 'a', value: 'a'},
          {label: 'b', value: 'b'},
        ]}
        name="fieldName"
        onChange={mock}
      />
    );
    // Select a value so there is an option selected.
    const input = container.querySelector('#id-fieldName input');
    input.focus();
    fireEvent.keyDown(input, {key: 'ArrowDown', code: 'ArrowDown'});
    
    const optionA = await screen.findByRole('option', {name: /a/i});
    fireEvent.click(optionA);
    
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenLastCalledWith('a');

    // Update props to remove value and options.
    rerender(
      <SelectField
        value=""
        options={[]}
        name="fieldName"
        onChange={mock}
      />
    );
    const selectInput = container.querySelector('[name="fieldName"]');
    expect(selectInput).toHaveValue('');

    // second update.
    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock).toHaveBeenLastCalledWith('');
  });

  describe('Multiple', function () {
    it('selects multiple values and submits', async function () {
      const mock = jest.fn();
      const {container} = renderWithTheme(
        <Form onSubmit={mock}>
          <SelectField
            multiple
            options={[
              {label: 'a', value: 'a'},
              {label: 'b', value: 'b'},
            ]}
            name="fieldName"
          />
        </Form>
      );
      // Open the select dropdown by keyDown
      const input = container.querySelector('#id-fieldName input');
      input.focus();
      fireEvent.keyDown(input, {key: 'ArrowDown', code: 'ArrowDown'});
      
      const optionA = await screen.findByRole('option', {name: /a/i});
      fireEvent.click(optionA);

      fireEvent.submit(screen.getByRole('form'));
      expect(mock).toHaveBeenCalledWith(
        {fieldName: ['a']},
        expect.anything(),
        expect.anything()
      );
    });
  });
});
