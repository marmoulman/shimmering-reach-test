"use strict";           // enforces better coding practices in js

function init(text)     //update HTML to match saved values
{
        abilityTable.abilities = text;
        console.log('Initializing...');
        $("#abilityTableBody").empty();
        document.getElementById("characterpoints").innerHTML=character.cpCurrent;
        Object.keys(text).forEach(function(key) {
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
}

function increaseItem(type, skill, btn)
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
    //table : document.querySelector("table"),
    addRow(key, data)
    {
       let table = document.getElementById("abilityTableBody");
       let row = table.insertRow();
        for (var item in data)
        {
            let cell = row.insertCell();
            (item === "AbilityNames") ? cell.outerHTML = `<th><div class="abilityLine" onclick="selectedAbility('${key}');">${key}</div></th>` : cell.innerHTML = `<td><div class="abilityLine" onclick="selectedAbility('${key}');">${data[item]}</div></td>`;

        }
    }
}

function selectedAbility(key)
{
    var aff = new affinityCost(abilityTable.abilities[key]["Affinity"]);
    console.log(abilityTable.abilities[key]["Affinity"]);
    console.log('can you afford ' + key + '?:    ' + aff.checkIfAvailable(character.trad.trad, character.trad.w, character.trad.u, character.trad.b, character.trad.r, character.trad.g));

    if (character.cpCurrent + parseInt(abilityTable.abilities[key]["CP cost"]) > character.cpMax)
    {
        alert("You don't have enough Character Points for that ability!");
    }
    else if (!(aff.checkIfAvailable(character.trad.trad, character.trad.w, character.trad.u, character.trad.b, character.trad.r, character.trad.g)))
    {
        alert("You don't have the right tradition for this ability!");
    }
    else
    {
        let table = document.getElementById('abilityTableSelectedBody');
        let row = table.insertRow();
        for (var item in abilityTable.abilities[key])
        {
            let cell = row.insertCell();
            switch(item){
                case "abilityNames":
                    cell.outerHTML = `<th>${key}</th>`;
                    break;
                case "Affinity":
                    console.log(aff.arr);
                    console.log(aff.checkIfAvailable(character.trad.trad, character.trad.w, character.trad.u, character.trad.b, character.trad.r, character.trad.g));
                    for (var i=0;i<aff.arr.length;i++)
                    {
                        aff.addBadgeFormatting(aff.arr[i]);
                        if ((i+1<aff.arr.length)) aff.formatted = aff.formatted.concat(', ');
                    }
                    cell.innerHTML = aff.formatted;
                    break;
                default:
                    cell.innerHTML = `<td>${abilityTable.abilities[key][item]}</td>`;
                    break;
            }
        }
        abilityTable.selectedAbilities.push(key);
        $("#abilityTableBody").empty();
        $("#closeModal").trigger("click");
        character.cpCurrent += parseInt(abilityTable.abilities[key]["CP cost"]);
        document.getElementById("characterpoints").innerHTML = character.cpCurrent;
    }
}


class Character {           //this is a character class.
    constructor(playerName, characterName, bod, agi, rea, str, wil, int, log, cha, luk, cpMax, cpCurrent, trad, w,u,b,r,g)
    {
        this.playerName = playerName;
        this.characterName = characterName;

        this.abi = {
            bod: bod,
            agi: agi,
            rea: rea,
            str: str,
            wil: wil,
            int: int,
            log: log,
            cha: cha,
            luk: luk,
            incStat(x) {return (x**2 + x-2)*2.5 - ((x-1)**2 + (x-1)-2)*2.5;},
            decStat(x) {return (x**2 + x-2)*2.5 - ((x+1)**2 + (x+1)-2)*2.5;},
            canIncrease(x,y) {return (this.incStat(x+1) + this.parent.cpCurrent > this.parent.cpMax) ? false: true;},
            canDecrease(x,y) {return (x > 1) ? true: false;}
        };
        this.abi.parent = this;

        this.trad = {
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
        this.trad.parent = this;

        this.cpMax=cpMax;
        this.cpCurrent=cpCurrent;
    }
}

class affinityCost {
    constructor (str) {
        this.raw=str                                                    //not used currently.
        this.arr= str.match(/\d?\d?\(([^)]+)\)|\d?\d?[a-zA-Z]/g);       //yikes. this is the regex to break a full string into the bits we want
        this.formatted = "";                                            //use this to store the HTML for displaying the fun mana bars
    }

    addBadgeFormatting(str){                                            //takes individual substring and puts it in fancy colored badge.
        var finalstr = "";
        var tmpstr = str.replace('(','').replace(')','');
        var leadingNumber = /^\d?\d?/.exec(str)[0];                     //if there is a number, pull it out so you can put it w the color later
        tmpstr = !leadingNumber ? tmpstr: tmpstr.substring(leadingNumber.length);
        var colorless = !/[a-zA-Z]/.exec(str) ? true: false;            //if there's no color specified, set a flag for later

        tmpstr = tmpstr.split('|');
        for(var i=0;i<tmpstr.length;i++)
        {
            var needsOr = i+1<tmpstr.length ? true: false;
            switch(tmpstr[i])                                                           //Depending on what the letter is, change the color. There's probably a cleaner way of doing this.
            {
                case 'W':
                    finalstr = finalstr.concat(`<span class='badge badge-light' style='background-color:moccasin;color:black;'>${leadingNumber}${tmpstr[i]}</span>`);
                    if(needsOr) finalstr = finalstr.concat(' or ');
                    break;
                case 'U':
                    finalstr = finalstr.concat(`<span class='badge badge-light' style='background-color:blue;color:white;'>${leadingNumber}${tmpstr[i]}</span>`);
                    if(needsOr) finalstr = finalstr.concat(' or ');
                    break;
                case 'B':
                    finalstr = finalstr.concat(`<span class='badge badge-light' style='background-color:black;color:white;'>${leadingNumber}${tmpstr[i]}</span>`);
                    if(needsOr) finalstr = finalstr.concat(' or ');
                    break;
                case 'R':
                    finalstr = finalstr.concat(`<span class='badge badge-light' style='background-color:red;color:white;'>${leadingNumber}${tmpstr[i]}</span>`);
                    if(needsOr) finalstr = finalstr.concat(' or ');
                    break;
                case 'G':
                    finalstr = finalstr.concat(`<span class='badge badge-light' style='background-color:green;color:white;'>${leadingNumber}${tmpstr[i]}</span>`);
                    if(needsOr) finalstr = finalstr.concat(' or ');
                    break;
                default:
                    colorless ? finalstr = finalstr.concat(`<span class='badge badge-light'>${tmpstr} Total</span>` ) : console.log('this should not happen');
                    break;
            }
        }
        this.formatted = this.formatted.concat(finalstr);
    }

    checkIfAvailable(trad, tradw,tradu,tradb,tradr,tradg)
    {

        var tmp = {                 //store all the characters trad here for scratch calculations
        trad: trad,
        w: tradw,
        u: tradu,
        b: tradb,
        r: tradr,
        g: tradg
        };


        return test(this.arr, 0);           // start the recursive function

        function test(strlst,z)
        {
            if (z > 10)                     // I infinite looped one too many times while making this, and I'm leaving it as a reminder to myself to put it in earlier.
            {
                console.log("ABORT ABORT SWEET BABY JESUS ABORT");
                return false;
            }

            if (testAll(strlst)) return true;       // if the substring tests out, return true

            for (var i in strlst)                   // if it doesnt, go through the array string by string
            {
                var str = strlst[i];                //this is the string, i is the iterator
                if(str.includes('|'))               // if there is an | signifying an OR in the string
                {
                    for (var j in str.split('|'))                       //for each element in the OR list
                    {
                        var tmplst = strlst;
                        tmplst.splice(i,1,str.split('|')[j]);
                        if (test(tmplst, z+1))     //test the array with ONE of the or options selected.
                        {
                            return true;                                // hurray! There is an iteration that works!
                        }
                    }

                }
            }
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
                    var tmpstr=str.replace('(','').replace(')','');
                    tmpstr = !leadingNumber ? tmpstr: tmpstr.substring(leadingNumber.length);       //separate the number and the letter. remove parentheses.
                    if (tmp.hasOwnProperty(str))                                                    //if the letter is on the color wheel
                    {
                        if(!(testColored(str, parseInt(leadingNumber)||1))) return false;            // if the cost is less than or equal to what the character has available, skip to the next string. Otherwise, return false
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
            tmp.trad = trad;
            tmp.w = tradw;
            tmp.u = tradu;
            tmp.b = tradb;
            tmp.r = tradb;
            tmp.g = tradg;
        }
    }

}



//            r.concat(l.replace("(", "<span class='badge badge-light'>").replace(")", "</span>").replace("|", "</span> or <span class='badge badge-light'>"));

var character = new Character('Joe', 'Tavor', 1, 1, 1, 1, 1, 1, 1, 1, 1, 675, 0, 1,1,1,1,1,1);





/*
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