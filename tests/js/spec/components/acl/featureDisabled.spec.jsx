import React from 'react';

import {mountWithTheme} from 'sentry-test/enzyme';

import FeatureDisabled from 'app/components/acl/featureDisabled';
import {PanelAlert} from 'app/components/panels';

describe('FeatureDisabled', function () {
  it('renders', function () {
    const wrapper = mountWithTheme(
      <FeatureDisabled
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    expect(wrapper.text()).toContain(
      'This feature is not enabled on your Sentry installation.'
    );
    expect(wrapper.find('button').text()).toContain('Help');
  });

  it('renders with custom message', function () {
    const customMessage = 'custom message';
    const wrapper = mountWithTheme(
      <FeatureDisabled
        message={customMessage}
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    expect(wrapper.text()).toContain(customMessage);
  });

  it('renders as an Alert', function () {
    const wrapper = mountWithTheme(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    // Alert renders with a ref-warning class
    expect(wrapper.find('.ref-warning').exists()).toBeTruthy();
  });

  it('renders with custom alert component', function () {
    const wrapper = mountWithTheme(
      <FeatureDisabled
        alert={PanelAlert}
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    // PanelAlert renders with a ref-warning class (inherits from Alert)
    expect(wrapper.find('.ref-warning').exists()).toBeTruthy();
  });

  it('displays instructions when help is clicked', function () {
    const wrapper = mountWithTheme(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    wrapper.find('button').simulate('click');

    expect(wrapper.text()).toContain('Enable this feature on your sentry installation');
  });
});
