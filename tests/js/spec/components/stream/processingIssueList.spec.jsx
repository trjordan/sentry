import React from 'react';

import {renderWithTheme, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import ProcessingIssueList from 'app/components/stream/processingIssueList';

describe('ProcessingIssueList', function () {
  let projectIds, organization, fetchIssueRequest;

  beforeEach(function () {
    fetchIssueRequest = MockApiClient.addMockResponse({
      url: '/organizations/org-slug/processingissues/',
      method: 'GET',
      body: [
        {
          project: 'test-project',
          numIssues: 1,
          hasIssues: true,
          lastSeen: '2019-01-16T15:39:11.081Z',
        },
        {
          project: 'other-project',
          numIssues: 1,
          hasIssues: true,
          lastSeen: '2019-01-16T15:39:11.081Z',
        },
      ],
    });
    organization = TestStubs.Organization();
    projectIds = ['1', '2'];
  });

  describe('componentDidMount', function () {
    beforeEach(function () {
      renderWithTheme(
        <ProcessingIssueList organization={organization} projectIds={projectIds} />
      );
    });

    it('fetches issues', async function () {
      await waitFor(() => {
        expect(fetchIssueRequest).toHaveBeenCalled();
      });

      // Verify issues are rendered (indicating state was populated)
      expect(screen.getAllByText(/issue blocking/i).length).toBeGreaterThan(0);
    });
  });

  describe('render', function () {
    beforeEach(function () {
      renderWithTheme(
        <ProcessingIssueList
          organization={organization}
          projectIds={projectIds}
          showProject
        />
      );
    });

    it('renders multiple issues', async function () {
      // Wait for the issues to be fetched and rendered
      await waitFor(() => {
        expect(screen.getAllByText(/issue blocking/i)).toHaveLength(2);
      });
    });

    it('forwards the showProject prop', async function () {
      // Wait for issues to render
      await waitFor(() => {
        expect(screen.getByText('test-project')).toBeInTheDocument();
      });

      // Verify that project names are shown (showProject was forwarded)
      expect(screen.getByText('test-project')).toBeInTheDocument();
      expect(screen.getByText('other-project')).toBeInTheDocument();
    });
  });
});
