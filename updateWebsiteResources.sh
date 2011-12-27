#!/bin/bash

php=`which php`

git submodule init
git submodule update

$php source/pushRulesetFilesToWebsite.php

echo "Done";
