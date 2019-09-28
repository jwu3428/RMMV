/*******************************************************************************
 * Animation Variance v0.4 by dingk
 * Updated September 27, 2019
 * For use in RMMV 1.6.2
 ******************************************************************************/

var Imported = Imported || {};
Imported.dingk_AnimationVariance = true;

var dingk = dingk || {};
dingk.AV = dingk.AV || {};

/*:
 * @plugindesc [v0.4] Allow randomized variations and custom movement in animations.
 * @author dingk
 *
 * @param Animation Move Rate
 * @desc How smooth the animation moves. Independent of animation frame rate.
 * @type select
 * @option Default
 * @value 0
 * @option 60 FPS
 * @value 1
 * @option 30 FPS
 * @value 2
 * @option 20 FPS
 * @value 3
 * @option 15 FPS
 * @value 4
 * @default 0
 *
 * @param Global Animation Variance
 * @desc Apply animation variance globally if you rather not rely on notetags.
 * @type struct<AVTable>[]
 *
 * @help
 * -----------------------------------------------------------------------------
 *   Introduction
 * -----------------------------------------------------------------------------
 * Tired of looking at the same animation every time you attack? Or trying to
 * make a multi-hit skill but don't want to spend so much time fiddling with the
 * animations editor? This plugin allows you to make slight variations to your
 * animations, so it looks slightly different every time a skill is executed.
 * You can set the rotation and position to be different every time right in the
 * skills editor with notetags. In addition, you can also make animations move
 * with respect to the origin.
 *
 * If desired, you can apply variance globally within the plugin parameters.
 *
 * This plugin is in development, and things may change.
 *
 * -----------------------------------------------------------------------------
 *   Plugin Parameters
 * -----------------------------------------------------------------------------
 * Animation Move Rate
 *  > The frame rate at which the animation moves. Animations run at 15 FPS by
 *    default. The higher the FPS, the smoother the animation moves. This
 *    doesn't affect how fast an animation moves.
 *  > Default - Same as default animation frame rate. If you used another plugin
 *    to change animation frame rate, this option will sync up animation and
 *    movement frames.
 *  > The other options mean the animation will move independently of the
 *    animation frames. 60 FPS is the smoothest.
 *
 * Global Animation Variance
 *  > You can set animation variance globally. Any time the animation is used,
 *    they will follow the variance/move settings defined here.
 *  > Notetags and scripts will override anything you set here.
 *  > Read the Notetags section to fully understand the mechanics.
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
 *  > For skills that change or use multiple animations like in normal attacks 
 *    and Yanfly's action sequences. If you use different animations in your 
 *    action sequences, use this notetag, setting 'a' to be the animation ID. 
 *    Same setup as above.
 *
 * <Action Animation Move[: frames]>
 * rotation: a to b
 * position X: a to b
 * position Y: a to b
 * screen X: a to b
 * screen Y: a to b
 * </Action Animation Move>
 *  > Make the assigned skill animation move with respect to the target's
 *    position. You can optionally set 'frames' number of animation frames that the
 *    animation will move. Otherwise, it will move for the entire animation. 
 *    This value is tied to your Animation Move Rate. Say if your animation move
 *    rate is 60 FPS, but your animations are 15 FPS. If you want to move an 
 *    animation for 3 of its frames, you have to set frames to be 12.
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
 *  > For skills that change or use multiple animations like in normal attacks 
 *    and Yanfly's action sequences. If you use different animations in your 
 *    action sequences, use this notetag, setting b to be the animation ID. 
 *    Same setup as above.
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
 *    a to b"). Again, use 'n' to denote the current animation frame.
 *
 * -----------------------------------------------------------------------------
 *   Map Event Scripts
 * -----------------------------------------------------------------------------
 * Several scripts are available to customize animation variance for map event
 * animations. Place these before you execute 'Show Animation'.
 *
 * SetAnimationVariance(id, {
 *   rotation: [0, 0],
 *   positionX: [0, 0],
 *   positionY: [0, 0]
 * });
 *  > Sets the customized variance for an animation. Replace 'id' with the
 *    animation ID. Replace the zeros with another number. You don't need to 
 *    include every property if you aren't using it, but if you do, separate 
 *    each property with commas.
 * SetAnimationMove(id, {
 *   rotation: [0, 0],
 *   positionX: [0, 0],
 *   positionY: [0, 0],
 *   screenX: [0, 0],
 *   screenY: [0, 0],
 *   formulaR: 'n',
 *   formulaX: 'n',
 *   formulaY: 'n',
 *   formulaSX: 'n',
 *   formulaSY: 'n'
 * }, frames);
 *  > Sets the customized movement for an animation. Replace 'id' with the
 *    animation ID. Replace the zeros with another number or formula.
 *  > You can set a custom movement path using an arithmetic formula using 'n'
 *    as the variable. Each represent rotation, position X, Y, screen position
 *    X, and Y respectively. You must surround each formula with a pair of
 *    quotation marks or apostrophes or you will get an error.
 *  > [Optional] Replace frames with the desired number of frames to move the 
 *    animation.
 *
 * ResetAnimations();
 *  > Removes any customizations from the scripts above. Be aware that this is
 *    called after every battle.
 *
 * -----------------------------------------------------------------------------
 *   Compatibility
 * -----------------------------------------------------------------------------
 * Have yet to encounter compatibility issues.
 *
 * -----------------------------------------------------------------------------
 *   Terms of Use
 * -----------------------------------------------------------------------------
 *  > Free and commercial use and redistribution (under MIT License).
 *
 * -----------------------------------------------------------------------------
 *   Changelog
 * -----------------------------------------------------------------------------
 * v0.4 - Feature update
 *  - New feature: Map animation variance/movement
 *  - New feature: Global animation variance (see plugin parameters)
 *  - Fixed a bug that prevented multiple animation moves from working.
 *  - Fixed a bug that broke the 'Show Animation' command outside of battle.
 *  - Fixed an animation movement notetag bug that assigned screen Y values to
 *    position Y.
 *  - Fixed a bug that caused enemy attack animations with custom screen 
 *    movement to not appear.
 *  - Enemy attack animation variance is now mirrored.
 * v0.3 - Feature update
 *  - New feature: Animation move rate
 *  - Fixed a bug that failed to read negative values properly when using an
 *    advanced action animation move.
 *  - Errors for bad formulas will now display the formula in the console.
 * v0.2.1 - Bug fix
 *  - Fixed a bug that caused an animation executed by the enemy to come flying
 *    offscreen when using screen animation movement.
 * v0.2 - Feature update
 *  - New feature: Custom movement formulas
 *  - New animation movement properties: Screen X / Y
 *  - Fixed a bug that crashes the game when executing an action with no
 *    animation
 * v0.1 - Initial
 *  - Development test release
 */
