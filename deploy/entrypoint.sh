#!/bin/bash

# export FLOATING_IP=$(ifconfig | grep 'inet' | awk '{print $2}' | head -n 1)

bash /etc/nginx/monitor.sh $DET_URL $DST_PATH &
/usr/share/nginx/sbin/nginx -g 'daemon off;'