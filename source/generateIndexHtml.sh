#!/bin/bash

sed -e "/{phpmd}/r phpmd.html" -e "/{phpmd}/d" -e "/{phpcs}/r phpcs.html" -e "/{phpcs}/d" index.html.template > ../website/index.html
