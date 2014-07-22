String.prototype.$ = function() {

  s = this;
  if (arguments.length == 1 && arguments[0].constructor == Object) {
    for (var key in arguments[0]) {
      s = s.replace(new RegExp("\\$" + key, "g"), arguments[0][key]);
    }
  } else {
    for (var i = 0; i < arguments.length; i++) {
      s = s.replace(new RegExp("\\$" + (i+1), "g"), arguments[i]);
    }
  }

  return s;
};

function test_numbers() {
  var undef; //Undefined value
  var s = 'My name is $1 and I am $2 years old. This is a null variable: $3, this one is undefined: $4' .$ ('Einar', 27, null, undef);
  alert(s);
}

function test_dict() {
  var d; //Undefined value
  var dict = { name : 'Einar', age : 27, nullvar : null, undef : d };
  var s = 'My name is $name and I am $age years old. This is a null variable: $nullvar, this one is undefined: $undef' .$ (dict);
  alert(s);
}

