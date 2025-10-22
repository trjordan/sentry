import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import FrameRegisters from 'app/components/events/interfaces/frameRegisters';
import FrameRegistersValue from 'app/components/events/interfaces/frameRegisters/value';

// Mock document.createRange which is used by userEvent
document.createRange = () => {
  const range = {
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    collapsed: false,
    endContainer: document,
    endOffset: 0,
    startContainer: document,
    startOffset: 0,
    cloneContents: jest.fn(),
    cloneRange: jest.fn(),
    collapse: jest.fn(),
    compareBoundaryPoints: jest.fn(),
    comparePoint: jest.fn(),
    createContextualFragment: jest.fn(),
    deleteContents: jest.fn(),
    detach: jest.fn(),
    extractContents: jest.fn(),
    getBoundingClientRect: jest.fn(() => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: jest.fn(),
    })),
    getClientRects: jest.fn(),
    insertNode: jest.fn(),
    intersectsNode: jest.fn(),
    isPointInRange: jest.fn(),
    selectNode: jest.fn(),
    selectNodeContents: jest.fn(),
    setEndAfter: jest.fn(),
    setEndBefore: jest.fn(),
    setStartAfter: jest.fn(),
    setStartBefore: jest.fn(),
    surroundContents: jest.fn(),
    toString: jest.fn(),
  };
  return range;
};

describe('FrameRegisters', () => {
  it('should render registers', () => {
    const registers = {
      r10: '0x00007fff9300bf70',
      r11: '0xffffffffffffffff',
      r12: '0x0000000000000000',
    };

    const {container} = renderWithTheme(<FrameRegisters registers={registers} />);
    expect(
      container.querySelectorAll('[data-test-id="frame-registers-value"]')
    ).toHaveLength(3);
  });

  it('should skip registers without a value', () => {
    const registers = {
      r10: '0x00007fff9300bf70',
      r11: null,
      r12: '0x0000000000000000',
    };

    const {container} = renderWithTheme(<FrameRegisters registers={registers} />);
    expect(
      container.querySelectorAll('[data-test-id="frame-registers-value"]')
    ).toHaveLength(2);
  });
});

describe('RegisterValue', () => {
  describe('with string value', () => {
    it('should display the hexadecimal value', () => {
      const {container} = renderWithTheme(
        <FrameRegistersValue value="0x000000000000000a" />
      );
      expect(
        container.querySelector('[data-test-id="frame-registers-value"]')
      ).toHaveTextContent('0x000000000000000a');
    });

    it('should display the numeric value', async () => {
      const {container} = renderWithTheme(
        <FrameRegistersValue value="0x000000000000000a" />
      );

      await userEvent.click(screen.getByRole('img'));

      expect(
        container.querySelector('[data-test-id="frame-registers-value"]')
      ).toHaveTextContent('10');
    });
  });

  describe('with numeric value', () => {
    it('should display the hexadecimal value', () => {
      const {container} = renderWithTheme(<FrameRegistersValue value={10} />);
      expect(
        container.querySelector('[data-test-id="frame-registers-value"]')
      ).toHaveTextContent('0x000000000000000a');
    });

    it('should display the numeric value', async () => {
      const {container} = renderWithTheme(<FrameRegistersValue value={10} />);

      await userEvent.click(screen.getByRole('img'));

      expect(
        container.querySelector('[data-test-id="frame-registers-value"]')
      ).toHaveTextContent('10');
    });
  });

  describe('with unknown value', () => {
    it('should display the hexadecimal value', () => {
      const {container} = renderWithTheme(<FrameRegistersValue value="xyz" />);
      expect(
        container.querySelector('[data-test-id="frame-registers-value"]')
      ).toHaveTextContent('xyz');
    });

    it('should display the numeric value', async () => {
      const {container} = renderWithTheme(<FrameRegistersValue value="xyz" />);

      await userEvent.click(screen.getByRole('img'));

      expect(
        container.querySelector('[data-test-id="frame-registers-value"]')
      ).toHaveTextContent('xyz');
    });
  });
});
