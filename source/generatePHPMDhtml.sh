#!/bin/bash

FILES=../externals/phpmd/src/main/resources/rulesets/*

OUTPUT=phpmd.html

if [ -f $OUTPUT ]; 
then
    rm $OUTPUT
fi

touch $OUTPUT

for file in $FILES
do
    filename=`basename $file`
    xsltproc --stringparam file $filename --stringparam tool phpmd ruleset.xslt $file >> $OUTPUT
done

