import React, { useCallback, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Paper } from '@mantine/core';

const DataPlot = ({ 
  data, 
  xColumn, 
  yColumn, 
  onSelection, 
  totalPoints, 
  visibleRange 
}) => {
  const visibleData = useMemo(() => {
    const start = Math.max(0, visibleRange.start);
    const end = Math.min(totalPoints, visibleRange.end);
    return {
      x: data[xColumn]?.slice(start, end) || [],
      y: data[yColumn]?.slice(start, end) || []
    };
  }, [data, xColumn, yColumn, visibleRange, totalPoints]);

  const handleSelection = useCallback((event) => {
    if (event && event.points) {
      const selectedIndices = event.points.map(point => 
        point.pointIndex + visibleRange.start
      );
      onSelection(selectedIndices);
    }
  }, [onSelection, visibleRange.start]);

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Plot
        data={[
          {
            x: visibleData.x,
            y: visibleData.y,
            type: 'scattergl',
            mode: 'markers',
            marker: { 
              size: 4,
              color: '#228be6',
              opacity: 0.6
            }
          }
        ]}
        layout={{
          width: 1000,
          height: 600,
          title: `${yColumn} vs ${xColumn}`,
          xaxis: { 
            title: xColumn,
            showgrid: true,
            zeroline: true,
            gridcolor: '#f1f3f5'
          },
          yaxis: { 
            title: yColumn,
            showgrid: true,
            zeroline: true,
            gridcolor: '#f1f3f5'
          },
          dragmode: 'select',
          hovermode: 'closest',
          showlegend: false,
          plot_bgcolor: '#ffffff',
          paper_bgcolor: '#ffffff',
          margin: { l: 60, r: 20, t: 40, b: 40 }
        }}
        onSelected={handleSelection}
        config={{
          responsive: true,
          scrollZoom: true,
          displayModeBar: true,
          modeBarButtonsToAdd: ['select2d', 'lasso2d']
        }}
      />
    </Paper>
  );
};

export default React.memo(DataPlot);
