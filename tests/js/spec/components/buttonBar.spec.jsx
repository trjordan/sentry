import React from 'react';

import {renderWithTheme, within} from 'sentry-test/reactTestingLibrary';

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
    const {container} = createWrapper();
    // Get the second button - the original test verified that ButtonBar
    // sets priority='primary' on the active button by checking the prop
    const buttons = within(container).getAllByRole('button');
    const secondButton = buttons[1];
    
    // Verify it's the correct button
    expect(secondButton).toHaveTextContent('Second Button');
    // In the original enzyme test: expect(wrapper.find('Button').at(1).prop('priority')).toBe('primary');
    // When ButtonBar sets priority='primary', it also adds the 'active' class.
    // This is the observable outcome we can verify with RTL.
    expect(secondButton).toHaveClass('active');
  });

  it('does not pass `barId` down to the button', function () {
    const {container} = createWrapper();
    // Get all buttons from the container
    const buttons = within(container).getAllByRole('button');
    // Check the second button (index 1)
    const secondButton = buttons[1];
    
    // Verify barId prop is not passed down to the DOM element
    expect(secondButton).not.toHaveAttribute('barId');
  });
});
