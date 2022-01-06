FROM node:lts

EXPOSE 4000

RUN useradd crumbl-signer --home /home/crumbl-signer
WORKDIR /home/crumbl-signer
RUN chown -R crumbl-signer /home/crumbl-signer

COPY . .
RUN npm i
USER crumbl-signer

CMD ["npm", "start"]