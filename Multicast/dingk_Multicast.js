/*******************************************************************************
 * Multicast v1.2.0 by dingk
 * For use in RMMV 1.6.2
 ******************************************************************************/

var Imported = Imported || {};
Imported.dingk_Multicast = true;

var dingk = dingk || {};
dingk.Multicast = dingk.Multicast || {};
dingk.Multicast.version = '1.2.0';
dingk.Loot.filename = document.currentScript.src.match(/([^\/]+)\.js/)[1];

/*:
 * @plugindesc [v1.2.0] Allows an actor to select and perform multiple skills at once.
 * @author dingk
 *
 * @param Multicast Type
 * @desc Determines the default multicast type (see Help for more information)
 * @type select
 * @option 0
 * @option 1
 * @option 2
 * @default 0
 *
 * @param Show Finish Command
 * @desc Allow player to finish multicast selection early (e.g. select two skills while triple casting)
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 *
 * @param Command Text
 * @parent Show Finish Command
 * @desc Text to display for the finish command.
 * %1 - Remaining, %2 - Selected
 * @default Select %1...
 * 
 * @param Command Description
 * @parent Show Finish Command
 * @desc Help description for the finish command
 * @default Finish selection and use already selected skills.
 *
 * @help
 * -----------------------------------------------------------------------------
 *   Introduction
 * -----------------------------------------------------------------------------
 * This plugin lets an actor use multiple skills in one turn during battle. 
 * How this works is that the player selects the Multicast skill to enable 
 * multicasting. Then in the same window, the player can select multiple skills 
 * to cast provided that they still meet the skill costs.
 *
 * -----------------------------------------------------------------------------
 *   Plugin Parameters
 * -----------------------------------------------------------------------------
 * Multicast Type
 *  - Determines the default multicast type that is applied to all Multicast 
 *    skills.
 *  - 0 : Select and cast multiple skills at once.
 *  - 1 : Select only one skill, casts it multiple times, each with its 
 *        own target selection.
 *  - 2 : Select only one skill, casts it multiple times, but cannot select 
 *        different targets.
 *
 * Show Finish Multicast
 *  - Allow the player to finish a multicast skill selection early (e.g. select
 *    two skills while triple casting.
 *  - Useful for when actors have multicast via states, where a low MP actor 
 *    won't have enough MP to multicast, whereas if enabled via skill, they can
 *    just cancel it.
 * 
 * -----------------------------------------------------------------------------
 *   Notetags
 * -----------------------------------------------------------------------------
 * Skill and State Notetags:
 *  - The following notetags can be applied to skills and states.
 *  - If applied to a skill, you must select the skill to activate Multicasting.
 *  - If applied to a state, an actor with this state always has Multicasting 
 *    active and cannot be disabled unless the state expires.
 *
 * <Multicast x: y, y ... >
 * <Multicast x: y to z>
 *  - Set this skill to activate multicast.
 *  - 'x' is the number of skills that can be selected.
 *  - 'y' and 'z' are the skill IDs that you can multicast.
 *   > Example: <Multicast 2: 10 to 14>
 *     On choosing this skill, the player can select two more skills with IDs 
 *     10, 11, 12, 13, or 14.
 *
 * <Multicast Type: x>
 *  - Set this skill or state to be a certain multicast type. See Plugin 
 *    Parameters for more information.
 *
 * <Multicast Cost: x.y>
 * Change the skill cost rate. For example, you can set multicasted skills to 
 * cost 1.5 times more.
 * 
 * -----------------------------------------------------------------------------
 *   Compatibility
 * -----------------------------------------------------------------------------
 *  - Won't work with plugins that allow custom skill costs.
 *  - Works with YEP_SkillCore's HP costs.
 *  - Works with YEP_X_SkillCostItems (as of v1.2.0).
 *  - Only works with battle systems that allow multiple actions per turn. That
 *    means systems like Yanfly's ATB, CTB, and STB, and Moghunter's ATB will 
 *    NOT work with this plugin, but Victor's ATB works.
 *
 * -----------------------------------------------------------------------------
 *   Terms of Use
 * -----------------------------------------------------------------------------
 * Free and commercial use and redistribution (under MIT License).
 *
 * -----------------------------------------------------------------------------
 *   Changelog
 * -----------------------------------------------------------------------------
 * v1.2 - Feature update
 *  - New features:
 *    - Actors can now have multicast always active as a state
 *    - Using multicast type 1 and 2 will now show the right skill cost when 
 *      activated (e.g. Double cast 10MP = 20MP, Triple cast 10MP = 30MP)
 *    - While multicasting, you can now finish skill selection early (e.g. 
 *      choose two skills while triple casting).
 *  - Compatibility: Now compatible with YEP_X_SkillCostItems's item costs
 *  - Bug fixes:
 *    - Actually fixed a bug that failed to properly reset an actor's action
 *      when canceling a multicast.
 *
 * v1.1.1 - Bug fix
 *  - Fixed a bug that failed to properly reset an actor's action when canceling
 *    a multicast.
 *  - Canceling multicast now refreshes the skill window rather than going back 
 *    to the actor command window.
 *
 * v1.1 - Feature update
 *  - New feature: Different Multicast types
 *
 * v1.0 - Initial
 *  - Initial release
 */

