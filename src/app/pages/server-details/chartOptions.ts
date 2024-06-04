import { ChartConfiguration, ChartData } from "chart.js";

export const  barChartOptions: ChartConfiguration<'bar'>['options'] = {
  scales: {
    x: {
      ticks: {
        color: '#FFF',
          }
    },
    y: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      }
    },
  },
  plugins: {
    legend: {
      display: true,
      labels: {
        color: '#FFF',
      },
    }
  },
};

export const barChartDataEmpty: ChartData<'bar'> = {
  labels: [],
  datasets: [
    { data: [], label: 'Spot', backgroundColor: '#34D399'},
    { data: [], label: 'Ondemand', backgroundColor: '#E5E7EB'},
  ],
};

export const radarChartOptions: ChartConfiguration<'radar'>['options'] = {
    scales: {
      r: {
        ticks: {
          color: '#fff',
          backdropColor: '#06263a',
        },
        grid: {
          color: '#4B5563',
        }
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#FFF',
        },
      }
    },
  };

export const radarChartDataEmpty: ChartData<'bar'> = {
  labels: ['a', 'b', 'c', 'd', 'e'],
  datasets: [
    { data: [1,2,3,4,5], label: 'data1', borderColor: '#34D399', backgroundColor: '#34D39933'},
    { data: [5,6,7,8,9], label: 'data2', borderColor: '#E5E7EB', backgroundColor: '#E5E7EB33'},
    { data: [11,12,13,14,15], label: 'data3', borderColor: '#38BDF8', backgroundColor: '#38BDF833'},
    { data: [12,13,14,9,7], label: 'data4', borderColor: '#FACC15', backgroundColor: '#FACC1533'},
  ],
};
