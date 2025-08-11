ARG NPM_REGISTRY=https://registry.npmmirror.com

FROM node:22.10.0-alpine

ARG NPM_REGISTRY

WORKDIR /app

COPY . ./

RUN ls -l

RUN npm config set registry $NPM_REGISTRY

RUN echo "当前镜像仓库=$NPM_REGISTRY"

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm build

CMD pnpm start
