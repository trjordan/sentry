import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import {FormState, GenericField} from 'app/components/forms';

describe('GenericField', function () {
  it('renders text as TextInput', function () {
    renderWithTheme(
      <GenericField
        formState={FormState.READY}
        config={{
          name: 'field-name',
          label: 'field label',
          type: 'text',
        }}
      />
    );
    // TextField renders a textbox role input
    // Note: label includes asterisk because field is required by default
    expect(screen.getByRole('textbox', {name: 'field label*'})).toBeInTheDocument();
  });

  it('renders text with choices as SelectCreatableField', function () {
    renderWithTheme(
      <GenericField
        formState={FormState.READY}
        config={{
          name: 'field-name',
          label: 'field label',
          type: 'text',
          choices: [],
        }}
      />
    );
    // SelectCreatableField renders with a label and select input
    // Query by the label text to verify the field is rendered
    expect(screen.getByText('field label*')).toBeInTheDocument();
    // Verify the select container is present
    expect(screen.getByText('Select...')).toBeInTheDocument();
  });
});
