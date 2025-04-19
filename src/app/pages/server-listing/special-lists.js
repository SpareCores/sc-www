/**
 * Special server listing configuration
 * 
 * Supported fields:
 * - id: string - unique identifier for the listing, will become part of the URL
 * - title: string - shown on the top of the page
 * - description: string - description below the title, above the table
 * - parameters: object - query parameters to filter servers
 * - columns: string - bitmask of visible columns encoded as decimal number
 * - order_by: string - field to sort by
 * - order_dir: 'asc'|'desc' - sort direction
 * - benchmark_id: string - ID of benchmark to run
 * - benchmark_config: string - JSON string with benchmark configuration
 */

var specialServerLists = [
  {
    id: 'shared',
    title: 'Shared-Core Cloud Servers',
    description: 'Explore, search, and evaluate shared-core cloud servers from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      cpu_allocation: 'Shared'
    },
  },
  {
    id: 'burstable',
    title: 'Burstable Cloud Servers',
    description: 'Explore, search, and evaluate burstable cloud servers from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      cpu_allocation: 'Burstable'
    },
  },
  {
    id: 'dedicated',
    title: 'Dedicated Cloud Servers',
    description: 'Explore, search, and evaluate dedicated cloud servers from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      cpu_allocation: 'Dedicated'
    },
  },
  {
    id: 'gpu',
    title: 'GPU Servers',
    description: 'Explore, search, and evaluate GPU-assisted cloud servers from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the “Search prompt” bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1
    },
    columns: '300712',
    order_by: 'min_price',
    order_dir: 'desc'
  }
]

module.exports = specialServerLists;
