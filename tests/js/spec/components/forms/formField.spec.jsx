import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import Form from 'app/views/settings/components/forms/form';
import FormModel from 'app/views/settings/components/forms/model';
import TextField from 'app/views/settings/components/forms/textField';

describe('FormField + model', function () {
  let model;
  const routerContext = TestStubs.routerContext();

  beforeEach(function () {
    model = new FormModel();
  });

  it('renders with Form', function () {
    const {container} = renderWithTheme(
      <Form model={model}>
        <TextField name="fieldName" />
      </Form>,
      {context: routerContext.context}
    );
    expect(container).toSnapshot();
  });

  it('sets initial data in model', function () {
    renderWithTheme(
      <Form model={model} initialData={{fieldName: 'test'}}>
        <TextField name="fieldName" />
      </Form>,
      {context: routerContext.context}
    );

    expect(model.initialData.fieldName).toBe('test');
  });

  it('has `defaultValue` from field', function () {
    renderWithTheme(
      <Form model={model}>
        <TextField name="fieldName" defaultValue="foo" />
      </Form>,
      {context: routerContext.context}
    );

    expect(model.initialData.fieldName).toBe('foo');
    expect(model.fields.get('fieldName')).toBe('foo');
  });

  it('does not use `defaultValue` when there is initial data', function () {
    renderWithTheme(
      <Form model={model} initialData={{fieldName: 'test'}}>
        <TextField name="fieldName" defaultValue="foo" />
      </Form>,
      {context: routerContext.context}
    );

    expect(model.initialData.fieldName).toBe('test');
    expect(model.fields.get('fieldName')).toBe('test');
  });

  it('transforms `defaultValue` from field with `setValue`', function () {
    renderWithTheme(
      <Form model={model}>
        <TextField name="fieldName" defaultValue="foo" setValue={v => `${v}${v}`} />
      </Form>,
      {context: routerContext.context}
    );

    expect(model.initialData.fieldName).toBe('foofoo');
    expect(model.fields.get('fieldName')).toBe('foofoo');
  });

  it('sets field descriptor in model', function () {
    renderWithTheme(
      <Form model={model} initialData={{fieldName: 'test'}}>
        <TextField name="fieldName" required />
      </Form>,
      {context: routerContext.context}
    );

    expect(model.getDescriptor('fieldName', 'required')).toBe(true);
  });

  it('removes field descriptor in model on unmount', function () {
    const {unmount} = renderWithTheme(
      <Form model={model} initialData={{fieldName: 'test'}}>
        <TextField name="fieldName" required />
      </Form>,
      {context: routerContext.context}
    );
    expect(model.fieldDescriptor.has('fieldName')).toBe(true);

    unmount();
    expect(model.fieldDescriptor.has('fieldName')).toBe(false);
  });
});
