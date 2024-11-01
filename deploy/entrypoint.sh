#!/bin/bash

export FLOATING_IP=$(ifconfig | grep 'inet' | awk '{print $2}' | head -n 1)
sed -i "s|\$FLOATING_IP|${FLOATING_IP}|g" /etc/nginx/nginx.conf

bash /etc/nginx/monitor.sh $DET_URL $DST_PATH &
/usr/share/nginx/sbin/nginx -g 'daemon off;'