dingk.Multicast.params = PluginManager.parameters('dingk_Multicast');
dingk.Multicast.defaultType = Number(dingk.Multicast.params['Multicast Type']) || 0;
dingk.Multicast.finishSelect = dingk.Multicast.params['Show Finish Command'] === 'true';
dingk.Multicast.finishText = dingk.Multicast.params['Command Text'];
dingk.Multicast.finishDesc = dingk.Multicast.params['Command Description'];

//------------------------------------------------------------------------------
// DataManager
//------------------------------------------------------------------------------

dingk.Multicast.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!dingk.Multicast.DataManager_isDatabaseLoaded.call(this)) return false;
	if (!dingk.Multicast._loaded) {
		this.process_dingk_Multicast_notetags($dataSkills);
		this.process_dingk_Multicast_notetags($dataStates);
		dingk.Multicast._loaded = true;
	}
	return true;
};

DataManager.process_dingk_Multicast_notetags = function(group) {
	let regex = [
		/<MULTICAST (\d+):\s*(.*)>/i,
		/<MULTICAST TYPE: (\d+)>/i,
		/<MULTICAST COST: (\d*.?\d+?)>/i
	];
	for (var n = 1; n < group.length; n++) {
		let obj = group[n];
		let notedata = obj.note.split(/[\r\n]+/);
		let mode = '';
		obj.multicastCount = 0;
		obj.multicastSkills = [];
		obj.multicastType = dingk.Multicast.defaultType;
		obj.multicastCost = 1.0;
		
		for (var i = 0; i < notedata.length; i++) {
			let result;
			// <Multicast count: x,x,...> <Multicast count: x to y,...>
			if ([, ...result] = notedata[i].match(regex[0]) || '') {
				obj.multicastCount = parseInt(result[0]);
				let data = result[1].split(',').map(a => a.trim());
				let skills = [];
				for (let el of data) {
					let vals;
					if ([, ...vals] = el.match(/(\d+)\s*TO\s*(\d+)/i) || '') {
						let start = Number(vals[0]);
						let end = Number(vals[1]);
						if (start > end) [start, end] = [end, start];
						let arr = [...Array(end - start + 1).keys()].map(a => a + start);
						skills = skills.concat(arr);
					} else {
						let id = Number(el);
						if (id) skills.push(id);
					}
				}
				obj.multicastSkills = obj.multicastSkills.concat(skills);
			}
			// <Multicast Type: x>
			else if ([, result] = notedata[i].match(regex[1]) || '') {
				obj.multicastType = Number(result);
			}
			// <Multicast Cost: x.y>
			else if ([, result] = notedata[i].match(regex[2]) || '') {
				obj.multicastCost = Number(result);
			}
		}
	}
};

