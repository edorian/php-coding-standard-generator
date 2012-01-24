#!/bin/bash

sed -e "/{phpmd}/r phpmd.html" -e "/{phpmd}/d" index.html.template > ../website/index.html
