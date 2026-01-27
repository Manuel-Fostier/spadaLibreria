import { Annotation } from '../Annotation';

describe('Annotation class', () => {
  class TestAnnotation extends Annotation {
    constructor() {
      super(
        { color: '#000000', backgroundColor: 'rgba(0,0,0,0.1)', borderColor: 'rgba(0,0,0,0.2)', borderBottomColor: '#000000' },
        { color: '#000000' },
        'Test',
        true
      );
    }
  }

  it('getTextStyle returns current text style', () => {
    const ann = new TestAnnotation();
    expect(ann.getTextStyle()).toEqual({ color: '#000000' });
  });

  it('setStyle updates text and chip style colors', () => {
    const ann = new TestAnnotation();
    ann.setStyle('#ff0000');
    expect(ann.getTextStyle()).toEqual({ color: '#ff0000' });
    expect(ann.getChipStyle()).toMatchObject({
      color: '#ff0000',
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      borderColor: 'rgba(255, 0, 0, 0.2)',
      borderBottomColor: '#ff0000',
    });
  });

  it('setStyle falls back to indigo for invalid hex', () => {
    const ann = new TestAnnotation();
    ann.setStyle('not-a-color');
    expect(ann.getChipStyle()).toMatchObject({
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderColor: 'rgba(99, 102, 241, 0.2)',
    });
  });
});
