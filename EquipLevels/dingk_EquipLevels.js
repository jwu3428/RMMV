var Imported = Imported || {};
Imported.dingk_EquipLevels = true;

var dingk = dingk || {};
dingk.EL = dingk.EL || {};
dingk.EL.version = 1.0;

/*:
 * @plugindesc Allows weapons and armors to have levels to scale stats.
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
 * @param Max Equip Level
 * @desc The absolute maximum level an equipment may have
 * @type number
 * @min 1
 * @default 100
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
 * @param HP Formula
 * @desc Formula for determining HP of the equipment
 * @default hp *= level * (1 + tier / 10)
 *
 * @param MP Formula
 * @desc Formula for determining MP of the equipment
 * @default mp *= level * (1 + tier / 10)
 *
 * @param ATK Formula
 * @desc Formula for determining ATK of the equipment
 * @default atk *= level * (1 + tier / 10)
 *
 * @param DEF Formula
 * @desc Formula for determining DEF of the equipment
 * @default def *= level * (1 + tier / 10)
 *
 * @param MAT Formula
 * @desc Formula for determining MAT of the equipment
 * @default mat *= level * (1 + tier / 10)
 *
 * @param MDF Formula
 * @desc Formula for determining MDF of the equipment
 * @default mdf *= level * (1 + tier / 10)
 *
 * @param AGI Formula
 * @desc Formula for determining AGI of the equipment
 * @default agi *= level * (1 + tier / 10)
 *
 * @param LUK Formula
 * @desc Formula for determining LUK of the equipment
 * @default luk *= level * (1 + tier / 10)
 *
 * @param Price Formula
 * @desc Formula for determining the price of the equipment
 * @default price *= level * (1 + tier / 10)
 *
 * @param EXP Formula
 * @desc Formula for determining the EXP for leveling the equipment
 * @default exp = level * 100
 *
 * @param enhancement
 * @text Allow Level Enhancement
 * @desc Allow equipment to level up by feeding EXP fodder.
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @param enhCmdName
 * @parent enhancement
 * @text Command Name
 * @desc Format of the command shown on the item action command list.
 * %1 - Item Name
 * @default Enhance %1
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
 * @param enhCustom
 * @parent enhancement
 * @text Customize Info Box
 * @desc Customize the text that displays in the enhance info text box.
 * @type struct<EnhInfo>
 * @default {"EXP Required":"EXP Required","Cannot Enhance":"This item cannot be enhanced.","Max Level":"MAX LEVEL"}
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
 * (1) Weapon, Armor Notetags
 *
 * <Drop Level: value>
 * Set the equipment to always drop at this level, replacing 'value' with the 
 * desired level.
 *
 * <Max Level: value>
 * Set the max level of the equipment, replacing 'value' with the desired level.
 *
 * <Cannot Level>
 * Disable level enhancement for this equipment.
 *
 * <Display Level: true>
 * <Display Level: false>
 * Set whether or not to display the equipment's level in its name.
 *
 * <Fodder Type: types>
 * Set which type of items are allowed to be fed into this equipment. Replace 
 * 'types' with a comma-separated list.
 *
 * <Equip param Formula: code>
 * Lets you apply a custom formula to one of the equipment parameters.
 * Replace 'param' with 'hp', 'mp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk',
 * 'price', or 'exp', and replace 'code' with JavaScript code.
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
 * Same as previous notetag but lets you input in bulk. You can also play
 * around with the code, such as using *= or += to multiple or add to the
 * existing parameters specified in the main editor.
 *
 * (2) Item, Weapon, Armor Notetags
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
 * -----------------------------------------------------------------------------
 * Plugin Commands
 * -----------------------------------------------------------------------------
 *
 * ItemDropLevel x to y
 *  > Set the level of the item given to the player. Place before any Give Item
 *    command.
 *
 * GiveCustomWeapon
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
 * @default This item cannot be enhanced.
 *
 * @param Max Level
 * @default MAX LEVEL
 */

