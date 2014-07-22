#
# Mozilla Extension Generator
# Copyright 2007 Einar Egilsson
#
# See http://tech.einaregilsson.com/2007/08/01/mozilla-extension-generator/ for more info.
#

import os, sys, re, base64        

#Constants
#Fill these out so you won't get prompted for them everytime:
YOUR_NAME       = ''
YOUR_DOMAIN     = '' # if filled out the extension guid will be of the form extensionname@yourdomain.com
FIREFOX_MIN     = '2.0'
FIREFOX_MAX     = '2.0.0.*'
THUNDERBIRD_MIN = '2.0'
THUNDERBIRD_MAX = '2.0.0.*'
INITIAL_VERSION = '0.9'


def generate():

    print 'Mozilla Extension Generator'
    print 'Copyright (c) 2007 Einar Egilsson (http://tech.einaregilsson.com)'
    print ''

    sections = {}
    exclude_sections = []

    replacements = {}
    for keyword, prompt_text in repl_vars:
        replacements[keyword] = prompt(prompt_text)

    answer = ''
    while not answer.lower() in ['f', 't']:
        answer = prompt('Firefox or Thunderbird (f/t) ')

    sections['firefox'] = answer.lower() == 'f'
    sections['thunderbird'] = answer.lower() == 't'

    for keyword, prompt_text in section_vars:
        answer = ''
        while not answer.lower() in ['y', 'n']:
            answer = prompt('Include %s ? (y/n)' % prompt_text)

        sections[keyword] = answer.lower() == 'y'

    
    replacements['author'] = YOUR_NAME or prompt('Author name')
    
    extname = replacements['name'].lower()
    replacements['lname'] = extname

    replacements['lib'] = replacements['name'] + 'Lib'
    replacements['llib'] = replacements['lib'].lower()

    if YOUR_DOMAIN:
        replacements['guid'] = replacements['lname'] + '@' + YOUR_DOMAIN
    else:
        replacements['guid'] = prompt('Guid') 


    replacements['fmin'] = FIREFOX_MIN
    replacements['fmax'] = FIREFOX_MAX
    replacements['tmin'] = THUNDERBIRD_MIN
    replacements['tmax'] = THUNDERBIRD_MAX

    replacements['version'] = INITIAL_VERSION

    if sections['menuitem']:
        replacements['menuName'] = prompt('Menu item label')
        replacements['menuAccessKey'] = prompt('Menu item access key')

    if sections['contextmenu']:
        replacements['contextName'] = prompt('Contextmenu item label')
        replacements['contextAccessKey'] = prompt('Contextmenu item access key')


    #Make all dirs needed
    os.makedirs(extname)
    for d in dirs:
        os.makedirs(os.path.join(extname, d))


    print '\nCreating files...\n'
    #Proccess each file
    for filename, filecontent in files:

        is_img = filename[-3:] == 'png'

        #Include or exclude sections of code
        exclude_pattern = r'\[%s].*?\[/%s]\s*\n'
        include_pattern = r'\[/?%s]\s*\n'

        for key in sections:
            if sections[key]:
                pattern = include_pattern % key
            else:
                pattern = exclude_pattern % (key, key)

            regex = re.compile(pattern, re.DOTALL)
            filecontent = re.sub(regex, '', filecontent)

        #Simple keyword replacements
        filename = filename % replacements
        if not is_img:
            filecontent = filecontent % replacements

        filecontent = filecontent.strip()

        #The whole file might be wrapped in a section, and if the section
        #was removed we don't want to create the file
        if filecontent:
            if is_img:
                filecontent = base64.b64decode(filecontent)

            path = extname + '/' + filename
            file = open(path, 'wb')
            print path
            file.write(filecontent)
            file.flush()
            file.close()

    print ''
    print 'Extension complete'


def prompt(prompt_text):
    sys.stdout.write(prompt_text + ': ')
    return raw_input()

#Directories to create
dirs = ['chrome/content', 'chrome/locale/en-US', 'chrome/skin', 'defaults/preferences']

repl_vars = (
    ('prettyname',  'Extension name'),
    ('name',        'Extension code name'),
    ('descr',       'Extension description'),
)

section_vars = (
    ('menuitem',    'Menu item'),
    ('contextmenu', 'Context menu'),
)


