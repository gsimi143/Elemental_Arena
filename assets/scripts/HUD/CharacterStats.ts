import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CharacterStats')
export class CharacterStats extends Component {


    @property(Label)
    characterName: Label = null!;
    @property(Label)
    healthLabel: Label = null!;
    @property(Label)
    attackPowerLabel: Label = null!;   
    @property(Label)
    movementRangeLabel: Label = null!;   
    @property(Label)
    specialAbilityLabel: Label = null!;  
    element: string = "";
    cooldown: number = 0;

    initCharacterData (name: string, data:any){        
        this.characterName.string = name + " ("+ data.element + ")";
        this.healthLabel.string = data.health;
        this.attackPowerLabel.string = data.attackPower;
        this.movementRangeLabel.string = data.movementRange;
        this.specialAbilityLabel.string = data.specialAbility;
        this.element=data.element;
        this.cooldown= data.cooldown;
    }

    setHealthLabel(text: string){
        this.healthLabel.string = text;
    }
    getHealthLabel(){
        return this.healthLabel;        
    }

}


