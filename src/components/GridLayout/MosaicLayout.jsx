import React from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { Settings, X } from 'lucide-react';
import 'react-mosaic-component/react-mosaic-component.css';

const MosaicLayout = ({ panels, renderPanel, onPanelClose, onPanelSettings, onLayoutChange }) => {
  const createMosaicTree = (panelList) => {
    if (!panelList || panelList.length === 0) return null;
    if (panelList.length === 1) return panelList[0].id.toString();
    
    const validPanels = panelList.filter(p => p && p.id);
    if (validPanels.length === 0) return null;
    if (validPanels.length === 1) return validPanels[0].id.toString();
    
    const ids = validPanels.map(p => p.id.toString());
    
    // 10 panel - 2x5 veya 3x4 düzen
    if (ids.length === 10) {
      return {
        direction: 'column',
        first: {
          direction: 'row',
          first: ids[0],
          second: {
            direction: 'row',
            first: ids[1],
            second: {
              direction: 'row',
              first: ids[2],
              second: ids[3],
              splitPercentage: 50
            },
            splitPercentage: 50
          },
          splitPercentage: 25
        },
        second: {
          direction: 'column',
          first: {
            direction: 'row',
            first: ids[4],
            second: {
              direction: 'row',
              first: ids[5],
              second: {
                direction: 'row',
                first: ids[6],
                second: ids[7],
                splitPercentage: 50
              },
              splitPercentage: 50
            },
            splitPercentage: 25
          },
          second: {
            direction: 'row',
            first: ids[8],
            second: ids[9],
            splitPercentage: 50
          },
          splitPercentage: 50
        },
        splitPercentage: 40
      };
    }
    
    // 9 panel - 3x3 grid
    if (ids.length === 9) {
      return {
        direction: 'column',
        first: {
          direction: 'row',
          first: ids[0],
          second: {
            direction: 'row',
            first: ids[1],
            second: ids[2],
            splitPercentage: 50
          },
          splitPercentage: 33.33
        },
        second: {
          direction: 'column',
          first: {
            direction: 'row',
            first: ids[3],
            second: {
              direction: 'row',
              first: ids[4],
              second: ids[5],
              splitPercentage: 50
            },
            splitPercentage: 33.33
          },
          second: {
            direction: 'row',
            first: ids[6],
            second: {
              direction: 'row',
              first: ids[7],
              second: ids[8],
              splitPercentage: 50
            },
            splitPercentage: 33.33
          },
          splitPercentage: 50
        },
        splitPercentage: 33.33
      };
    }
    
    // 8 panel - 2x4
    if (ids.length === 8) {
      return {
        direction: 'column',
        first: {
          direction: 'row',
          first: ids[0],
          second: {
            direction: 'row',
            first: ids[1],
            second: {
              direction: 'row',
              first: ids[2],
              second: ids[3],
              splitPercentage: 50
            },
            splitPercentage: 50
          },
          splitPercentage: 25
        },
        second: {
          direction: 'row',
          first: ids[4],
          second: {
            direction: 'row',
            first: ids[5],
            second: {
              direction: 'row',
              first: ids[6],
              second: ids[7],
              splitPercentage: 50
            },
            splitPercentage: 50
          },
          splitPercentage: 25
        },
        splitPercentage: 50
      };
    }
    
    // 7 panel
    if (ids.length === 7) {
      return {
        direction: 'column',
        first: {
          direction: 'row',
          first: ids[0],
          second: {
            direction: 'row',
            first: ids[1],
            second: {
              direction: 'row',
              first: ids[2],
              second: ids[3],
              splitPercentage: 50
            },
            splitPercentage: 50
          },
          splitPercentage: 25
        },
        second: {
          direction: 'row',
          first: ids[4],
          second: {
            direction: 'row',
            first: ids[5],
            second: ids[6],
            splitPercentage: 50
          },
          splitPercentage: 33.33
        },
        splitPercentage: 50
      };
    }
    
    // 6 panel - 2x3
    if (ids.length === 6) {
      return {
        direction: 'column',
        first: {
          direction: 'row',
          first: ids[0],
          second: {
            direction: 'row',
            first: ids[1],
            second: ids[2],
            splitPercentage: 50
          },
          splitPercentage: 33.33
        },
        second: {
          direction: 'row',
          first: ids[3],
          second: {
            direction: 'row',
            first: ids[4],
            second: ids[5],
            splitPercentage: 50
          },
          splitPercentage: 33.33
        },
        splitPercentage: 50
      };
    }
    
    // 5 panel
    if (ids.length === 5) {
      return {
        direction: 'column',
        first: {
          direction: 'row',
          first: ids[0],
          second: {
            direction: 'row',
            first: ids[1],
            second: ids[2],
            splitPercentage: 50
          },
          splitPercentage: 33.33
        },
        second: {
          direction: 'row',
          first: ids[3],
          second: ids[4],
          splitPercentage: 50
        },
        splitPercentage: 50
      };
    }
    
    // 4 panel - 2x2
    if (ids.length === 4) {
      return {
        direction: 'column',
        first: {
          direction: 'row',
          first: ids[0],
          second: ids[1],
          splitPercentage: 50
        },
        second: {
          direction: 'row',
          first: ids[2],
          second: ids[3],
          splitPercentage: 50
        },
        splitPercentage: 50
      };
    }
    
    // 3 panel
    if (ids.length === 3) {
      return {
        direction: 'row',
        first: ids[0],
        second: {
          direction: 'row',
          first: ids[1],
          second: ids[2],
          splitPercentage: 50
        },
        splitPercentage: 33.33
      };
    }
    
    // 2 panel
    if (ids.length === 2) {
      return {
        direction: 'row',
        first: ids[0],
        second: ids[1],
        splitPercentage: 50
      };
    }
    
    return ids[0];
  };

  const [currentNode, setCurrentNode] = React.useState(() => createMosaicTree(panels));

  React.useEffect(() => {
    const newTree = createMosaicTree(panels);
    setCurrentNode(newTree);
  }, [panels.length]);

  const onChange = (newNode) => {
    setCurrentNode(newNode);
    if (onLayoutChange) {
      onLayoutChange(newNode);
    }
  };

  const ELEMENT_MAP = {};
  panels.forEach(panel => {
    if (panel && panel.id) {
      ELEMENT_MAP[panel.id.toString()] = panel;
    }
  });

  if (!currentNode) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#8b92a0',
        fontSize: '14px'
      }}>
        No panels to display. Click "+ Add Panel" to get started.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Mosaic
        renderTile={(id, path) => {
          const panel = ELEMENT_MAP[id];
          if (!panel) {
            return (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                Panel not found
              </div>
            );
          }

          return (
            <MosaicWindow
              path={path}
              title={panel.title}
              createNode={() => panel.id.toString()}
              toolbarControls={[
                <button
                  key="settings"
                  onClick={() => onPanelSettings && onPanelSettings(panel)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8b92a0',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#00ff41'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#8b92a0'}
                >
                  <Settings size={14} />
                </button>,
                <button
                  key="close"
                  onClick={() => onPanelClose && onPanelClose(panel.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8b92a0',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ff4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#8b92a0'}
                >
                  <X size={14} />
                </button>
              ]}
            >
              <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                {renderPanel(panel)}
              </div>
            </MosaicWindow>
          );
        }}
        value={currentNode}
        onChange={onChange}
        className="mosaic-blueprint-theme mosaic-custom-theme"
        resize={{ minimumPaneSizePercentage: 10 }}
      />
    </div>
  );
};

export default MosaicLayout;
