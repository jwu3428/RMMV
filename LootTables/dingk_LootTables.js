/*******************************************************************************
 * Loot Tables v1.0 by dingk
 * For use in RMMV 1.6.2
 ******************************************************************************/
var Imported = Imported || {};
Imported.dingk_ItemPools = true;

var dingk = dingk || {};
dingk.Loot = dingk.Loot || {};
dingk.Loot.version = '1.0';

/*:
 * @plugindesc [v1.0] Create item/loot drop pools within the editor.
 * @author dingk
 *
 * @param Global Loot Tables
 * @desc Pre-define some loot tables if desired, so you don't have to remake them in the Enemies editor.
 * @type struct<DropTable>[]
 * @default ["{\"Name\":\"Sample\",\"Drop Pools\":\"[\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Common\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"55\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Tier\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Rare\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"30\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Tier\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Epic\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"12\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Tier\\\\\\\":\\\\\\\"2\\\\\\\"}\\\",\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Legendary\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Tier\\\\\\\":\\\\\\\"3\\\\\\\"}\\\"]\"}"]
 *
 * @param Plugin Command Settings
 *
 * @param Message Format
 * @parent Plugin Command Settings
 *
 * @param Single Item
 * @parent Message Format
 * @desc The text to display when using the plugin command. Leave blank for none. %1 - Icon, %2 - Name
 * @default %1%2 found!
 *
 * @param Multiple Items
 * @parent Message Format
 * @desc The text to display when using the plugin command. Leave blank for none. %1 - Icon, %2 - Name, %3 - Count
 * @default %1%2 ×%3 found!
 *
 * @help
 * -----------------------------------------------------------------------------
 *   Introduction
 * -----------------------------------------------------------------------------
 *
 * This plugin adds a randomized loot drop mechanic to your game. You can
 * customize drop tables in the plugin manager and set up various item pools.
 * You can assign these drop tables to enemies or use plugin commands on the
 * map.
 *
 * Drop tables consist of different item pools, which are assigned different
 * weights. A pool with a higher weight has a higher chance of being selected.
 * A selected item pool will drop whatever item is assigned to it.
 *
 * -----------------------------------------------------------------------------
 *   Notetags
 * -----------------------------------------------------------------------------
 *
 * In the notetags below, the keywords Item / Drop / Loot are interchangeable.
 *
 * Item, Weapon, and Armor Notetags:
 *
 * <Drop Pool: name>
 *  - Put this item in the specified item pool.
 *
 * Enemy Notetags:
 *
 * <Drop Table: name[, name, name, ...]>
 *  - Assign one or more drop tables to this enemy. Customize it in the plugin
 *    manager.
 *
 * <Drop Table>
 * [name]
 * [name]: [weight]
 * [name] x[amount]: [weight]
 * [name] x[minAmount]-[maxAmount]: [weight]
 * ...
 * </Drop Table>
 *  - Add a drop table to enemy drops. Replace the bracketed variables with
 *    proper values:
 *    - name : Name of the item or item pool. For items, you can use the names
 *      of the items or use 'Item [id]', 'Weapon [id]', or 'Armor [id]',
 *      replacing [id] with the item ID.
 *    - amount : Number of items in this pool to drop. Default is 1.
 *    - minAmount-maxAmount : Random number of items to drop in this range.
 *    - weight: The chance for this pool to drop. The higher the weight, the
 *      higher the chance. Default is 1.
 *  - Insert multiple of this notetag to allow multiple drops.
 * EXAMPLE:
 * <Drop Table>
 * Potion x2: 5
 * Common: 5
 * Common x3-5: 4
 * Rare: 1
 * </Drop Table>
 *  - There is a chance that this enemy will drop 2 Potions, a random Common
 *    item, 3 to 5 of the same random Common item, or a random Rare item. The
 *    total weight from this drop table adds up to 15, so the Rare item has a
 *    1/15 chance to drop, whereas the two Potions has a 5/15 chance.
 *
 * -----------------------------------------------------------------------------
 *   Plugin Commands
 * -----------------------------------------------------------------------------
 *
 * In the plugin commands below, the keywords Item / Drop / Loot are
 * interchangeable. Customize the message displayed in the plugin manager.
 *
 * GiveDropPool name [minAmount] [maxAmount]
 *  - Give the player an item from this item pool. Replace 'name' with the name
 *    of the item pool.
 *  - [Optional] Replace 'minAmount' and 'maxAmount' with the amount to give
 *    the player. Default is 1.
 *
 * GiveDropTable name
 *  - Give the player an item from this item table. Replace 'name' with the name
 *    of the item table. Define this table in the plugin manager.
 */
