/**
 * $Id: cards.js 167 2008-09-15 15:55:42Z einar@einaregilsson.com $
 *
 * Author: Einar Egilsson (einar@einaregilsson.com)
 * See http://tech.einaregilsson.com/2008/09/13/idiot-cardgame/ for more details.
 *
 * Library to help implement card games in javascript. The library
 * can draw decks and hands, sort, shuffle and draw cards and much more.
 * Originally implemented to support the card game Idiot but could be
 * used for any card game. Latest version of cards.js should be available 
 * at http://einaregilsson.googlecode.com/svn/jscardgames/ and an example
 * game is running at http://einaregilsson.com/idiot/ .
 *
 * This code is released under a Creative Commons Attribution 
 * licence. (http://creativecommons.org/licenses/by/3.0/)
 */

/**
 * Inherit from a parent class. Adds all the functions from
 * the parents prototype to the subclass's prototype. If the
 * functions are overridden in the subclass then the parent
 * functions are added as 'base_' + the method name to the
 * subclass.
 */
function extend(parentClass, subClass) {
    for (var prop in parentClass.prototype) {
        if (prop == 'initialize' || subClass.prototype[prop]) {
            var baseName = 'base_' + prop.substr(0,1).toUpperCase() + prop.substr(1);
            subClass.prototype[baseName] = parentClass.prototype[prop];
        } else {
            subClass.prototype[prop] = parentClass.prototype[prop];
        }
    }
}


/**
 * Base class for everything that stores cards, e.g. deck, hand.
 * Has functions for sorting, shuffling, removing and selecting
 * cards etc.
 */
function CardContainer(id, facedown) {
    this.initialize(id, facedown);
}

