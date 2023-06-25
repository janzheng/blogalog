# To use node, switch to adapter-node in svelte.config.js
# This dockerfile must be built with the monorepo root directory as cwd
# meant for fly.io deployment
FROM node:lts-alpine

# RUN npm i -g pnpm@latest
RUN apk add --no-cache git


# all files needed for the build
COPY package.json .
COPY yarn.lock .
COPY jsconfig.json .
COPY svelte.config.js .
COPY markdoc.config.js .
COPY postcss.config.cjs .
COPY tailwind.config.cjs .
COPY svelte.config.js .
COPY vite.config.js .


# all folders needed for the build
COPY src src/
COPY static static/

RUN yarn install
RUN yarn build
# RUN yarn start

EXPOSE 3000

CMD ["node", "build"]
