/**
 * $Id: idiot.js 167 2008-09-15 15:55:42Z einar@einaregilsson.com $
 *
 * Author: Einar Egilsson (einar@einaregilsson.com)
 * See http://tech.einaregilsson.com/2008/09/13/idiot-cardgame/ for more details.
 *
 * Implementation of the card game Idiot (a.k.a. Shithead). See
 * http://en.wikipedia.org/wiki/Shithead_(card_game) for details
 * about the game. This implementation depends on the cards.js library 
 * to function. Latest versions of idiot.js and cards.js should be available 
 * at http://einaregilsson.googlecode.com/svn/jscardgames/ and the game
 * should be running at http://einaregilsson.com/idiot/ .
 *
 * This code is released under a Creative Commons Attribution 
 * licence. (http://creativecommons.org/licenses/by/3.0/)
 */

/** Global variables */
var deck, pile, playerHand, playerTable, cpuHand, cpuTable, strings;

/** Constants */
var DELAY = 1300,   //The number of milliseconds between each computer move to make it visible for the user
    CARD_COUNT = 3; //The number of cards the player should have in the hand.

/** Special cards */
var RESTART_CARD = 2, REVERSE_CARD = 5, BURN_CARD = 10;

var debugEnabled = false;
/**
 * Debug function
 */
function debug(msg) {
    if (debugEnabled) {
        alert(msg);
    }
}

/** 
 * String localizations 
 */
var localizations = {
    
    //Icelandic
    is : {
        BTN_PLAY                     : 'Láta út valin spil',
        BTN_DRAW                     : 'Draga',
        BTN_TAKE_PILE                : 'Taka bunkann',
        BTN_SWITCH                   : 'Víxla / Byrja',
        SWITCH_NEEDS_EQUAL_NUMBERS   : 'Það verða að vera jafn mörg spil valin í borði og á hendi til að víxla!',
        SURE_ABOUT_NO_SWITCH         : 'Ertu viss um að þú viljir ekki víxla neinum spilum? Þetta er eina tækifærið, smelltu á Cancel til að víxla eða OK til að byrja leikinn.',
        MUST_SELECT_CARDS            : 'Þú verður að velja spil áður en þú getur spilað þeim út!',
        ONLY_PLAY_TWO_WITH_SAME_RANK : 'Þú getur ekki spilað fleiri en einu spili út nema þau hafi sama númeragildi!',
        MUST_PUT_LOWER_THAN_REVERSE  : 'Þegar fimma er efst í bunkanum verðurðu að láta út spil sem er lægra eða jafnt og fimma!',
        MUST_PUT_HIGHER_CARD         : 'Þú verður að láta út spil sem er jafnt eða hærra en efsta spilið í bunkanum!',
        ONLY_ONE_FACEDOWN_CARD       : 'Ekki er hægt að láta út fleiri en eitt af spilunum sem eru á hvolfi í einu!',
        PLAYER_WIN                   : 'Til hamingju, þú vannst!!! Smelltu á F5 til að byrja nýjan leik.',
        CPU_WIN                      : 'Þú tapar, tölvan vann. Smelltu á F5 til að byrja nýjan leik.',
        TITLE                        : 'IDIOT',
        SUBTITLE                     : 'Nánari upplýsingar á <a href="http://einaregilsson.com/2008/09/13/idiot/">http://einaregilsson.com/2008/09/13/idiot/</a>'
    },
    
    //English
    en : {
        BTN_PLAY                     : 'Play selected cards',
        BTN_DRAW                     : 'Draw card',
        BTN_TAKE_PILE                : 'Take the pile',
        BTN_SWITCH                   : 'Switch cards / Start',
        SWITCH_NEEDS_EQUAL_NUMBERS   : 'You must select the same number of cards in the hand and table to be able to switch!',
        SURE_ABOUT_NO_SWITCH         : 'Are you sure you do not want to switch any cards? This is your only chance, press Cancel to switch or OK to start the game.',
        MUST_SELECT_CARDS            : 'You must select at least one card before you can play!',
        ONLY_PLAY_TWO_WITH_SAME_RANK : "You can't play more than one cards unless they have the same rank!",
        MUST_PUT_LOWER_THAN_REVERSE  : 'When a five is at the top of the deck you must play a card with rank 5 or less!',
        MUST_PUT_HIGHER_CARD         : 'You must play a card that has equal or higher rank than the top card in the deck!',
        ONLY_ONE_FACEDOWN_CARD       : 'You may only play one facedown card at a time!',
        PLAYER_WIN                   : 'Congratulations, you win!!! Press F5 to start a new game.',
        CPU_WIN                      : 'You lose, the computer wins. Press F5 to start a new game.',
        TITLE                        : 'IDIOT<br><span style="font-size:11pt;">(a.k.a. Shithead)</span>',
        SUBTITLE                     : 'More information at <a href="http://tech.einaregilsson.com/2008/09/13/idiot-cardgame/">http://tech.einaregilsson.com/2008/09/13/idiot-cardgame/</a>'
    }
};    

    
/** 
 * Shortcut for getElementById() 
 */
