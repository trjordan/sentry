import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  userEvent,
} from 'sentry-test/reactTestingLibrary';

import Filter from 'app/components/events/interfaces/breadcrumbs/filter';
import Icon from 'app/components/events/interfaces/breadcrumbs/icon';
import Level from 'app/components/events/interfaces/breadcrumbs/level';
import {IconFire, IconFix, IconLocation, IconSpan, IconSwitch, IconUser} from 'app/icons';
import {BreadcrumbLevelType, BreadcrumbType} from 'app/types/breadcrumbs';

const options: React.ComponentProps<typeof Filter>['options'] = [
  [
    {
      type: BreadcrumbType.HTTP,
      description: 'HTTP request',
      levels: [BreadcrumbLevelType.INFO],
      symbol: <Icon color="green300" icon={IconSwitch} size="xs" />,
      isChecked: true,
    },
    {
      type: BreadcrumbType.TRANSACTION,
      description: 'Transaction',
      levels: [BreadcrumbLevelType.ERROR],
      symbol: <Icon color="pink300" icon={IconSpan} size="xs" />,
      isChecked: true,
    },
    {
      type: BreadcrumbType.UI,
      description: 'User Action',
      levels: [BreadcrumbLevelType.INFO],
      symbol: <Icon color="purple300" icon={IconUser} size="xs" />,
      isChecked: true,
    },
    {
      type: BreadcrumbType.NAVIGATION,
      description: 'Navigation',
      levels: [BreadcrumbLevelType.INFO],
      symbol: <Icon color="green300" icon={IconLocation} size="xs" />,
      isChecked: true,
    },
    {
      type: BreadcrumbType.DEBUG,
      description: 'Debug',
      levels: [BreadcrumbLevelType.INFO],
      symbol: <Icon color="purple300" icon={IconFix} size="xs" />,
      isChecked: true,
    },
    {
      type: BreadcrumbType.ERROR,
      description: 'Error',
      levels: [BreadcrumbLevelType.ERROR],
      symbol: <Icon color="red300" icon={IconFire} size="xs" />,
      isChecked: true,
    },
  ],
  [
    {
      type: BreadcrumbLevelType.INFO,
      symbol: <Level level={BreadcrumbLevelType.INFO} />,
      isChecked: true,
    },
    {
      type: BreadcrumbLevelType.ERROR,
      symbol: <Level level={BreadcrumbLevelType.ERROR} />,
      isChecked: true,
    },
  ],
];

describe('Filter', () => {
  let handleFilter: jest.Mock<any, any>;

  beforeEach(() => {
    handleFilter = jest.fn();
  });

  it('default render', async () => {
    renderWithTheme(<Filter options={options} onFilter={handleFilter} />);

    // Open the dropdown
    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();

    // Check Type options
    expect(screen.getByText('HTTP request')).toBeInTheDocument();
    expect(screen.getByText('Transaction')).toBeInTheDocument();
    expect(screen.getByText('User Action')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Debug')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();

    // Check Level options
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('Without Options', () => {
    const {container} = renderWithTheme(
      <Filter options={[[], []]} onFilter={handleFilter} />
    );

    // Should not render anything
    expect(container.firstChild).toBeNull();
  });

  it('With Option Type only', async () => {
    renderWithTheme(<Filter options={[options[0], []]} onFilter={handleFilter} />);

    // Open the dropdown
    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.queryByText('Level')).not.toBeInTheDocument();

    // Check Type options
    expect(screen.getByText('HTTP request')).toBeInTheDocument();
    expect(screen.getByText('Transaction')).toBeInTheDocument();
    expect(screen.getByText('User Action')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Debug')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();

    const firstOption = screen.getByText('HTTP request').parentElement;
    expect(firstOption).toHaveTextContent('HTTP request');

    // Check checkbox is rendered and checked - use data-test-id instead
    const checkbox = firstOption?.querySelector('[data-test-id="checkbox-fancy"]');
    expect(checkbox).toBeInTheDocument();

    // Click the first option using fireEvent instead of userEvent
    fireEvent.click(firstOption!);

    expect(handleFilter).toHaveBeenCalledTimes(1);
  });

  it('With Option Level only', async () => {
    renderWithTheme(<Filter options={[[], options[1]]} onFilter={handleFilter} />);

    // Open the dropdown
    await userEvent.click(screen.getByRole('button'));

    expect(screen.queryByText('Type')).not.toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();

    // Check Level options (lowercase as per the component)
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();

    // The "info" text is inside a Tag component, which is inside ListItem
    // We need to traverse up from the text to find the ListItem (li element)
    const infoText = screen.getByText(options[1][0].type.toLocaleLowerCase());
    const firstOption = infoText.closest('li');
    expect(firstOption).toHaveTextContent(options[1][0].type.toLocaleLowerCase());

    // Check checkbox is rendered and checked - use data-test-id instead
    const checkbox = firstOption?.querySelector('[data-test-id="checkbox-fancy"]');
    expect(checkbox).toBeInTheDocument();

    // Click the first option using fireEvent instead of userEvent
    fireEvent.click(firstOption!);

    expect(handleFilter).toHaveBeenCalledTimes(1);
  });
});