if (Imported.YEP_ItemCore) {

dingk.EL.params = PluginManager.parameters('dingk_EquipLevels');
dingk.EL.itemDropLevelType = Number(dingk.EL.params['Item Drop Level Type']) || 0;
dingk.EL.enableEnemyLevels = dingk.EL.params['Enable Enemy Levels'] === 'true';
dingk.EL.EnableLevelVariance = dingk.EL.params['Enable Level Variance'] === 'true';
dingk.EL.LevelVarianceUp = Number(dingk.EL.params['Level Variance Increase']) || 1;
dingk.EL.LevelVarianceDown = Number(dingk.EL.params['Level Variance Decrease']) || 1;
dingk.EL.MaxLevel = Number(dingk.EL.params['Max Equip Level']) || 100;
dingk.EL.Tiers = dingk.EL.params['Tiers'];
dingk.EL.DefaultTier = Number(dingk.EL.params['Default Tier']) || 0;
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
dingk.EL.AllowEnhance = dingk.EL.params['enhancement'] === 'true';
dingk.EL.EnhanceFmt = dingk.EL.params['enhCmdName'] || 'Enhance %1';
dingk.EL.EnhancePriority = Number(dingk.EL.params['enhCmdPriority']) || 0;
dingk.EL.EnhanceInfo = JSON.parse(dingk.EL.params['enhCustom']);
dingk.EL.DisplayLevel = dingk.EL.params['displayLevel'] === 'true';
dingk.EL.DisplayFmt = dingk.EL.params['levelFmtShort'];
dingk.EL.DisplayFmtFull = dingk.EL.params['levelFmtLong'];
dingk.EL.DisplayShopInfo = dingk.EL.params['levelShopInfo'] === 'true';
dingk.EL.Aliases = JSON.parse(dingk.EL.params['aliases']);

//--------------------------------------------------------------------------------------------------
// DataManager
//--------------------------------------------------------------------------------------------------

/**
 * Check if database is loaded, then process notetags
 * @return {bool} Whether database has loaded
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
	for (let tier of JSON.parse(dingk.EL.Tiers)) {
		let parsed = JSON.parse(tier);
		parsed.weight = Number(parsed.weight);
		tiers.push(parsed);
	}
	dingk.EL.Tiers = tiers;
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
	
	for(let n = 1; n < group.length; n++) {
		let obj = group[n];
		let notedata = obj.note.split(/[\r\n]+/);
		
		obj.allowEnhancement = false;
		obj.displayLevel = false;
		obj.tier = dingk.EL.DefaultTier.clamp(0, dingk.EL.Tiers.length);
		obj.maxTier = dingk.EL.Tiers.length;
		obj.fodderExp = 0;
		obj.fodderExpTypes = [];
		
		for (let i = 0; i < notedata.length; i++) {
			let note = notedata[i];
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
		/<FODDER TYPE:\s*(.*)>/i
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
		obj.level = 0;
		obj.dropLevel = 0;
		obj.exp = 0;
		obj.maxLevel = dingk.EL.MaxLevel;
		obj.displayLevel = dingk.EL.DisplayLevel;
		obj.allowEnhancement = dingk.EL.AllowEnhance;
		obj.overrideTextColor = false;
		obj.fodderTypes = [];
		
		let mode = '';
		let paramId = 0;

		for(let i = 0; i < notedata.length; i++) {
			let note = notedata[i];
			let result;
			
			// <Drop Level: value>
			if ([, result] = note.match(regEx[0]) || '') {
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
			} else if (note.match(/<EQUIP CUSTOM FORMULA>/i)) {
				mode = 'equip custom formula';
			} else if (note.match(/<\/EQUIP CUSTOM FORMULA>/i)) {
				mode = '';
			} else if (mode === 'equip custom formula') {
				if ([, result] = regEx3.hp.exec(note) || '') {
					obj.equipParamFormula[0] = 
						'hp' + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.mp.exec(note) || '') {
					obj.equipParamFormula[1] = 
						'mp' + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.atk.exec(note) || '') {
					obj.equipParamFormula[2] = 
						'atk' + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.def.exec(note) || '') {
					obj.equipParamFormula[3] = 
						'def' + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.mat.exec(note) || '') {
					obj.equipParamFormula[4] = 
						'mat' + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.mdf.exec(note) || '') {
					obj.equipParamFormula[5] = 
						'mdf' + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.agi.exec(note) || '') {
					obj.equipParamFormula[6] = 
						'agi' + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.luk.exec(note) || '') {
					obj.equipParamFormula[7] = 
						'luk' + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.price.exec(note) || '') {
					obj.equipParamFormula[8] = 
						'price' + dingk.EL.reformat(result, regEx2);
				} else if ([, result] = regEx3.exp.exec(note) || '') {
					obj.equipParamFormula[9] = 
						'exp' + dingk.EL.reformat(result, regEx2);
				}
			} 
			// <Fodder Type: types>
			else if ([, result] = note.match(regEx[5]) || '') {
				let types = result.split(/\s*,\s*/)
				obj.fodderTypes = types.map(el => el.toUpperCase());
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

