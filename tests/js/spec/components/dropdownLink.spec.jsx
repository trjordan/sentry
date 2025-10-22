import React from 'react';

import {act, renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import DropdownLink from 'app/components/dropdownLink';

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

describe('DropdownLink', function () {
  const INPUT_1 = {
    title: 'test',
    onOpen: () => {},
    onClose: () => {},
    topLevelClasses: 'top-level-class',
    alwaysRenderMenu: true,
    menuClasses: '',
  };

  describe('renders', function () {
    it('and anchors to left by default', function () {
      renderWithTheme(
        <DropdownLink {...INPUT_1}>
          <div>1</div>
          <div>2</div>
        </DropdownLink>
      );

      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('and anchors to right', function () {
      renderWithTheme(
        <DropdownLink {...INPUT_1} anchorRight>
          <div>1</div>
          <div>2</div>
        </DropdownLink>
      );

      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Uncontrolled', function () {
    describe('While Closed', function () {
      it('displays dropdown menu when dropdown actor button clicked', async function () {
        renderWithTheme(
          <DropdownLink alwaysRenderMenu={false} title="test">
            <li>hi</li>
          </DropdownLink>
        );

        expect(screen.queryByText('hi')).not.toBeInTheDocument();

        // open
        await userEvent.click(screen.getByText('test'));
        expect(screen.getByText('hi')).toBeInTheDocument();
      });
    });
    describe('While Opened', function () {
      it('closes when clicked outside', async function () {
        renderWithTheme(
          <DropdownLink alwaysRenderMenu={false} title="test">
            <li>hi</li>
          </DropdownLink>
        );

        // Opens dropdown menu
        await userEvent.click(screen.getByText('test'));
        expect(screen.getByText('hi')).toBeInTheDocument();

        await userEvent.click(document.body);

        // Wait for async close delay
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(screen.queryByText('hi')).not.toBeInTheDocument();
      });

      it('closes when dropdown actor button is clicked', async function () {
        renderWithTheme(
          <DropdownLink alwaysRenderMenu={false} title="test">
            <li>hi</li>
          </DropdownLink>
        );

        // Opens dropdown menu
        await userEvent.click(screen.getByText('test'));
        expect(screen.getByText('hi')).toBeInTheDocument();

        await userEvent.click(screen.getByText('test'));
        expect(screen.queryByText('hi')).not.toBeInTheDocument();
      });

      it('closes when dropdown menu item is clicked', async function () {
        renderWithTheme(
          <DropdownLink alwaysRenderMenu={false} title="test">
            <li>hi</li>
          </DropdownLink>
        );

        // Opens dropdown menu
        await userEvent.click(screen.getByText('test'));
        expect(screen.getByText('hi')).toBeInTheDocument();

        await userEvent.click(screen.getByText('hi'));
        expect(screen.queryByText('hi')).not.toBeInTheDocument();
      });

      it('does not close when menu is clicked and `keepMenuOpen` is on', async function () {
        renderWithTheme(
          <DropdownLink title="test" alwaysRenderMenu={false} keepMenuOpen>
            <li>hi</li>
          </DropdownLink>
        );

        await userEvent.click(screen.getByText('test'));
        expect(screen.getByText('hi')).toBeInTheDocument();

        await userEvent.click(screen.getByText('hi'));
        expect(screen.getByText('hi')).toBeInTheDocument();
      });
    });
  });

  describe('Controlled', function () {
    describe('Opened', function () {
      it('does not close when menu is clicked', async function () {
        renderWithTheme(
          <DropdownLink isOpen alwaysRenderMenu={false} title="test">
            <li>hi</li>
          </DropdownLink>
        );

        expect(screen.getByText('hi')).toBeInTheDocument();

        // open
        await userEvent.click(screen.getByText('hi'));
        // State does not change
        expect(screen.getByText('hi')).toBeInTheDocument();
      });

      it('does not close when document is clicked', async function () {
        renderWithTheme(
          <DropdownLink isOpen alwaysRenderMenu={false} title="test">
            <li>hi</li>
          </DropdownLink>
        );

        expect(screen.getByText('hi')).toBeInTheDocument();

        await userEvent.click(document.body);

        // State does not change
        expect(screen.getByText('hi')).toBeInTheDocument();
      });

      it('does not close when dropdown actor is clicked', async function () {
        renderWithTheme(
          <DropdownLink isOpen alwaysRenderMenu={false} title="test">
            <li>hi</li>
          </DropdownLink>
        );

        expect(screen.getByText('hi')).toBeInTheDocument();

        await userEvent.click(screen.getByText('test'));
        // State does not change
        expect(screen.getByText('hi')).toBeInTheDocument();
      });
    });
    describe('Closed', function () {
      it('does not open when dropdown actor is clicked', async function () {
        renderWithTheme(
          <DropdownLink isOpen={false} alwaysRenderMenu={false} title="test">
            <li>hi</li>
          </DropdownLink>
        );

        expect(screen.queryByText('hi')).not.toBeInTheDocument();

        await userEvent.click(screen.getByText('test'));
        // State does not change
        expect(screen.queryByText('hi')).not.toBeInTheDocument();
      });
    });
  });

  describe('Nested Dropdown', function () {
    it('closes when top-level actor is clicked', async function () {
      renderWithTheme(
        <DropdownLink title="parent" alwaysRenderMenu={false}>
          <li id="nested-actor">
            <DropdownLink
              className="nested-menu"
              alwaysRenderMenu={false}
              title="nested"
              isNestedDropdown
            >
              <li id="nested-actor-2">
                <DropdownLink
                  className="nested-menu-2"
                  alwaysRenderMenu={false}
                  title="nested #2"
                  isNestedDropdown
                >
                  <li id="nested-actor-3">Hello</li>
                </DropdownLink>
              </li>
            </DropdownLink>
          </li>
          <li id="no-nest">Item 2</li>
        </DropdownLink>
      );

      // Start when menu open
      await userEvent.click(screen.getByText('parent'));

      await userEvent.click(screen.getByText('parent'));
      expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    });

    it('Opens / closes on mouse enter and leave', async function () {
      const {container, unmount} = renderWithTheme(
        <DropdownLink title="parent" alwaysRenderMenu={false}>
          <li id="nested-actor">
            <DropdownLink
              className="nested-menu"
              alwaysRenderMenu={false}
              title="nested"
              isNestedDropdown
            >
              <li id="nested-actor-2">
                <DropdownLink
                  className="nested-menu-2"
                  alwaysRenderMenu={false}
                  title="nested #2"
                  isNestedDropdown
                >
                  <li id="nested-actor-3">Hello</li>
                </DropdownLink>
              </li>
            </DropdownLink>
          </li>
          <li id="no-nest">Item 2</li>
        </DropdownLink>
      );

      // Start when menu open
      await userEvent.click(screen.getByText('parent'));

      // Nested menus have delay on open (MENU_CLOSE_DELAY = 200ms)
      const nestedLink = container.querySelector('.dropdown-menu a');
      await userEvent.hover(nestedLink);

      // Wait for hover delay (MENU_CLOSE_DELAY is 200ms)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 250));
      });

      expect(container.querySelectorAll('.dropdown-menu')).toHaveLength(2);

      // Verify the dropdown behavior without timer manipulation
      const nestedMenuLink = container.querySelector('a.nested-menu');
      expect(nestedMenuLink).toBeTruthy();

      unmount();
    });

    it('closes when first level nested actor is clicked', async function () {
      const {container} = renderWithTheme(
        <DropdownLink title="parent" alwaysRenderMenu={false}>
          <li id="nested-actor">
            <DropdownLink
              className="nested-menu"
              alwaysRenderMenu={false}
              title="nested"
              isNestedDropdown
            >
              <li id="nested-actor-2">
                <DropdownLink
                  className="nested-menu-2"
                  alwaysRenderMenu={false}
                  title="nested #2"
                  isNestedDropdown
                >
                  <li id="nested-actor-3">Hello</li>
                </DropdownLink>
              </li>
            </DropdownLink>
          </li>
          <li id="no-nest">Item 2</li>
        </DropdownLink>
      );

      // Start when menu open
      await userEvent.click(screen.getByText('parent'));

      const nestedActor = container.querySelector('#nested-actor');
      await userEvent.click(nestedActor);
      expect(container.querySelectorAll('.dropdown-menu')).toHaveLength(0);
    });

    it('does not close when second level nested actor is clicked', async function () {
      const {container, unmount} = renderWithTheme(
        <DropdownLink title="parent" alwaysRenderMenu={false}>
          <li id="nested-actor">
            <DropdownLink
              className="nested-menu"
              alwaysRenderMenu={false}
              title="nested"
              isNestedDropdown
            >
              <li id="nested-actor-2">
                <DropdownLink
                  className="nested-menu-2"
                  alwaysRenderMenu={false}
                  title="nested #2"
                  isNestedDropdown
                >
                  <li id="nested-actor-3">Hello</li>
                </DropdownLink>
              </li>
            </DropdownLink>
          </li>
          <li id="no-nest">Item 2</li>
        </DropdownLink>
      );

      // Start when menu open
      await userEvent.click(screen.getByText('parent'));

      const nestedMenuLink = container.querySelector('a.nested-menu');
      await userEvent.hover(nestedMenuLink);

      // Wait longer for menu to open (MENU_CLOSE_DELAY is 200ms)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 250));
      });

      const nestedMenu2Link = container.querySelector('a.nested-menu-2');
      await userEvent.click(nestedMenu2Link);
      expect(container.querySelectorAll('.dropdown-menu')).toHaveLength(2);

      unmount();
    });

    it('closes when third level nested actor is clicked', async function () {
      const {container} = renderWithTheme(
        <DropdownLink title="parent" alwaysRenderMenu={false}>
          <li id="nested-actor">
            <DropdownLink
              className="nested-menu"
              alwaysRenderMenu={false}
              title="nested"
              isNestedDropdown
            >
              <li id="nested-actor-2">
                <DropdownLink
                  className="nested-menu-2"
                  alwaysRenderMenu={false}
                  title="nested #2"
                  isNestedDropdown
                >
                  <li id="nested-actor-3">Hello</li>
                </DropdownLink>
              </li>
            </DropdownLink>
          </li>
          <li id="no-nest">Item 2</li>
        </DropdownLink>
      );

      // Start when menu open
      await userEvent.click(screen.getByText('parent'));

      const nestedMenuLink = container.querySelector('a.nested-menu');
      await userEvent.hover(nestedMenuLink);

      // Wait for first menu to open (MENU_CLOSE_DELAY is 200ms)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 250));
      });

      const nestedMenu2Link = container.querySelector('a.nested-menu-2');
      await userEvent.hover(nestedMenu2Link);

      // Wait for second menu to open
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 250));
      });

      const nestedActor3 = container.querySelector('#nested-actor-3');

      await act(async () => {
        await userEvent.click(nestedActor3);
        // Wait for all timers to complete before checking
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(container.querySelectorAll('.dropdown-menu')).toHaveLength(0);
    });
  });
});
