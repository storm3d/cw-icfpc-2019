#!/usr/bin/env bash

privateID=359f0fe420b1ec975ddbe1b1
timestamp=$(date +"%H%M%S")
filename=submission$timestamp.zip

cd $1
zip $filename *

curl -F "private_id=$privateID" -F "file=@$1/$filename" https://monadic-lab.org/submit