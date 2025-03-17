/**
 * Note: The original script comments have been annotated. Due to the large changes in the script, there may be leftovers when the conversion is changed. You need to manually change it by yourself
 */
var map_maze = [];
var open_table = [];
var close_table = [];
var path_stack = [];

var is_found = 0;
var open_node_count = 0;
var close_node_count = 0;
var top = -1;

var map_height = 0;
var map_width = 0;
var WALKABLE = 0;
var BARRIER = 1;

//
//
function swap(idx1, idx2) {
  var tmp = open_table[idx1];
  open_table[idx1] = open_table[idx2];
  open_table[idx2] = tmp;
}

function adjust_heap(nIndex) {
  var curr = nIndex;
  var child = curr * 2 + 1; // Get the left child IDX (starting from 0, all children are Curr*2+1)
  var parent = Math.floor((curr - 1) / 2); // 得到双亲idx

  if (nIndex < 0 || nIndex >= open_node_count) {
    return;
  }

  // Adjust down (to compare children and CUUR PARENT)
  //
  while (child < open_node_count) {
    // Small root pile is a parent value less than the child value
    //
    if (
      child + 1 < open_node_count &&
      open_table[child].s_g + open_table[child].s_h >
      open_table[child + 1].s_g + open_table[child + 1].s_h
    ) {
      ++child; // 判断左右孩子大小
    }

    if (
      open_table[curr].s_g + open_table[curr].s_h <=
      open_table[child].s_g + open_table[child].s_h
    ) {
      break;
    } else {
      swap(child, curr); // 交换节点
      curr = child; // 再判断当前孩子节点
      child = curr * 2 + 1; // 再判断左孩子
    }
  }

  if (curr != nIndex) {
    return;
  }

  // 往上调整( 只需要比较cuur child和parent )
  //
  while (curr != 0) {
    if (
      open_table[curr].s_g + open_table[curr].s_h >=
      open_table[parent].s_g + open_table[parent].s_h
    ) {
      break;
    } else {
      swap(curr, parent);
      curr = parent;
      parent = Math.floor((curr - 1) / 2);
    }
  }
}
//
function insert_to_opentable(x, y, curr_node, end_node, w) {
  var i;

  if (map_maze[x * map_width + y].s_style == WALKABLE) {
    // Not a barrier
    if (!map_maze[x * map_width + y].s_is_in_closetable) {
      // 不在闭表中
      if (map_maze[x * map_width + y].s_is_in_opentable) {
        // 在open表中
        // 需要判断是否是一条更优化的路径
        //
        if (map_maze[x * map_width + y].s_g > curr_node.s_g + w) {
          // 如果更优化
          map_maze[x * map_width + y].s_g = curr_node.s_g + w;
          map_maze[x * map_width + y].s_parent = curr_node;

          for (i = 0; i < open_node_count; ++i) {
            if (
              open_table[i].s_x == map_maze[x * map_width + y].s_x &&
              open_table[i].s_y == map_maze[x * map_width + y].s_y
            ) {
              break;
            }
          }

          adjust_heap(i); // 下面调整点
        }
      } // 不在open中
      else {
        map_maze[x * map_width + y].s_g = curr_node.s_g + w;
        map_maze[x * map_width + y].s_h = Math.abs(end_node.s_x - x) + Math.abs(end_node.s_y - y);
        map_maze[x * map_width + y].s_parent = curr_node;
        map_maze[x * map_width + y].s_is_in_opentable = 1;
        open_table[open_node_count++] = map_maze[x * map_width + y];
      }
    }
  }
}

