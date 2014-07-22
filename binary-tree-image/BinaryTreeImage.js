var numbers = [50];

function addNode() {
    var txt = document.getElementById('number');
    var nr;
    try {
        nr = parseFloat(txt.value);
        if (isNaN(nr)) {
            alert('Not a valid number!');
            return;
        } else {
            if (nr < 1 || nr > 100) {
                alert('You can only enter numbers between 1 and 100!');
                return;
            }
        }
        for (var i in numbers) {
            if (numbers[i] == nr) {
               alert(nr + ' is already in the tree!');
               return;
            }
        }
        
        
    } catch(ex) {
        alert('Not a valid number!');
    }
    
    numbers.push(nr);
    document.getElementById('addNr').disabled = true; 
    var img = document.getElementById('tree');
    
    img.onload = function() { 
        document.getElementById('addNr').disabled = false; 
        txt.value = '';
        txt.focus();
    }
    img.src = 'http://binarytreeimage.apphb.com/BinaryTreeImageGenerator.ashx?' + numbers.join(';');
}

function keyPress(ev) {
    if (!ev) {
        ev = window.event;
    }
    var key = ev.keyCode ? ev.keyCode : ev.charCode;
    if (key == 13 && document.getElementById('addNr').disabled != true) {
        addNode();
    }
}

