#!/usr/bin/env bash

privateId=359f0fe420b1ec975ddbe1b1
timestamp=$(date +"%H%M%S")
filename=submission$timestamp.zip

cd manual-solutions
zip -r ../$filename *
cd ..

curl -F "private_id=$privateId" -F "file=@$filename" https://monadic-lab.org/submit