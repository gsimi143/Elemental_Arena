import { _decorator, Component, Node, Sprite, UITransform, Prefab, instantiate, Vec3, Color } from 'cc';
import { mapData } from '../Gameplay/MapData';
import { Gameplay } from '../Gameplay/Gameplay';
import { PLAYER_TYPE } from '../Constants/Constant';
const { ccclass, property } = _decorator;

@ccclass('GridManager')
export class GridManager extends Component {

    @property(Prefab)
    tile: Prefab = null!;
    @property(Prefab)
    obstacle: Prefab = null!;

    tileSize = null!;
    tilemapData: number[] = [];
    gridData: any = null!;
    tileNodes: any[] = [];

    start() {

    }

    initGrid() {
        this.gridData = JSON.parse(JSON.stringify(mapData.mapProps));
        this.tileSize = this.gridData.item_size;
        this.tilemapData = this.gridData.data;
        this.tileNodes = [];
        this.createTiles();
        this.addRandomObstacles();
    }

    getGridData() {
        return this.gridData;
    }

    /**
     * Calculates the exact position on the grid node using cell address (row and column)
     * @param row 
     * @param column 
     * @returns Vec3 Position on grid node
     */
    getPosOnGrid(row: number, column: number) {
        let upperLeftX = -((this.gridData.height * this.tileSize) * 0.5) + (this.tileSize * 0.5);
        let upperLeftY = ((this.gridData.width * this.tileSize) * 0.5) - (this.tileSize * 0.5);
        let tilePos = new Vec3(upperLeftX + (column * this.tileSize), upperLeftY - (row * this.tileSize));
        return tilePos;
    }

    /**
     * Create a grid of given size from mapData and store it in a tilemapData[] with its properties
     * like cell(row,column) from grid, is it available to walk or not etc.
     */
    createTiles() {
        let row = 0;
        let column = 0;
        for (let x = 0; x < this.tilemapData.length; x++) {
            let tilePos = this.getPosOnGrid(row, column);
            // 0 means walkable, 1 means blocked 
            if (this.tilemapData[x] !== 1) {
                let tileNode = instantiate(this.tile);
                tileNode?.getComponent(UITransform)?.setContentSize(this.tileSize, this.tileSize);
                tileNode.setPosition(tilePos);
                this.node.addChild(tileNode);
                this.tileNodes.push({ node: tileNode, pos: { x: row, y: column }, isWalkable: true });
            }
            if (column == this.gridData.width - 1) {
                row++;
                column = 0;
            } else {
                column++;
            }
        }
    }

    addRandomObstacles() {
        for (let i = 0; i < 3; i++) {
            let randomTile = this.getRandomTileOnGrid();
            let tilePos = this.getPosOnGrid(randomTile.x, randomTile.y);
            let obstacleNode = instantiate(this.obstacle);
            obstacleNode?.getComponent(UITransform)?.setContentSize(this.tileSize, this.tileSize);
            obstacleNode.setPosition(tilePos);
            this.updateGridDataUsingIndex(randomTile, 1, "Id", false);
            this.node.addChild(obstacleNode);
        }
    }

    /**
     * @description Get a random cell from whole grid
     * @returns cell/tile address as {x:0,y:0} from the grid keeping it checked that it is walkable/available
     */
    getRandomTileOnGrid() {
        // Step 1: Filter the array based on the provided condition, and track original indexes
        let filteredIndexes = this.gridData.data.map((element, index) => element === 0 ? index : -1)  // Map element to index if condition is met
            .filter(index => index !== -1);  // Remove the -1 entries, only keeping valid indexes
        // Step 2: Check if there are any matching elements
        if (filteredIndexes.length === 0) {
            return { x: 0, y: 0 };  // Return -1 if no elements match the condition
        }
        // Step 3: Get a random index from the filtered indexes
        let randomIndex = filteredIndexes[Math.floor(Math.random() * filteredIndexes.length)];
        return { x: Math.floor(randomIndex / this.gridData.width), y: randomIndex % this.gridData.width };  // Return the random index
    }