//------------------------------------------------------------------------------
// Game_BattlerBase
//------------------------------------------------------------------------------

dingk.Multicast.GBB_initMembers = Game_BattlerBase.prototype.initMembers;
Game_BattlerBase.prototype.initMembers = function() {
	dingk.Multicast.GBB_initMembers.call(this);
	this._isMulticast = false;
	this._multicastSkills = [];
	this._multicastType = 0;
	this._multicastCount = 0;
	this._multicastCost = 1.0;
	this._lastMulticast = null;
	this._mcItems = [];
	this._mcWeapons = [];
	this._mcArmors = [];
};

dingk.Multicast.GBB_skillMpCost = Game_BattlerBase.prototype.skillMpCost;
Game_BattlerBase.prototype.skillMpCost = function(skill) {
	var mpCost = dingk.Multicast.GBB_skillMpCost.call(this, skill);
	if (this._isMulticast && this._multicastSkills.contains(skill.id)) {
		if (this._multicastType > 0) {
			return Math.round(mpCost * this._multicastCost) * this._multicastCount;
		} else {
			return Math.round(mpCost * this._multicastCost);
		}
	}
	for (let state of this.states()) {
		if (state.multicastCount && state.multicastSkills.includes(skill.id)) {
			if (state.multicastType > 0) {
				return Math.round(mpCost * state.multicastCost) * state.multicastCount;
			} else {
				return Math.round(mpCost * state.multicastCost);
			}
		}
	}
	return mpCost;
};

dingk.Multicast.GBB_skillTpCost = Game_BattlerBase.prototype.skillTpCost;
Game_BattlerBase.prototype.skillTpCost = function(skill) {
	var tpCost = dingk.Multicast.GBB_skillTpCost.call(this, skill);
	if (this._isMulticast && this._multicastSkills.contains(skill.id)) {
		if (this._multicastType > 0) {
			return Math.round(tpCost * this._multicastCost) * this._multicastCount;
		} else {
			return Math.round(tpCost * this._multicastCost);
		}
	}
	for (let state of this.states()) {
		if (state.multicastCount && state.multicastSkills.includes(skill.id)) {
			if (state.multicastType > 0) {
				return Math.round(tpCost * state.multicastCost) * state.multicastCount;
			} else {
				return Math.round(tpCost * state.multicastCost);
			}
		}
	}
	return tpCost;
};

if (Imported.YEP_SkillCore) {
	
dingk.Multicast.GBB_skillHpCost = Game_BattlerBase.prototype.skillHpCost;
Game_BattlerBase.prototype.skillHpCost = function(skill) {
	var hpCost = dingk.Multicast.GBB_skillHpCost.call(this, skill);
	if (this._isMulticast && this._multicastSkills.contains(skill.id)) {
		if (this._multicastType > 0) {
			return Math.round(hpCost * this._multicastCost) * this._multicastCount;
		} else {
			return Math.round(hpCost * this._multicastCost);
		}
	}
	for (let state of this.states()) {
		if (state.multicastCount && state.multicastSkills.includes(skill.id)) {
			if (state.multicastType > 0) {
				return Math.round(hpCost * state.multicastCost) * state.multicastCount;
			} else {
				return Math.round(hpCost * state.multicastCost);
			}
		}
	}
	return hpCost;
};
	
}; // Imported.YEP_SkillCore

//------------------------------------------------------------------------------
// Game_Battler
//------------------------------------------------------------------------------

dingk.Multicast.GB_initialize = Game_Battler.prototype.initialize;
Game_Battler.prototype.initialize = function() {
	dingk.Multicast.GB_initialize.call(this);
	this._multicastStates = [];
};

Game_Battler.prototype.cancelMulticastState = function(stateId) {
	this.removeState(stateId);
	
	var index = this._result.addedStates.indexOf(stateId);
	if (index >= 0)
		this._result.addedStates.splice(index, 1);
	
	index = this._result.removedStates.indexOf(stateId);
	if (index >= 0)
		this._result.removedStates.splice(index, 1);
};

