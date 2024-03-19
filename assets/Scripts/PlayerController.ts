import {
  _decorator,
  Component,
  EventMouse,
  Input,
  input,
  Node,
  Vec3,
  Animation,
  EventTouch,
} from 'cc';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40;

@ccclass('PlayerController')
export class PlayerController extends Component {
  @property(Animation)
  bodyAnimation: Animation = null;
  @property(Node)
  leftPart: Node = null;
  @property(Node)
  rightPart: Node = null;

  private _isJumpping = false;
  private _jumpStep = 0;
  private _currJumpTime = 0;
  private _jumpTime = 0.1;
  private _currJumpSpeed = 0;
  private _currPos = new Vec3();
  private _deltaPos = new Vec3(0, 0, 0);
  private _targetPos = new Vec3();
  private _currMoveIndex: number = 0;

  start() {}

  update(deltaTime: number) {
    if (this._isJumpping) {
      this._currJumpTime += deltaTime;
      if (this._currJumpTime >= this._jumpTime) {
        this.node.setPosition(this._targetPos);
        this._isJumpping = false;
        this._onJumpEnd();
      } else {
        this.node.getPosition(this._currPos);
        this._deltaPos.x = this._currJumpSpeed * deltaTime;
        Vec3.add(this._currPos, this._currPos, this._deltaPos);
        this.node.setPosition(this._currPos);
      }
    }
  }

  private _onTouchStart(event: EventTouch) {
    const target = event.target as Node;
    if (target?.name === 'LeftPart') {
      this._jumpByStep(1);
    } else {
      this._jumpByStep(2);
    }
  }

  private _jumpByStep(step: number) {
    if (this._isJumpping) return;
    const jumpAnimationName = step === 1 ? 'OneStep' : 'TwoStep';
    // 根据不一样的动画调整具体的跳跃时间
    this._jumpTime = this.bodyAnimation.getState(jumpAnimationName).duration;
    this._isJumpping = true;
    this._jumpStep = step;
    this._currJumpTime = 0;
    this._currJumpSpeed = (this._jumpStep * BLOCK_SIZE) / this._jumpTime;
    this.node.getPosition(this._currPos);
    Vec3.add(
      this._targetPos,
      this._currPos,
      new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0)
    );
    if (this.bodyAnimation) {
      if (step === 1) this.bodyAnimation.play(jumpAnimationName);
      if (step === 2) this.bodyAnimation.play(jumpAnimationName);
    }
    this._currMoveIndex += step;
  }

  private _onJumpEnd() {
    this.node.emit('JumpEnd', this._currMoveIndex);
  }

  public setInputActive(active: boolean) {
    if (active) {
      this.leftPart.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
      this.rightPart.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
    } else {
      this.leftPart.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
      this.rightPart.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
    }
  }

  public reset() {
    this._currMoveIndex = 0;
  }
}
