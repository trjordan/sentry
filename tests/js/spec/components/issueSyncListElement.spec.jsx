import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import IssueSyncListElement from 'app/components/issueSyncListElement';

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

describe('IssueSyncListElement', function () {
  it('renders', function () {
    renderWithTheme(<IssueSyncListElement integrationType="github" />);
    expect(screen.getByText('Link GitHub Issue')).toBeInTheDocument();
  });

  it('can open', async function () {
    const onOpen = jest.fn();
    renderWithTheme(<IssueSyncListElement integrationType="github" onOpen={onOpen} />);
    expect(onOpen).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Link GitHub Issue'));
    expect(onOpen).toHaveBeenCalled();
  });

  it('can close', async function () {
    const onClose = jest.fn();
    const onOpen = jest.fn();

    const {container} = renderWithTheme(
      <IssueSyncListElement
        integrationType="github"
        externalIssueLink="github.com/issues/gh-101"
        externalIssueId={101}
        onClose={onClose}
        onOpen={onOpen}
      />
    );

    expect(onClose).not.toHaveBeenCalled();
    // Click the close icon (IconClose is wrapped in a span with onClick)
    const closeIcon = container.querySelector('span[class*="StyledIcon"]');
    await userEvent.click(closeIcon);
    expect(onClose).toHaveBeenCalled();
  });
});