    /**
     * @description Get a random cell from a center point of that short grid and range of a grid
     * @param centePos 
     * @param range 
     * @returns cell/tile address as {x:0,y:0}
     */
    getRandomPointWithInRange(centePos, range) {
        let randomX, randomY;
        let clampedX, clampedY;
        let tileNodeIndex;
        // Generate a random x coordinate within the grid and range
        do {
            // Calculate the random x and y coordinates within the range of the center point
            randomX = Math.floor(Math.random() * (2 * range + 1)) + (centePos.x - range);
            randomY = Math.floor(Math.random() * (2 * range + 1)) + (centePos.y - range);
            // Ensure the generated x and y coordinates are within the grid's bounds
            clampedX = Math.max(0, Math.min(randomX, this.gridData.width - 1));
            clampedY = Math.max(0, Math.min(randomY, this.gridData.height - 1));
            tileNodeIndex = (clampedX * this.gridData.width) + clampedY;
        } while ((clampedX === centePos.x && clampedY === centePos.y) || !this.tileNodes[tileNodeIndex].isWalkable);
        return { x: clampedX, y: clampedY };
    }

    /**
     * @description Upgrade the grid data of that exact cell/tile if its status changes.
     * It also update player's position property, if the check is true.
     * @param tilePos: tile/cell position
     * @param tileValue: is status of tile/cell
     * @param playerId: whose property should be changed
     * @param isPlayerDataChanged: check flag 
     */
    updateGridDataUsingIndex(tilePos: { x: number; y: number; }, tileValue: number, playerId: string, isPlayerDataChanged: boolean) {
        // Accessing value from single [] (Treating it as a grid) using value of [row or x][column or y]
        let mapDataIndex = (tilePos.x * this.gridData.width) + tilePos.y;
        this.gridData.data[mapDataIndex] = tileValue;
        this.tileNodes.forEach(element => {
            if (element.pos.x == tilePos.x && element.pos.y == tilePos.y)
                element.isWalkable = tileValue == 0 ? true : false;
        });
        isPlayerDataChanged && this.node.parent.getComponent(Gameplay).updatePlayerPosOnGrid(playerId, tilePos);
    }

    /**
     * @description Update and add event listener to the tiles according to the range
     *  of current player whose turn is ON. 
     * @param range: movement range of a player
     * @param centerTilePos: position of player on grid data
     * @param isTouchEventAdded: flag to check that event should be added or not
     */
    updateGridTilesWithInRange(range, centerTilePos, isTouchEventAdded) {
        // Define the bounds of the subgrid
        let startX = Math.max(centerTilePos.x - range, 0);  // Ensure no negative indices
        let startY = Math.max(centerTilePos.y - range, 0);
        let endX = Math.min(centerTilePos.x + range, this.gridData.width - 1);  // Ensure within grid size
        let endY = Math.min(centerTilePos.y + range, this.gridData.height - 1);  // Ensure within grid size
        // Extract the subgrid
        this.tileNodes.forEach(tile => {
            this.removeOnTouchEventToTile(tile.node);
            if (this.checkIfPosIsInGrid(startX, startY, endX, endY, tile.pos) && tile.isWalkable) {
                (isTouchEventAdded) && this.addOnTouchEventToTile(tile.node, tile.pos);
                tile.node.getComponent(Sprite).color = new Color(255, 255, 255, 255);
            } else {
                tile.node.getComponent(Sprite).color = new Color(255, 255, 255, 0);
            }
        });
    }

    /**
     * @description check if the given postion is with in the range of given grid based on
     *  its start and end cell/tile position
     * @param startX 
     * @param startY 
     * @param endX 
     * @param endY 
     * @param tilePos 
     * @returns 
     */
    checkIfPosIsInGrid(startX, startY, endX, endY, tilePos) {
        return (startX <= tilePos.x && tilePos.x <= endX) && (startY <= tilePos.y && tilePos.y <= endY);
    }

    addOnTouchEventToTile(tile: Node, tilePos) {
        tile.on(Node.EventType.TOUCH_END || Node.EventType.MOUSE_UP, (event) => {
            this.onTileTouchCallback(event, tilePos);
        }, this);
    }

    onTileTouchCallback(event, tilePos) {
        let isPlayerMoved = this.node.parent.getComponent(Gameplay).findPath(tilePos);
        // If there is no space to move found then simply skip the turn
        (isPlayerMoved === false) && this.node.parent.parent.getComponent(Gameplay).changeTurn();
    }

    removeOnTouchEventToTile(tile: Node) {
        tile.off(Node.EventType.TOUCH_END || Node.EventType.MOUSE_UP);
    }


}


