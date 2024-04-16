import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

export interface PaginatedResponse<T> {
  from: number;
  to: number;
  total: number;
  totalPages: number;
  data: T[];
}

export const paginationResponse = <T>(
  page: number,
  itemsPerPage: number,
  totalCount: number,
  data: T[],
): PaginatedResponse<T> => {
  const offset = (page - 1) * itemsPerPage;
  let from = 0;
  let to = 0;
  if (totalCount > 0) {
    from = offset + 1;
    if (offset + itemsPerPage > totalCount) {
      to = totalCount;
    } else {
      to = offset + itemsPerPage;
    }
  }
  return {
    from: from,
    to: to,
    total: totalCount,
    totalPages: Math.ceil(totalCount / itemsPerPage),
    data,
  };
};

export interface CommonResponse<T> {
  message: string;
  data?: PaginatedResponse<T>;
}

export interface CustomUserResponseType {
  id: number;
}
