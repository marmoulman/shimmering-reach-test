"use strict";           // enforces better coding practices in js

function init(text)                                                                     //update HTML to match saved values
{
        abilityTable.abilities = text;
        console.log('Initializing...');
        $("#abilityTableBody").empty();
        document.getElementById("characterpoints").innerHTML=character.cpCurrent;
        Object.keys(text).forEach(function(key) {                                       //For each ability on the list, generate it a row on the 'add ability' table (unless you already have it)
            if (abilityTable.selectedAbilities.includes(key))
            {
                console.log(key);
            }
            else
            {
                abilityTable.addRow(key,text[key]);
            }
        })
    $("#modalAbilityTable").DataTable();
}();

function increaseItem(type, skill, btn)                                                 //This and 'decrease item' function check to see if the stat can increase (works with both ability and tradition, easy change to work with skills). The increases them and pays appropriate CP costs
{
    if (character[type].canIncrease(character[type][skill], [skill]))
    {
        character[type][skill] ++;
        document.getElementById(type +"-" + skill).innerHTML = character[type][skill];

        if (!"wubrg".includes(skill)){
            character.cpCurrent += character[type].incStat(character[type][skill], [skill]);
            document.getElementById("characterpoints").innerHTML = character.cpCurrent;
        }
    }
    else
    {
        document.getElementById('prompt').innerHTML = "This stat cannot be changed anymore!";
    }
}

function decreaseItem(type, skill, btn)
{
    if (character[type].canDecrease(character[type][skill], [skill]))
    {
        character[type][skill] --;
        document.getElementById(type + "-" + skill).innerHTML = character[type][skill];
        if(!"wubrg".includes(skill)){
            character.cpCurrent += character[type].decStat(character[type][skill]);
            document.getElementById("characterpoints").innerHTML = character.cpCurrent;
        }
    }
    else
    {
        document.getElementById('prompt').innerHTML = "This stat cannot be decreased anymore!";
    }
}

var abilityTable =
{
    abilities : {},
    selectedAbilities : [],
    addRow(key, data)                                               //function to add a row to the table
    {
       let table = document.getElementById("abilityTableBody");
       let row = table.insertRow();
        for (var item in data)                                      //for every subitem associated with the KEY (name, affinity cost, rules text, etc.)
        {
            let cell = row.insertCell();                            // add a cell and modify the text in it based on the below code.
            (item === "AbilityNames") ?
                cell.outerHTML = `<th><div class="abilityLine" onclick="selectedAbility('${key}');">${key}</div></th>` :                    //This one bolds
                cell.innerHTML = `<td><div class="abilityLine" onclick="selectedAbility('${key}');">${data[item]}</div></td>`;
        }
    }
}

function selectedAbility(key)                                                                       //this is the function that handles an ability selection from the modal window.
{
    var aff = new affinityCost(abilityTable.abilities[key]["Affinity"]);                            //create new affinity object for this ability
    var affinityCostCheck = aff.checkIfAvailable(character.trad);                                   //can you afford it?
    console.log(abilityTable.abilities[key]["Affinity"]);
    console.log('can you afford ' + key + '?:    ' + affinityCostCheck);
    if (character.cpCurrent + parseInt(abilityTable.abilities[key]["CP cost"]) > character.cpMax)   //a couple of conditions, flashing warnings if you don't have the right tradition or character points
    {
        alert("You don't have enough Character Points for that ability!");
    }
    else if (!affinityCostCheck)
    {
        alert("You don't have the right tradition for this ability!");
    }
    else                                                                                        //if you reach here, you have enough CP and trad to get the ability
    {
        let table = document.getElementById('abilityTableSelectedBody');
        let row = table.insertRow();
        for (var item in abilityTable.abilities[key])
        {
            let cell = row.insertCell();
            switch(item){                                                                       //check what part of the ability is being copied
                case "abilityNames":
                    cell.outerHTML = `<th>${key}</th>`;                                         //if its the name, bold it
                    break;
                case "Affinity":                                                                // if its the affinity, add badge formatting (see below in the affinity class)
                    for (var i=0;i<aff.arr.length;i++)
                    {
                        aff.addBadgeFormatting(aff.arr[i]);
                        if ((i+1<aff.arr.length)) aff.formatted = aff.formatted.concat(', ');       //add a comma if there is more to come.
                    }
                    cell.innerHTML = aff.formatted;
                    break;
                default:                                                                        //otherwise write it normally
                    cell.innerHTML = `<td>${abilityTable.abilities[key][item]}</td>`;
                    break;
            }
        }
        abilityTable.selectedAbilities.push(key);                                                   //add item to the 'selected abilities' list
        $("#abilityTableBody").empty();
        $("#closeModal").trigger("click");                                                          //bootstrap was throwing a fit when I tried to close this the normal way, I think the .modal class isn't available through flask. This works just fine, but it feels a bit weird
        character.cpCurrent += parseInt(abilityTable.abilities[key]["CP cost"]);                    //update CPcost to reflect ability cost
        document.getElementById("characterpoints").innerHTML = character.cpCurrent;
    }
}


