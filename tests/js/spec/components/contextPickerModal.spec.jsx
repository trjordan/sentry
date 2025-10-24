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

  afterEach(function () {
    OrganizationsStore.load([]);
    OrganizationStore.reset();
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

    const {container} = renderWithTheme(
      getComponent({
        needOrg: true,
        needProject: true,
      })
    );

    await waitFor(() => {
      expect(fetchProjectsForOrg).toHaveBeenCalled();
    });

    // Check that the organization select shows the selected org value
    // The SelectControl with menuIsOpen displays the selected value in a singleValue element
    const orgSelectValue = container
      .querySelector('[name="organization"]')
      .closest('.css-2b097c-container')
      .querySelector('.css-ll8f4p-singleValue');
    expect(orgSelectValue).toHaveTextContent(org.slug);

    // Check that project selector is rendered
    expect(screen.getByText('Select a Project to continue')).toBeInTheDocument();

    // Verify the project options structure - check that projects are grouped correctly
    // "My Projects" section with member projects
    const myProjectsHeader = screen.getByText('My Projects');
    expect(myProjectsHeader).toBeInTheDocument();

    // "All Projects" section header
    const allProjectsHeader = screen.getByText('All Projects');
    expect(allProjectsHeader).toBeInTheDocument();

    // Member projects (project and project2) should be in My Projects section
    // Find all project options - there may be org options too, so filter
    const allOptions = container.querySelectorAll('[id*="react-select"][id*="option"]');
    const projectOptions = Array.from(allOptions).filter(opt => {
      // Filter out organization options - they would be in a different select control
      const text = opt.textContent;
      return text === project.slug || text === project2.slug || text === project4.slug;
    });

    // Verify we have 3 projects total (2 member + 1 non-member)
    expect(projectOptions.length).toBe(3);

    // Find options by checking their ID attributes and verifying aria-disabled state
    let project1Option, project2Option, project4Option;
    projectOptions.forEach(option => {
      const text = option.textContent;
      if (text === project.slug) {
        project1Option = option;
      } else if (text === project2.slug) {
        project2Option = option;
      } else if (text === project4.slug) {
        project4Option = option;
      }
    });

    // Verify member projects are not disabled (aria-disabled should not be true)
    expect(project1Option).toBeTruthy();
    expect(project1Option.getAttribute('aria-disabled')).not.toBe('true');

    expect(project2Option).toBeTruthy();
    expect(project2Option.getAttribute('aria-disabled')).not.toBe('true');

    // Verify project4 is disabled - check using the class or disabled styling
    expect(project4Option).toBeTruthy();
    // The disabled option should have pointer-events none or reduced opacity
    const project4Styles = window.getComputedStyle(project4Option);
    // Check for the disabled styling (opacity 0.6 from the selectStyles in contextPickerModal.tsx)
    const isDisabled =
      project4Styles.pointerEvents === 'none' ||
      project4Styles.opacity === '0.6' ||
      project4Option.getAttribute('aria-disabled') === 'true';
    expect(isDisabled).toBe(true);

    // Get the indexes to verify grouping
    const allGroups = container.querySelectorAll('[class*="Group"]');
    expect(allGroups.length).toBe(2); // Should have exactly 2 groups

    // First group should be "My Projects"
    expect(allGroups[0]).toContainElement(myProjectsHeader);
    // Second group should be "All Projects"
    expect(allGroups[1]).toContainElement(allProjectsHeader);

    // Verify that member projects come before project4 in the option list
    const optionsArray = Array.from(projectOptions);
    const project1Index = optionsArray.findIndex(opt => opt.textContent === project.slug);
    const project2Index = optionsArray.findIndex(
      opt => opt.textContent === project2.slug
    );
    const project4Index = optionsArray.findIndex(
      opt => opt.textContent === project4.slug
    );

    // Member projects should have lower indices (come first)
    expect(project1Index).toBeLessThan(project4Index);
    expect(project2Index).toBeLessThan(project4Index);
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

    const {container} = renderWithTheme(
      getComponent({
        needOrg: true,
        needProject: true,
        nextPath: '/test/:orgId/path/:projectId/',
        organizations,
      })
    );

    // Should not have anything selected initially - check that no org is displayed in the control
    const orgSelector = screen.getByText('Select an Organization');
    expect(orgSelector).toBeInTheDocument();
    // No org.slug or org2.slug should be selected yet (they may be in the menu but not as the value)
    const orgInput = container.querySelector('input[name="organization"]');
    expect(orgInput?.value || '').toBe('');

    // Select org2
    await userEvent.click(orgSelector);
    await userEvent.click(screen.getByText(org2.slug));

    // <Projects> will fetch projects for org2
    await waitFor(() => {
      expect(fetchProjectsForOrg).toHaveBeenCalled();
    });

    // Project selector should now be visible with projects
    await waitFor(() => {
      expect(screen.getByText('Select a Project to continue')).toBeInTheDocument();
    });

    // Verify the project options structure for org2
    // org2's projects (project2 and project3) should all be member projects
    const myProjectsHeader = screen.getByText('My Projects');
    expect(myProjectsHeader).toBeInTheDocument();

    // Both project2 and project3 should be in "My Projects"
    expect(screen.getByText(project2.slug)).toBeInTheDocument();
    expect(screen.getByText('project3')).toBeInTheDocument();

    // Verify they're not disabled - member projects don't have aria-disabled set, or it's null
    const allOptions = container.querySelectorAll('[id*="react-select"][id*="option"]');
    const projectOptionsForOrg2 = Array.from(allOptions).filter(opt => {
      const text = opt.textContent;
      return text === project2.slug || text === 'project3';
    });

    // Verify we have 2 projects (both member projects)
    expect(projectOptionsForOrg2.length).toBe(2);

    // Verify neither is disabled
    projectOptionsForOrg2.forEach(opt => {
      expect(opt.getAttribute('aria-disabled')).not.toBe('true');
    });

    // "All Projects" section should exist but be empty
    // Since all projects are member projects, the "All Projects" group may still exist with empty options
    const allProjectsHeader = container.querySelector('[id*="group-1-heading"]');
    if (allProjectsHeader) {
      // If the header exists, it should say "All Projects"
      expect(allProjectsHeader).toHaveTextContent('All Projects');
    }

    // Verify both projects are in the first group (My Projects) by checking their option IDs
    // Options in group 0 have IDs like react-select-X-option-0-0, react-select-X-option-0-1
    projectOptionsForOrg2.forEach(opt => {
      const optId = opt.getAttribute('id');
      // Should be in group 0 (My Projects)
      expect(optId).toMatch(/option-0-\d+$/);
    });

    // Select project3
    await userEvent.click(screen.getByText('project3'));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith('/test/org2/path/project3/');
    });
  });
});
