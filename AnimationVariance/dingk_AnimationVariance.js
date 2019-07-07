/*******************************************************************************
 * Animation Variance v0.1 by dingk
 * For use in RMMV 1.6.2
 ******************************************************************************/

var Imported = Imported || {};
Imported.dingk_AnimationVariance = true;

var dingk = dingk || {};
dingk.AV = dingk.AV || {};

/*:
 * @plugindesc [v0.1] Allow slight variations in battle animations.
 * @author dingk
 *
 * @help
 * -----------------------------------------------------------------------------
 *   Introduction
 * -----------------------------------------------------------------------------
 * Tired of looking at the same animation every time you attack? Or trying to 
 * make a multi-hit skill but don't want to spend so much time fiddling with the 
 * animations editor? This plugin allows you to make slight variations to your 
 * animations, so it looks slightly different every time a skill is executed. 
 * You can set the rotation, scale, and position to be different every time 
 * right in the skills editor with notetags. In addition, you can also make 
 * animations move with respect to the origin.
 *
 * This plugin is in development, and things may change.
 *
 * -----------------------------------------------------------------------------
 *   Notetags
 * -----------------------------------------------------------------------------
 * Item and Skill Notetags:
 * 
 * <Action Animation Variance>
 * rotation: a to b
 * position X: a to b
 * position Y: a to b
 * </Action Animation Variance>
 *  > Make the assigned skill animation vary with rotation and position. Set the 
 *    rotation to vary from range 'a' to 'b' in degrees, positions from 'a' to
 *    'b'. Each property is optional.
 *
 * <Animation a Variance>
 * ...
 * </Animation a Variance>
 *  > For YEP_BattleEngineCore action sequences. If you use different animations
 *    in your action sequences, use this notetag, setting 'a' to be the 
 *    animation ID. Same setup as above.
 *
 * <Action Animation Move[: a]>
 * ...
 * </Action Animation Move>
 *  > Make the assigned skill animation move with respect to the target's 
 *    position. You can optionally set 'a' number of animation frames that the 
 *    animation will move. Otherwise, it will move for the entire animation.
 *  > Example: <Action Animation Move>
 *             position X: 0 to -200
 *             </Action Animation Move>
 *    Moves the animation from the target's position to 200 pixels to the left.
 *
 * <Animation b Move[: a]>
 * ...
 * </Animation b Move>
 *  > For YEP_BattleEngineCore action sequences. If you use different animations
 *    in your action sequences, use this notetag, setting 'a' to be the 
 *    animation ID. Same setup as above.
 *
 * -----------------------------------------------------------------------------
 *   
 */

//------------------------------------------------------------------------------
// Classes
//------------------------------------------------------------------------------

class AnimationVariance {
	constructor(rotation = [0, 0], positionX = [0, 0], positionY = [0, 0]) {
		this.rotation = rotation;
		this.positionX = positionX;
		this.positionY = positionY;
	}
};

class AnimationMove {
	constructor(rotation = [0, 0], positionX = [0, 0], positionY = [0, 0],
				frames = 0) {
		this.rotation = rotation;
		this.positionX = positionX;
		this.positionY = positionY;
		this.frames = frames;
	}
};

dingk.AV.AnimVariance = [];
dingk.AV.AnimMove = [];

//------------------------------------------------------------------------------
// DataManager
//------------------------------------------------------------------------------

dingk.AV.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!dingk.AV.DataManager_isDatabaseLoaded.call(this)) return false;
	if (!dingk.AV._loaded) {
		this.process_dingk_AV_notetags($dataItems);
		this.process_dingk_AV_notetags($dataSkills);
		dingk.AV._loaded = true;
	}
	return true;
};

