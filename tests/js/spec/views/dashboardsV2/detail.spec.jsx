import {browserHistory} from 'react-router';

import {initializeOrg} from 'sentry-test/initializeOrg';
import {
  fireEvent,
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
  within,
} from 'sentry-test/reactTestingLibrary';
import {renderGlobalModal} from 'sentry-test/reactTestingLibrary';

import DashboardDetail from 'app/views/dashboardsV2/detail';

describe('Dashboards > Detail', function () {
  const organization = TestStubs.Organization({
    features: ['global-views', 'dashboards-basic', 'dashboards-edit', 'discover-query'],
    projects: [TestStubs.Project()],
  });

  describe('prebuilt dashboards', function () {
    let initialData;
    const route = {};

    beforeEach(function () {
      initialData = initializeOrg({organization});

      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/tags/',
        body: [],
      });
      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/projects/',
        body: [TestStubs.Project()],
      });
      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/dashboards/',
        body: [
          TestStubs.Dashboard([], {id: 'default-overview', title: 'Default'}),
          TestStubs.Dashboard([], {id: '1', title: 'Custom Errors'}),
        ],
      });
      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/dashboards/default-overview/',
        body: TestStubs.Dashboard([], {id: 'default-overview', title: 'Default'}),
      });
    });

    afterEach(function () {
      MockApiClient.clearMockResponses();
    });

    it('can delete', async function () {
      const user = userEvent.setup();
      const deleteMock = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/dashboards/default-overview/',
        method: 'DELETE',
      });
      renderWithTheme(
        <DashboardDetail
          organization={initialData.organization}
          params={{orgId: 'org-slug', dashboardId: 'default-overview'}}
          router={initialData.router}
          route={route}
          location={initialData.router.location}
        />,
        {context: initialData.routerContext.context}
      );
      
      await waitFor(() => {
        expect(screen.getAllByText('Default').length).toBeGreaterThan(0);
      });

      // Enter edit mode.
      const editButton = screen.getByTestId('dashboard-edit');
      await user.click(editButton);

      renderGlobalModal();

      // Click delete, confirm will show
      const deleteButton = screen.getByTestId('dashboard-delete');
      await user.click(deleteButton);

      // Click confirm
      const confirmButton = await screen.findByRole('button', {name: /confirm/i});
      await user.click(confirmButton);

      expect(deleteMock).toHaveBeenCalled();
    });

    it('can rename and save', async function () {
      const user = userEvent.setup();
      const updateMock = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/dashboards/default-overview/',
        method: 'PUT',
        body: TestStubs.Dashboard([], {id: '8', title: 'Updated prebuilt'}),
      });
      renderWithTheme(
        <DashboardDetail
          organization={initialData.organization}
          params={{orgId: 'org-slug', dashboardId: 'default-overview'}}
          router={initialData.router}
          location={initialData.router.location}
        />,
        {context: initialData.routerContext.context}
      );

      await waitFor(() => {
        expect(screen.getAllByText('Default').length).toBeGreaterThan(0);
      });

      // Enter edit mode.
      const editButton = screen.getByTestId('dashboard-edit');
      await user.click(editButton);

      // Rename - click on the dashboard title
      const titleLabel = screen.getByText('Default');
      await user.click(titleLabel);

      const titleInput = screen.getByRole('textbox');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated prebuilt');

      // Press enter
      fireEvent.keyDown(titleInput, {key: 'Enter', code: 'Enter', charCode: 13});

      // Save changes
      const commitButton = screen.getByTestId('dashboard-commit');
      await user.click(commitButton);

      await waitFor(() => {
        expect(updateMock).toHaveBeenCalledWith(
          '/organizations/org-slug/dashboards/default-overview/',
          expect.objectContaining({
            data: expect.objectContaining({title: 'Updated prebuilt'}),
          })
        );
      });
      // Should redirect to the new dashboard.
      expect(browserHistory.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/organizations/org-slug/dashboards/8/',
        })
      );
    });

    it('disables buttons based on features', async function () {
      initialData = initializeOrg({
        organization: TestStubs.Organization({
          features: ['global-views', 'dashboards-basic', 'discover-query'],
          projects: [TestStubs.Project()],
        }),
      });

      renderWithTheme(
        <DashboardDetail
          organization={initialData.organization}
          params={{orgId: 'org-slug', dashboardId: 'default-overview'}}
          router={initialData.router}
          location={initialData.router.location}
        />,
        {context: initialData.routerContext.context}
      );

      await waitFor(() => {
        expect(screen.getAllByText('Default').length).toBeGreaterThan(0);
      });

      // Edit should be disabled
      const editButton = screen.getByTestId('dashboard-edit');
      expect(editButton).toBeDisabled();

      // Create should be disabled
      const createButton = screen.getByTestId('dashboard-create');
      expect(createButton).toBeDisabled();
    });
  });

  describe('custom dashboards', function () {
    let initialData;
    let widgets;
    const route = {};

    beforeEach(function () {
      initialData = initializeOrg({organization});
      widgets = [
        TestStubs.Widget(
          [{name: '', conditions: 'event.type:error', fields: ['count()']}],
          {
            title: 'Errors',
            interval: '1d',
            id: '1',
          }
        ),
        TestStubs.Widget(
          [{name: '', conditions: 'event.type:transaction', fields: ['count()']}],
          {
            title: 'Transactions',
            interval: '1d',
            id: '2',
          }
        ),
        TestStubs.Widget(
          [
            {
              name: '',
              conditions: 'event.type:transaction transaction:/api/cats',
              fields: ['p50()'],
            },
          ],
          {
            title: 'p50 of /api/cats',
            interval: '1d',
            id: '3',
          }
        ),
      ];

      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/tags/',
        body: [],
      });
      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/projects/',
        body: [TestStubs.Project()],
      });
      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/dashboards/',
        body: [
          TestStubs.Dashboard([], {id: 'default-overview', title: 'Default'}),
          TestStubs.Dashboard([], {id: '1', title: 'Custom Errors'}),
        ],
      });
      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/dashboards/1/',
        body: TestStubs.Dashboard(widgets, {id: '1', title: 'Custom Errors'}),
      });
      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-stats/',
        body: {data: []},
      });
    });

    afterEach(function () {
      MockApiClient.clearMockResponses();
    });

    it('can remove widgets', async function () {
      const user = userEvent.setup();
      const updateMock = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/dashboards/1/',
        method: 'PUT',
      });
      renderWithTheme(
        <DashboardDetail
          organization={initialData.organization}
          params={{orgId: 'org-slug', dashboardId: '1'}}
          router={initialData.router}
          route={route}
          location={initialData.router.location}
        />,
        {context: initialData.routerContext.context}
      );

      await screen.findByText('Custom Errors');

      // Enter edit mode.
      const editButton = screen.getByTestId('dashboard-edit');
      await user.click(editButton);

      // Remove the second and third widgets
      const deleteButtons = screen.getAllByTestId('widget-delete');
      await user.click(deleteButtons[1]);
      await user.click(deleteButtons[1]); // After first deletion, second widget moves to index 1

      // Save changes
      const commitButton = screen.getByTestId('dashboard-commit');
      await user.click(commitButton);

      await waitFor(() => {
        expect(updateMock).toHaveBeenCalledWith(
          '/organizations/org-slug/dashboards/1/',
          expect.objectContaining({
            data: expect.objectContaining({
              title: 'Custom Errors',
              widgets: [widgets[0]],
            }),
          })
        );
      });
    });

    it('can enter edit mode for widgets', async function () {
      const user = userEvent.setup();
      renderWithTheme(
        <DashboardDetail
          organization={initialData.organization}
          params={{orgId: 'org-slug', dashboardId: '1'}}
          router={initialData.router}
          route={route}
          location={initialData.router.location}
        />,
        {context: initialData.routerContext.context}
      );

      await screen.findByText('Custom Errors');

      // Enter edit mode.
      const editButton = screen.getByTestId('dashboard-edit');
      await user.click(editButton);

      // Edit the first widget
      const editButtons = screen.getAllByTestId('widget-edit');
      await user.click(editButtons[0]);

      renderGlobalModal();

      // Find the modal and check that it was passed the correct widget
      const modal = await screen.findByRole('dialog');
      expect(modal).toBeInTheDocument();
      
      // Verify the modal contains the widget's title
      expect(within(modal).getByDisplayValue('Errors')).toBeInTheDocument();
    });

    it('hides and shows manage dashboards based on feature', async function () {
      renderWithTheme(
        <DashboardDetail
          organization={initialData.organization}
          params={{orgId: 'org-slug', dashboardId: '1'}}
          router={initialData.router}
          location={initialData.router.location}
        />,
        {context: initialData.routerContext.context}
      );

      await screen.findByText('Custom Errors');

      expect(screen.queryByTestId('dashboard-manage')).not.toBeInTheDocument();

      const newOrg = initializeOrg({
        organization: TestStubs.Organization({
          features: [
            'global-views',
            'dashboards-basic',
            'dashboards-edit',
            'discover-query',
            'dashboards-manage',
          ],
          projects: [TestStubs.Project()],
        }),
      });

      renderWithTheme(
        <DashboardDetail
          organization={newOrg.organization}
          params={{orgId: 'org-slug', dashboardId: '1'}}
          router={newOrg.router}
          location={newOrg.router.location}
        />,
        {context: newOrg.routerContext.context}
      );

      await screen.findByText('Custom Errors');

      expect(screen.getByTestId('dashboard-manage')).toBeInTheDocument();
    });
  });
});
