/* eslint-disable no-var */
import { ChartConfiguration, ChartData, TooltipItem, TooltipModel } from "chart.js";

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

export const  barChartOptionsSSL: ChartConfiguration<'bar'>['options'] = {
  ...barChartOptions,
  plugins: {
    ...barChartOptions.plugins,
    title: {
      display: true,
      text: 'Block size (byte)',
      color: '#FFF',
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
      angleLines: {
        color: '#4B5563',
        display: true,
      },
      min: 0,
    },
  },
  parsing: {
    key: 'value',
  },
  plugins: {
    tooltip:{
      callbacks: {
        label: function(this: TooltipModel<"radar">, tooltipItem: TooltipItem<"radar">) {
          return (tooltipItem.dataset.data[tooltipItem.dataIndex] as any).tooltip;
        }
      }
    },
    legend: {
      display: false,
      labels: {
        color: '#FFF',
      },
    }
  },
};

export const radarDatasetColors = [
  { borderColor: '#34D399', backgroundColor: '#34D39933'},
  { borderColor: '#E5E7EB', backgroundColor: '#E5E7EB33'},
  { borderColor: '#38BDF8', backgroundColor: '#38BDF833'},
  { borderColor: '#FACC15', backgroundColor: '#FACC1533'},
  { borderColor: '#F87171', backgroundColor: '#F8717133'},
  { borderColor: '#A3E635', backgroundColor: '#A3E63533'},
  { borderColor: '#818CF8', backgroundColor: '#818CF833'},
  { borderColor: '#94A3B8', backgroundColor: '#94A3B833'}
];

export const lineChartOptionsBWM: ChartConfiguration<'line'>['options'] = {
  scales: {
    x: {
      ticks: {
        color: '#FFF',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'MB',
      },
    },
    y: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      type: 'logarithmic',
      title: {
        display: true,
        color: '#FFF',
        text: 'MB/sec',
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

export const lineChartOptionsComp: ChartConfiguration<'line'>['options'] = {
  scales: {
    x: {
      ticks: {
        color: '#FFF',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'Compression Level',
      },
    },
    y: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      type: 'logarithmic',
      title: {
        display: true,
        color: '#FFF',
        text: 'byte/s',
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

export const lineChartOptionsCompRatio: ChartConfiguration<'line'>['options'] = {
  scales: {
    x: {
      ticks: {
        color: '#FFF',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'Compression Level',
      },
    },
    y: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      type: 'linear',
      title: {
        display: true,
        color: '#FFF',
        text: 'Compression Ratio',
      },
      min: 0
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


