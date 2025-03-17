import { _decorator, Component, Animation, Node, UITransform, Vec3, Color, Sprite, Label, Tween } from 'cc';
import { GridManager } from '../Managers/GridManager';
import { CHARACTER_ANIMATION_NAME, PLAYER_TYPE, SOUNDS_NAME, SPECIAL_ABILITY_TYPE } from '../Constants/Constant';
import { Gameplay } from './Gameplay';
import { HUD } from '../HUD/HUD';
import { GameManager } from '../Managers/GameManager';
import { ResourcesManager } from '../Managers/ResourcesManager';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    @property(Animation)
    characterAnimation: Animation = null!;
    @property(Sprite)
    characterBase: Sprite = null!;

    playerId: string = "";
    playerName: string = "";
    playerType: any = "";
    posOnGrid: any = null!;
    health: number = 100;
    attackPower: number = 10;
    movementRange: number = 2;
    specialAbility: string = "";
    element: string = "";
    cooldown: number = 0;
    isPlayerTurn: boolean = false;
    isShieldOn: boolean = false;
    isBurstOn: boolean = false;
    playerBaseColor: Color = new Color(15, 240, 255, 255);
    enemyBaseColor: Color = new Color(255, 0, 80, 255);

    start() {
        this.scaleNodeToCellSize(this.node.parent.getComponent(GridManager).tileSize);
    }

    /**
     * @description Move player with animation on the given path of grid in terms of row/x,column/y
     * @param path 
     */
    moveAlongPath(path: { x: number; y: number }[]) {
        let delayInNextAction = 0.4;
        let moveAction = new Tween(this.node);
        let startPos = path.shift();
        path.forEach((step, index) => {
            let nextTilePosition = this.node.getParent().getComponent(GridManager).getPosOnGrid(step.x, step.y);
            this.posOnGrid = step;
            moveAction = moveAction
                .call(() => {
                    (index == 0) && this.updateAnimation(CHARACTER_ANIMATION_NAME.RUN);
                }, this)
                .to(delayInNextAction, {
                    position: new Vec3(nextTilePosition.x, nextTilePosition.y, 0)
                })
                .call(() => {
                    if (index >= (path.length - 1)) {
                        this.updateAnimation(CHARACTER_ANIMATION_NAME.IDLE);
                        //Update Grid Data on end of the path
                        this.posOnGrid = path[index];
                        this.node.parent.getComponent(GridManager).updateGridDataUsingIndex(startPos, 0, this.playerId, false);
                        this.node.parent.getComponent(GridManager).updateGridDataUsingIndex(path[index], 2, this.playerId, true);
                        this.isPlayerTurn &&
                            this.node.parent.getComponent(GridManager).updateGridTilesWithInRange(this.movementRange, this.posOnGrid, this.playerType == PLAYER_TYPE.PLAYER);
                    }
                }, this);
        });
        moveAction.start();
    }

    /**
     * @description Initialize player's data
     * @param id 
     * @param name 
     * @param posOnGrid 
     * @param type 
     * @param data 
     */
    initPlayerData(id: string, name: string, posOnGrid: any, type: string, data: any) {
        this.playerId = id;
        this.playerName = name;
        this.playerType = type;
        this.posOnGrid = posOnGrid;
        this.health = data.health;
        this.attackPower = data.attackPower;
        this.movementRange = data.movementRange;
        this.specialAbility = data.specialAbility;
        this.element = data.element;
        this.cooldown = data.cooldown;
    }

    setPosOnGrid(pos) {
        this.posOnGrid = pos;
    }

    getPosOnGrid() {
        return this.posOnGrid;
    }

    getSpecialAbility() {
        return this.specialAbility;
    }

    getCooldown() {
        return this.cooldown;
    }

    getAttackPower() {
        return this.attackPower;
    }
    geElement() {
        return this.element;
    }

    getHealth() {
        return this.health;
    }

    getId() {
        return this.playerId;
    }

    checkIfBurstOn() {
        return this.isBurstOn;
    }

    checkIfShieldOn() {
        return this.isShieldOn;
    }

    getMovementRange() {
        return this.movementRange;
    }

    updateHealth(health: number) {
        this.health += health;
    }

    /**
     * @description Manage the highlighting of the player shadow according to its turn
     * @param isPlayersTurn 
     */
    onTurnChange(isPlayersTurn: boolean) {
        this.isPlayerTurn = isPlayersTurn;
        if (isPlayersTurn) {
            this.node.parent.getComponent(GridManager).updateGridTilesWithInRange(this.movementRange, this.posOnGrid, this.playerType == PLAYER_TYPE.PLAYER);
            this.changeBaseColor(new Color(255, 255, 255, 255));
            (this.playerType == PLAYER_TYPE.ENEMY) && new Tween(this.node)
                .delay(4)
                .call(() => {
                    this.decide_AI_Action();

                }, this)
                .start();
        } else {
            this.changeBaseColor(this.playerType == PLAYER_TYPE.PLAYER ? this.playerBaseColor : this.enemyBaseColor);
        }

    }

    changeBaseColor(color) {
        this.characterBase.color = color;
    }

    /**
     * @description Decide the AI action using a simple decision tree
     * to ensure that whether to make a decision or not based on defender search, Special Ability,
     * Attack, movement decision
     */
    decide_AI_Action() {
        let defender = this.node.parent.parent.getComponent(Gameplay).findWhoCanBeAttacked();
        if ((this.health < 40 && !this.isShieldOn && this.specialAbility != SPECIAL_ABILITY_TYPE.BURST) || ((defender.length > 0) && this.specialAbility == SPECIAL_ABILITY_TYPE.BURST)) {
            this.useSpecialAbility();
        } else if (defender.length > 0) {
            this.node.parent.parent.getComponent(Gameplay).attack();
        } else {
            let randomTile = this.node.parent.getComponent(GridManager).getRandomPointWithInRange(this.posOnGrid, this.movementRange);
            console.log("randomTile::", randomTile, this.posOnGrid);
            let isPlayerMoved = this.node.parent.parent.getComponent(Gameplay).findPath(randomTile);
            // If there is no space to move found then simply skip the turn
            (isPlayerMoved === false) && this.node.parent.parent.getComponent(Gameplay).changeTurn();
        }
    }

    /**
     * @description Based on the type of special ability allow current player to attack/heal/defence himself
     */
    useSpecialAbility() {
        let gamePlayComponent = this.node.parent.parent.getComponent(Gameplay);
        switch (this.specialAbility) {
            case SPECIAL_ABILITY_TYPE.BURST:
                // Attack all players in the range of current player
                this.useBurst();
                gamePlayComponent.attack();
                break;
            case SPECIAL_ABILITY_TYPE.HEAL:
                this.heal(30);
                gamePlayComponent.HUD.getComponent(HUD).updateCharHealthById(this.playerId, this.getHealth());
                gamePlayComponent.changeTurn();
                break;
            case SPECIAL_ABILITY_TYPE.SHIELD:
                this.useShield();
                gamePlayComponent.changeTurn();
                break;
            default:
                break;
        }
    }

    heal(healBy) {
        if (this.cooldown > 0) {
            GameManager.Instance.PersistNodeRef.playEffect(
                ResourcesManager.Instance.getResourceFromCache(SOUNDS_NAME.HEAL)
            );
            this.health += healBy;
            this.cooldown--;
        }
    }

    useShield() {
        if (this.cooldown > 0) {
            GameManager.Instance.PersistNodeRef.playEffect(
                ResourcesManager.Instance.getResourceFromCache(SOUNDS_NAME.SHIELD)
            );
            this.isShieldOn = true;
            this.cooldown--;
        }
    }

    useBurst() {
        if (this.cooldown > 0) {
            this.isBurstOn = true;
            this.cooldown--;
        }
    }

    takeDamage(amount: number) {
        let damage = Math.floor(this.isShieldOn ? amount / 2 : amount);
        this.health -= damage;
        this.isShieldOn = false;
        this.addLabel(damage);
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        new Tween(this.node)
            .call(() => {
                GameManager.Instance.PersistNodeRef.playEffect(
                    ResourcesManager.Instance.getResourceFromCache(SOUNDS_NAME.DEAD)
                );
                this.updateAnimation(CHARACTER_ANIMATION_NAME.DEAD);
                this.node.parent.getComponent(GridManager).updateGridDataUsingIndex(this.posOnGrid, 0, this.playerId, false);
                this.node.parent.parent.getComponent(Gameplay).removePlayerFromList(this.playerId);
            }, this)
            .delay(0.5)
            .call(() => {
                this.node.destroy();
            }, this)
            .start();
    }

    playShootAnimation() {
        new Tween(this.node)
            .call(() => {
                GameManager.Instance.PersistNodeRef.playEffect(
                    ResourcesManager.Instance.getResourceFromCache(SOUNDS_NAME.ATTACK)
                );
                this.updateAnimation(CHARACTER_ANIMATION_NAME.SHOOT);
            }, this)
            .delay(0.5)
            .call(() => {
                this.updateAnimation(CHARACTER_ANIMATION_NAME.IDLE);
            }, this)
            .start();
    }

    scaleNodeToCellSize(cellSize: number) {
        let uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) {
            console.error("UITransform component is missing!");
            return;
        }
        let originalHeight = uiTransform.height;
        let scaleY = (cellSize / originalHeight) * 0.8;
        this.node.setScale(new Vec3(scaleY, scaleY, 1));
    }

    updateAnimation(clipName) {
        this.stopAnimation();
        this.playAnimations(clipName);
    }

    playAnimations(clipName) {
        this.characterAnimation.play(clipName);
    }

    stopAnimation() {
        this.characterAnimation.stop();
    }

    resumeAnimation() {
        this.characterAnimation.resume();
    }

    addLabel(labelString) {
        let label = new Node();
        label.addComponent(Label);
        label.getComponent(Label).fontSize = 100;
        label.getComponent(Label).lineHeight = 100;
        label.getComponent(Label).color = new Color(255, 0, 0, 255);
        label.getComponent(Label).string = labelString;
        this.node.addChild(label);
        new Tween(label)
            .to(0.5, {
                position: new Vec3(0, 200, 0)
            })
            .call(() => {
                label.destroy();
            })
            .start();
    }
}