Game_Battler.prototype.resetMulticast = function() {
	this._isMulticast = false;
	this._multicastType = 0;
	this._multicastSkills = [];
	for (var stateId of this._multicastStates) 
		this.cancelMulticastState(stateId);
	this._multicastStates = [];
	this.clearActions();
	if (this.canMove()) {
		var actionTimes = this.makeActionTimes();
		this._actions = [];
		for (var i = 0; i < actionTimes; i++) {
			this._actions.push(new Game_Action(this));
		}
	}
	if (Imported.YEP_X_SkillCostItems) {
		$gameParty.restoreContainers(this._mcItems, this._mcWeapons, this._mcArmors);
		this._mcItems = JsonEx.makeDeepCopy($gameParty._items);
		this._mcWeapons = JsonEx.makeDeepCopy($gameParty._weapons);
		this._mcArmors = JsonEx.makeDeepCopy($gameParty._armors);
	}
};

//------------------------------------------------------------------------------
// Game_Party
//------------------------------------------------------------------------------

if (Imported.YEP_X_SkillCostItems) {

dingk.Multicast.Game_Actor_skillItemCost = Game_Actor.prototype.skillItemCost;
Game_Actor.prototype.skillItemCost = function(skill) {
	let arr = dingk.Multicast.Game_Actor_skillItemCost.call(this, skill);
	
	for (let i = 0; i < arr.length; i++) {
		let cost = arr[i][1];
		if (this._isMulticast && this._multicastSkills.contains(skill.id)) {
			if (this._multicastType > 0) {
				cost = Math.round(cost * this._multicastCost) * this._multicastCount;
			} else {
				cost = Math.round(cost * this._multicastCost);
			}
		} else {
			for (let state of this.states()) {
				if (state.multicastCount && state.multicastSkills.includes(skill.id)) {
					if (state.multicastType > 0) {
						cost = Math.round(cost * state.multicastCost) * state.multicastCount;
					} else {
						cost = Math.round(cost * state.multicastCost);
					}
				}
			}
		}
		arr[i][1] = cost;
	}
	return arr;
};

};

//------------------------------------------------------------------------------
// Game_Party
//------------------------------------------------------------------------------

Game_Party.prototype.restoreContainers = function(items, weapons, armors) {
	if (Imported.YEP_X_SkillCostItems) {
		this._items = JsonEx.makeDeepCopy(items);
		this._weapons = JsonEx.makeDeepCopy(weapons);
		this._armors = JsonEx.makeDeepCopy(armors);
	}
};

//------------------------------------------------------------------------------
// Scene_Battle
//------------------------------------------------------------------------------

dingk.Multicast.SB_onActorOk = Scene_Battle.prototype.onActorOk;
Scene_Battle.prototype.onActorOk = function() {
	if (this._skillWindow._isMulticast) {
		var skill = this._skillWindow.item();
		var actor = BattleManager.actor();
		if (Imported.YEP_SkillCore)
			this._skillWindow._remainingHp -= actor.skillHpCost(skill);
		this._skillWindow._remainingMp -= actor.skillMpCost(skill);
		this._skillWindow._remainingTp -= actor.skillTpCost(skill);
		if (Imported.YEP_X_SkillCostItems) {
			actor.paySkillItemCost(skill);
		}
	}
	dingk.Multicast.SB_onActorOk.call(this);
};

dingk.Multicast.SB_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
Scene_Battle.prototype.onEnemyOk = function() {
	if (this._skillWindow._isMulticast) {
		var skill = this._skillWindow.item();
		var actor = BattleManager.actor();
		if (Imported.YEP_SkillCore)
			this._skillWindow._remainingHp -= actor.skillHpCost(skill);
		this._skillWindow._remainingMp -= actor.skillMpCost(skill);
		this._skillWindow._remainingTp -= actor.skillTpCost(skill);;
		if (Imported.YEP_X_SkillCostItems) {
			actor.paySkillItemCost(skill);
		}
	}
	dingk.Multicast.SB_onEnemyOk.call(this);
};

