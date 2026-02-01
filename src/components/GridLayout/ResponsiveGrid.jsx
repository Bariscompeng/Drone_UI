import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGrid = ({ children, layouts, onLayoutChange }) => {
  const [width, setWidth] = useState(window.innerWidth - 240);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth - 240); // 220px sidebar + 20px padding
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <GridLayout
      className="layout"
      layout={layouts}
      cols={12}
      rowHeight={60}
      width={width}
      onLayoutChange={onLayoutChange}
      isDraggable={true}
      isResizable={true}
      compactType="vertical"
      preventCollision={false}
      margin={[16, 16]}
      containerPadding={[20, 20]}
      useCSSTransforms={true}
      draggableHandle=".panel-header"
      resizeHandles={['se', 'sw', 'ne', 'nw', 's', 'e', 'w', 'n']}
    >
      {children}
    </GridLayout>
  );
};

export default ResponsiveGrid;
