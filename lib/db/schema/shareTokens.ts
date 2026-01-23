
import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    index,
  } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './rbac';
  
export const shareTokens = pgTable(
'share_tokens',
{
    id: uuid('id').defaultRandom().primaryKey(),
    token: varchar('token', { length: 255 }).unique().notNull(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    regionRestriction: text('region_restriction'),
    timezoneRestriction: text('timezone_restriction'),
    isUsed: boolean('is_used').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
},
(table) => {
    return {
    tokenIndex: index('idx_share_tokens_token').on(table.token),
    userIdIndex: index('idx_share_tokens_user_id').on(table.userId),
    };
},
);

export const shareTokensRelations = relations(shareTokens, ({ one }) => ({
    user: one(users, {
        fields: [shareTokens.userId],
        references: [users.id],
    }),
}));
