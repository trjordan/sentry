import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import ContextPickerModal from 'app/components/contextPickerModal';
import OrganizationsStore from 'app/stores/organizationsStore';
import OrganizationStore from 'app/stores/organizationStore';
import ProjectsStore from 'app/stores/projectsStore';

describe('ContextPickerModal', function () {
  let project, project2, project4, org, org2;
  const onFinish = jest.fn();

  beforeEach(function () {
    ProjectsStore.reset();
    MockApiClient.clearMockResponses();
    onFinish.mockReset();

    project = TestStubs.Project();
    org = TestStubs.Organization({projects: [project]});
    project2 = TestStubs.Project({slug: 'project2'});
    org2 = TestStubs.Organization({
      slug: 'org2',
      id: '21',
    });
    project4 = TestStubs.Project({slug: 'project4', isMember: false});
  });

  afterEach(async function () {
    OrganizationsStore.load([]);
    OrganizationStore.reset();
    await tick();
  });

  const getComponent = props => (
    <ContextPickerModal
      Header={() => <div />}
      Body="div"
      nextPath="/test/:orgId/path/"
      organizations={[org, org2]}
      needOrg
      onFinish={onFinish}
      {...props}
    />
  );

  it('renders with only org selector when no org is selected', function () {
    renderWithTheme(getComponent());

    expect(screen.getByText('Select an Organization')).toBeInTheDocument();
    expect(screen.queryByText('Select a Project to continue')).not.toBeInTheDocument();
  });

  it('calls onFinish, if project id is not needed, and only 1 org', async function () {
    OrganizationsStore.load([org2]);
    OrganizationStore.onUpdate(org2);
    MockApiClient.addMockResponse({
      url: `/organizations/${org2.slug}/projects/`,
      body: [],
    });
    renderWithTheme(getComponent());

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith('/test/org2/path/');
    });
  });

  it('calls onFinish if there is only 1 org and 1 project', async function () {
    expect(onFinish).not.toHaveBeenCalled();
    OrganizationsStore.load([org2]);
    OrganizationStore.onUpdate(org2);

    const fetchProjectsForOrg = MockApiClient.addMockResponse({
      url: `/organizations/${org2.slug}/projects/`,
      body: [project2],
    });

    renderWithTheme(
      getComponent({
        needOrg: true,
        needProject: true,
        nextPath: '/test/:orgId/path/:projectId/',
      })
    );

    expect(fetchProjectsForOrg).toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(onFinish).toHaveBeenLastCalledWith('/test/org2/path/project2/');
    });
  });

  it('selects an org and calls `onFinish` with URL with organization slug', async function () {
    OrganizationsStore.load([org]);
    MockApiClient.addMockResponse({
      url: `/organizations/${org.slug}/projects/`,
      body: [],
    });

    renderWithTheme(getComponent({}));

    // Find and click the organization select - click on the placeholder text
    const orgSelector = screen.getByText('Select an Organization');
    await userEvent.click(orgSelector);

    // Select org-slug option
    await userEvent.click(screen.getByText('org-slug'));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith('/test/org-slug/path/');
    });
  });

  it('renders with project selector and org selector selected when org is already selected', async function () {
    OrganizationStore.onUpdate(org);
    OrganizationsStore.load([org]);
    const fetchProjectsForOrg = MockApiClient.addMockResponse({
      url: `/organizations/${org.slug}/projects/`,
      body: [project, project2, project4],
    });

    renderWithTheme(
      getComponent({
        needOrg: true,
        needProject: true,
      })
    );

    await waitFor(() => {
      expect(fetchProjectsForOrg).toHaveBeenCalled();
    });

    // Check that the organization select shows the selected org
    // The org select has menuIsOpen so we can see the selected value in the menu
    // Use getAllByText since org.slug appears both in the select value and the menu
    expect(screen.getAllByText(org.slug).length).toBeGreaterThan(0);

    // Check that project selector is rendered
    expect(screen.getByText('Select a Project to continue')).toBeInTheDocument();

    // Verify the projects are available in the DOM
    // The select control renders options when opened - they're already visible due to menuIsOpen
    // Check member projects are displayed
    expect(screen.getByText(project.slug)).toBeInTheDocument();
    expect(screen.getByText(project2.slug)).toBeInTheDocument();
    // project4 should also be in the document but disabled
    expect(screen.getByText(project4.slug)).toBeInTheDocument();
  });

  it('can select org and project', async function () {
    const organizations = [
      {
        ...org,
        projects: [project],
      },
      {
        ...org2,
        projects: [project2, TestStubs.Project({slug: 'project3'})],
      },
    ];
    const fetchProjectsForOrg = MockApiClient.addMockResponse({
      url: `/organizations/${org2.slug}/projects/`,
      body: organizations[1].projects,
    });

    OrganizationsStore.load(organizations);

    renderWithTheme(
      getComponent({
        needOrg: true,
        needProject: true,
        nextPath: '/test/:orgId/path/:projectId/',
        organizations,
      })
    );

    // Should not have anything selected initially - click the org selector
    const orgSelector = screen.getByText('Select an Organization');
    await userEvent.click(orgSelector);

    // Select org2
    await userEvent.click(screen.getByText(org2.slug));

    // <Projects> will fetch projects for org2
    await waitFor(() => {
      expect(fetchProjectsForOrg).toHaveBeenCalled();
    });

    // Project selector should now be visible
    const projectSelector = await screen.findByText('Select a Project to continue');
    await userEvent.click(projectSelector);

    // Check that project options are available
    expect(screen.getByText(project2.slug)).toBeInTheDocument();
    expect(screen.getByText('project3')).toBeInTheDocument();

    // Select project3
    await userEvent.click(screen.getByText('project3'));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith('/test/org2/path/project3/');
    });
  });
});