//--------------------------------------------------------------------------------------------------
// ItemManager
//--------------------------------------------------------------------------------------------------

/*
dingk.EL.IM_SNII = ItemManager.setNewIndependentItem;
ItemManager.setNewIndependentItem = function(baseItem, newItem) {
	dingk.EL.IM_SNII.call(this, baseItem, newItem);
	newItem.equipParamFormula = baseItem.equipParamFormula || {};
};*/

/**
 * Update equipment parameters
 * @param {Object} baseItem - The base item
 * @param {Object} newItem - The independent item
 */
ItemManager.setEquipParameters = function(baseItem, newItem) {
	if (!baseItem.params) return;
	if (!newItem.level || newItem.level < 0)
		newItem.level = this.getLevel();
	if (newItem.tier === undefined)
		newItem.tier = 0;

	let hp = baseItem.params[0];
	let mp = baseItem.params[1];
	let atk = baseItem.params[2];
	let def = baseItem.params[3];
	let mat = baseItem.params[4];
	let mdf = baseItem.params[5];
	let agi = baseItem.params[6];
	let luk = baseItem.params[7];
	let price = baseItem.price;
	let level = newItem.level;
	let tier = newItem.tier;

	try {
		for (let i = 0; i < 9; i++) {
			eval(newItem.equipParamFormula[i]);
		}
	} catch(err) {
		console.error(err);
		console.log('EQUIP FORMULA ERROR');
	}

	newItem.params[0] = Math.round(hp);
	newItem.params[1] = Math.round(mp);
	newItem.params[2] = Math.round(atk);
	newItem.params[3] = Math.round(def);
	newItem.params[4] = Math.round(mat);
	newItem.params[5] = Math.round(mdf);
	newItem.params[6] = Math.round(agi);
	newItem.params[7] = Math.round(luk);
	newItem.price = Math.round(price);
	//newItem.exp = 0;

	this.updateItemName(newItem);
};

/**
 * Return equipment parameters
 * @param {Object} item - The equipment to extract parameters from
 * @param {Number} level - The desired level of the equipment
 * @return {Array} List of the parameters calculated at the desired level
 */
ItemManager.getEquipParameters = function(item, level) {
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
	let tier = item.tier;

	try {
		for (let i = 0; i < 9; i++) {
			eval(item.equipParamFormula[i]);
		}
	} catch(err) {
		console.error(err);
		console.log('EQUIP FORMULA ERROR');
	}
	
	params.push(Math.round(hp));
	params.push(Math.round(mp));
	params.push(Math.round(atk));
	params.push(Math.round(def));
	params.push(Math.round(mat));
	params.push(Math.round(mdf));
	params.push(Math.round(agi));
	params.push(Math.round(luk));
	
	return params;
};

/**
 * Update equipment parameters after customizing new independent item
 * @param {Object} baseItem - The base item
 * @param {Object} newItem - The independent item
 */
