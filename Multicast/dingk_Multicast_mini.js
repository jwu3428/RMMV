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
 * @param Show Finish Command
 * @desc Allow player to finish multicast selection early (e.g. select two skills while triple casting)
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 * @param Command Text
 * @parent Show Finish Command
 * @desc Text to display for the finish command.
 * %1 - Remaining, %2 - Selected
 * @default Select %1...
 * @param Command Description
 * @parent Show Finish Command
 * @desc Help description for the finish command
 * @default Finish selection and use already selected skills.
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
var Imported=Imported||{};Imported.dingk_Multicast=!0;var dingk=dingk||{};dingk.Multicast=dingk.Multicast||{},dingk.Multicast.version="1.2.0",dingk.Loot.filename=document.currentScript.src.match(/([^\/]+)\.js/)[1],dingk.Multicast.params=PluginManager.parameters("dingk_Multicast"),dingk.Multicast.defaultType=+dingk.Multicast.params["Multicast Type"]||0,dingk.Multicast.finishSelect="true"===dingk.Multicast.params["Show Finish Command"],dingk.Multicast.finishText=dingk.Multicast.params["Command Text"],dingk.Multicast.finishDesc=dingk.Multicast.params["Command Description"],dingk.Multicast.DataManager_isDatabaseLoaded=DataManager.isDatabaseLoaded,DataManager.isDatabaseLoaded=function(){return!!dingk.Multicast.DataManager_isDatabaseLoaded.call(this)&&(dingk.Multicast._loaded||(this.process_dingk_Multicast_notetags($dataSkills),this.process_dingk_Multicast_notetags($dataStates),dingk.Multicast._loaded=!0),!0)},DataManager.process_dingk_Multicast_notetags=function(a){let b=[/<MULTICAST (\d+):\s*(.*)>/i,/<MULTICAST TYPE: (\d+)>/i,/<MULTICAST COST: (\d*.?\d+?)>/i];for(var c=1;c<a.length;c++){let e=a[c],f=e.note.split(/[\r\n]+/);e.multicastCount=0,e.multicastSkills=[],e.multicastType=dingk.Multicast.defaultType,e.multicastCost=1;for(var d=0;d<f.length;d++){let a;if([,...a]=f[d].match(b[0])||""){e.multicastCount=parseInt(a[0]);let b=a[1].split(",").map(b=>b.trim()),c=[];for(let a of b){let b;if([,...b]=a.match(/(\d+)\s*TO\s*(\d+)/i)||""){let d=+b[0],e=+b[1];d>e&&([d,e]=[e,d]);let f=[...Array(e-d+1).keys()].map(b=>b+d);c=c.concat(f)}else{let b=+a;b&&c.push(b)}}e.multicastSkills=e.multicastSkills.concat(c)}else([,a]=f[d].match(b[1])||"")?e.multicastType=+a:([,a]=f[d].match(b[2])||"")&&(e.multicastCost=+a)}}},dingk.Multicast.GBB_initMembers=Game_BattlerBase.prototype.initMembers,Game_BattlerBase.prototype.initMembers=function(){dingk.Multicast.GBB_initMembers.call(this),this._isMulticast=!1,this._multicastSkills=[],this._multicastType=0,this._multicastCount=0,this._multicastCost=1,this._lastMulticast=null,this._mcItems=[],this._mcWeapons=[],this._mcArmors=[]},dingk.Multicast.GBB_skillMpCost=Game_BattlerBase.prototype.skillMpCost,Game_BattlerBase.prototype.skillMpCost=function(a){var b=dingk.Multicast.GBB_skillMpCost.call(this,a);if(this._isMulticast&&this._multicastSkills.contains(a.id))return 0<this._multicastType?Math.round(b*this._multicastCost)*this._multicastCount:Math.round(b*this._multicastCost);for(let c of this.states())if(c.multicastCount&&c.multicastSkills.includes(a.id))return 0<c.multicastType?Math.round(b*c.multicastCost)*c.multicastCount:Math.round(b*c.multicastCost);return b},dingk.Multicast.GBB_skillTpCost=Game_BattlerBase.prototype.skillTpCost,Game_BattlerBase.prototype.skillTpCost=function(a){var b=dingk.Multicast.GBB_skillTpCost.call(this,a);if(this._isMulticast&&this._multicastSkills.contains(a.id))return 0<this._multicastType?Math.round(b*this._multicastCost)*this._multicastCount:Math.round(b*this._multicastCost);for(let c of this.states())if(c.multicastCount&&c.multicastSkills.includes(a.id))return 0<c.multicastType?Math.round(b*c.multicastCost)*c.multicastCount:Math.round(b*c.multicastCost);return b},Imported.YEP_SkillCore&&(dingk.Multicast.GBB_skillHpCost=Game_BattlerBase.prototype.skillHpCost,Game_BattlerBase.prototype.skillHpCost=function(a){var b=dingk.Multicast.GBB_skillHpCost.call(this,a);if(this._isMulticast&&this._multicastSkills.contains(a.id))return 0<this._multicastType?Math.round(b*this._multicastCost)*this._multicastCount:Math.round(b*this._multicastCost);for(let c of this.states())if(c.multicastCount&&c.multicastSkills.includes(a.id))return 0<c.multicastType?Math.round(b*c.multicastCost)*c.multicastCount:Math.round(b*c.multicastCost);return b});dingk.Multicast.GB_initialize=Game_Battler.prototype.initialize,Game_Battler.prototype.initialize=function(){dingk.Multicast.GB_initialize.call(this),this._multicastStates=[]},Game_Battler.prototype.cancelMulticastState=function(a){this.removeState(a);var b=this._result.addedStates.indexOf(a);0<=b&&this._result.addedStates.splice(b,1),b=this._result.removedStates.indexOf(a),0<=b&&this._result.removedStates.splice(b,1)},Game_Battler.prototype.resetMulticast=function(){this._isMulticast=!1,this._multicastType=0,this._multicastSkills=[];for(var a of this._multicastStates)this.cancelMulticastState(a);if(this._multicastStates=[],this.clearActions(),this.canMove()){var b=this.makeActionTimes();this._actions=[];for(var c=0;c<b;c++)this._actions.push(new Game_Action(this))}Imported.YEP_X_SkillCostItems&&($gameParty.restoreContainers(this._mcItems,this._mcWeapons,this._mcArmors),this._mcItems=JsonEx.makeDeepCopy($gameParty._items),this._mcWeapons=JsonEx.makeDeepCopy($gameParty._weapons),this._mcArmors=JsonEx.makeDeepCopy($gameParty._armors))},Imported.YEP_X_SkillCostItems&&(dingk.Multicast.Game_Actor_skillItemCost=Game_Actor.prototype.skillItemCost,Game_Actor.prototype.skillItemCost=function(a){let b=dingk.Multicast.Game_Actor_skillItemCost.call(this,a);for(let c,d=0;d<b.length;d++){if(c=b[d][1],this._isMulticast&&this._multicastSkills.contains(a.id))c=0<this._multicastType?Math.round(c*this._multicastCost)*this._multicastCount:Math.round(c*this._multicastCost);else for(let b of this.states())b.multicastCount&&b.multicastSkills.includes(a.id)&&(c=0<b.multicastType?Math.round(c*b.multicastCost)*b.multicastCount:Math.round(c*b.multicastCost));b[d][1]=c}return b});Game_Party.prototype.restoreContainers=function(a,b,c){Imported.YEP_X_SkillCostItems&&(this._items=JsonEx.makeDeepCopy(a),this._weapons=JsonEx.makeDeepCopy(b),this._armors=JsonEx.makeDeepCopy(c))},dingk.Multicast.SB_onActorOk=Scene_Battle.prototype.onActorOk,Scene_Battle.prototype.onActorOk=function(){if(this._skillWindow._isMulticast){var a=this._skillWindow.item(),b=BattleManager.actor();Imported.YEP_SkillCore&&(this._skillWindow._remainingHp-=b.skillHpCost(a)),this._skillWindow._remainingMp-=b.skillMpCost(a),this._skillWindow._remainingTp-=b.skillTpCost(a),Imported.YEP_X_SkillCostItems&&b.paySkillItemCost(a)}dingk.Multicast.SB_onActorOk.call(this)},dingk.Multicast.SB_onEnemyOk=Scene_Battle.prototype.onEnemyOk,Scene_Battle.prototype.onEnemyOk=function(){if(this._skillWindow._isMulticast){var a=this._skillWindow.item(),b=BattleManager.actor();Imported.YEP_SkillCore&&(this._skillWindow._remainingHp-=b.skillHpCost(a)),this._skillWindow._remainingMp-=b.skillMpCost(a),this._skillWindow._remainingTp-=b.skillTpCost(a);Imported.YEP_X_SkillCostItems&&b.paySkillItemCost(a)}dingk.Multicast.SB_onEnemyOk.call(this)},dingk.Multicast.SB_onSkillOk=Scene_Battle.prototype.onSkillOk,Scene_Battle.prototype.onSkillOk=function(){var a=this._skillWindow.item(),b=BattleManager.actor(),c=BattleManager.inputtingAction();if("finish"===a.id)return this._skillWindow._isMulticast=!1,b&&(b._multicastCount=1,$gameParty.restoreContainers(b._mcItems,b._mcWeapons,b._mcArmors),b.setLastBattleSkill(b._lastMulticast)),this._skillWindow.hide(),this._itemWindow.hide(),BattleManager.selectNextCommand(),void this.changeInputWindow();if(!a.multicastCount&&!this._skillWindow._isMulticast)for(let c of b.states())if(c.multicastCount&&!this._skillWindow._isMulticast){if(!c.multicastSkills.includes(a.id))continue;b._isMulticast=!0,b._lastMulticast=a,this._skillWindow._isMulticast=!0,this._skillWindow._multicastSelects=0,this._skillWindow._multicastCount=c.multicastCount-1,this._skillWindow._multicastSkills=c.multicastSkills,this._skillWindow._multicastType=c.multicastType,this._skillWindow._multicastCost=c.multicastCost,b._multicastSkills=c.multicastSkills,b._multicastCount=c.multicastCount,b._multicastType=c.multicastType,b._multicastCost=c.multicastCost,this._skillWindow._remainingHp=b._hp,this._skillWindow._remainingMp=b._mp,this._skillWindow._remainingTp=b._tp,Imported.YEP_X_SkillCostItems&&(b._mcItems=JsonEx.makeDeepCopy($gameParty._items),b._mcWeapons=JsonEx.makeDeepCopy($gameParty._weapons),b._mcArmors=JsonEx.makeDeepCopy($gameParty._armors))}a.multicastCount&&!this._skillWindow._isMulticast?(b._isMulticast=!0,b._lastMulticast=a,this._skillWindow._isMulticast=!0,this._skillWindow._multicastSelects=0,this._skillWindow._multicastCount=a.multicastCount-1,this._skillWindow._multicastSkills=a.multicastSkills,this._skillWindow._multicastType=a.multicastType,this._skillWindow._multicastCost=a.multicastCost,b._multicastSkills=a.multicastSkills,b._multicastCount=a.multicastCount,b._multicastType=a.multicastType,b._multicastCost=a.multicastCost,this._skillWindow._remainingHp=b._hp,this._skillWindow._remainingMp=b._mp,this._skillWindow._remainingTp=b._tp,Imported.YEP_X_SkillCostItems&&(b._mcItems=JsonEx.makeDeepCopy($gameParty._items),b._mcWeapons=JsonEx.makeDeepCopy($gameParty._weapons),b._mcArmors=JsonEx.makeDeepCopy($gameParty._armors)),b.setLastBattleSkill(a),this._skillWindow.refresh(),this._skillWindow.activate()):this._skillWindow._isMulticast?(this._skillWindow._multicastSelects++,c.setSkill(a.id),b.setLastBattleSkill(a),this.onSelectAction()):dingk.Multicast.SB_onSkillOk.call(this)},dingk.Multicast.SB_onActorCancel=Scene_Battle.prototype.onActorCancel,Scene_Battle.prototype.onActorCancel=function(){BattleManager.actor().resetMulticast(),this._skillWindow.resetMulticast(),dingk.Multicast.SB_onActorCancel.call(this),this._skillWindow.refresh()},dingk.Multicast.SB_onEnemyCancel=Scene_Battle.prototype.onEnemyCancel,Scene_Battle.prototype.onEnemyCancel=function(){BattleManager.actor().resetMulticast(),this._skillWindow.resetMulticast(),dingk.Multicast.SB_onEnemyCancel.call(this),this._skillWindow.refresh()},dingk.Multicast.SB_startActorCommandSelection=Scene_Battle.prototype.startActorCommandSelection,Scene_Battle.prototype.startActorCommandSelection=function(){dingk.Multicast.SB_startActorCommandSelection.call(this);let a=BattleManager.actor();Imported.YEP_X_SkillCostItems&&(a._mcItems=JsonEx.makeDeepCopy($gameParty._items),a._mcWeapons=JsonEx.makeDeepCopy($gameParty._weapons),a._mcArmors=JsonEx.makeDeepCopy($gameParty._armors)),a.resetMulticast(),this._skillWindow.resetMulticast()},dingk.Multicast.SB_selectNextCommand=Scene_Battle.prototype.selectNextCommand,Scene_Battle.prototype.selectNextCommand=function(){let a=this._skillWindow.item(),b=BattleManager.actor(),c=BattleManager.inputtingAction();c&&!c.needsSelection()&&this._skillWindow._isMulticast&&(Imported.YEP_SkillCore&&(this._skillWindow._remainingHp-=b.skillHpCost(a)),this._skillWindow._remainingMp-=b.skillMpCost(a),this._skillWindow._remainingTp-=b.skillTpCost(a),Imported.YEP_X_SkillCostItems&&b.paySkillItemCost(a));0<this._skillWindow._multicastCount?(this._skillWindow._multicastCount--,b._actions.push(new Game_Action(b))):this._skillWindow._isMulticast&&(this._skillWindow._isMulticast=!1,b&&(b._multicastCount=1,$gameParty.restoreContainers(b._mcItems,b._mcWeapons,b._mcArmors),b.setLastBattleSkill(b._lastMulticast))),this._skillWindow._isMulticast?1===this._skillWindow._multicastType?(BattleManager.selectNextCommand(),a=this._skillWindow.item(),b=BattleManager.actor(),c=BattleManager.inputtingAction(),c.setSkill(a.id),b.setLastBattleSkill(a),this.onSelectAction()):2===this._skillWindow._multicastType?(BattleManager.selectNextCommand(),a=this._skillWindow.item(),b=BattleManager.actor(),c=BattleManager.inputtingAction(),c.setSkill(a.id),b.setLastBattleSkill(a),c.needsSelection()?c.isForOpponent()?this.onEnemyOk():this.onActorOk():this.selectNextCommand()):(this._helpWindow.clear(),this._skillWindow.show(),this._skillWindow.activate(),this._skillWindow.refresh(),BattleManager.selectNextCommand()):dingk.Multicast.SB_selectNextCommand.call(this)},dingk.Multicast.SB_onSkillCancel=Scene_Battle.prototype.onSkillCancel,Scene_Battle.prototype.onSkillCancel=function(){let a=this._skillWindow,b=BattleManager.actor();a._isMulticast?(BattleManager.actor().resetMulticast(),a.resetMulticast(),a._moveFinishCursor&&b.setLastBattleSkill(b._lastMulticast),a.show(),a.activate(),a.refresh(),a._moveFinishCursor&&a.select(a._index-1)):dingk.Multicast.SB_onSkillCancel.call(this)},dingk.Multicast.WBS_initialize=Window_BattleSkill.prototype.initialize,Window_BattleSkill.prototype.initialize=function(a,b,c,d){dingk.Multicast.WBS_initialize.call(this,a,b,c,d),this.resetMulticast()},dingk.Multicast.finishSelect&&(Window_BattleSkill.prototype.makeItemList=function(){if(Window_SkillList.prototype.makeItemList.call(this),this._actor&&this._isMulticast){let a=JsonEx.makeDeepCopy($dataSkills[1]);a.id="finish";let b=dingk.Multicast.finishText,c=dingk.Multicast.finishDesc;a.name=b.format(this._multicastCount+1,this._multicastSelects),a.description=c.format(this._multicastCount+1,this._multicastSelects);this._data=[a].concat(this._data)}},Window_BattleSkill.prototype.drawItem=function(a){let b=this._data[a];if("finish"===b.id){let c=this.itemRect(a);c.width-=this.textPadding(),this.changePaintOpacity(1),this.resetTextColor(),this.drawText(b.name,c.x,c.y,c.width),this._moveFinishCursor&&(this.select(this.index()+1),this._moveFinishCursor=!1)}else Window_SkillList.prototype.drawItem.call(this,a)});Window_BattleSkill.prototype.resetMulticast=function(){this._isMulticast=!1,this._multicastSelects=0,this._multicastCount=0,this._multicastSkills=[],this._multicastStates=[],this._multicastType=dingk.Multicast.defaultType,this._multicastCost=1,this._remainingHp=0,this._remainingMp=0,this._remainingTp=0,this._oldMcr=1,this._moveFinishCursor=dingk.Multicast.finishSelect,Imported.YEP_X_SkillCostItems&&(this._mcItems=JsonEx.makeDeepCopy($gameParty._items),this._mcWeapons=JsonEx.makeDeepCopy($gameParty._weapons),this._mcArmors=JsonEx.makeDeepCopy($gameParty._armors))},Window_BattleSkill.prototype.isEnabled=function(a){if("finish"===a.id)return!!this._multicastSelects;var b=this._actor,c=b&&this._actor.canUse(a);if(this._actor&&this._isMulticast&&DataManager.isSkill(a)){var d=this._multicastSkills.contains(a.id),e=this._remainingTp>=b.skillTpCost(a),f=this._remainingMp>=b.skillMpCost(a);if(c=c&&e&&f&&d,Imported.YEP_SkillCore){var g=this._remainingHp>=b.skillHpCost(a);c=c&&g}}return c};