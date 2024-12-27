import React, { useState, useCallback } from 'react';
import { 
  MantineProvider, 
  Container, 
  Title, 
  Group, 
  Select, 
  FileButton, 
  Button,
  Text,
  Stack,
  Loader
} from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import DataPlot from './components/DataPlot';
import DataCleaningOptions from './components/DataCleaningOptions';
import { processDataInChunks, CHUNK_SIZE, cleanData, exportToCSV } from './utils/dataProcessor';

function App() {
  const [data, setData] = useState({});
  const [columns, setColumns] = useState([]);
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: CHUNK_SIZE });
  const [error, setError] = useState('');
  const [cleaningOptions, setCleaningOptions] = useState({
    removeOutliers: false,
    removeZeros: false,
    removeNegatives: false
  });

  const handleFileUpload = async (file) => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const { data: parsedData, headers } = await processDataInChunks(file);
      
      if (headers.length < 2) {
        throw new Error('File must contain at least two numeric columns');
      }

      setData(parsedData);
      setColumns(headers);
      setXColumn(headers[0]);
      setYColumn(headers[1]);
      setTotalPoints(parsedData[headers[0]].length);
      setVisibleRange({ start: 0, end: Math.min(CHUNK_SIZE, parsedData[headers[0]].length) });
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = useCallback((selectedIndices) => {
    if (!selectedIndices.length) return;

    setData(prevData => {
      const newData = { ...prevData };
      Object.keys(newData).forEach(column => {
        newData[column] = newData[column].filter((_, index) => 
          !selectedIndices.includes(index)
        );
      });
      return newData;
    });
    
    setTotalPoints(prev => prev - selectedIndices.length);
  }, []);

  const handleCleanData = () => {
    const cleanedData = cleanData(data, cleaningOptions);
    setData(cleanedData);
    setTotalPoints(cleanedData[xColumn].length);
  };

  const handleExportData = () => {
    exportToCSV(data, columns);
  };

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{
      colorScheme: 'light',
      primaryColor: 'blue',
    }}>
      <Container size="xl" py="xl">
        <Stack spacing="lg">
          <Title order={2}>Data Visualization & Cleaning</Title>

          <Group>
            <FileButton 
              onChange={handleFileUpload} 
              accept=".csv"
            >
              {(props) => (
                <Button 
                  {...props}
                  leftIcon={<IconUpload size={16} />}
                  loading={loading}
                >
                  Upload CSV
                </Button>
              )}
            </FileButton>
            {error && <Text color="red" size="sm">{error}</Text>}
          </Group>

          {columns.length > 0 && (
            <>
              <Group>
                <Select
                  label="X-Axis"
                  value={xColumn}
                  onChange={setXColumn}
                  data={columns.map(col => ({ value: col, label: col }))}
                  style={{ width: 200 }}
                />
                <Select
                  label="Y-Axis"
                  value={yColumn}
                  onChange={setYColumn}
                  data={columns.map(col => ({ value: col, label: col }))}
                  style={{ width: 200 }}
                />
              </Group>

              <DataCleaningOptions
                options={cleaningOptions}
                onOptionChange={(option, value) => 
                  setCleaningOptions(prev => ({ ...prev, [option]: value }))
                }
                onCleanData={handleCleanData}
                onExportData={handleExportData}
                dataPoints={totalPoints}
              />

              {!loading && Object.keys(data).length > 0 && (
                <DataPlot
                  data={data}
                  xColumn={xColumn}
                  yColumn={yColumn}
                  onSelection={handleSelection}
                  totalPoints={totalPoints}
                  visibleRange={visibleRange}
                />
              )}
            </>
          )}
        </Stack>
      </Container>
    </MantineProvider>
  );
}

export default App;
