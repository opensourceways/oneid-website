#!/bin/bash

FLOATING_IP=$(hostname -I | awk '{print $1}')

cat <<EOL > /etc/nginx/nginx.conf

bash /etc/nginx/monitor.sh $DET_URL $DST_PATH &
/usr/share/nginx/sbin/nginx -g 'daemon off;'