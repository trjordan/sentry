import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import PullRequestLink from 'app/components/pullRequestLink';

describe('PullRequestLink', function () {
  it('renders no url on missing externalUrl', function () {
    const repository = TestStubs.Repository({provider: null});
    const pullRequest = TestStubs.PullRequest({
      repository,
      externalUrl: null,
    });
    const {container} = renderWithTheme(
      <PullRequestLink repository={repository} pullRequest={pullRequest} />
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelector('span')).toHaveTextContent(
      'example/repo-name #3: Fix first issue'
    );
  });

  it('renders github links for integrations:github repositories', function () {
    const repository = TestStubs.Repository({
      provider: {
        id: 'integrations:github',
      },
    });
    const pullRequest = TestStubs.PullRequest({repository});
    renderWithTheme(
      <PullRequestLink repository={repository} pullRequest={pullRequest} />
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('example/repo-name #3: Fix first issue');
  });

  it('renders github links for github repositories', function () {
    const repository = TestStubs.Repository({
      provider: {
        id: 'github',
      },
    });
    const pullRequest = TestStubs.PullRequest({repository});
    renderWithTheme(
      <PullRequestLink repository={repository} pullRequest={pullRequest} />
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('example/repo-name #3: Fix first issue');
  });

  it('renders gitlab links for integrations:gitlab repositories', function () {
    const repository = TestStubs.Repository({
      provider: {
        id: 'integrations:gitlab',
      },
    });
    const pullRequest = TestStubs.PullRequest({repository});
    renderWithTheme(
      <PullRequestLink repository={repository} pullRequest={pullRequest} />
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('example/repo-name #3: Fix first issue');
  });

  it('renders github links for gitlab repositories', function () {
    const repository = TestStubs.Repository({
      provider: {
        id: 'gitlab',
      },
    });
    const pullRequest = TestStubs.PullRequest({repository});
    renderWithTheme(
      <PullRequestLink repository={repository} pullRequest={pullRequest} />
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('example/repo-name #3: Fix first issue');
  });
});
