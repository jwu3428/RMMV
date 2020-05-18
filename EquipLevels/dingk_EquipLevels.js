/*******************************************************************************
 * Equipment Levels and Item Tiers (WIP) by dingk
 * For use in RMMV 1.6.2
 ******************************************************************************/
var Imported = Imported || {};
Imported.dingk_EquipLevels = true;

var dingk = dingk || {};
dingk.EL = dingk.EL || {};
dingk.EL.version = 'wip';
dingk.EL.filename = document.currentScript.src.match(/([^\/]+)\.js/)[1];

/*:
 * @plugindesc [v0.1.0] Allows weapons and armors to have levels to scale stats.
 * @author dingk
 *
 * @param Item Drop Level Type
 * @desc Determines what level the item is when dropped.
 * @type select
 * @option Always Level 1
 * @value 0
 * @option Highest level party member
 * @value 1
 * @option Lowest level party member
 * @value 2
 * @option Average level of party
 * @value 3
 * @default 0
 *
 * @param Enable Enemy Levels
 * @parent Item Drop Level Type
 * @desc (Requires plugin) If enabled, dropped equipment will have their levels set to the enemy's level.
 * @type boolean
 * @on Enable
 * @off Disable
 * @default true
 *
 * @param Enable Level Variance
 * @desc Allow equipment level to vary when dropped.
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 *
 * @param Level Variance Increase
 * @parent Enable Level Variance
 * @desc How many levels higher can the equipment level be
 * @type number
 * @min 0
 * @default 1

 * @param Level Variance Decrease
 * @parent Enable Level Variance
 * @desc How many levels lower can the equipment level be
 * @type number
 * @min 0
 * @default 1
 *
 * @param Max Level Safeguard
 * @parent Enable Level Variance
 * @desc If enabled, don't apply level variance if equipment is max level.
 * @type boolean
 * @on Enable
 * @off Disable
 * @default true
 *
 * @param Max Equip Level
 * @desc The absolute maximum level an equipment may have
 * @type number
 * @min 1
 * @default 100
 *
 * @param Level Restrictions
 * @desc If enabled, actors cannot equip anything that has a higher level than them.
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 *
 * @param --------------------------
 *
 * @param enhancement
 * @text Allow EXP Gain
 * @desc Allow equipment to level up by gaining EXP. If Level Restriction is enabled, EXP Gain is disabled.
 * @type select
 * @option No
 * @value 0
 * @option Yes, battles only
 * @value 1
 * @option Yes, fodder only
 * @value 2
 * @option Yes, both battles and fodder
 * @value 3
 * @default 0
 *
 * @param enhCmdName
 * @parent enhancement
 * @text Command Name
 * @desc Format of the command shown on the item action command list.
 * %1 - Icon, %2 - Item Name
 * @default Enhance %1%2
 *
 * @param enhCmdPriority
 * @parent enhancement
 * @text Command Priority
 * @desc Position of the command in the item action command list.
 * @type number
 * @min 0
 * @max 5
 * @default 1
 *
 * @param enhBattleExpRate
 * @parent enhancement
 * @text Battle EXP Rate
 * @desc The rate at which equipment gain EXP through battles
 * @type number
 * @decimals 2
 * @min 0.00
 * @default 1.00
 *
 * @param enhCustom
 * @parent enhancement
 * @text Customize Info Box
 * @desc Customize the text that displays in the enhance info text box.
 * @type struct<EnhInfo>
 * @default {"EXP Required":"EXP Required","Cannot Enhance":"This item cannot be enhanced.","Max Level":"MAX LEVEL"}
 *
 * @param --------------------------
 *
 * @param Tiers
 * @desc Manage item tiers with the highest tiers on the bottom.
 * @type struct<Tier>[]
 * @default  ["{\"name\":\"Common\",\"color\":\"0\",\"weight\":\"55\"}","{\"name\":\"Rare\",\"color\":\"9\",\"weight\":\"30\"}","{\"name\":\"Epic\",\"color\":\"30\",\"weight\":\"12\"}","{\"name\":\"Legendary\",\"color\":\"21\",\"weight\":\"3\"}"]
 *
 * @param Default Tier
 * @parent Tiers
 * @desc The default tier the item spawns at.
 * @type number
 * @default 0
 *
 * @param Show Upgrade Command
 * @parent Tiers
 * @desc Show the tier upgrade command in the item action window.
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 *
 * @param upCmdName
 * @text Command Name
 * @parent Show Upgrade Command
 * @desc Format of the command shown in the item action window.
 * @default Upgrade %1%2
 *
 * @param upCmdPriority
 * @text Command Priority
 * @parent Show Upgrade Command
 * @desc Position of the command in the item action command list.
 * @type number
 * @min 0
 * @max 5
 * @default 1
 *
 * @param upCustom
 * @text Customize Info Box
 * @parent Show Upgrade Command
 * @desc Customize the text that displays in the tier upgrade info text box.
 * @type struct<UpInfo>
 * @default {"Upgrade Title":"Materials Required","Cannot Upgrade":"Cannot be upgraded.","Max Tier":"Fully upgraded."}
 *
 * @param --------------------------
 *
 * @param HP Formula
 * @desc Formula for determining HP of the equipment
 * @default hp *= (level + tier) / 4
 *
 * @param MP Formula
 * @desc Formula for determining MP of the equipment
 * @default mp *= (level + tier) / 4
 *
 * @param ATK Formula
 * @desc Formula for determining ATK of the equipment
 * @default atk *= (level + tier) / 4
 *
 * @param DEF Formula
 * @desc Formula for determining DEF of the equipment
 * @default def *= (level + tier) / 4
 *
 * @param MAT Formula
 * @desc Formula for determining MAT of the equipment
 * @default mat *= (level + tier) / 4
 *
 * @param MDF Formula
 * @desc Formula for determining MDF of the equipment
 * @default mdf *= (level + tier) / 4
 *
 * @param AGI Formula
 * @desc Formula for determining AGI of the equipment
 * @default agi *= (level + tier) / 4
 *
 * @param LUK Formula
 * @desc Formula for determining LUK of the equipment
 * @default luk *= (level + tier) / 4
 *
 * @param Price Formula
 * @desc Formula for determining the price of the equipment
 * @default price *= (level + tier) / 4
 *
 * @param EXP Formula
 * @desc Formula for determining the total EXP needed to level the equipment
 * @default exp = level * 100
 *
 * @param --------------------------
 *
 * @param displayLevel
 * @text Display Level in Name
 * @desc Display the item level in the name (example: Sword Lv1)
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @param levelFmtShort
 * @parent displayLevel
 * @text Short Display Format
 * @desc Format of the item name shown in item menus.
 * %1 - Name, %2 - Level
 * @default %1 Lv%2
 *
 * @param levelFmtFull
 * @parent displayLevel
 * @text Full Display Format
 * @desc Format of the item name shown in info text boxes.
 * %1 - Name, %2 - Level
 * @default %1 Level %2
 *
 * @param levelShopInfo
 * @parent displayLevel
 * @text Display Shop Item Info
 * @desc Show full level display format and possession in shop item info panel.
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param --------------------------
 *
 * @param Plugin Command Settings
 * @desc Adjust settings for the plugin commands.
 * @type struct<ELPCSettings>
 * @default {"enhScene":"false","upScene":"false"}
 *
 * @param aliases
 * @text Parameter Aliases
 * @desc Customize name of parameters in notetags. This is only for quality of life purposes and has no effect on gameplay.
 * @type struct<ParamAlias>
 * @default {"hp":"hp|mhp","mp":"mp|mmp","atk":"atk","def":"def","mat":"mat","mdf":"mdf","agi":"agi","luk":"luc|luk","price":"price","exp":"exp"}
 *
 * @help
 * -----------------------------------------------------------------------------
 * Notetags
 * -----------------------------------------------------------------------------
 *
 * (1) Item, Weapon, Armor Notetags
 *
 * <Fodder Exp: value>
 * <Fodder Exp types: value>
 * Allow this item to be fed to an equipment as EXP, replacing 'value' with the 
 * EXP value. If no 'types' are defined, this item can be fed to all equipment. 
 * Otherwise, replace 'types' with a comma-separated list.
 *
 * <Tier: value1>
 * <Tier: value1/value2>
 * Set the tier of the equipment when dropped. Replace 'value1' with the 
 * desired tier, and 'value2' with maximum possible tier. Tiers start at 0.
 *
 * (2) Weapon, Armor Notetags
 *
 * <Drop Level: value>
 *  - Set the equipment to always drop at this level, replacing 'value' with the 
 *    desired level.
 *
 * <Max Level: value>
 *  - Set the max level of the equipment, replacing 'value' with the desired 
 *    level.
 *
 * <Cannot Level>
 *  - Disable level enhancement for this equipment.
 *
 * <Display Level: true>
 * <Display Level: false>
 *  - Set whether or not to display the equipment's level in its name.
 *
 * <Fodder Type: types>
 *  - Set which type of items are allowed to be fed into this equipment. Replace 
 *    'types' with a comma-separated list.
 *
 * <Equip param Formula: code>
 *  - Lets you apply a custom formula to one of the equipment parameters.
 *  - Replace 'param' with 'hp', 'mp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk',
 *    'price', or 'exp', and replace 'code' with JavaScript code.
 *
 * <Equip Custom Formula>
 * hp = ...
 * mp = ...
 * atk = ...
 * def = ...
 * mdf = ...
 * agi = ...
 * luk = ...
 * price = ...
 * exp = ...
 * </Equip Custom Formula>
 *  - Same as previous notetag but lets you input in bulk. You can also play
 *    around with the code, such as using *= or += to multiple or add to the
 *    existing parameters specified in the main editor.
 *  - NOTE: Only one line of code per formula. To input more sophisticated 
 *    logic, refer to 'Advanced Notetags' below.
 *
 * <Trait index Unlock Level value> / <Trait index Unlock Level min-max>
 * <Trait index Unlock Tier  value> / <Trait index Unlock Tier  min-max>
 *  - Set up a trait unlock system for the equipment depending on level/tier.
 *  - Replace 'index' with the index of "Traits" list. Topmost item is index 0.
 *  - Replace 'value' with the level/tier you want the trait to unlock.
 *  - Or replace 'min' and 'max' if you want the trait to unlock at a specific 
 *    range.
 *  - NOTE: Place these below the <Tier: value> and <Max Level: value> notetags.
 *
 * <Tier n Upgrade>
 * Item id: [count]
 * Weapon id: [count]
 * Armor id: [count]
 * Gold: [count]
 * name: [count]
 * ...
 * </Tier n Upgrade>
 *  - Set the materials required to upgrade from tier 'n' to the next (n+1).
 *  - Fill in the following variables:
 *    - id : ID of the item/weapon/armor
 *    - [Optional] [count] : Number of items required. If blank, default is 1.
 *    - name : Alternative to 'item id' 'weapon id' and 'armor id'. Input name 
 *             of the item.
 *  - Example:  <Tier 0 Upgrade>
 *              Item 1
 *              Potion: 5
 *              Gold: 500
 *              </Tier 0 Upgrade>
 *    To upgrade from Tier 0 to 1, one item of ID #1, five Potions, and 500 gold
 *    are required.
 *
 * -----------------------------------------------------------------------------
 * Advanced Notetags
 * -----------------------------------------------------------------------------
 * 
 * The following notetags require JavaScript.
 * Available local variables:
 *  - item : The current item being evaluated
 *  - s : Array of the game switches (read-only)
 *  - v : Array of the game variables (read-only)
 * Useful methods:
 *  - ItemManager.setLevel(item, number) : Change item level and recalculate 
 *    item stats.
 *  - ItemManager.setTier(item, number) : Change item tier and recalculate item 
 *    stats.
 *  - ItemManager.itemGainExp(item, number) : Give item some exp.
 *  - ItemManager.isMaxLevel(item) : Return true if item is max level.
 *  - ...and more! Feel free to look at the source code to see what you can do.
 *
 * Weapon and Armor Notetags
 *
 * <Equip Formula Eval>     Example: <Equip Formula Eval>
 * code                              if (item.level > 5) hp = 100;
 * </Equip Formula Eval>             else hp = -100;
 *                                   </Equip Formula Eval>
 *  - Advanced version of <Equip Custom Formula> notetag.
 *  - This notetag will let you put longer code and has more freedom, whereas 
 *    the simpler one only allows one line per parameter.
 *  - In addition to above local variables, 'hp', 'mp', 'atk', 'def', 'mat', 
 *    'mdf', 'agi', 'luk', 'price', and 'exp' are also available.
 *  - Example: If the item's level is greater than 5, increase HP by 100. 
 *    Otherwise, decrease HP by 100;
 *
 * <On Level Eval>     Example: <On Level Eval>
 * code                         $gameParty.allMembers().map(function(a) {
 * </On Level Eval>               a.gainExp(item.level * 10);
 *                              )};
 *                              </On Level Eval>
 *  - Run code when the equipment changes levels.
 *  - Example: Each party member gains 10 times the item's level in EXP.
 *
 * <On Tier Eval>      Example: <On Tier Eval>
 * code                         ItemManager.setLevel(item, 1);
 * </On Tier Eval>              </On Tier Eval>
 *  - Run code when the equipment changes tiers.
 *  - Example: Reset item level to 1 when you change the item's tier (such as 
 *             through upgrades).
 *
 * <Level Condition Eval>       Example: <Level Condition Eval>
 * code                                  $gameParty.highestLevel() > 10;
 * </Level Condition Eval>               </Level Condition Eval>
 *  - Allow this item to gain exp and level if code evaluates to true.
 *  - Example: Allow item to level if the party's highest level is greater than 
 *             10.
 *
 * <Tier Condition Eval>        Example: <Tier Condition Eval>
 * code                                  ItemManager.isMaxLevel(item);
 * </Tier Condition Eval>                </Tier Condition Eval>
 *  - Allow this item to upgrade tiers if code evaluates to true.
 *  - Example: Allow this item to upgrade tiers if item is max level.
 * -----------------------------------------------------------------------------
 * Plugin Commands
 * -----------------------------------------------------------------------------
 *
 * ItemDropLevel level
 * ItemDropLevel min max
 *  - Set the level of the item given to the player. Place before any Give Item
 *    command. If 'min' 'max' are used, the level will be random between these 
 *    values.
 *
 * GiveCustomWeapon id level tier
 *  - Give player a weapon. Replace 'id', 'level', 'tier' with the ID of the 
 *    weapon, the weapon's level, and its tier respectively.
 *
 * GiveCustomArmor id level tier
 *  - Give player an armor. Replace 'id', 'level', 'tier' with the ID of the 
 *    armor, the armor's level, and its tier respectively.
 *
 * OpenEquipEnhance [category1 category2 ...]
 *  - Open the equipment enhance scene.
 *  - [Optional] Specify the categories. Use 'weapon' and 'armor'. Also supports 
 *    all the categories from YEP_X_ItemCategories.
 *
 * OpenEquipUpgrade [category1 category2 ...]
 *  - Open the equipment tier upgrade scene.
 *  - [Optional] Specify the categories. Use 'weapon' and 'armor'. Also supports 
 *    all the categories from YEP_X_ItemCategories.
 *
 * EquipEnhanceType value
 *  - Change the enhancement type. If level restriction is enabled, the type 
 *    cannot be changed and enhancement is always disabled.
 *  - 0 - Disabled, 1 - Battle EXP only, 2 - Fodder EXP only, 3 - Both
 *
 * -----------------------------------------------------------------------------
 * Changelog
 * -----------------------------------------------------------------------------
 * WIP - DO NOT USE
 */
