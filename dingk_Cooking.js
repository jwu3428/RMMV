var Imported = Imported || {};
Imported.dingk_Cooking = true;

var dingk = dingk || {};
dingk.Cooking = dingk.Cooking || {};
dingk.Cooking.version = 1.0;

/*:
 * @plugindesc A cooking system that allows a player to select their own 
 * ingredients.
 * @author dingk
 *
 * @param Max number of ingredients
 * @desc Number of ingredients the player can use to cook an item
 * @type number
 * @default 3
 *
 * @param Item ID of failsafe result
 * @desc The result of a failed cooking process (the cooking mistake)
 * (0 to get nothing)
 * @type number
 * @min 0
 * @default 0
 *
 * @param Ingredient List Variable ID
 * @desc Variable to store ingredient list
 * @type number
 * @min 0
 * @default 0
 * 
 * @param Result Variable ID
 * @desc Variable to store cooking result
 * @type number
 * @min 0
 * @default 0
 *
 * @param Auto Stats Determination
 * @desc (Requires YEP_ItemCore) Let the plugin determine the stats of the 
 * result.
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * 
 * @help
 * -----------------------------------------------------------------------------
 *   Introduction
 * -----------------------------------------------------------------------------
 * This plugin allows a player to craft an item based on the combination of 
 * ingredients they have chosen. If you've ever played, the Legend of Zelda: 
 * Breath of the Wild, this is basically that cooking system. By assigning 
 * items with this plugin's notetags, you can create a custom cooking system.
 *
 * How this plugin works:
 *  > Assign an item an ingredient category.
 *  > Give it an ingredient value.
 *  > Assign cooked food a value requirement. The total value of the ingredients
 *    used will be compared to the items database to output one food item.
 *  > Define the recipe using the ingredient categories.
 *  > Example: Assign 'Apple' the category 'Fruit' and value '+5'. Assign cooked
 *    food 'Fruit Dish' value '+5' and 'Super Fruit Dish' value '+10', both 
 *    requiring 'Fruit'. Cooking one Apple will result in a total value of +5 
 *    and output 'Fruit Dish', but cooking two Apples will have total value +10 
 *    and output 'Super Fruit Dish'.
 *
 * -----------------------------------------------------------------------------
 *   Plugin Parameters
 * -----------------------------------------------------------------------------
 * Max number of ingredients
 *  > How many ingredients do you want the player to be able to choose at max.
 *
 * Item ID of failsafe result
 *  > What you want the cooked food to end up as if the ingredients used don't 
 *    match any recipe. Use 0 if you don't want to get anything.
 *
 * Ingredient List Variable ID
 *  > Store the chosen ingredients in this variable (0 to not store them).
 *
 * Result Variable ID
 *  > Store the cooking result in this variable (0 to not store).
 *
 * -----------------------------------------------------------------------------
 *   Notetags
 * -----------------------------------------------------------------------------
 * <Ingredient string Value: +a>
 * <Ingredient string Value: -a>
 *  > Assign the item an ingredient category (string) and give it a value.
 *
 * <Ingredient Value Required: +a>
 * <Ingredient Value Required: -a>
 *  > Assign the resulting food a required value.
 *
 * <Ingredients Required>
 * string[: a]
 * string[: a]
 * ...
 * </Ingredients Required>
 *  > Define the recipe with 'string' being the ingredient category.
 *    (Optional: 'a' is the amount of items required.) 
 *
 * <Ingredients Optional>
 * string
 * ...
 * </Ingredients Optional>
 *  > Allow an optional ingredient. More useful with YEP_ItemCore.
 *
 *  !!! YEP_ItemCore Dependency !!!
 * The following notetags require YEP_ItemCore and independent items enabled. 
 * This allows the plugin to automatically determine the stats and effects of 
 * the cooked item. Cooked items will inherit the effects of the ingredients.
 *
 * <Restrict Effect Copy>
 *  > By default, effects of the ingredients will copy over to the result. 
 *    Use this notetag to ignore any ingredient effects and define your own.
 * 
 * <Ingredient stat Recover: a>
 *  > Replace stat with HP, MP, or TP. When using this ingredient, the result 
 *    will recover 'a' amount of HP/MP/TP when consumed.
 *
 * <Ingredient State Clear: a[, b, c ...]>
 *  > When using this ingredient, the result will clear the specified State IDs  
 *    when consumed.
 *
 * <Ingredient State Category Clear: string>
 * <Ingredient a State Category Clear: string>
 *  > Requires YEP_X_StateCategories.js. If you are using this plugin, you can 
 *    remove all or 'a' number of states with category 'string'.
 *
 * <Ingredient State Add: a[, b, ...]>
 *  > When using this ingredient, the result will add the specified State IDs  
 *    when consumed.
 *
 * <Ingredient stat Buff Add: a>
 *  > Replace 'stat' with HP, MP, ATK, DEF, MAT, MDF, AGI, or LUK. When using 
 *    this ingredient, the result will add a buff for 'a' turns when consumed.
 *    Add multiples of this notetag if you want multiple stacks of buffs.
 *
 * -----------------------------------------------------------------------------
 *   Plugin Commands
 * -----------------------------------------------------------------------------
 * ShowCooking
 *  > Show the select item window to allow players to select ingredients. 
 *    Ingredients will be removed from inventory.
 *
 * StartCooking
 *  > Process the select ingredients and store the result in memory.
 *
 * GiveCooking
 *  > Add the result into the player's inventory.
 *
 * CancelCooking
 *  > Return the ingredients to the player's inventory.
 *
 * -----------------------------------------------------------------------------
 *   Script Calls
 * -----------------------------------------------------------------------------
 * $dingkCooking.getIngredientList()
 *  > Return the names of the ingredients selected in an array. 
 */
 
