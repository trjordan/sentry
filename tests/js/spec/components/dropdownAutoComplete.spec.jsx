import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import DropdownAutoComplete from 'app/components/dropdownAutoComplete';

// Mock document.createRange which is used by userEvent
document.createRange = () => {
  const range = {
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    getBoundingClientRect: jest.fn(() => ({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
    })),
    getClientRects: jest.fn(() => []),
    cloneRange: jest.fn(function () {
      return this;
    }),
  };
  return range;
};

describe('DropdownAutoComplete', function () {
  const items = [
    {
      value: 'apple',
      label: <div>Apple</div>,
    },
    {
      value: 'bacon',
      label: <div>Bacon</div>,
    },
    {
      value: 'corn',
      label: <div>Corn</div>,
    },
  ];

  it('has actor wrapper', function () {
    renderWithTheme(
      <DropdownAutoComplete items={items}>{() => 'Click Me!'}</DropdownAutoComplete>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Click Me!');
  });

  it('opens dropdown menu when actor is clicked', async function () {
    const {container} = renderWithTheme(
      <DropdownAutoComplete items={items}>{() => 'Click Me!'}</DropdownAutoComplete>
    );
    await userEvent.click(screen.getByRole('button'));
    expect(
      container.querySelector('[data-test-id="autocomplete-list"]')
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));
    expect(
      container.querySelector('[data-test-id="autocomplete-list"]')
    ).toBeInTheDocument();
  });

  it('toggles dropdown menu when actor is clicked', async function () {
    const {container} = renderWithTheme(
      <DropdownAutoComplete allowActorToggle items={items}>
        {() => 'Click Me!'}
      </DropdownAutoComplete>
    );
    await userEvent.click(screen.getByRole('button'));
    expect(
      container.querySelector('[data-test-id="autocomplete-list"]')
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(
      container.querySelector('[data-test-id="autocomplete-list"]')
    ).not.toBeInTheDocument();
  });
});