#Below here are only file templates
files = (

('install.rdf',
"""
<?xml version="1.0" encoding="UTF-8"?>
<RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
 xmlns:em="http://www.mozilla.org/2004/em-rdf#">
  <Description about="urn:mozilla:install-manifest">
    <em:id>%(guid)s</em:id>
    <em:name>%(prettyname)s</em:name>
    <em:version>%(version)s</em:version>
    <em:creator>%(author)s</em:creator>
    <em:description>%(descr)s</em:description>
    <!-- <em:homepageURL></em:homepageURL> -->
    <!-- <em:aboutURL>chrome://%(lname)s/content/about.xul</em:aboutURL> -->
    <em:iconURL>chrome://%(lname)s/content/%(lname)s.png</em:iconURL>
    <em:targetApplication>
      <Description>
[firefox]
        <em:id>{ec8030f7-c20a-464f-9b0e-13a3a9e97384}</em:id> <!-- firefox -->
        <em:minVersion>%(fmin)s</em:minVersion>
        <em:maxVersion>%(fmax)s</em:maxVersion>
[/firefox]
[thunderbird]
        <em:id>{3550f703-e582-4d05-9a08-453d09bdfdc6}</em:id> <!-- thunderbird -->
        <em:minVersion>%(tmin)s</em:minVersion>
        <em:maxVersion>%(tmax)s</em:maxVersion>
[/thunderbird]
      </Description>
    </em:targetApplication>
  </Description>
</RDF>
"""),

('chrome.manifest',
"""
content %(lname)s file:chrome/content/
locale  %(lname)s en-US   file:chrome/locale/en-US/
skin    %(lname)s classic/1.0 file:chrome/skin/
[thunderbird]
overlay chrome://messenger/content/messenger.xul    chrome://%(lname)s/content/overlay.xul
[/thunderbird]
[firefox]
overlay chrome://browser/content/browser.xul    chrome://%(lname)s/content/overlay.xul
[/firefox]
"""),

('defaults/preferences/%(lname)s.js',
"""
pref("extensions.%(lname)s.debug", false);

// See http://kb.mozillazine.org/Localize_extension_descriptions
pref("extensions.%(guid)s.description", "chrome://%(lname)s/locale/%(lname)s.properties");
"""),

('chrome/content/%(lname)s.js',
"""
var %(name)s = {

    id          : "%(guid)s",
    name        : "%(name)s",
    initialized : false,
    strings     : null,

    onLoad : function(event) {
        try {

            // initialization code
            %(lib)s.initialize(this);

[contextmenu]
[thunderbird]
            $('threadPaneContext')
[/thunderbird]
[firefox]
            $('contentAreaContextMenu')
[/firefox]
                .addEventListener("popupshowing", function(e) { %(name)s.showContextMenu(e); }, false);
[/contextmenu]

            %(lib)s.debug("Initializing...");
            this.strings = document.getElementById("%(lname)s-strings");

            %(lib)s.debug("Finished initialization");
            this.initialized = true;

        } catch(e) {
            //Don't use %(lib)s because it's initialization might have failed.
            if (this.strings) {
                alert(this.strings.getString("initError") .$ (this.name) + "\\n\\n" + e);
            } else {
                alert(e);
            }
        }
    },

    onUnload : function(event) {
        //Clean up here
        %(lib)s.debug("Finished cleanup");
    },

[contextmenu]
    showContextMenu : function(event) {
[thunderbird]
        $("%(lname)s-context").hidden = (GetNumSelectedMessages() > 0);
[/thunderbird]
[firefox]
        $("%(lname)s-context").hidden = gContextMenu.onImage;
[/firefox]
    },

    onContextMenuCommand: function(event) {
        //Do your thing
        alert("Context menu command");
    },

[/contextmenu]
[menuitem]
    onMenuItemCommand: function(event) {
        alert("Menu item command");
    },

[/menuitem]

};

window.addEventListener("load", function(event) { %(name)s.onLoad(event); }, false);
window.addEventListener("unload", function(event) { %(name)s.onUnload(event); }, false);
"""),

('chrome/content/overlay.xul',
"""
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="chrome://%(lname)s/skin/overlay.css" type="text/css"?>
<!DOCTYPE overlay SYSTEM "chrome://%(lname)s/locale/%(lname)s.dtd">
<overlay id="%(lname)s-overlay"
  xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">

  <script src="%(llib)s.js"/>
  <script src="%(lname)s.js"/>

  <stringbundleset id="stringbundleset">
    <stringbundle id="%(lname)s-strings" src="chrome://%(lname)s/locale/%(lname)s.properties"/>
  </stringbundleset>

[firefox]
[menuitem]
  <menupopup id="menu_ToolsPopup">
    <menuitem id="%(lname)s-menuitem" label="&%(name)sMenuItem.label;"
              accesskey="&%(name)sMenuItem.accesskey;"
              oncommand="%(name)s.onMenuItemCommand(event);"/>
  </menupopup>
[/menuitem]
[contextmenu]
  <popup id="contentAreaContextMenu">
    <menuitem id="%(lname)s-context" label="&%(name)sContext.label;"
              accesskey="&%(name)sContext.accesskey;"
              insertafter="context-stop"
              oncommand="%(name)s.onContextMenuCommand(event)"/>
  </popup>
[/contextmenu]
[/firefox]
[thunderbird]
[menuitem]
  <menupopup id="taskPopup">
    <menuitem id="%(lname)s-menuitem" label="&%(name)sMenuItem.label;"
              accesskey="&%(name)sMenuItem.accesskey;"
              oncommand="%(name)s.onMenuItemCommand(event);"/>
  </menupopup>
[/menuitem]
[contextmenu]
  <popup id="threadPaneContext">
    <menuitem id="%(lname)s-context" label="&%(name)sContext.label;"
              accesskey="&%(name)sContext.accesskey;"
              oncommand="%(name)s.onContextMenuCommand(event)"/>
  </popup>
[/contextmenu]
[/thunderbird]
</overlay>
"""),

('chrome/skin/overlay.css',
"""
/* Include your overlay stylings here */
"""),

('chrome/content/%(lname)s.png',
"""
iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAIAAAC1JZyVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdB
TUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAFLElE
QVR42oSGgQ0AIAzCRAb/nyzjAduEgvMDAO8FOSxT06BaJO14vDeRE2eWJ4BYCNsBtIQJaC4T1GiYFRCz
gTyQKWCjwBTQZLB1rGALwPYA2QABhM8aoB+YgA4H2gL2CtBYJpgNzCxgX8B8AzYRZBGIgNkAhWC7AAKI
BbcdTGAfgL3CAg0xsPtZmFmZoWEFCh0WqFdYoeGD5AWwPWAeQABht4YZbDwz1BvMKAHFArUBEkaoABFi
IDvZ2dlgogABhG4NI8QfIAgKL1hkg0iYD+DRDYkTFhawmWzQYALZghJeYB5AALGgRTg4rJiZmOGhBKJZ
YZHBDLMAbCfYUBZ4cmKDxzvQF2DbwL5hB0kDBBALasJlZmKBeoQFmnQxA4oFEtMw30CcCzGXDe4Ldnhy
BomxAQQQ1BpgmgIbDwMwG6ApCkQDtTCzwBIvOIJBQtCEBTEa4iGY2RB/QGQAAogFkqggoQQJMUjegJiN
lPFYwDbBoh2SfKGhBQokSPICmw5OY+zQGAN5kYUNIICg2QKSdIHmbtq0yd7eHk9mcnZ2Auru6OgwMDDA
o6yzq4sdnnXYWAECiAWUmFhAWQPiIWAM4S8XgBELdCXQbfiVsbPD0xvIWwABBMl60LACsoiwBhQ4jEwE
lLFDkhkbtMgBCCAWVkj2g8U5sjWZGZlnz59lA2cNSEnCBkmlLKzAJANXNnvOnIcPHkCSLlAR0B8skGQM
TQwgEiCAWEDZDhxgkLIJOTTcPdz19PUgSQ8cf0wPHz68eeMG0DZkZYYG+kqKisxI4P37D2/evIaXbUAA
EEDgQhaSbsFlLbJvAgIC0IJi5cqV9+/dB7oQ2RoTE1M0ZefPn//06SOsnAHZBBBALEhFFSh08Ac60KVs
4ODArwyU9iGBC7WFFSCAYIU5rEhHDvRt27e/fvUKHhTAcHv29Ck7qEBkQ1Z2+fLlL1++QGskMPj85TPY
FhZoOcTCChBA4OwGLhaZQRkaJdBOHDt+/cY1FhZ4KQJyFrjYRQm0Bw8evHr5Cp7/oYUyLO+ygMs9gABi
gfuIDVx3IOsHlyJIhRMkh4ONQFEG1M8OKYoRxQMbcl3EwgoQQLCgY4GqQPZNbW0tZrgvWbLkyZMnyNZ4
eHpiKrt+/fq3b9+g7mdhAQgg9KqJYPYGl2HsBHMxC7wcB1cfAAEEjiWkGpagNZAQIkIZC7iRA03EAAHE
aGdnh2wNpHaFMYDuhjPZ4HHDCinXYPHFBmtkQKKchQXOgNa1QP8ABBCk8oPW30gMVrCZ7KxwG9hQWRDj
wXxo+EDCCBwTEDFgrmcF53pgQgYIIBaEqWwsyKYh6nGoKMx4RLOFHVypscJSD8IvLNAMwgKvvAACiIUd
6n+wbnZoTcSO1P6B5hoW5JCCF71IloCzPisspJhhVS+kLgYIIEipgGQoNKdg8Q1SrmNDTpwssKob6gdW
aIMR3pwApheAAGKBVD+wVg8bG7zJgFyrQ6INLAsvQaB2QAhmaNIFWwluCzHDG92gcgoggFigjmdDqoYQ
NrOxIbUiYI0AaMqCewIaI6D8AbaIGQHBDUpmYDMcIIDAQY6IYjZYXMDCDBYLrPCECC2V4AHGBm/+QNp0
sFYqMwuscQzMywABBC0KkaMBViqxonoF0vhDatxAynSIL1jhDS5QCIGtgTZdIbkVIIDASQCSJcH5AErB
Cj+UCEeyAt46hCYrZmi6ZUbUB6AWE7xQAAgghG/gOQLRpEMth1ASFbTlxgJvN0LaLKDaHlyfM6KWRgAB
BgDTG34EXY2OPQAAAABJRU5ErkJggg==
"""),

('chrome/content/%(llib)s.js',
"""
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *    MozLib  -  Utility functions for Firefox extensions
 *
 *    Einar Egilsson
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var %(lib)s = {

    _debug      : false,
    _ext        : null,
    _cout       : null,
    _prefBranch : null,
    version     : 0.2,

    initialize : function(extension) {
        this._ext = extension;
        this._cout = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
        this._debug = true;
        this._initPrefs();
    },

    debug : function(str) {
        if (this._ext.prefs.debug) {
            this._cout.logStringMessage("$1: $2" .$ (this._ext.name, str));
        }
    },


    debugObject : function(name, obj) {
        s = name + ': ';
        for (x in obj)
            s += "\\n\\t$1 : $2" .$ (x, obj[x]);
        this.debug(s);
    },

    //Adds all prefs to a prefs object on the extension object
    _initPrefs : function() {

        this._prefBranch = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService)
                                .getBranch("extensions.$1." .$ (this._ext.id.split("@")[0]));
        this._ext.prefs = {};

        var list = this._prefBranch.getChildList("", {}).toString().split(",");

        for (i in list) {

            var name = list[i];

            var type = this._prefBranch.getPrefType(name);

            if (type == this._prefBranch.PREF_STRING) {
                this._ext.prefs[name] = this._prefBranch.getCharPref(name);
            } else if (type == this._prefBranch.PREF_INT)  {
                this._ext.prefs[name] = this._prefBranch.getIntPref(name);
            } else if (type == this._prefBranch.PREF_BOOL) {
                this._ext.prefs[name] = this._prefBranch.getBoolPref(name);
            }
        }
    },


    getCharPref : function(branch) {
        return this._prefBranch.getCharPref(branch);
    },

    getBoolPref : function(branch) {
        return this._prefBranch.getBoolPref(branch);
    },

    getIntPref : function(branch) {
        return this._prefBranch.getIntPref(branch);
    },

    getExtensionFolder : function() {
        return Cc["@mozilla.org/extensions/manager;1"]
                .getService(Ci.nsIExtensionManager)
                    .getInstallLocation(this._ext.id)
                        .getItemLocation(this._ext.id);

    },

    getEnvVar : function(name) {
        return Cc["@mozilla.org/process/environment;1"]
                .getService(Ci.nsIEnvironment)
                    .get(name);

    },

    setEnvVar : function(name, value) {
        return Cc["@mozilla.org/process/environment;1"]
                .getService(Ci.nsIEnvironment)
                    .set(name, value);

    },

    msgBox : function(title, text) {
        Cc["@mozilla.org/embedcomp/prompt-service;1"]
            .getService(Ci.nsIPromptService)
                .alert(window, title, text);
    },

    //Converts a chrome path to a local file path. Note that the
    //file specified at the end of the chrome path does not have
    //to exist.
    chromeToPath : function(path) {
        var rv;
        var ios = Cc["@mozilla.org/network/io-service;1"].createInstance(Ci.nsIIOService);
        var uri = ios.newURI(path, 'UTF-8', null);
        var cr = Cc["@mozilla.org/chrome/chrome-registry;1"].createInstance(Ci.nsIChromeRegistry);
        return cr.convertChromeURL(uri);
        return decodeURI(rv.spec.substr("file:///".length).replace(/\//g, "\\\\"));
    },

    //Saves 'content' to file 'filepath'. Note that filepath needs to
    //be a real file path, not a chrome path.
    saveToFile : function(filepath, content) {
        var file = this.getFile(filepath);

        if (!file.exists()) {
            file.create(Ci.nsIFile.NORMAL_FILE_TYPE, 420);
        }
        var outputStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);

        outputStream.init( file, 0x04 | 0x08 | 0x20, 420, 0 );
        var result = outputStream.write( content, content.length );
        outputStream.close();
    },

    startProcess: function(filename, args) {

        var file = this.getFile(filename);

        args = args ? args : [];

        if (file.exists()) {
            var nsIProcess = Cc["@mozilla.org/process/util;1"].getService(Ci.nsIProcess);
            nsIProcess.init(file);
            nsIProcess.run(false, args, args.length);
        } else {
            throw Error("File '$1' does not exist!" .$ (filename));
        }

   },

    //Simulates a double click on the file in question
    launchFile : function(filepath) {
        var f = this.getFile(filepath);
        f.launch();
    },


    //Gets a local file reference, return the interface nsILocalFile.
    getFile : function(filepath) {
        var f = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
        f.initWithPath(filepath);
        return f;
    },

    //Returns all elements that match the query sent in. The root used
    //in the query is the window.content.document, so this will only
    //work for html content.
    xpath : function(doc, query) {
        return doc.evaluate(query, doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    }



};

//************** Some prototype enhancements ************** //

if (!window.Cc) window.Cc = Components.classes;
if (!window.Ci) window.Ci = Components.interfaces;

//Returns true if the string contains the substring str.
String.prototype.contains = function (str) {
    return this.indexOf(str) != -1;
};

String.prototype.trim = function() {
    return this.replace(/^\s*|\s*$/gi, '');
};

String.prototype.startsWith = function(s) {
    return (this.length >= s.length && this.substr(0, s.length) == s);
};

String.prototype.endsWith = function(s) {
    return (this.length >= s.length && this.substr(this.length - s.length) == s);
};

//Inserts the arguments into the string. E.g. if
//the string is "Hello $1" then "Hello $1" .$ ('johnny')
//would return "Hello johnny"
String.prototype.$ = function() {

  s = this;
  if (arguments.length == 1 && arguments[0].constructor == Object) {
    for (var key in arguments[0]) {
      s = s.replace(new RegExp("\\\\$" + key, "g"), arguments[0][key]);
    }
  } else {
    for (var i = 0; i < arguments.length; i++) {
      s = s.replace(new RegExp("\\\\$" + (i+1), "g"), arguments[i]);
    }
  }
  return s;
};

function $(id) {
    return document.getElementById(id);
}"""),

('chrome/locale/en-US/%(lname)s.dtd',
"""
[menuitem]
<!ENTITY %(name)sMenuItem.label "%(menuName)s">
<!ENTITY %(name)sMenuItem.accesskey "%(menuAccessKey)s">
[/menuitem]
[contextmenu]
<!ENTITY %(name)sContext.label "%(contextName)s">
<!ENTITY %(name)sContext.accesskey "%(contextAccessKey)s">
[/contextmenu]
"""),

('chrome/locale/en-US/%(lname)s.properties',
"""
initError=Failed to initialize $1.
extensions.%(guid)s.description=%(descr)s
""")

)

generate()
