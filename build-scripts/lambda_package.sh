#!/usr/bin/env bash

# Arguments:
#   1: src directory
#   2: output directory
#   3: output zip name
# Install dependencies
yarn install --prod

SRC_DIR=$1
OUTPUT_DIR=$2
OUTPUT_NAME=$3

# Configure the directories and target names
mkdir -p ${OUTPUT_DIR}
export PACKAGE=$PWD/$OUTPUT_DIR/$OUTPUT_NAME.zip


# Add source files
pushd "$SRC_DIR"
zip -r9 "$PACKAGE" .
popd

# Add node_modules
zip -r9 "$PACKAGE" node_modules