function $(id) {
    return document.getElementById(id);
}


/**
 * Starts the game, disables the correct button, sets everything up.
 */
function startGame() {

    //Localize
    if (location.search && localizations[location.search.substr(1)]) {
        window.strings = localizations[location.search.substr(1)];
    } else {
        window.strings = localizations['is'];
    }
    
    $('btnDraw').innerHTML     = strings['BTN_DRAW'];
    $('btnPlay').innerHTML     = strings['BTN_PLAY'];
    $('btnTakePile').innerHTML = strings['BTN_TAKE_PILE'];
    $('btnSwitch').innerHTML   = strings['BTN_SWITCH'];
    $('title').innerHTML       = strings['TITLE'];
    $('subtitle').innerHTML    = strings['SUBTITLE'];
    
    //Initialize cards
    deck = new Deck('deck', true, true);
    deck.shuffle();
    pile = new Deck('pile', false);
    pile.cards = [];
    playerHand = new Hand('playerHand', false);
    cpuHand = new Hand('cpuHand', true);
    playerTable = new TableCards('playerTable', deck);
    cpuTable = new TableCards('cpuTable', deck);
    cpuHand.selectable(false);
    cpuTable.selectable(false);

    //deal
    for (var i = 0; i < CARD_COUNT; i++) {
        playerHand.addCard(deck.drawCard());
        cpuHand.addCard(deck.drawCard());
    }

    //deck.cards = [];
    //Render everything
    render(playerHand, playerTable, cpuHand, cpuTable, deck, pile);
    statePlayerSwitch();
}


/** 
 * Disables the player buttons according to the args 
 */
function disableButtons(play, draw, takePile, switch_) {
    $('btnPlay').disabled = play;
    $('btnDraw').disabled = draw;
    $('btnTakePile').disabled = takePile;
    $('btnSwitch').disabled = switch_;
}


/** 
 * Renders parts of the table according to the parameters
 */
function render() {
    for (var i = 0; i < arguments.length; i++) {
        arguments[i].render();
    }
}


/** 
 * Shows a message box with a localized message 
 */
function msg(key) {
    alert(strings[key]);
}


/** 
 * 1st button, "Play selected cards". Puts out the selected cards 
 * if they constitute a legal move. If the play is not legal pop 
 * up a message box explaining why.
 */
function playSelectedCards() {

    var container = (playerHand.count() > 0) ? playerHand : playerTable;

    if (validateSelection(container.getSelectedCards())) {
        selected = container.removeSelectedCards();
        container.selectable(false);
        
        if (container === playerTable && playerTable.count() < 3 && selected.length == 1) {
            //We've just selected a facedown card. 
            render(playerTable);
            playBlindCard(selected[0], playerHand, statePlayerPlay, stateComputerPlay);
            return;
        } else {
            for (var i in selected) {
                selected[i].selectEnabled = false;
                pile.addCard(selected[i]);
            }
        }

        render(deck, pile, playerHand, playerTable);

        function decideNextMove() {
            if (playerHand.count() < CARD_COUNT && deck.count() > 0) { //Finished and need to draw before anything else happens
                statePlayerDraw();
            } else if (pile.count() == 0) { //We've just burned the pile and so should play again.
                statePlayerPlay();
            } else {
                stateComputerPlay(); //Finished and didn't need to draw, computer plays right away
            }
        }

        if (burnPile()) {
            //Small delay, so we see the card being played out. Otherwise it looks
            //strange, for example when playing a facedown card that is a burn card,
            //then the player wouldn't realize what just happened.
            disableButtons(true, true, true, true);
            setTimeout(function() {
                pile.removeAll();
                pile.render();
                decideNextMove();                
            }, DELAY);
            return;
        }
        
        decideNextMove();
    }
}


