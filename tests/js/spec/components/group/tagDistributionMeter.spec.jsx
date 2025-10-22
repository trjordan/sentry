import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import * as deviceName from 'app/components/deviceName';
import GroupTagDistributionMeter from 'app/components/group/tagDistributionMeter';

describe('TagDistributionMeter', function () {
  let organization;
  const tags = TestStubs.Tags();

  beforeEach(function () {
    organization = TestStubs.Organization();
  });

  describe('renderBody()', function () {
    it('should return null if loading', async function () {
      // Mock loadDeviceListModule to never resolve, keeping loading state
      const loadDeviceListModuleMock = jest
        .spyOn(deviceName, 'loadDeviceListModule')
        .mockImplementation(() => new Promise(() => {}));

      const {container} = renderWithTheme(
        <GroupTagDistributionMeter
          tag="browser"
          name="Browser"
          group={{id: '1337'}}
          organization={organization}
          projectId="456"
          totalValues={tags[0].totalValues}
          topValues={tags[0].topValues}
        />
      );

      // No segments should render while loading
      expect(
        container.querySelector('a[href*="/tags/browser/"]')
      ).not.toBeInTheDocument();

      loadDeviceListModuleMock.mockRestore();
    });

    it('should return null if in an error state', async function () {
      // Mock loadDeviceListModule to reject
      const loadDeviceListModuleMock = jest
        .spyOn(deviceName, 'loadDeviceListModule')
        .mockRejectedValue(new Error('Failed to load'));

      const {container} = renderWithTheme(
        <GroupTagDistributionMeter
          tag="browser"
          name="Browser"
          group={{id: '1337'}}
          organization={organization}
          projectId="456"
          totalValues={tags[0].totalValues}
          topValues={tags[0].topValues}
        />
      );

      // Wait for the async operation to complete (error state)
      await screen.findByText('browser');

      // No segments should render when in error state
      expect(
        container.querySelector('a[href*="/tags/browser/"]')
      ).not.toBeInTheDocument();

      loadDeviceListModuleMock.mockRestore();
    });

    it('should return "no recent data" if no total values present', async function () {
      // Mock successful loadDeviceListModule with generationByIdentifier method
      const mockIOSDeviceList = {
        generationByIdentifier: jest.fn(_identifier => undefined),
      };
      const loadDeviceListModuleMock = jest
        .spyOn(deviceName, 'loadDeviceListModule')
        .mockResolvedValue(mockIOSDeviceList);

      renderWithTheme(
        <GroupTagDistributionMeter
          tag="browser"
          name="Browser"
          group={{id: '1337'}}
          organization={organization}
          projectId="456"
          totalValues={0}
        />
      );

      // Wait for async operation and check for "No recent data." message
      expect(await screen.findByText('No recent data.')).toBeInTheDocument();

      loadDeviceListModuleMock.mockRestore();
    });

    it('should call renderSegments() if values present', async function () {
      // Mock successful loadDeviceListModule with generationByIdentifier method
      const mockIOSDeviceList = {
        generationByIdentifier: jest.fn(_identifier => undefined),
      };
      const loadDeviceListModuleMock = jest
        .spyOn(deviceName, 'loadDeviceListModule')
        .mockResolvedValue(mockIOSDeviceList);

      const {container} = renderWithTheme(
        <GroupTagDistributionMeter
          tag="browser"
          name="Browser"
          group={{id: '1337'}}
          organization={organization}
          projectId="456"
          totalValues={tags[0].totalValues}
          topValues={tags[0].topValues}
        />
      );

      // Wait for the component to finish loading
      await screen.findByText('browser');

      // 2 Segment components (Chrome and Firefox from tags[0].topValues)
      // Query by the styled component class instead of href
      const segments = container.querySelectorAll('a[class*="Segment"]');
      expect(segments).toHaveLength(2);

      // 1 OtherSegment component (for the remaining values)
      const otherSegments = container.querySelectorAll('span[class*="OtherSegment"]');
      expect(otherSegments).toHaveLength(1);

      loadDeviceListModuleMock.mockRestore();
    });
  });
});
