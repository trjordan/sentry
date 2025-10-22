import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import ProjectSelector from 'app/components/organizations/projectSelector';

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
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    })),
    getClientRects: jest.fn(() => []),
  };
  range.cloneRange = () => range;
  range.collapse = jest.fn();
  range.selectNode = jest.fn();
  range.selectNodeContents = jest.fn();
  return range;
};

describe('ProjectSelector', function () {
  const testTeam = TestStubs.Team({
    id: 'test-team',
    slug: 'test-team',
    isMember: true,
  });

  const testProject = TestStubs.Project({
    id: 'test-project',
    slug: 'test-project',
    isBookmarked: true,
    isMember: true,
    teams: [testTeam],
  });
  const anotherProject = TestStubs.Project({
    id: 'another-project',
    slug: 'another-project',
    isMember: true,
    teams: [testTeam],
  });

  const mockOrg = TestStubs.Organization({
    id: 'org',
    slug: 'org',
    teams: [testTeam],
    projects: [testProject, anotherProject],
    features: ['new-teams'],
    access: [],
  });

  const openMenu = async () => {
    await userEvent.click(screen.getByTestId('test-actor'));
  };

  const actorRenderer = jest.fn(() => <div data-test-id="test-actor" />);

  const props = {
    organization: mockOrg,
    projectId: '',
    children: actorRenderer,
    multiProjects: mockOrg.projects,
    selectedProjects: [],
    onSelect: () => {},
    menuFooter: () => {},
  };

  it('should show empty message with no projects button, when no projects, and has no "project:write" access', async function () {
    renderWithTheme(
      <ProjectSelector
        {...props}
        multiProjects={[]}
        organization={{
          id: 'org',
          slug: 'org-slug',
          teams: [],
          projects: [],
          access: [],
        }}
      />
    );

    await openMenu();
    expect(screen.getByText('You have no projects')).toBeInTheDocument();
    // Should not have "Create Project" button
    expect(screen.queryByText('Create project')).not.toBeInTheDocument();
  });

  it('should show empty message and create project button, when no projects and has "project:write" access', async function () {
    renderWithTheme(
      <ProjectSelector
        {...props}
        multiProjects={[]}
        organization={{
          id: 'org',
          slug: 'org-slug',
          teams: [],
          projects: [],
          access: ['project:write'],
        }}
      />
    );

    await openMenu();
    expect(screen.getByText('You have no projects')).toBeInTheDocument();
    // Should have "Create Project" button
    expect(screen.getByText('Create project')).toBeInTheDocument();
  });

  it('lists projects and has filter', async function () {
    renderWithTheme(<ProjectSelector {...props} />);
    await openMenu();

    expect(screen.getByText(testProject.slug)).toBeInTheDocument();
    expect(screen.getByText(anotherProject.slug)).toBeInTheDocument();
  });

  it('can filter projects by project name', async function () {
    renderWithTheme(<ProjectSelector {...props} />);
    await openMenu();

    screen.getByRole('textbox').focus();
    await userEvent.keyboard('TEST');

    const item = screen.getByTestId('badge-display-name');
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent(testProject.slug);
  });

  it('does not close dropdown when input is clicked', async function () {
    renderWithTheme(<ProjectSelector {...props} />);
    await openMenu();

    await userEvent.click(screen.getByRole('textbox'));

    // Dropdown should still be open - verify by checking if projects are still visible
    expect(screen.getByText(testProject.slug)).toBeInTheDocument();
  });

  it('closes dropdown when project is selected', async function () {
    renderWithTheme(<ProjectSelector {...props} />);
    await openMenu();

    // Select first project
    await userEvent.click(screen.getByText(testProject.slug));

    // Dropdown should be closed - project should no longer be in the document
    await waitFor(() => {
      expect(screen.queryByText(testProject.slug)).not.toBeInTheDocument();
    });
  });

  it('calls callback when project is selected', async function () {
    const mock = jest.fn();
    renderWithTheme(<ProjectSelector {...props} onSelect={mock} />);
    await openMenu();

    // Select first project
    await userEvent.click(screen.getByText(testProject.slug));

    expect(mock).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'test-project',
      })
    );
  });

  it('shows empty filter message when filtering has no results', async function () {
    renderWithTheme(<ProjectSelector {...props} />);
    await openMenu();

    screen.getByRole('textbox').focus();
    await userEvent.keyboard('Foo');

    expect(screen.queryByTestId('badge-display-name')).not.toBeInTheDocument();
    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('does not call `onSelect` when using multi select', async function () {
    const mock = jest.fn();
    const onMultiSelectMock = jest.fn();
    renderWithTheme(
      <ProjectSelector
        {...props}
        multi
        onSelect={mock}
        onMultiSelect={onMultiSelectMock}
      />
    );
    await openMenu();

    // Select first project checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);

    // onSelect callback should NOT be called
    expect(mock).not.toHaveBeenCalled();
    expect(onMultiSelectMock).toHaveBeenCalled();
  });

  it('displays multi projects', async function () {
    const project = TestStubs.Project();
    const multiProjectProps = {...props, multiProjects: [project]};

    renderWithTheme(<ProjectSelector {...multiProjectProps} />);
    await openMenu();

    expect(screen.getByText(project.slug)).toBeInTheDocument();
    expect(screen.queryByText("Projects I don't belong to")).not.toBeInTheDocument();
  });

  it('displays multi projects with non member projects', async function () {
    const project = TestStubs.Project({id: '1', slug: 'member-project'});
    const nonMemberProject = TestStubs.Project({id: '2', slug: 'non-member-project'});
    const multiProjectProps = {
      ...props,
      multiProjects: [project],
      nonMemberProjects: [nonMemberProject],
    };

    renderWithTheme(<ProjectSelector {...multiProjectProps} />);
    await openMenu();

    expect(screen.getByText("Projects I don't belong to")).toBeInTheDocument();
    expect(screen.getByText(project.slug)).toBeInTheDocument();
    expect(screen.getByText(nonMemberProject.slug)).toBeInTheDocument();
  });

  it('displays projects in alphabetical order partitioned by project membership', async function () {
    const projectA = TestStubs.Project({id: '1', slug: 'a-project'});
    const projectB = TestStubs.Project({id: '2', slug: 'b-project'});
    const projectANonM = TestStubs.Project({id: '3', slug: 'a-non-m-project'});
    const projectBNonM = TestStubs.Project({id: '4', slug: 'b-non-m-project'});

    const multiProjectProps = {
      ...props,
      multiProjects: [projectB, projectA],
      nonMemberProjects: [projectBNonM, projectANonM],
      selectedProjects: [],
    };

    const {container} = renderWithTheme(<ProjectSelector {...multiProjectProps} />);
    await openMenu();

    const text = container.textContent || '';
    const positionA = text.indexOf(projectA.slug);
    const positionB = text.indexOf(projectB.slug);
    const positionANonM = text.indexOf(projectANonM.slug);
    const positionBNonM = text.indexOf(projectBNonM.slug);

    expect(screen.getByText("Projects I don't belong to")).toBeInTheDocument();
    expect(screen.getByText(projectA.slug)).toBeInTheDocument();
    expect(screen.getByText(projectB.slug)).toBeInTheDocument();
    expect(screen.getByText(projectANonM.slug)).toBeInTheDocument();
    expect(screen.getByText(projectBNonM.slug)).toBeInTheDocument();

    [positionA, positionB, positionANonM, positionBNonM].forEach(position =>
      expect(position).toBeGreaterThan(-1)
    );

    expect(positionA).toBeLessThan(positionB);
    expect(positionB).toBeLessThan(positionANonM);
    expect(positionANonM).toBeLessThan(positionBNonM);
  });

  it('displays multi projects in sort order rules: selected, bookmarked, alphabetical', async function () {
    const projectA = TestStubs.Project({id: '1', slug: 'a-project'});
    const projectBBookmarked = TestStubs.Project({
      id: '2',
      slug: 'b-project',
      isBookmarked: true,
    });
    const projectCBookmarked = TestStubs.Project({
      id: '3',
      slug: 'c-project',
      isBookmarked: true,
    });
    const projectDSelected = TestStubs.Project({id: '4', slug: 'd-project'});
    const projectESelected = TestStubs.Project({id: '5', slug: 'e-project'});
    const projectFSelectedBookmarked = TestStubs.Project({
      id: '6',
      slug: 'f-project',
      isBookmarked: true,
    });
    const projectGSelectedBookmarked = TestStubs.Project({
      id: '7',
      slug: 'g-project',
      isBookmarked: true,
    });
    const projectH = TestStubs.Project({id: '8', slug: 'h-project'});
    const multiProjectProps = {
      ...props,
      multiProjects: [
        projectA,
        projectBBookmarked,
        projectCBookmarked,
        projectDSelected,
        projectESelected,
        projectFSelectedBookmarked,
        projectGSelectedBookmarked,
        projectH,
      ],
      nonMemberProjects: [],
      selectedProjects: [
        projectESelected,
        projectDSelected,
        projectGSelectedBookmarked,
        projectFSelectedBookmarked,
      ],
    };

    const {container} = renderWithTheme(<ProjectSelector {...multiProjectProps} />);
    await openMenu();

    const text = container.textContent || '';
    const positionA = text.indexOf(projectA.slug);
    const positionB = text.indexOf(projectBBookmarked.slug);
    const positionC = text.indexOf(projectCBookmarked.slug);
    const positionD = text.indexOf(projectDSelected.slug);
    const positionE = text.indexOf(projectESelected.slug);
    const positionF = text.indexOf(projectFSelectedBookmarked.slug);
    const positionG = text.indexOf(projectGSelectedBookmarked.slug);
    const positionH = text.indexOf(projectH.slug);

    expect(screen.queryByText("Projects I don't belong to")).not.toBeInTheDocument();
    expect(screen.getByText(projectA.slug)).toBeInTheDocument();
    expect(screen.getByText(projectBBookmarked.slug)).toBeInTheDocument();
    expect(screen.getByText(projectCBookmarked.slug)).toBeInTheDocument();
    expect(screen.getByText(projectDSelected.slug)).toBeInTheDocument();
    expect(screen.getByText(projectESelected.slug)).toBeInTheDocument();
    expect(screen.getByText(projectFSelectedBookmarked.slug)).toBeInTheDocument();
    expect(screen.getByText(projectGSelectedBookmarked.slug)).toBeInTheDocument();
    expect(screen.getByText(projectH.slug)).toBeInTheDocument();

    [
      positionA,
      positionB,
      positionC,
      positionD,
      positionE,
      positionF,
      positionG,
      positionH,
    ].forEach(position => expect(position).toBeGreaterThan(-1));

    expect(positionF).toBeLessThan(positionG);
    expect(positionG).toBeLessThan(positionD);
    expect(positionD).toBeLessThan(positionE);
    expect(positionE).toBeLessThan(positionB);
    expect(positionB).toBeLessThan(positionC);
    expect(positionC).toBeLessThan(positionA);
    expect(positionA).toBeLessThan(positionH);
  });

  it('displays non member projects in alphabetical sort order', async function () {
    const projectA = TestStubs.Project({id: '1', slug: 'a-project'});
    const projectBBookmarked = TestStubs.Project({
      id: '2',
      slug: 'b-project',
      isBookmarked: true,
    });
    const projectCSelected = TestStubs.Project({id: '3', slug: 'c-project'});
    const projectDSelectedBookmarked = TestStubs.Project({
      id: '4',
      slug: 'd-project',
      isBookmarked: true,
    });

    const multiProjectProps = {
      ...props,
      multiProjects: [],
      nonMemberProjects: [
        projectCSelected,
        projectA,
        projectDSelectedBookmarked,
        projectBBookmarked,
      ],
      selectedProjects: [projectCSelected, projectDSelectedBookmarked],
    };

    const {container} = renderWithTheme(<ProjectSelector {...multiProjectProps} />);
    await openMenu();

    const text = container.textContent || '';
    const positionA = text.indexOf(projectA.slug);
    const positionB = text.indexOf(projectBBookmarked.slug);
    const positionC = text.indexOf(projectCSelected.slug);
    const positionD = text.indexOf(projectDSelectedBookmarked.slug);

    expect(screen.getByText("Projects I don't belong to")).toBeInTheDocument();
    expect(screen.getByText(projectA.slug)).toBeInTheDocument();
    expect(screen.getByText(projectBBookmarked.slug)).toBeInTheDocument();
    expect(screen.getByText(projectCSelected.slug)).toBeInTheDocument();
    expect(screen.getByText(projectDSelectedBookmarked.slug)).toBeInTheDocument();

    [positionA, positionB, positionC, positionD].forEach(position =>
      expect(position).toBeGreaterThan(-1)
    );

    expect(positionA).toBeLessThan(positionB);
    expect(positionB).toBeLessThan(positionC);
    expect(positionC).toBeLessThan(positionD);
  });
});
