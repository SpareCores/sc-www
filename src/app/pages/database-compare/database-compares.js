const databaseCompares = [
  {
    type: "section",
    id: "example-database-comparisons",
    title: "Example database comparisons",
    description: `<p>Temporary placeholder section for curated managed database (DBaaS) comparison sets.</p>`,
  },
  {
    type: "card",
    id: "example-postgres-compare",
    title: "Example PostgreSQL comparison",
    description: `Temporary placeholder card. Replace with a real curated set of managed PostgreSQL databases.`,
    hide_description_in_index: true,
    instances: [
      {
        vendor: "gcp",
        database: "db-c4a-highmem-4",
      },
      {
        vendor: "gcp",
        database: "db-c4a-highmem-48",
      },
    ],
  },
];

module.exports = databaseCompares;
