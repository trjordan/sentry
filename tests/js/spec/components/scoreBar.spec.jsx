import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import ScoreBar from 'app/components/scoreBar';

describe('ScoreBar', function () {
  beforeEach(function () {});

  afterEach(function () {});

  it('renders', function () {
    const {container} = renderWithTheme(<ScoreBar size={60} thickness={2} score={3} />);

    // Verify bars are rendered - default palette has 5 colors
    const bars = container.querySelectorAll('div[class*="-Bar"]');
    expect(bars).toHaveLength(5);

    // Verify the component is in the document
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders vertically', function () {
    const {container} = renderWithTheme(
      <ScoreBar size={60} thickness={2} vertical score={2} />
    );

    // Verify bars are rendered
    const bars = container.querySelectorAll('div[class*="-Bar"]');
    expect(bars).toHaveLength(5);

    // Verify the component is in the document
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with score = 0', function () {
    const {container} = renderWithTheme(<ScoreBar size={60} thickness={2} score={0} />);

    // Verify bars are rendered even with 0 score
    const bars = container.querySelectorAll('div[class*="-Bar"]');
    expect(bars).toHaveLength(5);

    // Verify the component is in the document
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with score > max score', function () {
    const {container} = renderWithTheme(<ScoreBar size={60} thickness={2} score={10} />);

    // Verify bars are rendered - should be clamped to palette length
    const bars = container.querySelectorAll('div[class*="-Bar"]');
    expect(bars).toHaveLength(5);

    // Verify the component is in the document
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with < 0 score', function () {
    const {container} = renderWithTheme(<ScoreBar size={60} thickness={2} score={-2} />);

    // Verify bars are rendered even with negative score
    const bars = container.querySelectorAll('div[class*="-Bar"]');
    expect(bars).toHaveLength(5);

    // Verify the component is in the document
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has custom palette', function () {
    const {container} = renderWithTheme(
      <ScoreBar
        vertical
        size={60}
        thickness={2}
        score={7}
        palette={['white', 'red', 'red', 'pink', 'pink', 'purple', 'purple', 'black']}
      />
    );

    // Verify bars are rendered with custom palette (8 colors)
    const bars = container.querySelectorAll('div[class*="-Bar"]');
    expect(bars).toHaveLength(8);

    // Verify the component is in the document
    expect(container.firstChild).toBeInTheDocument();
  });
});
