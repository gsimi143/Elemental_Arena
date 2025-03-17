import { _decorator, Color, Component, director, instantiate, JsonAsset, Node, Prefab, resources, Tween, Vec3 } from "cc";
import { astar_search } from "./astar";
import { GridManager } from "../Managers/GridManager";
import { Player } from "./Player";
import { HUD } from "../HUD/HUD";
import { CUSTOM_EVENT, ELEMENT_TYPE, PLAYER_TYPE } from "../Constants/Constant";
import { ResourcesManager } from "../Managers/ResourcesManager";
import { GameEndPopUp } from "./GameEndPopUp";
const { ccclass, property } = _decorator;

@ccclass("Gameplay")
export class Gameplay extends Component {


  @property(Node) grid: Node = null!;
  @property(Prefab) gameEndPopUp: Prefab = null!;
  @property(Prefab) HUDPrefab: Prefab = null!;
  @property(Prefab) particleSystemPrefab: Prefab = null!;
  @property({ type: [Prefab] })
  public playerPrefabList: Prefab[] = [];
  @property({ type: [Prefab] })
  public enemiesPrefabList: Prefab[] = [];

  playersList: any[] = [];
  HUD: Node = null!;
  currentPlayer: any = null!;
  gridManagerComponent: any = null!;
  isLodingDone: boolean;

  start() {
    director.on(
      CUSTOM_EVENT.LOADING_DONE,
      () => {
        this.isLodingDone = true;
        this.gridManagerComponent = this.grid.getComponent(GridManager);
        this.gridManagerComponent.initGrid();
        this.loadAndInitGameData();
      },
      this
    );
  }

  /**
   * @description check if player data is available in cache, if not load from resources and update.
   */
  loadAndInitGameData() {
    let playersData: JsonAsset = <JsonAsset>(
      ResourcesManager.Instance.getResourceFromCache(`PlayerData`)
    );
    if (playersData) {
      this.initPlayers(playersData.json);
      this.initHUD(playersData.json);
    } else {
      const playersDataPath = `PlayersData/PlayersData1`;
      resources.load(playersDataPath, JsonAsset, (err, data) => {
        this.initPlayers(data.json);
        this.initHUD(data.json);
      });
    }
  }

  /**
   * @description Initialize and add the HUD into the playground of the game using given players data.
   * @param playersData 
   */
  initHUD(playersData) {
    this.HUD = instantiate(this.HUDPrefab);
    this.node.addChild(this.HUD);
    this.HUD.getComponent(HUD).initPlayerList(playersData.players);
    // this.HUD.getComponent(HUD).updateCharStatsById("Player0", currentHealth);
  }

  /**
   * @description Initialize and add the players into the game based on their type (enemy/player) by using player's data from PlayerData.JSON
   * @param playerData 
   */
  initPlayers(playerData) {
    let playerIndex = 0;
    let enemyIndex = 0;
    playerData.players.forEach((player, index) => {
      let playerPrefab;
      if (player.type == PLAYER_TYPE.PLAYER) {
        playerPrefab = this.playerPrefabList[playerIndex++] || this.playerPrefabList[0];
      } else {
        playerPrefab = this.enemiesPrefabList[enemyIndex++] || this.enemiesPrefabList[0];
      }
      this.addPlayerToGrid(playerPrefab, player, index);
    });
  }

  /**
   * @description Instatiate and add the player into the grid and also intialize its data to manage it later.
   * @param playerPrefab 
   * @param playerJsonData 
   * @param index 
   */
  addPlayerToGrid(playerPrefab, playerJsonData, index) {
    let player = instantiate(playerPrefab);
    this.grid.addChild(player);
    let randomTile = this.gridManagerComponent.getRandomTileOnGrid();
    let stats = {
      health: playerJsonData.health,
      attackPower: playerJsonData.attackPower,
      movementRange: playerJsonData.movementRange,
      specialAbility: playerJsonData.specialAbility,
      element: playerJsonData.element,
      cooldown: playerJsonData.cooldown,
    };
    let playerData = {
      id: playerJsonData.type + " " + index,
      name: playerJsonData.name,
      posOnGrid: randomTile,
      node: player,
      playerType: playerJsonData.type,
      isTurnTaken: (index === 0) ? true : false
    };
    this.playersList.push(playerData);
    player.getComponent(Player).initPlayerData(playerData.id, playerData.name, randomTile, playerData.playerType, stats);
    let pos = this.gridManagerComponent.getPosOnGrid(randomTile.x, randomTile.y);
    player.setPosition(pos);
    player.getComponent(Player).setPosOnGrid(randomTile);
    this.gridManagerComponent.updateGridDataUsingIndex(randomTile, 2, playerData.id, false);
    // Initializing turn to first player
    if (index == 0) {
      this.currentPlayer = playerData;
      // Update new player
      this.currentPlayer.node?.getComponent(Player).onTurnChange(true);
    }
  }

