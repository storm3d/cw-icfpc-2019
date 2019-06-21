#!/usr/bin/env bash
cd manual-solutions
zip -r ../solutions.zip *
cd ..
curl -F "private_id=359f0fe420b1ec975ddbe1b1" -F "file=@solutions.zip" https://monadic-lab.org/submit