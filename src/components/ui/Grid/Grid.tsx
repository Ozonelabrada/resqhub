import React from 'react';

export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 1 | 2 | 3 | 4 | 6 | 8;
  className?: string;
  responsive?: boolean;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 4,
  className = '',
  responsive = true
}) => {
  const gridCols = responsive ? {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
  } : {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  };

  const gapClasses = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  const classes = `grid ${gridCols[cols]} ${gapClasses[gap]} ${className}`;

  return <div className={classes}>{children}</div>;
};

// Grid item component for more control
export interface GridItemProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4 | 6 | 12;
  className?: string;
  responsive?: boolean;
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  span = 1,
  className = '',
  responsive = true
}) => {
  const spanClasses = responsive ? {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-4',
    6: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6',
    12: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-6'
  } : {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    6: 'col-span-6',
    12: 'col-span-12'
  };

  const classes = `${spanClasses[span]} ${className}`;

  return <div className={classes}>{children}</div>;
};