/*~struct~AVTable:
 * @param Animation
 * @desc Select the animation that you want to modify.
 * @type animation
 * @default 0
 *
 * @param Variance
 * @desc Customize the variance for this animation.
 * @type struct<AV>
 * @default {"rotation":"{\"Start\":\"0\",\"End\":\"0\"}","positionX":"{\"Start\":\"0\",\"End\":\"0\"}","positionY":"{\"Start\":\"0\",\"End\":\"0\"}"}
 *
 * @param Movement
 * @desc Customize the movement for this animation.
 * @type struct<AM>
 * @default {"rotation":"{\"Start\":\"0\",\"End\":\"0\",\"Formula\":\"n\"}","positionX":"{\"Start\":\"0\",\"End\":\"0\",\"Formula\":\"n\"}","positionY":"{\"Start\":\"0\",\"End\":\"0\",\"Formula\":\"n\"}","screenX":"{\"Start\":\"0\",\"End\":\"0\",\"Formula\":\"n\"}","screenY":"{\"Start\":\"0\",\"End\":\"0\",\"Formula\":\"n\"}","frames":"0"}
 */
/*~struct~AV:
 * @param rotation
 * @text Rotation
 * @desc Randomize rotation.
 * @type struct<StartEndR>
 *
 * @param positionX
 * @text Position X
 * @desc Randomize horizontal position.
 * @type struct<StartEndP>
 *
 * @param positionY
 * @text Position Y
 * @desc Randomize vertical position.
 * @type struct<StartEndP>
 */
/*~struct~AM:
 * @param rotation
 * @text Rotation
 * @desc Rotate from start to end.
 * @type struct<StartEndF>
 *
 * @param positionX
 * @text Position X
 * @desc Move horizontally from start to end. 0 is the origin.
 * @type struct<StartEndF>
 *
 * @param positionY
 * @text Position Y
 * @desc Move horizontally from start to end. 0 is the origin.
 * @type struct<StartEndF>
 *
 * @param screenX
 * @text Screen X
 * @desc Move horizontally from start to end. 0 is the left edge of the screen.
 * @type struct<StartEndS>
 *
 * @param screenY
 * @text Screen Y
 * @desc Move vertically from start to end. 0 is the top edge of the screen.
 * @type struct<StartEndS>
 *
 * @param frames
 * @text Frames
 * @desc The duration of the movement. 0 is the animation default frames.
 * @type number
 */
