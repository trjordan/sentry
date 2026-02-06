import {render} from 'sentry-test/reactTestingLibrary';

import {
  formatStoreCrashReports,
  getStoreCrashReportsValues,
} from 'app/utils/crashReports';

describe('crashReportsUtils', () => {
  it('returns correct values for organization scope', () => {
    expect(getStoreCrashReportsValues(0)).toEqual([0, 1, 5, 10, 20, -1]);
  });
  it('returns correct values for project scope', () => {
    expect(getStoreCrashReportsValues(1)).toEqual([null, 0, 1, 5, 10, 20, -1]);
  });
  it('formats the value', () => {
    expect(formatStoreCrashReports(-1)).toBe('Unlimited');
    expect(formatStoreCrashReports(0)).toBe('Disabled');

    const {container: container1} = render(<div>{formatStoreCrashReports(10)}</div>);
    expect(container1.textContent).toBe('10 per issue');

    const {container: container2} = render(
      <div>{formatStoreCrashReports(null, 5)}</div>
    );
    expect(container2.textContent).toBe('Inherit organization settings (5 per issue)');

    const {container: container3} = render(
      <div>{formatStoreCrashReports(null, 0)}</div>
    );
    expect(container3.textContent).toBe('Inherit organization settings (Disabled)');
  });
});