/*~struct~ParamAlias:
 * @param hp
 * @text HP
 * @desc Separate aliases with a vertical bar '|'
 * @default hp|mhp
 *
 * @param mp
 * @text MP
 * @desc Separate aliases with a vertical bar '|'
 * @default mp|mmp
 *
 * @param atk
 * @text Attack
 * @desc Separate aliases with a vertical bar '|'
 * @default atk
 *
 * @param def
 * @text Defense
 * @desc Separate aliases with a vertical bar '|'
 * @default def
 *
 * @param mat
 * @text Magic Attack
 * @desc Separate aliases with a vertical bar '|'
 * @default mat
 *
 * @param mdf
 * @text Magic Defense
 * @desc Separate aliases with a vertical bar '|'
 * @default mdf
 *
 * @param agi
 * @text Agility
 * @desc Separate aliases with a vertical bar '|'
 * @default agi
 *
 * @param luk
 * @text Luck
 * @desc Separate aliases with a vertical bar '|'
 * @default luc|luk
 *
 * @param price
 * @text Price
 * @desc Separate aliases with a vertical bar '|'
 * @default price
 *
 * @param exp
 * @text Experience
 * @desc Separate aliases with a vertical bar '|'
 * @default exp
 */
/*~struct~Tier:
 * @param name
 * @text Name
 * @desc Name of the tier
 *
 * @param color
 * @text Text Color
 * @desc Color of the text of the item of this tier. You may use color codes or hex values (i.e. #FFFFFF for white).
 * @default 0
 *
 * @param weight
 * @text Loot Weight
 * @desc Determines the probability that the item drops at this tier.
 * @type number
 * @min 0
 * @default 0
 */
/*~struct~EnhInfo:
 * @param EXP Required
 * @default EXP Required
 *
 * @param Cannot Enhance
 * @default Cannot be enhanced.
 *
 * @param Max Level
 * @default MAX LEVEL
 */
/*~struct~UpInfo:
 * @param Upgrade Title
 * @default Materials Required
 *
 * @param Cannot Upgrade
 * @default Cannot be upgraded.
 *
 * @param Max Tier
 * @default Fully upgraded.
 */
/*~struct~ELPCSettings:
 * @param enhScene
 * @text Hide Non-enhanceable Equips
 * @desc Hide equips that cannot be enhanced when using OpenEquipEnhance.
 * @default false
 *
 * @param upScene
 * @text Hide Non-upgradeable Equips
 * @desc Hide equips that cannot be upgraded when using OpenEquipUpgrade.
 * @default false
 */

if (!Imported.YEP_ItemCore) {
	let msg = dingk.EL.filename + ' requires YEP_ItemCore.'
	console.log(msg);
	if (confirm(msg + '\n\nDownload YEP_ItemCore now?')) {
		window.open('http://www.yanfly.moe/wiki/Item_Core_(YEP)');
	}
} else {

dingk.EL.params = PluginManager.parameters(dingk.EL.filename);
dingk.EL.itemDropLevelType = Number(dingk.EL.params['Item Drop Level Type']) || 0;
dingk.EL.enableEnemyLevels = dingk.EL.params['Enable Enemy Levels'] === 'true';
dingk.EL.EnableLevelVariance = dingk.EL.params['Enable Level Variance'] === 'true';
dingk.EL.LevelVarianceUp = Number(dingk.EL.params['Level Variance Increase']) || 1;
dingk.EL.LevelVarianceDown = Number(dingk.EL.params['Level Variance Decrease']) || 1;
dingk.EL.LevelVarianceSafe = dingk.EL.params['Max Level Safeguard'] === 'true';
dingk.EL.MaxLevel = Number(dingk.EL.params['Max Equip Level']) || 100;
dingk.EL.LevelRestrict = dingk.EL.params['Level Restrictions'] === 'true';
dingk.EL.Tiers = JSON.parse(dingk.EL.params['Tiers']);
dingk.EL.DefaultTier = Number(dingk.EL.params['Default Tier']) || 0;
dingk.EL.EnableUpgrade = dingk.EL.params['Show Upgrade Command'] === 'true';
dingk.EL.UpgradeFmt = dingk.EL.params['upCmdName'];
dingk.EL.UpgradePriority = Number(dingk.EL.params['upCmdPriority']) || 0;
dingk.EL.UpgradeInfo = JSON.parse(dingk.EL.params['upCustom']);
dingk.EL.HPFormula = dingk.EL.params['HP Formula'] || "hp";
dingk.EL.MPFormula = dingk.EL.params['MP Formula'] || "mp";
dingk.EL.ATKFormula = dingk.EL.params['ATK Formula'] || "atk";
dingk.EL.DEFFormula = dingk.EL.params['DEF Formula'] || "def";
dingk.EL.MATFormula = dingk.EL.params['MAT Formula'] || "mat";
dingk.EL.MDFFormula = dingk.EL.params['MDF Formula'] || "mdf";
dingk.EL.AGIFormula = dingk.EL.params['AGI Formula'] || "agi";
dingk.EL.LUKFormula = dingk.EL.params['LUK Formula'] || "luk";
dingk.EL.PriceFormula = dingk.EL.params['Price Formula'] || "price";
dingk.EL.EXPFormula = dingk.EL.params['EXP Formula'] || "exp";
dingk.EL.EnhanceType = dingk.EL.LevelRestrict ? 0 : Number(dingk.EL.params['enhancement']) || 0;
dingk.EL.EnhanceFmt = dingk.EL.params['enhCmdName'];
dingk.EL.EnhancePriority = Number(dingk.EL.params['enhCmdPriority']) || 0;
dingk.EL.BattleExpRate = Number(dingk.EL.params['enhBattleExpRate']) || 0;
dingk.EL.EnhanceInfo = JSON.parse(dingk.EL.params['enhCustom']);
dingk.EL.DisplayLevel = dingk.EL.params['displayLevel'] === 'true';
dingk.EL.DisplayFmt = dingk.EL.params['levelFmtShort'];
dingk.EL.DisplayFmtFull = dingk.EL.params['levelFmtFull'];
dingk.EL.DisplayShopInfo = dingk.EL.params['levelShopInfo'] === 'true';
dingk.EL.Aliases = JSON.parse(dingk.EL.params['aliases']);
dingk.EL.PCSettings = JSON.parse(dingk.EL.params['Plugin Command Settings']);
dingk.EL.EUCWindowStyle = 'horizontal';
dingk.EL.EUCWindowMessage = 'Do you want to proceed with the upgrade?';
dingk.EL.EUCWindowCountFS = 20;

Object.defineProperties(dingk.EL, {
	ENHANCE_DISABLED: {
		value: 0,
		writable: false,
		configurable: false
	},
	ENHANCE_TYPE_BATTLE: {
		value: 1,
		writable: false,
		configurable: false
	},
	ENHANCE_TYPE_FODDER: {
		value: 2,
		writable: false,
		configurable: false
	},
	ENHANCE_TYPE_ALL: {
		value: 3,
		writable: false,
		configurable: false
	},
	TIER_UPGRADE: {
		value: 'upgrade',
		writable: false,
		configurable: false
	},
	ERR_MAT: {
		value: function(name, kind) {
			switch(kind) {
				case 0:
					return 'Item ' + name + ' does not exist.';
				case 1:
					return 'Weapon ' + name + ' does not exist.';
				case 2:
					return 'Armor ' + name + ' does not exist.';
				default:
					return name + ' does not exist.';
			}
		},
		writable: false,
		configurable: false
	}
});

//--------------------------------------------------------------------------------------------------
// DataManager
//--------------------------------------------------------------------------------------------------

/**
 * Check if database is loaded, then process notetags
 * @return {Boolean} Whether database has loaded
 */
dingk.EL.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!dingk.EL.DataManager_isDatabaseLoaded.call(this)) return false;
	if (!dingk.EL._loaded) {
		this.dingk_EquipLevels_setup();
		this.process_dingk_EquipLevels_notetags1($dataItems);
		this.process_dingk_EquipLevels_notetags1($dataWeapons);
		this.process_dingk_EquipLevels_notetags1($dataArmors);
		this.process_dingk_EquipLevels_notetags2($dataWeapons);
		this.process_dingk_EquipLevels_notetags2($dataArmors);
		this.process_dingk_EquipLevels_notetagsEnemies();
		dingk.EL._loaded = true;
	}
	return true;
};

/** Parse json from plugin parameters */
DataManager.dingk_EquipLevels_setup = function() {
	let tiers = [];
	for (let tier of dingk.EL.Tiers) {
		let parsed = JSON.parse(tier);
		parsed.weight = Number(parsed.weight);
		tiers.push(parsed);
	}
	dingk.EL.Tiers = tiers;
	for (let setting in dingk.EL.PCSettings) {
		dingk.EL.PCSettings[setting] = dingk.EL.PCSettings[setting] === 'true';
	}
	
	dingk.EL.getItemNames();
	dingk.EL.getWeaponNames();
	dingk.EL.getArmorNames();
	dingk.EL.getParamIds();
};

/** 
 * Parse notetags
 * @param {Array} group - List of database objects
 */
DataManager.process_dingk_EquipLevels_notetags1 = function(group) {
	let regEx = [
		/<FODDER EXP\s*(.*)?:\s*(\d+)>/i,
		/<TIER:\s*(\d+)\/?(\d+)?>/i
	];
	
	for (let n = 1; n < group.length; n++) {
		let obj = group[n];
		let notedata = obj.note.split(/[\r\n]+/);
		
		obj.allowEnhancement = false;
		obj.displayLevel = false;
		obj.tier = dingk.EL.DefaultTier.clamp(0, dingk.EL.Tiers.length);
		obj.maxTier = dingk.EL.Tiers.length;
		obj.fodderExp = 0;
		obj.fodderExpTypes = [];
		
		for (let note of notedata) {
			let result;
			
			// <Fodder Exp: value>
			// <Fodder Exp types: value>
			if ([, ...result] = note.match(regEx[0]) || '') {
				if (result[0]) {
					let types = result[0].split(/\s*,\s*/);
					obj.fodderExpTypes = types.map(el => el.toUpperCase());
				}
				obj.fodderExp = Number(result[1]);
			}
			// <Tier: value1/value2>
			else if ([, ...result] = note.match(regEx[1]) || '') {
				obj.tier = Number(result[0]);
				if (result[1]) obj.maxTier = Number(result[1]);
				if (obj.tier > obj.maxTier) {
					[obj.tier, obj.maxTier] = [obj.maxTier, obj.tier];
				}
			}
		}
	}
};

/** 
 * Parse notetags
 * @param {Array} group - List of database objects
 */
