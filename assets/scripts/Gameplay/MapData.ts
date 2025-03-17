export let mapData = {
  mapProps: {
    width: 6,   //Column
    height: 6,  //Rows
    item_size: 80,
    name: "GameMap1",
    //It is based on Rows X Columns. And 0 means available/walkable and 1 means not available and 2 means player occupied that cell
    data: [
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0
    ]
  },
};