dingk.Multicast.SB_onSkillOk = Scene_Battle.prototype.onSkillOk;
Scene_Battle.prototype.onSkillOk = function() {
	var skill = this._skillWindow.item();
	var actor = BattleManager.actor();
	var action = BattleManager.inputtingAction();
	
	if (skill.id === 'finish') {
		this._skillWindow._isMulticast = false;
		if (actor) {
			actor._multicastCount = 1;
			$gameParty.restoreContainers(actor._mcItems, actor._mcWeapons, actor._mcArmors);
			actor.setLastBattleSkill(actor._lastMulticast);
		}
		this._skillWindow.hide();
		this._itemWindow.hide();
		BattleManager.selectNextCommand();
		this.changeInputWindow();
		return;
	}
	
	if (!skill.multicastCount && !this._skillWindow._isMulticast) {
		for (let state of actor.states()) {
			if (state.multicastCount && !this._skillWindow._isMulticast) {
				if (!state.multicastSkills.includes(skill.id)) continue;
				actor._isMulticast = true;
				actor._lastMulticast = skill;
				this._skillWindow._isMulticast = true;
				this._skillWindow._multicastSelects = 0;
				this._skillWindow._multicastCount = state.multicastCount - 1;
				this._skillWindow._multicastSkills = state.multicastSkills;
				this._skillWindow._multicastType = state.multicastType;
				this._skillWindow._multicastCost = state.multicastCost;
				actor._multicastSkills = state.multicastSkills;
				actor._multicastCount = state.multicastCount;
				actor._multicastType = state.multicastType;
				actor._multicastCost = state.multicastCost;
				
				this._skillWindow._remainingHp = actor._hp;
				this._skillWindow._remainingMp = actor._mp;
				this._skillWindow._remainingTp = actor._tp;
				
				if (Imported.YEP_X_SkillCostItems) {
					actor._mcItems = JsonEx.makeDeepCopy($gameParty._items);
					actor._mcWeapons = JsonEx.makeDeepCopy($gameParty._weapons);
					actor._mcArmors = JsonEx.makeDeepCopy($gameParty._armors);
				}
				
				/*for (var i = 0; i < this._skillWindow._multicastCount; i++) {
					actor._actions.push(new Game_Action(actor));
				}*/
			}
		}
	}
	
	if (skill.multicastCount && !this._skillWindow._isMulticast) {
		actor._isMulticast = true;
		actor._lastMulticast = skill;
		this._skillWindow._isMulticast = true;
		this._skillWindow._multicastSelects = 0;
		this._skillWindow._multicastCount = skill.multicastCount - 1;
		this._skillWindow._multicastSkills = skill.multicastSkills;
		this._skillWindow._multicastType = skill.multicastType;
		this._skillWindow._multicastCost = skill.multicastCost;
		actor._multicastSkills = skill.multicastSkills;
		actor._multicastCount = skill.multicastCount;
		actor._multicastType = skill.multicastType;
		actor._multicastCost = skill.multicastCost;
		
		this._skillWindow._remainingHp = actor._hp;
		this._skillWindow._remainingMp = actor._mp;
		this._skillWindow._remainingTp = actor._tp;
		
		if (Imported.YEP_X_SkillCostItems) {
			actor._mcItems = JsonEx.makeDeepCopy($gameParty._items);
			actor._mcWeapons = JsonEx.makeDeepCopy($gameParty._weapons);
			actor._mcArmors = JsonEx.makeDeepCopy($gameParty._armors);
		}
		
		/*for (var i = 0; i < this._skillWindow._multicastCount; i++) {
			actor._actions.push(new Game_Action(actor));
		}*/
		actor.setLastBattleSkill(skill);
		this._skillWindow.refresh();
		this._skillWindow.activate();
	} else if (this._skillWindow._isMulticast) {
		this._skillWindow._multicastSelects++;
		action.setSkill(skill.id);
		actor.setLastBattleSkill(skill);
		this.onSelectAction();
	} else {
		dingk.Multicast.SB_onSkillOk.call(this);
	}
};