/*~struct~DropTable:
 * @param Name
 * @desc Name of the loot table. Use <Drop Pool: name> in enemy notetags.
 *
 * @param Drop Pools
 * @desc Define one or more pools.
 * @type struct<DropPool>[]
 */
/*~struct~DropPool:
 * @param Pool Name
 * @desc Name of this loot pool. Use an item name to drop that item only. Use 'gold' to drop gold.
 *
 * @param Weight
 * @desc The weight of this loot pool.
 * @type number
 * @min 1
 * @default 1
 *
 * @param Min Amount
 * @desc The minimum number of items this loot pool will drop.
 * @type number
 * @min 0
 * @default 1
 *
 * @param Max Amount
 * @desc The maximum number of items this loot pool will drop.
 * @min 0
 * @default 1
 */

//--------------------------------------------------------------------------------------------------
// Classes
//--------------------------------------------------------------------------------------------------

/** Class for item drop object */
class ItemDrop {
	/**
	 * Create item drop
	 * @param {Number} kind - Item, weapon, or armor
	 * @param {Number} dataId - ID of item
	 */
	constructor(kind, dataId) {
		this.kind = kind;
		this.dataId = dataId;
	}
	
	/**
	 * Return database object
	 * @return {Object} Database object
	 */
	getDataItem() {
		switch(this.kind) {
			case 1:
				return $dataItems[this.dataId];
			case 2: {
				let item = $dataWeapons[this.dataId];
				if (Imported.YEP_ItemCore && Imported.dingk_EquipLevels) {
					return DataManager.registerNewItem(item);
				}
				return item;
			}
			case 3: {
				let item = $dataArmors[this.dataId];
				if (Imported.YEP_ItemCore && Imported.dingk_EquipLevels) {
					return DataManager.registerNewItem(item);
				}
				return item;
			}
		}

	}
};

/** Class for the item drop pool */
class DropPool {
	/**
	 * Create drop pool
	 * @param {String} name - Name of pool
	 * @param {Number} minAmount - Minimum number of items dropped
	 * @param {Number} maxAmound - Maximum number of items dropped
	 * @param {Number} level - Level of item
	 * @param {Number} tier - Tier of item
	 */
	constructor(name, weight = 1, minAmount = 0, maxAmount = 0, level = 0, tier = 0) {
		this.name = name;
		this.weight = Math.max(1, Number(weight) || 1);
		this.minAmount = Number(minAmount) || 0;
		this.maxAmount = Number(maxAmount) || 0;
		if (this.minAmount > this.maxAmount) {
			[this.minAmount, this.maxAmount] = [this.maxAmount, this.minAmount];
		}
		this.level = level;
		this.tier = tier;
	}
	/**
	 * Return random number of items to drop
	 * @return {Number} Number between minAmount and maxAmount (inclusive)
	 */
	getAmount() {
		return dingk.Loot.randomInt(this.minAmount, this.maxAmount);
	}
};

/** Class for loot table */
class DropTable {
	/**
	 * Create loot table
	 * @param {String} name - Name of table
	 * @param {Array} pools - Array of drop pools
	 * @param {Number} minLevel - Minimum level of items in this table
	 * @param {Number} maxLevel - Maximum level of items in this table
	 * @param {Number} rate - Drop rate of items (0.0 - 1.0)
	 */
	constructor(name = '', pools = [], minLevel = 0, maxLevel = 0, rate = 1.0) {
		this.pools = pools;
		this.name = name;
		this.minLevel = minLevel;
		this.maxLevel = maxLevel;
		this.rate = rate;
	}
	/**
	 * Insert pools in this loot table
	 * @param {Object} pool - DropPool object
	 */
	insert(pool) {
		this.pools = this.pools.concat(pool);
	}
	clear() {
		this.pools = [];
	}
};

//--------------------------------------------------------------------------------------------------
// Globals
//--------------------------------------------------------------------------------------------------
var itemPools = {};
var $dropTables = {};

dingk.Loot.params = PluginManager.parameters('dingk_LootTables');
dingk.Loot.tables = dingk.Loot.params['Global Loot Tables'];
dingk.Loot.displaySingle = dingk.Loot.params['Single Item'];
dingk.Loot.displayMultiple = dingk.Loot.params['Multiple Items'];
dingk.Loot.allowStack = true;

