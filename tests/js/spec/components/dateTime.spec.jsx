import React from 'react';

import {render} from 'sentry-test/reactTestingLibrary';

import DateTime from 'app/components/dateTime';
import ConfigStore from 'app/stores/configStore';

describe('DateTime', () => {
  const user = {
    ...TestStubs.User(),
    options: {
      clock24Hours: false,
      timezone: 'America/Los_Angeles',
    },
  };
  beforeAll(() => {
    ConfigStore.loadInitialData({user});
  });

  it('renders a date', () => {
    const {container} = render(<DateTime date={new Date()} />);
    expect(container).toHaveTextContent('Oct 16, 2017 7:41:20 PM PDT');
  });

  it('renders a date without seconds', () => {
    const {container} = render(<DateTime date={new Date()} seconds={false} />);
    expect(container).toHaveTextContent('Oct 16, 2017 7:41 PM');
  });

  it('renders timeonly', () => {
    const {container} = render(<DateTime date={new Date()} timeOnly />);
    expect(container).toHaveTextContent('7:41 PM');
  });

  it('renders dateOnly', () => {
    const {container} = render(<DateTime date={new Date()} dateOnly />);
    expect(container).toHaveTextContent('October 16, 2017');
  });

  it('renders shortDate', () => {
    const {container} = render(<DateTime date={new Date()} shortDate />);
    expect(container).toHaveTextContent('10/16/2017');
  });

  it('renders timeAndDate', () => {
    const {container} = render(<DateTime date={new Date()} timeAndDate />);
    expect(container).toHaveTextContent('Oct 16, 7:41 PM');
  });

  it('renders date with forced utc', () => {
    const {container} = render(<DateTime date={new Date()} utc />);
    expect(container).toHaveTextContent('Oct 17, 2017 2:41:20 AM UTC');
  });

  describe('24 Hours', () => {
    beforeAll(() => {
      user.options.clock24Hours = true;
      ConfigStore.set('user', user);
    });

    afterAll(() => {
      user.options.clock24Hours = false;
      ConfigStore.set('user', user);
    });

    it('renders a date', () => {
      const {container} = render(<DateTime date={new Date()} />);
      expect(container).toHaveTextContent('Oct 16, 2017 19:41');
    });

    it('renders timeonly', () => {
      const {container} = render(<DateTime date={new Date()} timeOnly />);
      expect(container).toHaveTextContent('19:41');
    });

    it('renders date with forced utc', () => {
      const {container} = render(<DateTime date={new Date()} utc />);
      expect(container).toHaveTextContent('Oct 17, 2017 02:41');
    });
  });
});