DataManager.process_dingk_AV_notetags = function(group) {
	var note1a = /<ACTION ANIMATION VARIANCE>/i;
	var note1b = /<\/ACTION ANIMATION VARIANCE>/i;
	var note2a = /<ANIMATION (\d+) VARIANCE>/i;
	var note2b = /<\/ANIMATION (\d+) VARIANCE>/i;
	var note3a = /<ACTION ANIMATION MOVE>/i;
	var note3b = /<\/ACTION ANIMATION MOVE>/i;
	var note3c = /<ACTION ANIMATION MOVE: (\d+)>/i;
	var note4a = /<ANIMATION (\d+) MOVE>/i;
	var note4b = /<\/ANIMATION (\d+) MOVE>/i;
	var note4c = /<ANIMATION (\d+) MOVE: (\d+)>/i;
	
	for (var n = 1; n < group.length; n++) {
		var obj = group[n];
		var notedata = obj.note.split(/[\r\n]+/);
		var mode = '';
		var aniId = 0;
		
		obj.animationVariance = [];
		obj.animationMove = [];
		
		for (var i = 0; i < notedata.length; i++) {
			if (notedata[i].match(note1a)) {
				aniId = Math.max(0, obj.animationId);
				obj.animationVariance[aniId] = new AnimationVariance();
				mode = 'variance';
			} else if (notedata[i].match(note1b) || notedata[i].match(note2b) ||
					   notedata[i].match(note3b) || notedata[i].match(note4b)) {
				mode = '';
			} else if (notedata[i].match(note2a)) {
				aniId = Number(RegExp.$1);
				obj.animationVariance[aniId] = new AnimationVariance();
				mode = 'variance';
			} else if (notedata[i].match(note3a)) {
				aniId = Math.max(0, obj.animationId);
				obj.animationMove[aniId] = new AnimationMove();
				mode = 'move';
			} else if (notedata[i].match(note3c)) {
				aniId = Math.max(0, obj.animationId);
				obj.animationMove[aniId] = new AnimationMove();
				obj.animationMove[aniId].frames = Number(RegExp.$1);
				mode = 'move';
			} else if (notedata[i].match(note4a)) {
				aniId = Number(RegExp.$1);
				obj.animationMove[aniId] = new AnimationMove();
				mode = 'move';
			} else if (notedata[i].match(note4c)) {
				aniId = Number(RegExp.$1);
				obj.animationMove[aniId] = new AnimationMove();
				obj.animationMove[aniId].frames = Number(RegExp.$2);
				mode = 'move';
			} else if (mode === 'variance') {
				if (notedata[i].match(/ROTATION: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationVariance[aniId].rotation = 
						JSON.parse('[' + r1 + ',' + r2 + ']');
				} else if (notedata[i].match(/POSITION X: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationVariance[aniId].positionX = 
						JSON.parse('[' + r1 + ',' + r2 + ']');
				} else if (notedata[i].match(/POSITION Y: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationVariance[aniId].positionY = 
						JSON.parse('[' + r1 + ',' + r2 + ']');
				}
			} else if (mode === 'move') {
				if (notedata[i].match(/ROTATION: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationMove[aniId].rotation = 
						JSON.parse('[' + r1 + ',' + r2 + ']');
				} else if (notedata[i].match(/POSITION X: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationMove[aniId].positionX = 
						JSON.parse('[' + r1 + ',' + r2 + ']');
				} else if (notedata[i].match(/POSITION Y: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationMove[aniId].positionY = 
						JSON.parse('[' + r1 + ',' + r2 + ']');
				}
			}
		}
		
		console.log(obj.name, obj.animationVariance, obj.animationMove);
	}
};


//------------------------------------------------------------------------------
// BattleManager
//------------------------------------------------------------------------------

// YEP_BattleEngineCore
dingk.AV.BM_actionActionAnimation = BattleManager.actionActionAnimation;
BattleManager.actionActionAnimation = function(actionArgs) {
	var aniId = this._action.item().animationId;
	var aniVarArr = this._action.item().animationVariance;
	var aniMovArr = this._action.item().animationMove;
	var aniIdMax = Math.max(0, aniId);
	dingk.AV.AnimVariance[aniIdMax] = aniVarArr[aniIdMax];
	dingk.AV.AnimMove[aniIdMax] = aniMovArr[aniIdMax];
	dingk.AV.BM_actionActionAnimation.call(this, actionArgs);
};

//------------------------------------------------------------------------------
// Sprite_Base
//------------------------------------------------------------------------------

Sprite_Base.prototype.startAnimation = function(animation, mirror, delay, aniVar, aniMov) {
	var sprite = new Sprite_Animation();
	sprite.setup(this._effectTarget, animation, mirror, delay, aniVar, aniMov);
	this.parent.addChild(sprite);
	this._animationSprites.push(sprite);
};

//------------------------------------------------------------------------------
// Sprite_Animation
//------------------------------------------------------------------------------

Sprite_Animation.prototype.updateCellSprite = function(sprite, cell) {
    var pattern = cell[0];
    if (pattern >= 0) {
        var sx = pattern % 5 * 192;
        var sy = Math.floor(pattern % 100 / 5) * 192;
        var mirror = this._mirror;
        sprite.bitmap = pattern < 100 ? this._bitmap1 : this._bitmap2;
        sprite.setFrame(sx, sy, 192, 192);
		sprite.x = this.transformX(cell[1], cell[2]) + (this.randomPosX || 0) + (this.aniCurrPosX || 0);
		sprite.y = this.transformY(cell[1], cell[2]) + (this.randomPosY || 0) + (this.aniCurrPosY || 0);
        sprite.rotation = cell[4] * Math.PI / 180 + (this.randomRotation || 0) + (this.aniCurrRotation || 0);
        sprite.scale.x = cell[3] / 100;
        if(cell[5]){
            sprite.scale.x *= -1;
        }
        if(mirror){
            sprite.x *= -1;
            sprite.rotation *= -1;
            sprite.scale.x *= -1;
        }

        sprite.scale.y = cell[3] / 100;
        sprite.opacity = cell[6];
        sprite.blendMode = cell[7];
        sprite.visible = true;
		this.updateAniMove();
    } else {
        sprite.visible = false;
    }
};

Sprite_Animation.prototype.transformX = function(x, y) {
	var r = this.randomRotation || 0;
	var m = this.aniCurrRotation || 0;
	return x * Math.cos(r + m) - y * Math.sin(r + m);
};

Sprite_Animation.prototype.transformY = function(x, y) {
	var r = this.randomRotation || 0;
	var m = this.aniCurrRotation || 0;
	return y * Math.cos(r + m) + x * Math.sin(r + m);
};

Sprite_Animation.prototype.updateAniMove = function() {
	if (this.aniCurrFrame === this.aniFrames) return;
	var dr = (this.aniRotation[1] - this.aniRotation[0]) / this.aniFrames;
	var dx = (this.aniPosX[1] - this.aniPosX[0]) / this.aniFrames;
	var dy = (this.aniPosY[1] - this.aniPosY[0]) / this.aniFrames;
	
	this.aniCurrFrame++;
	this.aniCurrRotation += dr;
	this.aniCurrPosX += dx;
	this.aniCurrPosY += dy;
};

dingk.AV.SA_setup = Sprite_Animation.prototype.setup;
Sprite_Animation.prototype.setup = function(target, animation, mirror, delay, aniVar, aniMov) {
	dingk.AV.SA_setup.call(this, target, animation, mirror, delay);
	this.randomRotation = 0, this.randomPosX = 0, this.randomPosY = 0;
	this.aniRotation = [0, 0], this.aniPosX = [0, 0], this.aniPosY = [0, 0], this.aniFrames = 0;
	this.aniCurrRotation = 0, this.aniCurrPosX = 0, this.aniCurrPosY = 0, this.aniCurrFrame = 0;
	if (!aniVar) return;
	this.randomRotation = aniVar[0] * Math.PI / 180;
	this.randomPosX = aniVar[1];
	this.randomPosY = aniVar[2];
	if (!aniMov) return;
	this.aniRotation = [aniMov[0][0] * Math.PI / 180, aniMov[0][1] * Math.PI / 180];
	this.aniPosX = aniMov[1];
	this.aniPosY = aniMov[2];
	this.aniFrames = aniMov[3];
	this.aniCurrRotation = this.aniRotation[0];
	this.aniCurrPosX = this.aniPosX[0];
	this.aniCurrPosY = this.aniPosY[0];
};

//------------------------------------------------------------------------------
// Sprite_Battler
//------------------------------------------------------------------------------

Sprite_Battler.prototype.setupAnimation = function() {
    while (this._battler.isAnimationRequested()) {
        var data = this._battler.shiftAnimation();
        var animation = $dataAnimations[data.animationId];
        var mirror = data.mirror;
        var delay = animation.position === 3 ? 0 : data.delay;
		var aniVar = this.getRandomizedAnimation(dingk.AV.AnimVariance[data.animationId]);
		var aniMov = this.getAnimationMove(dingk.AV.AnimMove[data.animationId]);
        this.startAnimation(animation, mirror, delay, aniVar, aniMov);
        for (var i = 0; i < this._animationSprites.length; i++) {
            var sprite = this._animationSprites[i];
            sprite.visible = this._battler.isSpriteVisible();
        }
    }
};

Sprite_Battler.prototype.getRandomizedAnimation = function(aniVar) {
	if (!aniVar) return [0, 0, 0];
	var max = 0, min = 0, rotation = 0, posX = 0, posY = 0;
	if (aniVar.rotation) {
		max = Math.max(aniVar.rotation[0], aniVar.rotation[1]);
		min = Math.min(aniVar.rotation[0], aniVar.rotation[1]);
		rotation = Math.floor((max - min) * Math.random()) + min;
	}
	if (aniVar.positionX) {
		max = Math.max(aniVar.positionX[0], aniVar.positionX[1]);
		min = Math.min(aniVar.positionX[0], aniVar.positionX[1]);
		posX = Math.floor((max - min) * Math.random()) + min;
	}
	if (aniVar.positionY) {
		max = Math.max(aniVar.positionY[0], aniVar.positionY[1]);
		min = Math.min(aniVar.positionY[0], aniVar.positionY[1]);
		posY = Math.floor((max - min) * Math.random()) + min;
	}
	return [rotation, posX, posY];
};

Sprite_Battler.prototype.getAnimationMove = function(aniMov) {
	if (!aniMov) return [[0, 0], [0, 0], [0, 0], 0];
	var rotation = [0, 0], posX = [0, 0], posY = [0, 0], frames = 0;
	if (aniMov.rotation)
		rotation = aniMov.rotation;
	if (aniMov.positionX)
		posX = aniMov.positionX;
	if (aniMov.positionY)
		posY = aniMov.positionY;
	if (aniMov.frames)
		frames = aniMov.frames;
	return [rotation, posX, posY, frames];
};

//------------------------------------------------------------------------------
// Window_BattleLog
//------------------------------------------------------------------------------


dingk.AV.WBL_sAAA = Window_BattleLog.prototype.showActorAttackAnimation;
Window_BattleLog.prototype.showActorAttackAnimation = function(subject, targets) {
	var aniId1 = subject.attackAnimationId1();
	var aniId2 = subject.attackAnimationId2();
	dingk.AV.AnimVariance[aniId1] = dingk.AV.AnimVariance[0];
	dingk.AV.AnimMove[aniId1] = dingk.AV.AnimMove[0];
	dingk.AV.AnimVariance[aniId2] = dingk.AV.AnimVariance[0];
	dingk.AV.AnimMove[aniId2] = dingk.AV.AnimMove[0];
	dingk.AV.WBL_sAAA.call(this, subject, targets);
};

if (Imported.YEP_BattleEngineCore) {

dingk.AV.WBL_sAAAM = Window_BattleLog.prototype.showActorAtkAniMirror;
Window_BattleLog.prototype.showActorAtkAniMirror = function(subject, targets) {
	var aniId1 = subject.attackAnimationId1();
	var aniId2 = subject.attackAnimationId2();
	if (subject.isActor()) {
		dingk.AV.AnimVariance[aniId1] = dingk.AV.AnimVariance[0];
		dingk.AV.AnimMove[aniId1] = dingk.AV.AnimMove[0];
		dingk.AV.AnimVariance[aniId2] = dingk.AV.AnimVariance[0];
		dingk.AV.AnimMove[aniId2] = dingk.AV.AnimMove[0];
	} else {
		dingk.AV.AnimVariance[aniId1] = dingk.AV.AnimVariance[0];
		dingk.AV.AnimMove[aniId1] = dingk.AV.AnimMove[0];
	}
	dingk.AV.WBL_sAAAM.call(this, subject, targets);
};
	
dingk.AV.WBL_sEAA = Window_BattleLog.prototype.showEnemyAttackAnimation;
Window_BattleLog.prototype.showEnemyAttackAnimation = function(subject, targets) {
	var aniId = subject.attackAnimationId();
	dingk.AV.AnimVariance[aniId] = dingk.AV.AnimVariance[0];
	dingk.AV.AnimMove[aniId] = dingk.AV.AnimMove[0];
	dingk.AV.WBL_sEAA.call(this, subject, targets);
};
};

dingk.AV.WBL_showNormalAni = Window_BattleLog.prototype.showNormalAnimation;
Window_BattleLog.prototype.showNormalAnimation = 
	function(targets, animationId, mirror) {
	var animation = $dataAnimations[animationId];
	if (dingk.AV.AnimMove[animationId] && 
		!dingk.AV.AnimMove[animationId].frames) 
		dingk.AV.AnimMove[animationId].frames = animation.frames.length;
	dingk.AV.WBL_showNormalAni.call(this, targets, animationId, mirror);
};

if (!Imported.YEP_BattleEngineCore) {

dingk.AV.WBL_startAction = Window_BattleLog.prototype.startAction;
Window_BattleLog.prototype.startAction = function(subject, action, targets) {
	var item = action.item();
	var aniId = Math.max(0, item.animationId);
	dingk.AV.AnimVariance[aniId] = item.animationVariance[aniId];
	dingk.AV.AnimMove[aniId] = item.animationMove[aniId];
	
	dingk.AV.WBL_startAction.call(this, subject, action, targets);
};
	
};