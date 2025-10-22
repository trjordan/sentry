import React from 'react';

import {
  act,
  fireEvent,
  renderWithTheme,
  screen,
  tick,
  userEvent,
  waitFor,
  within,
} from 'sentry-test/reactTestingLibrary';

import * as incidentActions from 'app/actionCreators/serviceIncidents';
import SidebarContainer from 'app/components/sidebar';
import ConfigStore from 'app/stores/configStore';

jest.mock('app/actionCreators/serviceIncidents');

describe('Sidebar', function () {
  const organization = TestStubs.Organization();
  const router = TestStubs.router();
  const user = TestStubs.User();
  const apiMocks = {};

  const createWrapper = props =>
    renderWithTheme(
      <SidebarContainer
        organization={organization}
        user={user}
        router={router}
        location={{...router.location, ...{pathname: '/test/'}}}
        {...props}
      />
    );

  beforeEach(function () {
    apiMocks.broadcasts = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/broadcasts/`,
      body: [TestStubs.Broadcast()],
    });
    apiMocks.broadcastsMarkAsSeen = MockApiClient.addMockResponse({
      url: '/broadcasts/',
      method: 'PUT',
    });
    apiMocks.sdkUpdates = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/sdk-updates/`,
      body: [],
    });
  });

  it('renders', function () {
    renderWithTheme(
      <SidebarContainer organization={organization} user={user} router={router} />
    );

    expect(screen.getByRole('link', {name: 'Issues'})).toBeInTheDocument();
  });

  it('renders without org and router', async function () {
    const {container} = createWrapper({
      organization: null,
      router: null,
    });

    // no org displays user details
    expect(screen.getByText(user.name)).toBeInTheDocument();
    expect(screen.getByText(user.email)).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('sidebar-dropdown'));
    expect(container).toMatchSnapshot();
  });

  it('can toggle collapsed state', async function () {
    renderWithTheme(
      <SidebarContainer organization={organization} user={user} router={router} />
    );

    expect(screen.getByText(organization.name)).toBeInTheDocument();
    expect(screen.getByText(user.name)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('sidebar-collapse'));
    await tick();

    // Because of HoCs, we can't access the collapsed prop
    // Instead check for labels which don't exist in collapsed state
    expect(screen.queryByText('Issues')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('sidebar-collapse'));
    await tick();
    expect(screen.getByText('Issues')).toBeInTheDocument();
  });

  it('can have onboarding feature', async function () {
    renderWithTheme(
      <SidebarContainer
        organization={{...organization, features: ['onboarding']}}
        user={user}
        router={router}
      />
    );

    // Find the progress ring container which is the clickable element
    // Use getAllByText since onboarding may appear twice (panel title + menu)
    const quickStartElements = screen.getAllByText(/quick start/i);
    const onboardingContainer = quickStartElements[0].parentElement;
    expect(onboardingContainer).toBeInTheDocument();

    fireEvent.click(onboardingContainer);
    await tick();

    // Check that the task panel is visible - there will be 2 "Quick Start" texts
    expect(screen.getAllByText(/quick start/i).length).toBeGreaterThan(1);
  });

  describe('SidebarHelp', function () {
    it('can toggle help menu', async function () {
      const {container} = createWrapper();
      fireEvent.click(screen.getByTestId('help-sidebar'));
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(4);
      expect(container).toMatchSnapshot();
      
      fireEvent.click(screen.getByTestId('help-sidebar'));
      expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
    });
  });

  describe('SidebarDropdown', function () {
    it('can open Sidebar org/name dropdown menu', async function () {
      const {container} = createWrapper();
      fireEvent.click(screen.getByTestId('sidebar-dropdown'));
      
      expect(screen.getByText(/switch organization/i)).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it('has link to Members settings with `member:write`', async function () {
      let org = TestStubs.Organization();
      org = {
        ...org,
        access: [...org.access, 'member:read'],
      };

      createWrapper({
        organization: org,
      });
      fireEvent.click(screen.getByTestId('sidebar-dropdown'));
      
      expect(screen.getByRole('link', {name: /members/i})).toHaveAttribute(
        'href',
        '/settings/org-slug/members/'
      );
    });

    it('can open "Switch Organization" sub-menu', async function () {
      ConfigStore.set('features', new Set(['organizations:create']));
      jest.useFakeTimers();
      const {container} = createWrapper();
      
      act(() => {
        fireEvent.click(screen.getByTestId('sidebar-dropdown'));
      });
      
      fireEvent.mouseEnter(screen.getByTestId('sidebar-switch-org'));
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      expect(screen.getByTestId('sidebar-switch-org-menu')).toBeInTheDocument();
      expect(container).toMatchSnapshot();
      jest.useRealTimers();
    });

    it('has can logout', async function () {
      const mock = MockApiClient.addMockResponse({
        url: '/auth/',
        method: 'DELETE',
        status: 204,
      });
      jest.spyOn(window.location, 'assign').mockImplementation(() => {});

      let org = TestStubs.Organization();
      org = {
        ...org,
        access: [...org.access, 'member:read'],
      };

      createWrapper({
        organization: org,
        user: TestStubs.User(),
      });
      
      fireEvent.click(screen.getByTestId('sidebar-dropdown'));
      fireEvent.click(screen.getByTestId('sidebarSignout'));
      
      expect(mock).toHaveBeenCalled();

      await tick();
      expect(window.location.assign).toHaveBeenCalledWith('/auth/login/');
      window.location.assign.mockRestore();
    });
  });

  describe('SidebarPanel', function () {
    it('displays empty panel when there are no Broadcasts', async function () {
      MockApiClient.addMockResponse({
        url: `/organizations/${organization.slug}/broadcasts/`,
        body: [],
      });
      createWrapper();

      fireEvent.click(screen.getByTestId('sidebar-broadcasts'));
      await tick();

      expect(screen.getByText(/no broadcasts/i)).toBeInTheDocument();
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('can display Broadcasts panel and mark as seen', async function () {
      jest.useFakeTimers();
      const {container} = createWrapper();
      expect(apiMocks.broadcasts).toHaveBeenCalled();

      act(() => {
        fireEvent.click(screen.getByTestId('sidebar-broadcasts'));
      });

      // XXX: Need to do this for reflux since we're using fake timers
      act(() => {
        jest.advanceTimersByTime(0);
      });
      await Promise.resolve();

      expect(screen.getByTestId('sidebar-broadcasts-panel')).toBeInTheDocument();

      const panelItems = screen.getAllByRole('listitem');
      expect(panelItems).toHaveLength(1);
      
      expect(container.querySelector('[data-has-seen="false"]')).toBeInTheDocument();
      expect(container).toMatchSnapshot();

      // Should mark as seen after a delay
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      expect(apiMocks.broadcastsMarkAsSeen).toHaveBeenCalledWith(
        '/broadcasts/',
        expect.objectContaining({
          data: {
            hasSeen: '1',
          },
          query: {
            id: ['8'],
          },
        })
      );
      jest.useRealTimers();
    });

    it('can toggle display of Broadcasts SidebarPanel', async function () {
      createWrapper();

      // Show Broadcasts Panel
      fireEvent.click(screen.getByTestId('sidebar-broadcasts'));
      await tick();
      expect(screen.getByTestId('sidebar-broadcasts-panel')).toBeInTheDocument();

      // Hide Broadcasts Panel
      fireEvent.click(screen.getByTestId('sidebar-broadcasts'));
      await tick();
      expect(screen.queryByTestId('sidebar-broadcasts-panel')).not.toBeInTheDocument();
    });

    it('can unmount Sidebar (and Broadcasts) and kills Broadcast timers', async function () {
      jest.useFakeTimers();
      const {unmount} = createWrapper();

      // This will start timer to mark as seen
      act(() => {
        fireEvent.click(screen.getByTestId('sidebar-broadcasts'));
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Unmounting will cancel timers
      unmount();

      // This advances timers enough so that mark as seen should be called if it wasn't unmounted
      act(() => {
        jest.advanceTimersByTime(600);
      });
      expect(apiMocks.broadcastsMarkAsSeen).not.toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('can show Incidents in Sidebar Panel', async function () {
      incidentActions.loadIncidents = jest.fn(() => ({
        incidents: [TestStubs.ServiceIncident()],
      }));

      const {container} = createWrapper();
      await tick();

      const serviceIncidentsButton = screen.getByRole('button', {name: /service/i});
      fireEvent.click(serviceIncidentsButton);
      await tick();

      expect(screen.getByText(/incident/i)).toBeInTheDocument();
      expect(container.querySelector('[data-test-id="incident-list"]')).toMatchSnapshot();
    });

    it('hides when path changes', async function () {
      const {rerender} = createWrapper();

      fireEvent.click(screen.getByTestId('sidebar-broadcasts'));
      await tick();
      expect(screen.getByTestId('sidebar-broadcasts-panel')).toBeInTheDocument();

      rerender(
        <SidebarContainer
          organization={organization}
          user={user}
          router={router}
          location={{...router.location, pathname: 'new-path-name'}}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('sidebar-broadcasts-panel')).not.toBeInTheDocument();
      });
    });
  });
});
