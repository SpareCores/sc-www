
const specialCompares = [
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
    description: 'All Hetzner Cloud server types with 2 shared or dedicated vCPUs.',
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
