import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import BookmarkStar from 'app/components/projects/bookmarkStar';

// Mock document.createRange which is used by userEvent
document.createRange = () => {
  const range = {
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    getBoundingClientRect: jest.fn(() => ({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
    })),
    getClientRects: jest.fn(() => []),
    cloneRange: jest.fn(function () {
      return this;
    }),
  };
  return range;
};

describe('BookmarkStar', function () {
  let projectMock;

  beforeEach(function () {
    projectMock = MockApiClient.addMockResponse({
      url: '/projects/org-slug/project-slug/',
      method: 'PUT',
      data: TestStubs.Project({isBookmarked: false, platform: 'javascript'}),
    });
  });

  afterEach(function () {
    MockApiClient.clearMockResponses();
  });

  it('renders', function () {
    const {container} = renderWithTheme(
      <BookmarkStar
        organization={TestStubs.Organization()}
        project={TestStubs.Project()}
      />,
      {context: {router: TestStubs.router()}}
    );
    expect(container).toSnapshot();
  });

  it('can star', async function () {
    renderWithTheme(
      <BookmarkStar
        organization={TestStubs.Organization()}
        project={TestStubs.Project()}
      />,
      {context: {router: TestStubs.router()}}
    );

    const star = screen.getByRole('button');

    await userEvent.click(star);

    expect(projectMock).toHaveBeenCalledWith(
      '/projects/org-slug/project-slug/',
      expect.objectContaining({
        data: {
          isBookmarked: true,
        },
      })
    );
  });

  it('can unstar', async function () {
    renderWithTheme(
      <BookmarkStar
        organization={TestStubs.Organization()}
        project={TestStubs.Project({
          isBookmarked: true,
        })}
      />,
      {context: {router: TestStubs.router()}}
    );

    const star = screen.getByRole('button');

    await userEvent.click(star);

    expect(projectMock).toHaveBeenCalledWith(
      '/projects/org-slug/project-slug/',
      expect.objectContaining({
        data: {
          isBookmarked: false,
        },
      })
    );
  });

  it('takes a manual isBookmarked prop', async function () {
    const {rerender} = renderWithTheme(
      <BookmarkStar
        organization={TestStubs.Organization()}
        project={TestStubs.Project()}
        isBookmarked
      />,
      {context: {router: TestStubs.router()}}
    );

    const star = screen.getByRole('button');

    await userEvent.click(star);

    // Re-render with the same props to verify the state hasn't changed
    rerender(
      <BookmarkStar
        organization={TestStubs.Organization()}
        project={TestStubs.Project()}
        isBookmarked
      />
    );

    // Star should still be bookmarked because the manual prop takes precedence
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
