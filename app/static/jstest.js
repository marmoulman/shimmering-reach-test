"use strict";           // enforces better coding practices in js

function init(text)     //update HTML to match saved values
{
        abilityTable.abilities = text;
        console.log('Initializing...');
        emptyTableBody();
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
    $("#datatablemaybe").DataTable();
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
            (item === "abilityNames") ? cell.outerHTML = `<th>${key}</th>` : cell.innerHTML = `<td>${abilityTable.abilities[key][item]}</td>`;
        }
        abilityTable.selectedAbilities.push(key);
        emptyTableBody();
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






var character = new Character('Joe', 'Tavor', 1, 1, 1, 1, 1, 1, 1, 1, 1, 675, 0, 1,0,0,0,0,0);

console.log(character.abi.parent.cpCurrent);