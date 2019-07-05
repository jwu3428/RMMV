/*******************************************************************************
 * States Plus v0.1 by dingk
 * For use in RMMV 1.6.2
 ******************************************************************************/

var Imported = Imported || {};
Imported.dingk_StatesPlus = true;

var dingk = dingk || {};
dingk.StatesPlus = dingk.StatesPlus || {};

/*:
 * @plugindesc [0.1] Allows another state to be applied if the state you are applying 
 * already exists. IMPORTANT: PLACE ABOVE ALL PLUGINS FOR MAX COMPATIBILITY.
 * @author dingk
 *
 * @help
 * !!! IMPORTANT !!!
 * Place plugin at the very top of the plugin list. This will ensure maximum 
 * compatibility with other plugins that modify states.
 *
 * -----------------------------------------------------------------------------
 *   Introduction
 * -----------------------------------------------------------------------------
 * This plugin allows states to stack and adds a state overriding feature. 
 * When a state overrides another, the overridden state cannot be applied. For 
 * example, let's say state Burn 3 overrides Burn 1 and Burn 2. When someone 
 * has Burn 3, Burn 1 and Burn 2 cannot be applied. When someone has Burn 1, 
 * if Burn 2 or Burn 3 is applied, Burn 1 is overridden/removed with Burn 2 or 
 * Burn 3 added over it.
 * 
 * -----------------------------------------------------------------------------
 *   Notetags
 * -----------------------------------------------------------------------------
 * State Notetags:
 *
 * <Max Stacks: d>
 *  > The number of times you can stack this state. This plugin supports up to 
 *    99 stacks.
 *
 * <State Override: d[, d, d...]>
 * <State Override: d to d>
 *  > This state overrides the states defined by state id 'd'. 
 *
 * -----------------------------------------------------------------------------
 *   Compatibility
 * -----------------------------------------------------------------------------
 * Not compatible with anything that modifies state functionality. For best 
 * results, use with 'dingk_StatesPlusPatch.js'
 *
 * -----------------------------------------------------------------------------
 *   Terms of Use
 * -----------------------------------------------------------------------------
 *  > Free and commercial use and redistribution (under MIT License).
 */

dingk.StatesPlus.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function () {
	if(!dingk.StatesPlus.DataManager_isDatabaseLoaded.call(this)) return false;
	if(!dingk.StatesPlus._loaded) {
		this.process_dingk_StatesPlus_states();
		this.process_dingk_StatesPlus_notetags($dataItems);
		this.process_dingk_StatesPlus_notetags($dataSkills);
		dingk.StatesPlus._loaded = true;
	}
	return true;
};

DataManager.process_dingk_StatesPlus_states = function() {
	var group = $dataStates;
	var note1 = /<STATE OVERRIDE:[ ]*(\d+(\s*,\s*\d+)*)>/i;
	var note2 = /<STATE OVERRIDE:[ ](\d+)[ ]TO[ ](\d+)>/i;
	var note3 = /<MAX STACKS:[ ](\d+)>/i;
	var note4 = /<NEXT STATE TIER:[ ](\d+)>/i;
	
	for(var n = 1; n < group.length; n++) {
		var obj = group[n];
		var notedata = obj.note.split(/[\r\n]+/);
		
		obj.stateOverrides = [];
		obj.maxStacks = 1;
		
		for(var i = 0; i < notedata.length; i++) {
			var line = notedata[i];
			
			if(line.match(note1)) {
				var arr = JSON.parse('[' + RegExp.$1.match(/\d+/g) + ']');
				obj.stateOverrides = obj.stateOverrides.concat(arr);
			} else if(line.match(note2)) {
				var start = parseInt(RegExp.$1);
				var end = parseInt(RegExp.$2);
				for(var x = start; x <= end; x++)
					obj.stateOverrides.push(x);
			} else if(line.match(note3)) {
				obj.maxStacks = parseInt(RegExp.$1).clamp(1, 99);
			}
		}
	}
};

DataManager.process_dingk_StatesPlus_notetags = function(group) {
	for(var n = 1; n < group.length; n++) {
		var obj = group[n];
		var notedata = obj.note.split(/[\r\n]+/);
		
		obj.removeStacks = [];
		
		for(var i = 0; i < notedata.length; i++) {
			if(notedata[i].match(/<REMOVE ALL STACKS:[ ](\d+(\s*,\s*\d+)*)>/i)) {
				var stateIds = JSON.parse('[' + RegExp.$1 + ']');
				obj.removeStacks = obj.removeStacks.concat(stateIds);
			}
		}
	}
};

DataManager.getMaxStacks = function(stateId) {
	return $dataStates[stateId].maxStacks;
};

//------------------------------------------------------------------------------
// Game_Action
//------------------------------------------------------------------------------

dingk.StatesPlus.GA_applyIUEffect = Game_Action.prototype.applyItemUserEffect;
Game_Action.prototype.applyItemUserEffect = function(target) {
	dingk.StatesPlus.GA_applyIUEffect.call(this, target);
	var item = this.item();
	if (item && item.removeStacks) {
		for (var stateId of item.removeStacks) {
			target.removeAllStateStacks(stateId);
		}
	}
};

//------------------------------------------------------------------------------
// Game_BattlerBase
//------------------------------------------------------------------------------

dingk.StatesPlus.GBB_clearStates = Game_BattlerBase.prototype.clearStates;
Game_BattlerBase.prototype.clearStates = function() {
	dingk.StatesPlus.GBB_clearStates.call(this);
	this._stateStacks = Array($dataStates.length).fill(0);
};

Game_BattlerBase.prototype.uniqueStates = function() {
	var states = this.states();
	return states.filter(function(state) {
		var key = state.id;
		if (!this[key]) {
			this[key] = true;
			return true;
		}
	}, Object.create(null));
};

