import React from 'react';

import '@testing-library/jest-dom';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

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

  describe('as render prop', function () {
    const childrenMock = jest.fn().mockReturnValue(null);
    beforeEach(function () {
      childrenMock.mockClear();
    });

    it('has features', function () {
      const features = ['org-foo', 'project-foo'];

      renderWithTheme(
        <Feature organization={organization} project={project} features={features}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasFeature: true,
        features,
        organization,
        project,
        renderDisabled: false,
      });
    });

    it('has features when requireAll is false', function () {
      const features = ['org-foo', 'project-foo', 'apple'];

      renderWithTheme(
        <Feature
          organization={organization}
          project={project}
          features={features}
          requireAll={false}
        >
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasFeature: true,
        organization,
        project,
        features,
        renderDisabled: false,
      });
    });

    it('has no features', function () {
      renderWithTheme(
        <Feature organization={organization} project={project} features={['org-baz']}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasFeature: false,
        organization,
        project,
        features: ['org-baz'],
        renderDisabled: false,
      });
    });

    it('calls render function when no features', function () {
      const noFeatureRenderer = jest.fn(() => null);
      renderWithTheme(
        <Feature
          organization={organization}
          project={project}
          features={['org-baz']}
          renderDisabled={noFeatureRenderer}
        >
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).not.toHaveBeenCalled();
      expect(noFeatureRenderer).toHaveBeenCalledWith({
        hasFeature: false,
        children: childrenMock,
        organization,
        project,
        features: ['org-baz'],
      });
    });

    it('can specify org from props', function () {
      const customOrg = TestStubs.Organization({features: ['org-bazar']});
      renderWithTheme(
        <Feature organization={customOrg} project={project} features={['org-bazar']}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasFeature: true,
        organization: customOrg,
        project,
        features: ['org-bazar'],
        renderDisabled: false,
      });
    });

    it('can specify project from props', function () {
      const customProject = TestStubs.Project({features: ['project-bazar']});
      renderWithTheme(
        <Feature
          organization={organization}
          project={customProject}
          features={['project-bazar']}
        >
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasFeature: true,
        organization,
        project: customProject,
        features: ['project-bazar'],
        renderDisabled: false,
      });
    });

    it('handles no org/project', function () {
      const features = ['org-foo', 'project-foo'];
      renderWithTheme(
        <Feature organization={organization} project={project} features={features}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFeature: true,
          organization,
          project,
          features,
          renderDisabled: false,
        })
      );
    });

    it('handles features prefixed with org/project', function () {
      renderWithTheme(
        <Feature
          organization={organization}
          project={project}
          features={['organizations:org-bar', 'projects:project-bar']}
        >
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasFeature: true,
        organization,
        project,
        features: ['organizations:org-bar', 'projects:project-bar'],
        renderDisabled: false,
      });
    });

    it('checks ConfigStore.config.features (e.g. passed from backend)', function () {
      ConfigStore.config = {
        features: new Set(['organizations:create']),
      };

      renderWithTheme(
        <Feature organization={organization} project={project} features={['organizations:create']}>
          {childrenMock}
        </Feature>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasFeature: true,
        organization,
        project,
        features: ['organizations:create'],
        renderDisabled: false,
      });
    });
  });

  describe('no children', function () {
    it('should display renderDisabled with no feature', function () {
      renderWithTheme(
        <Feature
          organization={organization}
          project={project}
          features={['org-baz']}
          renderDisabled={() => <span>disabled</span>}
        />
      );
      expect(screen.getByText('disabled')).toBeInTheDocument();
    });

    it('should display be empty when on', function () {
      const {container} = renderWithTheme(
        <Feature
          organization={organization}
          project={project}
          features={['org-bar']}
          renderDisabled={() => <span>disabled</span>}
        />
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('as React node', function () {
    it('has features', function () {
      renderWithTheme(
        <Feature organization={organization} project={project} features={['org-bar']}>
          <div>The Child</div>
        </Feature>
      );

      expect(screen.getByText('The Child')).toBeInTheDocument();
    });

    it('has no features', function () {
      renderWithTheme(
        <Feature organization={organization} project={project} features={['org-baz']}>
          <div>The Child</div>
        </Feature>
      );

      expect(screen.queryByText('The Child')).not.toBeInTheDocument();
    });

    it('renders a default disabled component', function () {
      renderWithTheme(
        <Feature
          organization={organization}
          project={project}
          features={['org-baz']}
          renderDisabled
        >
          <div>The Child</div>
        </Feature>
      );

      expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
      expect(screen.queryByText('The Child')).not.toBeInTheDocument();
    });

    it('calls renderDisabled function when no features', function () {
      const noFeatureRenderer = jest.fn(() => null);
      const children = <div>The Child</div>;
      renderWithTheme(
        <Feature
          organization={organization}
          project={project}
          features={['org-baz']}
          renderDisabled={noFeatureRenderer}
        >
          {children}
        </Feature>
      );

      expect(screen.queryByText('The Child')).not.toBeInTheDocument();
      expect(noFeatureRenderer).toHaveBeenCalledWith({
        hasFeature: false,
        children,
        organization,
        project,
        features: ['org-baz'],
      });
    });
  });

  describe('using HookStore for renderDisabled', function () {
    let hookFn;

    beforeEach(function () {
      hookFn = jest.fn(() => null);
      HookStore.hooks['feature-disabled:org-baz'] = [hookFn];
      HookStore.hooks['feature-disabled:test-hook'] = [hookFn];
    });

    afterEach(function () {
      delete HookStore.hooks['feature-disabled:org-baz'];
    });

    it('uses hookName if provided', function () {
      const children = <div>The Child</div>;
      renderWithTheme(
        <Feature
          organization={organization}
          project={project}
          features={['org-bazar']}
          hookName="feature-disabled:test-hook"
        >
          {children}
        </Feature>
      );

      expect(screen.queryByText('The Child')).not.toBeInTheDocument();

      expect(hookFn).toHaveBeenCalledWith({
        hasFeature: false,
        children,
        organization,
        project,
        features: ['org-bazar'],
      });
    });
  });
});
