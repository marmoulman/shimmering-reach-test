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
    if (character.cpCurrent + parseInt(abilityTable.abilities[key]["CP cost"]) > character.cpMax)
    {
        alert("You don't have enough Character Points for that ability!");
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
                    var aff = new affinityCost(abilityTable.abilities[key][item]);
                    console.log(aff.arr);
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
        this.arr=str.match(/\d?\d?\(([^)]+)\)|\d?\d?[a-zA-Z]/g);
        this.formatted = "";
    }

    addBadgeFormatting(str){
        var finalstr = "";
        var tmpstr = str.replace('(','').replace(')','');
        var leadingNumber = /^\d?\d?/.exec(str)[0];
        tmpstr = !leadingNumber ? tmpstr: tmpstr.substring(leadingNumber.length);
        var colorless = !/[a-zA-Z]/.exec(str) ? true: false;

        tmpstr = tmpstr.split('|');
        for(var i=0;i<tmpstr.length;i++)
        {
            var needsOr = i+1<tmpstr.length ? true: false;
            switch(tmpstr[i])
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
}



//            r.concat(l.replace("(", "<span class='badge badge-light'>").replace(")", "</span>").replace("|", "</span> or <span class='badge badge-light'>"));

var character = new Character('Joe', 'Tavor', 1, 1, 1, 1, 1, 1, 1, 1, 1, 675, 0, 1,0,0,0,0,0);