DataManager.process_dingk_EquipLevels_notetags2 = function(group) {
	let regEx = [
		/<DROP LEVEL:\s*(\d+)>/i,
		/<MAX LEVEL:\s*(\d+)>/i,
		/<CANNOT LEVEL>/i,
		/<DISPLAY LEVEL:\s*(TRUE|FALSE)>/i,
		/<EQUIP (.*) FORMULA:\s*(.*)>/i,
		/<FODDER TYPE:\s*(.*)>/i,
		/<TRAIT (\d+) UNLOCK (LEVEL|TIER) (\d+)-?(\d+)?>/i,
		/<TIER (\d+) UPGRADE>/i,
		/<ON (LEVEL|TIER) EVAL>/i,
		/<(LEVEL|TIER) CONDITION EVAL>/i,
		/<EQUIP FORMULA EVAL>/i
	];
	
	let regExEnd = [
		/<\/EQUIP FORMULAS>/i,
		/<\/TIER \d+ UPGRADE>/i,
		/<\/ON (?:LEVEL|TIER) EVAL>/i,
		/<\/(?:LEVEL|TIER) CONDITION EVAL>/i,
		/<\/EQUIP FORMULA EVAL>/i
	];
	
	let regEx2 = {
		hp: new RegExp('(?:' + dingk.EL.Aliases['hp'] + ')', 'gi'),
		mp: new RegExp('(?:' + dingk.EL.Aliases['mp'] + ')', 'gi'),
		atk: new RegExp('(?:' + dingk.EL.Aliases['atk'] + ')', 'gi'),
		def: new RegExp('(?:' + dingk.EL.Aliases['def'] + ')', 'gi'),
		mat: new RegExp('(?:' + dingk.EL.Aliases['mat'] + ')', 'gi'),
		mdf: new RegExp('(?:' + dingk.EL.Aliases['mdf'] + ')', 'gi'),
		agi: new RegExp('(?:' + dingk.EL.Aliases['agi'] + ')', 'gi'),
		luk: new RegExp('(?:' + dingk.EL.Aliases['luk'] + ')', 'gi'),
		price: new RegExp('(?:' + dingk.EL.Aliases['price'] + ')', 'gi'),
		exp: new RegExp('(?:' + dingk.EL.Aliases['exp'] + ')', 'gi')
	};
	
	let regEx3 = {
		hp: new RegExp(regEx2.hp.source + '(.*)', 'gi'),
		mp: new RegExp(regEx2.mp.source + '(.*)', 'gi'),
		atk: new RegExp(regEx2.atk.source + '(.*)', 'gi'),
		def: new RegExp(regEx2.def.source + '(.*)', 'gi'),
		mat: new RegExp(regEx2.mat.source + '(.*)', 'gi'),
		mdf: new RegExp(regEx2.mdf.source + '(.*)', 'gi'),
		agi: new RegExp(regEx2.agi.source + '(.*)', 'gi'),
		luk: new RegExp(regEx2.luk.source + '(.*)', 'gi'),
		price: new RegExp(regEx2.price.source + '(.*)', 'gi'),
		exp: new RegExp(regEx2.exp.source + '(.*)', 'gi')
	};
	
	for(let n = 1; n < group.length; n++) {
		let obj = group[n];
		let notedata = obj.note.split(/[\r\n]+/);

		obj.equipParamFormula = [
			dingk.EL.HPFormula.replace(regEx2.hp, 'hp'),
			dingk.EL.MPFormula.replace(regEx2.mp, 'mp'),
			dingk.EL.ATKFormula.replace(regEx2.atk, 'atk'),
			dingk.EL.DEFFormula.replace(regEx2.def, 'def'),
			dingk.EL.MATFormula.replace(regEx2.mat, 'mat'),
			dingk.EL.MDFFormula.replace(regEx2.mdf, 'mdf'),
			dingk.EL.AGIFormula.replace(regEx2.agi, 'agi'),
			dingk.EL.LUKFormula.replace(regEx2.luk, 'luk'),
			dingk.EL.PriceFormula.replace(regEx2.price, 'price'),
			dingk.EL.EXPFormula.replace(regEx2.exp, 'exp')
		];

		obj.equipParamFlat = [ '', '', '', '', '', '', '', '', '', '' ];
		obj._level = 0;
		obj.dropLevel = 0;
		obj.exp = 0;
		obj.maxLevel = dingk.EL.MaxLevel;
		obj.displayLevel = dingk.EL.DisplayLevel;
		obj.allowEnhancement = dingk.EL.EnhanceType !== dingk.EL.ENHANCE_DISABLED;
		obj.overrideTextColor = false;
		obj.fodderTypes = [];
		obj.tierUpgradeData = {};
		obj.onLevelEval = '';
		obj.onTierEval = '';
		obj.levelConditionEval = '';
		obj.tierConditionEval = '';
		obj.equipFormulaEval = '';
		
		Object.defineProperty(obj, 'level', {
			get() {
				if (!DataManager.isIndependent(this)) return 0;
				return this._level;
			},
			set(level) {
				this._level = level;
			}
		});
		
		let mode = '';
		let evalParam = 0;
		let tierUpgrade = 0;

		for (let note of notedata) {
			let result;
			
			if (regExEnd.some(r => note.match(r))) {
				mode = '';
				evalParam = 0;
			}
			// <Drop Level: value>
			else if ([, result] = note.match(regEx[0]) || '') {
				let val = Math.min(Number(result), obj.maxLevel);
				obj.level = val;
				obj.dropLevel = val;
			}
			// <Max Level: value>
			else if ([, result] = note.match(regEx[1]) || '') {
				obj.maxLevel = Math.max(Number(result), 1);
			}
			// <Cannot Level>
			else if (note.match(regEx[2])) {
				obj.allowEnhancement = false;
			}
			// <Display Level: bool>
			else if ([, result] = note.match(regEx[3]) || '') {
				obj.displayLevel = result.toUpperCase() === 'TRUE';
			}
			// <Equip stat Formula: code>
			else if ([, ...result] = note.match(regEx[4]) || '') {
				let param = result[0].toUpperCase().trim();
				let formula = dingk.EL.reformat(result[1], regEx2);
				if (param.match(regEx2.hp)) {
					obj.equipParamFormula[0] = 'hp = ' + formula;
				} else if (param.match(regEx2.mp)) {
					obj.equipParamFormula[1] = 'mp = ' + formula;
				} else if (param.match(regEx2.atk)) {
					obj.equipParamFormula[2] = 'atk = ' + formula;
				} else if (param.match(regEx2.def)) {
					obj.equipParamFormula[3] = 'def = ' + formula;
				} else if (param.match(regEx2.mat)) {
					obj.equipParamFormula[4] = 'mat = ' + formula;
				} else if (param.match(regEx2.mdf)) {
					obj.equipParamFormula[5] = 'mdf = ' + formula;
				} else if (param.match(regEx2.agi)) {
					obj.equipParamFormula[6] = 'agi = ' + formula;
				} else if (param.match(regEx2.luk)) {
					obj.equipParamFormula[7] = 'luk = ' + formula;
				} else if (param.match(regEx2.price)) {
					obj.equipParamFormula[8] = 'price = ' + formula;
				} else if (param.match(regEx2.exp))
					obj.equipParamFormula[9] = 'exp = ' + formula;
			} else if (note.match(/<EQUIP FORMULAS>/i)) {
				mode = 'equip custom formula';
			}
			// <Fodder Type: types>
			else if ([, result] = note.match(regEx[5]) || '') {
				let types = result.split(/\s*,\s*/)
				obj.fodderTypes = types.map(el => el.toUpperCase());
			}
			// <Trait i Unlock Level n> <Trait i Unlock Tier n>
			else if ([, ...result] = note.match(regEx[6]) || '') {
				if (obj.traits[result[0]]) {
					let range = [Number(result[2])];
					if (result[1].toLowerCase() === 'level') {
						range.push(Number(result[3] || obj.maxLevel));
						obj.traits[result[0]].levelUnlock = range.sort((a, el) => a - el);
						obj.traits[result[0]].levelLocked = true;
					} else {
						range.push(Number(result[3] || obj.maxTier));
						obj.traits[result[0]].tierUnlock = range.sort((a, el) => a - el);
						obj.traits[result[0]].tierLocked = true;
					}
				}
			}
			// <Tier n Upgrade>
			else if ([, result] = note.match(regEx[7]) || '') {
				mode = 'upgrade';
				tierUpgrade = Number(result);
				obj.tierUpgradeData[tierUpgrade] = { cost: 0, mats: [] };
			}
			// <On Level Eval> <On Tier Eval>
			else if ([, result] = note.match(regEx[8]) || '') {
				mode = result.toLowerCase();
			}
			// <Level Condition Eval> <Tier Condition Eval>
			else if ([, result] = note.match(regEx[9]) || '') {
				mode = result.toLowerCase() + ' condition eval';
			}
			// <Equip param Formula Eval>
			else if (note.match(regEx[10]) || '') {
				mode = 'equip formula eval';
				obj.equipFormulaEval = '';
				//evalParam = dingk.EL.ParamIds[dingk.EL.reformat(result, regEx2)];
				//obj.equipParamFormula[evalParam] = '';
			}
			// MODES
			else if (mode === 'equip custom formula') {
				if ([, result] = regEx3.hp.exec(note) || '') {
					obj.equipParamFormula[0] = 'hp'    + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.mp.exec(note) || '') {
					obj.equipParamFormula[1] = 'mp'    + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.atk.exec(note) || '') {
					obj.equipParamFormula[2] = 'atk'   + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.def.exec(note) || '') {
					obj.equipParamFormula[3] = 'def'   + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.mat.exec(note) || '') {
					obj.equipParamFormula[4] = 'mat'   + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.mdf.exec(note) || '') {
					obj.equipParamFormula[5] = 'mdf'   + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.agi.exec(note) || '') {
					obj.equipParamFormula[6] = 'agi'   + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.luk.exec(note) || '') {
					obj.equipParamFormula[7] = 'luk'   + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.price.exec(note) || '') {
					obj.equipParamFormula[8] = 'price' + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.exp.exec(note) || '') {
					obj.equipParamFormula[9] = 'exp'   + dingk.EL.reformat(result, regEx2);
				}
			} else if (mode === 'equip formula eval') {
				obj.equipFormulaEval += note + '\n';
			} else if (mode === 'upgrade') {
				this.addTierMaterial(obj, note, tierUpgrade);
			} else if (mode === 'level') {
				obj.onLevelEval += note + '\n';
			} else if (mode === 'tier') {
				obj.onTierEval += note + '\n';
			} else if (mode === 'level condition eval') {
				obj.levelConditionEval += note + '\n';
			} else if (mode === 'tier condition eval') {
				obj.tierConditionEval += note + '\n';
			}
		}
	}
};

/**  Parse enemy notetags */
DataManager.process_dingk_EquipLevels_notetagsEnemies = function() {
	let regEx = [
		/<DROP LEVEL:\s*(\d+)\s*-?\s*(\d+)?/i,
		/<NO RANDOM TIER>/i
	];
	
	for (let n = 1; n < $dataEnemies.length; n++) {
		let obj = $dataEnemies[n];
		let notedata = obj.note.split(/[\r\n]+/);
		
		obj.dropLevels = [];
		obj.allowRandomTier = true;
		
		for (let i = 0; i < notedata.length; i++) {
			let note = notedata[i];
			let result;
			
			if ([, result] = note.match(regEx[0]) || '') {
				obj.dropLevels.push(Number(result[0]));
				if (result[1]) {
					obj.dropLevels.push(Number(result[1]));
				} else {
					obj.dropLevels.push(Number(result[0]));
				}
			} else if (note.match(regEx[1])) {
				obj.allowRandomTier = false;
			}
		}
	}
};

/**
 * Process/add tier upgrade data
 * @param {Object} obj - The current database object
 * @param {String} note - The current note line
 * @param {Number} tier - The equipment's current tier
 */
DataManager.addTierMaterial = function(obj, note, tier) {
	let result, mat = {};
	let kinds = { item: 0, weapon: 1, armor: 2 };
	if ([, result] = note.match(/GOLD:\s*(\d+)/i) || '') {
		obj.tierUpgradeData[tier].cost = Number(result);
	} else if ([, ...result] = note.match(/(ITEM|WEAPON|ARMOR)\s*(\d+):?\s*(\d+)?/i) || '') {
		mat.id = Number(result[1]);
		mat.kind = kinds[result[0].toLowerCase()];
		mat.count = result[2] ? Number(result[2]) : 1;
	} else {
		result = note.split(':');
		if (mat.id = dingk.ItemIds[result[0]]) {
			mat.kind = kinds.item;
		} else if (mat.id = dingk.WeaponIds[result[0]]) {
			mat.kind = kinds.weapon;
		} else if (mat.id = dingk.ArmorIds[result[0]]) {
			mat.kind = kinds.armor;
		} else {
			console.error(dingk.EL.ERR_MAT(result[0]));
			return;
		}
		mat.count = result[1] ? Number(result[1]) : 1;
	}
	try {
		let item;
		switch (mat.kind) {
			case kinds.item:
				if (!(item = $dataItems[mat.id])) throw dingk.EL.ERR_MAT(mat.id, mat.kind);
				break;
			case kinds.weapon:
				if (!(item = $dataWeapons[mat.id])) throw dingk.EL.ERR_MAT(mat.id, mat.kind);
				break;
			case kinds.armor:
				if (!(item = $dataArmors[mat.id])) throw dingk.EL.ERR_MAT(mat.id, mat.kind);
				break;
		}
		obj.tierUpgradeData[tier].mats.push(mat);
	} catch (error) {
		console.error(error);
	}
};

/**
 * Update equipment parameters after customizing new independent item
 * @param {Object} baseItem - The base item
 * @param {Object} newItem - The independent item
 */
dingk.EL.DM_addNewIndependentItem = DataManager.addNewIndependentItem;
DataManager.addNewIndependentItem = function(baseItem, newItem) {
	dingk.EL.DM_addNewIndependentItem.call(this, baseItem, newItem);
	ItemManager.setEquipParameters(baseItem, newItem);
	ItemManager.setLevel(newItem);
	//ItemManager.itemChangeExp(newItem, ItemManager.itemCurrentLevelExp(newItem));
};

dingk.EL.DM_getBaseItem = DataManager.getBaseItem;
DataManager.getBaseItem = function(item) {
	if (item.isDisplay) {
		return item.database[item.baseItemId];
	}
	return dingk.EL.DM_getBaseItem.call(this, item);
};

//--------------------------------------------------------------------------------------------------
// BattleManager
//--------------------------------------------------------------------------------------------------

/** If enabled, give equipment EXP from battles. */
dingk.EL.BattleManager_gainExp = BattleManager.gainExp;
BattleManager.gainExp = function() {
	dingk.EL.BattleManager_gainExp.call(this);
	if ($gameSystem.isEnhanceTypeBattle()) {
		let exp = this._rewards.exp;
		for (let actor of $gameParty.allMembers()) {
			for (let equip of actor.equips()) {
				if (equip) {
					exp *= actor.finalExpRate() * dingk.EL.BattleExpRate;
					ItemManager.itemGainExp(equip, Math.round(exp));
				}
			}
		}
	}
};

//--------------------------------------------------------------------------------------------------
// ItemManager
//--------------------------------------------------------------------------------------------------