/*~struct~StartEndR:
 * @param Start
 * @desc Starting point of the rotation in degrees.
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @param End
 * @desc End point of the rotation in degrees.
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 */
/*~struct~StartEndP:
 * @param Start
 * @desc Starting point of the position. 0 is the target's original position.
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @param End
 * @desc End point of the position. 0 is the target's original position.
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 */
/*~struct~StartEndF:
 * @param Start
 * @desc Starting point of the rotation/position.
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @param End
 * @desc End point of the rotation/position.
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @param Formula
 * @desc Enter a custom formula. Use 'n' to signify the current frame.
 * @default n
 */
/*~struct~StartEndS:
 * @param Start
 * @desc Starting point of the screen position.
 * @default 0
 *
 * @param End
 * @desc End point of the screen position.
 * @default 0
 *
 * @param Formula
 * @desc Enter a custom formula. Use 'n' to signify the current frame.
 * @default n
 *
 * @param screenOverride
 * @text Allow Screen Movement
 * @desc Set to 'true' to allow this animation to move anywhere on screen.
 * @type boolean
 * @default false
 */

dingk.AV.params = PluginManager.parameters('dingk_AnimationVariance');
dingk.AV.AnimMoveRate = Number(dingk.AV.params['Animation Move Rate']) || 0;
dingk.AV.AnimJson = dingk.AV.params['Global Animation Variance'];

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
		this.rotation = { data: rotation, formula: 'n' };
		this.positionX = { data: positionX, formula: 'n' };
		this.positionY = { data: positionY, formula: 'n' };
		this.screenX = { data: screenX, formula: 'n', override: false };
		this.screenY = { data: screenY, formula: 'n', override: false };
		this.frames = frames;
		this.formulaR = 'n';
		this.formulaX = 'n';
		this.formulaY = 'n';
		this.formulaSX = 'n';
		this.formulaSY = 'n';
		this.subject = null;
	}
};

dingk.AV._varianceCache = [];
dingk.AV._moveCache = [];
dingk.AV.AnimVariance = [];
dingk.AV.AnimMove = [];

//------------------------------------------------------------------------------
// DataManager
//------------------------------------------------------------------------------

