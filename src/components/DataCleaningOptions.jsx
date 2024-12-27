import React from 'react';
import { Paper, Switch, Group, Text, Button, Stack } from '@mantine/core';
import { IconTrash, IconDownload } from '@tabler/icons-react';

const DataCleaningOptions = ({ 
  options, 
  onOptionChange, 
  onCleanData,
  onExportData,
  dataPoints
}) => {
  return (
    <Paper shadow="sm" p="md" withBorder>
      <Stack spacing="md">
        <Text size="sm" weight={500} color="dimmed">
          Data Cleaning Options ({dataPoints} points)
        </Text>
        
        <Group>
          <Switch
            label="Remove Outliers"
            checked={options.removeOutliers}
            onChange={(e) => onOptionChange('removeOutliers', e.currentTarget.checked)}
          />
          
          <Switch
            label="Remove Zeros"
            checked={options.removeZeros}
            onChange={(e) => onOptionChange('removeZeros', e.currentTarget.checked)}
          />
          
          <Switch
            label="Remove Negatives"
            checked={options.removeNegatives}
            onChange={(e) => onOptionChange('removeNegatives', e.currentTarget.checked)}
          />
        </Group>

        <Group>
          <Button
            leftIcon={<IconTrash size={16} />}
            color="red"
            variant="light"
            onClick={onCleanData}
          >
            Clean Data
          </Button>

          <Button
            leftIcon={<IconDownload size={16} />}
            variant="light"
            onClick={onExportData}
          >
            Export CSV
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default DataCleaningOptions;