/**
 * Update equipment parameters
 * @param {Object} baseItem - The base item
 * @param {Object} newItem - The independent item
 */
ItemManager.setEquipParameters = function(baseItem, newItem) {
	if (!baseItem.params) return;
	if (newItem.level === undefined) {
		Object.defineProperty(newItem, 'level', {
			get() {
				if (!DataManager.isIndependent(this) && !this.isDisplay) return 0;
				return this._level;
			},
			set(level) {
				this._level = level;
			}
		});
		newItem._level = this.getLevel();
	}
	if (newItem.tier === undefined) newItem.tier = 0;
	
	let s = $gameSwitches._data;
	let v = $gameVariables._data;
	let item = newItem;
	let hp = baseItem.params[0];
	let mp = baseItem.params[1];
	let atk = baseItem.params[2];
	let def = baseItem.params[3];
	let mat = baseItem.params[4];
	let mdf = baseItem.params[5];
	let agi = baseItem.params[6];
	let luk = baseItem.params[7];
	let price = baseItem.price;
	let level = item.level;
	let tier = item.tier;
	let exp = 0;
	
	try {
		for (let i = 0; i < 10; i++) {
			eval(item.equipParamFormula[i]);
		}
		if (item.equipFormulaEval) {
			eval(item.equipFormulaEval);
		}
	} catch (error) {
		console.error('EQUIP FORMULA ERROR:', error);
	}
	
	item.params[0] = Math.round(hp);
	item.params[1] = Math.round(mp);
	item.params[2] = Math.round(atk);
	item.params[3] = Math.round(def);
	item.params[4] = Math.round(mat);
	item.params[5] = Math.round(mdf);
	item.params[6] = Math.round(agi);
	item.params[7] = Math.round(luk);
	item.price = Math.round(price);

	this.updateItemName(item);
	this.updateTraits(item);
};

/**
 * Return equipment parameters
 * @param {Object} item - The equipment to extract parameters from
 * @param {Number} level - The desired level of the equipment
 * @param {Number} tier - The desired tier of the equipment
 * @return {Array} List of the parameters calculated at the desired level/tier
 */
ItemManager.getEquipParameters = function(item, level = this.getLevel(), tier = item.tier) {
	if (!item) return;
	
	level = Math.min(level, item.maxLevel);
	
	let baseItem = DataManager.getBaseItem(item);
	let params = [];
	let hp = baseItem.params[0];
	let mp = baseItem.params[1];
	let atk = baseItem.params[2];
	let def = baseItem.params[3];
	let mat = baseItem.params[4];
	let mdf = baseItem.params[5];
	let agi = baseItem.params[6];
	let luk = baseItem.params[7];
	let price = baseItem.price;
	let exp = 0;
	
	try {
		for (let i = 0; i < 10; i++) {
			eval(item.equipParamFormula[i]);
		}
		if (item.equipFormulaEval) {
			eval(item.equipFormulaEval);
		}
	} catch (error) {
		console.error('EQUIP FORMULA ERROR', error);
	}
	
	params.push(Math.round(hp));
	params.push(Math.round(mp));
	params.push(Math.round(atk));
	params.push(Math.round(def));
	params.push(Math.round(mat));
	params.push(Math.round(mdf));
	params.push(Math.round(agi));
	params.push(Math.round(luk));
	params.push(Math.round(price));
	params.push(Math.round(exp));
	
	return params;
};

/**
 * Update item name with level
 * @param {Object} item - The independent item
 */
dingk.EL.ItemManager_updateItemName = ItemManager.updateItemName;
ItemManager.updateItemName = function(item) {
	dingk.EL.ItemManager_updateItemName.call(this, item);
	if (item.displayLevel && item.level > 0) {
		let fmt = dingk.EL.DisplayFmt;
		if (fmt) item.name = fmt.format(item.name, item.level);
	}
};

/**
 * Update traits on level.
 * @param {Object} item - The independent item
 */
ItemManager.updateTraits = function(item) {
	for (let trait of item.traits) {
		if (trait.unlockLevel) {
			trait.levelLocked = item.level >= trait.unlockLevel[0] && 
			                    item.level <= trait.unlockLevel[1];
		}
		if (trait.unlockTier) {
			trait.tierLocked = item.tier >= trait.unlockTier[0] && 
			                   item.tier <= trait.unlockTier[1];
		}
	}
};

/**
 * Registe
 r new independent item and set its level
 * @param {Object} item - The base item
 * @param {Number} level - The level of the item
 * @return {Object} The new independent item
 */
ItemManager.registerEquipLevel = function(item, level) {
	if (!DataManager.isIndependent(item)) return item;
	let newItem = DataManager.registerNewItem(item);
	this.setLevel(newItem, level);
	return newItem;
};

/**
 * Return the level of the equipment when initialized
 * @return {Number} Level
 */
ItemManager.getLevel = function() {
	if (SceneManager._scene instanceof Scene_Title) return 1;
	switch (dingk.EL.itemDropLevelType) {
		case 1:
			return $gameParty.highestLevel() || 1;
		case 2:
			return $gameParty.lowestLevel() || 1;
		case 3:
			return $gameParty.averageLevel() || 1;
	}

	return 1;
};

/**
 * Set the level of the equipment
 * @param {Object} item - The independent item
 * @param {Number} level - The level of the item
 */
ItemManager.setLevel = function(item, level = this.getLevel(), allowVariance = true) {
	if (!item || DataManager.isItem(item)) return;
	if (allowVariance) this.setLevelVariance(item);
	item.level = level.clamp(1, item.maxLevel);
	this.setEquipParameters(DataManager.getBaseItem(item), item);
	item.exp = this.itemCurrentLevelExp(item);
};

/**
 * Apply a level variance to the equipment.
 * @param {Object} item - The independent item
 */
ItemManager.setLevelVariance = function(item) {
	if (!item || !dingk.EL.EnableLevelVariance) return;
	if (dingk.EL.LevelVarianceSafe && ItemManager.isMaxLevel(item)) return;
	let max = Number(dingk.EL.LevelVarianceUp);
	let min = Number(dingk.EL.LevelVarianceDown) * -1;
	item.level = dingk.EL.randomInt(min, max);
	item.level = item.level.clamp(1, item.maxLevel);
};

/**
 * Return EXP required to level up the equipment at the specified level
 * @param {Object} item - The independent item
 * @param {Number} level - The level of the equipment
 * @return {Number} The EXP required to level up the equipment
 */
ItemManager.itemExpForLevel = function(item, level) {
	
	let formula = item.equipParamFormula[9];
	let exp = 0;
	try {
		eval(formula);
	} catch (error) {
		console.error("EXP FORMULA ERROR:", formula);
		console.error(error);
		return 0;
	}
	//let exp = ItemManager.getEquipParameters(item, level)[9];
	//console.log(exp);
	return exp;
};

/**
 * Return EXP required to level up at its current level
 * @param {Object} item - The independent item
 * @return {Number} EXP required to level up
 */
ItemManager.itemNextLevelExp = function(item) {
	return this.itemExpForLevel(item, item.level);
};

/**
 * Return minimum EXP at the equipment's current level
 * @param {Object} item - The independent item
 * @return {Number} Minimum EXP at the equipment's current level
 */
ItemManager.itemCurrentLevelExp = function(item) {
	return this.itemExpForLevel(item, item.level - 1);
};

/**
 * Return EXP needed to gain to level up equipment
 * @param {Object} item - The independent item
 * @return {Number} Amount of EXP needed to gain to level up
 */
ItemManager.itemNextRequiredExp = function(item) {
	return this.itemNextLevelExp(item) - item.exp;
};

/**
 * Set equipment EXP to the specified amount
 * @param {Object} item - The independent item
 * @param {Number} exp - The desired EXP
 */
ItemManager.itemChangeExp = function(item, exp) {
	item.exp = exp.clamp(0, this.itemExpForLevel(item, item.maxLevel));
	
	while (item.level < item.maxLevel && 
		   item.exp >= this.itemNextLevelExp(item)) {
		this.itemLevelUp(item);
	}
	
	while (item.exp < this.itemCurrentLevelExp(item)) {
		this.itemLevelDown(item);
	}
};

/**
 * Level up the equipment
 * @param {Object} item - The independent item
 */
ItemManager.itemLevelUp = function(item) {
	item.level++;
	this.onLevelEval(item);
	this.setEquipParameters(DataManager.getBaseItem(item), item);
};

/**
 * Level up the equipment
 * @param {Object} item - The independent item
 */
ItemManager.itemLevelDown = function(item) {
	item.level--;
	this.onLevelEval(item);
	this.setEquipParameters(DataManager.getBaseItem(item), item);
};

/**
 * Give the equipment some EXP
 * @param {Object} item - The independent item
 * @param {Number} exp - The desired amount of EXP
 */
ItemManager.itemGainExp = function(item, exp) {
	this.itemChangeExp(item, item.exp + Math.round(exp));
};

/**
 * Return the level given the EXP
 * @param {Object} item - The independent item
 * @param {Number} exp - The desired EXP
 * @return {Number} The level at the specified EXP
 */
ItemManager.getNextItemLevel = function(item, exp) {
	let newExp = Math.round(item.exp + exp);
	let level = item.level;
	for (; newExp >= this.itemExpForLevel(item, level); level++) {}
	
	return Math.min(level, item.maxLevel);
};

/**
 * Check if item is max level
 * @param {Object} item - The independent item
 * @return {Boolean} Whether the item is max level or not
 */
ItemManager.isMaxLevel = function(item) {
	return item.level >= item.maxLevel;
};

/**
 * Set the tier of the equipment
 * @param {Object} item - The independent item
 * @param {Number} tier - The desired tier
 */
ItemManager.setTier = function(item, tier) {
	if (!DataManager.isIndependent(item)) return;
	item.tier = Math.round(tier).clamp(0, item.maxTier);
	this.onTierEval(item);
	this.setEquipParameters(DataManager.getBaseItem(item), item);
};

/**
 * Increase tier of the equipment
 * @param {Object} item - The independent item
 */
ItemManager.itemTierUp = function(item) {
	this.setTier(item, item.tier + 1);
};

/**
 * Decrease tier of the equipment
 * @param {Object} item - The independent item
 */
ItemManager.itemTierDown = function(item) {
	this.setTier(item, item.tier - 1);
};

/**
 * Randomize the tier of the equipment
 * @param {Object} item - The independent item
 */
ItemManager.setRandomTier = function(item) {
	let totalWeight = 0;
	let minTier = item.tier;
	for (let i = minTier; i < item.maxTier; i++) {
		totalWeight += dingk.EL.Tiers[i].weight;
	}
	let randWeight = Math.random() * totalWeight;
	let accWeight = 0;
	for (let i = minTier; i < dingk.EL.Tiers.length; i++) {
		accWeight += dingk.EL.Tiers[i].weight;
		if (randWeight < accWeight) {
			this.setTier(item, i);
			break;
		}
	}
};

/**
 * Run onLevelEval code.
 * @param {Object} item - The item on level
 */
ItemManager.onLevelEval = function(item) {
	if (!item.onLevelEval) return;
	let s = $gameSwitches._data;
	let v = $gameVariables._data;
	try {
		eval(item.onLevelEval);
	} catch (error) {
		console.error('ON LEVEL EVAL ERROR:', error);
	}
};

/**
 * Run onTierEval code.
 * @param {Object} item - The item on level
 */
ItemManager.onTierEval = function(item) {
	if (!item.onTierEval) return;
	let s = $gameSwitches._data;
	let v = $gameVariables._data;
	try {
		eval(item.onTierEval);
	} catch (error) {
		console.error('ON LEVEL EVAL ERROR:', error);
	}
};

/**
 * Run level condition code.
 * @param {Object} item - The item that's being leveled
 * @return {boolean} Result of the code
 */
ItemManager.levelConditionEval = function(item) {
	if (!item.level) return false;
	let s = $gameSwitches._data;
	let v = $gameVariables._data;
	let result;
	try {
		result = !!eval(item.levelConditionEval);
	} catch (error) {
		console.error('LEVEL CONDITION EVAL ERROR:', error);
		return false;
	}
	return result;
};

/**
 * Run tier condition code.
 * @param {Object} item - The item that's being upgraded
 * @return {boolean} Result of the code
 */
ItemManager.tierConditionEval = function(item) {
	if (!item.tierUpgradeData) return false;
	if (!item.tierUpgradeData[item.tier]) return false;
	if (!item.tierConditionEval) return true;
	let s = $gameSwitches._data;
	let v = $gameVariables._data;
	let result;
	try {
		result = !!eval(item.tierConditionEval);
	} catch (error) {
		console.error('TIER CONDITION EVAL ERROR:', error);
		return false;
	}
	return result;
};

/**
 * Check if item meets the material and cost requirements to upgrade
 * @param {Object} item - The equip to be upgraded
 * @return {boolean} True if meets requirements
 */
ItemManager.canUpgrade = function(item) {
	if (!item) return false;
	if (!this.tierConditionEval(item)) return false;
	let data = item.tierUpgradeData[item.tier];
	if (data.cost > $gameParty.gold()) return false;
	for (let mat of data.mats) {
		let item = dingk.EL.getDatabase(mat.kind)[mat.id];
		if (mat.count > $gameParty.numItems(item)) return false;
	}
	return true;
};

/**
 * Swap out base items with their new independent items and set their levels
 * @param {Array} good - Item of the shop good
 * @return {Array} New independent item
 */
ItemManager.processIndependentGoods = function(good) {
	let itemType = good[0];
	let itemId = good[1];
	let baseItem = null;
	let newItem = null;
	let itemLevel = 0;
	switch(itemType) {
		case 0:
			baseItem = $dataItems[itemId];
			break;
		case 1:
			baseItem = $dataWeapons[itemId];
			break;
		case 2:
			baseItem = $dataArmors[itemId];
			break;
		default:
			return good;
	}
	if (!DataManager.isIndependent(baseItem))
		return good;

	itemLevel = this.getLevel();

	if (good[4] > 0)
		itemLevel = good[4];
	newItem = DataManager.registerNewItem(baseItem);
	ItemManager.setLevel(newItem, itemLevel);
	good[1] = newItem.id;
	return good;
};

