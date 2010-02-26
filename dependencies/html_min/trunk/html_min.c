/*
 * html_min - compression of whitespace. Keeps #{, ${ templates intact.
 *
 * Author:  Domen Puncer <domen@cba.si>
 * License: MIT
 *
 */


#include <stdlib.h>
#include "ruby.h"

static VALUE html_min_initialize(VALUE self)
{
	return self;
}

static int isws(int c)
{
	if (c == ' ' || c == '\t' || c == '\n' || c == '\r')
		return 1;
	return 0;
}

static int html_min(char *dest, const char *src, int len)
{
	char *orig_dest = dest;
	const char *src_end = src + len;

	int last_ws = 0;
	int in_template = 0;

	while (src < src_end) {
		int c = *src++;
		int ws = isws(c);

		if (in_template == 2) {
			*dest++ = c;
			if (c == '}')
				in_template = 0;

		} else {
			if (!ws)
				*dest++ = c;
			else if (!last_ws)
				*dest++ = c;
				//*dest++ = ' ';

			if (c == '#' || c == '$')
				in_template = 1;
			if (in_template == 1 && c == '{')
				in_template = 2;
		}

		last_ws = ws;
	}

	return dest - orig_dest;
}

static VALUE html_min_minimize(VALUE self, VALUE str)
{
	VALUE ret_str;
	const char *src;
	char *dest;
	int src_len;
	int len;

	src = RSTRING_PTR(str);
	src_len = RSTRING_LEN(str);

	dest = malloc(src_len);
	if (!dest)
		rb_raise(rb_eNoMemError, "malloc failed in %s", __func__);

	len = html_min(dest, src, src_len);

	ret_str = rb_str_new(dest, len);

	free(dest);

	return ret_str;
}


static VALUE cl;

void Init_html_min()
{
	cl = rb_define_class("HTMLMin", rb_cObject);
	rb_define_method(cl, "initialize", html_min_initialize, 0);
	rb_define_method(cl, "minimize", html_min_minimize, 1);
}
