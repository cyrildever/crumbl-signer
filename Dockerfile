FROM node:lts

EXPOSE 4000

RUN useradd crumbl-signer --home /home/crumbl-signer
WORKDIR /home/crumbl-signer
RUN chown -R crumbl-signer /home/crumbl-signer
USER crumbl-signer

COPY . .
RUN npm i

CMD ["npm", "start"]