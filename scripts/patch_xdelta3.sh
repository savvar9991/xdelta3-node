#!/bin/sh

sed 's/^static_assert/\/\/ static_assert/g' xdelta/xdelta3/xdelta3.h >  xdelta/xdelta3/xdelta3.h.new
mv xdelta/xdelta3/xdelta3.h.new xdelta/xdelta3/xdelta3.h