dingk.Cooking.params = PluginManager.parameters('dingk_Cooking');
dingk.Cooking.maxIngredients = Number(dingk.Cooking.params['Max number of ingredients']) || 3;
dingk.Cooking.mistakeItemId = Number(dingk.Cooking.params['Item ID of failsafe result']) || 0;
dingk.Cooking.listVarId = Number(dingk.Cooking.params['Ingredient List Variable ID']) || 0;
dingk.Cooking.resultVarId = Number(dingk.Cooking.params['Result Variable ID']) || 0;
dingk.Cooking.autoStats = dingk.Cooking.params['Auto Stats Determination'] === 'true';

var $dingkCooking = false;

dingk.Cooking.paramIds = ['HP', 'MP', 'ATK', 'DEF', 'MAT', 'MDF', 'AGI', 'LUK'];
for (let i in dingk.Cooking.paramIds) {
	dingk.Cooking.paramIds[dingk.Cooking.paramIds[i]] = Number(i);
	delete dingk.Cooking.paramIds[i];
};
 
//------------------------------------------------------------------------------
// DataManager
//------------------------------------------------------------------------------

dingk.Cooking.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!dingk.Cooking.DataManager_isDatabaseLoaded.call(this)) return false;
	if (!dingk.Cooking._loaded) {
		this.process_dingk_Cooking_notetags($dataItems);
		dingk.Cooking._loaded = true;
	}
	return true;
};

