import { _decorator, Component, Node, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BoxController')
export class BoxController extends Component {
  private _crrPostion = new Vec3();
  start() {}

  update(deltaTime: number) {
    this.node.getPosition(this._crrPostion);
    if (this._crrPostion.x <= -640) {
        console.log('销毁box');
        this.destroy();
    }
  }
}
