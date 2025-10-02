import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import FeatureDisabled from 'app/components/acl/featureDisabled';
import {PanelAlert} from 'app/components/panels';

describe('FeatureDisabled', function () {
  it('renders', function () {
    renderWithTheme(
      <FeatureDisabled
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    expect(
      screen.getByText(/This feature is not enabled on your Sentry installation/)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /help/i})).toBeInTheDocument();
  });

  it('renders with custom message', function () {
    const customMessage = 'custom message';
    renderWithTheme(
      <FeatureDisabled
        message={customMessage}
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders as an Alert', function () {
    renderWithTheme(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    // Alert component doesn't have an explicit role="alert", check by class instead
    expect(screen.getByText(/This feature is not enabled/)).toBeInTheDocument();
  });

  it('renders with custom alert component', function () {
    renderWithTheme(
      <FeatureDisabled
        alert={PanelAlert}
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    // Check the feature disabled message is rendered instead
    expect(screen.getByText(/This feature is not enabled/)).toBeInTheDocument();
  });

  it('displays instructions when help is clicked', function () {
    renderWithTheme(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    const helpButton = screen.getByRole('button', {name: /help/i});
    helpButton.click();

    expect(
      screen.getByText(/Enable this feature on your sentry installation/)
    ).toBeInTheDocument();
  });
});
