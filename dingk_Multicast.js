var Imported = Imported || {};
Imported.dingk_Multicast = true;

var dingk = dingk || {};
dingk.Multicast = dingk.Multicast || {};
dingk.Multicast.version = 1.0;

/*:
 * @plugindesc Allows an actor to select and perform multiple skills at once.
 * @author dingk
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
 *   Notetags
 * -----------------------------------------------------------------------------
 * Skill Notetags:
 * <Multicast x: y, y ... >
 * <Multicast x: y to z>
 * Set this skill to activate multicast.
 * 'x' is the number of skills that can be selected.
 * 'y' and 'z' are the skill IDs that you can multicast.
 *   > Example: <Multicast 2: 10 to 14>
 *     On choosing this skill, the player can select two more skills with IDs 
 *     10, 11, 12, 13, or 14.
 * 
 * -----------------------------------------------------------------------------
 *   Compatibility
 * -----------------------------------------------------------------------------
 * This plugin was only made compatible with YEP_SkillCore.
 *
 * -----------------------------------------------------------------------------
 *   Terms of Use
 * -----------------------------------------------------------------------------
 *  > Can be used in free or commercial games.
 *  > Credit to me 'dingk' will be greatly appreciated.
 */

//------------------------------------------------------------------------------
// DataManager
//------------------------------------------------------------------------------

dingk.Multicast.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!dingk.Multicast.DataManager_isDatabaseLoaded.call(this)) return false;
	if (!dingk.Multicast._loaded) {
		this.process_dingk_Multicast_skills();
		dingk.Multicast._loaded = true;
	}
	return true;
};

DataManager.process_dingk_Multicast_skills = function() {
	var group = $dataSkills;
	var note1 = /<MULTICAST (\d+): (\d+(\s*,\s*\d+)*)>/i;
	var note2 = /<MULTICAST (\d+): (\d+) TO (\d+)>/i;
	for (var n = 1; n < group.length; n++) {
		var obj = group[n];
		var notedata = obj.note.split(/[\r\n]+/);
		var mode = '';
		obj.multicastCount = 0;
		obj.multicastSkills = [];
		
		for (var i = 0; i < notedata.length; i++) {
			if (notedata[i].match(note1)) {
				obj.multicastCount = parseInt(RegExp.$1);
				var skills = JSON.parse('[' + RegExp.$2 + ']');
				obj.multicastSkills = obj.multicastSkills.concat(skills);
			} else if (notedata[i].match(note2)) {
				obj.multicastCount = parseInt(RegExp.$1);
				var start = parseInt(RegExp.$2);
				var end = parseInt(RegExp.$3);
				var skills = 
					[...Array(end - start + 1).keys()].map(a => a + start);
				obj.multicastSkills = obj.multicastSkills.concat(skills);
			}
		}
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
		this._skillWindow._remainingTp -= actor.skillTpCost(skill);
	}
	dingk.Multicast.SB_onEnemyOk.call(this);
};

dingk.Multicast.SB_onSkillOk = Scene_Battle.prototype.onSkillOk;
Scene_Battle.prototype.onSkillOk = function() {
	var skill = this._skillWindow.item();
	var actor = BattleManager.actor();
	var action = BattleManager.inputtingAction();
	
	if (skill.multicastCount && !this._skillWindow._isMulticast) {
		this._skillWindow._isMulticast = true;
		this._skillWindow._multicastCount = skill.multicastCount - 1;
		this._skillWindow._multicastSkills = skill.multicastSkills;
		
		this._skillWindow._remainingHp = actor._hp;
		this._skillWindow._remainingMp = actor._mp;
		this._skillWindow._remainingTp = actor._tp;
		
		
		for (var i = 0; i < this._skillWindow._multicastCount; i++) {
			actor._actions.push(
				new Game_Action(actor));
		}
		
		this._skillWindow.refresh();
		this._skillWindow.activate();
	} else if (this._skillWindow._isMulticast) {
		action.setSkill(skill.id);
		actor.setLastBattleSkill(skill);
		if (this._skillWindow._multicastCount > 0)
			this._skillWindow._multicastCount--;
		else {
			this._skillWindow._isMulticast = false;
		}
		
		this.onSelectAction();
	} else {
		dingk.Multicast.SB_onSkillOk.call(this);
	}
};

dingk.Multicast.SB_selectNextCommand = Scene_Battle.prototype.selectNextCommand;
Scene_Battle.prototype.selectNextCommand = function() {
	if (this._skillWindow._isMulticast) {
		this._helpWindow.clear();
		this._skillWindow.show();
		this._skillWindow.activate();
		this._skillWindow.refresh();
		BattleManager.selectNextCommand();
	} else {
		dingk.Multicast.SB_selectNextCommand.call(this);
	}
};

dingk.Multicast.SB_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
Scene_Battle.prototype.onSkillCancel = function() {
	if (this._skillWindow._isMulticast) {
		this._skillWindow.resetMulticast();
		this.resetMulticast();
	}
	dingk.Multicast.SB_onSkillCancel.call(this);
};

Scene_Battle.prototype.resetMulticast = function() {
	BattleManager.actor().makeActions();
};

//------------------------------------------------------------------------------
// Window_BattleSkill
//------------------------------------------------------------------------------

dingk.Multicast.WBS_initialize = Window_BattleSkill.prototype.initialize;
Window_BattleSkill.prototype.initialize = function(x, y, width, height) {
	dingk.Multicast.WBS_initialize.call(this, x, y, width, height);
	this.resetMulticast();
};

Window_BattleSkill.prototype.resetMulticast = function() {
	this._isMulticast = false;
	this._multicastCount = 0;
	this._multicastSkills = [];
	this._remainingHp = 0;
	this._remainingMp = 0;
	this._remainingTp = 0;
};

Window_BattleSkill.prototype.isEnabled = function(item) {
	var actor = this._actor;
	if (this._actor && this._isMulticast && DataManager.isSkill(item)) {
		var canMulti = this._multicastSkills.contains(item.id);
		var canPayTpCost = this._remainingTp >= actor.skillTpCost(item);
		var canPayMpCost = this._remainingMp >= actor.skillMpCost(item);
		if (Imported.YEP_SkillCore) {
			var canPayHpCost = this._remainingHp >= actor.skillHpCost(item);
			return actor.canUse(item) && canPayTpCost && canPayMpCost
									  && canPayHpCost && canMulti;
		}
		return actor.canUse(item) && canPayTpCost && canPayMpCost && canMulti;
	}
	return actor && this._actor.canUse(item);
};