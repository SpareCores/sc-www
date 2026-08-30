const databaseCompares = [
  {
    type: "section",
    id: "aws",
    title: "AWS managed databases",
    description: `<p>Managed database options from AWS using various instance families and sizes for easy comparison.</p>`,
  },
  {
    type: "card",
    id: "aws-16vcpu-64gb",
    title: "16 vCPU and 64GB of RAM database options",
    description: `16 vCPU and 64GB of RAM managed PostgreSQL database options from the recent instance families.`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: "aws",
        database: "db.m5.4xlarge",
      },
      {
        vendor: "aws",
        database: "db.m6i.4xlarge",
      },
      {
        vendor: "aws",
        database: "db.m6g.4xlarge",
      },
      {
        vendor: "aws",
        database: "db.m7i.4xlarge",
      },
      {
        vendor: "aws",
        database: "db.m8g.4xlarge",
      },
      {
        vendor: "aws",
        database: "db.m9g.4xlarge",
      },
    ],
  },
  {
    type: "card",
    id: "aws-16vcpu-128gb",
    title: "16 vCPU and 128GB of RAM database options",
    description: `16 vCPU and 128GB of RAM managed PostgreSQL database options from the recent instance families.`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: "aws",
        database: "db.r5.4xlarge",
      },
      {
        vendor: "aws",
        database: "db.r6i.4xlarge",
      },
      {
        vendor: "aws",
        database: "db.r7i.4xlarge",
      },
      {
        vendor: "aws",
        database: "db.r7g.4xlarge",
      },
      {
        vendor: "aws",
        database: "db.r8g.4xlarge",
      },
    ],
  },
];

module.exports = databaseCompares;
