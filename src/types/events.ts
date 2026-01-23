/**
 * Event and handler types for React components
 * Provides type safety for DOM events and custom handlers
 */

import { ReactNode } from 'react';

export type MenuItemClickEvent = React.MouseEvent<HTMLElement> | React.SyntheticEvent;

export interface MenuCommandEvent {
  originalEvent?: React.SyntheticEvent;
  item?: {
    label: string;
    icon?: ReactNode;
    command?: (e: MenuCommandEvent) => void;
  };
}

export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type SelectChangeEvent<T> = T;

/**
 * Safe event handler that prevents default and stops propagation
 */
export const safeStopPropagation = (event: MenuItemClickEvent | MenuCommandEvent): void => {
  if (event && typeof event === 'object') {
    if ('originalEvent' in event && event.originalEvent) {
      const e = event.originalEvent as React.SyntheticEvent;
      e.stopPropagation?.();
    } else if ('stopPropagation' in event) {
      (event as React.SyntheticEvent).stopPropagation();
    }
  }
};

/**
 * Safely extract synthetic event from PrimeReact menu item events
 */
export const extractSyntheticEvent = (event: MenuCommandEvent | MenuItemClickEvent): MenuItemClickEvent | undefined => {
  if (event && typeof event === 'object') {
    if ('originalEvent' in event) {
      return (event as MenuCommandEvent).originalEvent;
    }
    return event as MenuItemClickEvent;
  }
  return undefined;
};