CardContainer.prototype = {

    cards : [], //Array of cards.
    facedown : false, //Whether the cards in the container will be drawn face-up or face-down.
    id : null, //Id of the html element where the container will be drawn

    /**
     * Initialize the container. 'id' is the id of the html element
     * that the container is rendered inside, facedown tells whether the
     * cards should be rendered facedown or face up.
     */
    initialize : function(id, facedown) {
        this.cards = []; //weird bug, otherwise all share a reference, don't know why, shouldn't be...
        this.id = id;
        this.facedown = !!facedown;
    },

    /**
     * Adds a new card to the end of the cards array.
     */
    addCard : function(card) {
        card.setFacedown(this.facedown);
        this.cards.push(card);
    },
    
    /**
     * Removes the given card from the container. Returns the card
     * if it is found in the container, otherwise null.
     */
    removeCard : function(card) {
        var removed; 
        for (var i = this.cards.length-1; i >= 0; i--) {
            if (this.cards[i] == card) {
                this.cards[i].selected = false;
                this.cards.splice(i, 1);
                return card;
            }
        }
        return null;
    },
    
    /**
     * Sets whether the cards in the container can be
     * selected.
     */
    selectable : function(enabled) {
        this.eachCard(function(card) {
            card.selectEnabled = enabled;
        });
    },
    
    /**
     * Removes all cards from the container and returns
     * them in an array.
     */
    removeAll : function() {
        var old = this.cards;
        this.cards = [];
        return old;
    },
    
    /**
     * Removes all childNodes from the html element with the
     * same id as the container.
     */
    clearImages : function() {
        var parent = document.getElementById(this.id);
        while(parent.childNodes.length) {
            parent.removeChild(parent.childNodes[0]);
        }
    },
    
    /**
     * Removes all cards that have been selected and returns
     * them in an array.
     */
    removeSelectedCards : function() {
        var removed = []; 
        for (var i = this.cards.length-1; i >= 0; i--) {
            if (this.cards[i].selected) {
                removed.push(this.cards[i]);
                this.cards[i].selected = false;
                this.cards.splice(i, 1);
            }
        }
        return removed;
    }, 
    
    /**
     * Returns an array with all selected cards.
     * Does not remove them from the container.
     */
    getSelectedCards : function() {
        var selected = []; 
        for (var i in this.cards) {
            if (this.cards[i] && this.cards[i].selected) {
                selected.push(this.cards[i]);
            }
        }
        return selected;
    },
    
    /**
     * Executes the given function for each card in
     * the container.
     */
    eachCard : function(func) {
        for (var i = 0; i < this.cards.length; i++) {
            func(this.cards[i]);
        }
    },
   
    /**
     * Returns the top card in the container (last card in array)
     * or null if the container is empty.
     */
    topCard : function() {
        if (this.count() == 0) {
            return null;
        }
        return this.cards[this.cards.length-1];
    },

    /**
     * Removes the top card from the container and returns it.
     * Throws error if container is empty.
     */
    removeTopCard : function() {
        var card = this.topCard();
        if (!card) {
            throw "Error: Trying to remove card from empty container!";
        }
        this.cards.splice(this.cards.length-1, 1);
        return card;
    },

    /**
     * Sorts the cards in the container. They are sorted first b
     * suit and then by rank, with aces as low cards.
     */
    sort : function() {
        this.cards.sort(function(a,b) {
            var sorts = {h : 0, s : 1, d : 2, c : 3}
            var result = sorts[a.suit] - sorts[b.suit];
            if (result) {
                return result;
            }
            return a.rank - b.rank;
        });
    },
    
    /**
     * Shuffles the cards in the container.
     */
    shuffle : function() {
        var tempcards = this.cards;
        this.cards = [];
        while (tempcards.length) {
            var randomNr = Math.floor(Math.random() * tempcards.length);        
            this.cards.push(tempcards[randomNr]);
            tempcards.splice(randomNr, 1);
        }
    },    

    /**
     * Returns the number of cards in the container.
     */
    count : function() {
        return this.cards.length;
    }, 
    
    /**
     * Returns the number of selected cards in the container.
     */
    selectedCount : function() {
        var count = 0;
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i] && this.cards[i].selected) {
                count++;
            }
        }
        return count;
    },
    
    /**
     * Renders the container. This implementation draws nothing,
     * subclasses should override this to draw themselves in the
     * correct way.
     */
    render : function() {
        this.clearImages();    
    }
}


/**
 * Class for a single card.
 */
function Card(suit, rank) {
    this.initialize(suit, rank);
}

Card.prototype = {

    selected : false, //Whether the cards is selected
    facedown : false, //Whether the card should be drawn face down
    selectEnabled : false, //Whether the card can be selected.

    /**
     * Initializes the card, creates the image, gives it a name and
     * adds event listeners for selection.
     */
    initialize : function(suit, rank) {
        this.shortName = suit + rank;
        this.suit = suit;
        var sorts = { h : 'Hearts', s : 'Spades', d : 'Diamonds', c : 'Clubs'};
        var specialCards = {11 : 'Jack', 12 : 'Queen', 13 : 'King', 1 : 'Ace', 14: 'Ace' }
        if (specialCards[rank]) {
            this.longName = specialCards[rank] + ' of ' + sorts[suit];
        } else {
            this.longName = rank + ' of ' + sorts[suit];
        }

        this.image = document.createElement('img');
        this.rank = rank;
        this.setFacedown(this.facedown);
        this.image.card = this;        
    },
    
    /**
     * Returns the card name.
     */
    toString : function() {
        return this.longName;
    },
    
    /**
     * Sets whether the card is drawn face-up or face-down.
     */
    setFacedown : function(facedown) {
        this.facedown = !!facedown;
        if (this.facedown) {
            this.image.setAttribute('src', 'cards/back.png');
        } else {
            var filename = this.rank == 14 ? this.suit + '1' : this.shortName;
            this.image.setAttribute('src', 'cards/' + filename + '.png');
        }
        
        
    },
    
    /**
     * Toggles whether the card is drawn selected or not. If it is being selected
     * then it will be drawn 20 pixels higher than it was, if it is being 
     * deselected it will be drawn 20 pixels lower.
     */
    toggleSelect : function() {
        if (!this.selectEnabled) {
            return;
        }
        var currentY = parseFloat(this.image.style.top);
        if (this.selected) {
            this.image.style.top = (currentY + 20) + 'px';
        } else {
            this.image.style.top = (currentY - 20) + 'px';
        }
        this.selected = !this.selected;
    }
}


