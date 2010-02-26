/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

#include <time.h>
#include "ruby.h"

// available characters
char *CHARS_IN = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";

// generates an random string of length len
void generate_rand_str( char *cstr, int str_len ){
  
  // random char index (of CHARS_IN)
  int rand_idx=0;
  
  // loop index
  int i=0;
  
  // loops len times
  for(;i<str_len;i++){
    // get a random number in the range of 0..62
    rand_idx = rand() % 63;
    // appends a random char from CHARS_IN
    cstr[i] = (char)CHARS_IN[rand_idx];
  }
  
  
}

// ruby-side 'gen' -method
// return one random value, length specified in initialize
static VALUE cRandGen_gen( VALUE self ){
  VALUE target_length;
  target_length = rb_iv_get(self,"@target_length");
  int str_len = FIX2INT( target_length );
  char cstr[str_len];
  generate_rand_str( cstr, str_len );
  VALUE random_string;
  random_string = rb_str_new( cstr, str_len );
  return random_string;
}

// ruby-side 'get' -method
// gets many random values, outputs array, length specified in initialize
static VALUE cRandGen_gen_many( VALUE self, VALUE amount ){
  VALUE output_arr;
  output_arr = rb_ary_new();
  int arr_len = FIX2INT( amount );
  int k = 0;
  for(;k<arr_len;k++){
    rb_ary_push( output_arr, cRandGen_gen( self ) );
  }
  return output_arr;
}

// ruby-side 'initialize' -method
static VALUE cRandGen_initialize( VALUE self, VALUE target_length ){
  rb_iv_set(self,"@target_length",target_length);
  return self;
}

// ruby-side 'RandGen' -class
VALUE cRandomGenerator;
// ruby-side 'RandomGenerator' -class (backwards-compatible)
VALUE cRandomGenerator2;
void Init_randgen() {
  srand(time(NULL));
  
  cRandomGenerator = rb_define_class("RandGen", rb_cObject);
  rb_define_method( cRandomGenerator, "initialize", cRandGen_initialize, 1 );
  rb_define_method( cRandomGenerator, "gen", cRandGen_gen, 0 );
  rb_define_method( cRandomGenerator, "gen_many", cRandGen_gen_many, 1 );
}

