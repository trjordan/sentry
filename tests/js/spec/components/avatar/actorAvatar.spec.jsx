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
    it('should show a gravatar when actor type is a user', function () {
      const {container} = renderWithTheme(
        <ActorAvatar
          actor={{
            id: '1',
            name: 'Jane Bloggs',
            type: 'user',
          }}
          gravatar
        />
      );
      // The user from MemberListStore has an email, so with gravatar prop enabled,
      // it should render a gravatar type avatar
      const avatar = container.querySelector('[type="gravatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should not show a gravatar when actor type is a team', function () {
      renderWithTheme(
        <ActorAvatar
          actor={{
            id: '3',
            name: 'COOL TEAM',
            type: 'team',
          }}
        />
      );
      // Verify LetterAvatar is present with team initials
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
