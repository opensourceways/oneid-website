FROM node:18.20.1 as Builder

RUN mkdir -p /home/mindspore-usercenter/web
WORKDIR /home/mindspore-usercenter/web
COPY . /home/mindspore-usercenter/web

ARG ENV_FLAG
ENV MY_ENV_VARIABLE ${ENV_FLAG}

RUN npm install pnpm -g
RUN pnpm install
RUN if [ "$MY_ENV_VARIABLE" != "test" ]; then echo "in build mindspore"; pnpm build:mindspore; else echo "in test mindspore"; pnpm test:mindspore; fi

FROM swr.cn-north-4.myhuaweicloud.com/opensourceway/openeuler/nginx:1.24.0-22.03-lts-sp1 as NginxBuilder

FROM openeuler/openeuler:22.03-lts-sp1

ARG ENV_FLAG
ENV MY_ENV_VARIABLE ${ENV_FLAG} 

ENV NGINX_CONFIG_FILE /etc/nginx/nginx.conf
ENV NGINX_CONFIG_PATH /etc/nginx/
ENV NGINX_PID /var/run/nginx.pid
ENV NGINX_USER nginx
ENV NGINX_GROUP nginx
ENV NGINX_BIN /usr/share/nginx/sbin/
ENV NGINX_HOME /usr/share/nginx/
ENV NGINX_EXE_FILE /usr/share/nginx/sbin/nginx
ENV DST_PATH /etc/nginx/cert

COPY --from=NginxBuilder /usr/share/nginx /usr/share/nginx
COPY --from=NginxBuilder /usr/share/nginx/sbin/nginx /usr/share/nginx/sbin/nginx
COPY --from=NginxBuilder /etc/nginx/modules /etc/nginx/modules
COPY --from=NginxBuilder /etc/nginx/geoip  /etc/nginx/geoip
COPY --from=NginxBuilder /etc/nginx/mime.types  /etc/nginx/mime.types
RUN mkdir /etc/nginx/confd
COPY --from=Builder /home/mindspore-usercenter/web/dist/mindspore /usr/share/nginx/www/

RUN sed -i "s|repo.openeuler.org|mirrors.nju.edu.cn/openeuler|g" /etc/yum.repos.d/openEuler.repo \
    && sed -i '/metalink/d' /etc/yum.repos.d/openEuler.repo \
    && sed -i '/metadata_expire/d' /etc/yum.repos.d/openEuler.repo \
    && yum update -y \
    && yum install -y findutils passwd shadow \
    && find /usr/share/nginx/www -type d -print0| xargs -0 chmod 500 \
    && find /usr/share/nginx/www -type f -print0| xargs -0 chmod 400

COPY ./deploy/mindspore/nginx.conf /etc/nginx/nginx.conf
COPY ./deploy/mindspore/nginx-pro.conf /etc/nginx/nginx-pro.conf
COPY ./deploy/mindspore/nginx-test.conf /etc/nginx/nginx-test.conf

RUN if [ "$MY_ENV_VARIABLE" != "test" ]; then \
      mv /etc/nginx/nginx-pro.conf /etc/nginx/confd/; \ 
      echo "in production nginx"; \
    else \
      mv /etc/nginx/nginx-test.conf /etc/nginx/confd/; \
      echo "in test nginx"; \
    fi

RUN touch /var/run/nginx.pid \
    && groupadd -g 1000 nginx \
    && useradd -u 1000 -g nginx -s /sbin/nologin nginx \
    && chown -R nginx:nginx /usr/share/nginx \
    && find /usr/share/nginx -type d -print0 | xargs -0 chmod 500 \
    && chmod 500 /usr/share/nginx/sbin/nginx \
    && mkdir -p /var/log/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chmod -R 640 /var/log/nginx \
    && mkdir -p /var/lib/nginx/tmp/client_body \
    && chown -R nginx:nginx /var/lib/nginx/tmp/client_body \
    && mkdir -p /var/lib/nginx/tmp/fastcgi \
    && chown -R nginx:nginx /var/lib/nginx/tmp/fastcgi \
    && mkdir -p /var/lib/nginx/tmp/proxy \
    && chown -R nginx:nginx /var/lib/nginx/tmp/proxy \
    && mkdir -p /var/lib/nginx/tmp/scgi \
    && chown -R nginx:nginx /var/lib/nginx/tmp/scgi \
    && mkdir -p /var/lib/nginx/tmp/uwsgi \
    && chown -R nginx:nginx /var/lib/nginx/tmp/uwsgi \
    && chmod -R 500 /var/lib/nginx/ \
    && chmod -R 750 /var/lib/nginx/tmp/proxy \
    && chown -R nginx:nginx /var/lib/nginx/ \
    && chown -R nginx:nginx /var/run/nginx.pid \
    && chmod 640 /var/run/nginx.pid \
    && chown -R nginx:nginx /etc/nginx \
    && chmod 550 /etc/nginx \
    && chmod 550 /etc/nginx/geoip/ \
    && chmod 440 /etc/nginx/geoip/* \
    && chmod 550 /etc/nginx/modules \
    && chmod 440 /etc/nginx/modules/* \
    && chmod 440 /etc/nginx/nginx.conf \
    && chmod 440 /etc/nginx/mime.types \
    && chmod 550 /etc/nginx/confd \
    && chmod 440 /etc/nginx/confd/* \
    && rm -rf /usr/share/nginx/html/ \
    && rm -rf /usr/share/nginx/logs/ \
    && echo "umask 0027" >> /etc/bashrc \
    && echo "set +o history" >> /etc/bashrc \
    && sed -i "s|HISTSIZE=1000|HISTSIZE=0|" /etc/profile \
    && sed -i "s/PASS_MAX_DAYS.*/PASS_MAX_DAYS 30/" /etc/login.defs \
    && echo "ALWAYS_SET_PATH yes" >> /etc/login.defs \
    && passwd -l $NGINX_USER \
    && yum clean all \
    && usermod -s /sbin/nologin sync \
    && usermod -s /sbin/nologin shutdown \
    && usermod -s /sbin/nologin halt \
    && echo "export TMOUT=1800 readonly TMOUT" >> /etc/profile \
    && rm -rf /usr/bin/gdb* \
    && rm -rf /usr/share/gdb \
    && rm -rf /usr/share/gcc-10.3.1 \
    && rm -f /usr/lib64/python3.9/pdb.py \
    && yum remove gdb-gdbserver findutils passwd shadow -y \
    && ls /etc/nginx/confd/

COPY ./deploy/monitor.sh ./deploy/entrypoint.sh /etc/nginx/
RUN chmod 500 /etc/nginx/monitor.sh \
    && chmod 500 /etc/nginx/entrypoint.sh \
    && chown nginx:nginx /etc/nginx/monitor.sh \
    && chown nginx:nginx /etc/nginx/entrypoint.sh \
    && sed -i "/PATH=/d" /home/nginx/.bashrc \
    && source /home/nginx/.bashrc

EXPOSE 8080

USER nginx

ENTRYPOINT ["/etc/nginx/entrypoint.sh"]