import React from 'react';

/**
 * Abstract base class for all annotation types
 * Defines the interface and common behavior for annotation styling
 */
export abstract class Annotation {
  protected chipStyle: React.CSSProperties;
  protected textStyle: React.CSSProperties;
  protected label: string;
  protected visibility: boolean;

  constructor(
    chipStyle: React.CSSProperties,
    textStyle: React.CSSProperties,
    label: string,
    visibility: boolean = true
  ) {
    this.chipStyle = chipStyle;
    this.textStyle = textStyle;
    this.label = label;
    this.visibility = visibility;
  }

  /**
   * Returns the CSS properties for chip display in annotation panel
   */
  public getChipStyle(): React.CSSProperties {
    return this.chipStyle;
  }

  /**
   * Returns the CSS properties for highlighted terms in text content
   */
  public getTextStyle(): React.CSSProperties {
    return this.textStyle;
  }

  /**
   * Returns the label for this annotation type
   */
  public getLabel(): string {
    return this.label;
  }

  /**
   * Returns visibility state
   * When false, the annotation is not displayed in the annotation list under chapter titles
   */
  public isVisible(): boolean {
    return this.visibility;
  }

  /**
   * Updates the label (max 25 characters)
   */
  public setLabel(label: string): void {
    if (label.length > 25) {
      console.warn(`Label "${label}" exceeds 25 character limit. Truncating.`);
      this.label = label.slice(0, 22) + '...';
    } else {
      this.label = label;
    }
  }

  /**
   * Sets visibility state
   */
  public setVisibility(visible: boolean): void {
    this.visibility = visible;
  }

  /**
   * Updates the color and recalculates all style properties consistently
   * Called by the configuration menu's color picker
   *
   * Guarantees that:
   * - textStyle.color and chipStyle.color are identical
   * - chipStyle.backgroundColor uses 10% opacity of the color
   * - chipStyle.borderColor uses 20% opacity of the color
   * - chipStyle.borderBottomColor uses the full color value
   */
  public setStyle(colorValue: string): void {
    const rgb = this.hexToRgb(colorValue);

    // Update text style (primary color only)
    this.textStyle = {
      ...this.textStyle,
      color: colorValue,
    };

    // Update chip style (color + calculated background/borders)
    this.chipStyle = {
      ...this.chipStyle,
      color: colorValue,
      backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
      borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
      borderBottomColor: colorValue,
    };
  }

  /**
   * Converts hex color to RGB components
   * Used internally by setStyle() for opacity calculations
   */
  protected hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      console.warn(`Invalid hex color "${hex}". Using default indigo.`);
      return { r: 99, g: 102, b: 241 }; // indigo-600
    }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
}
