import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import Button from 'app/components/button';
import ButtonBar from 'app/components/buttonBar';

describe('ButtonBar', function () {
  const createWrapper = () =>
    renderWithTheme(
      <ButtonBar active="2" merged>
        <Button barId="1">First Button</Button>
        <Button barId="2">Second Button</Button>
        <Button barId="3">Third Button</Button>
        <Button barId="4">Fourth Button</Button>
      </ButtonBar>
    );

  it('has "Second Button" as the active button in the bar', function () {
    createWrapper();
    const secondButton = screen.getByRole('button', {name: 'Second Button'});
    expect(secondButton).toHaveClass('active');
  });

  it('does not pass `barId` down to the button', function () {
    createWrapper();
    const secondButton = screen.getByRole('button', {name: 'Second Button'});
    expect(secondButton).not.toHaveAttribute('barId');
  });
});
