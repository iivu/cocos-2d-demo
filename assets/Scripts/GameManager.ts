import * as cc from 'cc';
import { BLOCK_SIZE, PlayerController } from './PlayerController';

const { ccclass, property } = cc._decorator;

enum BlockType {
  NONE,
  STONE,
}

enum GameState {
  INIT,
  PLAYING,
  END,
}

@ccclass('GameManager')
export class GameManager extends cc.Component {
  @property(cc.Prefab)
  boxPrefab: cc.Prefab = null;
  @property
  roadLength = 50;
  @property(cc.Node)
  startMenu: cc.Node = null;
  @property(PlayerController)
  playerController: PlayerController = null;
  @property(cc.Label)
  stepCountLabel: cc.Label = null;

  private _roadBlocks: BlockType[] = [];
  private _currGameState: GameState = GameState.INIT;

  start() {
    this.updateGameState(GameState.INIT);
    this.playerController.node.on('JumpEnd', this._onPlayerJumpEnd, this);
  }

  update(deltaTime: number) {}

  public onStartButtonClicked() {
    this.updateGameState(GameState.PLAYING);
  }

  private _initRoad() {
    this._emptyRoad();
    this._spawnBlock(0);
    for (let i = 1; i < this.roadLength; i++) {
      this._spawnBlock(i);
    }
  }

  private _emptyRoad() {
    this._roadBlocks = [];
  }

  private _randomPickBlockType() {
    const enumKeys = Object.keys(BlockType)
      .map(k => parseInt(k))
      .filter(v => !isNaN(v));
    return enumKeys[cc.randomRangeInt(0, enumKeys.length)];
  }

  private _spawnBlock(position: number) {
    let blockType = BlockType.NONE;
    if (position === 0) {
      blockType = BlockType.STONE;
    } else {
      if (this._roadBlocks[position - 1] == BlockType.NONE) {
        blockType = BlockType.STONE;
      } else {
        blockType = this._randomPickBlockType();
      }
    }
    if (!this.boxPrefab) return;
    let block = null;
    switch (blockType) {
      case BlockType.STONE:
        block = cc.instantiate(this.boxPrefab);
        break;
    }
    if (block) {
      this.node.addChild(block);
      block.setPosition(position * BLOCK_SIZE, 0, 0);
    }
    this._roadBlocks.push(blockType);
    return block;
  }

  private _onPlayerJumpEnd(currIndex: number) {
    this.stepCountLabel.string = `${currIndex}`;
    const hasNext = this._checkJumpResult(currIndex);
    if (hasNext) {
      this._spawnBlock(this._roadBlocks.length);
    }
  }

  private _initGame() {
    this.startMenu.active = true;
    this._initRoad();
    this.playerController.setInputActive(false);
    this.playerController.node.setPosition(cc.Vec3.ZERO);
    this.playerController.reset();
  }

  private _playGame() {
    this.startMenu.active = false;
    this.stepCountLabel.string = '0';
    setTimeout(() => this.playerController.setInputActive(true), 40);
  }

  private _endGame() {
    this.playerController.setInputActive(false);
  }

  private _checkJumpResult(currIndex: number): boolean {
    if (this._roadBlocks[currIndex] === BlockType.NONE) {
      this.updateGameState(GameState.END);
      return false;
    }
    return true;
  }

  public updateGameState(state: GameState) {
    switch (state) {
      case GameState.INIT:
        this._initGame();
        break;
      case GameState.PLAYING:
        this._playGame();
        break;
      case GameState.END:
        this._endGame();
        break;
    }
    this._currGameState = state;
  }
}
