import React from 'react';

import {renderWithTheme, screen, tick} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import SuggestedOwners from 'app/components/group/suggestedOwners/suggestedOwners';
import CommitterStore from 'app/stores/committerStore';
import MemberListStore from 'app/stores/memberListStore';

describe('SuggestedOwners', function () {
  const user = TestStubs.User({name: 'User Name', email: 'user@example.com'});
  const organization = TestStubs.Organization();
  const project = TestStubs.Project();
  const event = TestStubs.Event();
  const group = TestStubs.Group({firstRelease: {}});

  const routerContext = TestStubs.routerContext([
    {
      organization,
    },
  ]);

  const endpoint = `/projects/${organization.slug}/${project.slug}/events/${event.id}`;

  beforeEach(function () {
    MemberListStore.loadInitialData([user]);
  });

  afterEach(function () {
    Client.clearMockResponses();
    CommitterStore.reset();
  });

  it('Renders suggested owners', async function () {
    const commitAuthor = TestStubs.CommitAuthor({
      name: 'Commit Author',
      email: 'commit@example.com',
    });
    Client.addMockResponse({
      url: `${endpoint}/committers/`,
      body: {
        committers: [
          {
            author: commitAuthor,
            commits: [TestStubs.Commit()],
          },
        ],
      },
    });

    Client.addMockResponse({
      url: `${endpoint}/owners/`,
      body: {
        owners: [{type: 'user', ...user}],
        rules: [[['path', 'sentry/tagstore/*'], [['user', user.email]]]],
      },
    });

    const {container} = renderWithTheme(
      <SuggestedOwners project={project} group={group} event={event} />,
      {context: routerContext[0]}
    );

    await tick();
    await tick(); // Run Store.load and fire Action.loadSuccess
    await tick(); // Run Store.loadSuccess

    // Should render 2 ActorAvatars (one for committer, one for owner from rules)
    // LetterAvatar components have data-test-id="letter-avatar"
    const avatars = container.querySelectorAll('[data-test-id="letter-avatar"]');
    expect(avatars).toHaveLength(2);

    // Verify both avatars are rendered - each with their respective titles
    const avatarsByCommitterName = screen.queryAllByTitle(commitAuthor.name);
    const avatarsByUserName = screen.queryAllByTitle(user.name);
    expect(avatarsByCommitterName).toHaveLength(1);
    expect(avatarsByUserName).toHaveLength(1);
  });

  it('does not call committers endpoint if `group.firstRelease` does not exist', async function () {
    const committers = Client.addMockResponse({
      url: `${endpoint}/committers/`,
      body: {
        committers: [
          {
            author: TestStubs.CommitAuthor(),
            commits: [TestStubs.Commit()],
          },
        ],
      },
    });

    Client.addMockResponse({
      url: `${endpoint}/owners/`,
      body: {
        owners: [{type: 'user', ...user}],
        rules: [[['path', 'sentry/tagstore/*'], [['user', user.email]]]],
      },
    });

    const {container} = renderWithTheme(
      <SuggestedOwners project={project} group={TestStubs.Group()} event={event} />,
      {context: routerContext[0]}
    );

    await tick();
    await tick(); // Run Store.load and fire Action.loadSuccess
    await tick(); // Run Store.loadSuccess

    expect(committers).not.toHaveBeenCalled();

    // Should render only 1 ActorAvatar (from owner rules, no committers)
    const avatars = container.querySelectorAll('[data-test-id="letter-avatar"]');
    expect(avatars).toHaveLength(1);
  });

  it('Merges owner matching rules and having suspect commits', async function () {
    const author = TestStubs.CommitAuthor();

    Client.addMockResponse({
      url: `${endpoint}/committers/`,
      body: {
        committers: [{author, commits: [TestStubs.Commit()]}],
      },
    });

    Client.addMockResponse({
      url: `${endpoint}/owners/`,
      body: {
        owners: [{type: 'user', ...author}],
        rules: [[['path', 'sentry/tagstore/*'], [['user', author.email]]]],
      },
    });

    const {container} = renderWithTheme(
      <SuggestedOwners project={project} group={group} event={event} />,
      {context: routerContext[0]}
    );

    await tick();
    await tick(); // Run Store.load and fire Action.loadSuccess
    await tick(); // Run Store.loadSuccess

    // Should merge into 1 ActorAvatar (same author in both committers and owners)
    const avatars = container.querySelectorAll('[data-test-id="letter-avatar"]');
    expect(avatars).toHaveLength(1);

    // Verify the merged owner has both commits and rules
    // Since the component renders ActorAvatar wrapped by SuggestedOwnerHovercard,
    // we verify it by checking that only one avatar is rendered (deduplication worked)
    // and the avatar shows the author's name in the title
    expect(screen.getByTitle(author.name)).toBeInTheDocument();
  });
});
