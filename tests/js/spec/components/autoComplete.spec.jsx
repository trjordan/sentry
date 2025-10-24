import React from 'react';

import {fireEvent, render, screen} from 'sentry-test/reactTestingLibrary';

import AutoComplete from 'app/components/autoComplete';

const items = [
  {
    name: 'Apple',
  },
  {
    name: 'Pineapple',
  },
  {
    name: 'Orange',
  },
];

/**
 * For every render, we push all injected params into `autoCompleteState`, we probably want to
 * assert against those instead of the component's internal state since component state will be different if we have
 * "controlled" props where <AutoComplete> does not handle state
 */
describe('AutoComplete', function () {
  let autoCompleteState = [];
  const mocks = {
    onSelect: jest.fn(),
    onClose: jest.fn(),
    onOpen: jest.fn(),
  };

  const createWrapper = props => {
    autoCompleteState = [];
    Object.keys(mocks).forEach(key => mocks[key].mockReset());

    // Unmount previous component
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    return render(
      <AutoComplete {...mocks} itemToString={item => item.name} {...props}>
        {injectedProps => {
          const {
            getRootProps,
            getInputProps,
            getMenuProps,
            getItemProps,
            inputValue,
            highlightedIndex,
            isOpen,
          } = injectedProps;

          // This is purely for testing
          autoCompleteState.push(injectedProps);

          return (
            <div {...getRootProps({style: {position: 'relative'}})}>
              <input {...getInputProps({})} />

              {isOpen && (
                <div
                  {...getMenuProps({
                    style: {
                      boxShadow:
                        '0 1px 4px 1px rgba(47,40,55,0.08), 0 4px 16px 0 rgba(47,40,55,0.12)',
                      position: 'absolute',
                      backgroundColor: 'white',
                      padding: '0',
                    },
                  })}
                >
                  <ul>
                    {items
                      .filter(
                        item =>
                          item.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                      )
                      .map((item, index) => (
                        <li
                          key={item.name}
                          {...getItemProps({
                            item,
                            index,
                            style: {
                              cursor: 'pointer',
                              padding: '6px 12px',
                              backgroundColor:
                                index === highlightedIndex
                                  ? 'rgba(0, 0, 0, 0.02)'
                                  : undefined,
                            },
                          })}
                        >
                          {item.name}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          );
        }}
      </AutoComplete>
    );
  };

  const getInput = () => screen.getByRole('textbox');
  const getListItems = () => screen.queryAllByRole('listitem');
  const getLatestState = () => autoCompleteState[autoCompleteState.length - 1];

  describe('Uncontrolled', function () {
    let input;

    beforeEach(() => {
      createWrapper();
      input = getInput();
    });

    it('shows dropdown menu when input has focus', function () {
      fireEvent.focus(input);
      const state = getLatestState();
      expect(state.isOpen).toBe(true);
      expect(getListItems()).toHaveLength(3);
    });

    it('only tries to close once if input is blurred and click outside occurs', async function () {
      jest.useFakeTimers();
      fireEvent.focus(input);
      fireEvent.blur(input);
      const state = getLatestState();
      expect(state.isOpen).toBe(true);
      expect(getListItems()).toHaveLength(3);

      // Simulate click outside via DropdownMenu's onClickOutside
      const dropdown = screen.getByRole('list').parentElement;
      fireEvent.click(dropdown.parentElement);

      jest.runAllTimers();
      await Promise.resolve();

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it('only calls onClose dropdown menu when input is blurred', function () {
      jest.useFakeTimers();
      fireEvent.focus(input);
      expect(getLatestState().isOpen).toBe(true);
      expect(getListItems()).toHaveLength(3);

      fireEvent.blur(input);
      jest.runAllTimers();

      expect(getListItems()).toHaveLength(0);
      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it('can close dropdown menu when Escape is pressed', function () {
      fireEvent.focus(input);
      expect(getLatestState().isOpen).toBe(true);

      fireEvent.keyDown(input, {key: 'Escape'});
      expect(getListItems()).toHaveLength(0);
    });

    it('can open and close dropdown menu using injected actions', function () {
      const [injectedProps] = autoCompleteState;
      injectedProps.actions.open();
      expect(getLatestState().isOpen).toBe(true);
      expect(mocks.onOpen).toHaveBeenCalledTimes(1);

      injectedProps.actions.close();
      expect(getListItems()).toHaveLength(0);
      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it('reopens dropdown menu after Escape is pressed and input is changed', function () {
      fireEvent.focus(input);
      expect(getLatestState().isOpen).toBe(true);

      fireEvent.keyDown(input, {key: 'Escape'});
      expect(getListItems()).toHaveLength(0);

      fireEvent.change(input, {target: {value: 'a'}});
      expect(getLatestState().isOpen).toBe(true);
      expect(getListItems()).toHaveLength(3);
    });

    it('reopens dropdown menu after item is selected and then input is changed', function () {
      fireEvent.focus(input);
      expect(getLatestState().isOpen).toBe(true);

      fireEvent.change(input, {target: {value: 'eapp'}});
      expect(getLatestState().isOpen).toBe(true);
      expect(getListItems()).toHaveLength(1);

      fireEvent.keyDown(input, {key: 'Enter'});
      expect(getListItems()).toHaveLength(0);

      fireEvent.change(input, {target: {value: ''}});
      fireEvent.change(input, {target: {value: 'app'}});
      expect(getLatestState().isOpen).toBe(true);
      expect(getListItems()).toHaveLength(2);
    });

    it('selects dropdown item by clicking and sets input to selected value', function () {
      fireEvent.focus(input);
      expect(getLatestState().isOpen).toBe(true);
      expect(getListItems()).toHaveLength(3);

      const listItems = getListItems();
      fireEvent.click(listItems[1]);

      expect(mocks.onSelect).toHaveBeenCalledWith(
        items[1],
        expect.objectContaining({inputValue: '', highlightedIndex: 0}),
        expect.anything()
      );

      expect(input.value).toBe('Pineapple');
      expect(getListItems()).toHaveLength(0);
    });

    it('can navigate dropdown items with keyboard and select with "Enter" keypress', function () {
      fireEvent.focus(input);
      expect(getLatestState().isOpen).toBe(true);
      expect(getLatestState().highlightedIndex).toBe(0);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(1);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(2);

      expect(getListItems()).toHaveLength(3);
      fireEvent.keyDown(input, {key: 'Enter'});

      expect(mocks.onSelect).toHaveBeenCalledWith(
        items[2],
        expect.objectContaining({inputValue: '', highlightedIndex: 2}),
        expect.anything()
      );
      expect(getListItems()).toHaveLength(0);
      expect(input.value).toBe('Orange');
    });

    it('respects list bounds when navigating filtered items with arrow keys', function () {
      fireEvent.focus(input);
      expect(getLatestState().isOpen).toBe(true);
      expect(getLatestState().highlightedIndex).toBe(0);

      fireEvent.keyDown(input, {key: 'ArrowUp'});
      expect(getLatestState().highlightedIndex).toBe(0);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(1);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(2);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(2);

      fireEvent.keyDown(input, {key: 'ArrowUp'});
      expect(getLatestState().highlightedIndex).toBe(1);

      fireEvent.keyDown(input, {key: 'ArrowUp'});
      expect(getLatestState().highlightedIndex).toBe(0);

      fireEvent.keyDown(input, {key: 'ArrowUp'});
      expect(getLatestState().highlightedIndex).toBe(0);

      expect(getListItems()).toHaveLength(3);
    });

    it('can filter items and then navigate with keyboard', function () {
      fireEvent.focus(input);
      expect(getLatestState().isOpen).toBe(true);
      expect(getLatestState().highlightedIndex).toBe(0);
      expect(getListItems()).toHaveLength(3);

      fireEvent.change(input, {target: {value: 'a'}});
      expect(getLatestState().highlightedIndex).toBe(0);
      expect(getLatestState().inputValue).toBe('a');
      // Apple, pineapple, orange
      expect(getListItems()).toHaveLength(3);

      fireEvent.change(input, {target: {value: 'ap'}});
      expect(getLatestState().highlightedIndex).toBe(0);
      expect(getLatestState().inputValue).toBe('ap');
      // Apple, pineapple
      expect(getListItems()).toHaveLength(2);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(1);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(1);
      expect(getListItems()).toHaveLength(2);

      fireEvent.keyDown(input, {key: 'Enter'});
      expect(mocks.onSelect).toHaveBeenCalledWith(
        items[1],
        expect.objectContaining({inputValue: 'ap', highlightedIndex: 1}),
        expect.anything()
      );
      expect(getListItems()).toHaveLength(0);
      expect(input.value).toBe('Pineapple');
    });

    it('can reset input when menu closes', function () {
      jest.useFakeTimers();
      createWrapper({resetInputOnClose: true});
      input = getInput();

      fireEvent.focus(input);
      expect(getLatestState().isOpen).toBe(true);

      fireEvent.change(input, {target: {value: 'a'}});
      expect(input.value).toBe('a');

      fireEvent.blur(input);
      jest.runAllTimers();
      expect(getListItems()).toHaveLength(0);
      expect(input.value).toBe('');
    });
  });

  describe('Controlled', function () {
    let input;

    beforeEach(function () {
      createWrapper({isOpen: true});
      input = getInput();
    });

    it('has dropdown menu initially open', function () {
      const state = getLatestState();
      expect(state.isOpen).toBe(true);
      expect(getListItems()).toHaveLength(3);
    });

    it('closes when props change', function () {
      const {rerender} = createWrapper({isOpen: false});

      rerender(
        <AutoComplete {...mocks} itemToString={item => item.name} isOpen={false}>
          {injectedProps => {
            const {
              getRootProps,
              getInputProps,
              getMenuProps,
              getItemProps,
              inputValue,
              highlightedIndex: _highlightedIndex,
              isOpen,
            } = injectedProps;

            autoCompleteState.push(injectedProps);

            return (
              <div {...getRootProps({style: {position: 'relative'}})}>
                <input {...getInputProps({})} />

                {isOpen && (
                  <div {...getMenuProps({})}>
                    <ul>
                      {items
                        .filter(
                          item =>
                            item.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                        )
                        .map((item, index) => (
                          <li
                            key={item.name}
                            {...getItemProps({
                              item,
                              index,
                            })}
                          >
                            {item.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          }}
        </AutoComplete>
      );

      // Menu should be closed
      expect(getListItems()).toHaveLength(0);
    });

    it('remains closed when input is focused, but calls `onOpen`', function () {
      createWrapper({isOpen: false});
      input = getInput();
      jest.useFakeTimers();

      expect(getLatestState().isOpen).toBe(false);

      fireEvent.focus(input);
      jest.runAllTimers();
      expect(getLatestState().isOpen).toBe(false);
      expect(getListItems()).toHaveLength(0);

      expect(mocks.onOpen).toHaveBeenCalledTimes(1);
    });

    it('remains open when input focus/blur events occur, but calls `onClose`', function () {
      jest.useFakeTimers();
      fireEvent.focus(input);
      fireEvent.blur(input);
      jest.runAllTimers();
      expect(getLatestState().isOpen).toBe(true);
      expect(getListItems()).toHaveLength(3);

      // This still gets called even though menu is open
      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape is pressed', function () {
      expect(getLatestState().isOpen).toBe(true);

      fireEvent.keyDown(input, {key: 'Escape'});
      expect(getLatestState().isOpen).toBe(true);
      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not open and close dropdown menu using injected actions', function () {
      const [injectedProps] = autoCompleteState;
      injectedProps.actions.open();
      expect(getLatestState().isOpen).toBe(true);
      expect(mocks.onOpen).toHaveBeenCalledTimes(1);

      injectedProps.actions.close();
      expect(getLatestState().isOpen).toBe(true);
      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it('onClose is called after item is selected', function () {
      expect(getLatestState().isOpen).toBe(true);

      fireEvent.change(input, {target: {value: 'eapp'}});
      expect(getLatestState().isOpen).toBe(true);
      expect(getListItems()).toHaveLength(1);

      fireEvent.keyDown(input, {key: 'Enter'});
      expect(getLatestState().isOpen).toBe(true);
      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it('selects dropdown item by clicking and sets input to selected value', function () {
      expect(getListItems()).toHaveLength(3);

      const listItems = getListItems();
      fireEvent.click(listItems[1]);

      expect(mocks.onSelect).toHaveBeenCalledWith(
        items[1],
        expect.objectContaining({inputValue: '', highlightedIndex: 0}),
        expect.anything()
      );

      expect(input.value).toBe('Pineapple');
      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it('can navigate dropdown items with keyboard and select with "Enter" keypress', function () {
      expect(getLatestState().isOpen).toBe(true);
      expect(getLatestState().highlightedIndex).toBe(0);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(1);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(2);

      expect(getListItems()).toHaveLength(3);
      fireEvent.keyDown(input, {key: 'Enter'});

      expect(mocks.onSelect).toHaveBeenCalledWith(
        items[2],
        expect.objectContaining({inputValue: '', highlightedIndex: 2}),
        expect.anything()
      );
      expect(mocks.onClose).toHaveBeenCalledTimes(1);
      expect(input.value).toBe('Orange');
    });

    it('respects list bounds when navigating filtered items with arrow keys', function () {
      expect(getLatestState().isOpen).toBe(true);
      expect(getLatestState().highlightedIndex).toBe(0);

      fireEvent.keyDown(input, {key: 'ArrowUp'});
      expect(getLatestState().highlightedIndex).toBe(0);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(1);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(2);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(2);

      fireEvent.keyDown(input, {key: 'ArrowUp'});
      expect(getLatestState().highlightedIndex).toBe(1);

      fireEvent.keyDown(input, {key: 'ArrowUp'});
      expect(getLatestState().highlightedIndex).toBe(0);

      fireEvent.keyDown(input, {key: 'ArrowUp'});
      expect(getLatestState().highlightedIndex).toBe(0);

      expect(getListItems()).toHaveLength(3);
    });

    it('can filter items and then navigate with keyboard', function () {
      expect(getLatestState().isOpen).toBe(true);
      expect(getLatestState().highlightedIndex).toBe(0);
      expect(getListItems()).toHaveLength(3);

      fireEvent.change(input, {target: {value: 'a'}});
      expect(getLatestState().highlightedIndex).toBe(0);
      expect(getLatestState().inputValue).toBe('a');
      // Apple, pineapple, orange
      expect(getListItems()).toHaveLength(3);

      fireEvent.change(input, {target: {value: 'ap'}});
      expect(getLatestState().highlightedIndex).toBe(0);
      expect(getLatestState().inputValue).toBe('ap');
      // Apple, pineapple
      expect(getListItems()).toHaveLength(2);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(1);

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(getLatestState().highlightedIndex).toBe(1);
      expect(getListItems()).toHaveLength(2);

      fireEvent.keyDown(input, {key: 'Enter'});
      expect(mocks.onSelect).toHaveBeenCalledWith(
        items[1],
        expect.objectContaining({inputValue: 'ap', highlightedIndex: 1}),
        expect.anything()
      );
      expect(mocks.onClose).toHaveBeenCalledTimes(1);
      expect(input.value).toBe('Pineapple');
    });
  });

  it('selects using enter key', function () {
    createWrapper({isOpen: true, shouldSelectWithEnter: false});
    let input = getInput();
    fireEvent.change(input, {target: {value: 'pine'}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(mocks.onSelect).not.toHaveBeenCalled();

    createWrapper({isOpen: true, shouldSelectWithEnter: true});
    input = getInput();
    fireEvent.change(input, {target: {value: 'pine'}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(mocks.onSelect).toHaveBeenCalledWith(
      items[1],
      expect.objectContaining({inputValue: 'pine', highlightedIndex: 0}),
      expect.anything()
    );
    expect(mocks.onClose).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('Pineapple');
  });

  it('selects using tab key', function () {
    createWrapper({isOpen: true, shouldSelectWithTab: false});
    let input = getInput();
    fireEvent.change(input, {target: {value: 'pine'}});
    fireEvent.keyDown(input, {key: 'Tab'});
    expect(mocks.onSelect).not.toHaveBeenCalled();

    createWrapper({isOpen: true, shouldSelectWithTab: true});
    input = getInput();
    fireEvent.change(input, {target: {value: 'pine'}});
    fireEvent.keyDown(input, {key: 'Tab'});
    expect(mocks.onSelect).toHaveBeenCalledWith(
      items[1],
      expect.objectContaining({inputValue: 'pine', highlightedIndex: 0}),
      expect.anything()
    );
    expect(mocks.onClose).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('Pineapple');
  });

  it('does not reset highlight state if `closeOnSelect` is false and we select a new item', function () {
    jest.useFakeTimers();
    createWrapper({closeOnSelect: false});
    const input = getInput();

    fireEvent.focus(input);
    expect(getLatestState().isOpen).toBe(true);

    fireEvent.keyDown(input, {key: 'ArrowDown'});
    expect(getLatestState().highlightedIndex).toBe(1);

    // Select item
    fireEvent.keyDown(input, {key: 'Enter'});

    // Should still remain open with same highlightedIndex
    expect(getLatestState().highlightedIndex).toBe(1);
    expect(getLatestState().isOpen).toBe(true);

    fireEvent.keyDown(input, {key: 'ArrowDown'});
    expect(getLatestState().highlightedIndex).toBe(2);

    // Select item
    fireEvent.keyDown(input, {key: 'Enter'});

    // Should still remain open with same highlightedIndex
    expect(getLatestState().highlightedIndex).toBe(2);
    expect(getLatestState().isOpen).toBe(true);
  });
});
