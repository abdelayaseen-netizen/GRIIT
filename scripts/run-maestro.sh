#!/bin/sh
# Every Maestro invocation goes through this script so Java is found.
export JAVA_HOME=/opt/homebrew/opt/openjdk
export PATH="$JAVA_HOME/bin:$PATH"
exec maestro "$@"
