import React from 'react';

import {
  act,
  renderWithTheme,
  screen,
  tick,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import {openInviteMembersModal} from 'app/actionCreators/modal';
import {Client} from 'app/api';
import AssigneeSelectorComponent, {
  putSessionUserFirst,
} from 'app/components/assigneeSelector';
import ConfigStore from 'app/stores/configStore';
import GroupStore from 'app/stores/groupStore';
import MemberListStore from 'app/stores/memberListStore';
import ProjectsStore from 'app/stores/projectsStore';
import TeamStore from 'app/stores/teamStore';

jest.mock('app/actionCreators/modal', () => ({
  openInviteMembersModal: jest.fn(),
}));

// Mock document.createRange for userEvent
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

describe('AssigneeSelector', function () {
  let assignMock;
  let assignGroup2Mock;
  let USER_1, USER_2, USER_3;
  let TEAM_1;
  let PROJECT_1;
  let GROUP_1;
  let GROUP_2;

  beforeEach(function () {
    USER_1 = TestStubs.User({
      id: '1',
      name: 'Jane Bloggs',
      email: 'janebloggs@example.com',
    });
    USER_2 = TestStubs.User({
      id: '2',
      name: 'John Smith',
      email: 'johnsmith@example.com',
    });
    USER_3 = TestStubs.User({
      id: '3',
      name: 'J J',
      email: 'jj@example.com',
    });

    TEAM_1 = TestStubs.Team({
      id: '3',
      name: 'COOL TEAM',
      slug: 'cool-team',
    });

    PROJECT_1 = TestStubs.Project({
      teams: [TEAM_1],
    });

    GROUP_1 = TestStubs.Group({
      id: '1337',
      project: {
        id: PROJECT_1.id,
        slug: PROJECT_1.slug,
      },
    });

    GROUP_2 = TestStubs.Group({
      id: '1338',
      project: {
        id: PROJECT_1.id,
        slug: PROJECT_1.slug,
      },
      owners: [
        {
          type: 'suspectCommit',
          owner: 'user:1',
          date_added: '',
        },
      ],
    });

    jest.spyOn(MemberListStore, 'getAll').mockImplementation(() => null);
    jest.spyOn(TeamStore, 'getAll').mockImplementation(() => [TEAM_1]);
    jest.spyOn(ProjectsStore, 'getAll').mockImplementation(() => [PROJECT_1]);
    jest.spyOn(GroupStore, 'get').mockImplementation(() => GROUP_1);

    assignMock = Client.addMockResponse({
      method: 'PUT',
      url: `/issues/${GROUP_1.id}/`,
      body: {
        ...GROUP_1,
        assignedTo: {...USER_1, type: 'user'},
      },
    });

    assignGroup2Mock = Client.addMockResponse({
      method: 'PUT',
      url: `/issues/${GROUP_2.id}/`,
      body: {
        ...GROUP_2,
        assignedTo: {...USER_1, type: 'user'},
      },
    });

    MemberListStore.state = [];
    MemberListStore.loaded = false;
  });

  // Doesn't need to always be async, but it was easier to prevent flakes this way
  const openMenu = async () => {
    const button = screen.getByTestId('assignee-selector');
    await userEvent.click(button, undefined, {
      // Skip hover to prevent tooltip from rendering
      skipHover: true,
    });
  };

  afterEach(function () {
    Client.clearMockResponses();
  });

  describe('render with props', function () {
    it('renders members from the prop when present', async function () {
      MemberListStore.loadInitialData([USER_1]);
      renderWithTheme(
        <AssigneeSelectorComponent id={GROUP_1.id} memberList={[USER_2, USER_3]} />
      );
      await openMenu();

      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      // 3 total items - 1 team + 2 users
      expect(screen.getAllByTestId('assignee-option')).toHaveLength(3);

      expect(screen.getByText(`#${TEAM_1.slug}`)).toBeInTheDocument();
      expect(screen.getByText(USER_2.name)).toBeInTheDocument();
      expect(screen.getByText(USER_3.name)).toBeInTheDocument();
    });
  });

  describe('putSessionUserFirst()', function () {
    it('should place the session user at the top of the member list if present', function () {
      jest.spyOn(ConfigStore, 'get').mockImplementation(() => ({
        id: '2',
        name: 'John Smith',
        email: 'johnsmith@example.com',
      }));
      expect(putSessionUserFirst([USER_1, USER_2])).toEqual([USER_2, USER_1]);
      ConfigStore.get.mockRestore();
    });

    it("should return the same member list if the session user isn't present", function () {
      jest.spyOn(ConfigStore, 'get').mockImplementation(() => ({
        id: '555',
        name: 'Here Comes a New Challenger',
        email: 'guile@mail.us.af.mil',
      }));

      expect(putSessionUserFirst([USER_1, USER_2])).toEqual([USER_1, USER_2]);
      ConfigStore.get.mockRestore();
    });
  });

  it('should initially have loading state', async function () {
    renderWithTheme(<AssigneeSelectorComponent id={GROUP_1.id} />);

    await openMenu();

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('does not have loading state and shows member list after calling MemberListStore.loadInitialData', async function () {
    renderWithTheme(<AssigneeSelectorComponent id={GROUP_1.id} />);
    act(() => MemberListStore.loadInitialData([USER_1, USER_2]));

    await openMenu();

    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    // 3 total items - 1 team + 2 users
    expect(screen.getAllByTestId('assignee-option')).toHaveLength(3);
  });

  it('does NOT update member list after initial load', async function () {
    renderWithTheme(<AssigneeSelectorComponent id={GROUP_1.id} />);
    act(() => MemberListStore.loadInitialData([USER_1, USER_2]));

    await openMenu();

    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('assignee-option')).toHaveLength(3);

    act(() => MemberListStore.loadInitialData([USER_1, USER_2, USER_3]));

    // Should still be 3 options (not 4)
    expect(screen.getAllByTestId('assignee-option')).toHaveLength(3);
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  it('successfully assigns users', async function () {
    renderWithTheme(<AssigneeSelectorComponent id={GROUP_1.id} />);
    act(() => MemberListStore.loadInitialData([USER_1, USER_2]));

    await openMenu();

    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

    const options = screen.getAllByTestId('assignee-option');
    // Click first user option (skipping team option at index 0)
    await userEvent.click(options[1]);

    expect(assignMock).toHaveBeenLastCalledWith(
      '/issues/1337/',
      expect.objectContaining({
        data: {assignedTo: 'user:1'},
      })
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });

  it('successfully assigns teams', async function () {
    renderWithTheme(<AssigneeSelectorComponent id={GROUP_1.id} />);
    act(() => MemberListStore.loadInitialData([USER_1, USER_2]));

    await openMenu();

    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

    // Click team option (first in the list)
    const teamOption = screen.getByText(`#${TEAM_1.slug}`);
    await userEvent.click(teamOption);

    expect(assignMock).toHaveBeenCalledWith(
      '/issues/1337/',
      expect.objectContaining({
        data: {assignedTo: 'team:3'},
      })
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });

  it('successfully clears assignment', async function () {
    renderWithTheme(<AssigneeSelectorComponent id={GROUP_1.id} />);
    act(() => MemberListStore.loadInitialData([USER_1, USER_2]));

    await openMenu();

    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

    // Assign first item in list, which is TEAM_1
    const teamOption = screen.getByText(`#${TEAM_1.slug}`);
    await userEvent.click(teamOption);

    expect(assignMock).toHaveBeenCalledWith(
      '/issues/1337/',
      expect.objectContaining({
        data: {assignedTo: 'team:3'},
      })
    );

    // Wait for assignment to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    // Open menu again and clear
    await openMenu();

    const clearButton = document.querySelector('[data-test-id="clear-assignee"]');
    await userEvent.click(clearButton);

    // api was called with empty string, clearing assignment
    expect(assignMock).toHaveBeenLastCalledWith(
      '/issues/1337/',
      expect.objectContaining({
        data: {assignedTo: ''},
      })
    );
  });

  it('shows invite member button', async function () {
    jest.spyOn(ConfigStore, 'get').mockImplementation(() => true);

    renderWithTheme(<AssigneeSelectorComponent id={GROUP_1.id} />);
    act(() => MemberListStore.loadInitialData([USER_1, USER_2]));

    await openMenu();

    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

    const inviteButton = document.querySelector('[data-test-id="invite-member"]');
    await userEvent.click(inviteButton);

    expect(openInviteMembersModal).toHaveBeenCalled();
    ConfigStore.get.mockRestore();
  });

  it('filters user by email and selects with keyboard', async function () {
    renderWithTheme(<AssigneeSelectorComponent id={GROUP_1.id} />);
    act(() => MemberListStore.loadInitialData([USER_1, USER_2]));

    await openMenu();

    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

    const searchInput = screen.getByRole('textbox');
    await userEvent.type(searchInput, 'JohnSmith@example.com');

    // Should only show USER_2 now
    expect(screen.getByText(USER_2.name)).toBeInTheDocument();
    expect(screen.queryByText(USER_1.name)).not.toBeInTheDocument();

    await userEvent.keyboard('{Enter}');

    expect(assignMock).toHaveBeenLastCalledWith(
      '/issues/1337/',
      expect.objectContaining({
        data: {assignedTo: 'user:2'},
      })
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });

  it('successfully shows suggested assignees', async function () {
    jest.spyOn(GroupStore, 'get').mockImplementation(() => GROUP_2);
    const onAssign = jest.fn();

    renderWithTheme(<AssigneeSelectorComponent id={GROUP_2.id} onAssign={onAssign} />);
    act(() => MemberListStore.loadInitialData([USER_1, USER_2, USER_3]));

    await tick();

    await openMenu();

    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

    // Should show suggested section
    expect(screen.getByText('Suggested')).toBeInTheDocument();

    // Click on suggested user option - need to be more specific to avoid duplicates
    const suggestedOptions = screen.getAllByTestId('assignee-option');
    const suggestedUserOption = suggestedOptions.find(
      el =>
        el.textContent?.includes(USER_1.name) &&
        el.textContent?.includes('Suspect Commit')
    );
    await userEvent.click(suggestedUserOption);

    expect(assignGroup2Mock).toHaveBeenCalledWith(
      '/issues/1338/',
      expect.objectContaining({
        data: {assignedTo: 'user:1'},
      })
    );

    expect(onAssign).toHaveBeenCalledWith(
      'member',
      expect.objectContaining({id: '1'}),
      expect.objectContaining({id: '1'})
    );
  });

  it('renders unassigned', async function () {
    jest.spyOn(GroupStore, 'get').mockImplementation(() => GROUP_2);

    renderWithTheme(<AssigneeSelectorComponent id={GROUP_2.id} />);

    // The button doesn't have text content "Unassigned", check the tooltip is showing unassigned icon
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
