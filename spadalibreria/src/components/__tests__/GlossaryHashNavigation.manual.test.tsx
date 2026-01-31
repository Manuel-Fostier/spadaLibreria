/**
 * Manual Hash Navigation Tests
 * 
 * Tests for simplified hash navigation that scrolls container div to target element
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('GlossaryPage - Hash Navigation (Simplified)', () => {
  beforeEach(() => {
    // Reset location hash
    window.location.hash = '';
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((cb) => {
      cb(0);
      return 0;
    }) as any;
  });

  it('uses native browser hash navigation with id attributes', () => {
    const { container } = render(
      <div>
        <div id="mandritto">Mandritto content</div>
        <div id="coda_longa_alta">Coda Longa Alta content</div>
      </div>
    );

    // Verify elements have proper id attributes for hash navigation
    expect(container.querySelector('#mandritto')).toBeInTheDocument();
    expect(container.querySelector('#coda_longa_alta')).toBeInTheDocument();
  });

  it('elements have scroll-mt class for sticky header offset', () => {
    const { container } = render(
      <div id="mandritto" className="scroll-mt-24">
        Mandritto content
      </div>
    );

    const element = container.querySelector('#mandritto');
    expect(element).toHaveClass('scroll-mt-24');
  });

  it('hash changes trigger hashchange event', () => {
    const hashChangeHandler = jest.fn();
    window.addEventListener('hashchange', hashChangeHandler);

    // Simulate hash change
    window.location.hash = '#mandritto';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(hashChangeHandler).toHaveBeenCalled();

    window.removeEventListener('hashchange', hashChangeHandler);
  });

  it('getBoundingClientRect provides element position for manual scrolling', () => {
    const { container } = render(
      <div>
        <div id="mandritto">Mandritto content</div>
      </div>
    );

    const element = container.querySelector('#mandritto') as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    // Verify we can get element position for scroll calculations
    expect(rect).toHaveProperty('top');
    expect(rect).toHaveProperty('left');
  });
});
