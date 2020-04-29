/*:
 * @plugindesc [v1.0.0] Create randomized tier-based loot drops within the editor.
 * @author dingk
 * @param Global Loot Tables
 * @desc Pre-define some loot tables if desired, so you don't have to remake them in the Enemies editor.
 * @type struct<DropTable>[]
 * @default ["{\"Name\":\"Sample\",\"Drop Pools\":\"[\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Common\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"55\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Rare\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"30\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Epic\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"12\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Legendary\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\"}\\\"]\"}"]
 * @param Plugin Command Settings
 * @param Display Message
 * @parent Plugin Command Settings
 * @desc Allow the game to display the message of the item drop via plugin commands.
 * @on Yes
 * @off No
 * @default true
 * @param Single Item Format
 * @parent Display Message
 * @desc The text to display when using the plugin command. Leave blank for none. %1 - Icon, %2 - Name
 * @default %1%2 found!
 * @param Multiple Items Format
 * @parent Display Message
 * @desc The text to display when using the plugin command. Leave blank for none. %1 - Icon, %2 - Name, %3 - Count
 * @default %1%2 ×%3 found!
 * @help
 * -----------------------------------------------------------------------------
 *   Introduction
 * -----------------------------------------------------------------------------
 *
 * Do you need your enemies to drop more loot or change how the game drops
 * items?
 *
 * This plugin adds a randomized tier-based loot drop mechanic to your game. 
 * You can customize loot tables in the plugin manager and set up various item 
 * pools. You can assign these loot tables to enemies or use plugin commands on
 * the map.
 *
 * Loot tables consist of different item pools, which are assigned different
 * weights. A pool with a higher weight has a higher chance of being selected.
 * A selected item pool will drop a random item that has been assigned to it.
 *
 * -----------------------------------------------------------------------------
 *   Notetags
 * -----------------------------------------------------------------------------
 *
 * In the notetags below, the keywords Item / Drop / Loot are interchangeable.
 * For example, you can use <Item Table>, <Drop Table>, or <Loot Table>.
 *
 * Item, Weapon, and Armor Notetags:
 *
 * <Loot Pool: name>
 *  - Put this item in the specified item pool.
 *  - Replace 'name' with the name of the item pool.
 *
 * Actor, Class, Weapon, Armor, and State Notetags:
 *
 * <name Weight: +n>
 * <name Weight: -n>
 * <name Weight: *n>
 *  - Adjust the weight at which an item pool is selected.
 *  - Replace 'name' with the name of the item pool.
 *  - Replace 'n' with a number (can be floating point). 
 *
 * Enemy Notetags:
 *
 * <Loot Table: name[, name, name, ...]>
 *  - Assign one or more loot tables in a comma-separated list to this enemy.
 *  - Replace 'name' with the name of the loot table.
 *
 * <Loot Table [rate]>
 * name
 * name: weight
 * name x[amount]: weight
 * name x[minAmount]-[maxAmount]: weight
 * ...
 * </Loot Table>
 *  - Create a local loot table for this enemy. Replace the following variables:
 *    - [Optional] rate : The probability that this table will drop items.
 *      Default is 100%. Replace with a decimal or percent value.
 *    - name : Name of the item or item pool. For items, you can use the names
 *      of the items or use 'Item [id]', 'Weapon [id]', or 'Armor [id]',
 *      replacing [id] with the item ID.
 *    - [amount] : Number of items to drop. Default is 1.
 *    - minAmount-maxAmount : Random range of items to drop (inclusive).
 *    - weight : Weight of the item or item pool. Default is 1.
 *  - Insert multiple of this notetag to allow multiple drops.
 * EXAMPLE:
 * <Loot Table 75%>
 * Item 3
 * Potion x2: 5
 * Common: 5
 * Common x3-5: 4
 * Rare: 1
 * </Loot Table>
 *  - There is a 75% chance that this enemy will drop an item with an ID of 3, 
 *    2 Potions, a random Common item, 3 to 5 of the same random Common item, or
 *    a random Rare item.
 *  - The total weight adds up to 16, so the Rare item has a 1/16 chance to drop,
 *    whereas the two Potions have a 5/16 chance.
 *
 * -----------------------------------------------------------------------------
 *   Plugin Commands
 * -----------------------------------------------------------------------------
 *
 * In the plugin commands below, the keywords Item / Drop / Loot are
 * interchangeable. Customize the message displayed in the plugin manager.
 *
 * GiveLootPool name [minAmount] [maxAmount]
 *  - Give the player an item from this item pool. Replace 'name' with the name
 *    of the item pool.
 *  - [Optional] Replace 'minAmount' and 'maxAmount' with the amount to give
 *    the player. Default is 1.
 *
 * GiveLootTable name
 *  - Give the player an item from this item table. Replace 'name' with the name
 *    of the item table.
 *
 * EnableLootMessage
 * DisableLootMessage
 *  - Toggle the message displayed after using the commands above on or off.
 *
 * SingleLootMessageFormat string
 * MultipleLootMessageFormat string
 *  - Change the message format. Replace 'string' with the new format.
 *    %1 - Icon, %2 - Name, %3 - Count
 *
 * ResetLootMessage
 *  - Return all loot message settings to default.
 *
 * -----------------------------------------------------------------------------
 *   Compatibility
 * -----------------------------------------------------------------------------
 * No issues found
 *
 * -----------------------------------------------------------------------------
 *   Terms of Use
 * -----------------------------------------------------------------------------
 * Free and commercial use and redistribution (under MIT License).
 *
 * -----------------------------------------------------------------------------
 *   Changelog
 * -----------------------------------------------------------------------------
 * v1.0.0 - Initial release
 */
