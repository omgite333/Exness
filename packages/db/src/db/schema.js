"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.existingTrades = exports.users = exports.orderTypeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.orderTypeEnum = (0, pg_core_1.pgEnum)('order_type', ['buy', 'sell']);
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    balance: (0, pg_core_1.integer)("balance").notNull(),
    decimal: (0, pg_core_1.integer)("decimal").notNull().default(4),
    lastLoggedIn: (0, pg_core_1.timestamp)("last_logged_in", { withTimezone: false }),
});
exports.existingTrades = (0, pg_core_1.pgTable)('existing_trades', {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    openPrice: (0, pg_core_1.integer)("open_price").notNull(),
    leverage: (0, pg_core_1.integer)("leverage").notNull(),
    asset: (0, pg_core_1.varchar)("asset", { length: 255 }).notNull(),
    margin: (0, pg_core_1.integer)("margin").notNull(),
    quantity: (0, pg_core_1.doublePrecision)("quantity").notNull(),
    type: (0, exports.orderTypeEnum)("type").notNull(),
    closePrice: (0, pg_core_1.integer)("close_price").notNull(),
    pnl: (0, pg_core_1.integer)("pnl").notNull(),
    decimal: (0, pg_core_1.integer)("decimal").notNull(),
    liquidated: (0, pg_core_1.boolean)("liquidated").notNull(),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: false })
        .notNull()
        .defaultNow(),
}, (table) => {
    return {
        userIdCreatedAtIndex: (0, pg_core_1.index)("user_id_created_at_idx").on(table.userId, table.createdAt),
    };
});
