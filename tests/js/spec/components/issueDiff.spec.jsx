import React from 'react';

import {renderWithTheme, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import {IssueDiff} from 'app/components/issueDiff';

jest.mock('app/api');

describe('IssueDiff', function () {
  const entries = TestStubs.Entries();
  const api = new MockApiClient();
  const project = TestStubs.ProjectDetails();

  beforeEach(function () {
    MockApiClient.addMockResponse({
      url: '/issues/base/events/latest/',
      body: {
        eventID: '123base',
      },
    });
    MockApiClient.addMockResponse({
      url: '/issues/target/events/latest/',
      body: {
        eventID: '123target',
      },
    });
    MockApiClient.addMockResponse({
      url: `/projects/org-slug/${project.slug}/events/123target/`,
      body: {
        entries: entries[0],
      },
    });

    MockApiClient.addMockResponse({
      url: `/projects/org-slug/${project.slug}/events/123base/`,
      body: {
        platform: 'javascript',
        entries: entries[1],
      },
    });
  });

  afterEach(function () {
    MockApiClient.clearMockResponses();
  });

  it('is loading when initially rendering', function () {
    const {container} = renderWithTheme(
      <IssueDiff
        api={api}
        baseIssueId="base"
        targetIssueId="target"
        orgId="org-slug"
        project={project}
      />
    );
    expect(container.querySelector('.loading-indicator')).toBeInTheDocument();
  });

  it('can dynamically import SplitDiff', async function () {
    const {container} = renderWithTheme(
      <IssueDiff
        api={api}
        baseIssueId="base"
        targetIssueId="target"
        orgId="org-slug"
        project={project}
      />
    );

    await waitFor(() => {
      expect(container.querySelector('.loading-indicator')).not.toBeInTheDocument();
    });

    // SplitDiff is rendered as a table
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('can diff message', async function () {
    MockApiClient.addMockResponse({
      url: `/projects/org-slug/${project.slug}/events/123target/`,
      body: {
        entries: [{type: 'message', data: {formatted: 'Hello World'}}],
      },
    });
    MockApiClient.addMockResponse({
      url: `/projects/org-slug/${project.slug}/events/123base/`,
      body: {
        platform: 'javascript',
        entries: [{type: 'message', data: {formatted: 'Foo World'}}],
      },
    });

    const {container} = renderWithTheme(
      <IssueDiff
        api={api}
        baseIssueId="base"
        targetIssueId="target"
        orgId="org-slug"
        project={project}
      />
    );

    await waitFor(() => {
      expect(container.querySelector('.loading-indicator')).not.toBeInTheDocument();
    });

    // SplitDiff is rendered as a table
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
