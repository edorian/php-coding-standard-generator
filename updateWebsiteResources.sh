#!/bin/bash

git submodule init
git submodule update

ln -s ../../../phpcs-phpunit/PHPUnitStandard/ externals/phpcs/CodeSniffer/Standards/

cd source
./build.sh

echo "Done";