/** 
 * 2nd button, "Draw". Draws a card from the deck and adds
 * it to the players hand.
 */
function draw() {
    var card = deck.drawCard();
    card.selectEnabled = true;
    playerHand.addCard(card);
    render(playerHand, deck);

    if (playerHand.count() >= CARD_COUNT || deck.count() == 0) {
        if (pile.count() == 0) { //Only time we play again after we draw is when we've burned the pile and it's empty
            statePlayerPlay();        
        } else {
            stateComputerPlay();
        }
    }
}

/**
 * Returns true if it is legal to put 'newCard' on top of
 * pileCard, otherwise false.
 */
function isLegalMove(pileCard, newCard) {
    if (!pileCard) {
        return 'OK';
    } else if (isSpecialCard(newCard)) {
        return 'OK';
    } else if (pileCard.rank == REVERSE_CARD && newCard.rank > pileCard.rank) {
        return 'MUST_PUT_LOWER_THAN_REVERSE';    
    } else if (pileCard.rank != REVERSE_CARD && newCard.rank < pileCard.rank) {
        return 'MUST_PUT_HIGHER_CARD';
    } else {
        return 'OK';
    }
}


/**
 * Deselects all selected cards and renders the container if necessary.
 */
function clearSelection(container) {
    var render = false;
    for (var i in container.cards) {
        if (container.cards[i] && container.cards[i].selected) {
            container.cards[i].selected = false;
        }
        render = true;
    }
    if (render) {
        container.render();
    }
}


/**
 * 3rd button, "Take pile". Takes the whole pile and add it to the players hand.
 */
function takePile() {
    clearSelection(playerHand);    
    clearSelection(playerTable);    
    playBlindCard(deck.count() > 0 ? deck.drawCard() : null, playerHand, statePlayerPlay, stateComputerPlay);
}


/**
 * 4th button, "Switch cards". Switches the selected cards 
 * from the player hand and player table.
 */
function switchCards() {
    
    if (playerHand.selectedCount() != playerTable.selectedCount()) {
        msg('SWITCH_NEEDS_EQUAL_NUMBERS');
        return;
    }

    if (playerHand.selectedCount() == 0) {
        if (!confirm(strings['SURE_ABOUT_NO_SWITCH'])) {
            return;
        }
        
    }
    
    var tableCards = playerTable.removeSelectedCards();
    var handCards = playerHand.removeSelectedCards();
    
    for (var i = 0; i < tableCards.length; i++) {
        playerHand.addCard(tableCards[i]);
    }
    
    for (var i = 0; i < handCards.length; i++) {
        
        for (var j = 3; j < 6; j++) {
            
            if (playerTable.cards[j] == null) {
                playerTable.cards[j] = handCards[i];
                break;
            }
        }
    }

    //Allow the computer to do this at the same time
    computerSwitchCards();

    render(playerHand, playerTable, cpuHand, cpuTable);
    playerTable.selectable(false);
    playerHand.selectable(true);

    statePlayerPlay();
}


/**
 * Sets up the buttons for the player to play his turn.
 */
function statePlayerPlay() {
    if (checkIfFinished()) {
        return;
    }
    disableButtons(false, true, pile.count() == 0, true); 
    if (playerHand.count() > 0) {
        playerTable.selectable(false);
        playerHand.selectable(true);
    } else {
        playerTable.selectable(true);
    }
}


/** 
 * Sets up the buttons for the player to draw a card 
 */
function statePlayerDraw() {
    disableButtons(true, false, true, true);        
}


/** 
 * Sets up the buttons for the player to switch cards.
 */
function statePlayerSwitch() {
    playerHand.selectable(true);
    playerTable.selectable(true);
    disableButtons(true, true, true, false);
}


/** 
 * Play computers turn
 */