DataManager.process_dingk_Cooking_notetags = function(group) {
	var note1 = /<INGREDIENT (.*) VALUE:[ ]([\+\-]\d+)>/i;
	var note2 = /<INGREDIENT VALUE REQUIRED:[ ]([\+\-]\d+)>/i;
	var notex1 = /<INGREDIENT (.*) RECOVER:[ ](-?\d+)>/i;
	var notex2 = /<INGREDIENT STATE (\d+) REMOVE:[ ](\d+)%>/i;
	var notex3 = /<INGREDIENT STATE CATEGORY REMOVE:[ ](.*)>/i;
	var notex4 = /<INGREDIENT (\d+) STATE CATEGORY REMOVE:[ ](.*)>/i;
	var notex5 = /<INGREDIENT STATE (\d+) ADD:[ ](\d+)%>/i;
	var notex6 = /<INGREDIENT (.*) BUFF ADD:[ ](\d+)>/i;
	for (var n = 1; n < group.length; n++) {
		var obj = group[n];
		var notedata = obj.note.split(/[\r\n]+/);
		var mode = '';
		obj.ingredientValue = [];
		obj.ingredientValueRequired = 0;
		obj.cookRecipe = [];
		obj.cookOptional = [];
		obj.restrictEffect = false;
		obj.ingredientRecover = [0, 0, 0];
		obj.ingredientStateRemove = [];
		obj.ingredientStateAdd = [];
		obj.ingredientStatBuff = [];
		
		for (var i = 0; i < notedata.length; i++) {
			if (notedata[i].match(note1)) {
				var key = RegExp.$1.toUpperCase().trim();
				obj.ingredientValue[key] = parseInt(RegExp.$2);
			} else if (notedata[i].match(note2)) {
				obj.ingredientValueRequired += parseInt(RegExp.$1);
			} else if (notedata[i].match(/<INGREDIENTS REQUIRED>/i)) {
				mode = 'required';
			} else if (notedata[i].match(/<\/INGREDIENTS REQUIRED>/i)) {
				mode = '';
			} else if (notedata[i].match(/<INGREDIENTS OPTIONAL>/i)){
				mode = 'optional';
			} else if (notedata[i].match(/<\/INGREDIENTS OPTIONAL>/i)) {
				mode = '';
			} else if (notedata[i].match(/<RESTRICT EFFECT COPY>/i)) {
				obj.restrictEffect = true;
			} else if (notedata[i].match(notex1)) {
				var stat = RegExp.$1.toUpperCase().trim();
				var amount = parseInt(RegExp.$2);
				if (stat === 'HP')
					obj.ingredientRecover[0] += amount;
				else if (stat === 'MP')
					obj.ingredientRecover[1] += amount;
				else if (stat === 'TP')
					obj.ingredientRecover[2] += amount;
			} else if (notedata[i].match(notex2)) {
				var stateId = parseInt(RegExp.$1);
				var chance = parseInt(RegExp.$2) / 100;
				var effect = {
					code: Game_Action.EFFECT_REMOVE_STATE,
					dataId: stateId,
					value1: chance,
					value2: 0
				};
				obj.ingredientStateRemove.push(effect);
			} else if (notedata[i].match(notex3) && 
					   Imported.YEP_X_StateCategories) {
				var category = RegExp.$1.toUpperCase().trim();
				obj.ingredientStateRemove[category] = 'ALL';
			} else if (notedata[i].match(notex4) &&
					   Imported.YEP_X_StateCategories) {
				var value = parseInt(RegExp.$1);
				var category = RegExp.$2.toUpperCase().trim();
				obj.ingredientStateRemove[category] = value;
			} else if (notedata[i].match(notex5)) {
				var stateId = parseInt(RegExp.$1);
				var chance = parseInt(RegExp.$2) / 100;
				var effect = {
					code: Game_Action.EFFECT_ADD_STATE,
					dataId: stateId,
					value1: chance,
					value2: 0
				};
				obj.ingredientStateAdd.push(effect);
			} else if (notedata[i].match(notex6)) {
				var stat = RegExp.$1.toUpperCase().trim();
				var param = dingk.Cooking.paramIds[stat];
				var turns = parseInt(RegExp.$2);
				if(param === undefined || !turns) continue;
				var effect = { 
					code: Game_Action.EFFECT_ADD_BUFF,
					dataId: param,
					value1: turns,
					value2: 0
				};
				obj.ingredientStatBuff.push(effect);
			} else if (mode === 'required') {
				if (notedata[i].match(/(.*)/i)) {
					var key = RegExp.$1.toUpperCase().trim();
					obj.cookRecipe[key] = 
						(obj.cookRecipe[key] || 0) + 1;
				} else if (notedata[i].match(/(.*):[ ](\d+)/i)) {
					var key = RegExp.$1.toUpperCase().trim();
					var val = parseInt(RegExp.$2);
					obj.cookRecipe[key] = 
						(obj.cookRecipe[key] || 0 ) + val;
				}
			} else if (mode === 'optional') {
				if (notedata[i].match(/(.*)/i))
					obj.cookOptional.push(RegExp.$1.toUpperCase().trim());
			}
		}
	}
};

dingk.Cooking.DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
	dingk.Cooking.DataManager_createGameObjects.call(this);
	$dingkCooking = new Dingk_Cooking();
};

//------------------------------------------------------------------------------
// ItemManager
//------------------------------------------------------------------------------

dingk.Cooking.IM_setNewIndependentItem = ItemManager.setNewIndependentItem;
ItemManager.setNewIndependentItem = function(baseItem, newItem) {
	dingk.Cooking.IM_setNewIndependentItem.call(this, baseItem, newItem);
	newItem.ingredientValue = Object.assign({}, baseItem.ingredientValue);
	newItem.cookRecipe = Object.assign({}, baseItem.cookRecipe);
};

//------------------------------------------------------------------------------
// Dingk_Cooking
//
// New object to govern cooking process
//------------------------------------------------------------------------------

function Dingk_Cooking() {
	this.initialize.apply(this, arguments);
};

Dingk_Cooking.prototype.initialize = function() {
	this._isCooking = false;
	this._ingredientList = [];
};

Dingk_Cooking.prototype.getIngredientList = function() {
	if (dingk.Cooking.listVarId) {
		var items = [];
		for (var i of this._ingredientList) {
			items.push('\x1bI[' + i.iconIndex + ']' + i.name);
		}
		$gameVariables.setValue(dingk.Cooking.listVarId, items.join(', '));
	}
	console.log(this._ingredientList);
	return this._ingredientList;
};

Dingk_Cooking.prototype.hasIngredients = function() {
	if (this._ingredientList.length) return true;
	return false;
};

