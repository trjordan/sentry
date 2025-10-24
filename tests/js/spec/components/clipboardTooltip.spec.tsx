import React from 'react';

import {render, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import ClipboardTooltip from 'app/components/clipboardTooltip';

describe('ClipboardTooltip', function () {
  it('renders', async function () {
    const title = 'tooltip content';
    const {container} = render(
      <ClipboardTooltip title={title}>
        <span>This text displays a tooltip when hovering</span>
      </ClipboardTooltip>
    );

    // Hover over the trigger element to open tooltip
    const trigger = screen.getByText('This text displays a tooltip when hovering');
    await userEvent.hover(trigger);

    // Wait for tooltip to appear - verify title text is visible
    await screen.findByText(title);

    // Verify TooltipClipboardWrapper is rendered (the styled div container)
    const tooltipClipboardWrapper = container.querySelector('[class*="TooltipClipboardWrapper"]');
    expect(tooltipClipboardWrapper).toBeInTheDocument();

    // Verify TextOverflow component contains the title text
    const textOverflow = container.querySelector('[class*="TextOverflow"]');
    expect(textOverflow).toBeInTheDocument();
    expect(textOverflow).toHaveTextContent(title);

    // Verify Clipboard component is present with the title value
    // Clipboard wraps a button element
    const clipboardButton = container.querySelector('button[aria-label="Copy"]');
    expect(clipboardButton).toBeInTheDocument();

    // Verify IconCopy component is present within the Clipboard
    // IconCopy renders as an SVG within the clipboard button
    const iconCopy = clipboardButton?.querySelector('svg');
    expect(iconCopy).toBeInTheDocument();
  });
});