function stateComputerPlay() {
    
    if (checkIfFinished()) {
        return;
    }

    var available;
    disableButtons(true, true, true, true);
    var useHand = cpuHand.count() > 0;
    var container;
    if (useHand) {
        available = cpuHand.cards;
        container = cpuHand;
    } else {
        available = [];
        container = cpuTable;
        if (cpuTable.hasFaceUpCards()) {
            //Set the available array up with the face up value so we can
            //choose them in a normal manner.
            for (var i = 3; i < 6; i++) {
                if (container.cards[i]) {
                    available.push(container.cards[i]);
                }
            }
        } else {
            //We only have facedown cards left, so pick one randomly and then play blind card.
            for (var i = 0; i < 3; i++) {
                if (container.cards[i]) {
                    available.push(container.cards[i]);
                }
            }
            var randomIndex = Math.floor(Math.random()*available.length);
            playCard = available[randomIndex];
            setTimeout(function() {
                cpuTable.removeCard(playCard);
                cpuTable.render();
                playBlindCard(playCard, cpuHand, stateComputerPlay, statePlayerPlay);
            }, DELAY);
            return;
        }
    }
    
    //Select which cards we want to play.
    selectCpuCards(available);

    var selected = container.getSelectedCards();
    var draw = 0;

    //Drawing is only relevant when using cards on hand, if we're using the table cards
    //then the deck is obviously finished.
    if (useHand) {
        var diff = cpuHand.count() - selected.length;

        if (diff < CARD_COUNT) {
            draw = CARD_COUNT - diff;
            if (deck.count() < draw) {
                draw = deck.count();
            }
        }
    }

    //Unselect them so they don't get drawn as pulled out from the deck.
    //They're alread in the 'selected' array so we don't need them individually
    //marked as selective.
    for (var i in container.cards) {
        if (container.cards[i]) {
            container.cards[i].selected = false;
        }
    }
    setTimeout(function() { computerTick(selected, draw, draw == 0 && selected.length == 0, false, container); }, DELAY);
}


/**
 * Selects which cards the cpu will play in the next turn.
 * Note that this function only marks them as selected, it does NOT
 * remove them or play them.
 */
function selectCpuCards(available) {
    var pileRank = pile.count() > 0 ? pile.topCard().rank : 2;
    var card, restart, burn, reverse, playCard;

    for (var i in available) {
        card = available[i];
        if (card.rank == RESTART_CARD) {
            restart = card;
        } else if (card.rank == BURN_CARD) {
            burn = card;
        } else if (card.rank == REVERSE_CARD) {
            reverse = card;
        } else {
            if (pileRank == REVERSE_CARD) {
                //Find lowest card below the burn card
                if (card.rank <= pileRank && (playCard == null || card.rank < playCard.rank)) {
                    playCard = card;
                }
            } else {
                //Find lowest card above the top card in the pile
                if (card.rank >= pileRank && (playCard == null || card.rank < playCard.rank)) {
                    playCard = card;
                }
            }
        }
    }
    
    //Finds the lowest card thats higher than rank
    function nextCardOver(cards, rank) {
        debug('nextCardOver rank ' + rank);
        var sel = null;
        for (var i in cards) {
            if (!isSpecialCard(cards[i]) && cards[i].rank > rank) {
                debug('nextCardOver: ' + cards[i] + ' is bigger than ' + rank);
                if (sel == null || cards[i].rank < sel.rank) {
                    sel = cards[i];
                }
            }
        }
        return sel;
    }
    
    var oldPlayCard = playCard;
    //Ok, now we've hopefully found a good candidate for normal action. However, if the
    //player only has his table cards left (or he has finished them but has some cards on hand)
    //we just want to do whatever we can to ruin his
    //game and put out the highest card (or reverse card) that we have. So lets look...
    if (playerHand.count() == 0 || (playerTable.count() <=3 && playerHand.count() > 0 && playerHand.count() < 4)) {
        var playerCards = [];
        var plowest = null, phighest = null, specialCount = 0;
        for (var i = 3; i < 6; i++) {
            if (playerTable.cards[i]) {
                if (isSpecialCard(playerTable.cards[i])) {
                    specialCount++;
                } else {
                    if (plowest == null || playerTable.cards[i].rank < plowest) {
                        plowest = playerTable.cards[i].rank;
                    } 
                    
                    if (phighest == null || playerTable.cards[i].rank > phighest) {
                        phighest = playerTable.cards[i].rank;
                    }
                }
            }
        }
        
        debug('phighest ' + phighest);
        debug('plowest ' + plowest);
        if (phighest) {
            card = nextCardOver(available, Math.max(phighest, pileRank));
            debug('Nextcardover was ' + card);
        }
        
        if (phighest && card && pileRank != REVERSE_CARD) {
            //We have a card that's higher than the player highest card.
            //It'll force him to take the pile, or at the very least play
            //a special card.
            debug('selected ' + card + ' because phighest was ' + phighest);
            playCard = card;
        } else if (plowest && plowest > REVERSE_CARD && reverse) {
            //We have a reverse card and the opponent has nothing lower than it
            //so we'll play our reverse card. Bit of a hack to make it select
            //it lower down ... ;)
            playCard = null;
            restart = null;
            debug('selected reverse because player has no < 5');
        } else if (specialCount == 0 && phighest == null && plowest == null && pileRank != REVERSE_CARD) {
            //Ok, can't be sure about anything, maybe there are just facedown cards
            //left. Lets just play the card that's likeliest to cause the player
            //to take the pile. Only do this if he has no special cards
            var highest = 0;
            var highCard = null;
            for (var i in available) {
                if (!isSpecialCard(available[i]) && available[i].rank > highest) {
                    highCard = available[i];
                    highest = highCard.rank;
                }
            }
            
            //Don't have highcard, or highcard is less than 10 and we have a reverse card
            //then it's more likely that the reverse card will force the player to take the pile.
            if ((!highCard || highCard.rank < 10 || highCard.rank < pileRank) && reverse) {
                playCard = null;
                restart = null;
                debug('played reverse instead of high card');
            } else if (highCard && highCard.rank >= pileRank) {
                playCard = highCard;
                debug('played highcard ' + highCard);
            } else {
                debug('Found no highcard');
            }
        } else {
            debug('found no good way to stop player');
        }
    }
    
    if (playCard && playCard != oldPlayCard) {
        debug('Selected ' + playCard + ' instead of ' + oldPlayCard + ' because of endgame rules');
    }

    if (playCard) {
        playCard.selected = true;
        for (var i in available) {
            if (available[i].rank == playCard.rank && available[i] != playCard) {
                available[i].selected = true;
            }
        }
    } else if (restart) {
        restart.selected = true;;
    } else if (reverse) {
        reverse.selected = true;
    } else if (burn) {
        burn.selected = true;
    }
}