//--------------------------------------------------------------------------------------------------
// DataManager
//--------------------------------------------------------------------------------------------------

/**
 * Check if database is loaded, then process notetags
 * @return {bool} Whether database has loaded
 */
dingk.Loot.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!dingk.Loot.DataManager_isDatabaseLoaded.call(this)) return false;
	if (!dingk.Loot._loaded) {
		this.process_dingk_Loot_lootTables();
		dingk.Loot.getItemNames();
		dingk.Loot.getWeaponNames();
		dingk.Loot.getArmorNames();
		this.process_dingk_Loot_items($dataItems);
		this.process_dingk_Loot_items($dataWeapons);
		this.process_dingk_Loot_items($dataArmors);
		this.process_dingk_Loot_enemies();
		this.process_dingk_Loot_weights($dataActors);
		this.process_dingk_Loot_weights($dataClasses);
		this.process_dingk_Loot_weights($dataWeapons);
		this.process_dingk_Loot_weights($dataArmors);
		this.process_dingk_Loot_weights($dataStates);
		dingk.Loot._loaded = true;
	}
	return true;
};

/** Parse json */
DataManager.process_dingk_Loot_lootTables = function() {
	let jsonTables = JSON.parse(dingk.Loot.tables);
	for (let jsonTable of jsonTables) {
		let table = JSON.parse(jsonTable);
		let name = table['Name'];
		let pools = JSON.parse(table['Drop Pools']);
		let dropTable = new DropTable(name);
		for (let pool of pools) {
			let obj = JSON.parse(pool);
			dropTable.insert(new DropPool(obj['Pool Name'], obj['Weight'],
				obj['Min Amount'], obj['Max Amount'], 0, obj['Tier']));
		}
		$dropTables[name] = dropTable;
	}
};

/** 
 * Parse notetags
 * @param {Array} group - List of database objects
 */
DataManager.process_dingk_Loot_items = function(group) {
	let alias = '(?:drop|loot|item)';
	let regex = new RegExp('<' + alias + ' pool: (.*)>', 'i');
	for (let n = 1; n < group.length; n++) {
		let obj = group[n];
		let notedata = obj.note.split(/[\r\n]+/);

		for (let note of notedata) {
			let result;
			if ([, result] = note.match(regex) || '') {
				let kind = dingk.Loot.getItemType(obj);
				if (!itemPools[result]) itemPools[result] = [];
				itemPools[result].push(new ItemDrop(kind, n));
			}
		}
	}
};

/** Parse enemy notetags */
DataManager.process_dingk_Loot_enemies = function() {
	let group = $dataEnemies;
	let alias = '(?:drop|loot|item) table';
	let longLine = '\\s*(\\d*\\.?\\d+?)?(%)?(?: level)?\\s*(\\d+)?-?(\\d+)?';
	let regex = [
		new RegExp('<' + alias + longLine + '>', 'i'),
		new RegExp('<' + alias + longLine + ': (.*)>', 'i'),
		new RegExp('</' + alias + '(.*)?>', 'i')
	];

	for (let n = 1; n < group.length; n++) {
		let obj = group[n];
		let notedata = obj.note.split(/[\r\n]+/);

		let mode = '';
		let table = [];
		obj.dropTables = [];

		for (let i = 0; i < notedata.length; i++) {
			let note = notedata[i];
			let result;
			// <drop table> <drop table rate> <drop table rate level x-y>
			if ([, ...result] = note.match(regex[0]) || '') {
				mode = 'drop table';
				table = new DropTable();
				// drop rate
				if (result[0]) {
					let rate = Number(result[0]);
					// %
					if (result[1]) rate /= 100;
					table.rate = rate;
				}
				// level
				if (result[2]) {
					let minLevel = Number(result[2]);
					let maxLevel = result[3] ? Number(result[3]) : minLevel;
					if (minLevel > maxLevel) {
						[minLevel, maxLevel] = [maxLevel, minLevel];
					}
					table.minLevel = minLevel;
					table.maxLevel = maxLevel;
				}
			}
			// <drop table: name> <drop table rate: name> <drop table rate level x-y: name>
			else if ([, ...result] = note.match(regex[1]) || '') {
				let rate, minLevel, maxLevel;
				// rate
				if (result[0]) {
					rate = Number(result[0]);
					// %
					if (result[1]) rate /= 100;
				}
				// level
				if (result[2]) {
					minLevel = Number(result[2]);
					maxLevel = result[3] ? Number(result[3]) : minLevel;
					if (minLevel > maxLevel) {
						[minLevel, maxLevel] = [maxLevel, minLevel];
					}
				}
				let names = result[4].split(',').map(a => a.trim());
				for (let name of names) {
					let dropTable = $dropTables[name];
					if (dropTable) {
						if (rate) dropTable.rate = rate;
						if (minLevel) dropTable.minLevel = minLevel;
						if (maxLevel) dropTable.maxLevel = maxLevel;
						obj.dropTables.push(dropTable);
					}
				}
			}
			// </drop table>
			else if (note.match(regex[2])) {
				mode = '';
				obj.dropTables.push(table);
				console.log(obj.dropTables);
				table = [];
			} else if (mode === 'drop table') {
				// name xmin // name xmin-max // name xmin-max: weight
				if ([, ...result] = note.match(/(.*) x(\d+)-?(\d+)?:?\s*(\d+)?/i) || '') {
					let name = result[0];
					let min = Number(result[1]);
					let max = result[2] ? Number(result[2]) : min;
					let weight = result[3] ? Number(result[3]) : 1;
					table.insert(new DropPool(name, weight, min, max));
				}
				// name: weight
				else if ([, ...result] = note.match(/(.*):\s*(\d+)/) || '') {
					let name = result[0];
					let weight = Number(result[1]);
					table.insert(new DropPool(name, weight, 1, 1));
				}
				// name
				else if ([, result] = note.match(/(.*)/) || '') {
					table.insert(new DropPool(result, 1, 1, 1));
				}
			}
		}
	}
};

