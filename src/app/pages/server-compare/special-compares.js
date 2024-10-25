const specialCompares = [
  {
    id: 'best-singlecore-2vcpu',
    title: 'Best single-core performance servers with 2 vCPUs',
    description: `This is a manually curated list of 2 vCPU servers with the best single-core performance as per stress-ng's <code>div16</code> CPU burning method.
    Note that servers using the same CPU model at the same vendor were deduplicated, and only the most general options were kept (e.g. from AWS's <code>r6a.large</code>, <code>m6a.large</code>, and <code>c6a.large</code> showing only <code>m6a.large</code> with 8 GiB of memory; similarly GCP's <code>c2d-highmem-2</code>, <code>c2d-standard-2</code>, and <code>c2d-highcpu-2</code> showing only <code>c2d-standard-2</code> with 8 GiB of memory).`,
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
  s.cpu_architecture, s.cpu_manufacturer, s.cpu_family, s.cpu_model, s.cpu_speed,
  s.memory_amount / 1024,
  b.score,
  p.price
FROM server AS s
LEFT JOIN benchmarks AS b
  ON s.vendor_id = b.vendor_id and s.server_id = b.server_id
LEFT JOIN minprice AS p
  ON s.vendor_id = p.vendor_id and s.server_id = p.server_id
WHERE s.status = 'ACTIVE' AND s.vcpus = 2
ORDER BY b.score DESC
LIMIT 25;`,
    instances: [
      {
        vendor: 'aws',
        server: 'm7a.large'
      },
      {
        vendor: 'hcloud',
        server: 'ccx13'
      },
      {
        vendor: 'aws',
        server: 'm6a.large'
      },
        {
          vendor: 'gcp',
          server: 'c2d-standard-2'
        },
        {
          vendor: 'azure',
          server: 'Standard_D2as_v4'
        },
        {
          vendor: 'azure',
          server: 'Standard_B2as_v2'
        },
        {
          vendor: 'gcp',
          server: 't2d-standard-2'
        }
    ]
  },
  {
    id: 'hcloud-2vcpus',
    title: '2 vCPU servers at Hetzner Cloud',
    description: 'All Hetzner Cloud server types with 2 shared or dedicated vCPUs.',
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
    id: 'hcloud-4vcpus',
    title: '4 vCPU servers at Hetzner Cloud',
    description: 'All Hetzner Cloud server types with 4 shared or dedicated vCPUs.',
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
    id: 'hcloud-8vcpus',
    title: '8 vCPU servers at Hetzner Cloud',
    description: 'All Hetzner Cloud server types with 8 shared or dedicated vCPUs.',
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
    id: 'hcloud-16vcpus',
    title: '16 vCPU servers at Hetzner Cloud',
    description: 'All Hetzner Cloud server types with 16 shared or dedicated vCPUs.',
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