/**
 * Performs one action (put out card, draw card, etc.) and set a timeout
 * for the next part to happen after a given delay so that it is clearly
 * visible for the player.
 */
function computerTick(selected, draw, takePile, burn, container) {

    if (selected.length > 0) { //Cpu puts out one card
        var card = selected[0];
        container.removeCard(card);
        selected.splice(0,1);
        pile.addCard(card);
    } else if (burn) { //Burn the pile, cpu plays again.
        pile.removeAll();
    } else if (draw > 0) { //Cpu draws one card
        cpuHand.addCard(deck.drawCard());
        draw--;
    } else if (takePile) { //Cpu takes the pile, plays again.
        //Special case, we re-use the code used to make the player do this
        //so we'll just call this method with the appropriate parameters
        //and then return.
        playBlindCard(deck.count() > 0 ? deck.drawCard() : null, cpuHand, stateComputerPlay, statePlayerPlay);
        return;
    }

    //Render everything to do with the cpu
    render(cpuHand, cpuTable, pile, deck);

    if (selected.length > 0) { //Need to put out more cards
        setTimeout(function() { computerTick(selected, draw, false, false, container); }, DELAY);
    } else if (burnPile()) { //Have put out all cards, might need to burn.
        setTimeout(function() { computerTick(selected, draw, false, true, container); }, DELAY);
    } else if (draw > 0) { //Have put out and burned, might need to draw
        setTimeout(function() { computerTick(selected, draw, false, false, container); }, DELAY);
    } else if (pile.count() == 0) { //Just burned the pile, play again.
        stateComputerPlay();
    } else { //Finished, make player play
        statePlayerPlay();
    }
}


/**
 * The computer also switches cards at the beginning of the game.
 */