/*~struct~DropTable:
 * @param Name
 * @desc Name of the loot table. Use <Loot Pool: name> in enemy notetags.
 * @param Drop Pools
 * @desc Define one or more pools.
 * @type struct<DropPool>[]
 */
/*~struct~DropPool:
 * @param Pool Name
 * @desc Name of this loot pool. Use an item name to drop that item only.
 * @param Weight
 * @desc The weight of this loot pool.
 * @type number
 * @min 1
 * @default 1
 * @param Min Amount
 * @desc The minimum number of items this loot pool will drop.
 * @type number
 * @min 0
 * @default 1
 * @param Max Amount
 * @desc The maximum number of items this loot pool will drop.
 * @min 0
 * @default 1
 */
var Imported=Imported||{};Imported.dingk_LootTables=!0;var dingk=dingk||{};dingk.Loot=dingk.Loot||{},dingk.Loot.version="1.0.0",dingk.Loot.filename=document.currentScript.src.match(/([^\/]+)\.js/)[1];class ItemDrop{constructor(a,b){this.kind=a,this.dataId=b}getDataItem(){switch(this.kind){case 1:return $dataItems[this.dataId];case 2:{let a=$dataWeapons[this.dataId];return Imported.YEP_ItemCore&&Imported.dingk_EquipLevels?DataManager.registerNewItem(a):a}case 3:{let a=$dataArmors[this.dataId];return Imported.YEP_ItemCore&&Imported.dingk_EquipLevels?DataManager.registerNewItem(a):a}}}}class DropPool{constructor(a,b=1,c=0,d=0,e=0,f=0){this.name=a,this._weight=Math.max(0,+b||0),this.minAmount=+c||0,this.maxAmount=+d||0,this.minAmount>this.maxAmount&&([this.minAmount,this.maxAmount]=[this.maxAmount,this.minAmount]),this.level=e,this.tier=f}set weight(a){(!a||0>a)&&(a=0),this._weight=+a||0}get weight(){return 0>this._weight&&(this._weight=0),this._weight}getAmount(){return dingk.Loot.randomInt(this.minAmount,this.maxAmount)}}class DropTable{constructor(a="",b=[],c=0,d=0,e=1){this.pools=b,this.name=a,this.minLevel=c,this.maxLevel=d,this.rate=e}insert(a){this.pools=this.pools.concat(a)}clear(){this.pools=[]}}dingk.Loot.Pools={},dingk.Loot.Tables={},dingk.Loot.params=PluginManager.parameters(dingk.Loot.filename),dingk.Loot.tablesJson=dingk.Loot.params["Global Loot Tables"],dingk.Loot.displayMsg=dingk.Loot.params["Display Message"],dingk.Loot.displaySingle=dingk.Loot.params["Single Item Format"],dingk.Loot.displayMultiple=dingk.Loot.params["Multiple Items Format"],dingk.Loot.allowStack=!0,dingk.Loot.DataManager_isDatabaseLoaded=DataManager.isDatabaseLoaded,DataManager.isDatabaseLoaded=function(){return!!dingk.Loot.DataManager_isDatabaseLoaded.call(this)&&(dingk.Loot._loaded||(this.process_dingk_Loot_lootTables(),dingk.Loot.getItemNames(),dingk.Loot.getWeaponNames(),dingk.Loot.getArmorNames(),this.process_dingk_Loot_items($dataItems),this.process_dingk_Loot_items($dataWeapons),this.process_dingk_Loot_items($dataArmors),this.process_dingk_Loot_enemies(),this.process_dingk_Loot_weights($dataActors),this.process_dingk_Loot_weights($dataClasses),this.process_dingk_Loot_weights($dataWeapons),this.process_dingk_Loot_weights($dataArmors),this.process_dingk_Loot_weights($dataStates),dingk.Loot._loaded=!0),!0)},DataManager.process_dingk_Loot_lootTables=function(){let a=JSON.parse(dingk.Loot.tablesJson);for(let b of a){let a=JSON.parse(b),c=a.Name,d=JSON.parse(a["Drop Pools"]),e=new DropTable(c);for(let a of d){let b=JSON.parse(a);e.insert(new DropPool(b["Pool Name"],b.Weight,b["Min Amount"],b["Max Amount"],0,b.Tier))}dingk.Loot.Tables[c]=e}},DataManager.process_dingk_Loot_items=function(a){const b=/<(?:drop|loot|item) pool: (.*)>/i;for(let c=1;c<a.length;c++){let d=a[c],e=d.note.split(/[\r\n]+/);for(let a of e){let e;if([,e]=a.match(b)||""){let a=dingk.Loot.getItemType(d);dingk.Loot.Pools[e]||(dingk.Loot.Pools[e]=[]),dingk.Loot.Pools[e].push(new ItemDrop(a,c))}}}},DataManager.process_dingk_Loot_enemies=function(){const a=$dataEnemies,b="(?:drop|loot|item) table",c="\\s*(\\d*\\.?\\d+?)?(%)?(?: level)?\\s*(\\d+)?-?(\\d+)?",d=[new RegExp("<"+b+c+">","i"),new RegExp("<"+b+c+": (.*)>","i"),new RegExp("</"+b+"(.*)?>","i")];for(let b,c=1;c<a.length;c++){b=a[c];const e=b.note.split(/[\r\n]+/);let f="",g=[];b.dropTables=[];for(const a of e){let c;if([,...c]=a.match(d[0])||""){if(f="drop table",g=new DropTable,c[0]){let a=+c[0];c[1]&&(a/=100),g.rate=a}if(c[2]){let a=+c[2],b=c[3]?+c[3]:a;a>b&&([a,b]=[b,a]),g.minLevel=a,g.maxLevel=b}}else if([,...c]=a.match(d[1])||""){let a,d,e;c[0]&&(a=+c[0],c[1]&&(a/=100)),c[2]&&(d=+c[2],e=c[3]?+c[3]:d,d>e&&([d,e]=[e,d]));let f=c[4].split(",").map(b=>b.trim());for(let c of f){let f=dingk.Loot.Tables[c];f&&(a&&(f.rate=a),d&&(f.minLevel=d),e&&(f.maxLevel=e),b.dropTables.push(f))}}else if(a.match(d[2]))f="",b.dropTables.push(g),g=[];else if("drop table"==f)if([,...c]=a.match(/(.*) x(\d+)-?(\d+)?:?\s*(\d+)?/i)||""){let a=c[0],b=+c[1],d=c[2]?+c[2]:b,e=c[3]?+c[3]:1;g.insert(new DropPool(a,e,b,d))}else if([,...c]=a.match(/(.*):\s*(\d+)/)||""){let a=c[0],b=+c[1];g.insert(new DropPool(a,b,1,1))}else([,c]=a.match(/(.*)/)||"")&&g.insert(new DropPool(c,1,1,1))}}},DataManager.process_dingk_Loot_weights=function(a){const b=/<(.*) weight:\s*([*+-])?(\d*.?\d+?)>/i;for(let c,d=1;d<a.length;d++){c=a[d];const e=c.note.split(/[\r\n]+/);c.lootBuffs={};for(const a of e){let d;if([,...d]=a.match(b)||""){d[1]===void 0&&(d[1]="+");let a={operation:d[1],rate:+d[2]};c.lootBuffs[d[0]]=a}}}},Game_Actor.prototype.getWeightAdjustments=function(a){let b=[this.actor().lootBuffs[a],this.currentClass().lootBuffs[a]],c=this.states();for(let d of c)d&&b.push(d.lootBuffs[a]);let d=this.equips();for(let c of d)c&&b.push(c.lootBuffs[a]);return b},dingk.Loot.Game_Enemy_makeDropItems=Game_Enemy.prototype.makeDropItems,Game_Enemy.prototype.makeDropItems=function(){if(Imported.MOG_TrPopUpBattle&&this._treasure.checked)return this._treasure.item;let a=dingk.Loot.Game_Enemy_makeDropItems.call(this);if(this.enemy().dropTables){let b=this.getDropCategory();b&&b.length&&(a=a.concat(this.getItemsFromPool(b)))}return a},Game_Enemy.prototype.getDropCategory=function(){let a=[];for(let b of this.enemy().dropTables){if(b.rate*this.dropItemRate()<Math.random())continue;let c=dingk.Loot.getDropCategory(b);c&&a.push(c)}return a},Game_Enemy.prototype.getItemsFromPool=function(a){if(Imported.dingk_EquipLevels&&dingk.EL.enableEnemyLevels){if(Imported.YEP_EnemyLevels)return dingk.Loot.getItemsFromPool(a,this.level);if(Imported.EnemyLevels)return dingk.Loot.getItemsFromPool(a,this.level())}return dingk.Loot.getItemsFromPool(a)},dingk.Loot.GI_pluginCommand=Game_Interpreter.prototype.pluginCommand,Game_Interpreter.prototype.pluginCommand=function(a,b){dingk.Loot.GI_pluginCommand.call(this,a,b);let c=a.toUpperCase(),d="(?:drop|loot|item)",e=new RegExp("give"+d+"pool","i"),f=new RegExp("give"+d+"table","i");if(c.match(e)){let a=+b[1]||1,c=+b[2]||a,d=new DropPool(b[0],1,a,c),e=dingk.Loot.getItemsFromPool([d]);dingk.Loot.giveDrops(e)}else if(c.match(f)){let a=b[0],c=dingk.Loot.Tables[a],d=dingk.Loot.getDropCategory(c),e=dingk.Loot.getItemsFromPool([d]);dingk.Loot.giveDrops(e)}else c.match(/EnableLootMessage/i)?dingk.Loot.displayMsg=!0:c.match(/DisableLootMessage/i)?dingk.Loot.displayMsg=!1:c.match(/SingleLootMessageFormat/i)?dingk.Loot.displaySingle=b.join(" "):c.match(/MultipleLootMessageFormat/i)?dingk.Loot.displayMultiple=b.join(" "):c.match(/ResetLootMessage/i)&&(dingk.Loot.displayMsg=dingk.Loot.params["Display Message"],dingk.Loot.displaySingle=dingk.Loot.params["Single Item Format"],dingk.Loot.displayMultiple=dingk.Loot.params["Multiple Items Format"])},Game_Party.prototype.getWeightAdjustments=function(a){let b=Object.assign(new DropTable,a);b.clear();for(let c of a.pools){let a=Object.assign(new DropPool,c),[d,e]=[0,1];for(let a of this.battleMembers()){let b=a.getWeightAdjustments(c.name);for(let a of b)a&&(a.operation.includes("*")?e*=a.rate:a.operation.includes("-")?d-=a.rate:d+=a.rate)}a.weight=a.weight*e+d,b.insert(a)}return b},dingk.Loot.getItemNames=function(){if(!dingk.ItemIds){dingk.ItemIds={};let a=$dataItems;for(let b=1;b<a.length;b++)a[b].name&&(dingk.ItemIds[a[b].name]=b)}},dingk.Loot.getWeaponNames=function(){if(!dingk.WeaponIds){dingk.WeaponIds={};let a=$dataWeapons;for(let b=1;b<a.length;b++)a[b].name&&(dingk.WeaponIds[a[b].name]=b)}},dingk.Loot.getArmorNames=function(){if(!dingk.ArmorIds){dingk.ArmorIds={};let a=$dataArmors;for(let b=1;b<a.length;b++)a[b].name&&(dingk.ArmorIds[a[b].name]=b)}},dingk.Loot.getItemType=function(a){return DataManager.isItem(a)?1:DataManager.isWeapon(a)?2:DataManager.isArmor(a)?3:void 0},dingk.Loot.getItemsFromPool=function(a,b){let c,d,e=[];for(let f of a){let a=dingk.Loot.randomInt(f.minAmount,f.maxAmount);if(dingk.ItemIds[f.name])c=$dataItems[dingk.ItemIds[f.name]];else if(dingk.WeaponIds[f.name])c=$dataWeapons[dingk.WeaponIds[f.name]];else if(dingk.ArmorIds[f.name])c=$dataArmors[dingk.ArmorIds[f.name]];else if([,...d]=f.name.match(/(ITEM|WEAPON|ARMOR)\s*(\d+)/i)||"")d[0].match(/ITEM/i)?c=$dataItems[d[1]]:d[0].match(/WEAPON/i)?c=$dataWeapons[d[1]]:d[0].match(/ARMOR/i)&&(c=$dataArmors[d[1]]);else{let a=dingk.Loot.Pools[f.name];if(!a)continue;c=a[Math.randomInt(a.length)].getDataItem()}if(Imported.YEP_ItemCore&&Imported.dingk_EquipLevels&&!DataManager.isItem(c)){let d=ItemManager.registerEquipLevel(c,b);for(let b=0;d&&b<a;b++)e.push(d)}else for(let b=0;c&&b<a;b++)e.push(c)}return e},dingk.Loot.getDropCategory=function(a){if(!a)return;let b=$gameParty.getWeightAdjustments(a),c=b.pools,d=c.reduce((b,a)=>b+a.weight,0),e=Math.random()*d,f=0;for(let b of c)if(f+=b.weight,e<f)return b},dingk.Loot.giveDrops=function(a){let b={},c={},d={};for(let e of a)DataManager.isItem(e)?b[e.id]=b[e.id]+1||1:DataManager.isWeapon(e)?c[e.id]=c[e.id]+1||1:DataManager.isArmor(e)&&(d[e.id]=d[e.id]+1||1);for(let f of a){if(!f)continue;let a="\x1BI["+f.iconIndex+"]",g=f.textColor?"\x1BC["+f.textColor+"]"+f.name+"\x1BC[0]":f.name;if(DataManager.isItem(f)){var e=b[f.id];1<e&&(b[f.id]=0)}else if(DataManager.isWeapon(f)){var e=c[f.id];1<e&&(c[f.id]=0)}else if(DataManager.isArmor(f)){var e=d[f.id];1<e&&(d[f.id]=0)}else continue;if(dingk.Loot.displayMsg&&0<e)if(1===e){let b=dingk.Loot.displaySingle;b&&$gameMessage.add(b.format(a,g))}else{let b=dingk.Loot.displayMultiple;b&&$gameMessage.add(b.format(a,g,e))}$gameParty.gainItem(f,1)}},dingk.Loot.randomInt=function(a,b){return b<a&&([a,b]=[b,a]),Math.floor(Math.random()*(b+1-a))+a},dingk.Loot.eval=function(a){return Function("return "+a)()};