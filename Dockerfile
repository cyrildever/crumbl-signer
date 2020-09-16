FROM node:lts

EXPOSE 4000

RUN useradd signer --home /home/signer
WORKDIR /home/signer
RUN chown -R signer /home/signer
USER signer

COPY . .
RUN npm i

CMD ["npm", "start"]