function computerSwitchCards() {
    function compare(oldCard, newCard) {
        var old = oldCard.rank;
        var new_ = newCard.rank;
        var spec = {2 : 15, 5 : 16, 10 : 17};
        if (spec[old]) {
            old = spec[old];
        }
        if (spec[new_]) {
            new_ = spec[new_];
        }
        return new_ - old;
    }
    
    var sortArray = [cpuTable.cards[3], cpuTable.cards[4], cpuTable.cards[5]];
    
    for (var i in cpuHand.cards) {
        sortArray.push(cpuHand.cards[i]); //Done this way to support hands with other card counts than 3...
    }

    sortArray.sort(compare);
    cpuTable.cards[3] = sortArray[0];
    cpuTable.cards[4] = sortArray[1];
    cpuTable.cards[5] = sortArray[2];
    for (var i = 3; i < sortArray.length; i++) {
        cpuHand.cards[i-3] = sortArray[i];
        cpuHand.cards[i-3].setFacedown(true);
    }
}


/**
 * Checks if the game is finished and prints the appropriate message.
 */
function checkIfFinished() {
    if (playerTable.count() == 0 && playerHand.count() == 0) {
        msg('PLAYER_WIN');
        return true;
    } else if (cpuTable.count() == 0 && cpuHand.count() == 0) {
        msg('CPU_WIN');
        return true;
    } else {
        return false;
    }
}


/**
 * Handles the logic of playing a card that we don't know the value of
 * onto the pile and taking the pile if the card was not legal
 * on top of the pile. This is used for both the player and computer
 * when they have no card to play and have to draw or when they only
 * have their facedown cards left. playFunc is the function to call to 
 * make the entity taking the pile play, opponentPlayFunc is the function
 * to call to make the opponent play.
 */
function playBlindCard(card, hand, playFunc, opponentPlayFunc) {

    if (card) { //We've got a chance, put the card on the pile
        pile.addCard(card);
        render(pile, deck);
        
        if (pile.count() == 1 || isLegalMove(pile.cards[pile.count()-2], pile.cards[pile.count()-1]) == 'OK') {
            //If there is only one card in the pile then we played our card on an empty
            //pile. If there is more than one then we lucked out and got a card that is legal. 
            //Now either our card burns the pile, in which case we want a small delay
            //so that it's visible and we get another turn, or it doesn't burn the
            //pile in which case the opponent should get to play.
            if (burnPile()) {
                disableButtons(true, true, true, true);
                setTimeout(function() {
                    pile.removeAll();
                    render(pile);
                    playFunc();
                }, DELAY);
            } else {
                opponentPlayFunc();
            }
        } else {
        
            //FAIL. The card we drew was useless, we'll have to take the pile
            //but we still want to see that we drew a card so give it a delay
            //before adding the cards to our hand.
            disableButtons(true, true, true, true);
            setTimeout(function() { addPileToHand(hand); playFunc(); }, DELAY);
        }
    } else { //No card, for example taking the pile when the deck is empty
        addPileToHand(hand);
        playFunc();
    }
}


/**
 * Adds all the cards in the pile to the given hand.
 */
function addPileToHand(hand) {
    while (pile.count() > 0) {
        hand.addCard(pile.drawCard());
    }
    render(pile, deck, hand);
}


/** 
 * Returns true if the pile should be burned (four of a kind on top, 
 * or burn card on top).
 */
function burnPile() {
    if (pile.topCard() && pile.topCard().rank == BURN_CARD) {
        return true;
    }

    if (pile.count() < 4) {
        return false;
    }
    var crd = pile.cards;
    var l = pile.count();
    return (crd[l-1].rank == crd[l-2].rank && crd[l-2].rank == crd[l-3].rank && crd[l-3].rank == crd[l-4].rank);
}


/**
 * Validates the selected cards. Returns true if they
 * constitute a legal move, false if it is illegal.
 */
