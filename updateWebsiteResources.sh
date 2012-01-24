#!/bin/bash

git submodule init
git submodule update

cd source
./build.sh

echo "Done";
