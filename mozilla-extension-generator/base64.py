import sys, base64

if len(sys.argv) == 1:
    print 'Usage: base64 <filename>'
    sys.exit(0)

b64 = base64.b64encode(open(sys.argv[1], 'rb').read())
i = 0

while i < len(b64):
    print b64[i:i+80]
    i += 80