function validateSelection(selected) {

    //Check whether the selection are cards that can be selected together
    if (selected.length == 0) {
        msg('MUST_SELECT_CARDS'); //Must select some cards to play
        return false;
    } else if (playerHand.count() == 0 && !playerTable.hasFaceUpCards() && selected.length > 1) {
        msg('ONLY_ONE_FACEDOWN_CARD'); //Can only play one facedown card at a time
        return false;
    } else if (selected.length > 1) { //All of the selected cards must have same rank.
        var value = null;
        for (var i in selected) {
            var card = selected[i];
            if (card.selected && value != null && card.rank != value) {
                msg('ONLY_PLAY_TWO_WITH_SAME_RANK');
                return false;
            }
            value = card.rank;
        }
        
    }   
    
    //Check whether the selected cards have legal rank
    var card = selected[0];
    if (isSpecialCard(card) || pile.count() == 0) {
        //No validation, special cards can be played on top of everything
        //and everything can be played on an empty deck...
        return true;
    } else if (playerHand.count() == 0 && !playerTable.hasFaceUpCards()) {
        //We'll allow any card to be selected of the facedown cards, because
        //what should happen is that the player should play it out blindly,
        //and then once it's played out and if it's illegal then the player
        //will be forced to take the pile.
        return true;
    } else {
        var result = isLegalMove(pile.topCard(), card);
        if (result == 'OK') {
            return true;
        } else {
            msg(result);
            return false;
        }
    }
    return true;
    
}




/**
 * Returns true if the card is one of the special cards that
 * can be laid on top of everything.
 */
function isSpecialCard(card) {
    return card.rank == BURN_CARD || card.rank == RESTART_CARD || card.rank == REVERSE_CARD;
}



/**
 * Class for the '3 down, 3 up' cards in the game.
 */
function TableCards(id, facedown) {
    this.initialize(id, facedown);          
}

TableCards.prototype = {
    
    /**
     * Initializes the table cards and allows the top 3 to 
     * be selected.
     */
    initialize : function(id) {
        this.base_Initialize(id);
        for (var i = 0; i < 6; i++) {
            this.addCard(deck.drawCard());
        }
        this.cards[3].selectEnabled = true;
        this.cards[4].selectEnabled = true;
        this.cards[5].selectEnabled = true;
    },

    /**
     * Renders 3 cards face down, 3 cards face up.
     */
    render : function () {
        this.base_Render();
        var parent = document.getElementById(this.id);
        parent.style.width = '270px';
        var incr = 3;    
        for (var i in this.cards) {
            var pos = i % 3;
            if (this.cards[i]) {
                
                var img = this.cards[i].image;
                img.style.position = 'absolute';

                if (i < 3) {
                    this.cards[i].setFacedown(true);
                    img.style.top = '24px';
                    img.style.left = pos * 90 + 'px';
                } else {
                    this.cards[i].setFacedown(false);
                    img.style.top = '19px';
                    img.style.left = ((pos * 90) + 5) + 'px';
                }
                parent.appendChild(img);
            }
        }   
    },
    
    /**
     * Overrides the base function so that if there
     * are any face up cards left then only they
     * are selectable.
     */
    selectable : function(enabled) {
        for (var i in this.cards) {
            if (this.cards[i]) {
                this.cards[i].selectEnabled = enabled;
            }
        }
        
        if (this.hasFaceUpCards()) {
            this.cards[0].selectEnabled = false;
            this.cards[1].selectEnabled = false;
            this.cards[2].selectEnabled = false;
        }
    },
    
    /**
     * Returns true if the table has any face up cards left.
     */
    hasFaceUpCards : function() {
        return this.cards[3] || this.cards[4] || this.cards[5];
    },
    
    /**
     * Overrides the CardContainer class removeSelectedCards
     * function. Does not shrink the array of cards, instead
     * adds null for those cards that were removed.
     */
    removeSelectedCards : function() {
        var removed = []; 
        for (var i = this.cards.length-1; i >= 0; i--) {
            if (this.cards[i] && this.cards[i].selected) {
                removed.push(this.cards[i]);
                this.cards[i].selected = false;
                this.cards[i] = null;
            }
        }
        return removed;
    },
    
    /**
     * Overrides the base class function, puts null
     * in place for the removed card instead of removing
     * it completely.
     */
    removeCard : function(card) {
        var removed; 
        for (var i = this.cards.length-1; i >= 0; i--) {
            if (this.cards[i] != null && this.cards[i] == card) {
                this.cards[i].selected = false;
                this.cards[i] = null;
                return card;
            }
        }
        return null;
    },
    
    /**
     * Overrides the count function because the TableCards class
     * doesn't shrink the array but instead substitutes removed
     * cards with null.
     */
    count : function() {
        var count = 0;
        for (var i in this.cards) {
            if (this.cards[i]) {
                count++;
            }
        }
        return count;
    }
};

extend(CardContainer, TableCards);
