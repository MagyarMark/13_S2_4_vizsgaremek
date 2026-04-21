# ---- deps szakasz: csak a production függőségek telepítése ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- runner szakasz: minimális production image ----
FROM node:20-alpine AS runner
WORKDIR /app

# nem root felhasználó biztonsági okokból
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

# production függőségek és forráskód másolása
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# feltöltési mappa létrehozása és tulajdonos beállítása
RUN mkdir -p files && chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3000

ENV NODE_ENV=production

# npm start futtatja a prestart scriptet (database.json generálás), majd elindítja a szervert
CMD ["npm", "start"]