/** 
 * Parse notetags
 * @param {Array} group - List of database objects
 */
DataManager.process_dingk_Loot_weights = function(group) {
	let regex = [
		/<(.*) weight:\s*([*+-])?(\d*.?\d+?)>/i
	];
	for (let n = 1; n < group.length; n++) {
		let obj = group[n];
		let notedata = obj.note.split(/[\r\n]+/);
		
		obj.lootBuffs = new Map();
		
		for (let note of notedata) {
			let result;
			// <poolName weight: +n> <poolName weight: -n> <poolName weight: *n>
			if ([, ...result] = note.match(regex[0]) || '') {
				if (result[1] === undefined) result[1] = '+';
				let rateAdj = {operation: result[1], rate: Number(result[2])};
				obj.lootBuffs.set(result[0], rateAdj);
			}
		}
	}
}

//--------------------------------------------------------------------------------------------------
// Game_Actor
//--------------------------------------------------------------------------------------------------

/**
 * Return list of weight adjustments of the actor, class, states, and equipment
 * @param {String} name - Name of drop pool
 * @return {Array} List of weight adjustments
 */
Game_Actor.prototype.getWeightAdjustments = function(name) {
	let buff = [this.actor().lootBuffs.get(name)];
	buff.push(this.currentClass().lootBuffs.get(name));
	
	let states = this.states();
	for (let state of states) {
		if (!state) continue;
		buff.push(state.lootBuffs.get(name));
	}
	
	let equips = this.equips();
	for (let equip of equips) {
		if (!equip) continue;
		buff.push(equip.lootBuffs.get(name));
	}
	
	return buff;
};

//--------------------------------------------------------------------------------------------------
// Game_Enemy
//--------------------------------------------------------------------------------------------------

/**
 * Get drops from loot table
 * @return {Array} List of drops
 */
dingk.Loot.Game_Enemy_makeDropItems = Game_Enemy.prototype.makeDropItems;
Game_Enemy.prototype.makeDropItems = function() {
	let drops = dingk.Loot.Game_Enemy_makeDropItems.call(this);
	if (this.enemy().dropTables) {
		let pools = this.getDropCategory();
		if (pools && pools.length) {
			drops = drops.concat(this.getItemsFromPool(pools));
		}
	}
	return drops;
};

/**
 * Get pools from table
 * @return {Array} List of pools
 */
Game_Enemy.prototype.getDropCategory = function() {
	let poolsToDrop = [];
	for (let table of this.enemy().dropTables) {
		let rand = Math.random();
		console.log(table.rate * this.dropItemRate(), rand);
		if (table.rate * this.dropItemRate() < rand) continue;
		let pool = dingk.Loot.getDropCategory(table);
		if (pool) poolsToDrop.push(pool);
	}
	return poolsToDrop;
};

