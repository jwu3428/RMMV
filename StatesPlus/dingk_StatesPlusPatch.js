/*******************************************************************************
 * States Plus Compatibility Patches v0.1 by dingk
 * For use in RMMV 1.6.2
 ******************************************************************************/

var Imported = Imported || {};
Imported.dingk_StatesPlusPatch = true;

/*:
 * @plugindesc [0.1] Adds compatibility with other plugins. PLACE AT BOTTOM.
 * @author dingk
 */

if (Imported.dingk_StatesPlus) {

//------------------------------------------------------------------------------
// YEP_AutoPassiveStates
//------------------------------------------------------------------------------

Game_BattlerBase.prototype.checkMaxStacks = function(stateIds) {
	var newArr = [];
	var stacks = JsonEx.makeDeepCopy(this._stateStacks);
	for (var id of stateIds) {
		if(stacks[id] < $dataStates[id].maxStacks) {
			newArr.push(id);
			stacks[id]++;
		}
	}
	
	return newArr;
};

Game_BattlerBase.prototype.passiveStates = function() {
	var array = [];
	var raw = this.passiveStatesRaw();
	for (var i = 0; i < raw.length; ++i) {
		var state = $dataStates[raw[i]];
		array.push(state);
	}
	return array;
};

Game_Actor.prototype.passiveStatesRaw = function() {
	if (this._passiveStatesRaw !== undefined) return this._passiveStatesRaw;
	var array = Game_BattlerBase.prototype.passiveStatesRaw.call(this);
	array = array.concat(this.getPassiveStateData(this.actor()));
	array = array.concat(this.getPassiveStateData(this.currentClass()));
	for (var i = 0; i < this.equips().length; ++i) {
		var equip = this.equips()[i];
		array = array.concat(this.getPassiveStateData(equip));
	}
	for (var i = 0; i < this._skills.length; ++i) {
		var skill = $dataSkills[this._skills[i]];
		array = array.concat(this.getPassiveStateData(skill));
	}
	this._passiveStatesRaw = this.checkMaxStacks(array);
	return this._passiveStatesRaw;
};

Game_Enemy.prototype.passiveStatesRaw = function() {
	if (this._passiveStatesRaw !== undefined) return this._passiveStatesRaw;
	var array = Game_BattlerBase.prototype.passiveStatesRaw.call(this);
	array = array.concat(this.getPassiveStateData(this.enemy()));
	for (var i = 0; i < this.skills().length; ++i) {
		var skill = this.skills()[i];
		array = array.concat(this.getPassiveStateData(skill));
	}
	this._passiveStatesRaw = this.checkMaxStacks(array);
	return this._passiveStatesRaw;
};

//------------------------------------------------------------------------------
// YEP_BattleEngineCore
//------------------------------------------------------------------------------

if(Imported.YEP_BattleEngineCore) {

Game_BattlerBase.prototype.updateStateTurnTiming = function(timing) {
	if (this.isBypassUpdateTurns()) return;
	var statesRemoved = [];
	this._freeStateTurn = this._freeStateTurn || [];
	for (var i = 0; i < this.uniqueStates().length; ++i) {
		var stateId = this.uniqueStates()[i].id;
		var state = $dataStates[stateId];
		if (!state) continue;
		if (state.autoRemovalTiming !== timing) continue;
		if (!this._stateTurns[stateId]) continue;
		if (this._freeStateTurn.contains(stateId)) {
		var index = this._freeStateTurn.indexOf(stateId);
		this._freeStateTurn.splice(index, 1);
		} else {
			this._stateTurns[stateId] -= 1;
		}
		if (this._stateTurns[stateId] <= 0) statesRemoved.push(stateId);
	}
	for (var i = 0; i < statesRemoved.length; ++i) {
		var stateId = statesRemoved[i];
		this.removeAllStateStacks(stateId);
	}
};

};

//------------------------------------------------------------------------------
// YEP_BuffsStatesCore
//------------------------------------------------------------------------------

if (Imported.YEP_BuffsStatesCore) {

Game_BattlerBase.prototype.statesAndBuffs = function() {
	var states = this.uniqueStates();
	var array = [];
	for (var i = 0; i < states.length; ++i) {
		var state = states[i];
		if (state && state.iconIndex > 0) array.push(state);
	}
	for (var i = 0; i < 8; ++i) {
		if (this._buffs[i]) array.push(i);
	}
	return array;
};

Window_Base.prototype.drawActorIconsTurns = function(actor, wx, wy, ww) {
	var iw = Window_Base._iconWidth;
	var icons = actor.allIcons().slice(0, Math.floor(ww / iw));
	var max = icons.length;
	var shownMax = Math.floor(ww / iw);
	for (var i = 0; i < actor.uniqueStates().length; ++i) {
		if (shownMax <= 0) break;
		var state = actor.uniqueStates()[i];
		if (state.iconIndex <= 0) continue;
		if (state.autoRemovalTiming > 0) {
			this.drawStateTurns(actor, state, wx, wy);
		}
		this.drawStateCounter(actor, state, wx, wy);
		wx += iw;
		--shownMax;
	}
	for (var i = 0; i < 8; ++i) {
		if (shownMax <= 0) break;
		if (actor._buffs[i] === 0) continue;
		this.drawBuffTurns(actor, i, wx, wy);
		if (Yanfly.Param.BSCShowBuffRate) {
			this.drawBuffRate(actor, i, wx, wy);
		}
		wx += iw;
		--shownMax;
	}
	this.resetFontSettings();
	this.resetTextColor();
};

};



//------------------------------------------------------------------------------
// YEP_X_InBattleStatus
//------------------------------------------------------------------------------

if (Imported.YEP_X_InBattleStatus) {

Window_InBattleStateList.prototype.makeItemList = function() {
	this._data = [];
	if (this._battler) {
		var states = this._battler.uniqueStates();
		var length = states.length;
		for (var i = 0; i < length; ++i) {
			var state = states[i];
			if (this.includes(state)) this._data.push(state);
		}
		for (var i = 0; i < 8; ++i) {
			if (this._battler.isBuffAffected(i) ||
				this._battler.isDebuffAffected(i)) {
				this._data.push('buff ' + i);
			}
		}
	}
	if (this._data.length <= 0) this._data.push(null);
};

dingk.StatesPlus.WIBSL_drawItem = Window_InBattleStateList.prototype.drawItem;
Window_InBattleStateList.prototype.drawItem = function(index) {
	var item = this._data[index];
	var rect = this.itemRect(index);
	rect.width -= this.textPadding();
	dingk.StatesPlus.WIBSL_drawItem.call(this, index);
	if (item) {
		this.drawStateStacks(this._battler, item, rect.x + 2, rect.y);
	}
};

};

};