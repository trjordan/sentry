import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import StacktraceLinkModal from 'app/components/events/interfaces/stacktraceLinkModal';
import Indicators from 'app/components/indicators';

describe('StacktraceLinkModal', function () {
  const org = TestStubs.Organization();
  const project = TestStubs.Project();
  const integration = TestStubs.GitHubIntegration();
  const filename = '/sentry/app.py';
  const repo = TestStubs.Repository({integrationId: integration.id});
  const config = TestStubs.RepositoryProjectPathConfig(project, repo, integration);
  const sourceUrl = 'https://github.com/getsentry/sentry/blob/master/src/sentry/app.py';

  const closeModal = jest.fn();
  const onSubmit = jest.fn();
  const modalElements = {
    Header: p => p.children,
    Body: p => p.children,
    Footer: p => p.children,
  };

  const renderComponent = (statusCode = 200) => {
    const configData = {
      stackRoot: '',
      sourceRoot: 'src/',
      integrationId: integration.id,
      repositoryId: repo.id,
      defaultBranch: 'master',
    };

    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/repo-path-parsing/`,
      method: 'POST',
      body: {...configData},
    });

    MockApiClient.addMockResponse({
      url: `/organizations/${org.slug}/code-mappings/`,
      method: 'POST',
      statusCode,
    });

    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/stacktrace-link/`,
      query: {file: filename, commitId: 'master', platform: 'python'},
      body: {config, sourceUrl, integrations: [integration]},
    });

    return renderWithTheme(
      <React.Fragment>
        <Indicators />
        <StacktraceLinkModal
          {...modalElements}
          closeModal={closeModal}
          onSubmit={onSubmit}
          filename={filename}
          integrations={[integration]}
          organization={org}
          project={project}
        />
      </React.Fragment>
    );
  };

  const submitQuickSetupInput = async () => {
    const input = screen.getByPlaceholderText(/https:\/\/github.com\/helloworld/);
    await userEvent.type(input, sourceUrl);
    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
  };

  beforeEach(function () {
    closeModal.mockReset();
    onSubmit.mockReset();
    MockApiClient.clearMockResponses();
  });

  it('renders manual setup option', function () {
    renderComponent();
    expect(screen.getByText('Test Integration')).toBeInTheDocument();
  });

  it('closes modal after successful quick setup', async function () {
    renderComponent();
    await submitQuickSetupInput();
    await waitFor(() => {
      expect(closeModal).toHaveBeenCalled();
    });
  });

  it('keeps modal open on unsuccessful quick setup', async function () {
    renderComponent(400);
    await submitQuickSetupInput();
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });
    expect(closeModal).not.toHaveBeenCalled();
  });
});