dingk.Multicast.SB_onActorCancel = Scene_Battle.prototype.onActorCancel;
Scene_Battle.prototype.onActorCancel = function() {
	BattleManager.actor().resetMulticast();
	this._skillWindow.resetMulticast();
	dingk.Multicast.SB_onActorCancel.call(this);
	this._skillWindow.refresh();
};

dingk.Multicast.SB_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
Scene_Battle.prototype.onEnemyCancel = function() {
	BattleManager.actor().resetMulticast();
	this._skillWindow.resetMulticast();
	dingk.Multicast.SB_onEnemyCancel.call(this);
	this._skillWindow.refresh();
};

dingk.Multicast.SB_startActorCommandSelection = 
	Scene_Battle.prototype.startActorCommandSelection;
Scene_Battle.prototype.startActorCommandSelection = function() {
	dingk.Multicast.SB_startActorCommandSelection.call(this);
	let actor = BattleManager.actor();
	if (Imported.YEP_X_SkillCostItems) {
		actor._mcItems = JsonEx.makeDeepCopy($gameParty._items);
		actor._mcWeapons = JsonEx.makeDeepCopy($gameParty._weapons);
		actor._mcArmors = JsonEx.makeDeepCopy($gameParty._armors);
	}
	actor.resetMulticast();
	this._skillWindow.resetMulticast();
};

dingk.Multicast.SB_selectNextCommand = Scene_Battle.prototype.selectNextCommand;
Scene_Battle.prototype.selectNextCommand = function() {
	let skill = this._skillWindow.item();
	let actor = BattleManager.actor();
	let action = BattleManager.inputtingAction();
	
	if (action && !action.needsSelection() && this._skillWindow._isMulticast) {
		if (Imported.YEP_SkillCore) this._skillWindow._remainingHp -= actor.skillHpCost(skill);
		this._skillWindow._remainingMp -= actor.skillMpCost(skill);
		this._skillWindow._remainingTp -= actor.skillTpCost(skill);;
		if (Imported.YEP_X_SkillCostItems) {
			actor.paySkillItemCost(skill);
		}
	}
	
	if (this._skillWindow._multicastCount > 0) {
		this._skillWindow._multicastCount--;
		actor._actions.push(new Game_Action(actor));
	} else if (this._skillWindow._isMulticast) {
		this._skillWindow._isMulticast = false;
		if (actor) {
			actor._multicastCount = 1;
			$gameParty.restoreContainers(actor._mcItems, actor._mcWeapons, actor._mcArmors);
			actor.setLastBattleSkill(actor._lastMulticast);
		}
	}
	if (this._skillWindow._isMulticast) {
		if (this._skillWindow._multicastType === 1) {
			BattleManager.selectNextCommand();
			skill = this._skillWindow.item();
			actor = BattleManager.actor();
			action = BattleManager.inputtingAction();
			action.setSkill(skill.id);
			actor.setLastBattleSkill(skill);
			this.onSelectAction();
		} else if (this._skillWindow._multicastType === 2) {
			BattleManager.selectNextCommand();
			skill = this._skillWindow.item();
			actor = BattleManager.actor();
			action = BattleManager.inputtingAction();
			action.setSkill(skill.id);
			actor.setLastBattleSkill(skill);
			if (!action.needsSelection()) {
				this.selectNextCommand();
			} else if (action.isForOpponent()) {
				this.onEnemyOk();
			} else {
				this.onActorOk();
			}
		} else {
			this._helpWindow.clear();
			this._skillWindow.show();
			this._skillWindow.activate();
			this._skillWindow.refresh();
			BattleManager.selectNextCommand();
		}
	} else {
		dingk.Multicast.SB_selectNextCommand.call(this);
	}
};

