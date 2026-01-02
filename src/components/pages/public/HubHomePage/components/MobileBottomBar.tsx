import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { CSSTransition } from 'react-transition-group';

interface MobileBottomBarProps {
  isBelowDesktop: boolean;
  showBottomBar: boolean;
  onReportAction: (type: 'lost' | 'found') => void;
}

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  isBelowDesktop,
  showBottomBar,
  onReportAction
}) => {
  const bottomBarRef = useRef<HTMLDivElement>(null);

  if (!isBelowDesktop) return null;

  return (
    <CSSTransition
      in={showBottomBar}
      timeout={300}
      classNames="fade-bottom-bar"
      unmountOnExit
      nodeRef={bottomBarRef}
    >
      <div
        ref={bottomBarRef}
        className="fixed left-0 right-0 z-5 flex justify-content-center fade-bottom-bar"
        style={{
          bottom: 20,
          pointerEvents: 'none'
        }}
      >
        <div
          className="flex gap-3 p-2"
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            pointerEvents: 'auto',
            minWidth: 320,
            maxWidth: 420,
            transition: 'opacity 0.3s'
          }}
        >
          <Button
            label="Lost"
            icon="pi pi-minus-circle"
            className="p-button-lg flex-1"
            style={{
              background: 'linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 12
            }}
            onClick={() => onReportAction('lost')}
          />
          <Button
            label="Found"
            icon="pi pi-plus-circle"
            className="p-button-lg flex-1"
            style={{
              background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 12
            }}
            onClick={() => onReportAction('found')}
          />
        </div>
      </div>
    </CSSTransition>
  );
};

export default MobileBottomBar;