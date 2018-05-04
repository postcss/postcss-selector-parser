#!/bin/bash
if [[ $INTEGRATION == "false" ]]; then
  exit 0;
fi
git submodule update --init --recursive
npm link
cd integration/stylelint
npm link postcss-selector-parser
npm install
NODE_VERSION=`node -e "console.log(process.version.replace(/v(\d).*/,function(m){return m[1]}))"`
CI="tests $NODE_VERSION"
npm run jest -- --maxWorkers=2 --testPathIgnorePatterns lib/__tests__/standalone-cache.test.js || exit $?
