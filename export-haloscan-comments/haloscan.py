"""
   Script to export comments from Haloscan to an .xml file so they
   can be imported into some other blog system.
   
   DISCLAIMER: This is provided "AS-IS", I make no guarantees that this
   works, it's based on screen scraping so could stop working whenever
   Haloscan change their pages. 
   
   According to Haloscan's Terms of Service (http://www.haloscan.com/privacy/)
   it's not explicitly forbidden to screen scrape their site. HOWEVER, they say:
   
   "We reserve the right to suspend, delete, or cancel any account/service at
    any time for any reason."
   
   This script makes a new http request for every single comment so if you 
   have thousands of comments and Haloscan doesn't approve of you pounding 
   their server and suspends your account and you lose all your comments, 
   I CANNOT BE HELD RESPONSIBLE. USE AT YOUR OWN RISK! You've been warned!
"""

__version__   = '1.0'
__author__    = 'Einar Egilsson'
__date__      = 'August 13th 2007'
__url__       = 'http://tech.einaregilsson.com/2007/08/13/export-haloscan-comments/' 


import urllib2, re, os, sys, string

LOGIN_COOKIE = None

def open_url(url, postdata=None, headers={}):
    global LOGIN_COOKIE
    headers['cookie'] = LOGIN_COOKIE

    request = urllib2.Request('http://www.haloscan.com' + url, postdata, headers)
    opener = urllib2.build_opener()
    url = opener.open(request)
    
    if not LOGIN_COOKIE: LOGIN_COOKIE = url.headers.dict['set-cookie']
    return url.read()


def login(username, password):
    print 'Logging in...'
    vars = { 'entered_login' : username
           , 'entered_password' : password
           , 'enter' : 'Sign%20In' }
           
    postdata = '&'.join('%s=%s' % (k, vars[k]) for k in vars)
    open_url('/members/', postdata)
    print 'Login complete'

def export_comments(username, password, outfile, delay=100):
    
    login(username, password)
    
    counter = 0
    
    if os.path.exists(outfile):
        file = open(outfile, 'r')
        counter = len(file.read().split('<comment>'))-1
        file.close()
        print 'File already exists, found %s comments' % counter
        print 'Starting at comment %s' % (counter+1)
        file = open(outfile, 'a')
    else:
        file = open(outfile, 'w')
        file.write('<?xml version="1.0" encoding="ISO-8859-1"?>\n')
        file.write("<comments>\n")


    xml_template = """
  <comment>
    <name>%(name)s</name>
    <email>%(email)s</email>
    <url>%(url)s</url>
    <time>%(year)s-%(month)s-%(day)s %(hour)s:%(minute)s:%(sec)s</time>
    <ip>%(ip)s</ip>
    <thread>%(thread_id)s</thread>
    <commentId>%(comment_id)s</commentId>
    <text><![CDATA[%(text)s]]></text>
  </comment>"""

    while True:
        html = open_url('/members/posts.php?start=%s' % counter)
        
        comments = re.findall(r'(\d+)</a></td><td><a href="editpost.php\?post\=(\d+)"', html)
        if len(comments) == 0:
            break

        for thread_id, comment_id in comments:
            
            html = open_url('/members/editpost.php?post=%s' % comment_id)

            values = { 'thread_id' : thread_id, 'comment_id' : comment_id }

            for val in ('name', 'email', 'url'):
                values[val] = re.search(r'<input name="edit%s".*?value="(.*?)"' % val, html).group(1)


            for val in ('day', 'year', 'hour', 'minute', 'sec'):
                values[val] = string.zfill(re.search(r' name="t%s" value="?(\d+)"' % val, html).group(1),2)

            values['ip'] = re.search(r'<b>IP</b>:\s*(.*?)<br />', html).group(1)
            values['text']    = re.search(r'<textarea.*?name="editmessage".*?>(.*?)</textarea>', html, re.DOTALL).group(1)
            values['month'] = string.zfill(re.search(r'<option value="(\d+)" selected="selected">', html).group(1),2)
            
            counter += 1 
            values['number'] = counter
            
            file.write(xml_template % values)
            
            print 'Comment %(number)s: %(name)s at %(month)s %(day)s, %(year)s - %(hour)s:%(minute)s:%(sec)s' % values
            file.flush()
        


    file.write('\n</comments>')
    file.close()


if __name__ == '__main__':
    print __doc__[__doc__.index('DISCLAIMER'):]
    print 'Haloscan Comment Exporter v%s' % __version__
    print '%s\n' % __url__
    user = raw_input('Username: ')
    password = raw_input('Password: ')
    export_comments(user, password, user + '.xml')