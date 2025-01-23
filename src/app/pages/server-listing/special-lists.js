const specialServerLists = [
  {
    id: 'test',
    title: 'test list',
    description: `test description text`,
    parameters: {
      vendor: [
        "aws"
      ],
      gpu_min: 2
    },
    columns: '516096',
    order_by: 'gpu_count',
    order_dir: 'desc',
  }

]

module.exports = specialServerLists;