class Character {           //this is a character class.
    constructor(playerName, characterName, bod, agi, rea, str, wil, int, log, cha, luk, cpMax, cpCurrent, trad, w,u,b,r,g)
    {
        this.playerName = playerName;
        this.characterName = characterName;

        this.abi = {                                            //Store all ability scores and functions that mess with the ability scores here.
            bod: bod,
            agi: agi,
            rea: rea,
            str: str,
            wil: wil,
            int: int,
            log: log,
            cha: cha,
            luk: luk,
            incStat(x) {return (x**2 + x-2)*2.5 - ((x-1)**2 + (x-1)-2)*2.5;},           //replace these function math with inputted strings from a JSON file if applicable
            decStat(x) {return (x**2 + x-2)*2.5 - ((x+1)**2 + (x+1)-2)*2.5;},
            canIncrease(x,y) {return (this.incStat(x+1) + this.parent.cpCurrent > this.parent.cpMax) ? false: true;},
            canDecrease(x,y) {return (x > 1) ? true: false;}
        };
        this.abi.parent = this;                                 //Add a reference to the parent character element, so that the ability method has access to 'CPMAX'

        this.trad = {                                           //Store all traditions and tradition accessories here. Might be worth moving the functions for 'affinity' over here?
            trad: trad,
            w: w,
            u: u,
            b: b,
            r: r,
            g: g,
            incStat(x) {return (x**2 + 7*x-8)*2.5 - ((x-1)**2 + 7*(x-1)-8)*2.5;},
            decStat(x) {return (x**2 + 7*x-8)*2.5 - ((x+1)**2 + 7*(x+1)-8)*2.5;},
            canIncrease(x,y){
                switch(y[0]){
                    case 'trad': return (this.incStat(x) + this.parent.cpCurrent > this.parent.cpMax) ? false: true;
                    default: return (this.w + this.u + this.b + this.r + this.g + 1 > 3*this.trad) ? false: true;
                }
            },
            canDecrease(x,y) {return (x > 1) ? true: false;}
        }
        this.trad.parent = this;                                // Add a reference to the parent function so this has access to 'CPMAX'

        this.cpMax=cpMax;
        this.cpCurrent=cpCurrent;
    }
}

