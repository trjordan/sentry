import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import DropdownMenu from 'app/components/dropdownMenu';

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

describe('DropdownMenu', function () {
  it('renders', function () {
    renderWithTheme(
      <DropdownMenu>
        {({getRootProps, getActorProps, getMenuProps, isOpen}) => (
          <span {...getRootProps({})}>
            <button {...getActorProps({})}>Open Dropdown</button>
            {isOpen && (
              <ul {...getMenuProps({})}>
                <li>Dropdown Menu Item 1</li>
              </ul>
            )}
          </span>
        )}
      </DropdownMenu>
    );

    expect(screen.getByText('Open Dropdown')).toBeInTheDocument();
  });

  it('can toggle dropdown menu with actor', async function () {
    const {container} = renderWithTheme(
      <DropdownMenu>
        {({getRootProps, getActorProps, getMenuProps, isOpen}) => (
          <span {...getRootProps({})}>
            <button {...getActorProps({})}>Open Dropdown</button>
            {isOpen && (
              <ul {...getMenuProps({})}>
                <li>Dropdown Menu Item 1</li>
              </ul>
            )}
          </span>
        )}
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText('Open Dropdown'));
    expect(container.querySelector('ul')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Open Dropdown'));
    expect(container.querySelector('ul')).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking on anything in menu', async function () {
    const {container} = renderWithTheme(
      <DropdownMenu>
        {({getRootProps, getActorProps, getMenuProps, isOpen}) => (
          <span {...getRootProps({})}>
            <button {...getActorProps({})}>Open Dropdown</button>
            {isOpen && (
              <ul {...getMenuProps({})}>
                <li>Dropdown Menu Item 1</li>
              </ul>
            )}
          </span>
        )}
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText('Open Dropdown'));
    await userEvent.click(screen.getByText('Dropdown Menu Item 1'));
    expect(container.querySelector('ul')).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking outside of menu', async function () {
    const {container} = renderWithTheme(
      <DropdownMenu>
        {({getRootProps, getActorProps, getMenuProps, isOpen}) => (
          <span {...getRootProps({})}>
            <button {...getActorProps({})}>Open Dropdown</button>
            {isOpen && (
              <ul {...getMenuProps({})}>
                <li>Dropdown Menu Item 1</li>
              </ul>
            )}
          </span>
        )}
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText('Open Dropdown'));
    await userEvent.click(document.body);

    // Wait for async close delay
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(container.querySelector('ul')).not.toBeInTheDocument();
  });

  it('closes dropdown when pressing escape', async function () {
    const {container} = renderWithTheme(
      <DropdownMenu>
        {({getRootProps, getActorProps, getMenuProps, isOpen}) => (
          <span {...getRootProps({})}>
            <button {...getActorProps({})}>Open Dropdown</button>
            {isOpen && (
              <ul {...getMenuProps({})}>
                <li>Dropdown Menu Item 1</li>
              </ul>
            )}
          </span>
        )}
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText('Open Dropdown'));
    expect(container.querySelector('ul')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(container.querySelector('ul')).not.toBeInTheDocument();
  });

  it('ignores "Escape" key if `closeOnEscape` is false', async function () {
    const {container} = renderWithTheme(
      <DropdownMenu closeOnEscape={false}>
        {({getRootProps, getActorProps, getMenuProps, isOpen}) => (
          <span {...getRootProps({})}>
            <button {...getActorProps({})}>Open Dropdown</button>
            {isOpen && (
              <ul {...getMenuProps({})}>
                <li>Dropdown Menu Item 1</li>
              </ul>
            )}
          </span>
        )}
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText('Open Dropdown'));
    expect(container.querySelector('ul')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('keeps dropdown open when clicking on anything in menu with `keepMenuOpen` prop', async function () {
    const {container} = renderWithTheme(
      <DropdownMenu keepMenuOpen>
        {({getRootProps, getActorProps, getMenuProps, isOpen}) => (
          <span {...getRootProps({})}>
            <button {...getActorProps({})}>Open Dropdown</button>
            {isOpen && (
              <ul {...getMenuProps({})}>
                <li>Dropdown Menu Item 1</li>
              </ul>
            )}
          </span>
        )}
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText('Open Dropdown'));
    await userEvent.click(screen.getByText('Dropdown Menu Item 1'));
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('render prop getters all extend props and call original onClick handlers', async function () {
    const rootClick = jest.fn();
    const actorClick = jest.fn();
    const menuClick = jest.fn();
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    const {container, unmount} = renderWithTheme(
      <DropdownMenu keepMenuOpen>
        {({getRootProps, getActorProps, getMenuProps, isOpen}) => (
          <span
            {...getRootProps({
              className: 'root',
              onClick: rootClick,
            })}
          >
            <button
              {...getActorProps({
                className: 'actor',
                onClick: actorClick,
              })}
            >
              Open Dropdown
            </button>
            {isOpen && (
              <ul
                {...getMenuProps({
                  className: 'menu',
                  onClick: menuClick,
                })}
              >
                <li>Dropdown Menu Item 1</li>
              </ul>
            )}
          </span>
        )}
      </DropdownMenu>
    );

    expect(container.querySelector('ul')).not.toBeInTheDocument();

    await userEvent.click(container.querySelector('span.root'));
    expect(rootClick).toHaveBeenCalled();
    await userEvent.click(screen.getByText('Open Dropdown'));
    expect(actorClick).toHaveBeenCalled();
    await userEvent.click(screen.getByText('Dropdown Menu Item 1'));
    expect(menuClick).toHaveBeenCalled();

    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(document.addEventListener).toHaveBeenCalled();

    unmount();
    expect(document.removeEventListener).toHaveBeenCalled();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('always rendered menus should attach document event listeners only when opened', async function () {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    renderWithTheme(
      <DropdownMenu alwaysRenderMenu>
        {({getRootProps, getActorProps, getMenuProps}) => (
          <span
            {...getRootProps({
              className: 'root',
            })}
          >
            <button
              {...getActorProps({
                className: 'actor',
              })}
            >
              Open Dropdown
            </button>
            <ul
              {...getMenuProps({
                className: 'menu',
              })}
            >
              <li>Dropdown Menu Item 1</li>
            </ul>
          </span>
        )}
      </DropdownMenu>
    );

    // Make sure this is only called when menu is open
    expect(document.addEventListener).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Open Dropdown'));
    expect(document.addEventListener).toHaveBeenCalled();

    const removeCallCountBefore = document.removeEventListener.mock.calls.length;
    await userEvent.click(screen.getByText('Open Dropdown'));
    expect(document.removeEventListener.mock.calls.length).toBeGreaterThan(
      removeCallCountBefore
    );

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('does not close nested dropdown on actor clicks', async function () {
    renderWithTheme(
      <DropdownMenu isNestedDropdown>
        {({getRootProps, getActorProps, getMenuProps}) => (
          <span {...getRootProps({})}>
            <button {...getActorProps({})}>Open Dropdown</button>
            {
              <ul {...getMenuProps({})}>
                <li data-testid="menu-item">Dropdown Menu Item 1</li>
              </ul>
            }
          </span>
        )}
      </DropdownMenu>
    );

    await userEvent.hover(screen.getByText('Open Dropdown'));
    expect(screen.getByTestId('menu-item')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Open Dropdown'));
    // Should still be visible.
    expect(screen.getByTestId('menu-item')).toBeInTheDocument();
  });
});
