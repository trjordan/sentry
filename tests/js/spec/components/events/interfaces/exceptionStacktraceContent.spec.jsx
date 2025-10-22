import React from 'react';
import cloneDeep from 'lodash/cloneDeep';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import ExceptionStacktraceContent from 'app/components/events/interfaces/exceptionStacktraceContent';

describe('ExceptionStacktraceContent', () => {
  const stacktrace = {
    frames: [
      {
        function: null,
        colNo: null,
        vars: {},
        symbol: null,
        module: '<unknown module>',
        lineNo: null,
        errors: null,
        package: null,
        absPath:
          'https://sentry.io/hiventy/kraken-prod/issues/438681831/?referrer=slack#',
        inApp: false,
        instructionAddr: null,
        filename: '/hiventy/kraken-prod/issues/438681831/',
        platform: null,
        context: [],
        symbolAddr: null,
      },
      {
        absPath: 'foo/baz.c',
        colNo: null,
        context: [],
        errors: null,
        filename: 'foo/baz.c',
        function: null,
        inApp: false,
        instructionAddr: null,
        lineNo: 1,
        module: null,
        package: null,
        platform: null,
        rawFunction: null,
        symbol: null,
        symbolAddr: null,
        trust: null,
        vars: null,
      },
    ],
  };

  const props = {
    stackView: 'app',
    platform: 'node',
    expandFirstFrame: true,
    newestFirst: true,
    chainedException: false,
    event: {
      entries: [],
      crashFile: {
        sha1: 'sha1',
        name: 'name.dmp',
        dateCreated: '2019-05-21T18:01:48.762Z',
        headers: {'Content-Type': 'application/octet-stream'},
        id: '12345',
        size: 123456,
        type: 'event.minidump',
      },
      culprit: '',
      dateCreated: '2019-05-21T18:00:23Z',
      'event.type': 'error',
      eventID: '123456',
      groupID: '1',
      id: '98654',
      location: 'main.js',
      message: 'TestException',
      platform: 'native',
      projectID: '123',
      tags: [{value: 'production', key: 'production'}],
      title: 'TestException',
    },
    data: stacktrace,
    stacktrace,
    framesOmitted: null,
    registers: null,
    hasSystemFrames: false,
  };

  it('default behaviour', () => {
    const {container} = renderWithTheme(<ExceptionStacktraceContent {...props} />);
    expect(container).toSnapshot();
  });

  it('should return an emptyRender', () => {
    const {container} = renderWithTheme(
      <ExceptionStacktraceContent {...props} stacktrace={undefined} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should return the EmptyMessage component', () => {
    const {container} = renderWithTheme(<ExceptionStacktraceContent {...props} />);
    expect(container.querySelector('[data-test-id="empty-message"]')).toBeInTheDocument();
  });

  it('should not return the EmptyMessage component', () => {
    const modifiedProps = cloneDeep(props);
    modifiedProps.stacktrace.frames[0].inApp = true;
    const {container} = renderWithTheme(
      <ExceptionStacktraceContent {...modifiedProps} />
    );
    expect(
      container.querySelector('[data-test-id="empty-message"]')
    ).not.toBeInTheDocument();
  });

  it('should render system frames if "stackView: app" and there are no inApp frames and is a chained exceptions', () => {
    const {container} = renderWithTheme(
      <ExceptionStacktraceContent {...props} chainedException />
    );
    expect(
      container.querySelectorAll('[data-test-id="stack-trace-content-v3-line"]').length
    ).toBe(2);
  });

  it('should not render system frames if "stackView: app" and there are inApp frames and is a chained exceptions', () => {
    const modifiedProps = cloneDeep(props);
    modifiedProps.stacktrace.frames[0].inApp = true;
    const {container} = renderWithTheme(
      <ExceptionStacktraceContent {...modifiedProps} chainedException />
    );

    // There must be two elements, one being the inApp frame and the other
    // the last frame which is non-app frame
    const lines = container.querySelectorAll(
      '[data-test-id="stack-trace-content-v3-line"]'
    );
    expect(lines.length).toBe(2);

    // inApp === true
    expect(lines[1].querySelector('.filename')?.textContent).toBe(
      props.stacktrace.frames[0].filename
    );

    // inApp === false
    expect(lines[0].querySelector('.filename')?.textContent).toBe(
      props.stacktrace.frames[1].filename
    );
  });
});
