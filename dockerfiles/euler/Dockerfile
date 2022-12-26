FROM gplane/pnpm as Builder

RUN mkdir -p /home/openeuler-usercenter/web
WORKDIR /home/openeuler-usercenter/web
COPY . /home/openeuler-usercenter/web

RUN pnpm install

RUN pnpm build:euler

FROM swr.cn-north-4.myhuaweicloud.com/opensourceway/openeuler/nginx:1.22.0-22.03-lts

# COPY ./deploy/test-login.html /usr/share/nginx/html/test-login.html

COPY --from=Builder /home/openeuler-usercenter/web/dist/ /usr/share/nginx/html/
RUN chmod -R 755 /usr/share/nginx/html
COPY ./deploy/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./deploy/nginx/default.conf /etc/nginx/conf.d/default.conf


ENV RUN_USER nginx
ENV RUN_GROUP nginx
EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]

