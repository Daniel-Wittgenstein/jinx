


Bruh is a simple command-line program.

It's written in Go. You can compile the source code for your platform.

Once you got Go installed, just do (from the "bruh" folder):

  $ go build

Bruh takes a text file, reads its contents, and outputs a JS file that can be used to load the raw data
of that text file. The reason for this is, of course, that we cannot just load the contents of a file
using JS.

For help, try:

  $ ./bruh -help

and:

  $ ./bruh -man

(Both give different texts, do read both.)
