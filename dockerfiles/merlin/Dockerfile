FROM gplane/pnpm as Builder

RUN mkdir -p /home/modelfoundry-usercenter/web
WORKDIR /home/modelfoundry-usercenter/web
COPY . /home/modelfoundry-usercenter/web

RUN pnpm install

RUN pnpm build:merlin

FROM swr.cn-north-4.myhuaweicloud.com/opensourceway/openeuler/nginx:1.24.0-22.03-lts-sp1 as NginxBuilder

COPY --from=Builder /home/modelfoundry-usercenter/web/dist/merlin /usr/share/nginx/html/
RUN chmod -R 755 /usr/share/nginx/html
COPY ./deploy/merlin/nginx.conf /etc/nginx/nginx.conf


ENV RUN_USER nginx
ENV RUN_GROUP nginx
RUN touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/log/nginx \ 
    && chown -R nginx:nginx /var/run/nginx.pid \ 
    && chown -R nginx:nginx /etc/nginx
EXPOSE 8080
USER nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]

