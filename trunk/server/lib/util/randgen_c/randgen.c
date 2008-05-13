/**
  * HIMLE RIA Server
  * Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  *  
  *  This program is free software; you can redistribute it and/or modify it under the terms
  *  of the GNU General Public License as published by the Free Software Foundation;
  *  either version 2 of the License, or (at your option) any later version. 
  *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  *  See the GNU General Public License for more details. 
  *  You should have received a copy of the GNU General Public License along with this program;
  *  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  **/

#include <stdio.h>
#include <time.h>
#include "ruby.h"

// available characters
char *CHARS_IN = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";

// generates an random string of length len
void generate_rand_str( char *cstr, int str_len ){
  
  // random char index (of CHARS_IN)
  int rand_idx=0;
  
  srand((unsigned)time(NULL));
  
  // loop index
  int i=0;
  
  // loops len times
  for(;i<str_len;i++){
    //printf(".");
    // get a random number in the range of 0..62
    rand_idx = rand() % 63;
    // appends a random char from CHARS_IN
    cstr[i] = (char)CHARS_IN[rand_idx];
  }
  
  
}

// ruby-side 'get_one' -method
// return one random value, length specified in initialize
static VALUE cRandomGenerator_get_one( VALUE self ){
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
static VALUE cRandomGenerator_get( VALUE self, VALUE amount ){
  VALUE output_arr;
  output_arr = rb_ary_new();
  int arr_len = FIX2INT( amount );
  int k = 0;
  for(;k<arr_len;k++){
    rb_ary_push( output_arr, cRandomGenerator_get_one( self ) );
  }
  return output_arr;
}

// ruby-side 'initialize' -method
// NOTE: buffering is just ignored for now and included just for backwards-compatibility
static VALUE cRandomGenerator_initialize( VALUE self, VALUE target_length, VALUE buffer_min ){
  rb_iv_set(self,"@target_length",target_length);
  return self;
}

// ruby-side 'RandomGenerator' -class
VALUE cRandomGenerator;
void Init_randgen() {
  cRandomGenerator = rb_define_class("RandomGenerator", rb_cObject);
  rb_define_method( cRandomGenerator, "initialize", cRandomGenerator_initialize, 2 );
  rb_define_method( cRandomGenerator, "get_one", cRandomGenerator_get_one, 0 );
  rb_define_method( cRandomGenerator, "get", cRandomGenerator_get, 1 );
}





