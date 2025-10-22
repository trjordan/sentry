import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import SimilarSpectrum from 'app/components/similarSpectrum';

describe('SimilarSpectrum', function () {
  it('renders', function () {
    const {container} = renderWithTheme(<SimilarSpectrum />);

    // Verify the text labels are present
    expect(screen.getByText('Similar')).toBeInTheDocument();
    expect(screen.getByText('Not Similar')).toBeInTheDocument();

    // Verify 5 spectrum items are rendered (styled spans with background colors)
    const spectrumItems = container.querySelectorAll('span[class*="SpectrumItem"]');
    expect(spectrumItems).toHaveLength(5);
  });
});