//--------------------------------------------------------------------------------------------------
// Game_System
//--------------------------------------------------------------------------------------------------

dingk.EL.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	dingk.EL.Game_System_initialize.call(this);
	this.initEquipLevels();
};

Game_System.prototype.initEquipLevels = function() {
	this._enhanceType = dingk.EL.EnhanceType;
	this._enableTierUpgrade = dingk.EL.EnableUpgrade;
};

/**
 * Return whether or not equipment enhance type is fodder type
 * @return {Boolean} true if fodder type
 */
Game_System.prototype.isEnhanceTypeFodder = function() {
	let arr = [dingk.EL.ENHANCE_TYPE_ALL, dingk.EL.ENHANCE_TYPE_FODDER];
	return arr.includes(this._enhanceType);
};

/**
 * Return whether or not equipment enhance type is battle type
 * @return {Boolean} true if battle type
 */
Game_System.prototype.isEnhanceTypeBattle = function() {
	let arr = [dingk.EL.ENHANCE_TYPE_ALL, dingk.EL.ENHANCE_TYPE_BATTLE];
	return arr.includes(this._enhanceType);
};

/**
 * Set equipment enhance type.
 * @param {Number} type
 */
Game_System.prototype.changeEnhanceType = function(type) {
	this._enhanceType = type.clamp(dingk.EL.ENHANCE_DISABLED, dingk.EL.ENHANCE_TYPE_ALL);
};

/**
 * Return whether or not can upgrade through item menu.
 * @return {boolean} True if can upgrade
 */
Game_System.prototype.isTierUpgradeEnabled = function() {
	return this._enableTierUpgrade;
};

//--------------------------------------------------------------------------------------------------
// Game_Actor
//--------------------------------------------------------------------------------------------------

/**
 * If equipment level too high, return negative performance score. Otherwise, use default.
 * @param {Object} item - The equipment
 * @return {Number} The performance value
 */
dingk.EL.GA_calcEquipItemPerformance = Game_Actor.prototype.calcEquipItemPerformance;
Game_Actor.prototype.calcEquipItemPerformance = function(item) {
	if (dingk.EL.LevelRestrict && item.level > this.level) {
		return -1000;
	}
	return dingk.EL.GA_calcEquipItemPerformance.call(this, item);
};

//--------------------------------------------------------------------------------------------------
// Game_BattlerBase
//--------------------------------------------------------------------------------------------------

/**
 * Return a list of all traits of this battler. Determine if trait is level-locked.
 * @return {Array} List of all traits
 */
Game_BattlerBase.prototype.allTraits = function() {
	return this.traitObjects().reduce(function(r, obj) {
		let traits = [];
		for (let trait of obj.traits) {
			if (trait.levelLocked || trait.tierLocked) continue;
			traits.push(trait);
		}
		return r.concat(traits);
	}, []);
};

//--------------------------------------------------------------------------------------------------
// Game_Enemy
//--------------------------------------------------------------------------------------------------

/**
 * Convert dropped equipment to independent items and set the appropriate levels
 * @param {Number} kind
 * @param {Number} dataId
 * @return {Object} New independent item
 */
dingk.EL.GE_itemObject = Game_Enemy.prototype.itemObject;
Game_Enemy.prototype.itemObject = function(kind, dataId) {
	let baseItem = dingk.EL.GE_itemObject.call(this, kind, dataId);
	if (!DataManager.isIndependent(baseItem)) return baseItem;
	let newItem = DataManager.registerNewItem(baseItem);
	let enemy = $dataEnemies[this._enemyId];
	if (enemy.dropLevels.length) {
		let level = dingk.EL.randomInt(enemy.dropLevels[0], enemy.dropLevels[1]);
		ItemManager.setLevel(newItem, level);
	} else if (Imported.YEP_EnemyLevels && dingk.EL.enableEnemyLevels) {
		ItemManager.setLevel(newItem, this.level);
	} else {
		ItemManager.setLevel(newItem);
	}
	
	if (enemy.allowRandomTier) {
		ItemManager.setRandomTier(newItem);
	}
	
	return newItem;
};

//--------------------------------------------------------------------------------------------------
// Game_Interpreter
//--------------------------------------------------------------------------------------------------

/**
 * Plugin commands for custom equipment
 * @param {String} command
 * @param {Array} args
 */
dingk.EL.GI_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	dingk.EL.GI_pluginCommand.call(this, command, args);
	// ItemDropLevel min to max
	if (command.toUpperCase().trim() === 'ITEMDROPLEVEL') {
		let min = Number(args[0] || ItemManager.getLevel());
		let max = Number(args[1] || min);
		$gameTemp.itemDropLevel = [];
		$gameTemp.itemDropLevel.push(min);
		$gameTemp.itemDropLevel.push(max);
	}
	// GiveCustomWeapon id level tier
	else if (command.toUpperCase().trim() === 'GIVECUSTOMWEAPON') {
		let itemId = Number(args[0]);
		let itemLevel = Number(args[1]);
		let itemTier = Number(args[2]);
		let baseItem = $dataWeapons[itemId];
		if (!DataManager.isIndependent(baseItem)) $gameParty.gainItem(baseItem);
		else {
			let newItem = DataManager.registerNewItem(baseItem);
			if (itemLevel) ItemManager.setLevel(newItem, itemLevel);
			if (itemTier)  {
				ItemManager.setTier(newItem, itemTier);
			} else {
				ItemManager.setEquipParameters(baseItem, newItem);
			}
			$gameParty.registerNewItem(baseItem, newItem);
		}
	}
	// GiveCustomArmor id level tier
	else if (command.toUpperCase().trim() === 'GIVECUSTOMARMOR') {
		let itemId = Number(args[0]);
		let itemLevel = Number(args[1]);
		let itemTier = Number(args[2]);
		let baseItem = $dataArmors[itemId];
		if (!DataManager.isIndependent(baseItem)) $gameParty.gainItem(baseItem);
		else {
			let newItem = DataManager.registerNewItem(baseItem);
			if (itemLevel) ItemManager.setLevel(newItem, itemLevel);
			if (itemTier)  {
				ItemManager.setTier(newItem, itemTier);
			} else {
				ItemManager.setEquipParameters(baseItem, newItem);
			}
			$gameParty.registerNewItem(baseItem, newItem);
		}
	}
	// OpenEquipEnhance
	else if (command.match(/(?:Open|Show)EquipEnhance/i)) {
		if (args && args.length) {
			$gameTemp._enhanceCat = [];
			for (let category of args) {
				$gameTemp._enhanceCat.push(category);
			}
		}
		SceneManager.push(Scene_Enhance);
	}
	// OpenEquipUpgrade
	else if (command.match(/(?:Open|Show)EquipUpgrade/i)) {
		if (args && args.length) {
			$gameTemp._enhanceCat = [];
			for (let category of args) {
				$gameTemp._enhanceCat.push(category);
			}
		}
		SceneManager.push(Scene_Upgrade);
	}
};

//--------------------------------------------------------------------------------------------------
// Game_Party
//--------------------------------------------------------------------------------------------------

/**
 * Return the level of the lowest level party member
 * @return {Number} Lowest level
 */
Game_Party.prototype.lowestLevel = function() {
	return Math.min.apply(null, this.members().map(({level}) => level));
};

/**
 * Return the average level of the party
 * @return {Number} Average level
 */
Game_Party.prototype.averageLevel = function() {
	let members = this.members();
	return members.reduce((a, {level}) => a + level, 0) / members.length;
};
/*
dingk.EL.GP_indepItemSort = Game_Party.prototype.independentItemSort;
Game_Party.prototype.independentItemSort = function(a, b) {
	let result = dingk.EL.GP_indepItemSort.call(this, a, b);
	if (result === 1) {
		if (a.level > b.level) return 1;
		else return -1;
	}
	return 0;
};*/

//--------------------------------------------------------------------------------------------------
// Scene_Item
//--------------------------------------------------------------------------------------------------

/** Create windows */
dingk.EL.SI_create = Scene_Item.prototype.create;
Scene_Item.prototype.create = function() {
	dingk.EL.SI_create.call(this);
	this.createItemEnhanceInfoWindow();
	this.createItemEnhanceListWindow();
	this.createEquipUpgradeInfoWindow();
	this.createEquipUpgradeConfirmWindow();
};

/** Create the window for list of item fodders */
Scene_Item.prototype.createItemEnhanceListWindow = function() {
	let x = this._itemWindow.x;
	let y = this._itemWindow.y;
	let w = this._itemWindow.width;
	let h = this._itemWindow.height;
	this._itemEnhanceListWindow = new Window_ItemEnhanceList(x, y, w, h);
	this._itemEnhanceListWindow.setHelpWindow(this._helpWindow);
	this._itemEnhanceListWindow.setInfoWindow(this._itemEnhanceInfoWindow);
	this.addWindow(this._itemEnhanceListWindow);
	this._itemEnhanceListWindow.setHandler('cancel', this.onItemEnhanceListCancel.bind(this));
	this._itemEnhanceListWindow.setHandler('ok', this.onItemEnhanceListOk.bind(this));
};

/** Create info window for enhancing items */
Scene_Item.prototype.createItemEnhanceInfoWindow = function() {
	let x = this._itemWindow.width;
	let y = this._itemWindow.y;
	let w = Graphics.boxWidth - x;
	let h = this._itemWindow.height;
	this._itemEnhanceInfoWindow = new Window_ItemEnhanceInfo(x, y, w, h);
	this.addWindow(this._itemEnhanceInfoWindow);
};

Scene_Item.prototype.createEquipUpgradeInfoWindow = function() {
	let x = this._itemWindow.width;
	let y = this._itemWindow.y;
	let w = Graphics.boxWidth - x;
	let h = this._itemWindow.height;
	this._equipUpgradeInfoWindow = new Window_EquipUpgradeInfo(x, y, w, h);
	this.addWindow(this._equipUpgradeInfoWindow);
};

/** Create confirmation window for upgrading equipment */
Scene_Item.prototype.createEquipUpgradeConfirmWindow = function() {
	this._equipUpgradeConfirmWindow = new Window_EquipUpgradeConfirm();
	this._equipUpgradeConfirmWindow.setHandler('confirm', this.onEquipUpgradeOk.bind(this));
	this._equipUpgradeConfirmWindow.setHandler('cancel', this.onEquipUpgradeCancel.bind(this));
	this.addWindow(this._equipUpgradeConfirmWindow);
};

/** Add action for enhance command */
dingk.EL.SI_createActionWindow = Scene_Item.prototype.createActionWindow;
Scene_Item.prototype.createActionWindow = function() {
	dingk.EL.SI_createActionWindow.call(this);
	this._itemActionWindow.setHandler('enhance', this.onActionItemEnhance.bind(this));
	this._itemActionWindow.setHandler('tier_upgrade', this.onActionEquipUpgrade.bind(this));
};

dingk.EL.SI_onActionCancel = Scene_Item.prototype.onActionCancel;
Scene_Item.prototype.onActionCancel = function() {
	dingk.EL.SI_onActionCancel.call(this);
	this._itemEnhanceInfoWindow.hide();
	this._equipUpgradeInfoWindow.hide();
};

/** Action for enhance command */
Scene_Item.prototype.onActionItemEnhance = function() {
	this._itemActionWindow.hide();
	this._itemActionWindow.deactivate();
	this._infoWindow.hide();
	this._itemEnhanceInfoWindow.refresh();
	this._itemWindow.hide();
	this._itemEnhanceListWindow.show();
	this._itemEnhanceListWindow.activate();
	this._itemEnhanceListWindow.setItem(this.item());
	this._itemEnhanceListWindow.select(0);
};

/** Action for tier upgrade command */
Scene_Item.prototype.onActionEquipUpgrade = function() {
	let item = this._itemActionWindow._item;
	this._equipUpgradeConfirmWindow.setItem(item);
	this._equipUpgradeConfirmWindow.open();
	this._equipUpgradeConfirmWindow.activate();
	this._equipUpgradeConfirmWindow.select(0);
};

/** Action for canceling enhance */
Scene_Item.prototype.onItemEnhanceListCancel = function() {
	this._itemEnhanceListWindow.hide();
	this._itemEnhanceListWindow.deactivate();
	this._itemEnhanceInfoWindow.setFodderExp(0);
	this._itemWindow.show();
	this._itemWindow.refresh();
	this._infoWindow.show();
	this._infoWindow.refresh();
	this._statusWindow.refresh();
	this._itemActionWindow.show();
	this._itemActionWindow.activate();
	this._itemActionWindow.refresh();
	this._helpWindow.setItem(this.item());
};

/** Action on confirming fodder */
Scene_Item.prototype.onItemEnhanceListOk = function() {
	let enhanceItem = this._itemEnhanceListWindow.item();
	if (enhanceItem) {
		ItemManager.itemGainExp(this.item(), enhanceItem.fodderExp);
	}
	$gameParty.consumeItem(enhanceItem);
	if (ItemManager.isMaxLevel(this.item())) {
		this.onItemEnhanceListCancel();
		return;
	}
	this._itemEnhanceListWindow.refresh();
	this._itemEnhanceListWindow.activate();
	//this._infoWindow.refresh();
	this._statusWindow.refresh();
	this._itemEnhanceInfoWindow.refresh();
};

Scene_Item.prototype.onEquipUpgradeCancel = function() {
	this._equipUpgradeConfirmWindow.deactivate();
	this._equipUpgradeConfirmWindow.close();
	this._itemActionWindow.activate();
};

