import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import CheckboxFancy from 'app/components/checkboxFancy/checkboxFancy';

describe('CheckboxFancy', function () {
  it('renders', function () {
    const {container} = renderWithTheme(<CheckboxFancy />);
    expect(
      container.querySelector('[data-test-id="checkbox-fancy"]')
    ).toBeInTheDocument();
  });

  it('isChecked', function () {
    const {container} = renderWithTheme(<CheckboxFancy isChecked />);
    expect(
      container.querySelector('[data-test-id="icon-check-mark"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-test-id="icon-subtract"]')
    ).not.toBeInTheDocument();
  });

  it('isIndeterminate', function () {
    const {container} = renderWithTheme(<CheckboxFancy isIndeterminate />);
    expect(
      container.querySelector('[data-test-id="icon-check-mark"]')
    ).not.toBeInTheDocument();
    expect(container.querySelector('[data-test-id="icon-subtract"]')).toBeInTheDocument();
  });

  it('isDisabled', function () {
    const {container} = renderWithTheme(<CheckboxFancy isDisabled />);
    expect(
      container.querySelector('[data-test-id="icon-check-mark"]')
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-test-id="icon-subtract"]')
    ).not.toBeInTheDocument();
  });
});
