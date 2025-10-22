import React from 'react';

import {act, renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import {SwitchOrganization} from 'app/components/sidebar/sidebarDropdown/switchOrganization';

describe('SwitchOrganization', function () {
  const routerContext = TestStubs.routerContext();
  const {organization} = routerContext.context;

  it('can list organizations', async function () {
    renderWithTheme(
      <SwitchOrganization
        organizations={[organization, TestStubs.Organization({slug: 'org2'})]}
      />,
      {context: routerContext.context}
    );

    await userEvent.hover(screen.getByTestId('sidebar-switch-org'));

    // Wait for hover delay (500ms)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 550));
    });

    expect(screen.getByTestId('sidebar-switch-org-menu')).toBeInTheDocument();
    // SidebarMenuItem renders as links with role='link'
    const orgLinks = screen.getAllByRole('link');
    expect(orgLinks).toHaveLength(2);
  });

  it('shows "Create an Org" if they have permission', async function () {
    renderWithTheme(
      <SwitchOrganization
        organizations={[organization, TestStubs.Organization({slug: 'org2'})]}
        canCreateOrganization
      />,
      {context: routerContext.context}
    );

    await userEvent.hover(screen.getByTestId('sidebar-switch-org'));

    // Wait for hover delay (500ms)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 550));
    });

    expect(screen.getByTestId('sidebar-create-org')).toBeInTheDocument();
  });

  it('does not have "Create an Org" if they do not have permission', async function () {
    renderWithTheme(
      <SwitchOrganization
        organizations={[organization, TestStubs.Organization({slug: 'org2'})]}
        canCreateOrganization={false}
      />,
      {context: routerContext.context}
    );

    await userEvent.hover(screen.getByTestId('sidebar-switch-org'));

    // Wait for hover delay (500ms)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 550));
    });

    expect(screen.queryByTestId('sidebar-create-org')).not.toBeInTheDocument();
  });
});