  specialAbilityBtnCallback() {
    this.currentPlayer.node.getComponent(Player).useSpecialAbility();
  }

  /**
   * @description Find and Attack the opponents with in range of current player also based on its special ability (Burst)
   * @returns null if no opponent found in given range of current player
   */
  attack() {
    // Figure out who the current player can attack. 
    let opponentPlayers = this.findWhoCanBeAttacked();
    if (!opponentPlayers.length)
      return null;
    let isBurstOn = this.currentPlayer.node?.getComponent(Player).checkIfBurstOn();
    if (isBurstOn) {
      opponentPlayers.forEach((opponent, index) => {
        this.attackPlayer(this.currentPlayer, opponent, (index == opponentPlayers.length - 1));
      });
    } else {
      let player = opponentPlayers[0];
      player && this.attackPlayer(this.currentPlayer, player, true);

    }
  }

  /**
   * @description Perform an Attack action on the attacker and defender and also calculate damage
   *  and manage their data accordingly
   * @param attacker 
   * @param defender 
   * @param turnCheck: flag to check when can change the turn or not
   * @returns 
   */
  attackPlayer(attacker, defender, turnCheck) {
    let particleNode = instantiate(this.particleSystemPrefab);
    // Add to parent node
    this.grid.addChild(particleNode);
    particleNode.setPosition(new Vec3(attacker.node?.getPosition().x, attacker.node?.getPosition().y));
    new Tween(particleNode)
      .call(() => {
        let damage = this.calculateElementalDamage(attacker, defender);
        defender.node?.getComponent(Player).takeDamage(damage);
        this.HUD.getComponent(HUD).updateCharHealthById(defender.id, defender.node?.getComponent(Player).getHealth());
        attacker.node?.getComponent(Player).playShootAnimation();
      }, this)
      .to(0.3, {
        position: new Vec3(defender.node?.getPosition().x, defender.node?.getPosition().y)
      })
      .call(() => {
        turnCheck && this.changeTurn();
        particleNode.destroy();
      }, this)
      .start();
    return true;
  }

  /**
   * @description Calculate the Damage amount of defender based on their element value
   * @param attacker 
   * @param defender 
   * @returns 
   */
  calculateElementalDamage(attacker, defender) {
    let attackerComponent = attacker.node?.getComponent(Player);
    let defenderComponent = defender.node?.getComponent(Player);
    if (attackerComponent.geElement() === ELEMENT_TYPE.FIRE && defenderComponent.geElement() === ELEMENT_TYPE.EARTH) {
      return attackerComponent.getAttackPower() * 1.5; // Fire beats Earth
    } else if (attackerComponent.geElement() === ELEMENT_TYPE.EARTH && defenderComponent.geElement() === ELEMENT_TYPE.WATER) {
      return attackerComponent.getAttackPower() * 1.5; // Earth beats Water
    } else if (attackerComponent.geElement() === ELEMENT_TYPE.WATER && defenderComponent.geElement() === ELEMENT_TYPE.FIRE) {
      return attackerComponent.getAttackPower() * 1.5; // Water beats Fire
    } else {
      return attackerComponent.getAttackPower(); // Neutral or same element
    }
  }

  /**
   * @description Figure out who the current player can attack. 
   * @returns list of array of opponents who are with in the movement range of current player
   */
  findWhoCanBeAttacked() {
    // Define the bounds of the subgrid
    let playerPos = this.currentPlayer.posOnGrid;
    let range = this.currentPlayer.node?.getComponent(Player).getMovementRange();
    let startX = Math.max(playerPos.x - range, 0);  // Ensure no negative indices
    let startY = Math.max(playerPos.y - range, 0);  // Ensure no negative indices
    let endX = Math.min(playerPos.x + range, this.gridManagerComponent.getGridData().width - 1);  // Ensure within grid size
    let endY = Math.min(playerPos.y + range, this.gridManagerComponent.getGridData().height - 1);  // Ensure within grid size

    // Extract Opponent list from playerList[]
    let opponents = this.playersList.filter((player) =>
      (player.playerType != this.currentPlayer.playerType) &&
      (this.gridManagerComponent.checkIfPosIsInGrid(startX, startY, endX, endY, player.posOnGrid))
    );
    return opponents;
  }

  /**
   * @description Remove the dead player from player data List using its ID
   * @param playerId 
   */
  removePlayerFromList(playerId) {
    this.playersList = this.playersList.filter((player) =>
      (player.id != playerId)
    );
    this.checkIfGameEnd();
  }

