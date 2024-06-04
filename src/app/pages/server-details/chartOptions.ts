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
      },
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
          color: '#4B5563',
          backdropColor: '#06263a',
        },
        grid: {
          color: '#4B5563',
        },
        pointLabels: {
          color: '#E5E7EB',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#E5E7EB',
        },
      }
    },
  };

  export const radarChartOptions2: ChartConfiguration<'radar'>['options'] = {
    scales: {
      r: {
        ticks: {
          color: '#4B5563',
          backdropColor: '#06263a',
        },
        grid: {
          color: '#4B5563',
        },
        pointLabels: {
          color: '#E5E7EB',
        },
        angleLines: {
          color: '#4B5563',
          display: true,
        }
      },
    },
    plugins: {
      legend: {
        display: false,
        labels: {
          color: '#FFF',
        },
      }
    },
  };

export const radarChartDataEmpty: ChartData<'radar'> = {
  labels: [],
  datasets: [
    { data: [1,2,3,4,5], label: 'data1', borderColor: '#34D399', backgroundColor: '#34D39933'},
    { data: [5,6,7,8,9], label: 'data2', borderColor: '#E5E7EB', backgroundColor: '#E5E7EB33'},
    { data: [11,12,13,14,15], label: 'data3', borderColor: '#38BDF8', backgroundColor: '#38BDF833'},
    { data: [12,13,14,9,7], label: 'data4', borderColor: '#FACC15', backgroundColor: '#FACC1533'},
  ],
};

export const radatDatasetColors = [
  { borderColor: '#34D399', backgroundColor: '#34D39933'},
  { borderColor: '#E5E7EB', backgroundColor: '#E5E7EB33'},
  { borderColor: '#38BDF8', backgroundColor: '#38BDF833'},
  { borderColor: '#FACC15', backgroundColor: '#FACC1533'},
  { borderColor: '#F87171', backgroundColor: '#F8717133'},
  { borderColor: '#A3E635', backgroundColor: '#A3E63533'},
  { borderColor: '#818CF8', backgroundColor: '#818CF833'},
  { borderColor: '#94A3B8', backgroundColor: '#94A3B833'}
];

export const lineChartOptions: ChartConfiguration<'line'>['options'] = {
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
      },
      type: 'logarithmic',
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

