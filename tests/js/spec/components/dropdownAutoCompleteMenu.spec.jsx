import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import DropdownAutoCompleteMenu from 'app/components/dropdownAutoComplete/menu';

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

describe('DropdownAutoCompleteMenu', function () {
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

  it('renders without a group', function () {
    const {container} = renderWithTheme(
      <DropdownAutoCompleteMenu isOpen items={items}>
        {() => 'Click Me!'}
      </DropdownAutoCompleteMenu>
    );

    expect(screen.getByText('Click Me!')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Bacon')).toBeInTheDocument();
    expect(screen.getByText('Corn')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(
      container.querySelector('[data-test-id="autocomplete-list"]')
    ).toBeInTheDocument();
  });

  it('renders with a group', function () {
    const {container} = renderWithTheme(
      <DropdownAutoCompleteMenu
        isOpen
        items={[
          {
            id: 'countries',
            value: 'countries',
            label: 'countries',
            items: [
              {
                value: 'new zealand',
                label: <div>New Zealand</div>,
              },
              {
                value: 'australia',
                label: <div>Australia</div>,
              },
            ],
          },
        ]}
      >
        {() => 'Click Me!'}
      </DropdownAutoCompleteMenu>
    );

    expect(screen.getByText('Click Me!')).toBeInTheDocument();
    expect(screen.getByText('New Zealand')).toBeInTheDocument();
    expect(screen.getByText('Australia')).toBeInTheDocument();
    expect(
      container.querySelector('[data-test-id="autocomplete-list"]')
    ).toBeInTheDocument();
  });

  it('selects', async function () {
    const mock = jest.fn();
    const countries = [
      {
        value: 'new zealand',
        label: <div>New Zealand</div>,
      },
      {
        value: 'australia',
        label: <div>Australia</div>,
      },
    ];
    renderWithTheme(
      <DropdownAutoCompleteMenu
        isOpen
        items={[
          {
            id: 'countries',
            value: 'countries',
            label: 'countries',
            items: countries,
          },
        ]}
        onSelect={mock}
      >
        {({selectedItem}) => (selectedItem ? selectedItem.label : 'Click me!')}
      </DropdownAutoCompleteMenu>
    );

    await userEvent.click(screen.getByText('Australia'));

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(
      {index: 1, ...countries[1]},
      {highlightedIndex: 0, inputValue: '', isOpen: true, selectedItem: undefined},
      expect.anything()
    );
  });

  it('shows empty message when there are no items', function () {
    renderWithTheme(
      <DropdownAutoCompleteMenu
        items={[]}
        emptyMessage="No items!"
        emptyHidesInput
        isOpen
      >
        {({selectedItem}) => (selectedItem ? selectedItem.label : 'Click me!')}
      </DropdownAutoCompleteMenu>
    );

    expect(screen.getByText('No items!')).toBeInTheDocument();

    // No input because there are no items
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows default empty results message when there are no items found in search', async function () {
    renderWithTheme(
      <DropdownAutoCompleteMenu isOpen items={items} emptyMessage="No items!">
        {({selectedItem}) => (selectedItem ? selectedItem.label : 'Click me!')}
      </DropdownAutoCompleteMenu>
    );

    await userEvent.type(screen.getByRole('textbox'), 'U-S-A');
    expect(screen.getByText('No items! found')).toBeInTheDocument();
  });

  it('overrides default empty results message', async function () {
    renderWithTheme(
      <DropdownAutoCompleteMenu
        isOpen
        items={items}
        emptyMessage="No items!"
        noResultsMessage="No search results"
      >
        {({selectedItem}) => (selectedItem ? selectedItem.label : 'Click me!')}
      </DropdownAutoCompleteMenu>
    );

    await userEvent.type(screen.getByRole('textbox'), 'U-S-A');
    expect(screen.getByText('No search results')).toBeInTheDocument();
  });

  it('hides filter with `hideInput` prop', function () {
    renderWithTheme(
      <DropdownAutoCompleteMenu isOpen items={items} hideInput>
        {() => 'Click Me!'}
      </DropdownAutoCompleteMenu>
    );

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('filters using a value from prop instead of input', async function () {
    renderWithTheme(
      <DropdownAutoCompleteMenu isOpen items={items} filterValue="Apple">
        {() => 'Click Me!'}
      </DropdownAutoCompleteMenu>
    );

    await userEvent.type(screen.getByRole('textbox'), 'U-S-A');
    expect(screen.queryByText('No items! found')).not.toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Bacon')).not.toBeInTheDocument();
    expect(screen.queryByText('Corn')).not.toBeInTheDocument();
  });
});