dingk.Multicast.SB_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
Scene_Battle.prototype.onSkillCancel = function() {
	let win = this._skillWindow;
	let actor = BattleManager.actor();
	if (win._isMulticast) {
		BattleManager.actor().resetMulticast();
		win.resetMulticast();
		if (win._moveFinishCursor) actor.setLastBattleSkill(actor._lastMulticast);
		win.show();
		win.activate();
		win.refresh();
		if (win._moveFinishCursor) win.select(win._index - 1);
	} else {
		dingk.Multicast.SB_onSkillCancel.call(this);
	}
};

//------------------------------------------------------------------------------
// Window_BattleSkill
//------------------------------------------------------------------------------

dingk.Multicast.WBS_initialize = Window_BattleSkill.prototype.initialize;
Window_BattleSkill.prototype.initialize = function(x, y, width, height) {
	dingk.Multicast.WBS_initialize.call(this, x, y, width, height);
	this.resetMulticast();
};

if (dingk.Multicast.finishSelect) {
	
Window_BattleSkill.prototype.makeItemList = function() {
	Window_SkillList.prototype.makeItemList.call(this);
	if (this._actor && this._isMulticast) {
		let dummySkill = JsonEx.makeDeepCopy($dataSkills[1]);
		dummySkill.id = 'finish';
		let name = dingk.Multicast.finishText;
		let desc = dingk.Multicast.finishDesc
		dummySkill.name = name.format(this._multicastCount + 1, this._multicastSelects);
		dummySkill.description = desc.format(this._multicastCount + 1, this._multicastSelects);
		let data = [dummySkill];
		this._data = data.concat(this._data);
	}
};

Window_BattleSkill.prototype.drawItem = function(index) {
	let skill = this._data[index];
	if (skill.id === 'finish') {
		let rect = this.itemRect(index);
		rect.width -= this.textPadding();
		this.changePaintOpacity(1);
		this.resetTextColor();
		this.drawText(skill.name, rect.x, rect.y, rect.width);
		if (this._moveFinishCursor) {
			this.select(this.index() + 1);
			this._moveFinishCursor = false;
		}
	} else {
		Window_SkillList.prototype.drawItem.call(this, index);
	}
};

}; // dingk.Multicast.finishSelect

Window_BattleSkill.prototype.resetMulticast = function() {
	this._isMulticast = false;
	this._multicastSelects = 0;
	this._multicastCount = 0;
	this._multicastSkills = [];
	this._multicastStates = [];
	this._multicastType = dingk.Multicast.defaultType;
	this._multicastCost = 1.0;
	this._remainingHp = 0;
	this._remainingMp = 0;
	this._remainingTp = 0;
	this._oldMcr = 1;
	this._moveFinishCursor = dingk.Multicast.finishSelect;
	if (Imported.YEP_X_SkillCostItems) {
		this._mcItems = JsonEx.makeDeepCopy($gameParty._items);
		this._mcWeapons = JsonEx.makeDeepCopy($gameParty._weapons);
		this._mcArmors = JsonEx.makeDeepCopy($gameParty._armors);
	}
};

Window_BattleSkill.prototype.isEnabled = function(item) {
	if (item.id === 'finish') {
		if (!this._multicastSelects) return false;
		return true;
	}
	var actor = this._actor;
	var result = actor && this._actor.canUse(item);
	if (this._actor && this._isMulticast && DataManager.isSkill(item)) {
		var canMulti = this._multicastSkills.contains(item.id);
		var canPayTpCost = this._remainingTp >= actor.skillTpCost(item);
		var canPayMpCost = this._remainingMp >= actor.skillMpCost(item);
		result = result && canPayTpCost && canPayMpCost && canMulti;
		if (Imported.YEP_SkillCore) {
			var canPayHpCost = this._remainingHp >= actor.skillHpCost(item);
			result = result && canPayHpCost;
		}
	}
	return result;
};
