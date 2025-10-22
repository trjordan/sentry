import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import ResolutionBox from 'app/components/resolutionBox';

describe('ResolutionBox', function () {
  describe('render()', function () {
    it('handles inNextRelease', function () {
      renderWithTheme(
        <ResolutionBox statusDetails={{inNextRelease: true}} projectId="1" />
      );
      expect(
        screen.getByText(
          'This issue has been marked as resolved in the upcoming release.'
        )
      ).toBeInTheDocument();
    });
    it('handles inNextRelease with actor', function () {
      renderWithTheme(
        <ResolutionBox
          statusDetails={{
            inNextRelease: true,
            actor: {id: '111', name: 'David Cramer', email: 'david@sentry.io'},
          }}
          projectId="1"
        />
      );
      expect(screen.getByText('David Cramer')).toBeInTheDocument();
      expect(
        screen.getByText(/marked this issue as resolved in the upcoming release/)
      ).toBeInTheDocument();
    });
    it('handles inRelease', function () {
      renderWithTheme(
        <ResolutionBox
          statusDetails={{
            inRelease: '1.0',
          }}
          projectId="1"
        />
      );
      expect(
        screen.getByText('This issue has been marked as resolved in version')
      ).toBeInTheDocument();
      expect(screen.getByText('1.0')).toBeInTheDocument();
    });
    it('handles inRelease with actor', function () {
      renderWithTheme(
        <ResolutionBox
          statusDetails={{
            inRelease: '1.0',
            actor: {id: '111', name: 'David Cramer', email: 'david@sentry.io'},
          }}
          projectId="1"
        />
      );
      expect(screen.getByText('David Cramer')).toBeInTheDocument();
      expect(
        screen.getByText(/marked this issue as resolved in version/)
      ).toBeInTheDocument();
      expect(screen.getByText('1.0')).toBeInTheDocument();
    });
    it('handles default', function () {
      renderWithTheme(<ResolutionBox statusDetails={{}} projectId="1" />);
      expect(
        screen.getByText('This issue has been marked as resolved.')
      ).toBeInTheDocument();
    });
    it('handles inCommit', function () {
      const commit = TestStubs.Commit();
      renderWithTheme(
        <ResolutionBox
          statusDetails={{
            inCommit: commit,
          }}
          projectId="1"
        />
      );
      expect(
        screen.getByText('This issue has been marked as resolved by')
      ).toBeInTheDocument();
      // Verify commit link is rendered
      expect(screen.getByText(commit.id.substring(0, 7))).toBeInTheDocument();
    });
  });
});
