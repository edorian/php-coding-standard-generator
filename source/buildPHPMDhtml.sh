#!/bin/bash

FILES=../externals/phpmd/src/main/resources/rulesets/*
for file in $FILES
do
    filename=`basename $file`
    xsltproc --stringparam file $filename --stringparam tool phpmd ruleset.xslt $file >> phpmd.html
done