function get_neighbors(curr_node, end_node) {
  var x = curr_node.s_x;
  var y = curr_node.s_y;

  // 下面对于8个邻居进行处理！
  //
  if (x + 1 >= 0 && x + 1 < map_height && y >= 0 && y < map_width) {
    insert_to_opentable(x + 1, y, curr_node, end_node, 10);
  }

  if (x - 1 >= 0 && x - 1 < map_height && y >= 0 && y < map_width) {
    insert_to_opentable(x - 1, y, curr_node, end_node, 10);
  }

  if (x >= 0 && x < map_height && y + 1 >= 0 && y + 1 < map_width) {
    insert_to_opentable(x, y + 1, curr_node, end_node, 10);
  }

  if (x >= 0 && x < map_height && y - 1 >= 0 && y - 1 < map_width) {
    insert_to_opentable(x, y - 1, curr_node, end_node, 10);
  }

  if (x + 1 >= 0 && x + 1 < map_height && y + 1 >= 0 && y + 1 < map_width) {
    insert_to_opentable(x + 1, y + 1, curr_node, end_node, 10 + 4);
  }

  if (x + 1 >= 0 && x + 1 < map_height && y - 1 >= 0 && y - 1 < map_width) {
    insert_to_opentable(x + 1, y - 1, curr_node, end_node, 10 + 4);
  }

  if (x - 1 >= 0 && x - 1 < map_height && y + 1 >= 0 && y + 1 < map_width) {
    insert_to_opentable(x - 1, y + 1, curr_node, end_node, 10 + 4);
  }

  if (x - 1 >= 0 && x - 1 < map_height && y - 1 >= 0 && y - 1 < map_width) {
    insert_to_opentable(x - 1, y - 1, curr_node, end_node, 10 + 4);
  }
}
//
function astar_init(map) {
  open_table = [];
  close_table = [];
  path_stack = [];
  map_maze = [];

  map_width = map.width;
  map_height = map.height;

  is_found = 0;
  open_node_count = 0;
  close_node_count = 0;
  top = -1;

  for (var i = 0; i < map.height; i++) {
    for (var j = 0; j < map.width; j++) {
      var node: any = {};
      node.s_g = 0;
      node.s_h = 0;
      node.s_is_in_closetable = 0;
      node.s_is_in_opentable = 0;
      node.s_style = map.data[i * map.width + j];
      node.s_x = i;
      node.s_y = j;
      node.s_parent = null;
      map_maze.push(node);

      path_stack.push(null);
      open_table.push(null);
      close_table.push(null);
    }
  }
}

function astar_search(map, src_x, src_y, dst_x, dst_y) {
  var path = [];
  if (src_x == dst_x && src_y == dst_y) {
    console.log("起点==终点!");
    return path;
  }
  astar_init(map);
  var start_node = map_maze[src_x * map.width + src_y];
  var end_node = map_maze[dst_x * map.width + dst_y];
  var curr_node = null;

  open_table[open_node_count++] = start_node;

  start_node.s_is_in_opentable = 1; // 加入open表
  start_node.s_g = 0;
  start_node.s_h =
    Math.abs(end_node.s_x - start_node.s_x) + Math.abs(end_node.s_y - start_node.s_y);
  start_node.s_parent = null;

  is_found = 0;
  while (1) {
    curr_node = open_table[0]; // openThe first point of the table must be the point with the least F value (obtained by sorting through the heap)
    open_table[0] = open_table[--open_node_count]; // Put the last point to the first point, and then adjust the heap adjustment
    adjust_heap(0); // 调整堆

    close_table[close_node_count++] = curr_node; // Add the CLOSE table at the current point
    curr_node.s_is_in_closetable = 1; // Already in the close table

    if (curr_node.s_x == end_node.s_x && curr_node.s_y == end_node.s_y) {
      // 终点在close中，结束
      is_found = 1;
      break;
    }

    get_neighbors(curr_node, end_node); // 对邻居的处理

    if (open_node_count == 0) {
      // 没有路径到达
      is_found = 0;
      break;
    }
  }

  if (is_found) {
    curr_node = end_node;

    while (curr_node) {
      path_stack[++top] = curr_node;
      curr_node = curr_node.s_parent;
    }

    while (top >= 0) {
      // 下面是输出路径看看~
      path.push({ x: path_stack[top].s_x, y: path_stack[top].s_y });
      top--;
    }
  } else {
    console.log("么有找到路径");
  }
  return path;
}


export { astar_search };