Scene_Item.prototype.onEquipUpgradeOk = function() {
	// TODO
	this._equipUpgradeConfirmWindow.deactivate();
	this._equipUpgradeConfirmWindow.close();
	this._itemActionWindow.activate();
};

//--------------------------------------------------------------------------------------------------
// Scene_Enhance
//--------------------------------------------------------------------------------------------------

/** Class for a scene for enhancing equipment outside of item menu */
class Scene_Enhance extends Scene_Item {
	constructor() {
		super();
		this.initialize.apply(this, arguments);
	}
	create() {
		super.create.call(this);
		this.createItemEnhanceInfoWindow();
		this.createItemEnhanceListWindow();
		this._itemWindow.setInfoWindow(this._itemEnhanceInfoWindow);
		this._itemEnhanceInfoWindow.show();
	}
	createCategoryWindow() {
		this._categoryWindow = new Window_EquipCategory();
		this._categoryWindow.setHelpWindow(this._helpWindow);
		this._categoryWindow.y = this._helpWindow.height;
		this._categoryWindow.setHandler('ok',     this.onCategoryOk.bind(this));
		this._categoryWindow.setHandler('cancel', this.exitScene.bind(this));
		this.addWindow(this._categoryWindow);
	}
	createItemWindow() {
		let wy = this._categoryWindow.y + this._categoryWindow.height;
		let wh = Graphics.boxHeight - wy;
		this._itemWindow = new Window_EquipEnhanceList(0, wy, Graphics.boxWidth, wh);
		this._itemWindow.setHelpWindow(this._helpWindow);
		this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
		this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
		this.addWindow(this._itemWindow);
		this._itemWindow.show();
		this._categoryWindow.setItemWindow(this._itemWindow);
		this.createStatusWindow();
	}
	createActionWindow() {}
	onItemOk() {
		this._itemWindow.deactivate();
		this._itemEnhanceInfoWindow.refresh();
		this._itemWindow.hide();
		this._itemEnhanceListWindow.show();
		this._itemEnhanceListWindow.activate();
		this._itemEnhanceListWindow.setItem(this.item());
		this._itemEnhanceListWindow.select(0);
	}
	onItemCancel() {
		this._itemWindow.deselect();
		this._statusWindow.setItem(null);
		this._itemEnhanceInfoWindow.setItem(null);
		this._categoryWindow.activate();
	}
	onItemEnhanceListCancel() {
		this._itemEnhanceListWindow.hide();
		this._itemEnhanceListWindow.deactivate();
		this._itemEnhanceInfoWindow.setFodderExp(0);
		this._itemWindow.show();
		this._itemWindow.activate();
		this._itemWindow.refresh();
		this._statusWindow.refresh();
		this._helpWindow.setItem(this.item());
	}
};

//--------------------------------------------------------------------------------------------------
// Scene_Upgrade
//--------------------------------------------------------------------------------------------------

/** Scene for upgrading equipment */
class Scene_Upgrade extends Scene_Item {
	/** Create scene */
	constructor() {
		super();
		this.initialize.apply(this, arguments);
	}
	create() {
		super.create();
		this.createEquipUpgradeInfoWindow()
		this.createEquipUpgradeConfirmWindow();
		this._itemWindow.setInfoWindow(this._equipUpgradeInfoWindow);
		this._equipUpgradeInfoWindow.show();
	}
	/** Create equipment category window */
	createCategoryWindow() {
		this._categoryWindow = new Window_EquipCategory();
		this._categoryWindow.setHelpWindow(this._helpWindow);
		this._categoryWindow.y = this._helpWindow.height;
		this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this));
		this._categoryWindow.setHandler('cancel', this.exitScene.bind(this));
		this.addWindow(this._categoryWindow);
	}
	/** Create window for displaying upgradable equipment */
	createItemWindow() {
		let wy = this._categoryWindow.y + this._categoryWindow.height;
		let wh = Graphics.boxHeight - wy;
		this._itemWindow = new Window_EquipUpgradeList(0, wy, Graphics.boxWidth, wh);
		this._itemWindow.setHelpWindow(this._helpWindow);
		this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
		this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
		this.addWindow(this._itemWindow);
		this._itemWindow.show();
		this._categoryWindow.setItemWindow(this._itemWindow);
		this.createStatusWindow();
	}
	createActionWindow() {}
	onItemOk() {
		this._equipUpgradeConfirmWindow.setItem(this.item());
		this._equipUpgradeConfirmWindow.open();
		this._equipUpgradeConfirmWindow.activate();
		this._equipUpgradeConfirmWindow.select(0);
	}
	onItemCancel() {
		this._itemWindow.deselect();
		this._statusWindow.setItem(null);
		this._equipUpgradeInfoWindow.setItem(null);
		this._categoryWindow.activate();
	}
};

//--------------------------------------------------------------------------------------------------
// Scene_Shop
//--------------------------------------------------------------------------------------------------

/*
dingk.EL.Scene_Shop_prepare = Scene_Shop.prototype.prepare;
Scene_Shop.prototype.prepare = function(goods, purchaseOnly) {
	for (let i in goods) {
		goods[i] = ItemManager.processIndependentGoods(goods[i]);
	}
	console.log(goods);
	console.log($dataWeapons);
	dingk.EL.Scene_Shop_prepare.call(this, goods, purchaseOnly);
}

dingk.EL.Scene_Shop_terminate = Scene_Shop.prototype.terminate;
Scene_Shop.prototype.terminate = function() {
	if(!(SceneManager._nextScene instanceof Scene_Equip)) {
		let goods = this._goods;
		let item = {};
		for (let i in goods) {
			let database = dingk.EL.getDatabase(goods[i][0]);
			item = database[goods[i][1]];
			let container = DataManager.getContainer(item);
			if(!DataManager.isIndependent(item))
				continue;
			if(!$gameParty.numItems(item)) {
				DataManager.removeIndependentItem(item);
				console.log(database.hasOwnProperty(1000), container);
			}
		}
	}
	dingk.EL.Scene_Shop_terminate.call(this);
};
*/

dingk.EL.Scene_Shop_doBuy = Scene_Shop.prototype.doBuy;
Scene_Shop.prototype.doBuy = function(number) {
	let data, displayItem;
	if (this._item.isDisplay) {
		displayItem = this._item;
		let baseItem = this._item.database[this._item.baseItemId];
		data = this._buyWindow._data.slice();
		this._buyWindow._data[this._buyWindow._data.indexOf(this._item)] = baseItem;
		this._item = baseItem;
	}
	dingk.EL.Scene_Shop_doBuy.call(this, number);
	if (data) {
		this._buyWindow._data = data;
		this._item = displayItem;
	}
};

//--------------------------------------------------------------------------------------------------
// Window_Base
//--------------------------------------------------------------------------------------------------

/**
 * Draw item name with level
 * @param {Object} item
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Boolean} full
 */
Window_Base.prototype.drawItemNameWithLevel = function(item, x, y, width, full) {
	width = width || 312;
	if (item) {
		let iconBoxWidth = Window_Base._iconWidth + 4;
		this.setItemTextColor(item);
		this.resetTextColor();
		this.drawIcon(item.iconIndex, x + 2, y + 2);
		let fmt = full ? dingk.EL.DisplayFmtFull : dingk.EL.DisplayFmt;
		let text = fmt.format(item.baseItemName, item.level);
		this.drawText(text, x + iconBoxWidth, y, width - iconBoxWidth);
		this._resetTextColor = undefined;
		this.resetTextColor();
	}
};

/**
 * Change item name text color based on tier
 * @param {Object} item
 */
dingk.EL.Window_Base_setItemTextColor = Window_Base.prototype.setItemTextColor;
Window_Base.prototype.setItemTextColor = function(item) {
	if (!item) return;
	dingk.EL.Window_Base_setItemTextColor.call(this, item);
	if (item.tier === undefined || item.tier < 0) return;
	if (item.overrideTextColor) return;
	this._resetTextColor = dingk.EL.Tiers[item.tier].color;
};

/**
 * Allow parsing of hex color codes
 * @param {String} n - Color code
 * @return {String} Hex color code
 */
dingk.EL.Window_Base_textColor = Window_Base.prototype.textColor;
Window_Base.prototype.textColor = function(n) {
	if (typeof n === 'string' && n[0] === '#') {
		if (n.length === 7) {
			return n;
		} else if (n.length === 4) {
			return '#' + n[1] + n[1] + n[2] + n[2] + n[3] + n[3];
		} else {
			return dingk.EL.Window_Base_textColor.call(this, 0);
		}
	}
	return dingk.EL.Window_Base_textColor.call(this, n);
};

//--------------------------------------------------------------------------------------------------
// Window_EquipCategory
//--------------------------------------------------------------------------------------------------

/**
 * Class for a window displaying equipment categories
 * @extends Window_ItemCategory
 */
class Window_EquipCategory extends Window_ItemCategory {
	/** Create a window */
	constructor() {
		super();
		this.initialize.apply(this, arguments);
	}
	/** Add commands */
	makeCommandList() {
		if ($gameTemp._enhanceCat) {
			for (let cat of $gameTemp._enhanceCat) {
				if (Imported.YEP_X_ItemCategories) {
					this.addItemCategory(cat);
				} else {
					if (cat.match(/WEAPONS?/i)) {
						this.addCommand(TextManager.weapon, 'weapon');
					} else if (cat.match(/ARMORS?/i)) {
						this.addCommand(TextManager.armor, 'armor');
					}
				}
			}
		} else {
			this.addCommand(TextManager.weapon, 'weapon');
			this.addCommand(TextManager.armor, 'armor');
		}
	}
};

//--------------------------------------------------------------------------------------------------
// Window_EquipItem
//--------------------------------------------------------------------------------------------------

/**
 * Check level requirements.
 * @param {Object} item - The current equipment
 * @return {boolean} True if meets requirement
 */
dingk.EL.Window_EquipItem_isEnabled = Window_EquipItem.prototype.isEnabled;
Window_EquipItem.prototype.isEnabled = function(item) {
	if (!item) return false;
	let isEnabled = dingk.EL.Window_EquipItem_isEnabled.call(this, item);
	if (dingk.EL.LevelRestrict) {
		if (!item.level) return isEnabled;
		if (item.level > this._actor.level) return false;
	}
	return isEnabled;
};

/** Change help text if player tries to equip a weapon that doesn't meet level requirements. */
Window_EquipItem.prototype.processOk = function() {
	Window_Selectable.prototype.processOk.call(this);
	if (!this.isCurrentItemEnabled() && dingk.EL.LevelRestrict) {
		if (this.item().level > this._actor.level) {
			this._helpWindow.setText(this._actor.name() + ' does not meet the level requirement!');
		}
	}
};

//--------------------------------------------------------------------------------------------------
// Window_EquipUpgradeConfirm
//--------------------------------------------------------------------------------------------------

/**
 * Class for a window asking the player to confirm upgrade
 * @extends Window_Command
 */
class Window_EquipUpgradeConfirm extends Window_Command {
	// TODO
	constructor() {
		super();
		this.initialize.apply(this, arguments);
	}
	initialize() {
		super.initialize.call(this, 0, 0);
		this.deactivate();
		this.openness = 0;
		this.width = Graphics.boxWidth;
		this.height = this.lineHeight() * 16;
		this.y = (Graphics.boxHeight - this.height) / 2;
	}
	/**
	 * Set current item and draw name
	 * @param {Object} item - The currently selected item
	 */
	setItem(item) {
		this.refresh();
		let dx = 0;
		let dy = 0;
		let dw = this.contentsWidth();
		this.drawText(dingk.EL.EUCWindowMessage, dx, dy, dw, 'center');
		dy += this.lineHeight() * 2;
		
		let database = DataManager.getDatabase(item);
		let container = DataManager.getContainer(item);
		let baseItem = database[item.baseItemId];
		let dummyItem = DataManager.registerNewItem(baseItem);
		ItemManager.setLevel(dummyItem, item.level);
		ItemManager.setTier(dummyItem, item.tier + 1);
		
		dy = this.drawEquipNames(item, dummyItem, dx, dy);
		this.drawEquipParams(item, dummyItem, dx + this.textPadding(), dy);
		DataManager.removeIndependentItem(dummyItem);
		database.pop();
		container.pop();
	}
	drawEquipNames(item, newItem, dx, dy) {
		let dw = this.contentsWidth() / 2;
		
		this.drawItemName(item, dx, dy, dw);
		this.drawItemName(newItem, dw, dy, dw);
		return dy + this.lineHeight() * 2;
	}
	drawEquipParams(item, newItem, dx, dy) {
		let dw = (this.contentsWidth() - this.textPadding() * 2) / 2;
		
		for (let i = 0; i < 8; i++) {
			this.drawDarkRect(0, dy, this.contentsWidth(), this.lineHeight());
			this.changeTextColor(this.systemColor());
			this.drawText(TextManager.param(i), dx, dy, dw, 'left');
			this.changeTextColor(this.normalColor());
			this.drawText(item.params[i], dx, dy, dw, 'right');
			this.changeTextColor(this.systemColor());
			this.drawText(' \u2192', dx + dw, dy, dw, 'left');
			this.changeTextColor(this.paramchangeTextColor(newItem.params[i] - item.params[i]));
			this.drawText(newItem.params[i], dx + dw, dy, dw, 'right');
			this.changeTextColor(this.normalColor());
			dy += this.lineHeight();
		}
	}
	itemTextAlign() {
		return 'center';
	}
	makeCommandList() {
		this.addCommand('Yes', 'confirm');
		this.addCommand('No', 'cancel');
	}
	/**
	 * Draw dark background for parameters
	 * @param {Number} dx - The x position
	 * @param {Number} dy - The y position
	 * @param {Number} dw - Width
	 * @param {Number} dh - Height
	 */
	drawDarkRect(dx, dy, dw, dh) {
		let color = this.gaugeBackColor();
		this.changePaintOpacity(false);
		this.contents.fillRect(dx + 1, dy + 1, dw - 2, dh - 2, color);
		this.changePaintOpacity(true);
	}
	itemRect(index) {
		let rect = super.itemRect(index);
		rect.y += this.height - this.lineHeight() * 3;
		return rect;
	}
};

