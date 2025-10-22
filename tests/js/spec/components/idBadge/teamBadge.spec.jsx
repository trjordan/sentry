import React from 'react';

import {renderWithTheme, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import TeamBadge from 'app/components/idBadge/teamBadge';
import TeamStore from 'app/stores/teamStore';

describe('TeamBadge', function () {
  beforeEach(() => {
    TeamStore.init();
  });

  it('renders with Avatar and team name', function () {
    const {container} = renderWithTheme(<TeamBadge team={TestStubs.Team()} />);
    expect(container.querySelector('.avatar')).toBeInTheDocument();
    expect(screen.getByText('#team-slug')).toBeInTheDocument();
  });

  it('listens for avatar changes from TeamStore', async function () {
    const team = TestStubs.Team();
    const {container} = renderWithTheme(<TeamBadge team={team} />);

    TeamStore.onUpdateSuccess(team.id, {
      ...team,
      avatar: {
        avatarType: 'upload',
        avatarUuid: 'better_avatar.jpg',
      },
    });

    await waitFor(() => {
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', expect.stringContaining('better_avatar.jpg'));
    });
  });

  it('updates state from props', async function () {
    const team = TestStubs.Team();
    const {container, rerender} = renderWithTheme(<TeamBadge team={team} />);

    rerender(
      <TeamBadge
        team={{
          ...team,
          avatar: {
            avatarType: 'upload',
            avatarUuid: 'better_avatar.jpg',
          },
        }}
      />
    );

    await waitFor(() => {
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', expect.stringContaining('better_avatar.jpg'));
    });
  });
});