/**
 * Get items from pools
 * @param {Array} pools - List of pools
 * @return {Array} List of items to be dropped
 */
Game_Enemy.prototype.getItemsFromPool = function(pools) {
	if (Imported.dingk_EquipLevels && dingk.EL.enableEnemyLevels) {
		// Yanfly's Enemy Levels
		if (Imported.YEP_EnemyLevels) {
			return dingk.Loot.getItemsFromPool(pools, this.level);
		}
		// Tsukihime's Enemy Levels
		if (Imported.EnemyLevels) {
			return dingk.Loot.getItemsFromPool(pools, this.level());
		}
	}
	return dingk.Loot.getItemsFromPool(pools);
};

//--------------------------------------------------------------------------------------------------
// Game_Interpreter
//--------------------------------------------------------------------------------------------------

/**
 * Add plugin commands to drop items from pools/tables
 * @param {String} command
 * @param {Array} args
 */
dingk.Loot.GI_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	dingk.Loot.GI_pluginCommand.call(this, command, args);
	let cmd = command.toUpperCase();
	let alias = '(?:drop|loot|item)';
	let rx1 = new RegExp('give' + alias + 'pool', 'i');
	let rx2 = new RegExp('give' + alias + 'table', 'i');
	if (cmd.match(rx1)) {
		let amountLo = Number(args[1]) || 1;
		let amountHi = Number(args[2]) || amountLo;
		let pool = new DropPool(args[0], 1, amountLo, amountHi)
		let drops = dingk.Loot.getItemsFromPool([pool]);
		dingk.Loot.giveDrops(drops);
	} else if (cmd.match(rx2)) {
		let name = args[0];
		let table = $dropTables[name];
		let pool = dingk.Loot.getDropCategory(table);
		let drops = dingk.Loot.getItemsFromPool([pool]);
		dingk.Loot.giveDrops(drops);
	}
};

//--------------------------------------------------------------------------------------------------
// Game_Party
//--------------------------------------------------------------------------------------------------

/**
 * Adjust the weights of the loot table based on buffs on actors in party
 * @param {Object} table - Loot table
 * @return {Object} New loot table with adjusted weights
 */
Game_Party.prototype.getWeightAdjustments = function(table) {
	let dropTable = Object.assign(new DropTable(), table);
	dropTable.clear();
	for (let pool of table.pools) {
		let newPool = Object.assign(new DropPool(), pool);
		let [add, multiply] = [0, 1];
		for (let member of this.battleMembers()) {
			let buffs = member.getWeightAdjustments(pool.name);
			for (let buff of buffs) {
				if (!buff) continue;
				if (buff.operation.includes('*')) {
					multiply *= buff.rate;
				} else if (buff.operation.includes('-')) {
					add -= buff.rate;
				} else {
					add += buff.rate;
				}
			}
		}
		newPool.weight = newPool.weight * multiply + add;
		dropTable.insert(newPool);
	}
	return dropTable;
};

//--------------------------------------------------------------------------------------------------
//  dingk.Loot and Utils
//--------------------------------------------------------------------------------------------------

