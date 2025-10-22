import React from 'react';

import {renderWithTheme, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import {StacktraceLink} from 'app/components/events/interfaces/stacktraceLink';
import ProjectsStore from 'app/stores/projectsStore';

describe('StacktraceLink', function () {
  const org = TestStubs.Organization();
  const project = TestStubs.Project();
  const event = TestStubs.Event({projectID: project.id});
  const integration = TestStubs.GitHubIntegration();
  const repo = TestStubs.Repository({integrationId: integration.id});

  const frame = {filename: '/sentry/app.py', lineNo: 233};
  const platform = 'python';
  const config = TestStubs.RepositoryProjectPathConfig(project, repo, integration);

  beforeEach(function () {
    MockApiClient.clearMockResponses();
    ProjectsStore.loadInitialData([project]);
  });

  it('does not render setup CTA for members', async function () {
    const memberOrg = TestStubs.Organization({
      slug: 'hello-org',
      access: [],
    });
    MockApiClient.addMockResponse({
      url: `/projects/${memberOrg.slug}/${project.slug}/stacktrace-link/`,
      query: {file: frame.filename, commitId: 'master', platform},
      body: {config: null, sourceUrl: null, integrations: [integration]},
    });
    MockApiClient.addMockResponse({
      method: 'GET',
      url: '/prompts-activity/',
      body: {},
    });
    renderWithTheme(
      <StacktraceLink
        frame={frame}
        event={event}
        projects={[project]}
        organization={memberOrg}
        lineNo={frame.lineNo}
      />
    );

    // The setup CTA should not be rendered for members
    await waitFor(() => {
      expect(
        screen.queryByText(/Link your stack trace to your source code/i)
      ).not.toBeInTheDocument();
    });
  });

  it('renders setup CTA with integration but no configs', async function () {
    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/stacktrace-link/`,
      query: {file: frame.filename, commitId: 'master', platform},
      body: {config: null, sourceUrl: null, integrations: [integration]},
    });
    MockApiClient.addMockResponse({
      method: 'GET',
      url: '/prompts-activity/',
      body: {},
    });
    renderWithTheme(
      <StacktraceLink
        frame={frame}
        event={event}
        projects={[project]}
        organization={org}
        lineNo={frame.lineNo}
      />
    );

    // Wait for the setup CTA text to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Link your stack trace to your source code/i)
      ).toBeInTheDocument();
    });
  });

  it('renders source url link', async function () {
    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/stacktrace-link/`,
      query: {file: frame.filename, commitId: 'master', platform},
      body: {config, sourceUrl: 'https://something.io', integrations: [integration]},
    });
    MockApiClient.addMockResponse({
      method: 'GET',
      url: '/prompts-activity/',
      body: {},
    });
    renderWithTheme(
      <StacktraceLink
        frame={frame}
        event={event}
        projects={[project]}
        organization={org}
        lineNo={frame.lineNo}
      />
    );

    // Wait for the link to render
    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });
  });

  it('renders file_not_found message', async function () {
    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/stacktrace-link/`,
      query: {file: frame.filename, commitId: 'master', platform},
      body: {
        config,
        sourceUrl: null,
        error: 'file_not_found',
        integrations: [integration],
        attemptedUrl: 'https://something.io/blah',
      },
    });
    MockApiClient.addMockResponse({
      method: 'GET',
      url: '/prompts-activity/',
      body: {},
    });
    renderWithTheme(
      <StacktraceLink
        frame={frame}
        event={event}
        projects={[project]}
        organization={org}
        lineNo={frame.lineNo}
      />
    );

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Source file not found/i)).toBeInTheDocument();
    });
  });

  it('renders stack_root_mismatch message', async function () {
    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/stacktrace-link/`,
      query: {file: frame.filename, commitId: 'master', platform},
      body: {
        config,
        sourceUrl: null,
        error: 'stack_root_mismatch',
        integrations: [integration],
      },
    });
    MockApiClient.addMockResponse({
      method: 'GET',
      url: '/prompts-activity/',
      body: {},
    });
    renderWithTheme(
      <StacktraceLink
        frame={frame}
        event={event}
        projects={[project]}
        organization={org}
        lineNo={frame.lineNo}
      />
    );

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error matching your configuration/i)).toBeInTheDocument();
    });
  });

  it('renders default error message', async function () {
    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/stacktrace-link/`,
      query: {file: frame.filename, commitId: 'master', platform},
      body: {
        config,
        sourceUrl: null,
        integrations: [integration],
      },
    });
    MockApiClient.addMockResponse({
      method: 'GET',
      url: '/prompts-activity/',
      body: {},
    });
    renderWithTheme(
      <StacktraceLink
        frame={frame}
        event={event}
        projects={[project]}
        organization={org}
        lineNo={frame.lineNo}
      />
    );

    // Wait for error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(
          /There was an error encountered with the code mapping for this project/i
        )
      ).toBeInTheDocument();
    });
  });
});
