import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import Button from 'app/components/button';

describe('Button', function () {
  it('renders', function () {
    renderWithTheme(<Button priority="primary">Button</Button>);
    expect(screen.getByRole('button', {name: 'Button'})).toBeInTheDocument();
  });

  it('renders react-router link', function () {
    renderWithTheme(<Button to="/some/route">Router Link</Button>);
    expect(screen.getByRole('button', {name: 'Router Link'})).toBeInTheDocument();
  });

  it('renders normal link', function () {
    renderWithTheme(<Button href="/some/relative/url">Normal Link</Button>);
    expect(screen.getByRole('button', {name: 'Normal Link'})).toBeInTheDocument();
  });

  it('renders disabled normal link', function () {
    renderWithTheme(
      <Button href="/some/relative/url" disabled>
        Normal Link
      </Button>
    );
    const button = screen.getByRole('button', {name: 'Normal Link'});
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-disabled', 'true');
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