/** Make associative arrays of items with their IDs */
dingk.Loot.getItemNames = function() {
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
dingk.Loot.getWeaponNames = function() {
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
dingk.Loot.getArmorNames = function() {
	if (dingk.ArmorIds) return;
	dingk.ArmorIds = {};
	let group = $dataArmors;
	for (let n = 1; n < group.length; n++) {
		if (group[n].name) {
			dingk.ArmorIds[group[n].name] = n;
		}
	}
};

/**
 * Return item type as a number
 * @param {Object} item
 * @return {Number} Item type
 */
dingk.Loot.getItemType = function(item) {
	if (DataManager.isItem(item)) return 1;
	if (DataManager.isWeapon(item)) return 2;
	if (DataManager.isArmor(item)) return 3;
};

/**
 * Get items from pools
 * @param {Array} pools - List of pools
 * @param {Number} level - Level of items
 * @return {Array} List of items to be dropped
 */
dingk.Loot.getItemsFromPool = function(pools, level) {
	let drops = [];
	for (let pool of pools) {
		let amount = dingk.Loot.randomInt(pool.minAmount, pool.maxAmount);
		if (dingk.ItemIds[pool.name]) {
			for (let i = 0; i < amount; i++) {
				drops.push($dataItems[dingk.ItemIds[pool.name]]);
			}
		} else if (dingk.WeaponIds[pool.name]) {
			let item = $dataWeapons[dingk.WeaponIds[pool.name]];
			if (Imported.YEP_ItemCore && Imported.dingk_EquipLevels) {
				let newItem = ItemManager.registerEquipLevel(item, level);
				for (let i = 0; i < amount; i++) drops.push(newItem);
			} else {
				for (let i = 0; i < amount; i++) drops.push(item);
			}
		} else if (dingk.ArmorIds[pool.name]) {
			let item = $dataArmors[dingk.ArmorIds[pool.name]];
			if (Imported.YEP_ItemCore && Imported.dingk_EquipLevels) {
				let newItem = ItemManager.registerEquipLevel(item, level);
				for (let i = 0; i < amount; i++) drops.push(newItem);
			} else {
				for (let i = 0; i < amount; i++) drops.push(item);
			}
		} else {
			let iPool = itemPools[pool.name];
			if (!iPool) continue;
			let item = iPool[Math.randomInt(iPool.length)].getDataItem();
			if (Imported.YEP_ItemCore && Imported.dingk_EquipLevels) {
				let newItem = ItemManager.registerEquipLevel(item, level);
				for (let i = 0; i < amount; i++) drops.push(newItem);
			} else {
				for (let i = 0; i < amount; i++) drops.push(item);
			}
		}
	}
	return drops;
};

/**
 * Return a random pool
 * @param {Object} table - Loot table
 * @return {Object} Drop pool
 */
dingk.Loot.getDropCategory = function(table) {
	if (!table) return;
	let newTable = $gameParty.getWeightAdjustments(table);
	console.log(newTable);
	let pools = newTable.pools;
	let totalWeight = pools.reduce((a, dp) => a + dp.weight, 0);
	let randWeight = Math.random() * totalWeight;
	let accWeight = 0;
	for (let pool of pools) {
		accWeight += pool.weight;
		if (randWeight < accWeight) {
			return pool;
		}
	}
};

/**
 * Give the party items from a list and display the message
 * @param {Array} drops - List of items to be given
 */
dingk.Loot.giveDrops = function(drops) {
	let itemCount = {}, weaponCount = {}, armorCount = {};

	for (let item of drops) {
		if (DataManager.isItem(item)) {
			itemCount[item.id] = itemCount[item.id] + 1 || 1;
		} else if (DataManager.isWeapon(item)) {
			weaponCount[item.id] = weaponCount[item.id] + 1 || 1;
		} else if (DataManager.isArmor(item)) {
			armorCount[item.id] = armorCount[item.id] + 1 || 1;
		}
	}
	for (let item of drops) {
		if (!item) continue;
		let icon = '\x1bI[' + item.iconIndex + ']';
		let name = item.textColor ?
			'\x1bC[' + item.textColor + ']' + item.name + '\x1bC[0]':
			item.name;

		if (DataManager.isItem(item)) {
			var amount = itemCount[item.id];
			if (amount > 1) itemCount[item.id] = 0;
		} else if (DataManager.isWeapon(item)) {
			var amount = weaponCount[item.id];
			if (amount > 1) weaponCount[item.id] = 0;
		} else if (DataManager.isArmor(item)) {
			var amount = armorCount[item.id];
			if (amount > 1) armorCount[item.id] = 0;
		} else {
			continue;
		}
		if (amount > 0) {
			if (amount === 1) {
				let fmt = dingk.Loot.displaySingle;
				if (fmt) $gameMessage.add(fmt.format(icon, name));
			} else {
				let fmt = dingk.Loot.displayMultiple;
				if (fmt) $gameMessage.add(fmt.format(icon, name, amount));
			}
		}
		$gameParty.gainItem(item, 1);
	}
};

/**
 * Return random integer between two numbers (inclusive)
 * @param {Number} min
 * @param {Number} max
 * @return {Number} Random integer between min and max (inclusive)
 */
dingk.Loot.randomInt = function(min, max) {
	if (max < min) {
		let tmp = min;
		min = max;
		max = tmp;
	}
	return Math.floor(Math.random() * (max + 1 - min)) + min;
};

/**
 * Eval but faster
 * @param {String} code - Javascript code
 * @return Some value
 */
dingk.Loot.eval = function(code) {
	return Function('return ' + code)();
};