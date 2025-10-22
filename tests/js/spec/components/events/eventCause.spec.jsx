import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import EventCause from 'app/components/events/eventCause';
import CommitterStore from 'app/stores/committerStore';

describe('EventCause', function () {
  const organization = TestStubs.Organization();
  const project = TestStubs.Project();
  const event = TestStubs.Event();
  const group = TestStubs.Group({firstRelease: {}});
  const api = new MockApiClient();

  afterEach(function () {
    MockApiClient.clearMockResponses();
    CommitterStore.reset();
  });

  beforeEach(function () {
    MockApiClient.addMockResponse({
      method: 'GET',
      url: `/projects/${organization.slug}/${project.slug}/events/${event.id}/committers/`,
      body: {
        committers: [
          {
            author: {name: 'Max Bittker', id: '1'},
            commits: [
              {
                message:
                  'feat: Enhance suggested commits and add to alerts\n\n- Refactor components to use new shared CommitRow\n- Add Suspect Commits to alert emails\n- Refactor committers scanning code to handle various edge cases.',
                score: 4,
                id: 'ab2709293d0c9000829084ac7b1c9221fb18437c',
                repository: TestStubs.Repository(),
                dateCreated: '2018-03-02T18:30:26Z',
              },
              {
                message:
                  'feat: Enhance suggested commits and add to alerts\n\n- Refactor components to use new shared CommitRow\n- Add Suspect Commits to alert emails\n- Refactor committers scanning code to handle various edge cases.',
                score: 4,
                id: 'ab2709293d0c9000829084ac7b1c9221fb18437c',
                repository: TestStubs.Repository(),
                dateCreated: '2018-03-02T18:30:26Z',
              },
            ],
          },
          {
            author: {name: 'Somebody else', id: '2'},
            commits: [
              {
                message: 'fix: Make things less broken',
                score: 2,
                id: 'zzzzzz3d0c9000829084ac7b1c9221fb18437c',
                repository: TestStubs.Repository(),
                dateCreated: '2018-03-02T16:30:26Z',
              },
            ],
          },
        ],
      },
    });
  });

  it('renders', async function () {
    renderWithTheme(
      <EventCause
        api={api}
        organization={organization}
        project={project}
        event={event}
        group={group}
      />
    );

    // Wait for author name to appear
    expect(await screen.findByText('Max Bittker')).toBeInTheDocument();

    // Should show "Suspect Commits (2)" header - 2 unique commits
    expect(screen.getByText('Suspect Commits (2)')).toBeInTheDocument();

    // Should only show 1 commit row initially (first commit)
    // Query by text content in commits
    expect(screen.getByText(/feat: Enhance suggested commits/i)).toBeInTheDocument();
    expect(screen.queryByText(/fix: Make things less broken/i)).not.toBeInTheDocument();
  });

  it('expands', async function () {
    renderWithTheme(
      <EventCause
        api={api}
        organization={organization}
        project={project}
        event={event}
        group={group}
      />
    );

    // Wait for author name to appear
    expect(await screen.findByText('Max Bittker')).toBeInTheDocument();

    // Should show "Show more" button and only 1 commit initially
    const showMoreButton = screen.getByRole('button', {name: /show more/i});
    expect(showMoreButton).toBeInTheDocument();
    expect(screen.getByText(/feat: Enhance suggested commits/i)).toBeInTheDocument();
    expect(screen.queryByText(/fix: Make things less broken/i)).not.toBeInTheDocument();

    // Expand to show all commits
    await userEvent.click(showMoreButton);

    // Should now show both commits and button text changes to "Show less"
    expect(screen.getByText(/feat: Enhance suggested commits/i)).toBeInTheDocument();
    expect(screen.getByText(/fix: Make things less broken/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /show less/i})).toBeInTheDocument();

    // Collapse back
    await userEvent.click(screen.getByRole('button', {name: /show less/i}));

    // Should show only 1 commit again
    expect(screen.getByText(/feat: Enhance suggested commits/i)).toBeInTheDocument();
    expect(screen.queryByText(/fix: Make things less broken/i)).not.toBeInTheDocument();
  });

  it('shows unassociated email warning', async function () {
    MockApiClient.addMockResponse({
      method: 'GET',
      url: `/projects/${organization.slug}/${project.slug}/events/${event.id}/committers/`,
      body: {
        committers: [
          {
            author: {name: 'Somebody else', email: 'somebodyelse@email.com'},
            commits: [
              {
                message: 'fix: Make things less broken',
                score: 2,
                id: 'zzzzzz3d0c9000829084ac7b1c9221fb18437c',
                repository: TestStubs.Repository(),
                dateCreated: '2018-03-02T16:30:26Z',
              },
            ],
          },
        ],
      },
    });

    const {container} = renderWithTheme(
      <EventCause
        api={api}
        organization={organization}
        project={project}
        event={event}
        group={group}
      />
    );

    // Wait for commit to appear
    expect(await screen.findByText('Somebody else')).toBeInTheDocument();
    expect(screen.getByText(/fix: Make things less broken/i)).toBeInTheDocument();

    // Should show warning icon (check using querySelector for data-test-id)
    expect(container.querySelector('[data-test-id="email-warning"]')).toBeInTheDocument();
  });
});
