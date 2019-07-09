/*******************************************************************************
 * Animation Variance v0.2 by dingk
 * For use in RMMV 1.6.2
 ******************************************************************************/

var Imported = Imported || {};
Imported.dingk_AnimationVariance = true;

var dingk = dingk || {};
dingk.AV = dingk.AV || {};

/*:
 * @plugindesc [v0.2] Allow slight variations in battle animations.
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
 *  > Make the assigned skill animation vary with rotation and position with 
 *    respect to the target's position. Each property is optional.
 *  > ROTATION - randomize the rotation from 'a' to 'b' in degrees.
 *  > POSITION X - randomize the horizontal position from 'a' to 'b' in pixels
 *  > POSITION Y - randomize the vertical position from 'a' to 'b' in pixels
 *
 * <Animation a Variance>
 * ...
 * </Animation a Variance>
 *  > For YEP_BattleEngineCore action sequences. If you use different animations
 *    in your action sequences, use this notetag, setting 'a' to be the 
 *    animation ID. Same setup as above.
 *
 * <Action Animation Move[: a]>
 * rotation: a to b
 * position X: a to b
 * position Y: a to b
 * screen X: a to b
 * screen Y: a to b
 * </Action Animation Move>
 *  > Make the assigned skill animation move with respect to the target's 
 *    position. You can optionally set 'a' number of animation frames that the 
 *    animation will move. Otherwise, it will move for the entire animation.
 *  > ROTATION - Rotate from 'a' to 'b' in degrees.
 *  > POSITION X / POSITION Y - Move from point 'a' to 'b' in pixels, relative 
 *    to the target's position.
 *  > SCREEN X / SCREEN Y - Move from point 'a' to 'b' in pixels anywhere on 
 *    the screen.
 *     - Accepts Javascript code. Available variables are 'a' which is the user, 
 *       and 'b' which is the target. For example you can grab their positions, 
 *       using variables 'a.x', 'a.y', etc.
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
 *   Advanced Notetags
 * -----------------------------------------------------------------------------
 * In the above notetags, you can define custom formulas for the movement path 
 * of the animation. The format is:
 *
 * <Action Animation Move>
 * property: formula from a to b
 * </Action Animation Move>
 *  > The animation will move using the formula, moving from 'a' to 'b'. 
 *    Use the variable 'n' to denote the current animation frame.
 *
 *   Example:
 *     <Action Animation Move>
 *     position X: Math.pow(n, 3) from 0 to 100
 *     </Action Animation Move>
 *       > The animation will move from slow to fast with this exponential 
 *         function.
 *       > NOTE: Do not use complex functions that have bounds like sine or 
 *         logarithmic functions. For this, refer to the following.
 *
 * <Action Animation Move>
 * position X: advancedFormula
 * </Action Animation Move>
 *  > If you don't want to be constrained to some bound or want to use functions
 *    like sine, use this notetag (which is just the above notetag without "from
 *    a to b." Again, use 'n' to denote the current animation frame.
 *
 * -----------------------------------------------------------------------------
 *   Compatibility
 * -----------------------------------------------------------------------------
 * Did not test for compatibility, use at your own risk.
 * Compatible with YEP_BattleEngineCore.
 *
 * -----------------------------------------------------------------------------
 *   Terms of Use
 * -----------------------------------------------------------------------------
 *  > Free and commercial use and redistribution (under MIT License).
 *
 * -----------------------------------------------------------------------------
 *   Changelog
 * -----------------------------------------------------------------------------
 * v0.2
 *  - New feature: Custom movement formulas
 *  - New animation movement properties: Screen X / Y
 *  - Fixed a bug that crashes the game when executing an action with no 
 *    animation
 * v0.1
 *  - Development test release
 */

//------------------------------------------------------------------------------
// Classes
//------------------------------------------------------------------------------

class AnimationVariance {
	constructor(rotation = [0, 0], positionX = [0, 0], positionY = [0, 0]) {
		this.rotation = rotation;
		this.positionX = positionX;
		this.positionY = positionY;
		this.subject = null;
	}
};