dingk.AV.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!dingk.AV.DataManager_isDatabaseLoaded.call(this)) return false;
	if (!dingk.AV._loaded) {
		dingk.AV.setup();
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
			var line = notedata[i];
			if (line.match(note1a)) {
				aniId = Math.max(0, obj.animationId);
				obj.animationVariance[aniId] = new AnimationVariance();
				mode = 'variance';
			} else if (line.match(note1b) || line.match(note2b) ||
					   line.match(note3b) || line.match(note4b)) {
				mode = '';
			} else if (line.match(note2a)) {
				aniId = Number(RegExp.$1);
				obj.animationVariance[aniId] = new AnimationVariance();
				mode = 'variance';
			} else if (line.match(note3a)) {
				aniId = Math.max(0, obj.animationId);
				obj.animationMove[aniId] = new AnimationMove();
				mode = 'move';
			} else if (line.match(note3c)) {
				aniId = Math.max(0, obj.animationId);
				obj.animationMove[aniId] = new AnimationMove();
				obj.animationMove[aniId].frames = Number(RegExp.$1);
				mode = 'move';
			} else if (line.match(note4a)) {
				aniId = Number(RegExp.$1);
				obj.animationMove[aniId] = new AnimationMove();
				mode = 'move';
			} else if (line.match(note4c)) {
				aniId = Number(RegExp.$1);
				obj.animationMove[aniId] = new AnimationMove();
				obj.animationMove[aniId].frames = Number(RegExp.$2);
				mode = 'move';
			} else if (mode === 'variance') {
				if (line.match(/ROTATION: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationVariance[aniId].rotation = [r1, r2];
				} else if (line.match(/POSITION X: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationVariance[aniId].positionX = [r1, r2];
				} else if (line.match(/POSITION Y: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationVariance[aniId].positionY = [r1, r2];
				}
			} else if (mode === 'move') {
				if (line.match(/ROTATION: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationMove[aniId].rotation.data = [r1, r2];
				} else if (line.match(/POSITION X: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationMove[aniId].positionX.data = [r1, r2];
				} else if (line.match(/POSITION Y: (-?\d+) to (-?\d+)/i)) {
					var r1 = Number(RegExp.$1);
					var r2 = Number(RegExp.$2);
					obj.animationMove[aniId].positionY.data = [r1, r2];
				} else if (line.match(/SCREEN X: (.*) to (.*)/i)) {
					var r1 = RegExp.$1.trim();
					var r2 = RegExp.$2.trim();
					obj.animationMove[aniId].screenX.data = [r1, r2];
					obj.animationMove[aniId].screenX.override = true;
				} else if (line.match(/SCREEN Y: (.*) to (.*)/i)) {
					var r1 = RegExp.$1.trim();
					var r2 = RegExp.$2.trim();
					obj.animationMove[aniId].screenY.data = [r1, r2];
					obj.animationMove[aniId].screenY.override = true;
				} else if (line.match(/ROTATION: (.*) from (-?\d+) to (-?\d+)/i)) {
					var f = RegExp.$1.trim();
					var r1 = Number(RegExp.$2);
					var r2 = Number(RegExp.$3);
					obj.animationMove[aniId].rotation.data = [r1, r2];
					obj.animationMove[aniId].rotation.formula = f;
				} else if (line.match(/POSITION X: (.*) from (-?\d+) to (-?\d+)/i)) {
					var f = RegExp.$1.trim();
					var r1 = Number(RegExp.$2);
					var r2 = Number(RegExp.$3);
					obj.animationMove[aniId].positionX.data = [r1, r2];
					obj.animationMove[aniId].positionX.formula = f;
				} else if (line.match(/POSITION Y: (.*) from (-?\d+) to (-?\d+)/i)) {
					var f = RegExp.$1.trim();
					var r1 = Number(RegExp.$2);
					var r2 = Number(RegExp.$3);
					obj.animationMove[aniId].positionY.data = [r1, r2];
					obj.animationMove[aniId].positionY.formula = f;
				} else if (line.match(/SCREEN X: (.*) from (.*) to (.*)/i)) {
					var f = RegExp.$1.trim();
					var r1 = RegExp.$2.trim();
					var r2 = RegExp.$3.trim();
					obj.animationMove[aniId].screenX.data = [r1, r2];
					obj.animationMove[aniId].screenX.formula = f;
					obj.animationMove[aniId].screenX.override = true;
				} else if (line.match(/SCREEN Y: (.*) from (.*) to (.*)/i)) {
					var f = RegExp.$1.trim();
					var r1 = RegExp.$2.trim();
					var r2 = RegExp.$3.trim();
					obj.animationMove[aniId].screenY.data = [r1, r2];
					obj.animationMove[aniId].screenY.formula = f;
					obj.animationMove[aniId].screenY.override = true;
				} else if (line.match(/ROTATION: (.*)/i)) {
					var f = RegExp.$1.trim();
					obj.animationMove[aniId].rotation.formula = f;
				} else if (line.match(/POSITION X: (.*)/i)) {
					var f = RegExp.$1.trim();
					obj.animationMove[aniId].positionX.formula = f;
				} else if (line.match(/POSITION Y: (.*)/i)) {
					var f = RegExp.$1.trim();
					obj.animationMove[aniId].positionY.formula = f;
				} else if (line.match(/SCREEN X: (.*)/i)) {
					var f = RegExp.$1.trim();
					obj.animationMove[aniId].screenX.data = [0, 0];
					obj.animationMove[aniId].screenX.formula = f;
					obj.animationMove[aniId].screenX.override = true;
				} else if (line.match(/SCREEN Y: (.*)/i)) {
					var f = RegExp.$1.trim();
					obj.animationMove[aniId].screenY.data = [0, 0];
					obj.animationMove[aniId].screenY.formula = f;
					obj.animationMove[aniId].screenY.override = true;
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
	ResetAnimations();
	for (var i in aniVarArr) {
		dingk.AV.AnimVariance[i] = aniVarArr[i];
	}
	for (var i in aniMovArr) {
		dingk.AV.AnimMove[i] = aniMovArr[i];
	}
	dingk.AV.AnimVariance.map(a => a ? a.subject = this._subject.battler() : 0);
	dingk.AV.AnimMove.map(a => a ? a.subject = this._subject.battler() : 0);

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

dingk.AV.BM_updateBattleEnd = BattleManager.updateBattleEnd;
BattleManager.updateBattleEnd = function() {
	dingk.AV.BM_updateBattleEnd.call(this);
	ResetAnimations();
};

//------------------------------------------------------------------------------
// Sprite_Base
//------------------------------------------------------------------------------

Sprite_Base.prototype.startAnimation =
	function(animation, mirror, delay, aniVar, aniMov)
{
	var sprite = new Sprite_Animation();
	sprite.setup(this._effectTarget, animation, mirror, delay, aniVar, aniMov);
	this.parent.addChild(sprite);
	this._animationSprites.push(sprite);
};

Sprite_Base.prototype.getRandomizedAnimation = function(aniVar) {
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

Sprite_Base.prototype.getAnimationMove = function(aniMov) {
	if (!aniMov) return [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], 0,
						 'n', 'n', 'n', 'n', 'n', false, false];
	var rotation = aniMov.rotation.data || [0, 0];
	var posX = aniMov.positionX.data || [0, 0];
	var posY = aniMov.positionY.data || [0, 0];
	var scrX = aniMov.screenX.data || [0, 0];
	var scrY = aniMov.screenY.data || [0, 0];
	var frames = aniMov.frames || 0;
	var formulaR = aniMov.rotation.formula || 'n';
	var formulaX = aniMov.positionX.formula || 'n';
	var formulaY = aniMov.positionY.formula || 'n';
	var formulaSX = aniMov.screenX.formula || 'n';
	var formulaSY = aniMov.screenY.formula || 'n';
	var overrideSX = aniMov.screenX.override || false;
	var overrideSY = aniMov.screenY.override || false;
	return [rotation, posX, posY, scrX, scrY, frames,
		    formulaR, formulaX, formulaY, formulaSX, formulaSY,
			overrideSX, overrideSY];
};

//------------------------------------------------------------------------------
// Sprite_Animation
//------------------------------------------------------------------------------

Sprite_Animation.prototype.updateMain = function() {
    if (this.isPlaying() && this.isReady()) {
        if (this._delay > 0) {
            this._delay--;
        } else {
            this._duration--;
            this.updatePosition();
            dingk.AV.AnimMoveRate = dingk.AV.AnimMoveRate || this._rate;
			if (this._duration % this._rate === 0) {
				this.updateTiming();
			}
            if (this._duration % dingk.AV.AnimMoveRate === 0) {
                this.updateFrame();
            }
        }
    }
};

Sprite_Animation.prototype.updateFrame = function() {
	if (this._duration > 0) {
		var frameIndex = this.currentFrameIndex();
		this.updateAllCellSprites(this._animation.frames[frameIndex]);
		this.updateAniMove();
	}
};

Sprite_Animation.prototype.updateTiming = function() {
	if (this._duration > 0) {
		var frameIndex = this.currentFrameIndex();
		this._animation.timings.forEach(function(timing) {
			if (timing.frame === frameIndex) {
				this.processTimingData(timing);
			}
		}, this);
	}
};

Sprite_Animation.prototype.updateCellSprite = function(sprite, cell) {
    var pattern = cell[0];
    if (pattern >= 0) {
        var sx = pattern % 5 * 192;
        var sy = Math.floor(pattern % 100 / 5) * 192;
        var mirror = this._mirror;
        sprite.bitmap = pattern < 100 ? this._bitmap1 : this._bitmap2;
        sprite.setFrame(sx, sy, 192, 192);
		sprite.x = this.transformX(cell[1], cell[2]) + (this._variance.randomX || 0) +
			(this._variance.currentX || 0);
		sprite.y = this.transformY(cell[1], cell[2]) + (this._variance.randomY || 0) +
			(this._variance.currentY || 0);
		if (this._variance.overrideSX) {
			sprite.x = this._variance.currentSX + (this._variance.randomX || 0) +
				(this._variance.currentX || 0) - this._target.x;
		}
		if (this._variance.overrideSY) {
			sprite.y = this._variance.currentSY + (this._variance.randomY || 0) +
				(this._variance.currentY || 0) - this._target.y;
		}
        sprite.rotation = cell[4] * Math.PI / 180 +
			(this._variance.randomR || 0) + (this._variance.currentR || 0);
        sprite.scale.x = cell[3] / 100;
        if(cell[5]){
            sprite.scale.x *= -1;
        }
        if(mirror){
            sprite.rotation *= -1;
            sprite.scale.x *= -1;
        }
		
        sprite.scale.y = cell[3] / 100;
        sprite.opacity = cell[6];
        sprite.blendMode = cell[7];
        sprite.visible = true;
    } else {
        sprite.visible = false;
    }
};

Sprite_Animation.prototype.transformX = function(x, y) {
	var r = this._variance.randomR || 0;
	var m = this._variance.currentR || 0;
	return x * Math.cos(r + m) - y * Math.sin(r + m);
};

Sprite_Animation.prototype.transformY = function(x, y) {
	var r = this._variance.randomR || 0;
	var m = this._variance.currentR || 0;
	return y * Math.cos(r + m) + x * Math.sin(r + m);
};

Sprite_Animation.prototype.updateAniMove = function() {
	if (this._variance.currentFrame >= this._variance.frames) return;
	++this._variance.currentFrame;
	this._variance.currentR = this.calculateMove(this._variance.formulaR,
		this._variance.rotation[0], this._variance.rotation[1]);
	this._variance.currentX = this.calculateMove(this._variance.formulaX,
		this._variance.x[0], this._variance.x[1]);
	this._variance.currentY = this.calculateMove(this._variance.formulaY,
		this._variance.y[0], this._variance.y[1]);
	if (this._variance.sx) {
		this._variance.currentSX = this.calculateMove(this._variance.formulaSX,
			this._variance.sx[0], this._variance.sx[1]);
	}
	if (this._variance.sy) {
		this._variance.currentSY = this.calculateMove(this._variance.formulaSY,
			this._variance.sy[0], this._variance.sy[1]);
	}
};

Sprite_Animation.prototype.calculateMove = function(formula, start, end) {
	if (formula !== 'n' && start === 0 && end === 0)
		return this.calculateAdvancedMove(formula);
	var frameFormula = formula.replace('n', 'this._variance.frames');
	var x = this._variance.currentFrame;
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
	if (target.parent instanceof Sprite_Actor) this._target = target.parent;
	dingk.AV.AnimMoveRate = dingk.AV.AnimMoveRate || this._rate;
	this._variance = {};
	this._variance.randomR = 0, this._variance.randomX = 0;
	this._variance.randomY = 0;
	this._variance.rotation = [0, 0], this._variance.x = [0, 0];
	this._variance.y = [0, 0], this._variance.frames = 0;
	this._variance.sx = [0, 0], this._variance.sy = [0, 0];
	this._variance.currentR = 0, this._variance.currentX = 0;
	this._variance.currentY = 0, this._variance.currentFrame = 0;
	if ($gameParty.inBattle()) {
		if (dingk.AV.AnimVariance[animation.id]) {
			this._subject = dingk.AV.AnimVariance[animation.id].subject;
		} else if (dingk.AV.AnimMove[animation.id]) {
			this._subject = dingk.AV.AnimMove[animation.id].subject;
		}
	}
	if (!aniVar) return;
	this._variance.randomR = aniVar[0] * Math.PI / 180;
	this._variance.randomX = this.formulaEval(aniVar[1]);
	this._variance.randomY = this.formulaEval(aniVar[2]);
	if (!aniMov) return;
	this._variance.rotation = [aniMov[0][0] * Math.PI / 180,
		aniMov[0][1] * Math.PI / 180];
	this._variance.x = this.formulaEval(aniMov[1]);
	if (mirror) {
		this._variance.randomX *= -1;
		this._variance.x[0] *= -1;
		this._variance.x[1] *= -1;
	}
	this._variance.y = this.formulaEval(aniMov[2]);
	this._variance.sx = this.screenEval(aniMov[3]);
	this._variance.sy = this.screenEval(aniMov[4]);
	if (JSON.stringify(this._variance.sx) === JSON.stringify([-1, -1]))
		this._variance.sx = false;
	if (JSON.stringify(this._variance.sy) === JSON.stringify([-1, -1]))
		this._variance.sy = false;
	this._variance.frames = aniMov[5] || animation.frames.length * this._rate /
		dingk.AV.AnimMoveRate;
	this._variance.formulaR = aniMov[6];
	this._variance.formulaX = aniMov[7];
	this._variance.formulaY = aniMov[8];
	this._variance.formulaSX = aniMov[9];
	this._variance.formulaSY = aniMov[10];
	this._variance.overrideSX = aniMov[11];
	this._variance.overrideSY = aniMov[12];
	this._variance.currentR = this._variance.rotation[0];
	this._variance.currentX = this._variance.x[0];
	this._variance.currentY = this._variance.y[0];
	if (this._variance.sx) this._variance.currentSX = this._variance.sx[0];
	if (this._variance.sy) this._variance.currentSY = this._variance.sy[0];
};

Sprite_Animation.prototype.formulaEval = function(formula) {
	var n = this._variance.currentFrame;
	var v = JsonEx.makeDeepCopy($gameVariables._data);
	var result = 0;
	try {
		result = JsonEx.makeDeepCopy(eval(formula));
	} catch (e) {
		console.log('ERROR: Bad animation formula eval', formula);
		console.error(e);
		return 0;
	}

	return result;
};

Sprite_Animation.prototype.screenEval = function(formula) {
	var a = this._subject;
	var b = this._target;
	var v = JsonEx.makeDeepCopy($gameVariables._data);
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
		console.log('ERROR: Bad screen formula eval', formula);
		console.error(e);
		return false;
	}

	return result;
};

//------------------------------------------------------------------------------
// Sprite_Character
//------------------------------------------------------------------------------

Sprite_Character.prototype.setupAnimation = function() {
	if (this._character.animationId() > 0) {
		var id = this._character.animationId();
		var animation = $dataAnimations[id];
		var aniVar = this.getRandomizedAnimation(dingk.AV.AnimVariance[id]);
		var aniMov = this.getAnimationMove(dingk.AV.AnimMove[id]);
		this.startAnimation(animation, false, 0, aniVar, aniMov);
		this._character.startAnimation();
	}
};

//------------------------------------------------------------------------------
// Sprite_Battler
//------------------------------------------------------------------------------

Sprite_Battler.prototype.setupAnimation = function() {
    while (this._battler.isAnimationRequested()) {
        var data = this._battler.shiftAnimation();
		var id = data.animationId;
        var animation = $dataAnimations[id];
        var mirror = data.mirror;
        var delay = animation.position === 3 ? 0 : data.delay;
		var aniVar = this.getRandomizedAnimation(dingk.AV.AnimVariance[id]);
		var aniMov = this.getAnimationMove(dingk.AV.AnimMove[id]);
        this.startAnimation(animation, mirror, delay, aniVar, aniMov);
        for (var i = 0; i < this._animationSprites.length; i++) {
            var sprite = this._animationSprites[i];
            sprite.visible = this._battler.isSpriteVisible();
        }
    }
};

//------------------------------------------------------------------------------
// Window_BattleLog
//------------------------------------------------------------------------------

dingk.AV.WBL_showAAtkAnim = Window_BattleLog.prototype.showActorAttackAnimation;
Window_BattleLog.prototype.showActorAttackAnimation = function(subject, targets) {
	var id1 = subject.attackAnimationId1();
	var id2 = subject.attackAnimationId2();
	if (dingk.AV.AnimVariance[0]) {
		dingk.AV.AnimVariance[id1] = dingk.AV.AnimVariance[0];
		dingk.AV.AnimVariance[id1].subject = dingk.AV.AnimVariance[0].subject;
		dingk.AV.AnimVariance[id2] = dingk.AV.AnimVariance[0];
		dingk.AV.AnimVariance[id2].subject = dingk.AV.AnimVariance[0].subject;
	}
	if (dingk.AV.AnimMove[0]) {
		dingk.AV.AnimMove[id1] = dingk.AV.AnimMove[0];
		dingk.AV.AnimMove[id1].subject = dingk.AV.AnimMove[0].subject;
		dingk.AV.AnimMove[id2] = dingk.AV.AnimMove[0];
		dingk.AV.AnimMove[id2].subject = dingk.AV.AnimMove[0].subject;
	}
	dingk.AV.WBL_showAAtkAnim.call(this, subject, targets);
};


if (Imported.YEP_BattleEngineCore) {

dingk.AV.WBL_sAAAM = Window_BattleLog.prototype.showActorAtkAniMirror;
Window_BattleLog.prototype.showActorAtkAniMirror = function(subject, targets) {
	var id1 = subject.attackAnimationId1();
	var id2 = subject.attackAnimationId2();
	if (subject.isActor()) {
		if (dingk.AV.AnimVariance[0]) {
			dingk.AV.AnimVariance[id1] = dingk.AV.AnimVariance[0];
			dingk.AV.AnimVariance[id1].subject = dingk.AV.AnimVariance[0].subject;
			dingk.AV.AnimVariance[id2] = dingk.AV.AnimVariance[0];
			dingk.AV.AnimVariance[id2].subject = dingk.AV.AnimVariance[0].subject;
		}
		if (dingk.AV.AnimMove[0]) {
			dingk.AV.AnimMove[id1] = dingk.AV.AnimMove[0];
			dingk.AV.AnimMove[id1].subject = dingk.AV.AnimMove[0].subject;
			dingk.AV.AnimMove[id2] = dingk.AV.AnimMove[0];
			dingk.AV.AnimMove[id2].subject = dingk.AV.AnimMove[0].subject;
		}
	} else {
		if (dingk.AV.AnimVariance[0]) {
			dingk.AV.AnimVariance[id1] = dingk.AV.AnimVariance[0];
			dingk.AV.AnimVariance[id1].subject = dingk.AV.AnimVariance[0].subject;
		}
		if (dingk.AV.AnimMove[0]) {
			dingk.AV.AnimMove[id1] = dingk.AV.AnimMove[0];
			dingk.AV.AnimMove[id1].subject = dingk.AV.AnimMove[0].subject;
		}
	}
	dingk.AV.WBL_sAAAM.call(this, subject, targets);
};

dingk.AV.WBL_sEAA = Window_BattleLog.prototype.showEnemyAttackAnimation;
Window_BattleLog.prototype.showEnemyAttackAnimation = function(subject, targets) {
	var id = subject.attackAnimationId();
	if (dingk.AV.AnimVariance[0]) {
		dingk.AV.AnimVariance[id] = dingk.AV.AnimVariance[0];
		dingk.AV.AnimVariance[id].subject = dingk.AV.AnimVariance[0].subject;
	}
	if (dingk.AV.AnimMove[0]) {
		dingk.AV.AnimMove[id] = dingk.AV.AnimMove[0];
		dingk.AV.AnimMove[id].subject = dingk.AV.AnimMove[0].subject;
	}
	dingk.AV.WBL_sEAA.call(this, subject, targets);
};
};


if (!Imported.YEP_BattleEngineCore) {

dingk.AV.WBL_startAction = Window_BattleLog.prototype.startAction;
Window_BattleLog.prototype.startAction = function(subject, action, targets) {
	var item = action.item();
	var aniVar = item.animationVariance;
	var aniMov = item.animationMove;
	ResetAnimations();
	for (var i in aniVar) {
		dingk.AV.AnimVariance[i] = aniVar[i];
		if (subject.isActor()) {
			var actor = BattleManager._spriteset._actorSprites[subject.index()];
			dingk.AV.AnimVariance[i].subject = actor;
		} else {
			var enemy = BattleManager._spriteset._enemySprites[subject.index()];
			dingk.AV.AnimVariance[i].subject = enemy;
		}
	}
	for (var i in aniMov) {
		dingk.AV.AnimMove[i] = item.animationMove[i];
		if (subject.isActor()) {
			var actor = BattleManager._spriteset._actorSprites[subject.index()];
			dingk.AV.AnimMove[i].subject = actor;
		} else {
			var enemy = BattleManager._spriteset._enemySprites[subject.index()];
			dingk.AV.AnimMove[i].subject = enemy;
		}
	}
	dingk.AV.WBL_startAction.call(this, subject, action, targets);
};

};

//------------------------------------------------------------------------------
// Scripts
//------------------------------------------------------------------------------

dingk.AV.setup = function() {
	if (!dingk.AV.AnimJson) return;
	for (var varJson of JSON.parse(dingk.AV.AnimJson)) {
		var glob = JSON.parse(varJson);
		var id = Number(JSON.parse(glob['Animation']));
		if (!id) continue;
		var variance = JSON.parse(glob['Variance']);
		var movement = JSON.parse(glob['Movement']);
		dingk.AV.AnimVariance[id] = new AnimationVariance();
		for (var k in variance) {
			var obj = JSON.parse(variance[k]);
			dingk.AV.AnimVariance[id][k] =
				[Number(obj['Start']), Number(obj['End'])];
		}
		dingk.AV.AnimMove[id] = new AnimationMove();
		for (var k in movement) {
			var obj = JSON.parse(movement[k]);
			if (k !== 'Frames') {
				dingk.AV.AnimMove[id][k].data =
					[Number(obj['Start']), Number(obj['End'])];
				dingk.AV.AnimMove[id][k].formula = obj['Formula'];
				if (k === 'screenX' || k === 'screenY') {
					dingk.AV.AnimMove[id][k].override =
						obj.screenOverride === 'true';
				}
			} else {
				dingk.AV.AnimMove[id].frames = Number(obj.frames);
			}
		}
	}

	dingk.AV._varianceCache = JsonEx.makeDeepCopy(dingk.AV.AnimVariance);
	dingk.AV._moveCache = JsonEx.makeDeepCopy(dingk.AV.AnimMove);
};

function SetAnimationVariance(id, obj) {
	if (!id || !obj) return;
	var rotation = obj.rotation || [0, 0];
	var posX = obj.positionX || [0, 0];
	var posY = obj.positionY || [0, 0];

	if (!dingk.AV.AnimVariance) dingk.AV.AnimVariance = [];
	dingk.AV.AnimVariance[id] = new AnimationVariance(rotation, posX, posY);
};

function SetAnimationMove(id, obj, frames) {
	if (!id || !obj) return;
	var rotation = obj.rotation || [0, 0];
	var posX = obj.positionX || [0, 0];
	var posY = obj.positionY || [0, 0];
	var scrX = obj.screenX || [0, 0];
	var scrY = obj.screenY || [0, 0];
	var formulaR = obj.formulaR || 'n';
	var formulaX = obj.formulaX || 'n';
	var formulaY = obj.formulaY || 'n';
	var formulaSX = obj.formulaSX || 'n';
	var formulaSY = obj.formulaSY || 'n';
	frames = Number(frames) || 0;

	if (!dingk.AV.AnimMove) dingk.AV.AnimMove = [];
	dingk.AV.AnimMove[id] =
		new AnimationMove(rotation, posX, posY, scrX, scrY, frames);

	dingk.AV.AnimMove[id].rotation.formula = formulaR;
	dingk.AV.AnimMove[id].positionX.formula = formulaX;
	dingk.AV.AnimMove[id].positionY.formula = formulaY;
	dingk.AV.AnimMove[id].screenX.formula = formulaSX;
	dingk.AV.AnimMove[id].screenY.formula = formulaSY;
	if (obj.screenX) dingk.AV.AnimMove[id].screenX.override = true;
	if (obj.screenY) dingk.AV.AnimMove[id].screenY.override = true;
};

function ResetAnimations() {
	dingk.AV.AnimVariance = JsonEx.makeDeepCopy(dingk.AV._varianceCache);
	dingk.AV.AnimMove = JsonEx.makeDeepCopy(dingk.AV._moveCache);
};
