import { _decorator, Button, Component, Label, Node, Tween, Vec3 } from 'cc';
import { GameManager } from '../Managers/GameManager';
import { ResourcesManager } from '../Managers/ResourcesManager';
import { SOUNDS_NAME } from '../Constants/Constant';
const { ccclass, property } = _decorator;

@ccclass('GameEndPopUp')
export class GameEndPopUp extends Component {


    @property(Node) gameEndBoard: Node = null!;
    @property(Button) replayBtn: Button = null!;
    @property(Label) message: Label = null!;

    refOfPlayground: any = null!;

    start() {

    }

    initPopUp(msg: string, ref: any) {
        this.message.string = msg;
        this.refOfPlayground = ref;
        GameManager.Instance.PersistNodeRef.playEffect(
            ResourcesManager.Instance.getResourceFromCache(SOUNDS_NAME.GAME_END)
        );
        new Tween(this.gameEndBoard)
            .to(0.2, {
                scale: new Vec3(1, 1, 1)
            }, { easing: 'sineOut' })
            .start();
    }

    onReplayBtnCallback() {
        new Tween(this.gameEndBoard)
            .to(0.3, {
                scale: new Vec3(0, 0, 0)
            }, { easing: 'sineIn' })
            .call(() => {
                this.refOfPlayground.playPopUpActionOnNode();
                this.node.destroy();
            }, this)
            .start();
    }

}


