const specialServerLists = [
  {
    id: 'gpu',
    title: 'GPU Servers',
    description: `Explore, search, and evaluate GPU-assisted cloud servers from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the “Search prompt” bar. You can also compare servers by selecting at least two rows using the checkboxes.`,
    parameters: {
      gpu_min: 1
    },
    columns: '300712',
    order_by: 'min_price',
    order_dir: 'desc'
  }

]


module.exports = specialServerLists;
