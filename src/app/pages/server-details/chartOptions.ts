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
      title: {
        display: true,
        color: '#FFF',
        text: 'USD/h',
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
  scales: {
    ...barChartOptions.scales,
    y: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'byte/s',
      },
    },
  },
  plugins: {
    ...barChartOptions.plugins,
    title: {
      display: true,
      text: 'Block size (byte)',
      color: '#FFF',
    }
  },
};

export const  barChartOptionsStaticWeb: ChartConfiguration<'bar'>['options'] = {
  scales: {
    ...barChartOptions.scales,
    y: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'Request per second',
      },
    },
    x: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'Threads per CPU',
      },
    }
  },
  plugins: {
    ...barChartOptions.plugins,
    title: {
      display: true,
      text: 'File size (KBs)',
      color: '#FFF',
    }
  },
};

export const  barChartOptionsSSLCompare: ChartConfiguration<'bar'>['options'] = {
  scales: {
    ...barChartOptions.scales,
    y: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'byte/s',
      },
    },
    x: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'Block Size (byte)',
      },
    }
  },
  plugins: {
    ...barChartOptions.plugins,
    tooltip:{
      callbacks: {
        label: function(this: TooltipModel<"bar">, tooltipItem: TooltipItem<"bar">) {
          return tooltipItem.formattedValue + ' byte/s';
        },
        title: function(this: TooltipModel<"bar">, tooltipItems: TooltipItem<"bar">[]) {
          return tooltipItems[0].label + '-byte block size';
        },
      }
    },
  },
};

export const  barChartOptionsStaticWebCompare: ChartConfiguration<'bar'>['options'] = {
  scales: {
    ...barChartOptions.scales,
    y: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'Request per Second',
      },
    },
    x: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'Block Size',
      },
    }
  },
  plugins: {
    ...barChartOptions.plugins,
    tooltip:{
      callbacks: {
        label: function(this: TooltipModel<"bar">, tooltipItem: TooltipItem<"bar">) {
          return tooltipItem.formattedValue + 'Requests per second';
        },
        title: function(this: TooltipModel<"bar">, tooltipItems: TooltipItem<"bar">[]) {
          return tooltipItems[0].label;
        },
      }
    },
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
          return (tooltipItem.dataset.data[tooltipItem.dataIndex] as any).value + '; ' + (tooltipItem.dataset.data[tooltipItem.dataIndex] as any).tooltip;
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
        autoSkip: false,
        major: {
          enabled: true
        }
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'MB',
      },
      grid: {
        color: '#4B5563',
      },
      type: 'logarithmic',
      min: 0,
      afterBuildTicks: function(scale: any) {
        scale.ticks = [
          0.016384,
          0.262144,
          1,
          2,
          4,
          8,
          16,
          32,
          64,
          256,
          512
        ].map(v => ({ value: v, label: v, major: true}));
      },
      afterTickToLabelConversion: function(scale: any) {
        scale.ticks = [
          0.016384,
          0.262144,
          1,
          2,
          4,
          8,
          16,
          32,
          64,
          256,
          512
        ].map(v => ({ value: v, label: v, major: true}));
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
      title: {
        display: true,
        color: '#FFF',
        text: 'MB/sec',
      }
    },
  },
  plugins: {
    tooltip:{
      callbacks: {
        title: function(this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
          return tooltipItems[0].label + ' MB block size';
        },
        label: function(this: TooltipModel<"line">, tooltipItem: TooltipItem<"line">) {
          return tooltipItem.formattedValue + ' MB/s';
        }
      }
    },
    annotation: {},
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
    tooltip:{
      callbacks: {
        label: function(this: TooltipModel<"line">, tooltipItem: TooltipItem<"line">) {
          return (tooltipItem.parsed as any).y.toFixed(0) + ' (' + (tooltipItem.dataset.data[tooltipItem.dataIndex] as any).tooltip + ')';
        }
      }
    },
    legend: {
      display: true,
      labels: {
        color: '#FFF',
      },
    },
  },
  parsing: {
    xAxisKey: 'compression_level',
    yAxisKey: 'compress'
  }
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

export const lineChartOptionsCompareCompress: ChartConfiguration<'line'>['options'] = {
  scales: {
    x: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'Compression Ratio',
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
    tooltip:{
      callbacks: {
        label: function(this: TooltipModel<"line">, tooltipItem: TooltipItem<"line">) {
          return tooltipItem.formattedValue + ' byte/s (' + (tooltipItem.dataset.data[tooltipItem.dataIndex] as any).tooltip + ')';
        },
        title: function(this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
          return tooltipItems[0].label + '% compression ratio';
        }
      }
    },
    legend: {
      display: true,
      labels: {
        color: '#FFF',
      },
    },
    title: {
      display: true,
      text: 'Compression Speed / Ratio',
      color: '#FFF',
    }
  },
  parsing: {
    xAxisKey: 'ratio',
    yAxisKey: 'compress'
  }
};

export const lineChartOptionsCompareDecompress: ChartConfiguration<'line'>['options'] = {
  scales: {
    x: {
      ticks: {
        color: '#FFF',
      },
      grid: {
        color: '#4B5563',
      },
      title: {
        display: true,
        color: '#FFF',
        text: 'Compression Ratio',
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
    tooltip:{
      callbacks: {
        label: function(this: TooltipModel<"line">, tooltipItem: TooltipItem<"line">) {
          return tooltipItem.formattedValue + ' byte/s (' + (tooltipItem.dataset.data[tooltipItem.dataIndex] as any).tooltip + ')';
        },
        title: function(this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
          return tooltipItems[0].label + '% compression ratio';
        }
      }
    },
    legend: {
      display: true,
      labels: {
        color: '#FFF',
      },
    },
    title: {
      display: true,
      text: 'Decompression Speed / Ratio',
      color: '#FFF',
    }
  },
  parsing: {
    xAxisKey: 'ratio',
    yAxisKey: 'decompress'
  }
};


