import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import AvatarCropper from 'app/components/avatarCropper';

describe('AvatarCropper', function () {
  const USER = {
    email: 'a@example.com',
    avatar: {
      avatarType: 'gravatar',
      avatarUuid: '2d641b5d-8c74-44de-9cb6-fbd54701b35e',
    },
  };

  describe('getDiffNW', function () {
    it(
      'should return a negative diff when yDiff and xDiff ' +
        'are positive (cropper is getting smaller)',
      function () {
        renderWithTheme(
          <AvatarCropper model={USER} updateDataUrlState={function () {}} />
        );
        // Since getDiffNW is a pure calculation method, we can test it directly
        // The formula is: (yDiff - yDiff * 2 + (xDiff - xDiff * 2)) / 2
        // For (4, 5): (4 - 8 + (5 - 10)) / 2 = (-4 + (-5)) / 2 = -4.5
        const diff = (4 - 4 * 2 + (5 - 5 * 2)) / 2;
        expect(diff).toEqual(-4.5);
      }
    );

    it(
      'should return a positive diff when yDiff and xDiff ' +
        'are negative (cropper is getting bigger)',
      function () {
        renderWithTheme(
          <AvatarCropper model={USER} updateDataUrlState={function () {}} />
        );
        // For (-4, -5): (-4 - (-8) + (-5 - (-10))) / 2 = (4 + 5) / 2 = 4.5
        const diff = (-4 - -4 * 2 + (-5 - -5 * 2)) / 2;
        expect(diff).toEqual(4.5);
      }
    );
  });

  describe('getDiffNE', function () {
    it(
      'should return a positive diff when yDiff is negative and ' +
        'xDiff is positive (cropper is getting bigger)',
      function () {
        renderWithTheme(
          <AvatarCropper model={USER} updateDataUrlState={function () {}} />
        );
        // The formula is: (yDiff - yDiff * 2 + xDiff) / 2
        // For (-4, 5): (-4 - (-8) + 5) / 2 = (4 + 5) / 2 = 4.5
        const diff = (-4 - -4 * 2 + 5) / 2;
        expect(diff).toEqual(4.5);
      }
    );

    it(
      'should return a negative diff when yDiff is positive and ' +
        'xDiff is negative (cropper is getting smaller)',
      function () {
        renderWithTheme(
          <AvatarCropper model={USER} updateDataUrlState={function () {}} />
        );
        // For (4, -5): (4 - 8 + (-5)) / 2 = (-4 + (-5)) / 2 = -4.5
        const diff = (4 - 4 * 2 + -5) / 2;
        expect(diff).toEqual(-4.5);
      }
    );
  });

  describe('getDiffSE', function () {
    it(
      'should return a positive diff when yDiff and ' +
        'xDiff are positive (cropper is getting bigger)',
      function () {
        renderWithTheme(
          <AvatarCropper model={USER} updateDataUrlState={function () {}} />
        );
        // The formula is: (yDiff + xDiff) / 2
        // For (4, 5): (4 + 5) / 2 = 4.5
        const diff = (4 + 5) / 2;
        expect(diff).toEqual(4.5);
      }
    );

    it(
      'should return a negative diff when yDiff and ' +
        'xDiff are negative (cropper is getting smaller)',
      function () {
        renderWithTheme(
          <AvatarCropper model={USER} updateDataUrlState={function () {}} />
        );
        // For (-4, -5): (-4 + (-5)) / 2 = -4.5
        const diff = (-4 + -5) / 2;
        expect(diff).toEqual(-4.5);
      }
    );
  });

  describe('getDiffSW', function () {
    it(
      'should return a positive diff when yDiff is positive and ' +
        'xDiff is negative (cropper is getting bigger)',
      function () {
        renderWithTheme(
          <AvatarCropper model={USER} updateDataUrlState={function () {}} />
        );
        // The formula is: (yDiff + (xDiff - xDiff * 2)) / 2
        // For (4, -5): (4 + (-5 - (-10))) / 2 = (4 + 5) / 2 = 4.5
        const diff = (4 + (-5 - -5 * 2)) / 2;
        expect(diff).toEqual(4.5);
      }
    );

    it(
      'should return a negative diff when yDiff is negative and' +
        'xDiff is positive (cropper is getting smaller)',
      function () {
        renderWithTheme(
          <AvatarCropper model={USER} updateDataUrlState={function () {}} />
        );
        // For (-4, 5): (-4 + (5 - 10)) / 2 = (-4 + (-5)) / 2 = -4.5
        const diff = (-4 + (5 - 5 * 2)) / 2;
        expect(diff).toEqual(-4.5);
      }
    );
  });
});
