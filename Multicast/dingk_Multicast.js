/*******************************************************************************
 * Multicast v1.2.3 by dingk
 * For use in RMMV 1.6.2
 ******************************************************************************/

var Imported = Imported || {};
Imported.dingk_Multicast = true;

var dingk = dingk || {};
dingk.Multicast = dingk.Multicast || {};
dingk.Multicast.version = '1.2.3';
dingk.Multicast.filename = document.currentScript.src.match(/([^\/]+)\.js/)[1];

/*:
 * @plugindesc [v1.2.3] Allows an actor to select and perform multiple skills at once.
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
 * @default Finish selection and use %2 selected skills.
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
 * v1.2.3 - Bug fix (2021-09-19)
 *  - Fixed a bug that caused the game to crash when selecting 'Fight' after 
 *    finishing a triple (or more) cast selection early with only one member in
 *    your party.
 * v1.2.2 - Bug fix (2021-09-17)
 *  - Fixed a bug that caused the game to crash when trying to select a skill 
 *    when the actor has not learned any.
 * v1.2.1 - Hot fix (2020-05-04)
 *  - Fixed an issue with YEP_BattleEngineCore that caused actor and enemy 
 *    selection to visually appear as if the user is selecting all targets when 
 *    the first selected skill while multicasting targets all actors/enemies.
 *  - The Finish Command will no longer show for multicast types 1 and 2 as it 
 *    doesn't serve any purpose.
 *  - Adjusted skill window logic.
 * v1.2.0 - Feature update (2020-05-02)
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

dingk.Multicast.params = PluginManager.parameters(dingk.Multicast.filename);
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

/** Initialize multicast variables */
dingk.Multicast.GBB_initMembers = Game_BattlerBase.prototype.initMembers;
Game_BattlerBase.prototype.initMembers = function() {
	dingk.Multicast.GBB_initMembers.call(this);
	this._isMulticast = false;
	this._multicastSkills = [];
	this._multicastType = 0;
	this._multicastCount = 0;
	this._multicastCost = 1.0;
	this._lastMulticast = null;
	this._moveFinishCursor = false;
	this._mcItems = [];
	this._mcWeapons = [];
	this._mcArmors = [];
};

/**
 * Calculate multicast MP costs.
 * @param {Object} skill - Skill object
 * @return {Number} New cost
 */
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

/**
 * Calculate multicast TP costs.
 * @param {Object} skill - Skill object
 * @return {Number} New cost
 */
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

/**
 * (For Yanfly's Skill Core) Calculate multicast HP costs.
 * @param {Object} skill - Skill object
 * @return {Number} New cost
 */
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

