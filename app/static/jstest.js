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

}

function plusAbility(skill, btn)        //increment a stat
{
    if (character.canIncrease(character[skill]+1))
    {
        character[skill] ++;
        document.getElementById(skill).innerHTML = character[skill];
        character["cpCurrent"] += character.incStat(character[skill]);
        document.getElementById("characterpoints").innerHTML = character.cpCurrent;
    }
    else
    {
        document.getElementById('prompt').innerHTML="this stat can't be increased anymore at this time! Try removing CP from other stats or abilities.";

    }
}

function minusAbility(skill, btn)       //decrement a stat
{
    if(character[skill] -1 >= 1)
    {
        character[skill]--;
        document.getElementById(skill).innerHTML = character[skill];
        character.cpCurrent  += character.decStat(character[skill]);
        document.getElementById("characterpoints").innerHTML = character.cpCurrent;
    }
    else
    {
        document.getElementById('prompt').innerHTML="this stat cannot be decreased anymore!";
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
    constructor(playerName, characterName, bod, agi, rea, str, wil, int, log, cha, luk, cpMax, cpCurrent)
    {
        this.playerName = playerName;
        this.characterName = characterName;
        this.bod = bod;
        this.agi=agi;
        this.rea=rea;
        this.str=str;
        this.wil=wil;
        this.int=int;
        this.log=log;
        this.cha=cha;
        this.luk=luk;
        this.cpMax=cpMax;
        this.cpCurrent=cpCurrent;
    }

    statCalc(x) {
        return (x**2 + x - 2)*2.5;
    }

    incStat(x) {
        return (x**2 + x-2)*2.5 - ((x-1)**2 + x-3)*2.5;
    }

    decStat(x) {
        return (x**2 + x-2)*2.5 - ((x+1)**2 + x-1)*2.5;
    }

    canIncrease(x) {
        return (this.incStat(x)+ this.cpCurrent > character.cpMax) ? false : true;
    }
}





var character = new Character('Joe', 'Tavor', 1, 1, 1, 1, 1, 1, 1, 1, 1, 675, 0);
