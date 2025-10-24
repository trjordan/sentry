import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import Button from 'app/components/button';

describe('Button', function () {
  it('renders', function () {
    const {container} = renderWithTheme(<Button priority="primary">Button</Button>);
    expect(container).toMatchSnapshot();
  });

  it('renders react-router link', function () {
    const {container} = renderWithTheme(<Button to="/some/route">Router Link</Button>);
    expect(container).toMatchSnapshot();
  });

  it('renders normal link', function () {
    const {container} = renderWithTheme(
      <Button href="/some/relative/url">Normal Link</Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders disabled normal link', function () {
    const {container} = renderWithTheme(
      <Button href="/some/relative/url">Normal Link</Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('calls `onClick` callback', async function () {
    const spy = jest.fn();
    renderWithTheme(<Button onClick={spy} />);

    await userEvent.click(screen.getByRole('button'));

    expect(spy).toHaveBeenCalled();
  });

  it('does not call `onClick` on disabled buttons', async function () {
    const spy = jest.fn();
    renderWithTheme(<Button onClick={spy} disabled />);

    await userEvent.click(screen.getByRole('button'));

    expect(spy).not.toHaveBeenCalled();
  });
});
