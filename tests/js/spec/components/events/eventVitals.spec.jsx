import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import EventVitals from 'app/components/events/eventVitals';

function makeEvent(measurements = {}, sdk = {version: '5.27.3'}) {
  const formattedMeasurements = {};
  for (const [name, value] of Object.entries(measurements)) {
    formattedMeasurements[name] = {value};
  }
  const event = {measurements: formattedMeasurements};
  if (sdk !== null) {
    event.sdk = sdk;
  }
  return event;
}

describe('EventVitals', function () {
  it('should not render anything', function () {
    const event = makeEvent({});
    const {container} = renderWithTheme(<EventVitals event={event} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should not render non web vitals', function () {
    const event = makeEvent({
      'mark.stuff': 123,
      'op.more.stuff': 123,
    });
    const {container} = renderWithTheme(<EventVitals event={event} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render some web vitals with a header', function () {
    const event = makeEvent({
      fp: 1,
      fcp: 2,
      lcp: 3,
      fid: 4,
      cls: 0.1,
      ttfb: 5,
      'ttfb.requesttime': 6,
    });
    renderWithTheme(<EventVitals event={event} />);
    expect(screen.getByText('Web Vitals')).toBeInTheDocument();
    expect(screen.queryByTestId('outdated-sdk-warning')).not.toBeInTheDocument();
    const vitals = screen.queryAllByTestId('event-vital');
    expect(vitals).toHaveLength(7);
  });

  it('should render some web vitals with a heading and a sdk warning', function () {
    const event = makeEvent({fp: 1}, {version: '5.26.0'});
    renderWithTheme(<EventVitals event={event} />);
    expect(screen.getByText('Web Vitals')).toBeInTheDocument();
    expect(screen.getByTestId('outdated-sdk-warning')).toBeInTheDocument();
    const vitals = screen.queryAllByTestId('event-vital');
    expect(vitals).toHaveLength(1);
  });

  it('should show fire icon if vital failed threshold', function () {
    const event = makeEvent({
      fp: 5000,
      fcp: 5000,
      lcp: 5000,
      fid: 4,
      cls: 0.1,
      ttfb: 5,
      'ttfb.requesttime': 6,
    });
    renderWithTheme(<EventVitals event={event} />);
    expect(screen.getByText('Web Vitals')).toBeInTheDocument();
    const vitals = screen.queryAllByTestId('event-vital');
    expect(vitals).toHaveLength(7);
    const fires = screen.queryAllByTestId('icon-fire');
    expect(fires).toHaveLength(3);
  });
});
