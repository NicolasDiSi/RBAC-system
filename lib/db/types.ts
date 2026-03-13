import { type ExtractTablesWithRelations, type DBQueryConfig, type BuildQueryResult } from 'drizzle-orm';
import * as schema from './schema';
/**
 * All tables that support relations, extracted from the schema.
 */
export type TablesWithRelations = ExtractTablesWithRelations<typeof schema>;

/**
 * Provides typing information/configuration for querying a given table in the schema.
 * 
 * @template T - Table name (key of TablesWithRelations)
 */
export type TableProps<T extends keyof TablesWithRelations> = DBQueryConfig<'one' | 'many', boolean, TablesWithRelations, TablesWithRelations[T]>

/**
 * 
 * Builds a query result type by inferring selected columns and relations.
 * Used to type-safe database queries based on provided config.
 * @template TableName - The name of the table from TablesWithRelations.
 * @template Columns - Optional list of selected columns; defaults to all.
 * @template With - Optional relations to include; defaults to none.
 *
 * @example
 * 
 * type User = InferTableQuery<'users'>
 *
 * type UserMinimal = InferTableQuery<'users', { id: true; email: true }, { profile: true }>
 */
export type InferTableQuery<
    TableName extends keyof TablesWithRelations,
    Columns extends DBQueryConfig<'one' | 'many', boolean, TablesWithRelations, TablesWithRelations[TableName]>['columns'] | undefined = undefined,
    With extends DBQueryConfig<'one' | 'many', boolean, TablesWithRelations, TablesWithRelations[TableName]>['with'] | undefined = undefined,
> = BuildQueryResult<TablesWithRelations, TablesWithRelations[TableName], { columns: Columns; with: With }>;