dingk.EL.IM_CNII = ItemManager.customizeNewIndependentItem;
ItemManager.customizeNewIndependentItem = function(baseItem, newItem) {
	dingk.EL.IM_CNII.call(this, baseItem, newItem);
	this.setEquipParameters(baseItem, newItem);
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
 * Register new independent item and set its level
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
	} catch (e) {
		console.log("EXP FORMULA ERROR: ", formula);
		console.error(e);
		return 0;
	}
	
	return exp;
};

/**
 * Return the level of the equipment when initialized
 * @return {Number} Level
 */
ItemManager.getLevel = function() {
	if (SceneManager._scene instanceof Scene_Title) return 1;
	switch (dingk.EL.itemDropLevelType) {
		case 1:
			return $gameParty.getHighestLevel() || 1;
		case 2:
			return $gameParty.getLowestLevel() || 1;
		case 3:
			return $gameParty.getAverageLevel() || 1;
	}

	return 1;
};

/**
 * Set the level of the equipment
 * @param {Object} item - The independent item
 * @param {Number} level - The level of the item
 */
ItemManager.setLevel = function(item, level) {
	if (!item || DataManager.isItem(item)) return;
	if (!level) var level = this.getLevel();
	item.level = level + this.getLevelVariance();
	item.level.clamp(1, item.maxLevel);
	this.setEquipParameters(DataManager.getBaseItem(item), item);
	item.exp = this.itemCurrentLevelExp(item);
};

/**
 * Return a random level variance
 * @return {Number} A random number
 */
ItemManager.getLevelVariance = function() {
	if (!dingk.EL.EnableLevelVariance) return 0;
	let max = Number(dingk.EL.LevelVarianceUp);
	let min = Number(dingk.EL.LevelVarianceDown) * -1;
	return Math.floor(Math.random() * (max - min + 1) + min);
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
	this.setEquipParameters(DataManager.getBaseItem(item), item);
};

/**
 * Level up the equipment
 * @param {Object} item - The independent item
 */