Dingk_Cooking.prototype.getResult = function() {
	if (this._result && dingk.Cooking.resultVarId) {
		$gameVariables.setValue(dingk.Cooking.resultVarId, 
			'\x1bI[' + this._result.iconIndex + ']' + this._result.name);
	}
	console.log(this._result);
	return this._result;
};

Dingk_Cooking.prototype.isSuccess = function() {
	if (!this._result) return false;
	return this._result.id !== dingk.Cooking.mistakeItemId;
};

Dingk_Cooking.prototype.start = function() {
	var totalValue = 0;
	var categoryCount = [];
	var result = $dataItems[dingk.Cooking.mistakeItemId];
	var prevMaxValue = -1;
	var ingList = this._ingredientList;
	for (var n = 0; n < ingList.length; n++) {
		for (var i in ingList[n].ingredientValue) {
			var val = ingList[n].ingredientValue[i];
			totalValue += val;
			categoryCount[i] = (categoryCount[i] || 0) + 1;
		}
	}
	
	var items = $dataItems;
	var recipeMatch = false;
	for (var n = 1; n < items.length; n++) {
		var item = items[n];
		var cc = Object.keys(categoryCount).length;
		if (!item) continue;
		if (!Object.keys(item.cookRecipe).length) continue;
		if (totalValue < item.ingredientValueRequired) continue;
		for (var i in item.cookRecipe) {
			console.log(categoryCount);
			if (!categoryCount[i]) {
				recipeMatch = false;
			} else if (categoryCount[i] >= item.cookRecipe[i]) {
				recipeMatch = true;
				cc--;
			}
		}
		if (cc > 0 && recipeMatch) {
			for (var opt of item.cookOptional) {
				if (Object.keys(categoryCount).contains(opt))
					cc--;
			}
		}
		if (cc > 0)
			recipeMatch = false;
		if (recipeMatch) {
			if (item.ingredientValueRequired > prevMaxValue) {
				prevMaxValue = item.ingredientValueRequired;
				result = item;
			}
			recipeMatch = false;
		}
	}
	if (Imported.YEP_ItemCore && 
		result && result.id !== dingk.Cooking.mistakeItemId) {
		var newItem = DataManager.registerNewItem(result);
		this.copyEffects(result, newItem);
		result = newItem;
	}
	this._result = result;
	this._ingredientList = [];
	this.getResult();
};

Dingk_Cooking.prototype.give = function() {
	$gameParty.gainItem(this._result, 1);
	this._result = null;
};

Dingk_Cooking.prototype.cancel = function() {
	for (var ing of this._ingredientList) {
		$gameParty.gainItem(ing, 1);
	}
	this._ingredientList = [];
};

Dingk_Cooking.prototype.copyEffects = function(baseItem, newItem) {
	if (!Imported.YEP_ItemCore) return;
	if (baseItem.restrictEffect) return;
	
	var recoverPercent = [0, 0];
	var recover = [0, 0, 0];
	for (var item of this._ingredientList) {
		recover = recover.map((el, i) => el + item.ingredientRecover[i]);
		for (var effect of item.effects) {
			if (effect.code === Game_Action.EFFECT_RECOVER_HP) {
				recover[0] += effect.value2;
			}
			else if (effect.code === Game_Action.EFFECT_RECOVER_MP)
				recover[1] += effect.value2;
			else if (effect.code === Game_Action.EFFECT_GAIN_TP)
				recover[2] += effect.value1;
			else
				newItem.effects.push(effect);
		}
		
		newItem.effects = newItem.effects.concat(item.ingredientStatBuff);
		newItem.effects = newItem.effects.concat(item.ingredientStateAdd);
		newItem.effects = newItem.effects.concat(item.ingredientStateRemove);
		
		if (Imported.YEP_X_StateCategories) {
			for (var i in item.removeCategory) {
				newItem.removeCategory[i] = item.removeCategory[i];
			}
		}
	}
	
	if (recover[0]) {
		newItem.effects.push({
			code: Game_Action.EFFECT_RECOVER_HP,
			dataId: 0,
			value1: 0,
			value2: recover[0]
		});
	}
	if (recover[1]) {
		newItem.effects.push({
			code: Game_Action.EFFECT_RECOVER_MP,
			dataId: 0,
			value1: 0,
			value2: recover[1]
		});
	}
	if (recover[2]) {
		newItem.effects.push({
			code: Game_Action.EFFECT_GAIN_TP,
			dataId: 0,
			value1: recover[2],
			value2: 0
		});
	}
};

//------------------------------------------------------------------------------
// Game_Interpreter
//------------------------------------------------------------------------------