class affinityCost {
    constructor (str) {
        this.raw=str                                                    //not used currently.
        this.arr= str.match(/\d?\d?\(([^)]+)\)|\d?\d?[a-zA-Z]|\d\d?/g);       //yikes. this is the regex to break a full string into the bits we want
        this.formatted = "";                                            //use this to store the HTML for displaying the fun mana bars
    }

    addBadgeFormatting(str){                                            //takes individual substring and puts it in fancy colored badge.
        var finalstr = "";
        var tmpstr = str.replace('(','').replace(')','');
        var leadingNumber = /^\d?\d?/.exec(str)[0];                     //if there is a number, pull it out so you can put it w the color later
        tmpstr = !leadingNumber ? tmpstr: tmpstr.substring(leadingNumber.length);
        var colorless = !/[a-zA-Z]/.exec(str) ? " Total": "";            //if there's no color specified, set a flag for later

        tmpstr = tmpstr.split('|');                                     //split the string if it is an 'or'
        for(var i=0;i<tmpstr.length;i++)
        {
            var needsOr = i+1<tmpstr.length ? " or ": "";
            finalstr = finalstr.concat(selectColor(tmpstr[i], needsOr, leadingNumber, colorless));      //generate HTML text based on the inputted color (or lack thereof) of the tradition. Also checks if an 'or ' is needed for U|R or stuff like that
        }
        this.formatted = this.formatted.concat(finalstr);


        function selectColor(color, or="", num="", colorless="")            //This is a switch statement that changes the HTML formatting to reflect the color of the tradition.
        {
            var formatText = "";
            switch(color)
            {
                case 'W':
                    formatText = "style='background-color:moccasin;color:black;'";
                    break;
                case 'U':
                    formatText = "style='background-color:blue;color:white;'";
                    break;
                case 'B':
                    formatText = "style='background-color:black;color:white;'";
                    break;
                case 'R':
                    formatText = "style='background-color:red;color:white;'";
                    break;
                case 'G':
                    formatText = "style='background-color:green;color:white;'";
                    break;
                default:

                    break;
            }
            return `<span class='badge badge-light' ${formatText} >${num}${color}</span> ${or}${colorless}`;
        }
    }

    checkIfAvailable(trad)          //function to check if this ability is available given the characters tradition.
    {
        var tmp = {                 //store all the characters trad here for scratch calculations
        trad: trad.trad,
        w: trad.w,
        u: trad.u,
        b: trad.b,
        r: trad.r,
        g: trad.g
        };

        return test(this.arr, 0, this);           // start the recursive function

        function test(strlst,z, aff)            //recursive function that tests iterations of a given list of strings until it finds one that can be select with a given tradition set.
        {
            var printableArray = strlst.join(', ');
            console.log('Looking at: ' + printableArray.replace(/\(|\)/g,'') + ' on loop number: ' + z);
            if (z > 10)                     // I infinite looped one too many times while making this, and I'm leaving it as a reminder to myself to put it in earlier.
            {
                console.log("ABORT ABORT SWEET BABY JESUS ABORT");
                return false;
            }

            if (testAll(strlst)) {
                console.log(`successful finish on string: ${strlst}!`);
                return true;       // if the substring tests out, return true
                }

            for (var i in strlst)                   // if it doesnt, go through the array string by string
            {
                var str = strlst[i];                //this is the string, i is the iterator
                if(str.includes('|'))               // if there is an | signifying an OR in the string
                {
                    var leadingNumber = /^\d?\d?/.exec(str)[0];             //pull off the leading number, since this needs to get put with both numbers in the OR not just the first one.
                    str = !leadingNumber ? str: str.substring(leadingNumber.length);
                    for (var j in str.split('|'))                       //for each element in the OR list
                    {
                        var tmplst = strlst;
                        tmplst.splice(i,1,leadingNumber + str.split('|')[j]);
                        if (test(tmplst, z+1, aff))     //test the array with ONE of the or options selected.
                        {
                            console.log(`successful finish on string: ${tmplst}`);
                            return true;                                // hurray! There is an iteration that works!
                        }
                    }

                }
            }
            console.log('finished in theory');
            return false;



            function testAll(strlst)            // this function takes in a list of strings fed from higher in the class and tests to see if the character can afford all of them.
            {
                setScratchTrad();
                for (var element in strlst)                    // for every string in array of strings
                {
                    var str = strlst[element].toLowerCase();   // get the string and convert it to lower case only
                    if (str.includes('|')) return false;      // if the string has | in it, return false- it is a conditional value that needs special treatment
                    if (!/[a-zA-Z]/.exec(str))              // if there are no letters in the string (making it a colorless total)
                    {
                        if(!(testColorless(str))) return false;       // if the colorless total is less than or equal to the characters tradition, skip to the next string. Otherwise, return false
                    }                                       // This should take care of all colorless cases
                    var leadingNumber = /^\d?\d?/.exec(str)[0];
                    var tmpstr=str.replace(/\(/g,'').replace(/\)/g,'');
                    tmpstr = !leadingNumber ? tmpstr: tmpstr.substring(leadingNumber.length);       //separate the number and the letter. remove parentheses.
                    if (tmp.hasOwnProperty(tmpstr))                                                    //if the letter is on the color wheel
                    {
                        if(!(testColored(tmpstr, parseInt(leadingNumber)||1))) return false;            // if the cost is less than or equal to what the character has available, skip to the next string. Otherwise, return false
                    }                                       // This should take care of all colored cases
                }
                return true;                                // if you make it all the way out here, its because you meet all the costs for the ability. hurray!

                function testColorless(str)
                {
                    return (parseInt(str.replace('(','').replace(')','')) <= parseInt(tmp.trad*3))? true: false;
                }

                function testColored(str,num)
                {
                    if (tmp[str] >= num){
                        tmp[str] -= num;
                        return true;
                     }
                     else
                     {
                        return false;
                     }
                }
            }

        }

        function setScratchTrad()                   // reset the tradition totals so you can keep testing without modifying real numbers
        {
            tmp.trad = trad.trad;
            tmp.w = trad.w;
            tmp.u = trad.u;
            tmp.b = trad.b;
            tmp.r = trad.r;
            tmp.g = trad.g;
        }
    }

}



//            r.concat(l.replace("(", "<span class='badge badge-light'>").replace(")", "</span>").replace("|", "</span> or <span class='badge badge-light'>"));

var character = new Character('Joe', 'Tavor', 1, 1, 1, 1, 1, 1, 1, 1, 1, 675, 0, 1,0,0,0,0,0);          //initialize a test character to work with





/*          This was the thinking for affinitycost check if available
    function test(arr)
    {
        if each element tests true
            return true

        if some elements don't return true
            if they are ORs
                for each subelement in OR
                    if test(arr w subelement instead of OR) returns true
                        return true
        else
            return false

    }



*/