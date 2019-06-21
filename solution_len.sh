#!/usr/bin/env bash

find solutions -name \*.sol | xargs stat -f%z | awk '{ sum += $1; } END { print sum; }'
