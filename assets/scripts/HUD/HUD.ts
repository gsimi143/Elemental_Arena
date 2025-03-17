import { _decorator, Button, Component, instantiate, Label, Node, Prefab, Size, UITransform } from 'cc';
import { CharacterStats } from './CharacterStats';
import { PLAYER_TYPE, SPECIAL_ABILITY_TYPE } from '../Constants/Constant';
import { Gameplay } from '../Gameplay/Gameplay';
import { Player } from '../Gameplay/Player';
const { ccclass, property } = _decorator;

@ccclass('HUD')
export class HUD extends Component {

    @property(Node) contentOfPlayersList: Node = null!;
    @property(Node) contentOfEnemiesList: Node = null!;
    @property(Button) attackBtn: Button = null!;
    @property(Button) specialAbilityBtn: Button = null!;
    @property(Label) playerName: Label = null!;
    @property(Label) specialAbilityLbl: Label = null!;
    @property(Prefab) characterStatsPrefab: Prefab = null!;

    playerStatsData: any[] = [];

    start() {

    }
    
    /**
     *  @description Initialize Player and enemy Scrollview list by filtering
     *  the data from @param playersList
     */
    initPlayerList(playersList) {
        playersList.forEach((data, index) => {
            let characterStats = instantiate(this.characterStatsPrefab);
            let charStatsNodeSize = characterStats.getComponent(UITransform);
            let contentNodeSize = new UITransform();
            let margin = 30;
            let stats = {
                health: data.health,
                attackPower: data.attackPower,
                movementRange: data.movementRange,
                specialAbility: data.specialAbility,
                element: data.element,
                cooldown: data.cooldown,
            }
            this.playerStatsData.push({
                id: data.type + " " + index,
                name: data.name,
                PlayerType: data.type,
                charNode: characterStats
            });
            characterStats.getComponent(CharacterStats).initCharacterData(data.name, stats);
            if (data.type == PLAYER_TYPE.PLAYER) {
                this.contentOfPlayersList.addChild(characterStats);
                contentNodeSize = this.contentOfPlayersList.getComponent(UITransform);
                // Update the content's height to ensure scrolling works
                contentNodeSize.height = contentNodeSize.height + charStatsNodeSize.height + margin;
                // Adjust position and other properties of the Character Stats
                let posY = (this.contentOfPlayersList.children.length > 1)
                    ? -((this.contentOfPlayersList.children.length - 1) * charStatsNodeSize.height + margin)
                    : -(margin - 10);
                characterStats.setPosition(0, posY); // Adjust position to create a list
            } else {
                this.contentOfEnemiesList.addChild(characterStats);
                contentNodeSize = this.contentOfEnemiesList.getComponent(UITransform);
                // Update the content's height to ensure scrolling works
                contentNodeSize.height = contentNodeSize.height + charStatsNodeSize.height + margin;
                // Adjust position and other properties of the Character Stats
                let posY = this.contentOfEnemiesList.children.length > 1
                    ? -((this.contentOfEnemiesList.children.length - 1) * charStatsNodeSize.height + margin)
                    : -(margin - 10);
                characterStats.setPosition(0, posY); // Adjust position to create a list
            }
            // Initialize for first player
            (index == 0) && this.updateDataOnTurnChange({
                playerType: data.type,
                playerName: data.name,
                playerSpecialAbility: stats.specialAbility,
                cooldown: data.cooldown,
                isShieldOn: false
            });
        });
    }

    getCharStatsById(playerID) {
        return this.playerStatsData.find(element => element.id === playerID);
    }

    /**
     * 
     * @param playerID is used to get the exact character stats of player 
     * @param health is the new updated health of the charater
     */
    updateCharHealthById(playerID, health) {
        let charStats = this.playerStatsData.find(element => element.id === playerID);
        charStats.charNode.getComponent(CharacterStats).setHealthLabel(health > 0 ? health : 0);
    }

    /**
     * 
     * @param playerData is used to update the update the data on HUD like attack and
     * special ability button's interaction player's name etc.
     * It ensures that the button's interaction is according to the game logic like,
     * if cooldown available and special ability is not in currently use, only then user can use it. 
     */
    updateDataOnTurnChange(playerData) {
        let defender = this.node.parent.getComponent(Gameplay).findWhoCanBeAttacked();
        this.attackBtn.interactable = playerData.playerType == PLAYER_TYPE.PLAYER && defender.length > 0;

        this.specialAbilityBtn.interactable = (playerData.cooldown > 0)
            && (playerData.playerType == PLAYER_TYPE.PLAYER)
            && ((!playerData.isShieldOn && playerData.playerSpecialAbility == SPECIAL_ABILITY_TYPE.SHIELD)
                || (defender.length > 0 && playerData.playerSpecialAbility == SPECIAL_ABILITY_TYPE.BURST)
                || playerData.playerSpecialAbility != SPECIAL_ABILITY_TYPE.BURST);

        this.specialAbilityLbl.string = (playerData.cooldown > 0)
            ? playerData.cooldown + " " + playerData.playerSpecialAbility
            : playerData.playerSpecialAbility;
        let str = (playerData.playerType == PLAYER_TYPE.ENEMY) ? playerData.playerName + "'s Turn (AI)" : playerData.playerName + "'s Turn";
        this.playerName.string = str;
    }

    onAttackBtnClick() {
        this.node.parent.getComponent(Gameplay).attack();
    }

    onSpecialAbilityBtnClick() {
        this.node.parent.getComponent(Gameplay).specialAbilityBtnCallback();
    }



    update(deltaTime: number) {

    }
}


