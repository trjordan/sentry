import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import ActorAvatar from 'app/components/avatar/actorAvatar';
import MemberListStore from 'app/stores/memberListStore';
import TeamStore from 'app/stores/teamStore';

describe('ActorAvatar', function () {
  const USER = {
    id: '1',
    name: 'JanActore Bloggs',
    email: 'janebloggs@example.com',
  };
  const TEAM_1 = {
    id: '3',
    slug: 'cool-team',
    name: 'COOL TEAM',
    projects: [
      {
        slug: 2,
      },
    ],
  };
  beforeEach(function () {
    MemberListStore.loadInitialData([USER]);
    TeamStore.loadInitialData([TEAM_1]);
  });

  afterEach(function () {});

  describe('render()', function () {
    it('should show a user avatar when actor type is a user', function () {
      renderWithTheme(
        <ActorAvatar
          actor={{
            id: '1',
            name: 'Jane Bloggs',
            type: 'user',
          }}
          hasTooltip={false}
        />
      );
      // User should render with letter avatar (since no email in store lookup and gravatar=false by default)
      expect(screen.getByText('JB')).toBeInTheDocument();
    });

    it('should show a letter avatar when actor type is a team', function () {
      renderWithTheme(
        <ActorAvatar
          actor={{
            id: '3',
            name: 'COOL TEAM',
            type: 'team',
          }}
          hasTooltip={false}
        />
      );
      expect(screen.getByText('CT')).toBeInTheDocument();
    });

    it('should return null when actor type is a unknown', function () {
      const {container} = renderWithTheme(
        <ActorAvatar
          actor={{
            id: '3',
            name: 'COOL TEAM',
            type: 'teapot',
          }}
        />
      );

      expect(container.firstChild).toBe(null);
    });
  });
});
