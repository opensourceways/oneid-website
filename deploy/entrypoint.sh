#!/bin/bash

export FLOATING_IP=$(hostname -I | awk '{print $1}')

bash /etc/nginx/monitor.sh $DET_URL $DST_PATH &
/usr/share/nginx/sbin/nginx -g 'daemon off;'