class AnimationMove {
	constructor(rotation = [0, 0], positionX = [0, 0], positionY = [0, 0],
				screenX = [-1, -1], screenY = [-1, -1], frames = 0) {
		this.rotation = rotation;
		this.positionX = positionX;
		this.positionY = positionY;
		this.screenX = screenX;
		this.screenY = screenY;
		this.screenOverrideX = false;
		this.screenOverrideY = false;
		this.frames = frames;
		this.RFormula = 'n';
		this.XFormula = 'n';
		this.YFormula = 'n';
		this.SXFormula = 'n';
		this.SYFormula = 'n';
		this.subject = null;
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
		dingk.AV.AnimVariance = [...Array($dataAnimations.length).fill(new AnimationVariance())];;
		dingk.AV.AnimMove = [...Array($dataAnimations.length).fill(new AnimationMove())];;
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
		
		obj.animationVariance = [...Array($dataAnimations.length).fill(new AnimationVariance())];
		obj.animationMove = [...Array($dataAnimations.length).fill(new AnimationMove())];
		
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
					obj.animationVariance[aniId].rotation = [r1, r2];
				} else if (notedata[i].match(/POSITION X: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationVariance[aniId].positionX = [r1, r2];
				} else if (notedata[i].match(/POSITION Y: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationVariance[aniId].positionY = [r1, r2];
				}
			} else if (mode === 'move') {
				if (notedata[i].match(/ROTATION: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationMove[aniId].rotation = [r1, r2];
				} else if (notedata[i].match(/POSITION X: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationMove[aniId].positionX = [r1, r2];
				} else if (notedata[i].match(/POSITION Y: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationMove[aniId].positionY = [r1, r2];
				} else if (notedata[i].match(/SCREEN X: (.*) to (.*)/i)) {
					var r1 = RegExp.$1.trim();
					var r2 = RegExp.$2.trim();
					obj.animationMove[aniId].screenX = [r1, r2];
					obj.animationMove[aniId].screenOverrideX = true;
				} else if (notedata[i].match(/SCREEN Y: (.*) to (.*)/i)) {
					var r1 = RegExp.$1.trim();
					var r2 = RegExp.$2.trim();
					obj.animationMove[aniId].screenY = [r1, r2];
					obj.animationMove[aniId].screenOverrideY = true;
				} else if (notedata[i].match(/ROTATION: (.*) from (\d+) to (\d+)/i)) {
					var f = RegExp.$1.trim();
					var r1 = Number(RegExp.$2);
					var r2 = Number(RegExp.$3);
					obj.animationMove[aniId].rotation = [r1, r2];
					obj.animationMove[aniId].RFormula = f;
				} else if (notedata[i].match(/POSITION X: (.*) from (\d+) to (\d+)/i)) {
					var f = RegExp.$1.trim();
					var r1 = Number(RegExp.$2);
					var r2 = Number(RegExp.$3);
					obj.animationMove[aniId].positionX = [r1, r2];
					obj.animationMove[aniId].XFormula = f;
				} else if (notedata[i].match(/POSITION Y: (.*) from (\d+) to (\d+)/i)) {
					var f = RegExp.$1.trim();
					var r1 = Number(RegExp.$2);
					var r2 = Number(RegExp.$3);
					obj.animationMove[aniId].positionY = [r1, r2];
					obj.animationMove[aniId].YFormula = f;
				} else if (notedata[i].match(/SCREEN X: (.*) from (.*) to (.*)/i)) {
					var f = RegExp.$1.trim();
					var r1 = RegExp.$2.trim();
					var r2 = RegExp.$3.trim();
					obj.animationMove[aniId].screenX = [r1, r2];
					obj.animationMove[aniId].SXFormula = f;
					obj.animationMove[aniId].screenOverrideX = true;
				} else if (notedata[i].match(/SCREEN Y: (.*) from (.*) to (.*)/i)) {
					var f = RegExp.$1.trim();
					var r1 = RegExp.$2.trim();
					var r2 = RegExp.$3.trim();
					obj.animationMove[aniId].positionY = [r1, r2];
					obj.animationMove[aniId].SYFormula = f;
					obj.animationMove[aniId].screenOverrideY = true;
				} else if (notedata[i].match(/ROTATION: (.*)/i)) {
					var f = RegExp.$1.trim();
					obj.animationMove[aniId].RFormula = f;
				} else if (notedata[i].match(/POSITION X: (.*)/i)) {
					var f = RegExp.$1.trim();
					obj.animationMove[aniId].XFormula = f;
				} else if (notedata[i].match(/POSITION Y: (.*)/i)) {
					var f = RegExp.$1.trim();
					obj.animationMove[aniId].YFormula = f;
				} else if (notedata[i].match(/SCREEN X: (.*)/i)) {
					var f = RegExp.$1.trim();
					obj.animationMove[aniId].screenX = [0, 0];
					obj.animationMove[aniId].SXFormula = f;
					obj.animationMove[aniId].screenOverrideX = true;
				} else if (notedata[i].match(/SCREEN Y: (.*)/i)) {
					var f = RegExp.$1.trim();
					obj.animationMove[aniId].screenY = [0, 0];
					obj.animationMove[aniId].SYFormula = f;
					obj.animationMove[aniId].screenOverrideY = true;
				}
			}
		}
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
	dingk.AV.AnimVariance[aniIdMax].subject =
		this._subject.battler();
	dingk.AV.BM_actionActionAnimation.call(this, actionArgs);
};

BattleManager.getSubjectPosition = function() {
	if (this._subject.isActor()) {
		var actorSprite = 
			this._spriteset._actorSprites[this._subject._actorId - 1];
		return [actorSprite.x, actorSprite.y];
	} else {
		return [this._subject._screenX, this._subject._screenY];
	}
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
		if (this.aniScrX && this.aniScrY) {
			sprite.x = this.aniCurrScrX + (this.randomPosX || 0) + 
					   (this.aniCurrPosX || 0) - this.aniScrX[1];
			sprite.y = this.aniCurrScrY + (this.randomPosY || 0) + 
					   (this.aniCurrPosY || 0) - this.aniScrY[1];
		} else if (this.aniScrX) {
			sprite.x = this.aniCurrScrX + (this.randomPosX || 0) + 
					   (this.aniCurrPosX || 0);
		} else if (this.aniScrY) {
			sprite.y = this.aniCurrScrY + (this.randomPosY || 0) + 
					   (this.aniCurrPosY || 0);
		}
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
	++this.aniCurrFrame;
	this.aniCurrRotation = this.calculateMove(this.aniRFormula, this.aniRotation[0], this.aniRotation[1]);
	this.aniCurrPosX = this.calculateMove(this.aniXFormula, this.aniPosX[0], this.aniPosX[1]);
	this.aniCurrPosY = this.calculateMove(this.aniYFormula, this.aniPosY[0], this.aniPosY[1]);
	if (this.aniScrX)
		this.aniCurrScrX = this.calculateMove(this.aniSXFormula, this.aniScrX[0], this.aniScrX[1]);
	if (this.aniScrY)
		this.aniCurrScrY = this.calculateMove(this.aniSYFormula, this.aniScrY[0], this.aniScrY[1]);
};

Sprite_Animation.prototype.calculateMove = function(formula, start, end) {
	if (formula !== 'n' && start === 0 && end === 0)
		return this.calculateAdvancedMove(formula);
	var frameFormula = formula.replace('n', 'this.aniFrames');
	var x = this.aniCurrFrame;
	if (formula[0] === '-') {
		formula = formula.substring(1);
	}
	var result = this.formulaEval(formula) * (end - start) / 
				 this.formulaEval(frameFormula) + start;
	return result;
};

Sprite_Animation.prototype.calculateAdvancedMove = function(formula) {
	var result = this.formulaEval(formula);
	return result;
};

dingk.AV.SA_setup = Sprite_Animation.prototype.setup;
Sprite_Animation.prototype.setup = function(target, animation, mirror, delay, aniVar, aniMov) {
	dingk.AV.SA_setup.call(this, target, animation, mirror, delay);
	this.randomRotation = 0, this.randomPosX = 0, this.randomPosY = 0;
	this.aniRotation = [0, 0], this.aniPosX = [0, 0], this.aniPosY = [0, 0], this.aniFrames = 0;
	this.aniCurrRotation = 0, this.aniCurrPosX = 0, this.aniCurrPosY = 0, this.aniCurrFrame = 0;
	this._subject = dingk.AV.AnimVariance[animation.id].subject;
	if (!aniVar) return;
	this.randomRotation = aniVar[0] * Math.PI / 180;
	this.randomPosX = this.formulaEval(aniVar[1]);
	this.randomPosY = this.formulaEval(aniVar[2]);
	if (!aniMov) return;
	this.aniRotation = [aniMov[0][0] * Math.PI / 180, aniMov[0][1] * Math.PI / 180];
	this.aniPosX = this.formulaEval(aniMov[1]);
	this.aniPosY = this.formulaEval(aniMov[2]);
	this.aniScrX = this.screenEval(aniMov[3]);
	this.aniScrY = this.screenEval(aniMov[4]);
	if (JSON.stringify(this.aniScrX) === JSON.stringify([-1, -1]))
		this.aniScrX = false;
	if (JSON.stringify(this.aniScrY) === JSON.stringify([-1, -1]))
		this.aniScrY = false;
	this.aniFrames = aniMov[5];
	this.aniRFormula = aniMov[6];
	this.aniXFormula = aniMov[7];
	this.aniYFormula = aniMov[8];
	this.aniSXFormula = aniMov[9];
	this.aniSYFormula = aniMov[10];
	this.aniCurrRotation = this.aniRotation[0];
	this.aniCurrPosX = this.aniPosX[0];
	this.aniCurrPosY = this.aniPosY[0];
	if (this.aniScrX) this.aniCurrScrX = this.aniScrX[0];
	if (this.aniScrY) this.aniCurrScrY = this.aniScrY[0];
};

Sprite_Animation.prototype.formulaEval = function(formula) {
	var n = this.aniCurrFrame;
	var result = 0;
	try {
		result = eval(formula);
	} catch (e) {
		console.log('ERROR: Bad animation formula eval');
		console.error(e);
		return 0;
	}
	
	return result;
};

Sprite_Animation.prototype.screenEval = function(formula) {
	var a = this._subject;
	var b = this._target;
	var ax = -1, ay = -1;
	if (a) {
		var ax = this._subject.x;
		var ay = this._subject.y + - this._subject.height / 2 + this._target.height / 2;
	}
	var bx = b.x;
	var by = b.y;
	var result = false;
	try {
		result = [eval(formula[0]), eval(formula[1])];
	} catch (e) {
		console.log('ERROR: Bad screen formula eval');
		console.error(e);
		return false;
	}
	
	return result;
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
	if (!aniMov) return [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], 0, 
						 'n', 'n', 'n', 'n', 'n'];
	var rotation = [0, 0], posX = [0, 0], posY = [0, 0], frames = 0;
	var scrX = [-1, -1], scrY = [-1, -1];
	var rFormula = 'n', xFormula = 'n', yFormula = 'n';
	var sxFormula = 'n', syFormula = 'n';
	if (aniMov.rotation)
		rotation = aniMov.rotation;
	if (aniMov.positionX)
		posX = aniMov.positionX;
	if (aniMov.positionY)
		posY = aniMov.positionY;
	if (aniMov.screenX && aniMov.screenOverrideX)
		scrX = aniMov.screenX;
	if (aniMov.screenY && aniMov.screenOverrideY)
		scrY = aniMov.screenY;
	if (aniMov.frames)
		frames = aniMov.frames;
	if (aniMov.RFormula)
		rFormula = aniMov.RFormula;
	if (aniMov.XFormula)
		xFormula = aniMov.XFormula;
	if (aniMov.YFormula)
		yFormula = aniMov.YFormula;
	if (aniMov.sxFormula)
		sxFormula = aniMov.SXFormula;
	if (aniMov.syFormula)
		syFormula = aniMov.SYFormula;
	return [rotation, posX, posY, scrX, scrY, frames, 
		    rFormula, xFormula, yFormula, sxFormula, syFormula];
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
	if (animation && dingk.AV.AnimMove[animationId] && 
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
	if (subject.isActor()) {
		dingk.AV.AnimVariance[aniId].subject = 
			BattleManager._spriteset._actorSprites[subject.index()];
	} else {
		dingk.AV.AnimVariance[aniId].subject = 
			BattleManager._spriteset._enemySprites[subject.index()];
	}
	
	dingk.AV.WBL_startAction.call(this, subject, action, targets);
};
	
};