  checkIfGameEnd() {
    let playersLeft = this.playersList.filter((player) =>
      (player.playerType != PLAYER_TYPE.PLAYER)
    );
    let enemiesLeft = this.playersList.filter((player) =>
      (player.playerType != PLAYER_TYPE.ENEMY)
    );
    (playersLeft.length <= 0) && this.onGameEnd("You Win");
    (enemiesLeft.length <= 0) && this.onGameEnd("You Loose");
  }

  updatePlayerPosOnGrid(playerId, tilePos) {
    this.playersList.forEach((player) => {
      if (player.id === playerId && (player.posOnGrid.x != tilePos.x || player.posOnGrid.y != tilePos.y)) {
        player.posOnGrid = tilePos;
        this.changeTurn();
      }
    });
  }

  onGameEnd(message) {
    new Tween(this.node)
      .delay(1)
      .call(() => {
        let popUp = instantiate(this.gameEndPopUp);
        this.node.parent.addChild(popUp);
        popUp.getComponent(GameEndPopUp).initPopUp(message, this);
        this.resetGameData();
      }, this)
      .start();

  }

  resetTurnDataForAllPlayers() {
    this.playersList.forEach((player) => {
      player.isTurnTaken = false;
      player.node?.getComponent(Player).onTurnChange(false);
    });
  }

  /**
   * @description CHange the turn between players and enemies using alternative turn 
   */
  changeTurn() {
    let result = -1;
    this.playersList.forEach((element, index) => {
      if (element.node.parent && (element.playerType != this.currentPlayer.playerType) && !element.isTurnTaken && result === -1) {
        result = index;
        return result;
      }
    });
    if (result != -1) {
      // Update Old player
      this.currentPlayer.node?.getComponent(Player).onTurnChange(false);
      this.currentPlayer = this.playersList[result];
      // Update new player
      this.playersList[result].node?.getComponent(Player).onTurnChange(true);
      this.playersList[result].isTurnTaken = true;
      let playerData = {
        playerType: this.playersList[result].playerType,
        playerName: this.playersList[result].name,
        playerSpecialAbility: this.playersList[result].node?.getComponent(Player).getSpecialAbility(),
        cooldown: this.playersList[result].node?.getComponent(Player).getCooldown(),
        isShieldOn: this.playersList[result].node?.getComponent(Player).checkIfShieldOn()
      }
      this.HUD.getComponent(HUD).updateDataOnTurnChange(playerData);
    } else {
      this.resetTurnDataForAllPlayers();
      this.currentPlayer = this.playersList[0];
      // Update new player
      this.currentPlayer.node?.getComponent(Player).onTurnChange(true);
      this.playersList[0].isTurnTaken = true;
      let playerData = {
        playerType: this.playersList[0].playerType,
        playerName: this.playersList[0].name,
        playerSpecialAbility: this.playersList[0].node?.getComponent(Player).getSpecialAbility(),
        cooldown: this.playersList[0].node?.getComponent(Player).getCooldown(),
        isShieldOn: this.playersList[0].node?.getComponent(Player).checkIfShieldOn()
      }
      this.HUD.getComponent(HUD).updateDataOnTurnChange(playerData);
    }
  }

  resetGameData() {
    this.grid.destroyAllChildren();
    this.HUD.destroy();
    this.currentPlayer = null;
    this.playersList = [];
    this.HUD = null;
    this.node.active = false;
    this.gridManagerComponent = this.grid.getComponent(GridManager);
    this.gridManagerComponent.initGrid();
    this.loadAndInitGameData();
  }

  playPopUpActionOnNode() {
    new Tween(this.node)
      .delay(0.1)
      .call(() => {
        this.node.active = true;
      }, this)
      .start();
  }

  findPath(dst) {
    let src = this.currentPlayer.posOnGrid;
    let path = this.astar_search(src, dst);
    if (!path) return false;
    path && this.currentPlayer.node?.getComponent(Player).moveAlongPath(path);
  }

  /**
   * @description A* pathfinding algorithm to find the shortest path from source point to destination 
   * of a given grid
   * @param src_w 
   * @param dst_w 
   * @returns 
   */
  astar_search(src_w, dst_w) {
    let src = src_w;
    let dst = dst_w;
    let src_mx = src.x;
    let src_my = src.y;
    let dst_mx = dst.x;
    let dst_my = dst.y;
    let path_pos = [];
    if (src_mx < 0 || src_my < 0 || dst_mx < 0 || dst_my < 0) {
      return path_pos;
    }

    let path = astar_search(this.gridManagerComponent.getGridData(), src_mx, src_my, dst_mx, dst_my);
    // let path = astar_search(this.gridManagerComponent, 0, 0, 4, 3);
    return path;
  }
}
