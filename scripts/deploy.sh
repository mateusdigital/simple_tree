#!/usr/bin/env bash
##~---------------------------------------------------------------------------##
##                               *       +                                    ##
##                         '                  |                               ##
##                     ()    .-.,="``"=.    - o -                             ##
##                           '=/_       \     |                               ##
##                        *   |  '=._    |                                    ##
##                             \     `=./`,        '                          ##
##                          .   '=.__.=' `='      *                           ##
##                 +                         +                                ##
##                      O      *        '       .                             ##
##                                                                            ##
##  File      : deploy.sh                                                     ##
##  Project   : simple_tree                                                   ##
##  Date      : 2023-08-09                                                    ##
##  License   : GPLv3                                                         ##
##  Author    : mateus.digital <hello@mateus.digital>                         ##
##  Copyright : mateus.digital - 2023                                         ##
##                                                                            ##
##  Description :                                                             ##
##   Deploys the output of scripts/build-static.sh to the remote server.      ##
##   Current user should have remote ssh keys installed on the server.        ##
##---------------------------------------------------------------------------~##

set -e; ## break on errors


##
##  Directories
##

##------------------------------------------------------------------------------
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)";
readonly ROOT_DIR="$(dirname "$SCRIPT_DIR")";

readonly SOURCE_FOLDER="${ROOT_DIR}/out";
readonly REMOTE_SERVER="mateus@mateus.digital";
readonly REMOTE_FOLDER="/var/www/mateus.digital/html/simple_tree";

rsync -avz                                       \
      "${SOURCE_FOLDER}/"                        \
      -e ssh "${REMOTE_SERVER}:${REMOTE_FOLDER}" \
    ;