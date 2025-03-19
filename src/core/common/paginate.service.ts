import { ObjectLiteral, Repository } from 'typeorm';
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

// export type PaginateOptions = {
//   page?: number | string;
//   perPage?: number | string;
// };

export type PaginateFunction = <T, K>(
  model: any,
  args?: K,
  options?: PaginateOptions,
) => Promise<PaginatedResult<T>>;


interface PaginateOptions {
  page: number;
  limit: number;
  where?: object;
  orderBy?: object;
}

export const paginate = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  { page, limit, where = {}, orderBy = {} }: PaginateOptions
): Promise<PaginatedResult<T>> => {
  // Calculate skip value
  const skip = (page - 1) * limit;

  // Count total number of records
  const [data, total] = await repository.findAndCount({
    where,
    skip,
    take: limit,
    order: orderBy,
  });

  // Calculate last page
  const lastPage = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage: page,
      perPage: limit,
      prev: page > 1 ? page - 1 : null,
      next: page < lastPage ? page + 1 : null,
    },
  };
};