/** Reset multicast variables */
Game_Battler.prototype.resetMulticast = function() {
	this._isMulticast = false;
	this._multicastType = 0;
	this._multicastSkills = [];
	this.clearActions();
	if (this.canMove()) {
		let actionTimes = this.makeActionTimes();
		this._actions = [];
		for (let i = 0; i < actionTimes; i++) {
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

/**
 * (For Skill Cost Items) Calculate multicast costs.
 * @param {Object} skill - Skill object
 * @return {Array} List of skills with their new costs.
 */
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

/**
 * (For Skill Cost Items) Revert party's items back to before multicasting
 * @param {Array} items - Party's items
 * @param {Array} weapons - Party's weapons
 * @param {Array} armors - Party's armors
 */
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

/** Keep track of skill costs when multicasting */
Scene_Battle.prototype.trackCosts = function() {
	let skill = this._skillWindow.item();
	let actor = BattleManager.actor();
	if (Imported.YEP_SkillCore)
		this._skillWindow._remainingHp -= actor.skillHpCost(skill);
	this._skillWindow._remainingMp -= actor.skillMpCost(skill);
	this._skillWindow._remainingTp -= actor.skillTpCost(skill);
	if (Imported.YEP_X_SkillCostItems) {
		actor.paySkillItemCost(skill);
	}
};

dingk.Multicast.SB_onActorOk = Scene_Battle.prototype.onActorOk;
Scene_Battle.prototype.onActorOk = function() {
	if (this._skillWindow._isMulticast) this.trackCosts();
	dingk.Multicast.SB_onActorOk.call(this);
};

dingk.Multicast.SB_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
Scene_Battle.prototype.onEnemyOk = function() {
	if (this._skillWindow._isMulticast) this.trackCosts();
	dingk.Multicast.SB_onEnemyOk.call(this);
};

/**
 * When player selects multicast, setup variables
 * @param {Object} obj - Skill or state object
 */
Scene_Battle.prototype.setupMulticast = function(obj) {
	let skill = this._skillWindow.item();
	let actor = BattleManager.actor();
	let action = BattleManager.inputtingAction();
	
	actor._isMulticast = true;
	actor._lastMulticast = skill;
	this._skillWindow._isMulticast = true;
	this._skillWindow._multicastSelects = 0;
	this._skillWindow._multicastCount = obj.multicastCount - 1;
	this._skillWindow._multicastSkills = obj.multicastSkills;
	this._skillWindow._multicastType = obj.multicastType;
	this._skillWindow._multicastCost = obj.multicastCost;
	this._skillWindow._moveFinishCursor = obj.multicastType ? false : true;
	actor._multicastSkills = obj.multicastSkills;
	actor._multicastCount = obj.multicastCount;
	actor._multicastType = obj.multicastType;
	actor._multicastCost = obj.multicastCost;
	actor._moveFinishCursor = obj.multicastType ? false : true;
	
	this._skillWindow._remainingHp = actor._hp;
	this._skillWindow._remainingMp = actor._mp;
	this._skillWindow._remainingTp = actor._tp;
	
	if (Imported.YEP_X_SkillCostItems) {
		actor._mcItems = JsonEx.makeDeepCopy($gameParty._items);
		actor._mcWeapons = JsonEx.makeDeepCopy($gameParty._weapons);
		actor._mcArmors = JsonEx.makeDeepCopy($gameParty._armors);
	}
};

dingk.Multicast.SB_onSkillOk = Scene_Battle.prototype.onSkillOk;
Scene_Battle.prototype.onSkillOk = function() {
	let skill = this._skillWindow.item();
	let actor = BattleManager.actor();
	let action = BattleManager.inputtingAction();
	
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
				this.setupMulticast(state);
			}
		}
	}
	
	if (skill.multicastCount && !this._skillWindow._isMulticast) {
		this.setupMulticast(skill);
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
	let actor = BattleManager.actor();
	let win = this._skillWindow;
	let needMove = actor._moveFinishCursor;
	if (win._isMulticast) actor.setLastBattleSkill(actor._lastMulticast);
	actor.resetMulticast();
	win.resetMulticast();
	dingk.Multicast.SB_onActorCancel.call(this);
	win.refresh();
	if (needMove) win.select(win._index - 1);
};

dingk.Multicast.SB_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
Scene_Battle.prototype.onEnemyCancel = function() {
	let actor = BattleManager.actor();
	let win = this._skillWindow;
	let needMove = actor._moveFinishCursor;
	if (win._isMulticast) actor.setLastBattleSkill(actor._lastMulticast);
	actor.resetMulticast();
	win.resetMulticast();
	dingk.Multicast.SB_onEnemyCancel.call(this);
	win.refresh();
	if (needMove) win.select(win._index - 1);
};

dingk.Multicast.SB_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
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

/** Add new logic for multicasting */
dingk.Multicast.SB_selectNextCommand = Scene_Battle.prototype.selectNextCommand;
Scene_Battle.prototype.selectNextCommand = function() {
	let skill = this._skillWindow.item();
	let actor = BattleManager.actor();
	let action = BattleManager.inputtingAction();
	
	// Track costs for skills that don't need selections
	if (action && !action.needsSelection() && this._skillWindow._isMulticast) {
		this.trackCosts();
	}
	
	// Add new action if multicasting
	if (this._skillWindow._isMulticast) {
		if (this._skillWindow._multicastCount > 0) {
			this._skillWindow._multicastCount--;
			actor._actions.push(new Game_Action(actor));
		}
		// Else revert back to normal
		else {
			this._skillWindow._isMulticast = false;
			if (actor) {
				actor._multicastCount = 1;
				$gameParty.restoreContainers(actor._mcItems, actor._mcWeapons, actor._mcArmors);
				actor.setLastBattleSkill(actor._lastMulticast);
			}
		}
	}
	// Determine next command based on multicast type
	if (this._skillWindow._isMulticast) {
		if (this._skillWindow._multicastType) {
			BattleManager.selectNextCommand();
			skill = this._skillWindow.item();
			actor = BattleManager.actor();
			action = BattleManager.inputtingAction();
			action.setSkill(skill.id);
			actor.setLastBattleSkill(actor._lastMulticast);
			if (this._skillWindow._multicastType === 1) {
				this.onSelectAction();
			} else { // if this._skillWindow._multicastType === 2
				if (!action.needsSelection()) {
					this.selectNextCommand();
				} else if (action.isForOpponent()) {
					this.onEnemyOk();
				} else {
					this.onActorOk();
				}
			}
		} else { // if this._skillWindow._multicastType === 0
			this._helpWindow.clear();
			this._skillWindow.show();
			this._skillWindow.activate();
			this._skillWindow.refresh();
			BattleManager.selectNextCommand();
			if (Imported.YEP_BattleEngineCore) BattleManager.stopAllSelection();
		}
	} else {
		dingk.Multicast.SB_selectNextCommand.call(this);
	}
};

/** Reset multicast settings on skill cancel */
dingk.Multicast.SB_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
Scene_Battle.prototype.onSkillCancel = function() {
	let win = this._skillWindow;
	let actor = BattleManager.actor();
	let needMove = actor._moveFinishCursor;
	if (win._isMulticast) {
		actor.setLastBattleSkill(actor._lastMulticast);
		actor.resetMulticast();
		win.resetMulticast();
		win.show();
		win.activate();
		win.refresh();
		if (needMove) win.select(win._index - 1);
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
	
/** If allow finish multicast, make a dummy skill to show the command */
Window_BattleSkill.prototype.makeItemList = function() {
	Window_SkillList.prototype.makeItemList.call(this);
	if (this._actor && this._isMulticast && !this._multicastType) {
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

/** 
 * Draw the dummy skill.
 * @param {Number} index - Current skill index
 */
Window_BattleSkill.prototype.drawItem = function(index) {
	let skill = this._data[index];
	if (skill && skill.id === 'finish') {
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

/** Reset multicast variables to default */
Window_BattleSkill.prototype.resetMulticast = function() {
	this._isMulticast = false;
	this._multicastSelects = 0;
	this._multicastCount = 0;
	this._multicastSkills = [];
	this._multicastType = dingk.Multicast.defaultType;
	this._multicastCost = 1.0;
	this._remainingHp = 0;
	this._remainingMp = 0;
	this._remainingTp = 0;
	this._moveFinishCursor = dingk.Multicast.finishSelect;
	if (Imported.YEP_X_SkillCostItems) {
		this._mcItems = JsonEx.makeDeepCopy($gameParty._items);
		this._mcWeapons = JsonEx.makeDeepCopy($gameParty._weapons);
		this._mcArmors = JsonEx.makeDeepCopy($gameParty._armors);
	}
};

/**
 * Check if multicast skills will exceed skill costs.
 * @param {Object} item - Skill
 * @return {boolean} True if actor has enough MP
 */
Window_BattleSkill.prototype.isEnabled = function(item) {
	if (!item) return false;
	if (item.id === 'finish') {
		if (!this._multicastSelects) return false;
		return true;
	}
	var actor = this._actor;
	var result = actor && actor.canUse(item);
	if (actor && this._isMulticast && DataManager.isSkill(item)) {
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