dingk.Cooking.GI_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	dingk.Cooking.GI_pluginCommand.call(this, command, args);
	if (command === "ShowCooking") {
		if (!$gameMessage.isBusy()) {
			$gameMessage.add('\\>Choose the ingredients.');
			$dingkCooking._isCooking = true;
			//this._index++;
			this.setWaitMode('message');
		}
	} else if (command === "StartCooking") {
		$dingkCooking.start();
	} else if (command === "GiveCooking") {
		$dingkCooking.give();
	} else if (command === "CancelCooking") {
		$dingkCooking.cancel();
	}
};

//------------------------------------------------------------------------------
// Game_Message
//------------------------------------------------------------------------------

Game_Message.prototype.isCooking = function() {
	return $dingkCooking._isCooking;
};

dingk.Cooking.GM_isBusy = Game_Message.prototype.isBusy;
Game_Message.prototype.isBusy = function() {
	return dingk.Cooking.GM_isBusy.call(this) || this.isCooking();
};

//------------------------------------------------------------------------------
// Window_Cooking
// - Select ingredients
//------------------------------------------------------------------------------

function Window_Cooking() {
	this.initialize.apply(this, arguments);
};

Window_Cooking.prototype = Object.create(Window_ItemList.prototype);
Window_Cooking.prototype.constructor = Window_Cooking;

Window_Cooking.prototype.initialize = function(messageWindow) {
	this._messageWindow = messageWindow;
	var width = Graphics.boxWidth;
	var height = this.windowHeight();
	Window_ItemList.prototype.initialize.call(this, 0, 0, width, height);
	this._ingredientList = [];
	this._ingredientSelectCount = 0;
	this.openness = 0;
	this.deactivate();
	this.setHandler('ok', this.onOk.bind(this));
	this.setHandler('cancel', this.onCancel.bind(this));
};

Window_Cooking.prototype.windowHeight = function() {
	return this.fittingHeight(this.numVisibleRows());
};

Window_Cooking.prototype.numVisibleRows = function() {
	return 4;
};

Window_Cooking.prototype.includes = function(item) {
	return DataManager.isItem(item) && Object.keys(item.ingredientValue).length > 0;
};

Window_Cooking.prototype.updatePlacement = function() {
	if (this._messageWindow.y >= Graphics.boxHeight / 2) {
		this.y = 0;
	} else {
		this.y = Graphics.boxHeight - this.height;
	}
};

Window_Cooking.prototype.start = function() {
	$dingkCooking._ingredientList = [];
	this.refresh();
	this.updatePlacement();
	this.select(0);
	this.open();
	this.activate();
};

Window_Cooking.prototype.isEnabled = function(item) {
	return true;
};

Window_Cooking.prototype.onOk = function() {
	var item = this.item();
	this._ingredientList.push(item);
	$gameParty.loseItem(item, 1);
	this._ingredientSelectCount++;
	if (this._ingredientSelectCount >= dingk.Cooking.maxIngredients) {
		this.onCancel();
	}
};

Window_Cooking.prototype.onCancel = function() {
	if (this._ingredientSelectCount > 0) {
		$dingkCooking._ingredientList = this._ingredientList;
		$dingkCooking.getIngredientList();
		this._ingredientSelectCount = 0;
		this._ingredientList = [];
	}
	$dingkCooking._isCooking = false;
	this._messageWindow.terminateMessage();
	this.close();
};

//------------------------------------------------------------------------------
// Window_Message
//------------------------------------------------------------------------------

dingk.Cooking.WM_createSubWindows = Window_Message.prototype.createSubWindows;
Window_Message.prototype.createSubWindows = function() {
	dingk.Cooking.WM_createSubWindows.call(this);
	this._cookingWindow = new Window_Cooking(this);
};

dingk.Cooking.WM_startInput = Window_Message.prototype.startInput;
Window_Message.prototype.startInput = function() {
	if ($gameMessage.isCooking()) {
		this._cookingWindow.start();
		return true;
	} else {
		return dingk.Cooking.WM_startInput.call(this);
	}
};

dingk.Cooking.WM_subWindows = Window_Message.prototype.subWindows;
Window_Message.prototype.subWindows = function() {
	var win = dingk.Cooking.WM_subWindows.call(this);
	win.push(this._cookingWindow);
	return win;
};

dingk.Cooking.WM_isAnySubWindowActive = Window_Message.prototype.isAnySubWindowActive;
Window_Message.prototype.isAnySubWindowActive = function() {
	return dingk.Cooking.WM_isAnySubWindowActive.call(this) || 
		   this._cookingWindow.active;
};