/**
 * Deck of cards, inherits from CardContainer.
 */
function Deck(id, facedown, acesHigh) {
    this.initialize(id, facedown, acesHigh);          
}

Deck.prototype = {

    /**
     * Initializes the deck, adds all cards. If aces are high
     * they will have a value of 14, otherwise 1. This will
     * not shuffle the deck, the caller has to do that himself.
     */
    initialize : function(id, facedown, acesHigh) {
        this.base_Initialize(id, facedown);
        var start = acesHigh ? 2 : 1;
        var end = start + 12;
        for (var i = start; i <= end; i++) {
            this.addCard(new Card('h', i));
            this.addCard(new Card('s', i));
            this.addCard(new Card('d', i));
            this.addCard(new Card('c', i));
        }
    },

    /**
     * Renders the deck, either with face up cards or face down.
     */
    render : function () {
        this.base_Render();
        var parent = document.getElementById(this.id);
        parent.style.width = (80 + ((this.cards.length-1) / 3) * 2 ) + 'px';
        var incr = 3;    
        for (var i in this.cards) {
            var img = this.cards[i].image;
            img.style.position = 'absolute';
            img.style.top = incr + 'px';
            img.style.left = incr + 'px';
            if (i % 3 == 0) {
                incr += 2;
            }
            parent.appendChild(img);
        }   
    },
    
    /**
     * Draw the top card from the deck.
     */
    drawCard : function() {
        return this.removeTopCard();
    }
};
extend(CardContainer, Deck);


/**
 * Class for a hand of cards. Inherits from CardContainer.
 */
function Hand(id, facedown) {
    this.initialize(id, facedown);          
}

Hand.prototype = {
    
    /**
     * Initializes the hand. Currently does nothing.
     */
    initialize : function(id, facedown) {
        this.base_Initialize(id, facedown);
    },

    /**
     * Renders the hand. The suit and rank of each card should be visible
     * so they can be easily selectable. Can be drawn face-up or face-down.
     */
    render : function () {
        this.base_Render();
        var parent = document.getElementById(this.id);
        parent.style.width = (80 + (this.cards.length-1) * 18 ) + 'px';
        var incr = 3;    
        for (var i in this.cards) {
            var img = this.cards[i].image;
            img.style.position = 'absolute';
            if (this.cards[i].selected) {
                img.style.top = '4px';
            } else {
                img.style.top = '24px';
            }
            img.style.left = incr + 'px';
            incr += 18;
            parent.appendChild(img);
        }   
    }
};

extend(CardContainer, Hand);


///Pre-load all card images
window.preLoad = [];
var img = new Image();
img.src = 'cards/back.png';
preLoad.push(img);
var suits = ['h', 'c', 'd', 's'];
for (var s in suits) {
    for (var i = 1; i <= 13; i++) {
        img = new Image();
        img.src = 'cards/' + suits[s] + i + '.png';
        window.preLoad.push(img);
    }
}

//Setup event listener for card clicks. Can't do that per
//img because that only works in Firefox. Use  the old
//fashioned .onclick method because I don't want to deal
//with attachEvent/addEventListener crap.
document.onclick = function(event) {
    event = event || window.event;

    var card;
    if (event.target) {
        card = event.target.card;
    } else if (event.srcElement) {
        card = event.srcElement.card;
    }

    if (card && card.selectEnabled) {
        card.toggleSelect();
    }
};