//--------------------------------------------------------------------------------------------------
// Window_ItemActionCommand
//--------------------------------------------------------------------------------------------------

dingk.EL.Window_IAC_addCustomCommandsA = Window_ItemActionCommand.prototype.addCustomCommandsA;
dingk.EL.Window_IAC_addCustomCommandsB = Window_ItemActionCommand.prototype.addCustomCommandsB;
dingk.EL.Window_IAC_addCustomCommandsC = Window_ItemActionCommand.prototype.addCustomCommandsC;
dingk.EL.Window_IAC_addCustomCommandsD = Window_ItemActionCommand.prototype.addCustomCommandsD;
dingk.EL.Window_IAC_addCustomCommandsE = Window_ItemActionCommand.prototype.addCustomCommandsE;
dingk.EL.Window_IAC_addCustomCommandsF = Window_ItemActionCommand.prototype.addCustomCommandsF;

/** Add item enhance and equipment upgrade commands */
Window_ItemActionCommand.prototype.addCustomCommandsA = function() {
	dingk.EL.Window_IAC_addCustomCommandsA.call(this);
	if (dingk.EL.EnhancePriority === 0 && this.isAddItemEnhanceCommand()) {
		this.addItemEnhanceCommand();
	}
	if (dingk.EL.UpgradePriority === 0 && this.isAddEquipUpgradeCommand()) {
		this.addEquipUpgradeCommand();
	}
};

/** Add item enhance and equipment upgrade commands */
Window_ItemActionCommand.prototype.addCustomCommandsB = function() {
	dingk.EL.Window_IAC_addCustomCommandsB.call(this);
	if (dingk.EL.EnhancePriority === 1 && this.isAddItemEnhanceCommand()) {
		this.addItemEnhanceCommand();
	}
	if (dingk.EL.UpgradePriority === 1 && this.isAddEquipUpgradeCommand()) {
		this.addEquipUpgradeCommand();
	}
};

/** Add item enhance and equipment upgrade commands */
Window_ItemActionCommand.prototype.addCustomCommandsC = function() {
	dingk.EL.Window_IAC_addCustomCommandsC.call(this);
	if (dingk.EL.EnhancePriority === 2 && this.isAddItemEnhanceCommand()) {
		this.addItemEnhanceCommand();
	}
	if (dingk.EL.UpgradePriority === 2 && this.isAddEquipUpgradeCommand()) {
		this.addEquipUpgradeCommand();
	}
};

/** Add item enhance and equipment upgrade commands */
Window_ItemActionCommand.prototype.addCustomCommandsD = function() {
	dingk.EL.Window_IAC_addCustomCommandsD.call(this);
	if (dingk.EL.EnhancePriority === 3 && this.isAddItemEnhanceCommand()) {
		this.addItemEnhanceCommand();
	}
	if (dingk.EL.UpgradePriority === 3 && this.isAddEquipUpgradeCommand()) {
		this.addEquipUpgradeCommand();
	}
};

/** Add item enhance and equipment upgrade commands */
Window_ItemActionCommand.prototype.addCustomCommandsE = function() {
	dingk.EL.Window_IAC_addCustomCommandsE.call(this);
	if (dingk.EL.EnhancePriority === 4 && this.isAddItemEnhanceCommand()) {
		this.addItemEnhanceCommand();
	}
	if (dingk.EL.UpgradePriority === 4 && this.isAddEquipUpgradeCommand()) {
		this.addEquipUpgradeCommand();
	}
};

/** Add item enhance and equipment upgrade commands */
Window_ItemActionCommand.prototype.addCustomCommandsF = function() {
	dingk.EL.Window_IAC_addCustomCommandsF.call(this);
	if (dingk.EL.EnhancePriority === 5 && this.isAddItemEnhanceCommand()) {
		this.addItemEnhanceCommand();
	}
	if (dingk.EL.UpgradePriority === 5 && this.isAddEquipUpgradeCommand()) {
		this.addEquipUpgradeCommand();
	}
};

/**
 * Check if item can be enhanced
 * @return {Boolean} Whether or not the item can be enhanced
 */
Window_ItemActionCommand.prototype.isAddItemEnhanceCommand = function() {
	return !DataManager.isItem(this._item) && $gameSystem.isEnhanceTypeFodder();
};

/**
 * Check if item can be enhanced
 * @return {Boolean} Whether or not the item can be enhanced
 */
Window_ItemActionCommand.prototype.isEnableItemEnhanceCommand = function() {
	if (ItemManager.isMaxLevel(this._item)) return false;
	return !!this._item.level && this._item.allowEnhancement;
}

/** Add item enhance command */
Window_ItemActionCommand.prototype.addItemEnhanceCommand = function() {
	let fmt = dingk.EL.EnhanceFmt;
	let icon = '\\i[' + this._item.iconIndex + ']';
	let name = '';
	if (this._item.textColor !== undefined) name += '\\c[' + this._item.textColor + ']';
	name += this._item.name;
	let text = fmt.format(icon, name);
	this.addCommand(text, 'enhance', this.isEnableItemEnhanceCommand());
};

/**
 * Check if equipment can be upgraded
 * @return {Boolean} Whether or not the equipment can be upgraded
 */
Window_ItemActionCommand.prototype.isAddEquipUpgradeCommand = function() {
	return !DataManager.isItem(this._item) && $gameSystem.isTierUpgradeEnabled();
};

/**
 * Check if equipment can be upgraded
 * @return {Boolean} Whether or not the equipment can be upgraded
 */
Window_ItemActionCommand.prototype.isEnableEquipUpgradeCommand = function() {
	return ItemManager.canUpgrade(this._item);
}

/** Add equip upgrade command */
Window_ItemActionCommand.prototype.addEquipUpgradeCommand = function() {
	let fmt = dingk.EL.UpgradeFmt;
	let icon = '\\i[' + this._item.iconIndex + ']';
	let name = '';
	if (this._item.textColor !== undefined) name += '\\c[' + this._item.textColor + ']';
	name += this._item.name;
	let text = fmt.format(icon, name);
	this.addCommand(text, 'tier_upgrade', this.isEnableEquipUpgradeCommand());
};

dingk.EL.Window_ItemActionCommand_select = Window_ItemActionCommand.prototype.select;
Window_ItemActionCommand.prototype.select = function(index) {
	dingk.EL.Window_ItemActionCommand_select.call(this, index);
	let enWin = SceneManager._scene._itemEnhanceInfoWindow;
	let upWin = SceneManager._scene._equipUpgradeInfoWindow;
	if (enWin) enWin.hide();
	if (upWin) upWin.hide();
	if (this.currentSymbol() === 'enhance') {
		enWin.setItem(SceneManager._scene.item());
		enWin.show();
	} else if (this.currentSymbol() === 'tier_upgrade') {
		upWin.setItem(SceneManager._scene.item());
		upWin.show();
	}
};

//--------------------------------------------------------------------------------------------------
// Window_ItemEnhanceInfo
//--------------------------------------------------------------------------------------------------

/**
 * Class for a window displaying item enhancement info
 * @extends Window_Base
 */
class Window_ItemEnhanceInfo extends Window_ItemInfo {
	/** Create a window */
	constructor() {
		super();
		this.initialize.apply(this, arguments);
	}
	/**
	 * Initialize window properties
	 * @param {Number} x - The x position
	 * @param {Number} y - The y position
	 * @param {Number} w - Window width
	 * @param {Number} h - Window height
	 */
	initialize(x, y, w, h) {
		super.initialize.call(this, x, y, w, h);
		this._enhanceType = null;
		this._currentItem = null;
		this._fodderExp = 0;
		this.hide();
	}
	/**
	 * Draw dark background for parameters
	 * @param {Number} dx - The x position
	 * @param {Number} dy - The y position
	 * @param {Number} dw - Width
	 * @param {Number} dh - Height
	 */
	drawDarkRect(dx, dy, dw, dh) {
		let color = this.gaugeBackColor();
		this.changePaintOpacity(false);
		this.contents.fillRect(dx + 1, dy + 1, dw - 2, dh - 2, color);
		this.changePaintOpacity(true);
	}
	/**
	 * Return max width of the resulting parameter text
	 * @param {Array} params - List of resulting parameters
	 * @return {Number} The max text width
	 */
	getResultTextWidth(params) {
		let maxWidth = 0;
		for (let param of params) {
			let w = this.textWidth(' ' + param);
			if (w > maxWidth) maxWidth = w;
		}
		
		return maxWidth;
	}
	/**
	 * Return an array of the differences between old parameters and new parameters of the item
	 * @param {Object} item - Current item
	 * @param {Array} params - List of new parameters
	 * @return {Array} List of the differences
	 */
	getParamDifferences(item, params) {
		let diffs = [];
		for (let i = 0; i < params.length; i++) {
			let diff = params[i] - item.params[i];
			if (diff > 0) {
				diffs.push('(+' + diff + ')');
			} else {
				diffs.push('(' + diff + ')');
			}
		}
		return diffs;
	}
	/**
	 * Draw the info box containing EXP and parameter information
	 * @param {Number} dx - The x position
	 * @param {Number} dy - The y position
	 * @param {Number} dw - Max width of text
	 */
	drawInfoBox(dx, dy, dw) {
		this.changeTextColor(this.systemColor());
		this.drawText(dingk.EL.EnhanceInfo['EXP Required'], dx, dy, dw, 'left');
		this.resetFontSettings();
		let text = ItemManager.itemNextRequiredExp(this._item);
		if (this._fodderExp) {
			let fodText = ' (+' + this._fodderExp + ')';
			let tw = this.textWidth(fodText);
			this.drawText(text, dx, dy, dw - this.textPadding() - tw, 'right');
			this.changeTextColor(this.textColor(24));
			this.drawText(fodText, dx, dy, dw - this.textPadding(), 'right');
			this.resetFontSettings();
			let nextLevel = ItemManager.getNextItemLevel(this._item, 
				this._fodderExp);
				
			if (nextLevel > this._item.level) {
				dy += this.lineHeight() * 2;
				let params = ItemManager.getEquipParameters(this._item, 
					nextLevel);
				
				let resTextW = this.getResultTextWidth(params);
				let diffs = this.getParamDifferences(this._item, params);
				let diffTextW = this.getResultTextWidth(diffs);
				
				for (let i = 0; i < 8; i++) {
					let currParam = this._item.params[i];
					if (currParam !== params[i]) {
						this.drawDarkRect(0, dy, this.contentsWidth(), this.lineHeight());
						this.changeTextColor(this.systemColor());
						this.drawText(TextManager.param(i), dx, dy, dw, 'left');
						this.resetFontSettings();
						
						let dwPad = dw - this.textPadding();
						let arrow = ' \u2192';
						let arrowW = this.textWidth(arrow);
						this.drawText(currParam, dx, dy, 
							dwPad - resTextW - arrowW - diffTextW, 'right');
						if (diffs[i].contains('+')) {
							this.changeTextColor(this.textColor(24));
						} else {
							this.changeTextColor(this.textColor(25));
						}
						this.drawText(diffs[i], dx, dy, 
							dwPad - resTextW - arrowW, 'right');
						this.resetFontSettings();
						this.drawText(arrow, dx, dy, dwPad - resTextW, 'right');
						this.drawText(params[i], dx, dy, dwPad, 'right');
						dy += this.lineHeight();
					}
				}
			}
		} else {
			this.drawText(text, dx, dy, dw - this.textPadding(), 'right');
		}
	}
	/** Refresh contents of window */
	refresh() {
		this.contents.clear();
		if (!this._item) return;
		let dx = this.textPadding();
		let dy = 0;
		let dw = this.contentsWidth() - dx * 2;
		if (!this._item.level || !this._item.allowEnhancement) {
			this.drawText(dingk.EL.EnhanceInfo['Cannot Enhance'], dx, dy, dw, 'left');
			return;
		}
		if (this._item.level && !this._item.displayLevel) {
			this.drawItemNameWithLevel(this._item, dx, dy, dw);
		} else {
			this.drawItemName(this._item, dx, dy, dw);
		}
		dy += this.lineHeight() * 2;
		if (!ItemManager.isMaxLevel(this._item)) {
			this.drawInfoBox(dx, dy, dw);
		} else {
			this.drawText(dingk.EL.EnhanceInfo['Max Level'], dx, dy, dw, 'center');
		}
	}
	/**
	 * Set the amount of fodder EXP in the window
	 * @param {Number} exp - The amount of fodder EXP
	 */
	setFodderExp(exp) {
		this._fodderExp = exp;
		this.refresh();
	}
};

//--------------------------------------------------------------------------------------------------
// Window_ItemEnhanceList
//--------------------------------------------------------------------------------------------------

/**
 * Class for a window showing list of fodder items
 * @extends Window_ItemList
 */
