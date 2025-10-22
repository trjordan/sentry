import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import MultipleEnvironmentSelector from 'app/components/organizations/multipleEnvironmentSelector';
import {ALL_ACCESS_PROJECTS} from 'app/constants/globalSelectionHeader';
import ConfigStore from 'app/stores/configStore';

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
  return range;
};

describe('MultipleEnvironmentSelector', function () {
  const onChange = jest.fn();
  const onUpdate = jest.fn();
  const router = TestStubs.router();

  const envs = ['production', 'staging', 'dev'];
  const projects = [
    TestStubs.Project({
      id: '1',
      slug: 'first',
      environments: ['production', 'staging'],
    }),
    TestStubs.Project({
      id: '2',
      slug: 'second',
      environments: ['dev'],
    }),
    TestStubs.Project({
      id: '3',
      slug: 'no member',
      environments: ['no-env'],
      isMember: false,
    }),
  ];
  const organization = TestStubs.Organization({projects});
  const selectedProjects = [1, 2];

  beforeEach(function () {
    onChange.mockClear();
    onUpdate.mockClear();
    ConfigStore.config = {
      user: {
        isSuperuser: false,
      },
    };
  });

  it('can select and change environments', async function () {
    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={projects}
        loadingProjects={false}
        selectedProjects={selectedProjects}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    // Open the dropdown
    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    // Select all envs - these are checkboxes, not simple clicks
    const checkboxes = screen.getAllByRole('checkbox');
    for (const checkbox of checkboxes) {
      await userEvent.click(checkbox);
    }
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith(envs);

    // Click Apply button
    await userEvent.click(screen.getByRole('button', {name: 'Apply'}));
    expect(onUpdate).toHaveBeenCalledWith();
  });

  it('selects multiple environments and uses chevron to update', async function () {
    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={projects}
        loadingProjects={false}
        selectedProjects={selectedProjects}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    // Open the dropdown
    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    // Select first environment - use checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);
    expect(onChange).toHaveBeenCalledTimes(1);

    // Select second environment
    await userEvent.click(checkboxes[1]);
    expect(onChange).toHaveBeenCalledTimes(2);

    // Close the dropdown by clicking the selector again (chevron)
    await userEvent.click(screen.getByTestId('global-header-environment-selector'));
    expect(onUpdate).toHaveBeenCalledWith();
  });

  it('does not update when there are no changes', async function () {
    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={projects}
        loadingProjects={false}
        selectedProjects={selectedProjects}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    // Open the dropdown
    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    // Close the dropdown without making changes
    await userEvent.click(screen.getByTestId('global-header-environment-selector'));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('updates environment options when projects selection changes', async function () {
    // project 2 only has 1 environment.
    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={projects}
        loadingProjects={false}
        selectedProjects={[2]}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    const items = screen.getAllByTestId(/^environment-/);
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('dev');
  });

  it('shows non-member project environments when selected', async function () {
    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={projects}
        loadingProjects={false}
        selectedProjects={[3]}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    const items = screen.getAllByTestId(/^environment-/);
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('no-env');
  });

  it('shows member project environments when there are no projects selected', async function () {
    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={projects}
        loadingProjects={false}
        selectedProjects={[]}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    const items = screen.getAllByTestId(/^environment-/);
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('production');
    expect(items[1]).toHaveTextContent('staging');
    expect(items[2]).toHaveTextContent('dev');
  });

  it('shows My Projects/all environments (superuser - no team belonging)', async function () {
    ConfigStore.config = {
      user: {
        isSuperuser: true,
      },
    };

    const superuserProjects = [
      TestStubs.Project({
        id: '1',
        slug: 'first',
        environments: ['production', 'staging'],
        isMember: false,
      }),
      TestStubs.Project({
        id: '2',
        slug: 'second',
        environments: ['dev'],
        isMember: false,
      }),
    ];

    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={superuserProjects}
        loadingProjects={false}
        selectedProjects={[]}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    const items = screen.getAllByTestId(/^environment-/);
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('production');
    expect(items[1]).toHaveTextContent('staging');
    expect(items[2]).toHaveTextContent('dev');
  });

  it('shows My Projects/all environments (superuser - belongs one team)', async function () {
    // XXX: Ideally, "My Projects" and "All Projects" should be different if a superuser
    // was to belong to at least one project
    ConfigStore.config = {
      user: {
        isSuperuser: true,
      },
    };

    const superuserProjects = [
      TestStubs.Project({
        id: '1',
        slug: 'first',
        environments: ['production', 'staging'],
      }),
      TestStubs.Project({
        id: '2',
        slug: 'second',
        environments: ['dev'],
        isMember: false,
      }),
    ];

    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={superuserProjects}
        loadingProjects={false}
        selectedProjects={[]}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    const items = screen.getAllByTestId(/^environment-/);
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('production');
    expect(items[1]).toHaveTextContent('staging');
    expect(items[2]).toHaveTextContent('dev');
  });

  it('shows All Projects/all environments (superuser - no team belonging)', async function () {
    ConfigStore.config = {
      user: {
        isSuperuser: true,
      },
    };

    const superuserProjects = [
      TestStubs.Project({
        id: '1',
        slug: 'first',
        environments: ['production', 'staging'],
      }),
      TestStubs.Project({
        id: '2',
        slug: 'second',
        environments: ['dev'],
        isMember: false,
      }),
    ];

    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={superuserProjects}
        loadingProjects={false}
        selectedProjects={[-1]}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    const items = screen.getAllByTestId(/^environment-/);
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('production');
    expect(items[1]).toHaveTextContent('staging');
    expect(items[2]).toHaveTextContent('dev');
  });

  it('shows All Projects/all environments (superuser - belongs one team)', async function () {
    // XXX: Ideally, "My Projects" and "All Projects" should be different if a superuser
    // was to belong to at least one project
    ConfigStore.config = {
      user: {
        isSuperuser: true,
      },
    };

    const superuserProjects = [
      TestStubs.Project({
        id: '1',
        slug: 'first',
        environments: ['production', 'staging'],
      }),
      TestStubs.Project({
        id: '2',
        slug: 'second',
        environments: ['dev'],
        isMember: false,
      }),
    ];

    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={superuserProjects}
        loadingProjects={false}
        selectedProjects={[-1]}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    const items = screen.getAllByTestId(/^environment-/);
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('production');
    expect(items[1]).toHaveTextContent('staging');
    expect(items[2]).toHaveTextContent('dev');
  });

  it('shows all project environments when "all projects" is selected', async function () {
    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={projects}
        loadingProjects={false}
        selectedProjects={[ALL_ACCESS_PROJECTS]}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    const items = screen.getAllByTestId(/^environment-/);
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent('production');
    expect(items[1]).toHaveTextContent('staging');
    expect(items[2]).toHaveTextContent('dev');
    expect(items[3]).toHaveTextContent('no-env');
  });

  it('shows the distinct union of environments across all projects', async function () {
    renderWithTheme(
      <MultipleEnvironmentSelector
        organization={organization}
        projects={projects}
        loadingProjects={false}
        selectedProjects={[1, 2]}
        onChange={onChange}
        onUpdate={onUpdate}
        router={router}
      />
    );

    await userEvent.click(screen.getByTestId('global-header-environment-selector'));

    const items = screen.getAllByTestId(/^environment-/);
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('production');
    expect(items[1]).toHaveTextContent('staging');
    expect(items[2]).toHaveTextContent('dev');
  });
});
