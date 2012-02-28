#!/bin/bash

FILES=./phpcs/*

OUTPUT=phpcs.html

if [ -f $OUTPUT ]; 
then
    rm $OUTPUT
fi

touch $OUTPUT

for file in $FILES
do
    filename=`basename $file`
    xsltproc --stringparam file $filename --stringparam tool phpcs ruleset.xslt $file >> $OUTPUT
done

sed 's/\.xml\//./g' $OUTPUT > temp

mv temp $OUTPUT

