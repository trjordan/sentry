import React from 'react';

import '@testing-library/jest-dom';

import {render, screen} from 'sentry-test/rtl';

import Feature from 'app/components/acl/feature';
import ConfigStore from 'app/stores/configStore';
import HookStore from 'app/stores/hookStore';

describe('Feature', function () {
  const organization = TestStubs.Organization({
    features: ['org-foo', 'org-bar', 'bar'],
  });
  const project = TestStubs.Project({
    features: ['project-foo', 'project-bar'],
  });
  const config = ConfigStore.getConfig();

  const defaultProps = {
    organization,
    project,
    config,
  };

  describe('as render prop', function () {
    const childrenMock = jest.fn().mockReturnValue(null);

    beforeEach(function () {
      childrenMock.mockClear();
    });

    it('has features', function () {
      render(
        <Feature features={['org-foo', 'org-bar']} {...defaultProps}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: true,
          features: ['org-foo', 'org-bar'],
          organization,
          project,
        })
      );
    });

    it('has features when requireAll is false', function () {
      render(
        <Feature features={['org-foo', 'org-bar', 'org-baz']} requireAll={false} {...defaultProps}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: true,
          features: ['org-foo', 'org-bar', 'org-baz'],
        })
      );
    });

    it('has no features', function () {
      render(
        <Feature features={['org-baz']} {...defaultProps}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: false,
          features: ['org-baz'],
          organization,
          project,
        })
      );
    });

    it('calls render function when no features', function () {
      const noFeatureRenderer = jest.fn(() => null);
      render(
        <Feature features={['org-baz']} renderDisabled={noFeatureRenderer} {...defaultProps}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).not.toHaveBeenCalled();
      expect(noFeatureRenderer).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: false,
          features: ['org-baz'],
          organization,
          project,
          children: childrenMock,
        })
      );
    });

    it('can specify organization from props', function () {
      const customOrg = TestStubs.Organization({features: ['org-bazar']});
      render(
        <Feature
          organization={customOrg}
          project={project}
          config={config}
          features={['org-bazar']}
        >
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: true,
          features: ['org-bazar'],
          organization: customOrg,
          project,
        })
      );
    });

    it('can specify project from props', function () {
      const customProject = TestStubs.Project({features: ['project-baz']});
      render(
        <Feature
          organization={organization}
          project={customProject}
          config={config}
          features={['project-baz']}
        >
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: true,
          features: ['project-baz'],
          organization,
          project: customProject,
        })
      );
    });

    it('handles features prefixed with org/project', function () {
      render(
        <Feature features={['organizations:org-bar']} {...defaultProps}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: true,
          features: ['organizations:org-bar'],
          organization,
          project,
        })
      );

      childrenMock.mockClear();

      render(
        <Feature features={['projects:project-bar']} {...defaultProps}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: true,
          features: ['projects:project-bar'],
          organization,
          project,
        })
      );
    });

    it('checks ConfigStore.config.features', function () {
      ConfigStore.loadInitialData({
        ...config,
        features: new Set(['config-bar']),
      });

      render(
        <Feature features={['config-bar']} {...defaultProps} config={ConfigStore.getConfig()}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: true,
          features: ['config-bar'],
        })
      );

      // Reset ConfigStore
      ConfigStore.loadInitialData(config);
    });
  });

  describe('as React node', function () {
    it('has features', function () {
      render(
        <Feature features={['org-bar']} {...defaultProps}>
          <div>The Child</div>
        </Feature>
      );

      expect(screen.getByText('The Child')).toBeInTheDocument();
    });

    it('has no features', function () {
      render(
        <Feature features={['org-baz']} {...defaultProps}>
          <div>The Child</div>
        </Feature>
      );

      expect(screen.queryByText('The Child')).not.toBeInTheDocument();
    });

    it('renders a default disabled component', function () {
      render(
        <Feature features={['org-baz']} renderDisabled {...defaultProps}>
          <div>The Child</div>
        </Feature>
      );

      expect(screen.queryByText('The Child')).not.toBeInTheDocument();
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    });

    it('calls renderDisabled function when no features', function () {
      const noFeatureRenderer = jest.fn(() => <div>No Feature</div>);
      render(
        <Feature features={['org-baz']} renderDisabled={noFeatureRenderer} {...defaultProps}>
          <div>The Child</div>
        </Feature>
      );

      expect(screen.getByText('No Feature')).toBeInTheDocument();
      expect(noFeatureRenderer).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: false,
          features: ['org-baz'],
          organization,
          project,
        })
      );
    });
  });

  describe('using HookStore for renderDisabled', function () {
    let hookFn;

    beforeEach(function () {
      hookFn = jest.fn(() => null);
      HookStore.init();
      HookStore.add('feature-disabled:alerts-page', hookFn);
    });

    afterEach(function () {
      HookStore.init();
    });

    it('uses hookName if provided', function () {
      render(
        <Feature features={['org-baz']} hookName="feature-disabled:alerts-page" {...defaultProps}>
          <div>The Child</div>
        </Feature>
      );

      expect(hookFn).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: false,
          features: ['org-baz'],
          organization,
          project,
          children: <div>The Child</div>,
        })
      );
    });

    it('hookName overrides renderDisabled', function () {
      const noFeatureRenderer = jest.fn(() => null);

      render(
        <Feature
          features={['org-baz']}
          hookName="feature-disabled:alerts-page"
          renderDisabled={noFeatureRenderer}
          {...defaultProps}
        >
          <div>The Child</div>
        </Feature>
      );

      expect(hookFn).toHaveBeenCalled();
      expect(noFeatureRenderer).not.toHaveBeenCalled();
    });
  });
});
