// components/MyChart.js
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the components you need
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const BarChart = ({ data, type }) => {
  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true, // Start from 0
        ticks: {
          stepSize: 1, // Set step size to 1 to avoid repeated zeros
          callback: function(value) {
            return Math.floor(value); // Show integer values
          },
        },
        display: false
      }
    },
    plugins: {
      legend: {
        position: 'top',
        display: type ? false : true
      },
      title: {
        display: false,
      },
      datalabels: {
        color: 'black',
        display: true,
        formatter: (value) => `${value}`, // Customize the format as needed
        font: {
          weight: 'bold',
          size: 15
        },
      }
    },
  };

  return <Bar className='h-64' data={data} options={options} />;
};

export default BarChart;