Game_BattlerBase.prototype.stateIcons = function() {
	return this.uniqueStates().map(function(state) {
		return state.iconIndex;
	}).filter(function(iconIndex) {
		return iconIndex > 0;
	});
};


//------------------------------------------------------------------------------
// Game_Battler
//------------------------------------------------------------------------------

Game_Battler.prototype.addState = function(stateId) {
	var stacks = this._stateStacks[stateId];
	if(!this.isStateOverridden(stateId)) {
		if (this.isStateAddable(stateId)) {
			this.stateOverride(stateId);
			if(stacks < DataManager.getMaxStacks(stateId)) {
				this.addNewState(stateId);
				this._stateStacks[stateId]++;
				this.refresh();
			}
			this.resetStateCounts(stateId);
			this._result.pushAddedState(stateId);
		}
	}
};

dingk.StatesPlus.GB_isStateAddable = Game_Battler.prototype.isStateAddable;
Game_Battler.prototype.isStateAddable = function(stateId) {
	return !this.isStateOverridden(stateId) && 
		dingk.StatesPlus.GB_isStateAddable.call(this, stateId);
};

dingk.StatesPlus.GB_removeState = Game_Battler.prototype.removeState;
Game_Battler.prototype.removeState = function(stateId) {
	if (this.isStateAffected(stateId))
		this._stateStacks[stateId]--;
	dingk.StatesPlus.GB_removeState.call(this, stateId);
};

Game_Battler.prototype.removeAllStateStacks = function(stateId) {
	var stacks = this._stateStacks[stateId];
	for (var i = 0; i < stacks; i++) {
		this.removeState(stateId);
	}
};

Game_Battler.prototype.removeStatesAuto = function(timing) {
	for(var state of this.states()) {
		if (this.isStateExpired(state.id) && state.autoRemovalTiming === timing) {
			this.removeAllStateStacks(state.id);
		}
	}
};

Game_Battler.prototype.stateOverride = function(stateId) {
	var states = this.states();
	var override = $dataStates[stateId];
	for(var state of states) {
		if(override.stateOverrides.contains(state.id))
			this.removeAllStateStacks(state.id);
	}
};

Game_Battler.prototype.isStateOverridden = function(stateId) {
	var states = this.states();
	for(var state of states) {
		if(state.stateOverrides.contains(stateId))
			return true;
	}
	return false;
};

//------------------------------------------------------------------------------
// Sprite_StateIcon
//------------------------------------------------------------------------------

dingk.StatesPlus.SSI_initMembers = Sprite_StateIcon.prototype.initMembers;
Sprite_StateIcon.prototype.initMembers = function() {
	dingk.StatesPlus.SSI_initMembers.call(this);
	this._stackCounterSprite = new Sprite();
	this.addChild(this._stackCounterSprite);
	this._stackCounterSprite.anchor.x = 0.5;
	this._stackCounterSprite.anchor.y = 0.5;
	var w = Window_Base._iconWidth + 2;
	var h = Window_Base._iconHeight + 4;
	this._stackCounterSprite.bitmap = new Bitmap(w, h);
};

dingk.StatesPlus.SSI_updateFrame = Sprite_StateIcon.prototype.updateFrame;
Sprite_StateIcon.prototype.updateFrame = function() {
	dingk.StatesPlus.SSI_updateFrame.call(this);
	if (this._stackCounterSprite) {
		this.updateStackCounter();
	}
};

Sprite_StateIcon.prototype.updateStackCounter = function () {
	this._stackCounterSprite.bitmap.clear();
	if (!this._battler) return;
	var group = this._battler.uniqueStates().filter(el => el.iconIndex > 0);
	var state = group[this._animationIndex];
	if (state) {
		this.drawStateStacks(state);
	}
};

Sprite_StateIcon.prototype.drawStateStacks = function(state) {
	if (!state) return;
	if (state.autoRemovalTiming <= 0) return;
	var stacks = this._battler._stateStacks[state.id];
	if (stacks <= 1) return;
	var w = Window_Base._iconWidth;
	var h = Window_Base.prototype.lineHeight.call(this);
	var bitmap = this._stackCounterSprite.bitmap;
	bitmap.fontSize = 16;
	bitmap.textColor = '#ffe0b2';
	bitmap.drawText('\u00d7' + stacks, 0, 10, w, h, 'right');
};

//------------------------------------------------------------------------------
// Window_Base
//------------------------------------------------------------------------------

dingk.StatesPlus.WB_drawActorIcons = Window_Base.prototype.drawActorIcons;
Window_Base.prototype.drawActorIcons = function(actor, wx, wy, ww) {
	ww = ww || 144;
	dingk.StatesPlus.WB_drawActorIcons.call(this, actor, wx, wy, ww);
	var iw = Window_Base._iconWidth;
	var maxIcons = Math.floor(ww / iw);
	var icons = actor.allIcons().slice(0, maxIcons);
	var states = actor.uniqueStates();
	for (var i = 0, max = 0; i < states.length && max < maxIcons; i++) {
		var state = states[i];
		if (state.iconIndex <= 0) continue;
		this.drawStateStacks(actor, state, wx, wy);
		wx += iw;
		max++;
	}
	this.resetFontSettings();
	this.resetTextColor();
};

Window_Base.prototype.drawStateStacks = function(actor, state, wx, wy) {
	var stacks = actor._stateStacks[state.id];
	if (!stacks || stacks <= 1) return;
	this.changePaintOpacity(true);
	this.contents.fontSize = 16;
	this.changeTextColor('#ffe0b2');
	this.drawText('\u00d7' + stacks, wx, wy + 10, Window_Base._iconWidth, 'right');
	this.resetFontSettings();
};