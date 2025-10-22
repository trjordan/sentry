import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import ProcessingIssueHint from 'app/components/stream/processingIssueHint';

describe('ProcessingIssueHint', function () {
  let issue;
  const orgId = 'test-org';
  const projectId = 'test-project';

  beforeEach(() => {
    issue = {
      hasIssues: false,
      hasMoreResolveableIssues: false,
      issuesProcessing: 0,
      lastSeen: '2019-01-16T15:38:38Z',
      numIssues: 0,
      resolveableIssues: 0,
      signedLink: null,
    };
  });

  describe('numIssues state', function () {
    let container;

    beforeEach(() => {
      issue.numIssues = 9;
      const result = renderWithTheme(
        <ProcessingIssueHint issue={issue} orgId={orgId} projectId={projectId} />
      );
      container = result.container;
    });

    it('displays a button', function () {
      const button = screen.getByRole('button', {name: 'Show details'});
      expect(button).toBeInTheDocument();
      // Button component with 'to' prop renders as React Router Link (no href in test env)
      expect(button.tagName).toBe('A');
    });

    it('displays an icon', function () {
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays text', function () {
      expect(screen.getByText(/issues blocking/i)).toBeInTheDocument();
    });
  });

  describe('issuesProcessing state', function () {
    let container;

    beforeEach(() => {
      issue.issuesProcessing = 9;
      const result = renderWithTheme(
        <ProcessingIssueHint issue={issue} orgId={orgId} projectId={projectId} />
      );
      container = result.container;
    });

    it('does not display a button', function () {
      const button = screen.queryByRole('button', {name: 'Show details'});
      expect(button).not.toBeInTheDocument();
    });

    it('displays an icon', function () {
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays text', function () {
      expect(screen.getByText(/Reprocessing/)).toBeInTheDocument();
    });
  });

  describe('resolvableIssues state', function () {
    let container;

    beforeEach(() => {
      issue.resolveableIssues = 9;
      const result = renderWithTheme(
        <ProcessingIssueHint issue={issue} orgId={orgId} projectId={projectId} />
      );
      container = result.container;
    });

    it('displays a button', function () {
      const button = screen.getByRole('button', {name: 'Show details'});
      expect(button).toBeInTheDocument();
      // Button component with 'to' prop renders as React Router Link (no href in test env)
      expect(button.tagName).toBe('A');
    });

    it('displays an icon', function () {
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays text', function () {
      expect(screen.getByText(/pending reprocessing/i)).toBeInTheDocument();
    });
  });

  describe('showProject state', function () {
    beforeEach(() => {
      issue.numIssues = 9;
      renderWithTheme(
        <ProcessingIssueHint
          showProject
          issue={issue}
          orgId={orgId}
          projectId={projectId}
        />
      );
    });
    it('displays the project slug', function () {
      expect(screen.getByText(projectId)).toBeInTheDocument();
    });
  });
});
