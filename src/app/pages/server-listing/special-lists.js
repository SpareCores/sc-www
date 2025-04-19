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
    description: 'Explore, search, and evaluate GPU-assisted cloud servers from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'a100',
    title: 'A100 Servers',
    description: 'Explore, search, and evaluate servers with at least one A100 GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'A100'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'a10g',
    title: 'A10G Servers',
    description: 'Explore, search, and evaluate servers with at least one A10G GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'A10G'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'h100',
    title: 'H100 Servers',
    description: 'Explore, search, and evaluate servers with at least one H100 GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'H100'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'h200',
    title: 'H200 Servers',
    description: 'Explore, search, and evaluate servers with at least one H200 GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'H200'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'hl-205',
    title: 'HL-205 Servers',
    description: 'Explore, search, and evaluate servers with at least one HL-205 GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'HL-205'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'k80',
    title: 'K80 Servers',
    description: 'Explore, search, and evaluate servers with at least one K80 GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'K80'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'l4',
    title: 'L4 Servers',
    description: 'Explore, search, and evaluate servers with at least one L4 GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'L4'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'l40s',
    title: 'L40S Servers',
    description: 'Explore, search, and evaluate servers with at least one L40S GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'L40S'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'm60',
    title: 'M60 Servers',
    description: 'Explore, search, and evaluate servers with at least one M60 GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'M60'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 't4',
    title: 'T4 Servers',
    description: 'Explore, search, and evaluate servers with at least one T4 GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'T4'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 't4g',
    title: 'T4G Servers',
    description: 'Explore, search, and evaluate servers with at least one T4G GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'T4G'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'v100',
    title: 'V100 Servers',
    description: 'Explore, search, and evaluate servers with at least one V100 GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'V100'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
  {
    id: 'v520',
    title: 'V520 Servers',
    description: 'Explore, search, and evaluate servers with at least one V520 GPU from multiple vendors in the table below. This comprehensive list includes diverse attributes such as CPU count, detailed processor information, memory, GPU model and memory amount, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.',
    parameters: {
      gpu_min: 1,
      gpu_model: 'V520'
    },
    columns: '1187496',
    order_by: 'min_price',
    order_dir: 'asc'
  },
]

module.exports = specialServerLists;