class Window_ItemEnhanceList extends Window_ItemList {
	/** Create a window */
	constructor() {
		super();
		this.initialize.apply(this, arguments);
	}
	/**
	 * Initialize window properties
	 * @param {Number} x - The x position
	 * @param {Number} y - The y position
	 * @param {Number} w - Window width
	 * @param {Number} h - Window height
	 */
	initialize(x, y, w, h) {
		super.initialize.call(this, x, y, w, h);
		this._item = null;
		this._helpIndex = -1;
		this.hide();
	}
	/**
	 * Set the info box
	 * @param {Object} win - Window_ItemEnhanceInfo
	 */
	setInfoWindow(win) {
		this._itemEnhanceInfoWindow = win;
	}
	/**
	 * Set the current item being enhanced
	 * @param {Object} item - Current item
	 */
	setItem(item) {
		if (this._item === item) return;
		this._item = item;
		this.refresh();
		this.select(0);
	}
	/**
	 * Check if item is a fodder
	 * @param {Object} item - Current item
	 * @return {Boolean} Whether item is fodder or not
	 */
	includes(item) {
		if (!item || !this._item) return false;
		if (!item.fodderExp || item.fodderExp <= 0) return false;
		if (item.fodderExpTypes.length) {
			if (!this._item.fodderTypes.length) return true;
			for (let type of item.fodderExpTypes) {
				if (this._item.fodderTypes.includes(type))
					return true;
			}
			return false;
		}
		
		return true;
	}
	/**
	 * Item is always enabled
	 * @param {Object} item - Current item
	 * @return {Object} Currently enabled item
	 */
	isEnabled(item) {
		return item;
	}
	/** List out all the items that match the criteria */
	makeItemList() {
		this._data = $gameParty.allItems().filter(function(item) {
			return this.includes(item);
		}, this);
	}
	/** Update the info box */
	updateHelp() {
		super.updateHelp.call(this);
		if (!this._itemEnhanceInfoWindow) return;
		this._helpIndex = this.index();
		if (this.item()) 
			this._itemEnhanceInfoWindow.setFodderExp(this.item().fodderExp);
	}
};

//--------------------------------------------------------------------------------------------------
// Window_EquipEnhanceList
//--------------------------------------------------------------------------------------------------

/**
 * Class for a window showing list of equipment
 * @extends Window_ItemList
 */
class Window_EquipEnhanceList extends Window_ItemList {
	/** Create a window */
	constructor() {
		super();
		this.initialize.apply(this, arguments);
	}
	/**
	 * Initialize window properties
	 * @param {Number} x - The x position
	 * @param {Number} y - The y position
	 * @param {Number} w - Window width
	 * @param {Number} h - Window height
	 */
	initialize(x, y, w, h) {
		super.initialize.call(this, x, y, w, h);
		this._helpIndex = -1;
		this.hide();
	}
	includes(item) {
		let include = super.includes(item);
		if (dingk.EL.PCSettings['enhScene']) return this.isEnabled(item) && include;
		return include;
	}
	/**
	 * Return whether or not the item can be enhanced
	 * @param {Object} item - Current item
	 * @return {boolean} True if item can be enhanced
	 */
	isEnabled(item) {
		if (!item) return false;
		if (!item.level) return false;
		return !ItemManager.isMaxLevel(item);
	}
	/**
	 * Set the info box
	 * @param {Object} win - Window_ItemEnhanceInfo
	 */
	setInfoWindow(win) {
		this._itemEnhanceInfoWindow = win;
	}
	updateHelp() {
		super.updateHelp.call(this);
		if (!this._itemEnhanceInfoWindow) return;
		this._itemEnhanceInfoWindow.setItem(this.item());
		this._helpIndex = this.index();
		//this._itemEnhanceInfoWindow.refresh();
	}
};

//--------------------------------------------------------------------------------------------------
// Window_EquipUpgradeInfo
//--------------------------------------------------------------------------------------------------

/** 
 * Class displaying the materials required to upgrade equipment
 * @extends Window_Base
 */
class Window_EquipUpgradeInfo extends Window_ItemInfo {
	/** Create a window */
	constructor() {
		super();
		this.initialize.apply(this, arguments);
		this.hide();
	}
	/** Refresh window contents */
	refresh() {
		this.contents.clear();
		if (!this._item) return;
		let dx = this.textPadding();
		let dy = 0;
		let dw = this.contentsWidth() - dx * 2;
		console.log(this._item)
		if (!ItemManager.tierConditionEval(this._item)) {
			this.drawText(dingk.EL.UpgradeInfo['Cannot Upgrade'], dx, dy, dw, 'left');
			return;
		}
		this.changeTextColor(this.systemColor());
		this.drawText(dingk.EL.UpgradeInfo['Upgrade Title'], dx, dy, dw, 'center');
		this.changeTextColor(this.normalColor());
		this.drawTierMaterials();
	}
	/** Draw tier upgrade material text */
	drawTierMaterials() {
		let item = this._item;
		let dx = this.textPadding();
		let dy = this.lineHeight() * 2;
		
		for (let mat of item.tierUpgradeData[item.tier].mats) {
			let dw = this.contentsWidth() - dx * 2;
			let matItem;
			switch(mat.kind) {
				case 0: 
					matItem = $dataItems[mat.id];
					break;
				case 1:
					matItem = $dataWeapons[mat.id];
					break;
				case 2:
					matItem = $dataArmors[mat.id];
					break;
				default:
					continue;
			}
			if (!matItem) continue;
			this.drawItemName(matItem, dx, dy, dw);
			this.contents.fontSize = dingk.EL.EUCWindowCountFS;
			let count = $gameParty.numItems(matItem);
			let text = '/' + mat.count;
			this.drawText(text, dx, dy, dw, 'right');
			if (mat.count <= count) {
				this.changeTextColor(this.powerUpColor());
			} else {
				this.changeTextColor(this.powerDownColor());
			}
			dw -= this.textWidth(text);
			this.drawText(count, dx, dy, dw, 'right');
			dy += this.lineHeight();
			this.resetFontSettings();
		}
		
		if (item.tierUpgradeData[item.tier].cost > 0) {
			let cost = item.tierUpgradeData[item.tier].cost;
			let dw = this.contentsWidth() - dx * 2;
			this.drawCurrencyValue(cost, TextManager.currencyUnit, dx, dy, dw);
		}
	}
};

//--------------------------------------------------------------------------------------------------
// Window_EquipUpgradeList
//--------------------------------------------------------------------------------------------------

/**
 * Class for a window displaying equipment that can be upgraded
 * @extends Window_ItemList
 */
class Window_EquipUpgradeList extends Window_ItemList {
	/** Create a window */
	constructor() {
		super();
		this.initialize.apply(this, arguments);
	}
	/**
	 * Set this window's info box
	 * @param {Object} win - Equip upgrade info window
	 */
	setInfoWindow(win) {
		this._equipUpgradeInfoWindow = win;
	}
	/**
	 * Include all equips or only upgradeable equips
	 * @param {Object} item - The equipment
	 * @return {boolean} True if is equip or if is upgradeable
	 */
	includes(item) {
		let include = super.includes(item);
		if (dingk.EL.PCSettings['upScene']) return ItemManager.tierConditionEval(item) && include;
		return include;
	}
	/**
	 * Check if equipment can be upgraded.
	 * @param {Object} item - The equipment
	 * @return {boolean} True if can be upgraded
	 */
	isEnabled(item) {
		return ItemManager.canUpgrade(item);
	}
	/** Update info box */
	updateHelp() {
		super.updateHelp();
		if (!this._equipUpgradeInfoWindow) return;
		this._equipUpgradeInfoWindow.setItem(this.item());
	}
};

//--------------------------------------------------------------------------------------------------
// Window_ItemInfo
//--------------------------------------------------------------------------------------------------

if (!dingk.EL.DisplayLevel) {
	/**
	 * Draw item name with level if user allows
	 * @param {Number} dy
	 * @return {Number} New y position
	 */
	Window_ItemInfo.prototype.drawItemInfo = function(dy) {
		let dx = this.textPadding();
		let dw = this.contents.width - this.textPadding() * 2;
		this.resetFontSettings();
		if (this._item.level) this.drawItemNameWithLevel(this._item, dx, dy, dw);
		else this.drawItemName(this._item, dx, dy, dw);
		return dy + this.lineHeight();
	};
}

//--------------------------------------------------------------------------------------------------
// Window_ShopBuy
//--------------------------------------------------------------------------------------------------

/** Replace equipment with a display item that shows level and proper stats */
dingk.EL.Window_ShopBuy_makeItemList = Window_ShopBuy.prototype.makeItemList;
Window_ShopBuy.prototype.makeItemList = function() {
	dingk.EL.Window_ShopBuy_makeItemList.call(this);
	for (let index in this._data) {
		let item = this._data[index];
		if (DataManager.isItem(item)) continue;
		if (!DataManager.isIndependent(item)) continue;
		let displayItem = JsonEx.makeDeepCopy(item);
		displayItem.database = DataManager.getDatabase(item);
		let goods = this._shopGoods[index];
		Object.defineProperty(displayItem, 'isDisplay', {
			value: true
		});
		ItemManager.setNewIndependentItem(item, displayItem);
		ItemManager.customizeNewIndependentItem(item, displayItem);
		ItemManager.setEquipParameters(item, displayItem);
		ItemManager.setLevel(displayItem);
		this._data[index] = displayItem;
		this._price[index] = goods[2] === 0 ? displayItem.price : goods[3];
	}
};

//--------------------------------------------------------------------------------------------------
// Window_ShopStatus
//--------------------------------------------------------------------------------------------------

/** Refresh shop window */
Window_ShopStatus.prototype.refresh = function() {
	this.contents.clear();
	if (this._item) {
		let displayItem = this._item;
		let baseItem;
		if (displayItem.isDisplay) {
			this._item = displayItem.database[displayItem.baseItemId];
		}
		this.resetTextColor();
		this.resetFontSettings();
		let x = this.textPadding();
		let y = this.lineHeight();
		let w = this.contents.width - this.textPadding() * 2;
		let possWidth = this.drawPossession(x, 0);
		if (dingk.EL.DisplayShopInfo) {
			if (possWidth) w -= (possWidth + this.textWidth(' '));
			if (displayItem.level) {
				this.drawItemNameWithLevel(displayItem, x, 0, w, true);
			} else {
				this.drawItemName(displayItem, x, 0, w);
			}
		}
		if (this.isEquipItem()) {
			this.resetTextColor();
			this.resetFontSettings();
			let displayParams = this._item.params;
			this._item.params = displayItem.params;
			if (Imported.YEP_ShopMenuCore) {
				if (this.isDefaultMode()) this.drawDefaultData();
				if (this.isActorMode()) this.drawActorData();
			} else {
				this.drawEquipInfo(x, y * 2);
			}
			this._item.params = displayParams;
		}
		this._item = displayItem;
	}
};

if (dingk.EL.DisplayShopInfo) {

/**
 * Draw possession count
 * @param {Number} x
 * @param {Number} y
 * @return {Number} Text width of possession text
 */
Window_ShopStatus.prototype.drawPossession = function(x, y) {
	let width = this.contents.width - this.textPadding() - x;
	if (DataManager.isIndependent(this._item) || this._item.isDisplay) {
		return this.drawIndependentPossession(x, y);
	}
	let text = '\u00d7' + $gameParty.numItems(this._item);
	this.drawText(text, x, y, width, 'right');
	return this.textWidth(text);
};

/**
 * Draw possession count of independent items
 * @param {Number} x
 * @param {Number} y
 * @return {Number} Text width of possession text
 */
Window_ShopStatus.prototype.drawIndependentPossession = function(x, y) {
	let width = this.contents.width - this.textPadding() - x;
	let baseItem = DataManager.getBaseItem(this._item);
	let text = '\u00d7' + $gameParty.numIndependentItems(baseItem);
	this.drawText(text, x, y, width, 'right');
	return this.textWidth(text);
};

} // if (dingk.EL.DisplayShopInfo)

//--------------------------------------------------------------------------------------------------
// Utils
//--------------------------------------------------------------------------------------------------

/**
 * Get item database
 * @param {Number} type
 * @return {Array} Database
 */
dingk.EL.getDatabase = function(type) {
	switch(type) {
		default:
			return $dataItems;
		case 1:
			return $dataWeapons;
		case 2:
			return $dataArmors;
	}
};
/** Make associative arrays of items with their IDs */
dingk.EL.getItemNames = function() {
	if (dingk.ItemIds) return;
	dingk.ItemIds = {};
	let group = $dataItems;
	for (let n = 1; n < group.length; n++) {
		if (group[n].name) {
			dingk.ItemIds[group[n].name] = n;
		}
	}
};

/** Make associative arrays of weapons with their IDs */
dingk.EL.getWeaponNames = function() {
	if (dingk.WeaponIds) return;
	dingk.WeaponIds = {};
	let group = $dataWeapons;
	for (let n = 1; n < group.length; n++) {
		if (group[n].name) {
			dingk.WeaponIds[group[n].name] = n;
		}
	}
};

/** Make associative arrays of armors with their IDs */
dingk.EL.getArmorNames = function() {
	if (dingk.ArmorIds) return;
	dingk.ArmorIds = {};
	let group = $dataArmors;
	for (let n = 1; n < group.length; n++) {
		if (group[n].name) {
			dingk.ArmorIds[group[n].name] = n;
		}
	}
};

/** Make object to reference param IDs */
dingk.EL.getParamIds = function() {
	dingk.EL.ParamIds = {
		hp:    0, mp:  1,
		atk:   2, def: 3,
		mat:   4, mdf: 5,
		agi:   6, luk: 7,
		price: 8, exp: 9,
	};
};

/**
 * Replace user-defined aliases with variable names
 * @param {String} text - The text to be replaced
 * @param {Array} regex - List of regular expressions
 * @return {String} text - The replaced text
 */
dingk.EL.reformat = function(text, regex) {
	for (let prop in regex) {
		text = text.replace(regex[prop], prop);
	}
	return text;
};

/**
 * Return a random integer between min and max (inclusive)
 * @param {Number} min - Inclusive
 * @param {Number} max - Inclusive
 * @return {Number} Random integer between min and max (inclusive)
 */
dingk.EL.randomInt = function(min, max) {
	if (max < min) [min, max] = [max, min];
	return Math.floor(Math.random() * (max + 1 - min)) + min;
}

/**
 * Check if an object is empty.
 * @param {Object} obj - An Object
 * @return {boolean} True if object is empty
 */
dingk.EL.isEmpty = function(obj) {
	return !obj || (!Object.keys(obj).length && obj.constructor === Object);
};

}; // if (Imported.YEP_ItemCore)