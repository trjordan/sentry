import React from 'react';

import {fireEvent, renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import BreadcrumbDropdown from 'app/views/settings/components/settingsBreadcrumb/breadcrumbDropdown';

jest.useFakeTimers();

const CLOSE_DELAY = 0;

describe('Settings Breadcrumb Dropdown', function () {
  const selectMock = jest.fn();
  const items = [
    {value: '1', label: 'foo'},
    {value: '2', label: 'bar'},
  ];
  const route = {name: 'Test', path: '/test'};

  beforeEach(function () {
    const router = TestStubs.router();
    renderWithTheme(
      <BreadcrumbDropdown
        items={items}
        name="Test"
        hasMenu
        onSelect={selectMock}
        route={route}
      />,
      {context: {router}}
    );
  });

  it('opens when hovered over crumb', function () {
    const crumb = screen.getByText('Test');
    fireEvent.mouseEnter(crumb);
    jest.runAllTimers();
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('closes after 200ms when mouse leaves crumb', function () {
    const crumb = screen.getByText('Test');
    fireEvent.mouseEnter(crumb);
    jest.runAllTimers();
    const menu = screen.getByTestId('autocomplete-list');
    expect(menu).toBeInTheDocument();

    fireEvent.mouseLeave(crumb);
    // wonder what happens when this arg is negative o_O
    jest.advanceTimersByTime(CLOSE_DELAY - 10);
    expect(screen.getByTestId('autocomplete-list')).toBeInTheDocument();
    jest.advanceTimersByTime(10);
    expect(screen.queryByTestId('autocomplete-list')).not.toBeInTheDocument();
  });

  it('closes immediately after selecting an item', function () {
    const crumb = screen.getByText('Test');
    fireEvent.mouseEnter(crumb);
    jest.runAllTimers();
    const menu = screen.getByTestId('autocomplete-list');
    expect(menu).toBeInTheDocument();

    const item = screen.getByText('foo');
    fireEvent.click(item);
    expect(screen.queryByTestId('autocomplete-list')).not.toBeInTheDocument();
  });

  it('stays open when hovered over crumb and then into dropdown menu', function () {
    const crumb = screen.getByText('Test');
    fireEvent.mouseEnter(crumb);
    jest.runAllTimers();
    const menu = screen.getByTestId('autocomplete-list');
    expect(menu).toBeInTheDocument();

    fireEvent.mouseLeave(crumb);
    fireEvent.mouseEnter(menu);
    jest.runAllTimers();
    expect(screen.getByTestId('autocomplete-list')).toBeInTheDocument();
  });

  it('closes after entering dropdown and then leaving dropdown', function () {
    const crumb = screen.getByText('Test');
    fireEvent.mouseEnter(crumb);
    jest.runAllTimers();
    const menu = screen.getByTestId('autocomplete-list');
    expect(menu).toBeInTheDocument();

    fireEvent.mouseLeave(crumb);
    fireEvent.mouseEnter(menu);
    jest.runAllTimers();
    expect(screen.getByTestId('autocomplete-list')).toBeInTheDocument();

    fireEvent.mouseLeave(menu);
    jest.runAllTimers();
    expect(screen.queryByTestId('autocomplete-list')).not.toBeInTheDocument();
  });
});
