const specialCompares = [
  {
    type: 'section', 
    title: 'Best multi-core performance servers',
    description: `<p>Manually curated lists of servers with the best multi-core performance as per stress-ng's <code>div16</code> CPU burning method. This benchmark is a good indicator of how well a server can handle CPU-bound workloads that can perfectly scale to all available processor cores.</p>
    <p>Servers using the same CPU model at the same vendor were deduplicated, and only the most general options were kept with similar memory amounts (e.g. from AWS's <code>r6a.large</code>, <code>m6a.large</code>, and <code>c6a.large</code> showing only <code>m6a.large</code> with 8 GiB of memory; similarly GCP's <code>c2d-highmem-2</code>, <code>c2d-standard-2</code>, and <code>c2d-highcpu-2</code> showing only <code>c2d-standard-2</code> with 8 GiB of memory).</p>`,
    query:
  `WITH minprice AS (
  SELECT vendor_id, server_id, MIN(price) AS price
  FROM server_price
  WHERE allocation = 'ONDEMAND'
  GROUP BY 1, 2
),
benchmarks AS (
  SELECT vendor_id, server_id, MAX(score) AS score
  FROM benchmark_score
  WHERE benchmark_id = 'stress_ng:bestn' AND status = 'ACTIVE'
  GROUP BY 1, 2
)
SELECT
  s.vendor_id, s.family, s.api_reference,
  s.cpu_architecture, s.cpu_manufacturer, s.cpu_family, s.cpu_model, s.cpu_speed,
  s.memory_amount / 1024,
  b.score,
  p.price
FROM server AS s
LEFT JOIN benchmarks AS b
  ON s.vendor_id = b.vendor_id and s.server_id = b.server_id
LEFT JOIN minprice AS p
  ON s.vendor_id = p.vendor_id and s.server_id = p.server_id
WHERE 
  s.status = 'ACTIVE' 
  -- AND s.vcpus = 2
  -- AND s.cpu_cores = 2
ORDER BY b.score DESC
LIMIT 25;`,
  },
  {
    type: 'card',
    id: 'best-multicore-2vcpu',
    title: 'Best multi-core performance servers with 2 vCPUs',
    description: `This is a manually curated list of 2 vCPU servers with the best multi-core performance as per stress-ng's <code>div16</code> CPU burning method.
    Note that servers using the same CPU model at the same vendor were deduplicated, and only the most general options were kept with similar memory amounts(e.g. from AWS's <code>r6a.large</code>, <code>m6a.large</code>, and <code>c6a.large</code> showing only <code>m6a.large</code> with 8 GiB of memory; similarly GCP's <code>c2d-highmem-2</code>, <code>c2d-standard-2</code>, and <code>c2d-highcpu-2</code> showing only <code>c2d-standard-2</code> with 8 GiB of memory).`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'aws',
        server: 'm7a.large'
      },
      {
        vendor: 'gcp',
        server: 't2d-standard-2'
      },
      {
        vendor: 'azure',
        server: 'Standard_D2ps_v6'
      },
      {
        vendor: 'azure',
        server: 'Standard_DC2s_v3'
      },
      {
        vendor: 'azure',
        server: 'Standard_D2ps_v5'
      },
      {
        vendor: 'hcloud',
        server: 'cax11'
      },
      {
        vendor: 'gcp',
        server: 't2a-standard-2'
      }
    ]
  },
  {
    type: 'card',
    id: 'best-multicore-4vcpu',
    title: 'Best multi-core performance servers with 4 vCPUs',
    description: `This is a manually curated list of 4 vCPU servers with the best multi-core performance as per stress-ng's <code>div16</code> CPU burning method.
    Note that servers using the same CPU model at the same vendor were deduplicated, and only the most general options were kept with similar memory amounts(e.g. from AWS's <code>r6a.xlarge</code>, <code>m6a.xlarge</code>, and <code>c6a.xlarge</code> showing only <code>m6a.xlarge</code> with 16 GiB of memory; similarly GCP's <code>c2d-highmem-4</code>, <code>c2d-standard-4</code>, and <code>c2d-highcpu-4</code> showing only <code>c2d-standard-4</code> with 16 GiB of memory).`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'aws',
        server: 'm7a.xlarge'
      },
      {
        vendor: 'gcp',
        server: 't2d-standard-4'
      },
      {
        vendor: 'hcloud',
        server: 'cpx31'
      },
      {
        vendor: 'azure',
        server: 'Standard_D4pds_v6'
      },
      {
        vendor: 'azure',
        server: 'Standard_B4ps_v2'
      },
      {
        vendor: 'hcloud',
        server: 'cax21'
      },
      {
        vendor: 'gcp',
        server: 't2a-standard-4'
      }
    ]
  },
  {
    type: 'card',
    id: 'best-multicore-8vcpu',
    title: 'Best multi-core performance servers with 8 vCPUs',
    description: `This is a manually curated list of 8 vCPU servers with the best multi-core performance as per stress-ng's <code>div16</code> CPU burning method.
    Note that servers using the same CPU model at the same vendor were deduplicated, and only the most general options were kept with similar memory amounts(e.g. from AWS's <code>r6a.2xlarge</code>, <code>m6a.2xlarge</code>, and <code>c6a.2xlarge</code> showing only <code>m6a.2xlarge</code> with 32 GiB of memory; similarly GCP's <code>c2d-highmem-8</code>, <code>c2d-standard-8</code>, and <code>c2d-highcpu-8</code> showing only <code>c2d-standard-8</code> with 32 GiB of memory).`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'aws',
        server: 'm7a.2xlarge'
      },
      {
        vendor: 'gcp',
        server: 't2d-standard-8'
      },
      {
        vendor: 'azure',
        server: 'Standard_D8ps_v6'
      },
      {
        vendor: 'azure',
        server: 'Standard_DC8s_v3'
      },
      {
        vendor: 'azure',
        server: 'Standard_D8pds_v5'
      },
      {
        vendor: 'gcp',
        server: 't2a-standard-8'
      },
      {
        vendor: 'hcloud',
        server: 'cax31'
      }
    ]
  },
  {
    type: 'card',
    id: 'best-multicore-16vcpu',
    title: 'Best multi-core performance servers with 16 vCPUs',
    description: `This is a manually curated list of 16 vCPU servers with the best multi-core performance as per stress-ng's <code>div16</code> CPU burning method.
    Note that servers using the same CPU model at the same vendor were deduplicated, and only the most general options were kept with similar memory amounts(e.g. from AWS's <code>r6a.4xlarge</code>, <code>m6a.4xlarge</code>, and <code>c6a.4xlarge</code> showing only <code>m6a.4xlarge</code> with 64 GiB of memory; similarly GCP's <code>c2d-highmem-16</code>, <code>c2d-standard-16</code>, and <code>c2d-highcpu-16</code> showing only <code>c2d-standard-16</code> with 64 GiB of memory).`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'aws',
        server: 'm7a.4xlarge'
      },
      {
        vendor: 'gcp',
        server: 't2d-standard-16'
      },
      {
        vendor: 'azure',
        server: 'Standard_D16ps_v6'
      },
      {
        vendor: 'azure',
        server: 'Standard_DC16s_v3'
      },
      {
        vendor: 'hcloud',
        server: 'cax41'
      },
      {
        vendor: 'gcp',
        server: 't2a-standard-16'
      },
      {
        vendor: 'aws',
        server: 'm8g.4xlarge'
      }
    ]
  },
  {
    type: 'section', 
    title: 'Best single-core performance servers',
    description: `<p>Manually curated lists of servers with the best single-core performance as per stress-ng's <code>div16</code> CPU burning method.</p>
    <p>Servers using the same CPU model at the same vendor were deduplicated, and only the cheaper options were kept, usually with lower number of physical cores (e.g. from AWS's <code>m7a.medium</code> and <code>c7a.large</code> showing only <code>m7a.medium</code> with a single core; or from <code>c6i.large</code>, <code>c6in.large</code>, and <code>c6id.large</code> only the first).</p>`,
    query:
`WITH minprice AS (
  SELECT vendor_id, server_id, MIN(price) AS price
  FROM server_price
  WHERE allocation = 'ONDEMAND'
  GROUP BY 1, 2
),
benchmarks AS (
  SELECT vendor_id, server_id, MAX(score) AS score
  FROM benchmark_score
  WHERE benchmark_id = 'stress_ng:best1' AND status = 'ACTIVE'
  GROUP BY 1, 2
)
SELECT
  s.vendor_id, s.family, s.api_reference,
  s.cpu_architecture, s.cpu_manufacturer, s.cpu_family, s.cpu_model, 
  s.vcpus, s.cpu_cores, s.cpu_speed,
  b.score,
  p.price
FROM server AS s
LEFT JOIN benchmarks AS b
  ON s.vendor_id = b.vendor_id and s.server_id = b.server_id
LEFT JOIN minprice AS p
  ON s.vendor_id = p.vendor_id and s.server_id = p.server_id
WHERE 
  s.status = 'ACTIVE' 
  -- AND s.memory_amount / 1024 = 4
ORDER BY b.score DESC
LIMIT 25;`,
  },
  {
    type: 'card',
    id: 'best-singlecore-4gb',
    title: 'Best single-core performance servers with 4 GiB of memory',
    description: `<p>This is a manually curated list of low memory (4 GiB) servers with the best single-core performance as per stress-ng's <code>div16</code> CPU burning method.</p>
    <p>Note that servers using the same CPU model at the same vendor were deduplicated, and only the cheaper options were kept -- usually with lower number of physical cores (e.g. from AWS's <code>m7a.medium</code> and <code>c7a.large</code> showing only <code>m7a.medium</code> with a single core; or from <code>c6i.large</code>, <code>c6in.large</code>, and <code>c6id.large</code> showing only <code>c6i.large</code>).</p>`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'aws',
        server: 'm7a.medium'
      },
      {
        vendor: 'aws',
        server: 'c6a.large'
      },
      {
        vendor: 'gcp',
        server: 'c2d-highcpu-2'
      },
      {
        vendor: 'azure',
        server: 'Standard_B2als_v2'
      },
      {
        vendor: 'hcloud',
        server: 'cpx21'
      },
      {
        vendor: 'gcp',
        server: 't2d-standard-1'
      },
      {
        vendor: 'gcp',
        server: 'e2-medium'
      }
    ]
  },
  {
    type: 'card',
    id: 'best-singlecore-4vcpu',
    title: 'Best single-core performance servers with 4 vCPUs',
    description: `This is a manually curated list of 4 vCPU servers with the best single-core performance as per stress-ng's <code>div16</code> CPU burning method.
    Note that servers using the same CPU model at the same vendor were deduplicated, and only the most general options were kept with similar memory amounts(e.g. from AWS's <code>r6a.xlarge</code>, <code>m6a.xlarge</code>, and <code>c6a.xlarge</code> showing only <code>m6a.xlarge</code> with 16 GiB of memory; similarly GCP's <code>c2d-highmem-4</code>, <code>c2d-standard-4</code>, and <code>c2d-highcpu-4</code> showing only <code>c2d-standard-4</code> with 16 GiB of memory).`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'aws',
        server: 'm7a.xlarge'
      },
      {
        vendor: 'aws',
        server: 'm6a.xlarge'
      },
      {
        vendor: 'gcp',
        server: 'c2d-standard-4'
      },
      {
        vendor: 'azure',
        server: 'Standard_DC4ads_cc_v5'
      },
      {
        vendor: 'gcp',
        server: 'c3d-standard-4'
      },
      {
        vendor: 'azure',
        server: 'Standard_D4a_v4'
      },
      {
        vendor: 'azure',
        server: 'Standard_D4as_v5'
      }
    ]
  },
  {
    type: 'card',
    id: 'best-singlecore-8vcpu',
    title: 'Best single-core performance servers with 8 vCPUs',
    description: `This is a manually curated list of 8 vCPU servers with the best single-core performance as per stress-ng's <code>div16</code> CPU burning method.
    Note that servers using the same CPU model at the same vendor were deduplicated, and only the most general options were kept with similar memory amounts(e.g. from AWS's <code>r6a.2xlarge</code>, <code>m6a.2xlarge</code>, and <code>c6a.2xlarge</code> showing only <code>m6a.2xlarge</code> with 32 GiB of memory; similarly GCP's <code>c2d-highmem-8</code>, <code>c2d-standard-8</code>, and <code>c2d-highcpu-8</code> showing only <code>c2d-standard-8</code> with 32 GiB of memory).`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'aws',
        server: 'm7a.2xlarge'
      },
      {
        vendor: 'hcloud',
        server: 'ccx33'
      },
      {
        vendor: 'aws',
        server: 'm6a.2xlarge'
      },
      {
        vendor: 'gcp',
        server: 'c2d-standard-8'
      },
      {
        vendor: 'gcp',
        server: 'c3d-standard-8'
      },
      {
        vendor: 'azure',
        server: 'Standard_D8as_v4'
      },
      {
        vendor: 'azure',
        server: 'Standard_D8as_v5'
      }
    ]
  },
  {
    type: 'card',
    id: 'best-singlecore-16vcpu',
    title: 'Best single-core performance servers with 16 vCPUs',
    description: `This is a manually curated list of 16 vCPU servers with the best single-core performance as per stress-ng's <code>div16</code> CPU burning method.
    Note that servers using the same CPU model at the same vendor were deduplicated, and only the most general options were kept with similar memory amounts(e.g. from AWS's <code>r6a.4xlarge</code>, <code>m6a.4xlarge</code>, and <code>c6a.4xlarge</code> showing only <code>m6a.4xlarge</code> with 64 GiB of memory; similarly GCP's <code>c2d-highmem-16</code>, <code>c2d-standard-16</code>, and <code>c2d-highcpu-16</code> showing only <code>c2d-standard-16</code> with 64 GiB of memory).`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'aws',
        server: 'm7a.4xlarge'
      },
      {
        vendor: 'hcloud',
        server: 'ccx43'
      },
      {
        vendor: 'aws',
        server: 'm6a.4xlarge'
      },
      {
        vendor: 'gcp',
        server: 'c2d-standard-16'
      },
      {
        vendor: 'gcp',
        server: 'c3d-standard-16'
      },
      {
        vendor: 'azure',
        server: 'Standard_DC16as_cc_v5'
      },
      {
        vendor: 'azure',
        server: 'Standard_B16als_v2'
      }
    ]
  },
  {
    type: 'section', 
    title: 'Best performance servers for static web serving',
    description: `Manually curated list of servers with the highest performance for serving static websites as per our extrapolated RPS based on the <code>binserve</code> + <code>wrk</code> benchmarks.`,
    query:
  `WITH minprice AS (
  SELECT vendor_id, server_id, MIN(price) AS price
  FROM server_price
  WHERE allocation = 'ONDEMAND'
  GROUP BY 1, 2
),
benchmarks AS (
  SELECT vendor_id, server_id, MAX(score) AS score
  FROM benchmark_score
  WHERE benchmark_id = 'static_web:rps-extrapolated' AND status = 'ACTIVE'
  GROUP BY 1, 2
)
SELECT
  s.vendor_id, s.family, s.api_reference,
  s.cpu_architecture, s.cpu_manufacturer, s.cpu_family, s.cpu_model, s.cpu_speed, s.vcpus,
  s.memory_amount / 1024 AS memory,
  b.score,
  p.price
FROM server AS s
LEFT JOIN benchmarks AS b
  ON s.vendor_id = b.vendor_id and s.server_id = b.server_id
LEFT JOIN minprice AS p
  ON s.vendor_id = p.vendor_id and s.server_id = p.server_id
WHERE 
  s.status = 'ACTIVE' 
  -- AND p.price < 0.1
ORDER BY b.score DESC
LIMIT 25;`,
  },
  {
    type: 'card',
    id: 'best-static-web-below-0.1usd',
    title: 'Best performance servers for static web serving below ¢10/hour',
    description: `Manually curated list of servers with the highest performance for serving static websites as per our extrapolated RPS based on the <code>binserve</code> + <code>wrk</code> benchmarks.`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'hcloud',
        server: 'cpx51'
      },
      {
        vendor: 'hcloud',
        server: 'cx52'
      },
      {
        vendor: 'hcloud',
        server: 'cax41'
      },
      {
        vendor: 'hcloud',
        server: 'ccx33'
      },
      {
        vendor: 'aws',
        server: 'c7g.xlarge'
      },
      {
        vendor: 'gcp',
        server: 'c4-highcpu-2'
      },
      {
        vendor: 'azure',
        server: 'Standard_B4als_v2'
      }
    ]
  },
  {
    type: 'card',
    id: 'best-static-web-below-0.5usd',
    title: 'Best performance servers for static web serving below ¢50/hour',
    description: `Manually curated list of servers with the highest performance for serving static websites as per our extrapolated RPS based on the <code>binserve</code> + <code>wrk</code> benchmarks.`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'hcloud',
        server: 'ccx63'
      },
      {
        vendor: 'hcloud',
        server: 'ccx53'
      },
      {
        vendor: 'aws',
        server: 'm7g.4xlarge'
      },
      {
        vendor: 'gcp',
        server: 't2d-standard-16'
      },
      {
        vendor: 'hcloud',
        server: 'ccx43'
      },
      {
        vendor: 'hcloud',
        server: 'cpx51'
      },
      {
        vendor: 'azure',
        server: 'Standard_DC8s_v3'
      }
    ]
  },
  {
    type: 'section', 
    title: 'Best performance servers for Redis',
    description: `Manually curated list of servers with the highest performance for Redis as per our extrapolated RPS based on <code>memetier_benchmark</code>.`,
    query:
  `WITH minprice AS (
  SELECT vendor_id, server_id, MIN(price) AS price
  FROM server_price
  WHERE allocation = 'ONDEMAND'
  GROUP BY 1, 2
),
benchmarks AS (
  SELECT vendor_id, server_id, MAX(score) AS score
  FROM benchmark_score
  WHERE benchmark_id = 'redis:rps-extrapolated' AND status = 'ACTIVE'
  GROUP BY 1, 2
)
SELECT
  s.vendor_id, s.family, s.api_reference,
  s.cpu_architecture, s.cpu_manufacturer, s.cpu_family, s.cpu_model, s.cpu_speed, s.vcpus,
  s.memory_amount / 1024 AS memory,
  b.score,
  p.price
FROM server AS s
LEFT JOIN benchmarks AS b
  ON s.vendor_id = b.vendor_id and s.server_id = b.server_id
LEFT JOIN minprice AS p
  ON s.vendor_id = p.vendor_id and s.server_id = p.server_id
WHERE 
  s.status = 'ACTIVE' 
  -- AND p.price < 0.1
ORDER BY b.score DESC
LIMIT 25;`,
  },
  {
    type: 'card',
    id: 'best-redis-below-0.1usd',
    title: 'Best performance servers for Redis below ¢10/hour',
    description: `Manually curated list of servers with the highest performance for Redis as per our extrapolated RPS based on <code>memetier_benchmark</code>.`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'hcloud',
        server: 'cpx51'
      },
      {
        vendor: 'hcloud',
        server: 'cax41'
      },
      {
        vendor: 'hcloud',
        server: 'cx52'
      },
      {
        vendor: 'hcloud',
        server: 'cpx41'
      },
      {
        vendor: 'aws',
        server: 'c7g.xlarge'
      },
      {
        vendor: 'azure',
        server: 'Standard_D4plds_v5'
      },
      {
        vendor: 'gcp',
        server: 'c2d-highcpu-4'
      }
    ]
  },
  {
    type: 'card',
    id: 'best-redis-below-0.5usd',
    title: 'Best performance servers for Redis below ¢50/hour',
    description: `Manually curated list of servers with the highest performance for Redis as per our extrapolated RPS based on <code>memetier_benchmark</code>.`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'hcloud',
        server: 'ccx63'
      },
      {
        vendor: 'hcloud',
        server: 'ccx53'
      },
      {
        vendor: 'hcloud',
        server: 'cpx51'
      },
      {
        vendor: 'gcp',
        server: 't2d-standard-16'
      },
      {
        vendor: 'aws',
        server: 'm7g.4xlarge'
      },
      {
        vendor: 'hcloud',
        server: 'cax41'
      },
      {
        vendor: 'azure',
        server: 'Standard_B16pls_v2'
      }
    ]
  },
  {
    type: 'section', 
    title: 'Hetzner Cloud offerings',
    description: `List of all Hetzner Cloud server types with 2, 4, 8, and 16 vCPUs for easy comparison.`,
  },
  {
    type: 'card',
    id: 'hcloud-2vcpus',
    title: '2 vCPU servers at Hetzner Cloud',
    description: 'All Hetzner Cloud server types with 2 shared or dedicated vCPUs.',
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'hcloud',
        server: 'cx21'
      },
      {
        vendor: 'hcloud',
        server: 'cx22'
      },
      {
        vendor: 'hcloud',
        server: 'cpx11'
      },
      {
        vendor: 'hcloud',
        server: 'cax11'
      },
      {
        vendor: 'hcloud',
        server: 'ccx13'
      }
    ]
  },
  {
    type: 'card',
    id: 'hcloud-4vcpus',
    title: '4 vCPU servers at Hetzner Cloud',
    description: 'All Hetzner Cloud server types with 4 shared or dedicated vCPUs.',
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'hcloud',
        server: 'cx41'
      },
      {
        vendor: 'hcloud',
        server: 'cx32'
      },
      {
        vendor: 'hcloud',
        server: 'cpx31'
      },
      {
        vendor: 'hcloud',
        server: 'cax21'
      },
      {
        vendor: 'hcloud',
        server: 'ccx23'
      }
    ]
  },
  {
    type: 'card',
    id: 'hcloud-8vcpus',
    title: '8 vCPU servers at Hetzner Cloud',
    description: 'All Hetzner Cloud server types with 8 shared or dedicated vCPUs.',
    hide_description_in_index: true,
    instances: [
      {
        vendor: 'hcloud',
        server: 'cx51'
      },
      {
        vendor: 'hcloud',
        server: 'cx42'
      },
      {
        vendor: 'hcloud',
        server: 'cpx41'
      },
      {
        vendor: 'hcloud',
        server: 'cax31'
      },
      {
        vendor: 'hcloud',
        server: 'ccx33'
      }
    ]
  },
  {
    type: 'card',
    id: 'hcloud-16vcpus',
    title: '16 vCPU servers at Hetzner Cloud',
    description: 'All Hetzner Cloud server types with 16 shared or dedicated vCPUs.',
    hide_description_in_index: true,
    instances: [
        {
          vendor: 'hcloud',
          server: 'cx52'
        },
        {
          vendor: 'hcloud',
          server: 'cpx51'
        },
        {
          vendor: 'hcloud',
          server: 'cax41'
        },
        {
          vendor: 'hcloud',
          server: 'ccx43'
        }
    ]
  },
  {
    type: 'section', 
    title: 'Further interesting lists of servers',
    description: `Curated lists of servers from various vendors that we used to publish blog posts or in social media.`,
  },
  {
    type: 'card',
    id: 'aws-c-large',
    title: 'C5/C6/C7 Large Instances at AWS',
    description: '3 generations with mixed x86 and ARM architecture of the large size instances from the C series at AWS.',
    instances: [
      {
        vendor: 'aws',
        server: 'c5.large'
      },
      {
        vendor: 'aws',
        server: 'c6g.large'
      },
      {
        vendor: 'aws',
        server: 'c7g.large'
      },
      {
        vendor: 'aws',
        server: 'c7i.large'
      }
    ]
  }
]


module.exports = specialCompares;