ItemManager.itemLevelDown = function(item) {
	item.level--;
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
 * @return {bool} Whether the item is max level or not
 */
ItemManager.isMaxLevel = function(item) {
	return item.level >= item.maxLevel;
};

/**
 * Increase tier of the equipment
 * @param {Object} item - The independent item
 */
ItemManager.itemTierUp = function(item) {
	item.tier++;
	this.setEquipParameters(DataManager.getBaseItem(item), item);
};

/**
 * Decrease tier of the equipment
 * @param {Object} item - The independent item
 */
ItemManager.itemTierDown = function(item) {
	item.tier--;
	this.setEquipParameters(DataManager.getBaseItem(item), item);
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
	console.log(totalWeight);
	let randWeight = Math.random() * totalWeight;
	let accWeight = 0;
	for (let i = minTier; i < dingk.EL.Tiers.length; i++) {
		accWeight += dingk.EL.Tiers[i].weight;
		if (randWeight < accWeight) {
			console.log(randWeight, accWeight);
			item.tier = i;
			break;
		}
	}
	this.setEquipParameters(DataManager.getBaseItem(item), item);
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
// Game_Actor
//--------------------------------------------------------------------------------------------------

/*
dingk.EL.Game_Actor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {
	dingk.EL.Game_Actor_setup.call(this, actorId);
	let equips = this.convertInitEquips($dataActors[actorId].equips);
	console.log(equips);
};
*/

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
	if (command.toUpperCase().trim() === 'GIVECUSTOMWEAPON') {
		let itemId = Number(args[0]);
		let itemLevel = Number(args[1]);
		let baseItem = $dataWeapons[itemId];
		if (!DataManager.isIndependent(baseItem)) $gameParty.gainItem(baseItem);
		else {
			let newItem = DataManager.registerNewItem(baseItem);
			if (itemLevel) ItemManager.setLevel(newItem, itemLevel);
			ItemManager.setEquipParameters(baseItem, newItem);
			$gameParty.registerNewItem(baseItem, newItem);
		}
	} else if (command.toUpperCase().trim() === 'GIVECUSTOMARMOR') {
		let itemId = Number(args[0]);
		let itemLevel = Number(args[1]);
		let baseItem = $dataArmors[itemId];
		if (!DataManager.isIndependent(baseItem)) $gameParty.gainItem(baseItem);
		else {
			let newItem = DataManager.registerNewItem(baseItem);
			if (itemLevel) ItemManager.setLevel(newItem, itemLevel);
			ItemManager.setEquipParameters(baseItem, newItem);
			$gameParty.registerNewItem(baseItem, newItem);
		}
	}
};

//--------------------------------------------------------------------------------------------------
// Game_Party
//--------------------------------------------------------------------------------------------------

/**
 * Return the level of the highest level party member
 * @return {Number} Highest level
 */
Game_Party.prototype.getHighestLevel = function() {
	return Math.max.apply(Math, this.members().map(a => a.level));
};

/**
 * Return the level of the lowest level party member
 * @return {Number} Lowest level
 */
Game_Party.prototype.getLowestLevel = function() {
	return Math.min.apply(Math, this.members().map(a => a.level));
};

/**
 * Return the average level of the party
 * @return {Number} Average level
 */
Game_Party.prototype.getAverageLevel = function() {
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
dingk.EL.SI_createInfoWindow = Scene_Item.prototype.createInfoWindow;
Scene_Item.prototype.createInfoWindow = function() {
	dingk.EL.SI_createInfoWindow.call(this);
	this.createItemEnhanceInfoWindow();
	this.createItemEnhanceListWindow();
};

/** Create the window for list of item fodders */
Scene_Item.prototype.createItemEnhanceListWindow = function() {
	let x = this._itemWindow.x;
	let y = this._itemWindow.y;
	let w = this._itemWindow.width;
	let h = this._itemWindow.height;
	this._itemEnhanceListWindow = new Window_ItemEnhanceList(x, y, w, h);
	this._itemEnhanceListWindow.setHelpWindow(this._helpWindow);
	this._itemEnhanceListWindow.setEnhanceInfoWindow(this._itemEnhanceInfoWindow);
	this.addWindow(this._itemEnhanceListWindow);
	this._itemEnhanceListWindow.setHandler('cancel', 
		this.onItemEnhanceListCancel.bind(this));
	this._itemEnhanceListWindow.setHandler('ok', 
		this.onItemEnhanceListOk.bind(this));
};

/** Create info window for enhancing items */
Scene_Item.prototype.createItemEnhanceInfoWindow = function() {
	let x = this._infoWindow.x;
	let y = this._infoWindow.y;
	let w = this._infoWindow.width;
	let h = this._infoWindow.height;
	this._itemEnhanceInfoWindow = new Window_ItemEnhanceInfo(x, y, w, h);
	this.addWindow(this._itemEnhanceInfoWindow);
};

/** Add action for enhance command */
dingk.EL.SI_createActionWindow = Scene_Item.prototype.createActionWindow;
Scene_Item.prototype.createActionWindow = function() {
	dingk.EL.SI_createActionWindow.call(this);
	this._itemActionWindow.setHandler('enhance', 
		this.onActionItemEnhance.bind(this));
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
	this._infoWindow.refresh();
	this._statusWindow.refresh();
	this._itemEnhanceInfoWindow.refresh();
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
 * @param {bool} full
 */
Window_Base.prototype.drawItemNameWithLevel = function(item, x, y, width, full) {
	width = width || 312;
	if (item) {
		let iconBoxWidth = Window_Base._iconWidth + 4;
		this.setItemTextColor(item);
		this.resetTextColor();
		this.drawIcon(item.iconIndex, x + 2, y + 2);
		let fmt = full ? dingk.EL.DisplayFmtFull :
			dingk.EL.DisplayFmt;
		let text = fmt.format(item.name, item.level);
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
	} else {
		return dingk.EL.Window_Base_textColor.call(this, n);
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

/**
 * Add item enhance command to the item action command window based on user preference
 */
switch(dingk.EL.EnhancePriority) {
	case 1:
		Window_ItemActionCommand.prototype.addCustomCommandsB = function() {
			dingk.EL.Window_IAC_addCustomCommandsB.call(this);
			if (this.isAddItemEnhanceCommand()) this.addItemEnhanceCommand();
		};
		break;
	case 2:
		Window_ItemActionCommand.prototype.addCustomCommandsC = function() {
			dingk.EL.Window_IAC_addCustomCommandsC.call(this);
			if (this.isAddItemEnhanceCommand()) this.addItemEnhanceCommand();
		};
		break;
	case 3:
		Window_ItemActionCommand.prototype.addCustomCommandsD = function() {
			dingk.EL.Window_IAC_addCustomCommandsD.call(this);
			if (this.isAddItemEnhanceCommand()) this.addItemEnhanceCommand();
		};
		break;
	case 4:
		Window_ItemActionCommand.prototype.addCustomCommandsE = function() {
			dingk.EL.Window_IAC_addCustomCommandsE.call(this);
			if (this.isAddItemEnhanceCommand()) this.addItemEnhanceCommand();
		};
		break;
	case 5:
		Window_ItemActionCommand.prototype.addCustomCommandsF = function() {
			dingk.EL.Window_IAC_addCustomCommandsF.call(this);
			if (this.isAddItemEnhanceCommand()) this.addItemEnhanceCommand();
		};
		break;
	default:
		Window_ItemActionCommand.prototype.addCustomCommandsA = function() {
			dingk.EL.Window_IAC_addCustomCommandsA.call(this);
			if (this.isAddItemEnhanceCommand()) this.addItemEnhanceCommand();
		};
};

/**
 * Check if item can be enhanced
 * @return {bool} Whether or not the item can be enhanced
 */
Window_ItemActionCommand.prototype.isAddItemEnhanceCommand = function() {
	if (!this._item) return false;
	return this._item.allowEnhancement;
};

/**
 * Check if item can be enhanced
 * @return {bool} Whether or not the item can be enhanced
 */
Window_ItemActionCommand.prototype.isEnableItemEnhanceCommand = function() {
	if (ItemManager.isMaxLevel(this._item)) return false;
	return this._item.allowEnhancement;
}

/** Add item enhance command */
Window_ItemActionCommand.prototype.addItemEnhanceCommand = function() {
	let fmt = dingk.EL.EnhanceFmt;
	let name = '\\i[' + this._item.iconIndex + ']';
	if (this._item.textColor !== undefined)
		name += '\\c[' + this._item.textColor + ']';
	name += this._item.name;
	let text = fmt.format(name);
	this.addCommand(text, 'enhance', this.isEnableItemEnhanceCommand());
};

//--------------------------------------------------------------------------------------------------
// Window_ItemEnhanceInfo
//--------------------------------------------------------------------------------------------------

/**
 * Class for a window displaying item enhancement info
 * @extends Window_Base
 */
class Window_ItemEnhanceInfo extends Window_Base {
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
		this._currentItem = null;
		this._fodderExp = 0;
		this.hide();
	}
	/** Update window properties */
	update() {
		super.update();
		this.updateCurrentItem();
		this.updateVisibility();
	}
	/** Change window's current item */
	updateCurrentItem() {
		if (this._currentItem === SceneManager._scene.item()) return;
		this.refresh();
	}
	/** Change window visibility */
	updateVisibility() {
		let win = SceneManager._scene._itemActionWindow;
		if (!win) return;
		let current = this.visible;
		let visible = win.visible && win.currentSymbol() === 'enhance';
		win = SceneManager._scene._itemEnhanceListWindow;
		if (win && win.visible) visible = true;
		this.visible = visible;
		if (current !== this.visible) {
			this.refresh();
		}
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
		let text = ItemManager.itemNextRequiredExp(this._currentItem);
		if (this._fodderExp) {
			let fodText = ' (+' + this._fodderExp + ')';
			let tw = this.textWidth(fodText);
			this.drawText(text, dx, dy, dw - this.textPadding() - tw, 'right');
			this.changeTextColor(this.textColor(24));
			this.drawText(fodText, dx, dy, dw - this.textPadding(), 'right');
			this.resetFontSettings();
			let nextLevel = ItemManager.getNextItemLevel(this._currentItem, 
				this._fodderExp);
				
			if (nextLevel > this._currentItem.level) {
				dy += this.lineHeight() * 2;
				let params = ItemManager.getEquipParameters(this._currentItem, 
					nextLevel);
				
				let resTextW = this.getResultTextWidth(params);
				let diffs = this.getParamDifferences(this._currentItem, params);
				let diffTextW = this.getResultTextWidth(diffs);
				
				for (let i = 0; i < params.length; i++) {
					let currParam = this._currentItem.params[i];
					if (currParam !== params[i]) {
						this.drawDarkRect(0, dy, this.contentsWidth(), 
							this.lineHeight());
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
		this._currentItem = SceneManager._scene.item();
		if (!this._currentItem) return;
		let dx = this.textPadding();
		let dy = 0;
		let dw = this.contentsWidth() - dx * 2;
		if (!this._currentItem.allowEnhancement) {
			this.drawText(dingk.EL.EnhanceInfo['Cannot Enhance'], 
				dx, dy, dw, 'left');
			return;
		}
		if (this._currentItem.level && !this._currentItem.displayLevel) {
			this.drawItemNameWithLevel(this._currentItem, dx, dy, dw);
		} else {
			this.drawItemName(this._currentItem, dx, dy, dw);
		}
		dy += this.lineHeight() * 2;
		if (!ItemManager.isMaxLevel(this._currentItem)) {
			this.drawInfoBox(dx, dy, dw);
		} else {
			this.drawText(dingk.EL.EnhanceInfo['Max Level'], 
				dx, dy, dw, 'center');
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
	setEnhanceInfoWindow(win) {
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
	 * @return {bool} Whether item is fodder or not
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
// Window_ShopStatus
//--------------------------------------------------------------------------------------------------

if (dingk.EL.DisplayShopInfo) {

/** Refresh shop window */
Window_ShopStatus.prototype.refresh = function() {
	this.contents.clear();
	if (this._item) {
		this.resetTextColor();
		this.resetFontSettings();
		let x = this.textPadding();
		let y = this.lineHeight();
		let w = this.contents.width - this.textPadding() * 2;
		if (this._item.level) {
			this.drawItemNameWithLevel(this._item, x, 0, w, true);
		} else {
			this.drawItemName(this._item, x, 0, w);
		}
		this.drawPossession(x, 0);
		if (this.isEquipItem()) {
			this.resetTextColor();
			this.resetFontSettings();
			if (Imported.YEP_ShopMenuCore) {
				if (this.isDefaultMode()) this.drawDefaultData();
				if (this.isActorMode()) this.drawActorData();
			} else {
				this.drawEquipInfo(x, y * 2);
			}
		}
	}
};

/** Draw possession count */
Window_ShopStatus.prototype.drawPossession = function(x, y) {
	let width = this.contents.width - this.textPadding() - x;
	if (DataManager.isIndependent(this._item)) {
		return this.drawIndependentPossession(x, y);
	}
	let value = $gameParty.numItems(this._item);
	value = Yanfly.Util.toGroup(value);
	this.drawText('\u00d7' + value, x, y, width, 'right');
};

/** Draw possession count */
Window_ShopStatus.prototype.drawIndependentPossession = function(x, y) {
	let width = this.contents.width - this.textPadding() - x;
	let baseItem = DataManager.getBaseItem(this._item);
	let value = $gameParty.numIndependentItems(baseItem);
	value = Yanfly.Util.toGroup(value);
	this.drawText('\u00d7' + value, x, y, width, 'right');
};

} // if (dingk.EL.DisplayShopInfo)

}; // if (Imported.YEP_ItemCore)

//--------------------------------------------------------------------------------------------------
// Utils
//--------------------------------------------------------------------------------------------------

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
	if (max < min) {
		let tmp = min;
		min = max;
		max = tmp;
	}
	return Math.floor(Math.random() * (max + 1 - min)) + min;
}