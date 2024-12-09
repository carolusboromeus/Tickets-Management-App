// components/PieChart.js
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, DataLabelsPlugin } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register necessary components
ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const PieChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      datalabels: {
        color: '#000',
        display: true,
        formatter: (value) => `${value}`, // Customize the format as needed
        font: {
          weight: 'bold',
          size: 15
        },
        // padding: 10,
        // backgroundColor: 'rgba(0, 0, 0, 0.3)',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.label || '';
            const value = tooltipItem.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default PieChart;
