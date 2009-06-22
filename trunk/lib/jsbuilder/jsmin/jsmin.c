/* jsmin.c
   2008-08-03

Copyright (c) 2002 Douglas Crockford  (www.crockford.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
 * Adapted to be used from Ruby by Domen Puncer <domen@cba.si>
 */

#include <stdlib.h>
#include <stdio.h>
#include "ruby.h"

static int   theA;
static int   theB;
static int   theLookahead = EOF;

static const char *src;
static int src_len;
static char *dest;
static int srci, desti;

/* isAlphanum -- return true if the character is a letter, digit, underscore,
        dollar sign, or non-ASCII character.
*/

static int
isAlphanum(int c)
{
    return ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') ||
        (c >= 'A' && c <= 'Z') || c == '_' || c == '$' || c == '\\' ||
        c > 126);
}


/* get -- return the next character from stdin. Watch out for lookahead. If
        the character is a control character, translate it to a space or
        linefeed.
*/

static int
get()
{
    int c = theLookahead;
    theLookahead = EOF;
    if (c == EOF) {
	if (srci < src_len)
	    c = src[srci++];
	else
	    c = EOF;
    }
    if (c >= ' ' || c == '\n' || c == EOF) {
        return c;
    }
    if (c == '\r') {
        return '\n';
    }
    return ' ';
}


/* peek -- get the next character without getting it.
*/

static int
peek()
{
    theLookahead = get();
    return theLookahead;
}


/* next -- get the next character, excluding comments. peek() is used to see
        if a '/' is followed by a '/' or '*'.
*/

static int
next()
{
    int c = get();
    if  (c == '/') {
        switch (peek()) {
        case '/':
            for (;;) {
                c = get();
                if (c <= '\n') {
                    return c;
                }
            }
        case '*':
            get();
            for (;;) {
                switch (get()) {
                case '*':
                    if (peek() == '/') {
                        get();
                        return ' ';
                    }
                    break;
                case EOF:
                    rb_raise(rb_eException, "JSMIN Unterminated comment.");
                }
            }
        default:
            return c;
        }
    }
    return c;
}


static inline void put_to_dest(int c)
{
    /* this should be impossible? */
    if (desti < src_len)
        dest[desti++] = c;
    else
        rb_raise(rb_eIndexError, "JSMIN target file is larger than source.");
}

/* action -- do something! What you do is determined by the argument:
        1   Output A. Copy B to A. Get the next B.
        2   Copy B to A. Get the next B. (Delete A).
        3   Get the next B. (Delete B).
   action treats a string as a single character. Wow!
   action recognizes a regular expression if it is preceded by ( or , or =.
*/

static void
action(int d)
{
    switch (d) {
    case 1:
        put_to_dest(theA);
    case 2:
        theA = theB;
        if (theA == '\'' || theA == '"') {
            for (;;) {
                put_to_dest(theA);
                theA = get();
                if (theA == theB) {
                    break;
                }
                if (theA == '\\') {
                    put_to_dest(theA);
                    theA = get();
                }
                if (theA == EOF) {
                    rb_raise(rb_eException, "JSMIN unterminated string literal.");
                }
            }
        }
    case 3:
        theB = next();
        if (theB == '/' && (theA == '(' || theA == ',' || theA == '=' ||
                            theA == ':' || theA == '[' || theA == '!' ||
                            theA == '&' || theA == '|' || theA == '?' ||
                            theA == '{' || theA == '}' || theA == ';' ||
                            theA == '\n')) {
            put_to_dest(theA);
            put_to_dest(theB);
            for (;;) {
                theA = get();
                if (theA == '/') {
                    break;
                }
                if (theA =='\\') {
                    put_to_dest(theA);
                    theA = get();
                }
                if (theA == EOF) {
                    rb_raise(rb_eException, "JSMIN unterminated Regular Expression literal.");
                }
                put_to_dest(theA);
            }
            theB = next();
        }
    }
}


/* jsmin -- Copy the input to the output, deleting the characters which are
        insignificant to JavaScript. Comments will be removed. Tabs will be
        replaced with spaces. Carriage returns will be replaced with linefeeds.
        Most spaces and linefeeds will be removed.
*/

static void
jsmin()
{
    theA = '\n';
    action(3);
    while (theA != EOF) {
        switch (theA) {
        case ' ':
            if (isAlphanum(theB)) {
                action(1);
            } else {
                action(2);
            }
            break;
        case '\n':
            switch (theB) {
            case '{':
            case '[':
            case '(':
            case '+':
            case '-':
                action(1);
                break;
            case ' ':
                action(3);
                break;
            default:
                if (isAlphanum(theB)) {
                    action(1);
                } else {
                    action(2);
                }
            }
            break;
        default:
            switch (theB) {
            case ' ':
                if (isAlphanum(theA)) {
                    action(1);
                    break;
                }
                action(3);
                break;
            case '\n':
                switch (theA) {
                case '}':
                case ']':
                case ')':
                case '+':
                case '-':
                case '"':
                case '\'':
                    action(1);
                    break;
                default:
                    if (isAlphanum(theA)) {
                        action(1);
                    } else {
                        action(3);
                    }
                }
                break;
            default:
                action(1);
                break;
            }
        }
    }
}



static VALUE jsmin_initialize(VALUE self)
{
	return self;
}

static VALUE jsmin_convert(VALUE self, VALUE str)
{
	VALUE ret_str;

	src = RSTRING(str)->ptr;
	src_len = RSTRING(str)->len;

	srci = desti = 0;
	dest = malloc(src_len);
	if (!dest)
		rb_raise(rb_eNoMemError, "malloc failed in %s", __func__);

	jsmin();

	ret_str = rb_str_new(dest, desti);

	free(dest);

	return ret_str;
}

static VALUE cl;

void Init_jsmin()
{
	cl = rb_define_class("JSMin", rb_cObject);
	rb_define_method(cl, "initialize", jsmin_initialize, 0);
	rb_define_method(cl, "convert", jsmin_convert, 1);
}
